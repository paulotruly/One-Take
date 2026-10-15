// Limite de fichas por função da classe no grupo (Combatente, Vanguardista, Suporte). Nulo = sem limite; 0 = ninguém da função.
import type { GrupoClasse } from "../../generated/prisma/client.js";

export type LimitesPorFuncao = { limiteCombatentes: number | null; limiteVanguardistas: number | null; limiteSuportes: number | null };

export const CAMPO_DO_LIMITE = {
  COMBATENTE: "limiteCombatentes",
  VANGUARDISTA: "limiteVanguardistas",
  SUPORTE: "limiteSuportes",
} as const satisfies Record<GrupoClasse, keyof LimitesPorFuncao>;

export const ROTULO_FUNCAO: Record<GrupoClasse, { singular: string; plural: string }> = {
  COMBATENTE: { singular: "Combatente", plural: "Combatentes" },
  VANGUARDISTA: { singular: "Vanguardista", plural: "Vanguardistas" },
  SUPORTE: { singular: "Suporte", plural: "Suportes" },
};

/** Quantas fichas o grupo tem de cada função. */
export function contarPorFuncao(fichas: { classe: { grupo: GrupoClasse } }[]) {
  const c: Record<GrupoClasse, number> = { COMBATENTE: 0, VANGUARDISTA: 0, SUPORTE: 0 };
  for (const f of fichas) c[f.classe.grupo] += 1;
  return c;
}

/** true se a função já chegou ao limite do grupo (não cabe mais uma ficha dela). */
export function funcaoCheia(limites: LimitesPorFuncao, contagem: Record<GrupoClasse, number>, funcao: GrupoClasse) {
  const limite = limites[CAMPO_DO_LIMITE[funcao]];
  return limite != null && contagem[funcao] >= limite;
}

/** Mensagem para o jogador quando a função está cheia. */
export function mensagemFuncaoCheia(limites: LimitesPorFuncao, funcao: GrupoClasse) {
  const limite = limites[CAMPO_DO_LIMITE[funcao]];
  const r = ROTULO_FUNCAO[funcao];
  return limite === 0
    ? `Este grupo não aceita classes da função ${r.singular}.`
    : `Este grupo aceita no máximo ${limite} ${limite === 1 ? `${r.singular}, e a vaga já foi ocupada` : `${r.plural}, e as vagas já foram ocupadas`}.`;
}
