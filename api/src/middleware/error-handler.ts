import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/errors.js";

export function formatarZod(err: ZodError) {
  return err.issues.map((i) => ({ campo: i.path.join(".") || "(corpo)", mensagem: i.message }));
}

export const rotaNaoEncontrada: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: "ROTA_NAO_ENCONTRADA", message: "Rota não encontrada" } });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: "VALIDACAO", message: "Dados inválidos", details: formatarZod(err) } });
    return;
  }
  // Exclusão bloqueada por FK RESTRICT (ex.: classe/raça/perícia usada por fichas).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    res.status(409).json({ error: { code: "EM_USO", message: "Não é possível excluir: está sendo usado por fichas de personagens ou NPCs." } });
    return;
  }
  // JSON malformado no corpo (body-parser).
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "JSON_INVALIDO", message: "Corpo da requisição não é um JSON válido" } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "ERRO_INTERNO", message: "Erro interno do servidor" } });
};
