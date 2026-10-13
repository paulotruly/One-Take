import type { z } from "zod";
import type { Atributo } from "../../generated/prisma/client.js";
import { AppError, conflito, naoEncontrado } from "../../lib/errors.js";
import { aplicarExclusividade, garantirExclusividadePossivel, validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
import type { criarAtributoSchema, editarAtributoSchema } from "./atributos.schemas.js";

// Atributos fixos (donoId nulo) valem para todos e não são editáveis.
// Atributos com dono são do mestre que os criou.

/** Formato público de um atributo. */
export function apresentarAtributo({ id, nome, descricao, ordem, donoId, grupoExclusivoId }: Atributo) {
  return { id, nome, descricao, ordem, fixo: donoId === null, grupoExclusivoId };
}

/** Ordena perícias pelo atributo (fixos na ordem definida, depois os do mestre) e pelo nome. */
export function porAtributoENome<T extends { nome: string; atributo: { ordem: number; nome: string } }>(a: T, b: T) {
  return (
    a.atributo.ordem - b.atributo.ordem ||
    a.atributo.nome.localeCompare(b.atributo.nome, "pt-BR") ||
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

/** Atributo que o mestre pode usar: fixo ou criado por ele. Outro = 404. */
export async function atributoUsavel(id: string, usuarioId: string) {
  const atributo = await getPrisma().atributo.findUnique({ where: { id } });
  if (!atributo || (atributo.donoId !== null && atributo.donoId !== usuarioId)) {
    throw naoEncontrado("Atributo não encontrado");
  }
  return atributo;
}

async function atributoEditavel(id: string, usuarioId: string) {
  const atributo = await atributoUsavel(id, usuarioId);
  if (atributo.donoId === null) {
    throw new AppError(403, "ATRIBUTO_FIXO", "Atributos fixos do sistema não podem ser alterados.");
  }
  return atributo;
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const prisma = getPrisma();
  const fixo = await prisma.atributo.findFirst({ where: { donoId: null, nome: { equals: nome, mode: "insensitive" } } });
  const meu = await prisma.atributo.findFirst({ where: { donoId: usuarioId, nome: { equals: nome, mode: "insensitive" } } });
  if (fixo || (meu && meu.id !== exceto)) throw conflito("NOME_EM_USO", `Já existe um atributo chamado "${nome}".`);
}

const contarPericias = { _count: { select: { pericias: true } } } as const;

export async function listar(usuarioId: string) {
  const atributos = await getPrisma().atributo.findMany({
    where: { OR: [{ donoId: null }, { donoId: usuarioId }] },
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    include: { _count: { select: { pericias: { where: { donoId: usuarioId } } } } },
  });
  return atributos.map(({ _count, ...a }) => ({ ...apresentarAtributo(a), pericias: _count.pericias }));
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarAtributoSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  const a = await getPrisma().atributo.create({ data: { ...dados, donoId: usuarioId } });
  await aplicarExclusividade("atributo", a.id, dados.grupoExclusivoId);
  return { ...apresentarAtributo(a), pericias: 0 };
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarAtributoSchema>) {
  await atributoEditavel(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await garantirExclusividadePossivel("atributo", id, dados.grupoExclusivoId);
  const { _count, ...a } = await getPrisma().atributo.update({ where: { id }, data: dados, include: contarPericias });
  await aplicarExclusividade("atributo", id, dados.grupoExclusivoId);
  return { ...apresentarAtributo(a), pericias: _count.pericias };
}

/** Só exclui atributo sem perícias: mover as perícias antes evita perder dados. */
export async function excluir(id: string, usuarioId: string) {
  await atributoEditavel(id, usuarioId);
  const prisma = getPrisma();
  const emUso = await prisma.pericia.count({ where: { atributoId: id } });
  if (emUso > 0) {
    throw conflito("ATRIBUTO_EM_USO", `Este atributo tem ${emUso} perícia(s). Mova-as para outro atributo antes de excluir.`);
  }
  await prisma.atributo.delete({ where: { id } });
}
