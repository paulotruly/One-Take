// Status (condições/emoções). Fixos do sistema (donoId nulo, não editáveis) + os criados por cada mestre.
import type { z } from "zod";
import type { Status } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import type { criarStatusSchema, editarStatusSchema } from "./status.schemas.js";

export function apresentarStatus({ id, nome, descricao, efeito, tipo, gatilho, ordem, donoId }: Status) {
  return { id, nome, descricao, efeito, tipo, gatilho, ordem, fixo: donoId === null, automatico: gatilho !== null };
}

/** Status que o mestre pode usar: fixo ou dele. Outro = 404. */
export async function statusUsavel(id: string, usuarioId: string) {
  const status = await getPrisma().status.findUnique({ where: { id } });
  if (!status || (status.donoId !== null && status.donoId !== usuarioId)) throw naoEncontrado("Status não encontrado");
  return status;
}

async function statusEditavel(id: string, usuarioId: string) {
  const status = await statusUsavel(id, usuarioId);
  if (status.donoId === null) throw new AppError(403, "STATUS_FIXO", "Status fixos do sistema não podem ser alterados.");
  return status;
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const igual = await getPrisma().status.findFirst({
    where: { OR: [{ donoId: null }, { donoId: usuarioId }], nome: { equals: nome, mode: "insensitive" }, NOT: exceto ? { id: exceto } : undefined },
  });
  if (igual) throw conflito("NOME_EM_USO", `Já existe um status chamado "${igual.nome}".`);
}

export async function listar(usuarioId: string) {
  const status = await getPrisma().status.findMany({
    where: { OR: [{ donoId: null }, { donoId: usuarioId }] },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
  });
  return status.map(apresentarStatus);
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarStatusSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  return apresentarStatus(await getPrisma().status.create({ data: { ...dados, donoId: usuarioId } }));
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarStatusSchema>) {
  await statusEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  return apresentarStatus(await getPrisma().status.update({ where: { id }, data: dados }));
}

/** Sai também das fichas e grupos (cascata) e das cartas que o ativavam (fica sem status). */
export async function excluir(id: string, usuarioId: string) {
  await statusEditavel(id, usuarioId);
  await getPrisma().status.delete({ where: { id } });
}
