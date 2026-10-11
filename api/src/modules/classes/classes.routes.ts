import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { criarClasseSchema, editarClasseSchema, filtroClassesSchema } from "./classes.schemas.js";
import * as service from "./classes.service.js";

export const classesRouter = Router();

classesRouter.get("/classes", async (req, res) => {
  const { grupo } = filtroClassesSchema.parse(req.query);
  res.json(await service.listar(usuarioDe(req).id, grupo));
});

classesRouter.post("/classes", async (req, res) => {
  const dados = criarClasseSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

classesRouter.get("/classes/:id", async (req, res) => {
  res.json(await service.detalhar(idDe(req.params.id, "Classe não encontrada"), usuarioDe(req).id));
});

classesRouter.get("/classes/:id/progressao", async (req, res) => {
  res.json(await service.progressao(idDe(req.params.id, "Classe não encontrada"), usuarioDe(req).id));
});

classesRouter.patch("/classes/:id", async (req, res) => {
  const dados = editarClasseSchema.parse(req.body);
  res.json(await service.editar(idDe(req.params.id, "Classe não encontrada"), usuarioDe(req).id, dados));
});

classesRouter.delete("/classes/:id", async (req, res) => {
  await service.excluir(idDe(req.params.id, "Classe não encontrada"), usuarioDe(req).id);
  res.status(204).end();
});

classesRouter.post("/classes/:id/duplicar", async (req, res) => {
  res.status(201).json(await service.duplicar(idDe(req.params.id, "Classe não encontrada"), usuarioDe(req).id));
});
