// Itens de um grupo e inventário das fichas.
// Mestre: cria, lança do catálogo, edita, exclui e move qualquer item. Jogador: passa o próprio item para outra
// ficha do grupo, descarta (fica vago no grupo), pega um item vago e usa os itens do seu inventário.
// Sempre respeitando os espaços do inventário (cada item ocupa `espacos`).
import type { z } from "zod";
import { AppError, naoEncontrado, proibido, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { capacidadeInventario, espacosUsados, motivoParaNaoUsar } from "../../regras/ficha.js";
import { grupoDoMestre } from "../grupos/grupos.service.js";
import { apresentarItem, comRequisitos, validarRequisitos } from "./itens.apresentar.js";
import type { criarItemSchema, editarItemSchema, lancarSchema } from "./itens.schemas.js";

/** A ficha precisa ser do grupo e ter espaço livre para `espacos` (ignorando o próprio item, se já estiver nela). */
async function garantirEspaco(fichaId: string, grupoId: string, espacos: number, excetoItemId?: string) {
  const prisma = getPrisma();
  const ficha = await prisma.ficha.findUnique({ where: { id: fichaId }, select: { grupoId: true, nivel: true } });
  if (!ficha || ficha.grupoId !== grupoId) throw naoEncontrado("Ficha de destino não encontrada neste grupo");
  const itens = await prisma.item.findMany({ where: { fichaId, NOT: excetoItemId ? { id: excetoItemId } : undefined }, select: { espacos: true } });
  const capacidade = capacidadeInventario(ficha.nivel);
  const livres = capacidade - espacosUsados(itens);
  if (espacos > livres) {
    throw new AppError(409, "INVENTARIO_CHEIO", `Não cabe: o item ocupa ${espacos} ${espacos === 1 ? "espaço" : "espaços"} e o inventário tem ${Math.max(0, livres)} livre(s).`);
  }
}

export async function criar(grupoId: string, usuarioId: string, dados: z.infer<typeof criarItemSchema>) {
  await grupoDoMestre(grupoId, usuarioId);
  await validarRequisitos(dados, usuarioId);
  const { fichaId, ...campos } = dados;
  if (fichaId) await garantirEspaco(fichaId, grupoId, campos.espacos);
  const item = await getPrisma().item.create({
    data: { ...campos, grupoId, fichaId: fichaId ?? null, usosRestantes: campos.usosMaximos },
    include: comRequisitos,
  });
  return apresentarItem(item);
}

/** Lança um item do catálogo no grupo (vago ou direto numa ficha), quantas vezes pedir. */
export async function lancar(modeloId: string, usuarioId: string, dados: z.infer<typeof lancarSchema>) {
  const prisma = getPrisma();
  const modelo = await prisma.itemModelo.findUnique({ where: { id: modeloId } });
  if (!modelo || modelo.donoId !== usuarioId) throw naoEncontrado("Item não encontrado no catálogo");
  await grupoDoMestre(dados.grupoId, usuarioId);
  if (modelo.grupoExclusivoId && modelo.grupoExclusivoId !== dados.grupoId) {
    throw requisicaoInvalida("Este item é exclusivo de outro grupo.");
  }
  if (dados.fichaId) await garantirEspaco(dados.fichaId, dados.grupoId, modelo.espacos * dados.quantidade);
  const { id: _id, donoId: _d, grupoExclusivoId: _g, criadoEm: _c, atualizadoEm: _a, ...campos } = modelo;
  await prisma.item.createMany({
    data: Array.from({ length: dados.quantidade }, () => ({
      ...campos, modeloId, grupoId: dados.grupoId, fichaId: dados.fichaId ?? null, usosRestantes: campos.usosMaximos,
    })),
  });
  return { lancados: dados.quantidade };
}

async function itemComGrupo(id: string) {
  const item = await getPrisma().item.findUnique({
    where: { id },
    include: { grupo: { select: { mestreId: true } }, ficha: { select: { jogadorId: true, classeId: true } }, ...comRequisitos },
  });
  if (!item) throw naoEncontrado("Item não encontrado");
  return item;
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarItemSchema>) {
  const item = await itemComGrupo(id);
  if (item.grupo.mestreId !== usuarioId) throw naoEncontrado("Item não encontrado");
  await validarRequisitos(dados, usuarioId);
  if (dados.espacos !== undefined && item.fichaId && dados.espacos > item.espacos) {
    await garantirEspaco(item.fichaId, item.grupoId, dados.espacos, id);
  }
  // Usos: mudar o máximo ajusta o que resta (sem passar do novo máximo); o mestre também pode repor direto.
  let usosRestantes = dados.usosRestantes;
  if (dados.usosMaximos !== undefined && usosRestantes === undefined) {
    usosRestantes = dados.usosMaximos === null ? null : Math.min(item.usosRestantes ?? dados.usosMaximos, dados.usosMaximos);
  }
  const maximo = dados.usosMaximos !== undefined ? dados.usosMaximos : item.usosMaximos;
  if (usosRestantes !== undefined && usosRestantes !== null && (maximo === null || usosRestantes > maximo)) {
    throw requisicaoInvalida("Os usos restantes não podem passar do máximo.", [{ campo: "usosRestantes", mensagem: "Acima do máximo" }]);
  }
  const atualizado = await getPrisma().item.update({ where: { id }, data: { ...dados, usosRestantes }, include: comRequisitos });
  return apresentarItem(atualizado);
}

export async function excluir(id: string, usuarioId: string) {
  const item = await itemComGrupo(id);
  if (item.grupo.mestreId !== usuarioId) throw naoEncontrado("Item não encontrado");
  await getPrisma().item.delete({ where: { id } });
}

/** fichaId = destino; null = descartar (vago no grupo). */
export async function mover(id: string, usuarioId: string, fichaId: string | null) {
  const item = await itemComGrupo(id);
  const souMestre = item.grupo.mestreId === usuarioId;
  if (!souMestre) {
    const prisma = getPrisma();
    const minhaFicha = await prisma.ficha.findUnique({
      where: { grupoId_jogadorId: { grupoId: item.grupoId, jogadorId: usuarioId } },
      select: { id: true },
    });
    if (!minhaFicha) throw naoEncontrado("Item não encontrado");
    const ehMeu = item.fichaId === minhaFicha.id;
    const estaVago = item.fichaId === null;
    // Meu item: passo para outra ficha do grupo ou descarto. Item vago: só posso pegar para mim.
    if (!ehMeu && !(estaVago && fichaId === minhaFicha.id)) throw proibido("Você só pode mover itens do seu inventário ou pegar itens vagos.");
  }
  if (fichaId === item.fichaId) return apresentarItem(item);
  if (fichaId) await garantirEspaco(fichaId, item.grupoId, item.espacos);
  return apresentarItem(await getPrisma().item.update({ where: { id }, data: { fichaId }, include: comRequisitos }));
}

/**
 * Usar um item do inventário (dono da ficha ou mestre). O efeito é aplicado pela mesa; o app só conta os usos.
 * Item com usos limitados perde 1 uso e, ao chegar a 0, é consumido (apagado).
 * O jogador precisa saber usar (pré-requisito de classe/perícia); o mestre pode usar por ele mesmo assim.
 */
export async function usar(id: string, usuarioId: string) {
  const item = await itemComGrupo(id);
  if (!item.fichaId || !item.ficha) throw requisicaoInvalida("Este item está vago no grupo: pegue-o antes de usar.");
  const souMestre = item.grupo.mestreId === usuarioId;
  if (!souMestre && item.ficha.jogadorId !== usuarioId) throw naoEncontrado("Item não encontrado");

  if (!souMestre) {
    const pericias = await periciasComPontos(item.fichaId);
    const motivo = motivoParaNaoUsar(item, { classeId: item.ficha.classeId, pericias });
    if (motivo) throw new AppError(403, "NAO_SABE_USAR", motivo);
  }

  const prisma = getPrisma();
  if (item.usosRestantes === null) return { consumido: false, item: apresentarItem(item) };
  if (item.usosRestantes <= 1) {
    await prisma.item.delete({ where: { id } });
    return { consumido: true, item: null };
  }
  const atualizado = await prisma.item.update({ where: { id }, data: { usosRestantes: { decrement: 1 } }, include: comRequisitos });
  return { consumido: false, item: apresentarItem(atualizado) };
}

/**
 * Perícias (ids do catálogo do mestre) em que a ficha tem total > 0, somando raça, classe e níveis.
 * Perícias base de classes fixas contam como a cópia do catálogo do mestre (mesma origem).
 */
export async function periciasComPontos(fichaId: string) {
  const prisma = getPrisma();
  const f = await prisma.ficha.findUniqueOrThrow({
    where: { id: fichaId },
    include: {
      grupo: { select: { mestreId: true } },
      raca: { include: { pericias: { include: { pericia: true } } } },
      classe: { include: { pericias: { include: { pericia: true } } } },
      pericias: true,
    },
  });
  const copias = await prisma.pericia.findMany({ where: { donoId: f.grupo.mestreId, origemId: { not: null } }, select: { id: true, origemId: true } });
  const copiaDe = new Map(copias.map((c) => [c.origemId!, c.id]));
  const total = new Map<string, number>();
  const somar = (p: { id: string; donoId: string | null }, v: number) => {
    const chave = p.donoId === null ? (copiaDe.get(p.id) ?? p.id) : p.id;
    total.set(chave, (total.get(chave) ?? 0) + v);
  };
  f.raca.pericias.forEach((rp) => somar(rp.pericia, rp.pontos));
  f.classe.pericias.forEach((cp) => somar(cp.pericia, cp.modificador));
  f.pericias.forEach((fp) => total.set(fp.periciaId, (total.get(fp.periciaId) ?? 0) + fp.pontos));
  return new Set([...total].filter(([, v]) => v > 0).map(([k]) => k));
}
