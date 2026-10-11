// Perícias base e classes fixas do sistema. Conteúdo das classes é PROVISÓRIO.
// Idempotente: ids fixos; perícias base e classes são atualizadas; habilidades e perícias das classes recriadas.
import "dotenv/config";
import { criarPrisma } from "../src/lib/prisma.js";
import { ATRIBUTOS_FIXOS, PERICIAS_BASE, periciaBase } from "./pericias-base.js";
import { STATUS_BASE } from "./status-base.js";
import type { GrupoClasse } from "../src/generated/prisma/enums.js";

type CartaSeed = {
  titulo: string;
  descricao: string;
  condicao?: string;
  tipoEfeito: string;
  descricaoEfeito: string;
  limite?: string;
  nivelNecessario?: number;
  custoMana?: number;
};

type ClasseSeed = {
  id: string;
  grupo: GrupoClasse;
  titulo: string;
  descricao: string;
  pontosVida: number;
  pontosMana: number;
  pontosEsforco: number;
  habilidades: CartaSeed[];
  /** Nome da perícia base: modificador da classe. */
  pericias: Record<string, number>;
};

// Coerência por grupo: Vanguardista tem mais vida, Suporte mais mana, Combatente mais esforço.
const classes: ClasseSeed[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    grupo: "COMBATENTE",
    titulo: "Lâmina Rubra",
    descricao: "Duelista ágil que vence lutas pela pressão constante.",
    pontosVida: 30,
    pontosMana: 10,
    pontosEsforco: 20,
    habilidades: [
      {
        titulo: "Corte Rápido",
        descricao: "Um golpe veloz antes que o inimigo reaja.",
        tipoEfeito: "Dano",
        descricaoEfeito: "Causa dano leve a um inimigo adjacente.",
      },
      {
        titulo: "Postura de Duelo",
        descricao: "Foca em um único oponente.",
        tipoEfeito: "Buff",
        descricaoEfeito: "Recebe vantagem no próximo ataque contra o alvo escolhido.",
        limite: "Apenas em combate",
      },
      {
        titulo: "Tempestade de Aço",
        custoMana: 4,
        descricao: "Uma sequência devastadora de cortes.",
        condicao: "Ter acertado dois ataques seguidos",
        tipoEfeito: "Dano",
        descricaoEfeito: "Causa dano pesado a todos os inimigos adjacentes.",
        limite: "1 vez por sessão",
        nivelNecessario: 3,
      },
    ],
    pericias: { Luta: 2, Acrobacia: 2, Iniciativa: 1, Intimidação: 1 },
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    grupo: "VANGUARDISTA",
    titulo: "Bastião",
    descricao: "Muralha viva que protege o grupo na linha de frente.",
    pontosVida: 40,
    pontosMana: 5,
    pontosEsforco: 15,
    habilidades: [
      {
        titulo: "Provocar",
        descricao: "Chama a atenção dos inimigos.",
        tipoEfeito: "Debuff",
        descricaoEfeito: "Inimigos próximos devem atacar o Bastião na próxima rodada.",
      },
      {
        titulo: "Escudo Erguido",
        descricao: "Ergue o escudo para cobrir um aliado.",
        tipoEfeito: "Suporte",
        descricaoEfeito: "Reduz o dano recebido por um aliado adjacente nesta rodada.",
        limite: "Apenas em combate",
      },
      {
        titulo: "Fortaleza Inabalável",
        custoMana: 3,
        descricao: "Nada passa por aqui.",
        condicao: "Estar com menos da metade dos pontos de vida",
        tipoEfeito: "Buff",
        descricaoEfeito: "Ignora todo dano até o início do próximo turno.",
        limite: "1 vez por sessão",
        nivelNecessario: 2,
      },
    ],
    pericias: { Atletismo: 2, Resistência: 3, Reflexos: 1, Vontade: 1 },
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    grupo: "SUPORTE",
    titulo: "Tecelã de Luz",
    descricao: "Conjuradora que cura aliados e enfraquece inimigos.",
    pontosVida: 20,
    pontosMana: 30,
    pontosEsforco: 10,
    habilidades: [
      {
        titulo: "Toque Restaurador",
        custoMana: 5,
        descricao: "Luz suave que fecha ferimentos.",
        tipoEfeito: "Suporte",
        descricaoEfeito: "Recupera uma quantidade moderada de vida de um aliado.",
      },
      {
        titulo: "Ofuscar",
        custoMana: 3,
        descricao: "Um clarão nos olhos do inimigo.",
        tipoEfeito: "Debuff",
        descricaoEfeito: "O alvo tem desvantagem no próximo ataque.",
      },
      {
        titulo: "Aurora",
        custoMana: 12,
        descricao: "Uma explosão de luz que renova o grupo.",
        condicao: "Um aliado ter caído nesta cena",
        tipoEfeito: "Suporte",
        descricaoEfeito: "Levanta um aliado caído e cura todos os aliados próximos.",
        limite: "1 vez por sessão",
        nivelNecessario: 3,
      },
    ],
    pericias: { Domínio: 3, Religião: 2, Diplomacia: 1, Percepção: 1 },
  },
];

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DIRECT_URL ou DATABASE_URL");
  const prisma = criarPrisma(url);

  for (const { id, ...dados } of Object.values(ATRIBUTOS_FIXOS)) {
    await prisma.atributo.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${Object.keys(ATRIBUTOS_FIXOS).length} atributos fixos`);

  for (const { id, ...dados } of STATUS_BASE) {
    await prisma.status.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${STATUS_BASE.length} status fixos`);

  for (const { id, ...dados } of PERICIAS_BASE) {
    await prisma.pericia.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${PERICIAS_BASE.length} perícias base`);

  for (const c of classes) {
    const dados = {
      grupo: c.grupo,
      titulo: c.titulo,
      descricao: c.descricao,
      pontosVida: c.pontosVida,
      pontosMana: c.pontosMana,
      pontosEsforco: c.pontosEsforco,
      donoId: null,
    };
    await prisma.$transaction(async (tx) => {
      await tx.classe.upsert({ where: { id: c.id }, create: { id: c.id, ...dados }, update: dados });
      await tx.habilidade.deleteMany({ where: { classeId: c.id } });
      await tx.classePericia.deleteMany({ where: { classeId: c.id } });
      await tx.habilidade.createMany({ data: c.habilidades.map((h, i) => ({ ...h, classeId: c.id, ordem: i })) });
      await tx.classePericia.createMany({
        data: Object.entries(c.pericias).map(([nome, modificador]) => ({ classeId: c.id, periciaId: periciaBase(nome), modificador })),
      });
    });
    console.log(`ok: ${c.titulo}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
