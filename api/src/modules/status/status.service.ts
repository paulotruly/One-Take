// Status (condições/emoções). Sempre de um mestre (não há fixos): os outros veem os verificados (selo ou kit), só leitura.
// Os automáticos (com gatilho, vindos do seed) podem ser editados pelo dono, mas não excluídos.
import type { z } from "zod";
import type { Status } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { kitIdsPara, podeUsar, quemVe, visao, visivelPara } from "../../lib/sistema.js";
import { comKits, definirKits } from "../../lib/kits.js";
import { validarCategoriaStatus } from "./categorias.js";
import type { criarStatusSchema, editarStatusSchema } from "./status.schemas.js";

export function apresentarStatus({ id, nome, efeito, tipo, gatilho, ordem, categoriaId }: Status) {
  return { id, nome, efeito, tipo, gatilho, ordem, automatico: gatilho !== null, categoriaId };
}

type CategoriaVisivel = { id: string; nome: string; donoId: string; verificado: boolean } | null;
/** Categoria do status para quem vê: só se for dele ou verificada (a categoria privada de outra pessoa não aparece). */
const categoriaPara = (c: CategoriaVisivel, usuarioId: string) => (c && (c.donoId === usuarioId || c.verificado) ? { id: c.id, nome: c.nome } : null);
const comCategoria = { categoria: { select: { id: true, nome: true, donoId: true, verificado: true } } } as const;

/** Status que o mestre pode usar: verificado ou dele. Outro = 404. */
export async function statusUsavel(id: string, usuarioId: string) {
  const status = await getPrisma().status.findUnique({ where: { id } });
  if (!status || !(await podeUsar("status", status, usuarioId))) throw naoEncontrado("Status não encontrado");
  return status;
}

/**
 * Status que valem para um personagem: os ativados no grupo dele; sem grupo (NPC geral), todos os que o mestre vê (dele + verificados).
 */
export async function statusDisponiveis(mestreId: string, grupoId: string | null) {
  const prisma = getPrisma();
  if (grupoId) return (await prisma.statusNoGrupo.findMany({ where: { grupoId }, include: { status: true } })).map((s) => s.status);
  return prisma.status.findMany({ where: await visivelPara(mestreId) });
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

/** Editar: só o dono. Excluir: o dono, menos os automáticos (a ficha depende deles). */
async function statusEditavel(id: string, usuarioId: string, { excluir = false } = {}) {
  const status = await statusUsavel(id, usuarioId);
  if (status.donoId !== usuarioId) throw new AppError(403, "VERIFICADO", "Este status é verificado (de outra pessoa): só leitura.");
  if (excluir && status.gatilho) throw new AppError(403, "STATUS_AUTOMATICO", "Status automático não pode ser excluído: a ficha usa ele quando vida, mana ou esforço chegam a 0. Edite o nome e o efeito, se quiser.");
  return status;
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const igual = await getPrisma().status.findFirst({
    where: { donoId: usuarioId, nome: { equals: nome, mode: "insensitive" }, NOT: exceto ? { id: exceto } : undefined },
  });
  if (igual) throw conflito("NOME_EM_USO", `Já existe um status chamado "${igual.nome}".`);
}

export async function listar(usuarioId: string) {
  const quem = await quemVe(usuarioId);
  const status = await getPrisma().status.findMany({
    where: await visivelPara(usuarioId),
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    include: { ...comKits, ...comCategoria },
  });
  return status.map((s) => ({
    ...apresentarStatus(s),
    categoria: categoriaPara(s.categoria, usuarioId),
    ...visao(s, quem),
    kitIds: kitIdsPara(s, quem),
  }));
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarStatusSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  await validarCategoriaStatus(dados.categoriaId, usuarioId);
  const { kitIds, ...resto } = dados;
  const s = await getPrisma().status.create({ data: { ...resto, donoId: usuarioId }, include: comCategoria });
  await definirKits("status", s.id, kitIds, usuarioId);
  return { ...apresentarStatus(s), categoria: categoriaPara(s.categoria, usuarioId), kitIds: kitIds ?? [] };
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarStatusSchema>) {
  await statusEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  await validarCategoriaStatus(dados.categoriaId, usuarioId);
  const { kitIds, ...resto } = dados;
  await definirKits("status", id, kitIds, usuarioId);
  const s = await getPrisma().status.update({ where: { id }, data: resto, include: { ...comKits, ...comCategoria } });
  return { ...apresentarStatus(s), categoria: categoriaPara(s.categoria, usuarioId), kitIds: (s.kits ?? []).map((k) => k.kitId) };
}

/** Sai também das fichas e grupos (cascata) e das cartas que o ativavam (fica sem status). */
export async function excluir(id: string, usuarioId: string) {
  await statusEditavel(id, usuarioId, { excluir: true });
  await getPrisma().status.delete({ where: { id } });
}
