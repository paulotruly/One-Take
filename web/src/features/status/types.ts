
export type TipoStatus = "BUFF" | "DEBUFF" | "MISTO";
export type GatilhoStatus = "VIDA_ZERO" | "MANA_ZERO" | "ESFORCO_ZERO";

/** Status (condição/emoção). Efeito só informativo: a ficha mostra o alerta, nada é recalculado. */
export type Status = {
  id: string;
  nome: string;
  efeito: string;
  tipo: TipoStatus;
  gatilho: GatilhoStatus | null;
  ordem: number;
  automatico: boolean;
  /** Na lista do mestre: kits de RPG em que o status está (vazio = geral). */
  kitIds?: string[];
  /** Categoria do mestre (ex.: Elementais); null = sem categoria. Só vem se for visível para quem vê. */
  categoriaId?: string | null;
  /** Aplicado numa ficha, NPC ou criatura: turnos que faltam (null = sem prazo). */
  turnos?: number | null;
  categoria?: { id: string; nome: string } | null;
};

/** Categoria de status criada pelo mestre: só organiza a lista e o que vale no grupo. */
export type CategoriaStatus = { id: string; nome: string; descricao: string; usos?: number };

export type StatusResumo = { id: string; nome: string; tipo: TipoStatus };

export type StatusInput = { nome: string; efeito: string; tipo: TipoStatus; kitIds: string[]; categoriaId: string | null };

export const ROTULO_TIPO: Record<TipoStatus, string> = { BUFF: "Benefício", DEBUFF: "Prejuízo", MISTO: "Misto" };
export const LISTA_TIPOS: TipoStatus[] = ["DEBUFF", "BUFF", "MISTO"];

export const ROTULO_GATILHO: Record<GatilhoStatus, string> = {
  VIDA_ZERO: "Automático: vida em 0",
  MANA_ZERO: "Automático: mana em 0",
  ESFORCO_ZERO: "Automático: esforço em 0",
};
