import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { aplicarStatusSchema, turnosStatusSchema } from "../status/status.schemas.js";
import { criarNpcSchema, editarNpcSchema, filtroNpcsSchema, npcAtributoSchema, npcPericiaSchema } from "./npcs.schemas.js";
import * as service from "./npcs.service.js";

// NPCs do mestre. Itens de NPC usam as rotas de itens (/itens/:id/mover, /usar) e o lançamento do catálogo.
export const npcsRouter = Router();

const npcId = (v: unknown) => idDe(v, "NPC não encontrado");

npcsRouter.get("/npcs", async (req, res) => {
  const { kitId } = filtroNpcsSchema.parse(req.query);
  res.json(await service.listar(usuarioDe(req).id, kitId));
});

npcsRouter.post("/npcs", async (req, res) => {
  const dados = criarNpcSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

npcsRouter.get("/npcs/:id", async (req, res) => {
  res.json(await service.detalhar(npcId(req.params.id), usuarioDe(req).id));
});

npcsRouter.post("/npcs/:id/duplicar", async (req, res) => {
  res.status(201).json(await service.duplicar(npcId(req.params.id), usuarioDe(req).id));
});

npcsRouter.patch("/npcs/:id", async (req, res) => {
  const dados = editarNpcSchema.parse(req.body);
  res.json(await service.editar(npcId(req.params.id), usuarioDe(req).id, dados));
});

npcsRouter.delete("/npcs/:id", async (req, res) => {
  await service.excluir(npcId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

npcsRouter.put("/npcs/:id/atributos/:atributoId", async (req, res) => {
  const { dados } = npcAtributoSchema.parse(req.body);
  res.json(await service.definirAtributo(npcId(req.params.id), idDe(req.params.atributoId, "Atributo não encontrado"), usuarioDe(req).id, dados));
});

npcsRouter.put("/npcs/:id/pericias/:periciaId", async (req, res) => {
  const { pontos } = npcPericiaSchema.parse(req.body);
  res.json(await service.definirPericia(npcId(req.params.id), idDe(req.params.periciaId, "Perícia não encontrada"), usuarioDe(req).id, pontos));
});

npcsRouter.post("/npcs/:id/status", async (req, res) => {
  const { statusId, turnos } = aplicarStatusSchema.parse(req.body);
  res.json(await service.aplicarStatus(npcId(req.params.id), usuarioDe(req).id, statusId, turnos));
});

npcsRouter.patch("/npcs/:id/status/:statusId", async (req, res) => {
  const { turnos } = turnosStatusSchema.parse(req.body);
  res.json(await service.definirTurnosStatus(npcId(req.params.id), usuarioDe(req).id, idDe(req.params.statusId, "Status não encontrado"), turnos));
});

npcsRouter.delete("/npcs/:id/status/:statusId", async (req, res) => {
  res.json(await service.removerStatus(npcId(req.params.id), usuarioDe(req).id, idDe(req.params.statusId, "Status não encontrado")));
});
