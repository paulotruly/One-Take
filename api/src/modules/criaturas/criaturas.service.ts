// Criaturas invocadas pelo mestre num grupo. Cada um é uma "ficha" temporária da besta no nível escolhido.
// Some quando o mestre remove (fugiu, sumiu) ou sozinho quando morre (vida ou mana em 0, mesma regra das fichas).
import type { z } from "zod";
import type { Besta, Criatura } from "../../generated/prisma/client.js";
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { aplicarAprimoramentos, atributosNoNivel, habilidadesNoNivel } from "../../regras/progressao.js";
import { estaMorto } from "../../regras/status.js";
import { apresentarBesta, bestaCompleta, bestaEditavel } from "../bestas/bestas.service.js";
import type { editarCriaturaSchema, invocarSchema } from "../bestas/bestas.schemas.js";
import { grupoDoMestre } from "../grupos/grupos.service.js";

/** Resumo para a página do grupo: recursos atuais e máximos no nível. */
export function apresentarCriatura(c: Criatura & { besta: Pick<Besta, "titulo" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco" | "deslocamento"> }) {
  const max = atributosNoNivel(c.besta, c.nivel);
  return {
    id: c.id,
    bestaId: c.bestaId,
    nome: c.nome,
    nivel: c.nivel,
    besta: { titulo: c.besta.titulo, imagemUrl: c.besta.imagemUrl, deslocamento: c.besta.deslocamento },
    vida: { atual: Math.min(c.vidaAtual, max.pontosVida), max: max.pontosVida },
    mana: { atual: Math.min(c.manaAtual, max.pontosMana), max: max.pontosMana },
    esforco: { atual: Math.min(c.esforcoAtual, max.pontosEsforco), max: max.pontosEsforco },
  };
}

async function criaturaDoMestre(id: string, usuarioId: string) {
  const c = await getPrisma().criatura.findUnique({ where: { id }, include: { grupo: { select: { mestreId: true } }, besta: true } });
  if (!c || c.grupo.mestreId !== usuarioId) throw naoEncontrado("Criatura não encontrada");
  return c;
}

/** Invoca 1 ou mais criaturas iguais no grupo, com recursos cheios no nível escolhido. */
export async function invocar(grupoId: string, usuarioId: string, dados: z.infer<typeof invocarSchema>) {
  await grupoDoMestre(grupoId, usuarioId);
  const besta = await bestaEditavel(dados.bestaId, usuarioId);
  if (besta.grupoExclusivoId && besta.grupoExclusivoId !== grupoId) {
    throw requisicaoInvalida("Esta criatura é exclusivo de outro grupo.", [{ campo: "bestaId", mensagem: "Exclusivo de outro grupo" }]);
  }
  const prisma = getPrisma();
  const jaTem = await prisma.criatura.count({ where: { grupoId, bestaId: besta.id } });
  const max = atributosNoNivel(besta, dados.nivel);
  // Nomes numerados quando há mais de um do mesma criatura: "Lobo", "Lobo 2", "Lobo 3"...
  const nomes = Array.from({ length: dados.quantidade }, (_, i) => {
    const n = jaTem + i + 1;
    return n === 1 && dados.quantidade === 1 ? besta.titulo : `${besta.titulo} ${n}`.slice(0, 60);
  });
  await prisma.criatura.createMany({
    data: nomes.map((nome) => ({
      grupoId, bestaId: besta.id, nome, nivel: dados.nivel,
      vidaAtual: max.pontosVida, manaAtual: max.pontosMana, esforcoAtual: max.pontosEsforco,
    })),
  });
  return listarDoGrupo(grupoId);
}

export async function listarDoGrupo(grupoId: string) {
  const criaturas = await getPrisma().criatura.findMany({ where: { grupoId }, orderBy: { criadoEm: "asc" }, include: { besta: true } });
  return criaturas.map(apresentarCriatura);
}

/** Ficha completa da criatura: recursos, atributos, perícias com o teste montado e cartas do nível. */
export async function detalhar(id: string, usuarioId: string) {
  const c = await criaturaDoMestre(id, usuarioId);
  const besta = apresentarBesta((await getPrisma().besta.findUnique({ where: { id: c.bestaId }, include: bestaCompleta }))!);
  const { habilidades, ...resto } = besta;
  return {
    ...apresentarCriatura(c),
    grupoId: c.grupoId,
    descricao: resto.descricao,
    atributos: resto.atributos,
    pericias: resto.pericias,
    habilidades: habilidadesNoNivel(habilidades, c.nivel).map((h) => aplicarAprimoramentos(h, c.nivel)),
    proximasHabilidades: habilidades.filter((h) => h.nivelNecessario > c.nivel).length,
  };
}

/**
 * Mestre ajusta recursos ou nome. Atuais ficam entre 0 e o máximo.
 * Vida ou mana em 0 = a criatura morre e some do grupo (resposta `{ removida: true }`).
 */
export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarCriaturaSchema>) {
  const c = await criaturaDoMestre(id, usuarioId);
  const prisma = getPrisma();
  const max = atributosNoNivel(c.besta, c.nivel);
  const limitar = (v: number | undefined, m: number) => (v === undefined ? undefined : Math.min(Math.max(v, 0), m));
  const atuais = {
    vidaAtual: limitar(dados.vidaAtual, max.pontosVida),
    manaAtual: limitar(dados.manaAtual, max.pontosMana),
    esforcoAtual: limitar(dados.esforcoAtual, max.pontosEsforco),
  };

  if (estaMorto({ vidaAtual: atuais.vidaAtual ?? c.vidaAtual, manaAtual: atuais.manaAtual ?? c.manaAtual, esforcoAtual: 1 })) {
    await prisma.criatura.delete({ where: { id } });
    return { removida: true as const, motivo: "morreu" as const };
  }

  const atualizada = await prisma.criatura.update({
    where: { id },
    data: { nome: dados.nome, ...atuais },
    include: { besta: true },
  });
  return { removida: false as const, criatura: apresentarCriatura(atualizada) };
}

/** O mestre tira a criatura do grupo (fugiu, foi embora). */
export async function remover(id: string, usuarioId: string) {
  await criaturaDoMestre(id, usuarioId);
  await getPrisma().criatura.delete({ where: { id } });
}
