// Regras de progressão de nível do One-Take. FONTE ÚNICA: a prévia da classe usa isto hoje,
// e as fichas (futuras) devem usar as mesmas funções ao subir o nível de um personagem.
//
// Filosofia: one-shot dura 1 dia, então a progressão é rápida, simples e fixa.
// O personagem sobe 1 nível por participação, e só o mestre sobe o nível.

export const PROGRESSAO = {
  nivelInicial: 1,
  /** Nível mais alto do sistema (fichas, NPCs, criaturas e cartas). */
  nivelMaximo: 100,
  /** Ganho a cada nível acima do inicial. */
  ganhoPorNivel: {
    pontosVida: 5,
    pontosMana: 5,
    pontosEsforco: 5,
    /** Pontos de perícia: uma perícia nova com +5 OU +5 numa perícia que o personagem já tem (escolha na ficha). */
    pontosPericia: 5,
  },
  /** Quantos níveis a prévia mostra no mínimo (estende até a carta de maior nível). */
  niveisNaPrevia: 5,
} as const;

type Base = { pontosVida: number; pontosMana: number; pontosEsforco: number };
type ComNivel = { id: string; nivelNecessario: number; aprimoramentos?: { nivel: number }[] };

const subidas = (nivel: number) => Math.max(0, nivel - PROGRESSAO.nivelInicial);

/** Vida, mana e esforço máximos de um personagem da classe no nível dado. */
export function atributosNoNivel(base: Base, nivel: number) {
  const n = subidas(nivel);
  const g = PROGRESSAO.ganhoPorNivel;
  return {
    pontosVida: base.pontosVida + n * g.pontosVida,
    pontosMana: base.pontosMana + n * g.pontosMana,
    pontosEsforco: base.pontosEsforco + n * g.pontosEsforco,
  };
}

/** Pontos de perícia ganhos por subir de nível (acumulados até o nível dado). */
export function pontosPericiaGanhos(nivel: number) {
  return subidas(nivel) * PROGRESSAO.ganhoPorNivel.pontosPericia;
}

/** Cartas disponíveis no nível: todas com nível necessário ≤ nível (cumulativo). */
export function habilidadesNoNivel<T extends ComNivel>(habilidades: T[], nivel: number) {
  return habilidades.filter((h) => h.nivelNecessario <= nivel);
}

/** Prévia da progressão de uma classe, do nível inicial até o necessário para ver todas as cartas. */
export function previaProgressao(classe: Base & { habilidades: ComNivel[] }) {
  const maiorCarta = Math.max(
    PROGRESSAO.nivelInicial,
    ...classe.habilidades.flatMap((h) => [h.nivelNecessario, ...(h.aprimoramentos ?? []).map((a) => a.nivel)]),
  );
  const ultimo = Math.max(PROGRESSAO.niveisNaPrevia, maiorCarta);
  const niveis = [];
  for (let nivel: number = PROGRESSAO.nivelInicial; nivel <= ultimo; nivel++) {
    const disponiveis = habilidadesNoNivel(classe.habilidades, nivel);
    niveis.push({
      nivel,
      ...atributosNoNivel(classe, nivel),
      pontosPericia: pontosPericiaGanhos(nivel),
      habilidades: disponiveis.map((h) => h.id),
      novasHabilidades: disponiveis.filter((h) => h.nivelNecessario === nivel).map((h) => h.id),
      aprimoradas: disponiveis.filter((h) => h.aprimoramentos?.some((a) => a.nivel === nivel)).map((h) => h.id),
    });
  }
  return { ganhoPorNivel: PROGRESSAO.ganhoPorNivel, niveis };
}

type Aprimoramento = {
  nivel: number;
  titulo: string;
  descricao: string;
  descricaoEfeito: string;
  condicao: string | null;
  limiteUsos: number | null;
  limitePor: string | null;
  custoMana: number;
  statusId: string | null;
  status?: unknown;
};

/** Campos da carta que cada aprimoramento redefine (versão completa da carta naquele nível). */
const CAMPOS_DO_APRIMORAMENTO = ["titulo", "descricao", "descricaoEfeito", "condicao", "limiteUsos", "limitePor", "custoMana", "statusId", "status"] as const;

/**
 * A carta como ela fica no nível dado: vale a versão do aprimoramento de maior nível até esse nível (cada aprimoramento é a
 * carta inteira naquele nível; nulo = sem condição, sem limite ou sem status). Informa a partir de que nível a versão vale.
 */
export function aplicarAprimoramentos<T extends { nivelNecessario: number; aprimoramentos?: Aprimoramento[] }>(h: T, nivel: number) {
  const aprimoramentos: Aprimoramento[] = h.aprimoramentos ?? [];
  const vale = aprimoramentos.filter((a) => a.nivel <= nivel).sort((a, b) => a.nivel - b.nivel).at(-1);
  const carta: Record<string, unknown> = { ...h };
  if (vale) for (const campo of CAMPOS_DO_APRIMORAMENTO) carta[campo] = vale[campo] ?? null;
  const proximo = aprimoramentos.filter((a) => a.nivel > nivel).sort((a, b) => a.nivel - b.nivel)[0];
  return {
    ...(carta as T),
    aprimoradaNoNivel: vale?.nivel ?? null,
    proximoAprimoramento: proximo?.nivel ?? null,
  };
}
