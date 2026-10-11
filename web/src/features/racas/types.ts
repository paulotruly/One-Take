import type { PericiaDaRaca } from "../pericias/types";

export type Raca = {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  /** Quadrados no grid por turno. */
  deslocamento: number;
  pericias: PericiaDaRaca[];
  /** Nulo = geral; id = exclusiva daquele grupo. */
  grupoExclusivoId: string | null;
};

export type RacaInput = Pick<Raca, "titulo" | "descricao" | "imagemUrl" | "deslocamento" | "grupoExclusivoId">;
