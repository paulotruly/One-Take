// Status (condições/emoções). Fixos do sistema (donoId nulo, não editáveis) + os criados por cada mestre.
import type { z } from "zod";
import type { Status } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { comKits, definirKits } from "../../lib/kits.js";
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

/**
 * Status que valem para um personagem: os ativados no grupo dele; sem grupo (NPC geral), todos os do mestre (fixos + próprios).
 */
export async function statusDisponiveis(mestreId: string, grupoId: string | null) {
  const prisma = getPrisma();
  if (grupoId) return (await prisma.statusNoGrupo.findMany({ where: { grupoId }, include: { status: true } })).map((s) => s.status);
  return prisma.status.findMany({ where: { OR: [{ donoId: null }, { donoId: mestreId }] } });
}

/** Status manuais que ainda podem ser aplicados (disponíveis, não automáticos, ainda não aplicados), ordenados. */
export function statusAplicaveis(disponiveis: Status[], aplicadosIds: string[]) {
  return disponiveis
    .filter((st) => !st.gatilho && !aplicadosIds.includes(st.id))
    .map(apresentarStatus)
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Confere se o status pode ser aplicado manualmente ali (existe, é do mestre, não é automático, está disponível). */
export async function validarAplicacao(statusId: string, mestreId: string, disponiveis: Status[]) {
  const status = await statusUsavel(statusId, mestreId);
  if (status.gatilho) throw new AppError(400, "REQUISICAO_INVALIDA", "Este status é automático: ele aparece sozinho pelos recursos.");
  if (!disponiveis.some((d) => d.id === statusId)) throw new AppError(400, "REQUISICAO_INVALIDA", "Este status não está ativado no grupo.");
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
    include: comKits,
  });
  return status.map((s) => ({ ...apresentarStatus(s), kitIds: (s.kits ?? []).map((k) => k.kitId) }));
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarStatusSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  const { kitIds, ...resto } = dados;
  const s = await getPrisma().status.create({ data: { ...resto, donoId: usuarioId } });
  await definirKits("status", s.id, kitIds, usuarioId);
  return { ...apresentarStatus(s), kitIds: kitIds ?? [] };
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarStatusSchema>) {
  await statusEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  const { kitIds, ...resto } = dados;
  await definirKits("status", id, kitIds, usuarioId);
  const s = await getPrisma().status.update({ where: { id }, data: resto, include: comKits });
  return { ...apresentarStatus(s), kitIds: (s.kits ?? []).map((k) => k.kitId) };
}

/** Sai também das fichas e grupos (cascata) e das cartas que o ativavam (fica sem status). */
export async function excluir(id: string, usuarioId: string) {
  await statusEditavel(id, usuarioId);
  await getPrisma().status.delete({ where: { id } });
}
