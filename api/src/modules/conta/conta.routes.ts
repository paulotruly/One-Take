// Rotas da conta. Públicas: cadastro e "esqueceu a senha" (código de recuperação). Logadas: novo código, exclusão e exportação.
import { Router } from "express";
import { limitarPorOrigem } from "../../lib/limite.js";
import { usuarioDe } from "../../middleware/auth.js";
import { cadastroSchema, exclusaoSchema, recuperarSchema, senhaAtualSchema } from "./conta.schemas.js";
import * as service from "./conta.service.js";

export const contaPublicaRouter = Router();
export const contaRouter = Router();

contaPublicaRouter.post("/cadastro", limitarPorOrigem("cadastro", 10), async (req, res) => {
  res.status(201).json(await service.cadastrar(cadastroSchema.parse(req.body)));
});

contaPublicaRouter.post("/senha/recuperar", limitarPorOrigem("recuperar", 10), async (req, res) => {
  const { nickname, codigo, senha } = recuperarSchema.parse(req.body);
  res.json(await service.recuperarSenha(nickname, codigo, senha));
});

contaRouter.post("/me/codigo-recuperacao", limitarPorOrigem("codigo", 10), async (req, res) => {
  const { senha } = senhaAtualSchema.parse(req.body);
  res.json(await service.gerarCodigo(usuarioDe(req).id, senha));
});

contaRouter.post("/me/exclusao", limitarPorOrigem("exclusao", 10), async (req, res) => {
  const { senha, confirmacao } = exclusaoSchema.parse(req.body);
  await service.pedirExclusao(usuarioDe(req).id, senha, confirmacao);
  res.json({ excluida: true });
});

/** Download de todos os dados da conta (portabilidade). */
contaRouter.get("/me/exportacao", limitarPorOrigem("exportacao", 20), async (req, res) => {
  const dados = await service.exportarDados(usuarioDe(req).id);
  res.setHeader("Content-Disposition", 'attachment; filename="one-take-meus-dados.json"');
  res.json(dados);
});
