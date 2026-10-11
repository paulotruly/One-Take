export type Disponiveis = { classeIds: string[]; racaIds: string[]; atributoIds: string[]; periciaIds: string[]; statusIds: string[] };

export type Grupo = {
  id: string;
  titulo: string;
  sinopse: string;
  genero: string;
  imagemUrl: string | null;
  limiteMembros: number;
  codigo: string;
  permitirClassesRepetidas: boolean;
  /** Na listagem: quantos jogadores já têm ficha. */
  membros: number;
};

export type Recurso = { atual: number; max: number };

export type Membro = {
  fichaId: string;
  nome: string;
  imagemUrl: string | null;
  nivel: number;
  jogador: { nickname: string; nome: string | null; fotoUrl: string | null };
  classe: string;
  raca: string;
  vida: Recurso;
  mana: Recurso;
  esforco: Recurso;
  status: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; automatico: boolean }[];
};

export type Item = { id: string; nome: string; descricao: string };

export type GrupoDetalhe = Omit<Grupo, "membros"> & {
  disponiveis: Disponiveis;
  membros: Membro[];
  itensVagos: Item[];
};

export type GrupoInput = Pick<Grupo, "titulo" | "sinopse" | "genero" | "imagemUrl" | "limiteMembros" | "permitirClassesRepetidas">;
