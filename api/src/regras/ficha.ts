// Regras de ficha do One-Take (fonte única; ver também progressao.ts).
import { PROGRESSAO } from "./progressao.js";

export const FICHA = {
  /** Pontos de atributo ao criar a ficha. Cada ponto = 1 d20 nos testes daquele atributo (usa o maior resultado). */
  pontosAtributoIniciais: 3,
  /** Espaços de inventário no nível inicial. */
  inventarioInicial: 5,
  /** Espaços de inventário ganhos a cada nível acima do inicial. */
  inventarioPorNivel: 2,
} as const;

/** Espaços de inventário no nível dado. */
export function capacidadeInventario(nivel: number) {
  return FICHA.inventarioInicial + Math.max(0, nivel - PROGRESSAO.nivelInicial) * FICHA.inventarioPorNivel;
}
