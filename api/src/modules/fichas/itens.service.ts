// Itens de um grupo e inventário das fichas.
// Mestre: cria, edita, exclui e move qualquer item. Jogador: passa o próprio item para outra ficha do grupo,
// descarta (fica vago no grupo) ou pega um item vago. Sempre respeitando o espaço do inventário.
import type { z } from "zod";
import { AppError, naoEncontrado, proibido } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { capacidadeInventario } from "../../regras/ficha.js";
import type { criarItemSchema, editarItemSchema } from "../grupos/grupos.schemas.js";
import { grupoDoMestre } from "../grupos/grupos.service.js";

async function garantirEspaco(fichaId: string, grupoId: string) {
  const prisma = getPrisma();
  const ficha = await prisma.ficha.findUnique({ where: { id: fichaId }, select: { grupoId: true, nivel: true } });
  if (!ficha || ficha.grupoId !== grupoId) throw naoEncontrado("Ficha de destino não encontrada neste grupo");
  const usados = await prisma.item.count({ where: { fichaId } });
  if (usados >= capacidadeInventario(ficha.nivel)) {
    throw new AppError(409, "INVENTARIO_CHEIO", "O inventário de destino está cheio.");
  }
}

export async function criar(grupoId: string, usuarioId: string, dados: z.infer<typeof criarItemSchema>) {
  await grupoDoMestre(grupoId, usuarioId);
  if (dados.fichaId) await garantirEspaco(dados.fichaId, grupoId);
  return getPrisma().item.create({ data: { grupoId, nome: dados.nome, descricao: dados.descricao, fichaId: dados.fichaId ?? null } });
}

async function itemComGrupo(id: string) {
  const item = await getPrisma().item.findUnique({
    where: { id },
    include: { grupo: { select: { mestreId: true } }, ficha: { select: { jogadorId: true } } },
  });
  if (!item) throw naoEncontrado("Item não encontrado");
  return item;
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarItemSchema>) {
  const item = await itemComGrupo(id);
  if (item.grupo.mestreId !== usuarioId) throw naoEncontrado("Item não encontrado");
  return getPrisma().item.update({ where: { id }, data: dados });
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
  if (fichaId === item.fichaId) return item;
  if (fichaId) await garantirEspaco(fichaId, item.grupoId);
  return getPrisma().item.update({ where: { id }, data: { fichaId } });
}
