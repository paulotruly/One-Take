import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { criarRacaSchema, editarRacaSchema, racaPericiaSchema } from "./racas.schemas.js";
import * as service from "./racas.service.js";

export const racasRouter = Router();

const racaId = (v: unknown) => idDe(v, "Raça não encontrada");

racasRouter.get("/racas", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

racasRouter.post("/racas", async (req, res) => {
  const dados = criarRacaSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

racasRouter.get("/racas/:id", async (req, res) => {
  res.json(await service.detalhar(racaId(req.params.id), usuarioDe(req).id));
});

racasRouter.patch("/racas/:id", async (req, res) => {
  const dados = editarRacaSchema.parse(req.body);
  res.json(await service.editar(racaId(req.params.id), usuarioDe(req).id, dados));
});

racasRouter.delete("/racas/:id", async (req, res) => {
  await service.excluir(racaId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

racasRouter.put("/racas/:id/pericias/:periciaId", async (req, res) => {
  const { pontos } = racaPericiaSchema.parse(req.body);
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  res.json(await service.vincularPericia(racaId(req.params.id), periciaId, usuarioDe(req).id, pontos));
});

racasRouter.delete("/racas/:id/pericias/:periciaId", async (req, res) => {
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  await service.desvincularPericia(racaId(req.params.id), periciaId, usuarioDe(req).id);
  res.status(204).end();
});
