// Defesa do alvo: qual perícia o alvo usa contra a perícia do teste de uma carta, conforme a situação.
// Pelas perícias base (o catálogo do mestre liga a cópia à base por `origemId`). O formulário da carta marca as defesas
// sozinho a partir daqui; o mestre ainda pode marcar ou desmarcar à mão.

/** Ids das perícias base (os mesmos de prisma/pericias-base.ts; o teste confere). */
export const BASE = {
  Furtividade: "00000000-0000-4000-8001-000000000004",
  Luta: "00000000-0000-4000-8001-000000000005",
  Pontaria: "00000000-0000-4000-8001-000000000006",
  Reflexos: "00000000-0000-4000-8001-000000000007",
  Resistência: "00000000-0000-4000-8001-000000000008",
  Intuição: "00000000-0000-4000-8001-000000000012",
  Percepção: "00000000-0000-4000-8001-000000000013",
  Vontade: "00000000-0000-4000-8001-000000000014",
  Domínio: "00000000-0000-4000-8001-000000000018",
} as const;
type Nome = keyof typeof BASE;

type Par = { ataque: Nome; defesa: Nome; quando: string };

const PARES: Par[] = [
  { ataque: "Furtividade", defesa: "Intuição", quando: "Alvo em flanco, fora do campo de visão ou em ponto cego" },
  { ataque: "Furtividade", defesa: "Percepção", quando: "Alvo dentro do campo de visão" },
  { ataque: "Luta", defesa: "Reflexos", quando: "Chance clara de esquiva" },
  { ataque: "Luta", defesa: "Resistência", quando: "Sem possibilidade de desvio" },
  { ataque: "Pontaria", defesa: "Reflexos", quando: "Ataques à distância permitem esquiva" },
  { ataque: "Domínio", defesa: "Reflexos", quando: "Ataques projéteis" },
  { ataque: "Domínio", defesa: "Resistência", quando: "Ataques diretos, sem esquiva" },
  { ataque: "Domínio", defesa: "Vontade", quando: "Ataque mental ou telepático" },
];

export type Defesa = { ataque: { id: string; nome: string }; defesa: { id: string; nome: string }; quando: string };

export const DEFESAS: Defesa[] = PARES.map((p) => ({
  ataque: { id: BASE[p.ataque], nome: p.ataque },
  defesa: { id: BASE[p.defesa], nome: p.defesa },
  quando: p.quando,
}));

/** Defesas possíveis contra a perícia base `ataqueId` (vazio se ela não tem defesa definida). */
export function defesasContra(ataqueId: string) {
  return DEFESAS.filter((d) => d.ataque.id === ataqueId);
}
