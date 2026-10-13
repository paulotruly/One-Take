// Limite de tentativas por origem (IP), em memória. Vale por instância da API e zera ao reiniciar:
// é uma proteção contra abuso, não um contador exato. O limite por conta fica no banco (tokens criados).
import type { RequestHandler } from "express";
import { AppError } from "./errors.js";

const janelas = new Map<string, number[]>();

/** true se ainda cabe mais uma tentativa nesta janela (e já conta esta). */
export function cabeTentativa(chave: string, maximo: number, janelaMs: number, agora = Date.now()) {
  const recentes = (janelas.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  if (recentes.length >= maximo) {
    janelas.set(chave, recentes);
    return false;
  }
  recentes.push(agora);
  janelas.set(chave, recentes);
  if (janelas.size > 10_000) limparAntigas(agora, janelaMs);
  return true;
}

function limparAntigas(agora: number, janelaMs: number) {
  for (const [chave, tempos] of janelas) if (tempos.every((t) => agora - t >= janelaMs)) janelas.delete(chave);
}

/** Usado nos testes. */
export function zerarLimites() {
  janelas.clear();
}

/** Middleware: no máximo `maximo` requisições por IP na janela, por nome de ação. */
export function limitarPorOrigem(acao: string, maximo: number, janelaMs = 60 * 60_000): RequestHandler {
  return (req, _res, next) => {
    if (!cabeTentativa(`${acao}:${req.ip ?? "?"}`, maximo, janelaMs)) {
      throw new AppError(429, "MUITAS_TENTATIVAS", "Muitas tentativas. Espere um pouco e tente de novo.");
    }
    next();
  };
}
