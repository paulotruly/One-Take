import type { z } from "zod";
import type { Atributo } from "../../generated/prisma/client.js";
import { conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import type { Usuario } from "../../middleware/auth.js";
import { apresentarAtributo, atributoUsavel, porAtributoENome } from "../atributos/atributos.service.js";
import { classeEditavel } from "../classes/classes.service.js";
import { comKits, definirKits } from "../../lib/kits.js";
import type { criarPericiaSchema, editarPericiaSchema } from "./pericias.schemas.js";

// ---------- Catálogo do mestre ----------
// Perícias base (donoId nulo) pertencem ao sistema e são usadas pelas classes fixas.
// Cada mestre trabalha numa cópia própria, criada uma única vez (Perfil.catalogoIniciado).

/** Copia as perícias base para o catálogo do mestre na primeira vez. Idempotente. */
export async function garantirCatalogo(usuario: Usuario) {
  if (usuario.catalogoIniciado) return;
  const prisma = getPrisma();
  const base = await prisma.pericia.findMany({ where: { donoId: null } });
  await prisma.$transaction([
    prisma.pericia.createMany({
      data: base.map(({ id, nome, descricao, categoria, atributoId }) => ({
        nome, descricao, categoria, atributoId, donoId: usuario.id, origemId: id,
      })),
      skipDuplicates: true, // corrida entre duas requisições: o @@unique([donoId, nome]) protege
    }),
    prisma.perfil.update({ where: { id: usuario.id }, data: { catalogoIniciado: true } }),
  ]);
  usuario.catalogoIniciado = true;
}

/** Perícia do catálogo do próprio mestre; qualquer outra (base ou de outro mestre) = 404. */
export async function periciaDoMestre(id: string, usuarioId: string) {
  const pericia = await getPrisma().pericia.findUnique({ where: { id } });
  if (!pericia || pericia.donoId !== usuarioId) throw naoEncontrado("Perícia não encontrada");
  return pericia;
}

async function garantirNomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const existente = await getPrisma().pericia.findUnique({ where: { donoId_nome: { donoId: usuarioId, nome } } });
  if (existente && existente.id !== exceto) throw conflito("NOME_EM_USO", `Você já tem uma perícia chamada "${nome}".`);
}

const contarUsos = { atributo: true, _count: { select: { classes: true, racas: true } }, ...comKits } as const;

/** Perícia do catálogo com seu atributo, quantas classes e raças do mestre a usam e os kits em que está. */
function apresentar<T extends { atributo: Atributo; _count: { classes: number; racas: number }; kits?: { kitId: string }[] }>({ _count, atributo, kits, ...p }: T) {
  return { ...p, atributo: apresentarAtributo(atributo), usosClasses: _count.classes, usosRacas: _count.racas, kitIds: (kits ?? []).map((k) => k.kitId) };
}

export async function listar(usuarioId: string) {
  const pericias = await getPrisma().pericia.findMany({
    where: { donoId: usuarioId },
    include: contarUsos,
  });
  return pericias.map(apresentar).sort(porAtributoENome);
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarPericiaSchema>) {
  await garantirNomeLivre(usuarioId, dados.nome);
  await atributoUsavel(dados.atributoId, usuarioId);
  const { kitIds, ...resto } = dados;
  const p = await getPrisma().pericia.create({ data: { ...resto, donoId: usuarioId }, include: contarUsos });
  await definirKits("pericia", p.id, kitIds, usuarioId);
  return apresentar({ ...p, kits: (kitIds ?? []).map((kitId) => ({ kitId })) });
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarPericiaSchema>) {
  await periciaDoMestre(id, usuarioId);
  if (dados.nome) await garantirNomeLivre(usuarioId, dados.nome, id);
  if (dados.atributoId) await atributoUsavel(dados.atributoId, usuarioId);
  const { kitIds, ...resto } = dados;
  await definirKits("pericia", id, kitIds, usuarioId);
  return apresentar(await getPrisma().pericia.update({ where: { id }, data: resto, include: contarUsos }));
}

/** Exclui do catálogo e, em cascata, das classes e raças que a usavam. */
export async function excluir(id: string, usuarioId: string) {
  await periciaDoMestre(id, usuarioId);
  await getPrisma().pericia.delete({ where: { id } });
}

// ---------- Perícias de uma classe ----------

/** Adiciona (ou atualiza o modificador de) uma perícia do catálogo do mestre na classe. */
export async function vincular(classeId: string, periciaId: string, usuarioId: string, modificador: number) {
  await classeEditavel(classeId, usuarioId);
  await periciaDoMestre(periciaId, usuarioId);
  return getPrisma().classePericia.upsert({
    where: { classeId_periciaId: { classeId, periciaId } },
    create: { classeId, periciaId, modificador },
    update: { modificador },
  });
}

export async function desvincular(classeId: string, periciaId: string, usuarioId: string) {
  await classeEditavel(classeId, usuarioId);
  const r = await getPrisma().classePericia.deleteMany({ where: { classeId, periciaId } });
  if (r.count === 0) throw naoEncontrado("Esta classe não tem essa perícia");
}
