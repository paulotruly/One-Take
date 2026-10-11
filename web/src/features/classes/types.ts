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
  /** Nulo = geral; id = exclusiva daquele grupo. */
  grupoExclusivoId?: string | null;
  /** Classe-conceito da qual esta é subclasse (opcional). */
  conceitoId?: string | null;
  conceito?: { id: string; titulo: string; descricao?: string } | null;
  fixa: boolean;
};

/** Classe-conceito: classe generalista que agrupa subclasses (o jogador escolhe a subclasse). */
export type Conceito = {
  id: string;
  titulo: string;
  descricao: string;
  subclasses: Pick<Classe, "id" | "titulo" | "grupo" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco">[];
};
export type ConceitoInput = { titulo: string; descricao: string };

/** A mesma carta muda a partir de um nível. Campos nulos = continuam como na carta. */
export type Aprimoramento = {
  id: string;
  habilidadeId: string;
  nivel: number;
  titulo: string | null;
  descricaoEfeito: string | null;
  condicao: string | null;
  limite: string | null;
  custoMana: number | null;
  statusId: string | null;
  status?: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO" } | null;
};
export type AprimoramentoInput = Omit<Aprimoramento, "id" | "habilidadeId" | "status">;

/** Carta da cartela (única) da classe. */
export type Habilidade = {
  id: string;
  classeId: string;
  titulo: string;
  descricao: string;
  condicao: string | null;
  /** Texto livre (ex.: "Dano", "Cura em área"). */
  tipoEfeito: string;
  descricaoEfeito: string;
  limite: string | null;
  nivelNecessario: number;
  /** 0 = não custa mana. */
  custoMana: number;
  /** Status que a carta ativa (opcional). */
  statusId: string | null;
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
> & { grupoExclusivoId: string | null; conceitoId: string | null };
export type HabilidadeInput = Omit<Habilidade, "id" | "classeId" | "ordem" | "status" | "aprimoramentos" | "aprimoradaNoNivel" | "proximoAprimoramento">;

export const GRUPOS: Grupo[] = ["COMBATENTE", "VANGUARDISTA", "SUPORTE"];
export const ROTULO_GRUPO: Record<Grupo, string> = {
  COMBATENTE: "Combatente",
  VANGUARDISTA: "Vanguardista",
  SUPORTE: "Suporte",
};
