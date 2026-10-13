// Itens e inventários (fichas e NPCs).
// Mestre: cria, lança do catálogo, edita, exclui e move qualquer item seu, inclusive de e para NPCs. Jogador: passa o próprio
// item para outra ficha do grupo, descarta (fica vago no grupo), pega um item vago e usa os itens do seu inventário.
// Sempre respeitando os espaços do inventário (cada item ocupa `espacos`).
import type { z } from "zod";
import { AppError, naoEncontrado, proibido, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { capacidadeInventario, espacosUsados, motivoParaNaoUsar } from "../../regras/ficha.js";
import { grupoDoMestre } from "../grupos/grupos.service.js";
import { npcDoMestre } from "../npcs/npcs.service.js";
import { copiasDoCatalogo, somarPericias } from "../pericias/soma.js";
import { apresentarItem, comRequisitos, validarRequisitos } from "./itens.apresentar.js";
import type { criarItemSchema, editarItemSchema, lancarSchema, moverItemSchema } from "./itens.schemas.js";

function cheio(espacos: number, livres: number) {
  return new AppError(409, "INVENTARIO_CHEIO", `Não cabe: ocupa ${espacos} ${espacos === 1 ? "espaço" : "espaços"} e o inventário tem ${Math.max(0, livres)} livre(s).`);
}

/** A ficha precisa ter espaço livre para `espacos` (ignorando o próprio item, se já estiver nela). Devolve a ficha. */
async function garantirEspacoFicha(fichaId: string, espacos: number, excetoItemId?: string) {
  const prisma = getPrisma();
  const ficha = await prisma.ficha.findUnique({ where: { id: fichaId }, select: { id: true, grupoId: true, nivel: true, grupo: { select: { mestreId: true } } } });
  if (!ficha) throw naoEncontrado("Ficha de destino não encontrada");
  const itens = await prisma.item.findMany({ where: { fichaId, NOT: excetoItemId ? { id: excetoItemId } : undefined }, select: { espacos: true } });
  const livres = capacidadeInventario(ficha.nivel) - espacosUsados(itens);
  if (espacos > livres) throw cheio(espacos, livres);
  return ficha;
}

/** O NPC precisa ter espaço livre (mesma regra de inventário das fichas, pelo nível dele). */
async function garantirEspacoNpc(npc: { id: string; nivel: number }, espacos: number, excetoItemId?: string) {
  const itens = await getPrisma().item.findMany({ where: { npcId: npc.id, NOT: excetoItemId ? { id: excetoItemId } : undefined }, select: { espacos: true } });
  const livres = capacidadeInventario(npc.nivel) - espacosUsados(itens);
  if (espacos > livres) throw cheio(espacos, livres);
}

export async function criar(grupoId: string, usuarioId: string, dados: z.infer<typeof criarItemSchema>) {
  await grupoDoMestre(grupoId, usuarioId);
  await validarRequisitos(dados, usuarioId);
  const { fichaId, ...campos } = dados;
  if (fichaId) {
    const ficha = await garantirEspacoFicha(fichaId, campos.espacos);
    if (ficha.grupoId !== grupoId) throw naoEncontrado("Ficha de destino não encontrada neste grupo");
  }
  const item = await getPrisma().item.create({
    data: { ...campos, grupoId, fichaId: fichaId ?? null, usosRestantes: campos.usosMaximos },
    include: comRequisitos,
  });
  return apresentarItem(item);
}

/** Lança um item do catálogo: vago num grupo, direto numa ficha, ou no inventário de um NPC. */
export async function lancar(modeloId: string, usuarioId: string, dados: z.infer<typeof lancarSchema>) {
  const prisma = getPrisma();
  const modelo = await prisma.itemModelo.findUnique({ where: { id: modeloId } });
  if (!modelo || modelo.donoId !== usuarioId) throw naoEncontrado("Item não encontrado no catálogo");
  const total = modelo.espacos * dados.quantidade;

  let destino: { grupoId: string | null; fichaId: string | null; npcId: string | null };
  if (dados.npcId) {
    const npc = await npcDoMestre(dados.npcId, usuarioId);
    if (modelo.grupoExclusivoId && modelo.grupoExclusivoId !== npc.grupoExclusivoId) {
      throw requisicaoInvalida("Este item é exclusivo de um grupo; só NPCs desse grupo podem recebê-lo.");
    }
    await garantirEspacoNpc(npc, total);
    destino = { grupoId: npc.grupoExclusivoId, fichaId: null, npcId: npc.id };
  } else {
    if (!dados.grupoId) throw requisicaoInvalida("Escolha o grupo ou o NPC que recebe o item.", [{ campo: "grupoId", mensagem: "Obrigatório" }]);
    await grupoDoMestre(dados.grupoId, usuarioId);
    if (modelo.grupoExclusivoId && modelo.grupoExclusivoId !== dados.grupoId) throw requisicaoInvalida("Este item é exclusivo de outro grupo.");
    if (dados.fichaId) {
      const ficha = await garantirEspacoFicha(dados.fichaId, total);
      if (ficha.grupoId !== dados.grupoId) throw naoEncontrado("Ficha de destino não encontrada neste grupo");
    }
    destino = { grupoId: dados.grupoId, fichaId: dados.fichaId ?? null, npcId: null };
  }

  const { id: _id, donoId: _d, grupoExclusivoId: _g, criadoEm: _c, atualizadoEm: _a, ...campos } = modelo;
  await prisma.item.createMany({
    data: Array.from({ length: dados.quantidade }, () => ({ ...campos, modeloId, ...destino, usosRestantes: campos.usosMaximos })),
  });
  return { lancados: dados.quantidade };
}

async function itemCompleto(id: string) {
  const item = await getPrisma().item.findUnique({
    where: { id },
    include: {
      grupo: { select: { mestreId: true } },
      npc: { select: { donoId: true } },
      ficha: { select: { jogadorId: true, classeId: true } },
      ...comRequisitos,
    },
  });
  if (!item) throw naoEncontrado("Item não encontrado");
  return item;
}

/** O mestre dono do item: do grupo dele ou do NPC dele. */
const mestreDoItem = (item: Awaited<ReturnType<typeof itemCompleto>>) => item.grupo?.mestreId ?? item.npc?.donoId ?? null;

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarItemSchema>) {
  const item = await itemCompleto(id);
  if (mestreDoItem(item) !== usuarioId) throw naoEncontrado("Item não encontrado");
  await validarRequisitos(dados, usuarioId);
  if (dados.espacos !== undefined && dados.espacos > item.espacos) {
    if (item.fichaId) await garantirEspacoFicha(item.fichaId, dados.espacos, id);
    if (item.npcId) await garantirEspacoNpc(await npcDoMestre(item.npcId, usuarioId), dados.espacos, id);
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
  const item = await itemCompleto(id);
  if (mestreDoItem(item) !== usuarioId) throw naoEncontrado("Item não encontrado");
  await getPrisma().item.delete({ where: { id } });
}

/**
 * Move um item. Destinos: uma ficha (`fichaId`), um NPC (`npcId`, só o mestre) ou vago num grupo (`fichaId: null`;
 * o mestre escolhe o grupo com `grupoId` quando o item vem de um NPC geral, que não tem grupo).
 */
export async function mover(id: string, usuarioId: string, destino: z.infer<typeof moverItemSchema>) {
  const item = await itemCompleto(id);
  const souMestre = mestreDoItem(item) === usuarioId;
  const prisma = getPrisma();

  if (!souMestre) {
    if (!item.grupoId || item.npcId) throw naoEncontrado("Item não encontrado");
    if (destino.npcId || destino.grupoId) throw proibido("Só o mestre manda itens para NPCs ou outros grupos.");
    const minhaFicha = await prisma.ficha.findUnique({
      where: { grupoId_jogadorId: { grupoId: item.grupoId, jogadorId: usuarioId } },
      select: { id: true },
    });
    if (!minhaFicha) throw naoEncontrado("Item não encontrado");
    const ehMeu = item.fichaId === minhaFicha.id;
    const estaVago = item.fichaId === null;
    // Meu item: passo para outra ficha do grupo ou descarto. Item vago: só posso pegar para mim.
    if (!ehMeu && !(estaVago && destino.fichaId === minhaFicha.id)) throw proibido("Você só pode mover itens do seu inventário ou pegar itens vagos.");
  }

  // Para um NPC.
  if (destino.npcId) {
    if (destino.npcId === item.npcId) return apresentarItem(item);
    const npc = await npcDoMestre(destino.npcId, usuarioId);
    await garantirEspacoNpc(npc, item.espacos);
    // Com NPC geral o item não pertence a grupo nenhum (não some se um grupo for excluído); com NPC exclusivo, fica no grupo dele.
    return apresentarItem(await prisma.item.update({ where: { id }, data: { npcId: npc.id, fichaId: null, grupoId: npc.grupoExclusivoId }, include: comRequisitos }));
  }

  // Para uma ficha.
  if (destino.fichaId) {
    if (destino.fichaId === item.fichaId) return apresentarItem(item);
    const ficha = await garantirEspacoFicha(destino.fichaId, item.espacos);
    await respeitarNpcExclusivo(item.npcId, ficha.grupoId);
    const mesmoGrupo = ficha.grupoId === item.grupoId;
    // Jogador: só dentro do grupo. Mestre: qualquer ficha dos grupos dele (ex.: o NPC entrega um item).
    if (!mesmoGrupo && !(souMestre && ficha.grupo.mestreId === usuarioId)) throw naoEncontrado("Ficha de destino não encontrada neste grupo");
    return apresentarItem(await prisma.item.update({ where: { id }, data: { fichaId: ficha.id, npcId: null, grupoId: ficha.grupoId }, include: comRequisitos }));
  }

  // Vago num grupo.
  const grupoId = destino.grupoId ?? item.grupoId;
  if (!grupoId) throw requisicaoInvalida("Este item é de um NPC sem grupo: escolha o grupo onde ele fica vago.", [{ campo: "grupoId", mensagem: "Escolha o grupo" }]);
  if (destino.grupoId && destino.grupoId !== item.grupoId) await grupoDoMestre(destino.grupoId, usuarioId);
  await respeitarNpcExclusivo(item.npcId, grupoId);
  if (item.fichaId === null && item.npcId === null && item.grupoId === grupoId) return apresentarItem(item);
  return apresentarItem(await prisma.item.update({ where: { id }, data: { fichaId: null, npcId: null, grupoId }, include: comRequisitos }));
}

/** Item de NPC exclusivo de um grupo só sai para aquele grupo. */
async function respeitarNpcExclusivo(npcId: string | null, grupoDestino: string) {
  if (!npcId) return;
  const npc = await getPrisma().npc.findUnique({ where: { id: npcId }, select: { grupoExclusivoId: true, nome: true } });
  if (npc?.grupoExclusivoId && npc.grupoExclusivoId !== grupoDestino) {
    throw requisicaoInvalida(`${npc.nome} é exclusivo de outro grupo: os itens dele só vão para esse grupo.`);
  }
}

/**
 * Usar um item do inventário (dono da ficha ou mestre; itens de NPC, só o mestre). O efeito é aplicado pela mesa; o app só conta os usos.
 * Item com usos limitados perde 1 uso e, ao chegar a 0, é consumido (apagado).
 * O jogador precisa saber usar (pré-requisito de classe/perícia); o mestre pode usar mesmo assim.
 */
export async function usar(id: string, usuarioId: string) {
  const item = await itemCompleto(id);
  const souMestre = mestreDoItem(item) === usuarioId;
  if (!item.fichaId && !item.npcId) throw requisicaoInvalida("Este item está vago no grupo: pegue-o antes de usar.");
  if (item.npcId && !souMestre) throw naoEncontrado("Item não encontrado");
  if (item.fichaId && !souMestre && item.ficha?.jogadorId !== usuarioId) throw naoEncontrado("Item não encontrado");

  if (!souMestre && item.fichaId && item.ficha) {
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
      raca: { include: { pericias: { include: { pericia: { include: { atributo: true } } } } } },
      classe: { include: { pericias: { include: { pericia: { include: { atributo: true } } } } } },
      pericias: { include: { pericia: { include: { atributo: true } } } },
    },
  });
  const linhas = somarPericias(["raca", "classe", "nivel"] as const, [
    ...f.raca.pericias.map((rp) => ({ pericia: rp.pericia, fonte: "raca" as const, valor: rp.pontos })),
    ...f.classe.pericias.map((cp) => ({ pericia: cp.pericia, fonte: "classe" as const, valor: cp.modificador })),
    ...f.pericias.map((fp) => ({ pericia: fp.pericia, fonte: "nivel" as const, valor: fp.pontos })),
  ], await copiasDoCatalogo(f.grupo.mestreId));
  return new Set(linhas.filter((l) => l.total > 0).map((l) => l.id));
}
