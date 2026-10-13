// Criaturas invocadas pelo mestre num grupo. Cada um é uma "ficha" temporária da besta no nível escolhido.
// Some quando o mestre remove (fugiu, sumiu) ou sozinho quando morre (vida ou mana em 0, mesma regra das fichas).
import type { z } from "zod";
import type { Besta, Criatura, Status } from "../../generated/prisma/client.js";
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { aplicarAprimoramentos, atributosNoNivel, habilidadesNoNivel } from "../../regras/progressao.js";
import { estaMorto } from "../../regras/status.js";
import { apresentarBesta, bestaCompleta, bestaLegivel } from "../bestas/bestas.service.js";
import type { editarCriaturaSchema, invocarSchema } from "../bestas/bestas.schemas.js";
import { statusDaFicha } from "../fichas/status-da-ficha.js";
import { grupoDoMestre } from "../grupos/grupos.service.js";
import { testeDaCarta } from "../pericias/soma.js";
import { statusAplicaveis, statusDisponiveis, validarAplicacao } from "../status/status.service.js";

type CriaturaComBesta = Criatura & {
  besta: Pick<Besta, "titulo" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco" | "deslocamento">;
  status?: { status: Status }[];
};

/** Resumo para a página do grupo: recursos atuais e máximos no nível, e status (com os ativados no grupo). */
export function apresentarCriatura(c: CriaturaComBesta, ativosNoGrupo: Status[] = []) {
  const max = atributosNoNivel(c.besta, c.nivel);
  const atuais = {
    vidaAtual: Math.min(c.vidaAtual, max.pontosVida),
    manaAtual: Math.min(c.manaAtual, max.pontosMana),
    esforcoAtual: Math.min(c.esforcoAtual, max.pontosEsforco),
  };
  return {
    id: c.id,
    bestaId: c.bestaId,
    nome: c.nome,
    nivel: c.nivel,
    besta: { titulo: c.besta.titulo, imagemUrl: c.besta.imagemUrl, deslocamento: c.besta.deslocamento },
    vida: { atual: Math.min(c.vidaAtual, max.pontosVida), max: max.pontosVida },
    mana: { atual: Math.min(c.manaAtual, max.pontosMana), max: max.pontosMana },
    esforco: { atual: Math.min(c.esforcoAtual, max.pontosEsforco), max: max.pontosEsforco },
    status: statusDaFicha(atuais, ativosNoGrupo, (c.status ?? []).map((s) => s.status)).map(({ id, nome, tipo, automatico }) => ({ id, nome, tipo, automatico })),
  };
}

async function criaturaDoMestre(id: string, usuarioId: string) {
  const c = await getPrisma().criatura.findUnique({ where: { id }, include: { grupo: { select: { mestreId: true } }, besta: true, status: { include: { status: true } } } });
  if (!c || c.grupo.mestreId !== usuarioId) throw naoEncontrado("Criatura não encontrada");
  return c;
}

/** Invoca 1 ou mais criaturas iguais no grupo, com recursos cheios no nível escolhido. */
export async function invocar(grupoId: string, usuarioId: string, dados: z.infer<typeof invocarSchema>) {
  await grupoDoMestre(grupoId, usuarioId);
  const besta = await bestaLegivel(dados.bestaId, usuarioId);
  const prisma = getPrisma();
  const existentes = await prisma.criatura.findMany({ where: { grupoId, bestaId: besta.id }, select: { nome: true } });
  const max = atributosNoNivel(besta, dados.nivel);
  const nomes = proximosNomes(besta.titulo, existentes.map((c) => c.nome), dados.quantidade);
  await prisma.criatura.createMany({
    data: nomes.map((nome) => ({
      grupoId, bestaId: besta.id, nome, nivel: dados.nivel,
      vidaAtual: max.pontosVida, manaAtual: max.pontosMana, esforcoAtual: max.pontosEsforco,
    })),
  });
  return listarDoGrupo(grupoId);
}

/**
 * Nomes numerados sem repetir: "Lobo", "Lobo 2", "Lobo 3"... Continua do maior número que existe no grupo
 * (um "Lobo" sem número conta como 1), então uma criatura que morreu não faz o próximo repetir nome.
 */
