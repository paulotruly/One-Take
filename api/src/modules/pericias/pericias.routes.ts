import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { criarPericiaSchema, editarPericiaSchema, vinculoSchema } from "./pericias.schemas.js";
import * as service from "./pericias.service.js";

export const periciasRouter = Router();

// ---------- Catálogo do mestre ----------
periciasRouter.get("/pericias", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

periciasRouter.post("/pericias", async (req, res) => {
  const dados = criarPericiaSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

periciasRouter.patch("/pericias/:id", async (req, res) => {
  const dados = editarPericiaSchema.parse(req.body);
  res.json(await service.editar(idDe(req.params.id, "Perícia não encontrada"), usuarioDe(req).id, dados));
});

periciasRouter.delete("/pericias/:id", async (req, res) => {
  await service.excluir(idDe(req.params.id, "Perícia não encontrada"), usuarioDe(req).id);
  res.status(204).end();
});

// ---------- Perícias de uma classe ----------
periciasRouter.put("/classes/:classeId/pericias/:periciaId", async (req, res) => {
  const { modificador } = vinculoSchema.parse(req.body);
  const classeId = idDe(req.params.classeId, "Classe não encontrada");
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  res.json(await service.vincular(classeId, periciaId, usuarioDe(req).id, modificador));
});

periciasRouter.delete("/classes/:classeId/pericias/:periciaId", async (req, res) => {
  const classeId = idDe(req.params.classeId, "Classe não encontrada");
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  await service.desvincular(classeId, periciaId, usuarioDe(req).id);
  res.status(204).end();
});
