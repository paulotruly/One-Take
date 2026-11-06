// Categorias de item: sempre de um mestre (não há fixas); só o dono vê e edita. Categoria não entra em kit.
// O ícone é uma chave desta lista; o front liga cada chave a um ícone do lucide.
import { doDono, ehDoDono } from "../../lib/posse.js";
import { Router } from "express";
import { z } from "zod";
import { conflito, naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";

export const ICONES_ITEM = [
  "pacote", "espada", "machado", "arco", "escudo", "joia", "anel", "coroa", "varinha", "caneca", "pocao", "comida",
  "livro", "pergaminho", "mapa", "chave", "moeda", "roupa", "martelo", "bomba",
] as const;

const base = z.object({
  nome: texto(40),
  descricao: z.string().trim().max(300),
  icone: z.enum(ICONES_ITEM, "Escolha um ícone"),
});
const criarSchema = base.extend({ descricao: base.shape.descricao.default(""), icone: base.shape.icone.default("pacote") });

const apresentar = (c: { id: string; nome: string; descricao: string; icone: string; ordem: number; donoId: string; _count?: { modelos: number; itens: number } }) => ({
  id: c.id, nome: c.nome, descricao: c.descricao, icone: c.icone, ordem: c.ordem,
  ...(c._count && { usos: c._count.modelos + c._count.itens }),
});

/** Categoria do próprio mestre. Outra = 404. */
async function categoriaEditavel(id: string, usuarioId: string) {
  const c = await getPrisma().categoriaItem.findUnique({ where: { id } });
  if (!c || !ehDoDono(c, usuarioId)) throw naoEncontrado("Categoria não encontrada");
  return c;
}

/** A categoria precisa ser do próprio mestre. */
export async function validarCategoria(id: string | null | undefined, mestreId: string) {
  if (id) await categoriaEditavel(id, mestreId);
}

async function nomeLivre(usuarioId: string, nome: string, exceto?: string) {
  const igual = await getPrisma().categoriaItem.findFirst({
    where: { nome: { equals: nome, mode: "insensitive" }, donoId: usuarioId, NOT: exceto ? { id: exceto } : undefined },
  });
  if (igual) throw conflito("NOME_EM_USO", `Já existe a categoria "${igual.nome}".`);
}

export const categoriasItemRouter = Router();
const comUsos = { _count: { select: { modelos: true, itens: true } } } as const;

categoriasItemRouter.get("/categorias-item", async (req, res) => {
  const lista = await getPrisma().categoriaItem.findMany({
    where: doDono(usuarioDe(req).id),
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    include: comUsos,
  });
  res.json(lista.map(apresentar));
});

categoriasItemRouter.post("/categorias-item", async (req, res) => {
  const dados = criarSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  await nomeLivre(usuarioId, dados.nome);
  res.status(201).json(apresentar(await getPrisma().categoriaItem.create({ data: { ...dados, donoId: usuarioId }, include: comUsos })));
});

categoriasItemRouter.patch("/categorias-item/:id", async (req, res) => {
  const dados = base.partial().parse(req.body);
  const usuarioId = usuarioDe(req).id;
  const id = idDe(req.params.id, "Categoria não encontrada");
  await categoriaEditavel(id, usuarioId);
  if (dados.nome) await nomeLivre(usuarioId, dados.nome, id);
  res.json(apresentar(await getPrisma().categoriaItem.update({ where: { id }, data: dados, include: comUsos })));
});

/** Itens dessa categoria ficam sem categoria. */
categoriasItemRouter.delete("/categorias-item/:id", async (req, res) => {
  const id = idDe(req.params.id, "Categoria não encontrada");
  await categoriaEditavel(id, usuarioDe(req).id);
  await getPrisma().categoriaItem.delete({ where: { id } });
  res.status(204).end();
});
