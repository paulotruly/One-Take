// Regras PADRÃO de combate e fluxo do One-Take (sistema unificado).
// Diferente das regras fixas (ficha, d20, progressão…), estas o mestre pode desligar por grupo e trocar por regras próprias.
// O texto completo de cada uma fica na documentação (/docs/<slug>).

export const REGRAS_PADRAO = [
  { slug: "combate-grid-turno", titulo: "Grid e turno", resumo: "O jogo é movido por grid. Em combate, cada turno é 1 movimento + 1 ação." },
  { slug: "combate-alcance", titulo: "Alcance e posicionamento", resumo: "Deslocamento pela raça; teste de Capacidade física + Atletismo para andar mais, gastando o turno. Corpo a corpo ataca a 1–3 quadrados." },
  { slug: "combate-dominio", titulo: "Domínio de combate", resumo: "Segurar, prender ou pressionar o alvo: conforme o dado, -5, -10 ou -15 em Capacidade física por 1 turno, ou perda do turno." },
  { slug: "combate-intervencao", titulo: "Intervenção defensiva", resumo: "Capacidade física + Iniciativa maior que o ataque: o personagem defende o aliado. 1 por turno." },
  { slug: "combate-vantagem", titulo: "Vantagem tática por posicionamento", resumo: "Cobertura: +5 em perícias defensivas. Terreno elevado: +5 em pontaria." },
  { slug: "combate-egide", titulo: "Égide de presença (escudos)", resumo: "Escudo corpóreo depende da posição; escudo conjurado tem pontos de integridade que absorvem o dano primeiro." },
  { slug: "combate-movimento-velado", titulo: "Movimento velado", resumo: "Furtividade no movimento contra Percepção/Intuição do alvo; se vencer, o alvo tem -10 na defesa contra o próximo ataque." },
  { slug: "combate-ataque-grupo", titulo: "Ataques em grupo", resumo: "Ataque + dano de vários participantes podem ser somados." },
] as const;

export type SlugRegraPadrao = (typeof REGRAS_PADRAO)[number]["slug"];
export const SLUGS_REGRAS_PADRAO = REGRAS_PADRAO.map((r) => r.slug) as readonly string[];

/** Regras padrão que valem num grupo (todas menos as desligadas pelo mestre). */
export function regrasPadraoAtivas(desativadas: string[]) {
  const fora = new Set(desativadas);
  return REGRAS_PADRAO.filter((r) => !fora.has(r.slug));
}
