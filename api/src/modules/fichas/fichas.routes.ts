import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { editarItemSchema, moverItemSchema } from "../grupos/grupos.schemas.js";
import { aplicarStatusSchema } from "../status/status.schemas.js";
import { criarFichaSchema, editarFichaSchema, gastarPericiaSchema } from "./fichas.schemas.js";
import * as service from "./fichas.service.js";
import * as itens from "./itens.service.js";

// Rotas para qualquer usuário logado (jogador ou mestre). As permissões ficam nos services.
export const fichasRouter = Router();

const fichaId = (v: unknown) => idDe(v, "Ficha não encontrada");
const itemId = (v: unknown) => idDe(v, "Item não encontrado");

fichasRouter.get("/convites/:codigo", async (req, res) => {
  res.json(await service.convite(String(req.params.codigo), usuarioDe(req).id));
});

fichasRouter.get("/fichas", async (req, res) => {
  res.json(await service.listarMinhas(usuarioDe(req).id));
});

fichasRouter.post("/fichas", async (req, res) => {
  const dados = criarFichaSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

fichasRouter.get("/fichas/:id", async (req, res) => {
  res.json(await service.detalhar(fichaId(req.params.id), usuarioDe(req).id));
});

fichasRouter.patch("/fichas/:id", async (req, res) => {
  const dados = editarFichaSchema.parse(req.body);
  res.json(await service.editar(fichaId(req.params.id), usuarioDe(req).id, dados));
});

fichasRouter.delete("/fichas/:id", async (req, res) => {
  await service.excluir(fichaId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

fichasRouter.post("/fichas/:id/subir-nivel", async (req, res) => {
  res.json(await service.subirNivel(fichaId(req.params.id), usuarioDe(req).id));
});

fichasRouter.post("/fichas/:id/pericias", async (req, res) => {
  const { periciaId } = gastarPericiaSchema.parse(req.body);
  res.json(await service.gastarPontosPericia(fichaId(req.params.id), usuarioDe(req).id, periciaId));
});

fichasRouter.post("/fichas/:id/status", async (req, res) => {
  const { statusId } = aplicarStatusSchema.parse(req.body);
  res.json(await service.aplicarStatus(fichaId(req.params.id), usuarioDe(req).id, statusId));
});

fichasRouter.delete("/fichas/:id/status/:statusId", async (req, res) => {
  const statusId = idDe(req.params.statusId, "Status não encontrado");
  res.json(await service.removerStatus(fichaId(req.params.id), usuarioDe(req).id, statusId));
});

// ---------- Itens ----------
fichasRouter.post("/itens/:id/mover", async (req, res) => {
  const { fichaId: destino } = moverItemSchema.parse(req.body);
  res.json(await itens.mover(itemId(req.params.id), usuarioDe(req).id, destino));
});

fichasRouter.patch("/itens/:id", async (req, res) => {
  const dados = editarItemSchema.parse(req.body);
  res.json(await itens.editar(itemId(req.params.id), usuarioDe(req).id, dados));
});

fichasRouter.delete("/itens/:id", async (req, res) => {
  await itens.excluir(itemId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});
