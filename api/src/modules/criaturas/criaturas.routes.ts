import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { editarCriaturaSchema, invocarSchema } from "../bestas/bestas.schemas.js";
import { aplicarStatusSchema } from "../status/status.schemas.js";
import * as service from "./criaturas.service.js";

// Criaturas invocadas num grupo (rotas do mestre).
export const criaturasRouter = Router();

const criaturaId = (v: unknown) => idDe(v, "Criatura não encontrada");

criaturasRouter.post("/grupos/:id/criaturas", async (req, res) => {
  const dados = invocarSchema.parse(req.body);
  res.status(201).json(await service.invocar(idDe(req.params.id, "Grupo não encontrado"), usuarioDe(req).id, dados));
});

criaturasRouter.get("/criaturas/:id", async (req, res) => {
  res.json(await service.detalhar(criaturaId(req.params.id), usuarioDe(req).id));
});

criaturasRouter.patch("/criaturas/:id", async (req, res) => {
  const dados = editarCriaturaSchema.parse(req.body);
  res.json(await service.editar(criaturaId(req.params.id), usuarioDe(req).id, dados));
});

criaturasRouter.delete("/criaturas/:id", async (req, res) => {
  await service.remover(criaturaId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

criaturasRouter.post("/criaturas/:id/status", async (req, res) => {
  const { statusId } = aplicarStatusSchema.parse(req.body);
  res.json(await service.aplicarStatus(criaturaId(req.params.id), usuarioDe(req).id, statusId));
});

criaturasRouter.delete("/criaturas/:id/status/:statusId", async (req, res) => {
  res.json(await service.removerStatus(criaturaId(req.params.id), usuarioDe(req).id, idDe(req.params.statusId, "Status não encontrado")));
});
