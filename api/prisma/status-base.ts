// Status iniciais do seed (criados na conta ADMIN; depois disso, o dono edita pela interface).
// Efeitos são só informativos: a ficha mostra o alerta, o sistema não altera números.
import type { GatilhoStatus, TipoStatus } from "../src/generated/prisma/enums.js";

type StatusBase = {
  id: string;
  nome: string;
  efeito: string;
  tipo: TipoStatus;
  gatilho: GatilhoStatus | null;
  ordem: number;
};

const id = (n: number) => `00000000-0000-4000-8003-${String(n).padStart(12, "0")}`;

export const STATUS_BASE: StatusBase[] = [
  // Automáticos: ligados pelos recursos da ficha.
  {
    id: id(1), ordem: 1, tipo: "DEBUFF", gatilho: "VIDA_ZERO", nome: "Morto",
    efeito: "A vida chegou a 0. O personagem morreu e não pode mais agir nesta aventura.",
  },
  {
    id: id(2), ordem: 2, tipo: "DEBUFF", gatilho: "MANA_ZERO", nome: "Sem energia vital",
    efeito: "A mana, a energia vital do personagem, chegou a 0. O personagem morreu: sem energia vital não há vida.",
  },
  {
    id: id(3), ordem: 3, tipo: "DEBUFF", gatilho: "ESFORCO_ZERO", nome: "Cansado",
    efeito: "O esforço chegou a 0. -10 no total dos dados em testes de Capacidade física.",
  },
  // Aplicados pelo mestre durante a sessão.
  {
    id: id(4), ordem: 10, tipo: "DEBUFF", gatilho: null, nome: "Assustado",
    efeito: "O medo tomou conta do personagem. -5 no total dos dados em testes de Carisma; não se aproxima da fonte do medo.",
  },
  {
    id: id(5), ordem: 11, tipo: "MISTO", gatilho: null, nome: "Furioso",
    efeito: "A raiva fala mais alto. +5 no total dos dados em testes de Capacidade física; -5 em testes de Conhecimento.",
  },
  {
    id: id(6), ordem: 12, tipo: "BUFF", gatilho: null, nome: "Inspirado",
    efeito: "Um momento de coragem ou clareza. +5 no total dos dados no próximo teste.",
  },
  {
    id: id(7), ordem: 13, tipo: "BUFF", gatilho: null, nome: "Confiante",
    efeito: "O personagem acredita em si. +5 no total dos dados em testes de Carisma.",
  },
  {
    id: id(8), ordem: 14, tipo: "DEBUFF", gatilho: null, nome: "Envenenado",
    efeito: "Um veneno corre pelo corpo. Perde 1 de vida no início de cada turno até ser curado.",
  },
  {
    id: id(9), ordem: 15, tipo: "DEBUFF", gatilho: null, nome: "Atordoado",
    efeito: "Golpeado, ofuscado ou confuso. Perde o próximo turno.",
  },
  // Regras padrão de combate (o mestre pode desligar no grupo).
  {
    id: id(10), ordem: 20, tipo: "DEBUFF", gatilho: null, nome: "Contido (leve)",
    efeito: "Pressionado ou seguro de leve. -5 nas rolagens de Capacidade física.",
  },
  {
    id: id(11), ordem: 21, tipo: "DEBUFF", gatilho: null, nome: "Contido (moderado)",
    efeito: "Seguro com firmeza. -10 nas rolagens de Capacidade física.",
  },
  {
    id: id(12), ordem: 22, tipo: "DEBUFF", gatilho: null, nome: "Contido (forte)",
    efeito: "Quase imobilizado. -15 nas rolagens de Capacidade física.",
  },
  {
    id: id(13), ordem: 23, tipo: "DEBUFF", gatilho: null, nome: "Imobilizado",
    efeito: "Preso ou contido. Perde o turno por completo. Não é paralisia nem desmaio: ações ofensivas ou táticas ficam inviáveis.",
  },
  {
    id: id(14), ordem: 24, tipo: "BUFF", gatilho: null, nome: "Em cobertura",
    efeito: "Protegido por uma cobertura, pequena ou grande. +5 nas perícias de defesa: Reflexos, Resistência e Vontade (somado ao que a ficha já tem).",
  },
  {
    id: id(15), ordem: 25, tipo: "BUFF", gatilho: null, nome: "Em posição elevada",
    efeito: "Em terreno mais alto que os alvos. +5 em Pontaria (somado ao que a ficha já tem).",
  },
];
