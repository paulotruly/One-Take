import { Router } from "express";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import * as itens from "../fichas/itens.service.js";
import { criarGrupoSchema, criarItemSchema, disponiveisSchema, editarGrupoSchema, regraDaMesaSchema } from "./grupos.schemas.js";
import * as service from "./grupos.service.js";

// Rotas do mestre (o app exige papel MESTRE antes de chegar aqui).
export const gruposRouter = Router();

const grupoId = (v: unknown) => idDe(v, "Grupo não encontrado");

gruposRouter.get("/grupos", async (req, res) => {
  res.json(await service.listar(usuarioDe(req).id));
});

gruposRouter.post("/grupos", async (req, res) => {
  const dados = criarGrupoSchema.parse(req.body);
  res.status(201).json(await service.criar(usuarioDe(req).id, dados));
});

gruposRouter.get("/grupos/:id", async (req, res) => {
  res.json(await service.detalhar(grupoId(req.params.id), usuarioDe(req).id));
});

gruposRouter.patch("/grupos/:id", async (req, res) => {
  const dados = editarGrupoSchema.parse(req.body);
  res.json(await service.editar(grupoId(req.params.id), usuarioDe(req).id, dados));
});

gruposRouter.delete("/grupos/:id", async (req, res) => {
  await service.excluir(grupoId(req.params.id), usuarioDe(req).id);
  res.status(204).end();
});

gruposRouter.put("/grupos/:id/disponiveis", async (req, res) => {
  const dados = disponiveisSchema.parse(req.body);
  res.json(await service.definirDisponiveis(grupoId(req.params.id), usuarioDe(req).id, dados));
});

gruposRouter.post("/grupos/:id/codigo", async (req, res) => {
  res.json(await service.novoCodigoDoGrupo(grupoId(req.params.id), usuarioDe(req).id));
});

gruposRouter.post("/grupos/:id/itens", async (req, res) => {
  const dados = criarItemSchema.parse(req.body);
  res.status(201).json(await itens.criar(grupoId(req.params.id), usuarioDe(req).id, dados));
});

// ---------- Regras da mesa ----------
gruposRouter.post("/grupos/:id/regras", async (req, res) => {
  const dados = regraDaMesaSchema.parse(req.body);
  res.status(201).json(await service.criarRegra(grupoId(req.params.id), usuarioDe(req).id, dados));
});

gruposRouter.patch("/regras-da-mesa/:id", async (req, res) => {
  const dados = regraDaMesaSchema.partial().parse(req.body);
  res.json(await service.editarRegra(idDe(req.params.id, "Regra não encontrada"), usuarioDe(req).id, dados));
});

gruposRouter.delete("/regras-da-mesa/:id", async (req, res) => {
  await service.excluirRegra(idDe(req.params.id, "Regra não encontrada"), usuarioDe(req).id);
  res.status(204).end();
});