export function proximosNomes(titulo: string, existentes: string[], quantidade: number) {
  const numeros = existentes.map((nome) => {
    if (nome === titulo) return 1;
    const m = nome.startsWith(`${titulo} `) ? /^(\d+)$/.exec(nome.slice(titulo.length + 1)) : null;
    return m ? Number(m[1]) : 0;
  });
  const maior = Math.max(0, ...numeros);
  if (maior === 0 && quantidade === 1) return [titulo];
  return Array.from({ length: quantidade }, (_, i) => `${titulo} ${maior + i + 1}`.slice(0, 60));
}

export async function listarDoGrupo(grupoId: string) {
  const criaturas = await getPrisma().criatura.findMany({ where: { grupoId }, orderBy: { criadoEm: "asc" }, include: { besta: true, status: { include: { status: true } } } });
  const ativos = (await getPrisma().statusNoGrupo.findMany({ where: { grupoId }, include: { status: true } })).map((s) => s.status);
  return criaturas.map((c) => apresentarCriatura(c, ativos));
}

/** Ficha completa da criatura: recursos, atributos, perícias com o teste montado e cartas do nível. */
export async function detalhar(id: string, usuarioId: string) {
  const c = await criaturaDoMestre(id, usuarioId);
  const besta = apresentarBesta((await getPrisma().besta.findUnique({ where: { id: c.bestaId }, include: bestaCompleta }))!);
  const { habilidades, ...resto } = besta;
  const ativos = await statusDisponiveis(usuarioId, c.grupoId);
  const aplicados = c.status.map((s) => s.status);
  const max = atributosNoNivel(c.besta, c.nivel);
  const atuais = { vidaAtual: Math.min(c.vidaAtual, max.pontosVida), manaAtual: Math.min(c.manaAtual, max.pontosMana), esforcoAtual: Math.min(c.esforcoAtual, max.pontosEsforco) };
  return {
    ...apresentarCriatura(c, ativos),
    /** Status completos (com efeito) para a ficha da criatura. */
    statusDetalhado: statusDaFicha(atuais, ativos, aplicados),
    statusAplicaveis: statusAplicaveis(ativos, aplicados.map((s) => s.id)),
    grupoId: c.grupoId,
    descricao: resto.descricao,
    atributos: resto.atributos,
    pericias: resto.pericias,
    habilidades: habilidadesNoNivel(habilidades, c.nivel).map((h) => ({
      ...aplicarAprimoramentos(h, c.nivel),
      teste: testeDaCarta(
        h,
        new Map(resto.pericias.map((p) => [p.id, p.modificador])),
        new Map(resto.atributos.map((a) => [a.id, a.dados])),
        new Map(),
      ),
    })),
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
    include: { besta: true, status: { include: { status: true } } },
  });
  return { removida: false as const, criatura: apresentarCriatura(atualizada, await statusDisponiveis(usuarioId, c.grupoId)) };
}

/** O mestre tira a criatura do grupo (fugiu, foi embora). */
export async function remover(id: string, usuarioId: string) {
  await criaturaDoMestre(id, usuarioId);
  await getPrisma().criatura.delete({ where: { id } });
}

// ---------- Status (o mestre aplica e tira; valem os ativados no grupo) ----------

export async function aplicarStatus(id: string, usuarioId: string, statusId: string) {
  const c = await criaturaDoMestre(id, usuarioId);
  await validarAplicacao(statusId, usuarioId, await statusDisponiveis(usuarioId, c.grupoId));
  await getPrisma().criaturaStatus.upsert({ where: { criaturaId_statusId: { criaturaId: id, statusId } }, create: { criaturaId: id, statusId }, update: {} });
  return detalhar(id, usuarioId);
}

export async function removerStatus(id: string, usuarioId: string, statusId: string) {
  await criaturaDoMestre(id, usuarioId);
  await getPrisma().criaturaStatus.deleteMany({ where: { criaturaId: id, statusId } });
  return detalhar(id, usuarioId);
}
