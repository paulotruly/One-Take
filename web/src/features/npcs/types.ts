// NPCs do mestre: personagens com ficha (raça obrigatória, classe opcional, nível, dados, perícias, cartas e inventário).
import type { Grupo, Habilidade } from "../classes/types";
import type { Recurso } from "../grupos/types";
import type { Item } from "../itens/types";
import type { AtributoResumo, CategoriaPericia } from "../pericias/types";
import type { Status } from "../status/types";

export type NpcResumo = {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string | null;
  nivel: number;
  raca: string;
  classe: string | null;
  grupoExclusivo: { id: string; titulo: string } | null;
  vida: Recurso;
  mana: Recurso;
  esforco: Recurso;
  morto: boolean;
};

export type PericiaDoNpc = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaPericia;
  atributo: AtributoResumo;
  raca: number;
  classe: number;
  extra: number;
  total: number;
  teste: string;
};

export type NpcDetalhe = {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string | null;
  nivel: number;
  racaId: string;
  classeId: string | null;
  vidaBase: number | null;
  manaBase: number | null;
  esforcoBase: number | null;
  grupoExclusivoId: string | null;
  grupoExclusivo: { id: string; titulo: string } | null;
  raca: { id: string; titulo: string; deslocamento: number };
  classe: { id: string; titulo: string; grupo: Grupo } | null;
  vida: Recurso;
  mana: Recurso;
  esforco: Recurso;
  morto: boolean;
  status: Status[];
  statusAplicaveis: Status[];
  atributos: (AtributoResumo & { dados: number; teste: string })[];
  pericias: PericiaDoNpc[];
  habilidades: Habilidade[];
  proximasHabilidades: number;
  inventario: { capacidade: number; usados: number; itens: Item[] };
  /** Para onde os itens do NPC podem ir. */
  destinos: { grupos: { id: string; titulo: string }[]; fichas: { id: string; nome: string; jogador: string; grupo: string }[] };
};

export type NpcInput = {
  nome: string;
  descricao: string;
  imagemUrl: string | null;
  racaId: string;
  classeId: string | null;
  nivel: number;
  vidaBase: number | null;
  manaBase: number | null;
  esforcoBase: number | null;
  grupoExclusivoId: string | null;
};
