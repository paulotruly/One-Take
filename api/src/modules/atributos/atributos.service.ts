import type { z } from "zod";
import type { Atributo } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { comKits, definirKits } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { ehAdmin, kitIdsPara, podeUsar, quemVe, visao, visivelPara } from "../../lib/sistema.js";
import type { criarAtributoSchema, editarAtributoSchema } from "./atributos.schemas.js";

// Atributos fixos (donoId nulo) valem para todos e não são editáveis.
// Atributos com dono são do mestre que os criou.

/** Formato público de um atributo (com `kitIds` quando os kits vierem junto). */
export function apresentarAtributo({ id, nome, descricao, ordem, donoId, kits }: Atributo & { kits?: { kitId: string }[] }) {
  return { id, nome, descricao, ordem, fixo: donoId === null, ...(kits && { kitIds: kits.map((k) => k.kitId) }) };
}

/** Ordena perícias pelo atributo (fixos na ordem definida, depois os do mestre) e pelo nome. */
export function porAtributoENome<T extends { nome: string; atributo: { ordem: number; nome: string } }>(a: T, b: T) {
  return (
    a.atributo.ordem - b.atributo.ordem ||
    a.atributo.nome.localeCompare(b.atributo.nome, "pt-BR") ||
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

/** Atributo que o mestre pode usar: fixo, verificado ou criado por ele. Outro = 404. */
export async function atributoUsavel(id: string, usuarioId: string) {
  const atributo = await getPrisma().atributo.findUnique({ where: { id } });
  if (!atributo || !(await podeUsar("atributo", atributo, usuarioId))) {
    throw naoEncontrado("Atributo não encontrado");
  }
  return atributo;
}

/** Editar: o dono; o fixo, só o administrador do sistema (e nunca excluir). */
async function atributoEditavel(id: string, usuarioId: string, { excluir = false } = {}) {
  const atributo = await atributoUsavel(id, usuarioId);
  if (atributo.donoId === usuarioId) return atributo;
  if (atributo.donoId === null && !excluir && (await ehAdmin(usuarioId))) return atributo;
  throw new AppError(403, "ATRIBUTO_FIXO", atributo.donoId === null ? "Atributos fixos do sistema não podem ser alterados." : "Este atributo é verificado (de outra pessoa): só leitura.");
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const prisma = getPrisma();
  const fixo = await prisma.atributo.findFirst({ where: { donoId: null, nome: { equals: nome, mode: "insensitive" }, NOT: exceto ? { id: exceto } : undefined } });
  const meu = await prisma.atributo.findFirst({ where: { donoId: usuarioId, nome: { equals: nome, mode: "insensitive" } } });
  if (fixo || (meu && meu.id !== exceto)) throw conflito("NOME_EM_USO", `Já existe um atributo chamado "${nome}".`);
}

const contarPericias = { _count: { select: { pericias: true } } } as const;

export async function listar(usuarioId: string) {
  const quem = await quemVe(usuarioId);
  const atributos = await getPrisma().atributo.findMany({
    where: await visivelPara(usuarioId),
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    include: { _count: { select: { pericias: { where: { donoId: usuarioId } } } }, ...comKits },
  });
  return atributos.map(({ _count, ...a }) => ({
    ...apresentarAtributo(a),
    ...visao(a, quem),
    kitIds: kitIdsPara(a, quem),
    pericias: _count.pericias,
  }));
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarAtributoSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  const { kitIds, ...resto } = dados;
  const a = await getPrisma().atributo.create({ data: { ...resto, donoId: usuarioId } });
  await definirKits("atributo", a.id, kitIds, usuarioId);
  return { ...apresentarAtributo({ ...a, kits: (kitIds ?? []).map((kitId) => ({ kitId })) }), pericias: 0 };
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarAtributoSchema>) {
  const atual = await atributoEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  const { kitIds, ...resto } = dados;
  if (atual.donoId !== null) await definirKits("atributo", id, kitIds, usuarioId); // fixo não entra em kit
  const { _count, ...a } = await getPrisma().atributo.update({ where: { id }, data: resto, include: { ...contarPericias, ...comKits } });
  return { ...apresentarAtributo(a), pericias: _count.pericias };
}

/** Só exclui atributo sem perícias: mover as perícias antes evita perder dados. Fixo nunca é excluído. */
export async function excluir(id: string, usuarioId: string) {
  await atributoEditavel(id, usuarioId, { excluir: true });
  const prisma = getPrisma();
  const emUso = await prisma.pericia.count({ where: { atributoId: id } });
  if (emUso > 0) {
    throw conflito("ATRIBUTO_EM_USO", `Este atributo tem ${emUso} perícia(s). Mova-as para outro atributo antes de excluir.`);
  }
  await prisma.atributo.delete({ where: { id } });
}
