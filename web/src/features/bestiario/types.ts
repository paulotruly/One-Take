// Bestiário: criaturas do mestre (como classes, mas com dados por atributo) e criaturas invocadas nos grupos.
import type { Habilidade } from "../classes/types";
import type { Criatura } from "../grupos/types";
import type { AtributoResumo, CategoriaPericia } from "../pericias/types";
import type { Status } from "../status/types";

export type Besta = {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  pontosVida: number;
  pontosMana: number;
  pontosEsforco: number;
  deslocamento: number;
  conceitoId: string | null;
  conceito: { id: string; titulo: string } | null;
  /** Kits de RPG em que a criatura está (vazio = geral). */
  kitIds: string[];
  /** Na listagem: quantas cartas tem. */
  cartas?: number;
};

export type PericiaDaBesta = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaPericia;
  atributo: AtributoResumo;
  modificador: number;
  /** "2d20 + 5". */
  teste: string;
};

export type AtributoDaBesta = AtributoResumo & { dados: number; teste: string };

export type BestaDetalhe = Besta & { habilidades: Habilidade[]; pericias: PericiaDaBesta[]; atributos: AtributoDaBesta[] };

export type BestaInput = Pick<Besta, "titulo" | "descricao" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco" | "deslocamento" | "kitIds" | "conceitoId">;

export type BestaConceito = {
  id: string;
  titulo: string;
  descricao: string;
  formas: Pick<Besta, "id" | "titulo" | "imagemUrl" | "pontosVida" | "pontosMana" | "pontosEsforco">[];
};

/** Ficha completa de uma criatura invocada. */
export type CriaturaDetalhe = Criatura & {
  grupoId: string;
  descricao: string;
  atributos: AtributoDaBesta[];
  pericias: PericiaDaBesta[];
  habilidades: Habilidade[];
  proximasHabilidades: number;
  statusDetalhado: Status[];
  statusAplicaveis: Status[];
};

/** Resposta ao editar uma criatura: some quando morre. */
export type RespostaCriatura = { removida: true; motivo: "morreu" } | { removida: false; criatura: Criatura };
