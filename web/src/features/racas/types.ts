import type { PericiaDaRaca } from "../pericias/types";

export type Raca = {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string | null;
  /** Quadrados no grid por turno. */
  deslocamento: number;
  pericias: PericiaDaRaca[];
  /** Kits de RPG em que a raça está (vazio = geral). */
  kitIds: string[];
  /** Arquétipo de raça do qual esta é sub-raça (opcional). */
  conceitoId: string | null;
  conceito: { id: string; titulo: string } | null;
};

export type RacaInput = Pick<Raca, "titulo" | "descricao" | "imagemUrl" | "deslocamento" | "kitIds" | "conceitoId">;

/** Arquétipo de raça: raça generalista que agrupa sub-raças (o jogador escolhe a sub-raça). */
export type RacaConceito = { id: string; titulo: string; descricao: string; subracas: { id: string; titulo: string; imagemUrl: string | null; deslocamento: number }[] };
