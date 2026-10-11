import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { criarAtributoSchema, editarAtributoSchema } from "./atributos.schemas.js";
import * as service from "./atributos.service.js";

export const atributosRouter = Router();

const atributoId = (v: unknown) => idDe(v, "Atributo não encontrado");

atributosRouter.get("/atributos", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

atributosRouter.post("/atributos", async (req, res) => {
  const dados = criarAtributoSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

atributosRouter.patch("/atributos/:id", async (req, res) => {
  const dados = editarAtributoSchema.parse(req.body);
  res.json(await service.editar(atributoId(req.params.id), usuarioDe(req).id, dados));
});

atributosRouter.delete("/atributos/:id", async (req, res) => {
  await service.excluir(atributoId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});
