// Limite de uso das cartas: quantas vezes por combate ou por sessão (lista fixa). Fonte única do texto mostrado.
import type { LimiteUso } from "../generated/prisma/enums.js";

export const ROTULO_LIMITE: Record<LimiteUso, string> = { COMBATE: "combate", SESSAO: "sessão" };

/** "1 vez por combate", "2 vezes por sessão"; null = sem limite. */
export function rotuloLimite(usos: number | null | undefined, por: LimiteUso | null | undefined) {
  if (!usos || !por) return null;
  return `${usos} ${usos === 1 ? "vez" : "vezes"} por ${ROTULO_LIMITE[por]}`;
}
