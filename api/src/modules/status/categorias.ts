// Categorias de status: o mestre cria as dele (ex.: Elementais, Mentais) para organizar a página de status e a escolha do
// que vale no grupo. Não há categoria fixa; só o dono vê e edita.
import { Router } from "express";
import { z } from "zod";
import { conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { doDono, ehDoDono } from "../../lib/posse.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";

const base = z.object({ nome: texto(40), descricao: z.string().trim().max(300) });
const criarSchema = base.extend({ descricao: base.shape.descricao.default("") });

const apresentar = (c: { id: string; nome: string; descricao: string; donoId: string; _count?: { status: number } }) => ({
  id: c.id, nome: c.nome, descricao: c.descricao, ...(c._count && { usos: c._count.status }),
});

async function categoriaDoMestre(id: string, usuarioId: string) {
  const c = await getPrisma().categoriaStatus.findUnique({ where: { id } });
  if (!c || !ehDoDono(c, usuarioId)) throw naoEncontrado("Categoria não encontrada");
  return c;
}

/** A categoria do status precisa ser do próprio mestre. */
export async function validarCategoriaStatus(id: string | null | undefined, mestreId: string) {
  if (id) await categoriaDoMestre(id, mestreId);
}

async function nomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const igual = await getPrisma().categoriaStatus.findFirst({
    where: { donoId: usuarioId, nome: { equals: nome, mode: "insensitive" }, NOT: exceto ? { id: exceto } : undefined },
  });
  if (igual) throw conflito("NOME_EM_USO", `Já existe a categoria "${igual.nome}".`);
}

export const categoriasStatusRouter = Router();
const comUsos = { _count: { select: { status: true } } } as const;

categoriasStatusRouter.get("/status-categorias", async (req, res) => {
  const lista = await getPrisma().categoriaStatus.findMany({ where: doDono(usuarioDe(req).id), orderBy: { nome: "asc" }, include: comUsos });
  res.json(lista.map(apresentar));
});

categoriasStatusRouter.post("/status-categorias", async (req, res) => {
  const dados = criarSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  await nomeLivre(usuarioId, dados.nome);
  const c = await getPrisma().categoriaStatus.create({ data: { ...dados, donoId: usuarioId }, include: comUsos });
  res.status(201).json(apresentar(c));
});

categoriasStatusRouter.patch("/status-categorias/:id", async (req, res) => {
  const dados = base.partial().parse(req.body);
  const usuarioId = usuarioDe(req).id;
  const id = idDe(req.params.id, "Categoria não encontrada");
  await categoriaDoMestre(id, usuarioId);
  if (dados.nome) await nomeLivre(usuarioId, dados.nome, id);
  const c = await getPrisma().categoriaStatus.update({ where: { id }, data: dados, include: comUsos });
  res.json(apresentar(c));
});

/** Os status dessa categoria ficam sem categoria. */
categoriasStatusRouter.delete("/status-categorias/:id", async (req, res) => {
  const id = idDe(req.params.id, "Categoria não encontrada");
  await categoriaDoMestre(id, usuarioDe(req).id);
  await getPrisma().categoriaStatus.delete({ where: { id } });
  res.status(204).end();
});
