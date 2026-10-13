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

/** Cópia somente leitura de uma ficha que saiu do grupo (o jogador saiu, foi removido ou o grupo foi excluído). */
export type MotivoArquivamento = "SAIU_DO_GRUPO" | "REMOVIDO_PELO_MESTRE" | "GRUPO_EXCLUIDO";
export const ROTULO_MOTIVO: Record<MotivoArquivamento, string> = {
  SAIU_DO_GRUPO: "Você saiu do grupo",
  REMOVIDO_PELO_MESTRE: "O mestre removeu a ficha do grupo",
  GRUPO_EXCLUIDO: "O grupo foi excluído",
};
export type FichaArquivadaResumo = { id: string; nome: string; nivel: number; classe: string; raca: string; grupo: string; motivo: MotivoArquivamento; arquivadaEm: string };
type RecursoArquivado = { atual: number; max: number };
export type FichaArquivada = FichaArquivadaResumo & {
  conteudo: {
    historia: string | null;
    imagemUrl: string | null;
    classe: { titulo: string; grupo: string; descricao: string; imagemUrl: string | null };
    raca: { titulo: string; deslocamento: number; imagemUrl: string | null };
    vida: RecursoArquivado;
    mana: RecursoArquivado;
    esforco: RecursoArquivado;
    atributos: { nome: string; dados: number; teste: string }[];
    pericias: { nome: string; atributo: string; total: number; teste: string }[];
    habilidades: {
      titulo: string; descricao: string; tipoEfeito: string; descricaoEfeito: string; condicao: string | null; limite: string | null;
      custoMana: number; nivelNecessario: number; teste: string | null; defesa?: string[] | string | null;
    }[];
    inventario: { nome: string; descricao: string; efeito: string | null; espacos: number; categoria: string | null; usosRestantes: number | null }[];
  };
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
