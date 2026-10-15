import type { z } from "zod";
import type { Atributo } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { comKits, definirKits } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { kitIdsPara, podeUsar, quemVe, visao, visivelPara } from "../../lib/sistema.js";
import type { criarAtributoSchema, editarAtributoSchema } from "./atributos.schemas.js";

// Atributos são sempre de um mestre (não há fixos). Os outros veem os verificados (selo ou kit), só leitura.

/** Formato público de um atributo (com `kitIds` quando os kits vierem junto). */
export function apresentarAtributo({ id, nome, descricao, ordem, kits }: Atributo & { kits?: { kitId: string }[] }) {
  return { id, nome, descricao, ordem, ...(kits && { kitIds: kits.map((k) => k.kitId) }) };
}

/** Ordena perícias pelo atributo (pela ordem e depois pelo nome do atributo) e pelo nome. */
export function porAtributoENome<T extends { nome: string; atributo: { ordem: number; nome: string } }>(a: T, b: T) {
  return (
    a.atributo.ordem - b.atributo.ordem ||
    a.atributo.nome.localeCompare(b.atributo.nome, "pt-BR") ||
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

/** Atributo que o mestre pode usar: verificado ou criado por ele. Outro = 404. */
export async function atributoUsavel(id: string, usuarioId: string) {
  const atributo = await getPrisma().atributo.findUnique({ where: { id } });
  if (!atributo || !(await podeUsar("atributo", atributo, usuarioId))) {
    throw naoEncontrado("Atributo não encontrado");
  }
  return atributo;
}

/** Editar e excluir: só o dono. */
async function atributoEditavel(id: string, usuarioId: string) {
  const atributo = await atributoUsavel(id, usuarioId);
  if (atributo.donoId === usuarioId) return atributo;
  throw new AppError(403, "VERIFICADO", "Este atributo é verificado (de outra pessoa): só leitura.");
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const meu = await getPrisma().atributo.findFirst({ where: { donoId: usuarioId, nome: { equals: nome, mode: "insensitive" } } });
  if (meu && meu.id !== exceto) throw conflito("NOME_EM_USO", `Já existe um atributo chamado "${nome}".`);
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
  await atributoEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  const { kitIds, ...resto } = dados;
  await definirKits("atributo", id, kitIds, usuarioId);
  const { _count, ...a } = await getPrisma().atributo.update({ where: { id }, data: resto, include: { ...contarPericias, ...comKits } });
  return { ...apresentarAtributo(a), pericias: _count.pericias };
}

/** Só exclui atributo sem perícias (de ninguém): mover as perícias antes evita perder dados. */
export async function excluir(id: string, usuarioId: string) {
  await atributoEditavel(id, usuarioId);
  const prisma = getPrisma();
  const emUso = await prisma.pericia.count({ where: { atributoId: id } });
  if (emUso > 0) {
    throw conflito("ATRIBUTO_EM_USO", `Este atributo tem ${emUso} perícia(s). Mova-as para outro atributo antes de excluir.`);
  }
  await prisma.atributo.delete({ where: { id } });
}
