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
  /** Máximo de fichas por função da classe (null = sem limite; 0 = função fechada). */
  limiteCombatentes: number | null;
  limiteVanguardistas: number | null;
  limiteSuportes: number | null;
  /** Kit de RPG do grupo: itens, criaturas e NPCs mostrados seguem o kit (null = tudo). */
  kitId: string | null;
  /** Regras padrão de combate desligadas neste grupo (slugs). */
  regrasPadraoDesativadas: string[];
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
  status: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; automatico: boolean; turnos?: number | null }[];
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
  status: { id: string; nome: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; automatico: boolean; turnos?: number | null }[];
};

export type GrupoDetalhe = Omit<Grupo, "membros"> & {
  kit: { id: string; nome: string } | null;
  disponiveis: Disponiveis;
  membros: Membro[];
  statusAtivos: Status[];
  itensVagos: Item[];
  criaturas: Criatura[];
  /** Regras próprias do mestre para o grupo (além ou no lugar das padrão). */
  regrasProprias: RegraDaMesa[];
};

export type RegraDaMesa = { id: string; titulo: string; texto: string };
export type RegraDaMesaInput = { titulo: string; texto: string };

export type GrupoInput = Pick<
  Grupo,
  "titulo" | "sinopse" | "genero" | "imagemUrl" | "limiteMembros" | "permitirClassesRepetidas" | "limiteCombatentes" | "limiteVanguardistas" | "limiteSuportes" | "kitId" | "regrasPadraoDesativadas"
>;
