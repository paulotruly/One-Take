import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { criarStatusSchema, editarStatusSchema } from "./status.schemas.js";
import * as service from "./status.service.js";

// Catálogo de status do mestre.
export const statusRouter = Router();

const statusId = (v: unknown) => idDe(v, "Status não encontrado");

statusRouter.get("/status", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

statusRouter.post("/status", async (req, res) => {
  const dados = criarStatusSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

statusRouter.patch("/status/:id", async (req, res) => {
  const dados = editarStatusSchema.parse(req.body);
  res.json(await service.editar(statusId(req.params.id), usuarioDe(req).id, dados));
});

statusRouter.delete("/status/:id", async (req, res) => {
  await service.excluir(statusId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});
