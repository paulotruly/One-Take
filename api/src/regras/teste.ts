// Regras de TESTE (rolagem) do One-Take. FONTE ÚNICA: a documentação e a ficha usam isto.
//
// Como o mestre guia uma ação:
// 1. O mestre diz qual atributo + perícia a ação exige (ex.: Capacidade física + Atletismo) e a DT.
// 2. O jogador rola 1 d20 por ponto no atributo e fica com o MAIOR resultado.
// 3. Soma o bônus da perícia, se tiver (qualquer personagem testa qualquer perícia; sem ela, o bônus é 0).
// 4. Total >= DT = sucesso. A DT (faixa de sucesso e falha) é livre: o mestre define na hora.
// Atributo com 0 pontos: rola sempre 1 d20 e o resultado vale a METADE (arredondada para baixo).
// Esforço: cada ponto gasto antes da rolagem dá +1 d20 (2d20 vira 3d20), no máximo 1 ponto por rodada.
// Não vale com atributo 0 (ele rola "sempre apenas 1 dado"). A defesa também é um teste e também pode usar esforço.

export const TESTE = {
  /** Faces do dado de teste. */
  ladosDoDado: 20,
  /** Com 0 pontos no atributo o personagem rola esta quantidade de dados... */
  dadosComAtributoZero: 1,
  /** ...e o resultado é dividido por isto (arredondado para baixo). */
  divisorComAtributoZero: 2,
  /** Pontos de esforço gastos para ganhar 1 dado extra. */
  esforcoPorDadoExtra: 1,
  /** Se o esforço pode comprar dados quando o atributo tem 0 pontos. */
  esforcoComAtributoZero: false,
  /** Máximo de pontos de esforço gastos por rodada (decisão de 2026-10-14). */
  esforcoMaximoPorRodada: 1,
} as const;

/** Quantos d20 o personagem rola: pontos no atributo + dados comprados com esforço (no máximo o da rodada). */
export function dadosDoTeste(pontosAtributo: number, esforcoGasto = 0) {
  const esforco = Math.min(Math.max(0, esforcoGasto), TESTE.esforcoMaximoPorRodada);
  const extras = Math.floor(esforco / TESTE.esforcoPorDadoExtra);
  if (pontosAtributo <= 0) return TESTE.dadosComAtributoZero + (TESTE.esforcoComAtributoZero ? extras : 0);
  return pontosAtributo + extras;
}

/** Resultado de um teste já rolado: maior dado (metade se o atributo for 0) + bônus da perícia. */
export function resolverTeste({ rolagens, pontosAtributo, bonus = 0 }: { rolagens: number[]; pontosAtributo: number; bonus?: number }) {
  if (rolagens.length === 0) throw new Error("Nenhum dado rolado");
  const maior = Math.max(...rolagens);
  const base = pontosAtributo <= 0 ? Math.floor(maior / TESTE.divisorComAtributoZero) : maior;
  return { maior, base, total: base + bonus };
}

/** Chance (0..1) de o MAIOR de `n` d20 ser pelo menos `alvo`. */
function chanceMaiorAoMenos(n: number, alvo: number) {
  const L = TESTE.ladosDoDado;
  if (alvo <= 1) return 1;
  if (alvo > L) return 0;
  return 1 - ((alvo - 1) / L) ** n;
}

/** Chance (0..1) de o total do teste ser pelo menos a DT. */
export function chanceDeSucesso({ pontosAtributo, bonus = 0, dt, esforcoGasto = 0 }: { pontosAtributo: number; bonus?: number; dt: number; esforcoGasto?: number }) {
  const n = dadosDoTeste(pontosAtributo, esforcoGasto);
  const precisa = dt - bonus; // valor mínimo da base
  if (pontosAtributo > 0) return chanceMaiorAoMenos(n, precisa);
  // Atributo 0: base = floor(maior / 2) >= precisa  <=>  maior >= 2 * precisa.
  return chanceMaiorAoMenos(n, precisa * TESTE.divisorComAtributoZero);
}

/** Valor médio do total do teste (para balanceamento e para a documentação). */
export function mediaDoTeste({ pontosAtributo, bonus = 0, esforcoGasto = 0 }: { pontosAtributo: number; bonus?: number; esforcoGasto?: number }) {
  const n = dadosDoTeste(pontosAtributo, esforcoGasto);
  const L = TESTE.ladosDoDado;
  let media = 0;
  for (let v = 1; v <= L; v++) {
    const pExato = (v / L) ** n - ((v - 1) / L) ** n; // chance de o maior ser exatamente v
    media += pExato * (pontosAtributo <= 0 ? Math.floor(v / TESTE.divisorComAtributoZero) : v);
  }
  return media + bonus;
}

/** Como o teste aparece na ficha: "2d20 + 5" ou "1d20 ÷ 2 + 5". */
export function notacaoDoTeste(pontosAtributo: number, bonus = 0) {
  const n = dadosDoTeste(pontosAtributo);
  const dado = `${n}d${TESTE.ladosDoDado}${pontosAtributo <= 0 ? ` ÷ ${TESTE.divisorComAtributoZero}` : ""}`;
  if (bonus === 0) return dado;
  return `${dado} ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)}`;
}

/** Tabela de chances por DT (documentação): para 0 a `maxDados` pontos, sem bônus. */
export function tabelaDeChances(dts: number[], maxDados = 4) {
  return dts.map((dt) => ({
    dt,
    chances: Array.from({ length: maxDados + 1 }, (_, pontos) => ({ pontos, chance: chanceDeSucesso({ pontosAtributo: pontos, dt }) })),
  }));
}
