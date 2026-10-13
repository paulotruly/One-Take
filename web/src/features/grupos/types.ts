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
  /** Kit de RPG do grupo: itens, criaturas e NPCs mostrados seguem o kit (null = tudo). */
  kitId: string | null;
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

import type { Item } from "../itens/types";
import type { Status } from "../status/types";

/** Criatura invocada no grupo (resumo para a lista). */
export type Criatura = {
  id: string;
  bestaId: string;
  nome: string;
  nivel: number;
  besta: { titulo: string; imagemUrl: string | null; deslocamento: number };
  vida: Recurso;
  mana: Recurso;
  esforco: Recurso;
  status: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; automatico: boolean }[];
};

export type GrupoDetalhe = Omit<Grupo, "membros"> & {
  kit: { id: string; nome: string } | null;
  disponiveis: Disponiveis;
  membros: Membro[];
  statusAtivos: Status[];
  itensVagos: Item[];
  criaturas: Criatura[];
};

export type GrupoInput = Pick<Grupo, "titulo" | "sinopse" | "genero" | "imagemUrl" | "limiteMembros" | "permitirClassesRepetidas" | "kitId">;
