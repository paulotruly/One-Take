// Classes-conceito do mestre: classe generalista (título e descrição) que agrupa subclasses.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";

export const conceitosRouter = Router();

const schema = z.object({ titulo: texto(80), descricao: texto(2000) });
const comSubclasses = {
  subclasses: {
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true, grupo: true, imagemUrl: true, pontosVida: true, pontosMana: true, pontosEsforco: true },
  },
} as const;

async function conceitoDoMestre(id: string, usuarioId: string) {
  const c = await getPrisma().classeConceito.findUnique({ where: { id } });
  if (!c || c.donoId !== usuarioId) throw naoEncontrado("Classe-conceito não encontrada");
  return c;
}

conceitosRouter.get("/conceitos", async (req, res) => {
  res.json(
    await getPrisma().classeConceito.findMany({ where: { donoId: usuarioDe(req).id }, orderBy: { titulo: "asc" }, include: comSubclasses }),
  );
});

conceitosRouter.post("/conceitos", async (req, res) => {
  const dados = schema.parse(req.body);
  res.status(201).json(await getPrisma().classeConceito.create({ data: { ...dados, donoId: usuarioDe(req).id }, include: comSubclasses }));
});

conceitosRouter.patch("/conceitos/:id", async (req, res) => {
  const dados = schema.partial().parse(req.body);
  const id = idDe(req.params.id, "Classe-conceito não encontrada");
  await conceitoDoMestre(id, usuarioDe(req).id);
  res.json(await getPrisma().classeConceito.update({ where: { id }, data: dados, include: comSubclasses }));
});

/** As subclasses continuam existindo, só deixam de ter conceito. */
conceitosRouter.delete("/conceitos/:id", async (req, res) => {
  const id = idDe(req.params.id, "Classe-conceito não encontrada");
  await conceitoDoMestre(id, usuarioDe(req).id);
  await getPrisma().classeConceito.delete({ where: { id } });
  res.status(204).end();
});
