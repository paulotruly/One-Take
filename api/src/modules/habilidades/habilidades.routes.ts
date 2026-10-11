import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { aprimoramentoSchema, criarHabilidadeSchema, editarHabilidadeSchema, ordenarHabilidadesSchema } from "./habilidades.schemas.js";
import * as service from "./habilidades.service.js";

export const habilidadesRouter = Router();

habilidadesRouter.post("/classes/:classeId/habilidades", async (req, res) => {
  const dados = criarHabilidadeSchema.parse(req.body);
  const classeId = idDe(req.params.classeId, "Classe não encontrada");
  res.status(201).json(await service.criar(classeId, usuarioDe(req).id, dados));
});

habilidadesRouter.put("/classes/:classeId/habilidades/ordem", async (req, res) => {
  const { ids } = ordenarHabilidadesSchema.parse(req.body);
  const classeId = idDe(req.params.classeId, "Classe não encontrada");
  res.json(await service.ordenar(classeId, usuarioDe(req).id, ids));
});

habilidadesRouter.patch("/habilidades/:id", async (req, res) => {
  const dados = editarHabilidadeSchema.parse(req.body);
  res.json(await service.editar(idDe(req.params.id, "Habilidade não encontrada"), usuarioDe(req).id, dados));
});

habilidadesRouter.delete("/habilidades/:id", async (req, res) => {
  await service.excluir(idDe(req.params.id, "Habilidade não encontrada"), usuarioDe(req).id);
  res.status(204).end();
});

// ---------- Aprimoramentos ----------
habilidadesRouter.post("/habilidades/:id/aprimoramentos", async (req, res) => {
  const dados = aprimoramentoSchema.parse(req.body);
  res.status(201).json(await service.criarAprimoramento(idDe(req.params.id, "Habilidade não encontrada"), usuarioDe(req).id, dados));
});

habilidadesRouter.patch("/aprimoramentos/:id", async (req, res) => {
  const dados = aprimoramentoSchema.parse(req.body);
  res.json(await service.editarAprimoramento(idDe(req.params.id, "Aprimoramento não encontrado"), usuarioDe(req).id, dados));
});

habilidadesRouter.delete("/aprimoramentos/:id", async (req, res) => {
  await service.excluirAprimoramento(idDe(req.params.id, "Aprimoramento não encontrado"), usuarioDe(req).id);
  res.status(204).end();
});
