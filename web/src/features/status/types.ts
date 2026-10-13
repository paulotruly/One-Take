export type TipoStatus = "BUFF" | "DEBUFF" | "MISTO";
export type GatilhoStatus = "VIDA_ZERO" | "MANA_ZERO" | "ESFORCO_ZERO";

/** Status (condição/emoção). Efeito só informativo: a ficha mostra o alerta, nada é recalculado. */
export type Status = {
  id: string;
  nome: string;
  descricao: string;
  efeito: string;
  tipo: TipoStatus;
  gatilho: GatilhoStatus | null;
  ordem: number;
  fixo: boolean;
  automatico: boolean;
  /** Na lista do mestre: kits de RPG em que o status está (vazio = geral). */
  kitIds?: string[];
  /** Para quem vê: pode editar (é dele, ou é fixo e ele é administrador). */
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

export type StatusResumo = { id: string; nome: string; tipo: TipoStatus };

export type StatusInput = { nome: string; descricao: string; efeito: string; tipo: TipoStatus; kitIds: string[] };

export const ROTULO_TIPO: Record<TipoStatus, string> = { BUFF: "Benefício", DEBUFF: "Prejuízo", MISTO: "Misto" };
export const LISTA_TIPOS: TipoStatus[] = ["DEBUFF", "BUFF", "MISTO"];

export const ROTULO_GATILHO: Record<GatilhoStatus, string> = {
  VIDA_ZERO: "Automático: vida em 0",
  MANA_ZERO: "Automático: mana em 0",
  ESFORCO_ZERO: "Automático: esforço em 0",
};
