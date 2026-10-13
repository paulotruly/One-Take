import type { Classe, Habilidade } from "../classes/types";
import type { AtributoResumo, CategoriaPericia, PericiaDaClasse } from "../pericias/types";
import type { Recurso } from "../grupos/types";
import type { ItemDaFicha } from "../itens/types";
import type { Status } from "../status/types";

export type FichaResumo = {
  id: string;
  nome: string;
  imagemUrl: string | null;
  nivel: number;
  grupo: { id: string; titulo: string; imagemUrl: string | null; genero: string };
  classe: string;
  raca: string;
};

export type PericiaDaFicha = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaPericia;
  atributo: AtributoResumo;
  raca: number;
  classe: number;
  nivel: number;
  total: number;
  /** Como rolar: "2d20 + 5" (d20 do atributo + total da perícia). */
  teste: string;
};

export type FichaDetalhe = {
  id: string;
  nome: string;
  historia: string | null;
  imagemUrl: string | null;
  nivel: number;
  souMestre: boolean;
  souDono: boolean;
  jogador: { nickname: string; nome: string | null; fotoUrl: string | null };
  grupo: { id: string; titulo: string; mestre: { id: string; nickname: string; nome: string | null } };
  classe: Classe;
  raca: { id: string; titulo: string; imagemUrl: string | null; deslocamento: number };
  vida: Recurso;
  mana: Recurso;
  esforco: Recurso;
  atributos: (AtributoResumo & { dados: number; teste: string })[];
  pericias: PericiaDaFicha[];
  pontosPericiaDisponiveis: number;
  custoPericia: number;
  opcoesPericia: { id: string; nome: string; atributo: string; tem: boolean }[];
  habilidades: Habilidade[];
  proximasHabilidades: number;
  inventario: { capacidade: number; usados: number; itens: ItemDaFicha[] };
  outrasFichas: { id: string; nome: string; jogador: string }[];
  /** Vida ou mana em 0. */
  morto: boolean;
  /** Status atuais (automáticos + aplicados pelo mestre). Efeitos são só avisos. */
  status: Status[];
  /** Status que o mestre pode aplicar (ativados no grupo, não automáticos, ainda não aplicados). */
  statusAplicaveis: Status[];
};

export type Convite = {
  grupo: {
    id: string;
    titulo: string;
    sinopse: string;
    genero: string;
    imagemUrl: string | null;
    mestre: { nickname: string; nome: string | null; fotoUrl: string | null };
    permitirClassesRepetidas: boolean;
  };
  souMestre: boolean;
  minhaFichaId: string | null;
  vagas: { limite: number; ocupadas: number };
  pontosAtributo: number;
  classes: (Classe & { ocupada: boolean; habilidades: Habilidade[]; pericias: PericiaDaClasse[] })[];
  racas: {
    id: string;
    titulo: string;
    descricao: string;
    imagemUrl: string | null;
    deslocamento: number;
    pericias: { nome: string; pontos: number; atributo: string }[];
    conceito: { id: string; titulo: string } | null;
  }[];
  atributos: AtributoResumo[];
};

export type CriarFichaInput = {
  codigo: string;
  nome: string;
  classeId: string;
  racaId: string;
  historia: string | null;
  imagemUrl: string | null;
  dados: Record<string, number>;
};
