// Perícias e atributos. Categorias são lista fixa do sistema (espelham o enum da API);
// atributos vêm da API (3 fixos + os criados pelo mestre).
import { BookOpen, Eye, Footprints, HandFist, MessageCircle, Shield, Sparkles, Target, type LucideIcon } from "lucide-react";

export type CategoriaPericia =
  | "CORPO_A_CORPO"
  | "MAGIA"
  | "PONTARIA"
  | "FISICO"
  | "DEFESA"
  | "SOCIAL"
  | "CONHECIMENTO"
  | "PERCEPCAO";

export const CATEGORIAS: Record<CategoriaPericia, { Icone: LucideIcon; rotulo: string; descricao: string }> = {
  CORPO_A_CORPO: { Icone: HandFist, rotulo: "Corpo a corpo", descricao: "Ataques e combate corpo a corpo" },
  MAGIA: { Icone: Sparkles, rotulo: "Magia", descricao: "Magias e ataques não físicos" },
  PONTARIA: { Icone: Target, rotulo: "Pontaria", descricao: "Pontaria e precisão pra acertar qualquer alvo" },
  FISICO: { Icone: Footprints, rotulo: "Físico", descricao: "Deslocamento, agilidade e preparo físico" },
  DEFESA: { Icone: Shield, rotulo: "Defesa", descricao: "Defesa, resistência a ataques e desvios" },
  SOCIAL: { Icone: MessageCircle, rotulo: "Social", descricao: "Comunicação, interação social e persuasão" },
  CONHECIMENTO: { Icone: BookOpen, rotulo: "Conhecimento", descricao: "Conhecimentos e práticas gerais" },
  PERCEPCAO: { Icone: Eye, rotulo: "Percepção", descricao: "Capacidade de notar detalhes e intenções" },
};
export const LISTA_CATEGORIAS = Object.keys(CATEGORIAS) as CategoriaPericia[];

/** Atributo como vem embutido nas perícias. `fixo` = do sistema (não editável). */
export type AtributoResumo = { id: string; nome: string; descricao: string; ordem: number; fixo: boolean; kitIds?: string[]; editavel?: boolean; verificado?: boolean; deOutro?: boolean; podeVerificar?: boolean; seloProprio?: boolean; verificadoPorKit?: boolean };

/** Atributo na lista de atributos, com quantas perícias do mestre usam. */
export type Atributo = AtributoResumo & { pericias: number };
export type AtributoInput = { nome: string; descricao: string; kitIds: string[] };

type PericiaBase = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaPericia;
  atributo: AtributoResumo;
};

/** Perícia do catálogo do mestre, com quantas classes e raças dele a usam. */
export type PericiaCatalogo = PericiaBase & {
  atributoId: string;
  kitIds: string[];
  origemId: string | null;
  usosClasses: number;
  usosRacas: number;
  editavel?: boolean;
  verificado?: boolean;
  deOutro?: boolean;
  podeVerificar?: boolean;
  seloProprio?: boolean;
  verificadoPorKit?: boolean;
};

/** Perícia de uma classe: dados do catálogo + modificador daquela classe. */
export type PericiaDaClasse = PericiaBase & { modificador: number };

/** Perícia de uma raça: dados do catálogo + pontos base que a raça dá. */
export type PericiaDaRaca = PericiaBase & { pontos: number };

export type PericiaInput = { nome: string; descricao: string; categoria: CategoriaPericia; atributoId: string; kitIds: string[] };

export function formatarModificador(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}
