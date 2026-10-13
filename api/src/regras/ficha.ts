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

/** Espaços ocupados no inventário: cada item ocupa os espaços dele (mínimo 1). */
export function espacosUsados(itens: { espacos: number }[]) {
  return itens.reduce((t, i) => t + Math.max(1, i.espacos), 0);
}

type Requisitos = { requisitoClasseId: string | null; requisitoPericiaId: string | null; requisito?: string | null };
type QuemUsa = { classeId: string; /** ids das perícias em que o personagem tem total > 0 */ pericias: Set<string> };

/**
 * Se o personagem sabe usar o item. Pré-requisitos de classe e de perícia são conferidos;
 * o requisito em texto é só informativo (o mestre decide na mesa).
 * Devolve null se pode usar, ou o motivo.
 */
export function motivoParaNaoUsar(item: Requisitos & { requisitoClasse?: { titulo: string } | null; requisitoPericia?: { nome: string } | null }, quem: QuemUsa) {
  if (item.requisitoClasseId && item.requisitoClasseId !== quem.classeId) {
    return `Só a classe ${item.requisitoClasse?.titulo ?? "exigida"} sabe usar.`;
  }
  if (item.requisitoPericiaId && !quem.pericias.has(item.requisitoPericiaId)) {
    return `Precisa ter a perícia ${item.requisitoPericia?.nome ?? "exigida"}.`;
  }
  return null;
}
