// Regras PADRÃO de combate e fluxo do One-Take (sistema unificado). Fonte única do texto: a documentação (/docs/combate-padrao),
// a página do grupo e a ficha mostram daqui.
// Diferente das regras fixas (ficha, d20, ataque x defesa, progressão…), estas o mestre pode desligar por grupo e trocar por regras próprias.
// Domínio de combate e Égide de presença saíram em 2026-10-14: status e cartas (ex.: escudos do Paladino) já fazem esse papel.

export const REGRAS_PADRAO = [
  {
    slug: "combate-grid-turno",
    titulo: "Grid, iniciativa e turno",
    resumo: "Grid físico na mesa. A Iniciativa define a ordem; cada turno é 1 movimento + 1 ação, sem trocar um pelo outro.",
    texto: [
      "O jogo é movido por um grid físico, na mesa: o app não guarda posições.",
      "No início do combate, cada participante faz um teste de Capacidade física + Iniciativa. O maior total age primeiro, e a ordem segue assim até o fim do combate.",
      "No seu turno, o personagem tem 1 movimento e 1 ação. Movimento é andar. Tudo o que não é movimento é ação: atacar, usar uma carta, usar um item, interagir com algo. Não dá para trocar o movimento por uma segunda ação, nem o contrário.",
      "Cartas só são usadas no próprio turno. A exceção são as reações: cartas que dizem \"Reação\", a Intervenção defensiva e o ataque de oportunidade, usadas fora do turno (1 reação por rodada).",
    ],
  },
  {
    slug: "combate-alcance",
    titulo: "Alcance e posicionamento",
    resumo: "Movimento até o deslocamento da raça; teste de Atletismo para andar mais usa o movimento. Corpo a corpo alcança 1 a 3 quadrados.",
    texto: [
      "Com o movimento, o personagem anda até o deslocamento da raça, em quadrados do grid.",
      "Para andar mais que isso, faz um teste de Capacidade física + Atletismo. O teste usa o movimento do turno; a ação continua livre. O mestre diz quanto a mais o personagem anda, conforme o resultado.",
      "Ataques corpo a corpo alcançam alvos de 1 a 3 quadrados de distância.",
    ],
  },
  {
    slug: "combate-intervencao",
    titulo: "Intervenção defensiva",
    resumo: "Fora do próprio turno, um personagem defende o aliado atacado com Capacidade física + Iniciativa maior que o ataque. Gasta a reação.",
    texto: [
      "Quando um aliado é atacado, outro personagem pode intervir, mesmo no turno de outra pessoa.",
      "Quem intervém faz um teste de Capacidade física + Iniciativa. Se o total for maior que o total do ataque, ele defende o aliado e o ataque não acerta. Empate: o ataque passa.",
      "Intervir gasta a reação do personagem: 1 por rodada, junto com cartas de reação e o ataque de oportunidade.",
    ],
  },
  {
    slug: "combate-oportunidade",
    titulo: "Ataque de oportunidade",
    resumo: "Inimigo que sai andando do seu alcance corpo a corpo pode levar um ataque, gastando a sua reação.",
    texto: [
      "Quando um inimigo sai andando do alcance corpo a corpo de um personagem, esse personagem pode gastar a reação para atacá-lo uma vez, com uma carta de Dano corpo a corpo sem limite de uso.",
      "O ataque segue o ataque contra defesa normal. Movimentos de cartas que dizem \"sem provocar\" (ataques de oportunidade ou reações) não disparam o ataque.",
    ],
  },
  {
    slug: "combate-vantagem",
    titulo: "Vantagem tática por posicionamento",
    resumo: "Cobertura: +5 nas perícias de defesa (Reflexos, Resistência, Vontade). Terreno elevado: +5 em Pontaria.",
    texto: [
      "Cobertura (pequena ou grande): +5 nas perícias de defesa (as da categoria Defesa: Reflexos, Resistência e Vontade). É o status Em cobertura.",
      "Terreno elevado em relação ao alvo: +5 em Pontaria. É o status Em posição elevada.",
      "Os bônus somam ao que a ficha já tem.",
    ],
  },
  {
    slug: "combate-movimento-velado",
    titulo: "Movimento velado",
    resumo: "Furtividade no movimento contra Percepção/Intuição do alvo; se vencer, o alvo tem -10 na defesa contra o próximo ataque.",
    texto: [
      "O personagem pode se mover escondido: faz um teste de Furtividade contra a Percepção (alvo vê a área) ou a Intuição (fora do campo de visão) do alvo.",
      "Se vencer, o alvo tem -10 na defesa contra o próximo ataque desse personagem.",
    ],
  },
  {
    slug: "combate-ataque-grupo",
    titulo: "Ataques em grupo",
    resumo: "Vários personagens que acertam o mesmo alvo único somam o dano.",
    texto: [
      "Quando vários personagens atacam o mesmo alvo único e todos acertam, o dano de todos é somado e aplicado de uma vez.",
    ],
  },
] as const;

export type SlugRegraPadrao = (typeof REGRAS_PADRAO)[number]["slug"];
export const SLUGS_REGRAS_PADRAO = REGRAS_PADRAO.map((r) => r.slug) as readonly string[];

/** Regras padrão que valem num grupo (todas menos as desligadas pelo mestre; slugs antigos são ignorados). */
export function regrasPadraoAtivas(desativadas: string[]) {
  const fora = new Set(desativadas);
  return REGRAS_PADRAO.filter((r) => !fora.has(r.slug));
}
