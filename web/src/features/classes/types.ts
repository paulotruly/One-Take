import type { Visao } from "../verificados/types";
import { Anchor, HandHelping, HeartPulse, Ghost, Shield, Swords, TrendingDown, TrendingUp, Wind, Wrench, type LucideIcon } from "lucide-react";
import type { PericiaDaClasse } from "../pericias/types";

// Tipos espelhando as respostas da API (ver docs/API.md) e rótulos de exibição.

export type Grupo = "COMBATENTE" | "VANGUARDISTA" | "SUPORTE";

export type Classe = {
  id: string;
  grupo: Grupo;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  pontosVida: number;
  pontosMana: number;
  pontosEsforco: number;
  donoId: string | null;
  origemId: string | null;
  /** Kits de RPG em que a classe está (vazio = geral). */
  kitIds?: string[];
  /** Arquétipo do qual esta é subclasse (opcional). */
  conceitoId?: string | null;
  conceito?: { id: string; titulo: string; descricao?: string } | null;
  /** Para quem vê: pode editar (é dele). */
  editavel?: boolean;
  /** Selo verificado: todo mestre vê e usa. */
  verificado?: boolean;
  /** Verificado de outra pessoa: só leitura, dá para duplicar. */
  deOutro?: boolean;
  /** Quem vê é ADMIN e dono: pode pôr ou tirar o selo. */
  podeVerificar?: boolean;
  /** Selo marcado nesta coisa (sem contar o do kit). */
  seloProprio?: boolean;
  /** Verificado por estar num kit verificado. */
  verificadoPorKit?: boolean;
};

/** Arquétipo: classe generalista que agrupa subclasses (o jogador escolhe a subclasse). */
export type Conceito = Visao & {
  id: string;
  titulo: string;
  descricao: string;
  subclasses: Pick<Classe, "id" | "titulo" | "grupo" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco">[];
};
export type ConceitoInput = { titulo: string; descricao: string };

/** A carta inteira a partir de um nível (versão completa; nulo = sem condição, sem limite, sem status). */
export type Aprimoramento = {
  id: string;
  habilidadeId: string;
  nivel: number;
  titulo: string;
  descricao: string;
  descricaoEfeito: string;
  condicao: string | null;
  limiteUsos: number | null;
  limitePor: LimiteUso | null;
  custoMana: number;
  statusId: string | null;
  status?: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO" } | null;
};
export type AprimoramentoInput = Omit<Aprimoramento, "id" | "habilidadeId" | "status">;

/** Tipo de efeito de uma carta: lista fixa do sistema (espelha o enum da API). */
export type TipoEfeito =
  | "DANO"
  | "DEFESA"
  | "CURA"
  | "SUPORTE"
  | "FORTALECIMENTO"
  | "ENFRAQUECIMENTO"
  | "CONTROLE"
  | "MOBILIDADE"
  | "INVOCACAO"
  | "UTILIDADE";

export const TIPOS_EFEITO: Record<TipoEfeito, { rotulo: string; descricao: string; Icone: LucideIcon }> = {
  DANO: { rotulo: "Dano", descricao: "Tira vida do alvo.", Icone: Swords },
  DEFESA: { rotulo: "Defesa", descricao: "Evita, reduz ou anula dano recebido.", Icone: Shield },
  CURA: { rotulo: "Cura", descricao: "Devolve vida (ou outro recurso) a quem recebe.", Icone: HeartPulse },
  SUPORTE: { rotulo: "Suporte", descricao: "Ajuda aliados sem curar: protege, reposiciona, dá ações.", Icone: HandHelping },
  FORTALECIMENTO: { rotulo: "Fortalecimento", descricao: "Melhora alguém por um tempo (bônus, vantagem).", Icone: TrendingUp },
  ENFRAQUECIMENTO: { rotulo: "Enfraquecimento", descricao: "Piora o alvo por um tempo (penalidade, desvantagem).", Icone: TrendingDown },
  CONTROLE: { rotulo: "Controle", descricao: "Prende, derruba, atordoa ou força o alvo a agir.", Icone: Anchor },
  MOBILIDADE: { rotulo: "Mobilidade", descricao: "Movimento extra: avanço, salto, recuo, teleporte.", Icone: Wind },
  INVOCACAO: { rotulo: "Invocação", descricao: "Traz criaturas, objetos ou espíritos para a cena.", Icone: Ghost },
  UTILIDADE: { rotulo: "Utilidade", descricao: "Fora de combate ou efeitos que não se encaixam nos outros.", Icone: Wrench },
};
export const LISTA_TIPOS_EFEITO = Object.keys(TIPOS_EFEITO) as TipoEfeito[];

