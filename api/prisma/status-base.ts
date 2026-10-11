// Status fixos do sistema (proposta inicial; nomes e efeitos podem ser ajustados pelo designer aqui).
// Efeitos são só informativos: a ficha mostra o alerta, o sistema não altera números.
import type { GatilhoStatus, TipoStatus } from "../src/generated/prisma/enums.js";

type StatusBase = {
  id: string;
  nome: string;
  descricao: string;
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
    descricao: "A vida chegou a 0.",
    efeito: "O personagem morreu e não pode mais agir nesta aventura.",
  },
  {
    id: id(2), ordem: 2, tipo: "DEBUFF", gatilho: "MANA_ZERO", nome: "Sem energia vital",
    descricao: "A mana, a energia vital do personagem, chegou a 0.",
    efeito: "O personagem morreu: sem energia vital não há vida.",
  },
  {
    id: id(3), ordem: 3, tipo: "DEBUFF", gatilho: "ESFORCO_ZERO", nome: "Cansado",
    descricao: "O esforço chegou a 0.",
    efeito: "-10 no total dos dados em testes de Capacidade física.",
  },
  // Aplicados pelo mestre durante a sessão.
  {
    id: id(4), ordem: 10, tipo: "DEBUFF", gatilho: null, nome: "Assustado",
    descricao: "O medo tomou conta do personagem.",
    efeito: "-5 no total dos dados em testes de Carisma; não se aproxima da fonte do medo.",
  },
  {
    id: id(5), ordem: 11, tipo: "MISTO", gatilho: null, nome: "Furioso",
    descricao: "A raiva fala mais alto.",
    efeito: "+5 no total dos dados em testes de Capacidade física; -5 em testes de Conhecimento.",
  },
  {
    id: id(6), ordem: 12, tipo: "BUFF", gatilho: null, nome: "Inspirado",
    descricao: "Um momento de coragem ou clareza.",
    efeito: "+5 no total dos dados no próximo teste.",
  },
  {
    id: id(7), ordem: 13, tipo: "BUFF", gatilho: null, nome: "Confiante",
    descricao: "O personagem acredita em si.",
    efeito: "+5 no total dos dados em testes de Carisma.",
  },
  {
    id: id(8), ordem: 14, tipo: "DEBUFF", gatilho: null, nome: "Envenenado",
    descricao: "Um veneno corre pelo corpo.",
    efeito: "Perde 1 de vida no início de cada turno até ser curado.",
  },
  {
    id: id(9), ordem: 15, tipo: "DEBUFF", gatilho: null, nome: "Atordoado",
    descricao: "Golpeado, ofuscado ou confuso.",
    efeito: "Perde o próximo turno.",
  },
  // Regras padrão de combate (o mestre pode desligar no grupo).
  {
    id: id(10), ordem: 20, tipo: "DEBUFF", gatilho: null, nome: "Contido (leve)",
    descricao: "Domínio de combate com resultado até 5: o alvo está pressionado.",
    efeito: "-5 nas rolagens de Capacidade física por 1 turno.",
  },
  {
    id: id(11), ordem: 21, tipo: "DEBUFF", gatilho: null, nome: "Contido (moderado)",
    descricao: "Domínio de combate com resultado de 6 a 10.",
    efeito: "-10 nas rolagens de Capacidade física por 1 turno.",
  },
  {
    id: id(12), ordem: 22, tipo: "DEBUFF", gatilho: null, nome: "Contido (forte)",
    descricao: "Domínio de combate com resultado de 11 a 20.",
    efeito: "-15 nas rolagens de Capacidade física por 1 turno.",
  },
  {
    id: id(13), ordem: 23, tipo: "DEBUFF", gatilho: null, nome: "Imobilizado",
    descricao: "Domínio de combate com resultado acima de 20: o alvo está contido.",
    efeito: "Perde o turno por completo. Não é paralisia nem desmaio: ações ofensivas ou táticas ficam inviáveis.",
  },
  {
    id: id(14), ordem: 24, tipo: "BUFF", gatilho: null, nome: "Em cobertura",
    descricao: "Protegido por uma cobertura, pequena ou grande.",
    efeito: "+5 nas perícias defensivas (somado ao que a ficha já tem).",
  },
  {
    id: id(15), ordem: 25, tipo: "BUFF", gatilho: null, nome: "Em posição elevada",
    descricao: "Em terreno mais alto que os alvos.",
    efeito: "+5 em Pontaria (somado ao que a ficha já tem).",
  },
];
