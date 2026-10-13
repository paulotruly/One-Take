// Selo "verificado": o administrador marca coisas dele; todo mestre vê e usa (só leitura). Cada um pode ocultar da própria interface.

export type TipoVerificavel =
  | "classe" | "raca" | "atributo" | "pericia" | "status" | "categoriaItem" | "itemModelo" | "besta" | "npc"
  | "kit" | "classeConceito" | "racaConceito" | "bestaConceito";

/** Campos que a API manda junto de cada coisa, para quem está vendo. */
export type Visao = {
  /** Pode editar (é dele, ou é fixo e ele é administrador). */
  editavel?: boolean;
  /** Tem o selo verificado: todo mestre vê e usa. */
  verificado?: boolean;
  /** Verificado de outra pessoa: só leitura (duplique para mudar). */
  deOutro?: boolean;
  /** Quem vê é ADMIN e dono: pode pôr ou tirar o selo. */
  podeVerificar?: boolean;
  /** Selo marcado nesta coisa (sem contar o do kit). */
  seloProprio?: boolean;
  /** Verificado por estar num kit verificado. */
  verificadoPorKit?: boolean;
};
