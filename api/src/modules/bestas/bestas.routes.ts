import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { bestaAtributoSchema, bestaPericiaSchema, criarBestaSchema, editarBestaSchema } from "./bestas.schemas.js";
import * as service from "./bestas.service.js";

// Bestiário (rotas do mestre). A cartela das criaturas fica em habilidades.routes.ts.
export const bestasRouter = Router();

const bestaId = (v: unknown) => idDe(v, "Besta não encontrada");

bestasRouter.get("/bestas", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

bestasRouter.post("/bestas", async (req, res) => {
  const dados = criarBestaSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

bestasRouter.get("/bestas/:id", async (req, res) => {
  res.json(await service.detalhar(bestaId(req.params.id), usuarioDe(req).id));
});

bestasRouter.get("/bestas/:id/progressao", async (req, res) => {
  res.json(await service.progressao(bestaId(req.params.id), usuarioDe(req).id));
});

bestasRouter.patch("/bestas/:id", async (req, res) => {
  const dados = editarBestaSchema.parse(req.body);
  res.json(await service.editar(bestaId(req.params.id), usuarioDe(req).id, dados));
});

bestasRouter.delete("/bestas/:id", async (req, res) => {
  await service.excluir(bestaId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

bestasRouter.post("/bestas/:id/duplicar", async (req, res) => {
  res.status(201).json(await service.duplicar(bestaId(req.params.id), usuarioDe(req).id));
});

bestasRouter.put("/bestas/:id/pericias/:periciaId", async (req, res) => {
  const { modificador } = bestaPericiaSchema.parse(req.body);
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  res.json(await service.vincularPericia(bestaId(req.params.id), periciaId, usuarioDe(req).id, modificador));
});

bestasRouter.delete("/bestas/:id/pericias/:periciaId", async (req, res) => {
  const periciaId = idDe(req.params.periciaId, "Perícia não encontrada");
  res.json(await service.desvincularPericia(bestaId(req.params.id), periciaId, usuarioDe(req).id));
});

bestasRouter.put("/bestas/:id/atributos/:atributoId", async (req, res) => {
  const { dados } = bestaAtributoSchema.parse(req.body);
  const atributoId = idDe(req.params.atributoId, "Atributo não encontrado");
  res.json(await service.definirAtributo(bestaId(req.params.id), atributoId, usuarioDe(req).id, dados));
});