/** Carta da cartela de uma classe ou de uma besta. */
export type Habilidade = {
  id: string;
  classeId: string | null;
  bestaId?: string | null;
  titulo: string;
  descricao: string;
  condicao: string | null;
  tipoEfeito: TipoEfeito;
  descricaoEfeito: string;
  /** Limite de uso: N vezes por combate ou por sessão. Os dois nulos = sem limite. */
  limiteUsos: number | null;
  limitePor: LimiteUso | null;
  nivelNecessario: number;
  /** 0 = não custa mana. */
  custoMana: number;
  /** Status que a carta ativa (opcional). */
  statusId: string | null;
  /** Perícia que o personagem testa para usar a carta (opcional). */
  periciaId: string | null;
  pericia?: { id: string; nome: string; atributo: { id: string; nome: string } } | null;
  /** Perícias que o alvo pode usar para se defender da carta (opcional). Nas respostas vêm em `periciasDefesa`. */
  periciasDefesaIds?: string[];
  periciasDefesa?: { periciaId: string; pericia: { id: string; nome: string; atributo: { id: string; nome: string } } }[];
  /** Na ficha (personagem, NPC ou criatura): o teste pronto para usar a carta. */
  teste?: { pericia: string; atributo: string; teste: string } | null;
  status?: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO" } | null;
  aprimoramentos?: Aprimoramento[];
  /** Na ficha: a partir de que nível vale a versão mostrada (null = carta original). */
  aprimoradaNoNivel?: number | null;
  /** Na ficha: próximo nível em que a carta muda. */
  proximoAprimoramento?: number | null;
  ordem: number;
};

export type ClasseDetalhe = Classe & { habilidades: Habilidade[]; pericias: PericiaDaClasse[] };

/** Prévia de progressão calculada pela API (regras em api/src/regras/progressao.ts). */
export type Progressao = {
  ganhoPorNivel: { pontosVida: number; pontosMana: number; pontosEsforco: number; pontosPericia: number };
  niveis: {
    nivel: number;
    pontosVida: number;
    pontosMana: number;
    pontosEsforco: number;
    /** Pontos de perícia ganhos até este nível. */
    pontosPericia: number;
    habilidades: string[];
    novasHabilidades: string[];
    /** Cartas que mudam neste nível. */
    aprimoradas: string[];
  }[];
};

// Corpos enviados à API
export type ClasseInput = Pick<
  Classe,
  "grupo" | "titulo" | "descricao" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco"
> & { kitIds: string[]; conceitoId: string | null };
export type HabilidadeInput = Omit<Habilidade, "id" | "classeId" | "bestaId" | "ordem" | "status" | "pericia" | "periciasDefesa" | "teste" | "aprimoramentos" | "aprimoradaNoNivel" | "proximoAprimoramento">;

export const GRUPOS: Grupo[] = ["COMBATENTE", "VANGUARDISTA", "SUPORTE"];
export const ROTULO_GRUPO: Record<Grupo, string> = {
  COMBATENTE: "Combatente",
  VANGUARDISTA: "Vanguardista",
  SUPORTE: "Suporte",
};

/** Período do limite de uso de uma carta (lista fixa, espelha o enum da API). */
export type LimiteUso = "COMBATE" | "SESSAO";
export const ROTULO_LIMITE: Record<LimiteUso, string> = { COMBATE: "combate", SESSAO: "sessão" };

/** "1 vez por combate", "2 vezes por sessão"; null = sem limite. */
export function rotuloLimite(usos: number | null | undefined, por: LimiteUso | null | undefined) {
  if (!usos || !por) return null;
  return `${usos} ${usos === 1 ? "vez" : "vezes"} por ${ROTULO_LIMITE[por]}`;
}
