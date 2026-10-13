// Itens: catálogo do mestre (moldes), itens lançados nos grupos e categorias (4 fixas + as do mestre).
import {
  Apple, Axe, Beer, Bomb, BookOpen, BowArrow, CircleDot, Coins, Crown, FlaskConical, Gem, Hammer, Key, Map, Package,
  ScrollText, Shield, Shirt, Sword, WandSparkles, type LucideIcon,
} from "lucide-react";

/** Ícones que uma categoria pode usar (as chaves espelham ICONES_ITEM da API). */
export const ICONES_ITEM: Record<string, { Icone: LucideIcon; rotulo: string }> = {
  pacote: { Icone: Package, rotulo: "Pacote" },
  espada: { Icone: Sword, rotulo: "Espada" },
  machado: { Icone: Axe, rotulo: "Machado" },
  arco: { Icone: BowArrow, rotulo: "Arco" },
  escudo: { Icone: Shield, rotulo: "Escudo" },
  joia: { Icone: Gem, rotulo: "Joia" },
  anel: { Icone: CircleDot, rotulo: "Anel" },
  coroa: { Icone: Crown, rotulo: "Coroa" },
  varinha: { Icone: WandSparkles, rotulo: "Varinha" },
  caneca: { Icone: Beer, rotulo: "Caneca" },
  pocao: { Icone: FlaskConical, rotulo: "Poção" },
  comida: { Icone: Apple, rotulo: "Comida" },
  livro: { Icone: BookOpen, rotulo: "Livro" },
  pergaminho: { Icone: ScrollText, rotulo: "Pergaminho" },
  mapa: { Icone: Map, rotulo: "Mapa" },
  chave: { Icone: Key, rotulo: "Chave" },
  moeda: { Icone: Coins, rotulo: "Moeda" },
  roupa: { Icone: Shirt, rotulo: "Roupa" },
  martelo: { Icone: Hammer, rotulo: "Martelo" },
  bomba: { Icone: Bomb, rotulo: "Bomba" },
};
export const LISTA_ICONES_ITEM = Object.keys(ICONES_ITEM);

/** Ícone lucide de uma chave (desconhecida = pacote). */
export const iconeDe = (chave: string | undefined | null) => (ICONES_ITEM[chave ?? ""] ?? ICONES_ITEM.pacote!).Icone;

/** Categoria de item: fixa do sistema (somente leitura) ou criada pelo mestre. */
export type CategoriaItem = { id: string; nome: string; descricao: string; icone: string; ordem: number; fixa: boolean; usos?: number };
export type CategoriaItemInput = { nome: string; descricao: string; icone: string };

/** Campos comuns ao molde do catálogo e ao item no grupo. */
export type CamposItem = {
  categoriaId: string | null;
  nome: string;
  descricao: string;
  imagemUrl: string | null;
  efeito: string | null;
  espacos: number;
  /** null = sem limite de usos. */
  usosMaximos: number | null;
  requisito: string | null;
  requisitoPericiaId: string | null;
  requisitoClasseId: string | null;
};

export type Item = Omit<CamposItem, "categoriaId" | "requisitoPericiaId" | "requisitoClasseId"> & {
  id: string;
  categoria: { id: string; nome: string; icone: string } | null;
  usosRestantes: number | null;
  requisitoPericia: { id: string; nome: string } | null;
  requisitoClasse: { id: string; titulo: string } | null;
  fichaId?: string | null;
};

/** Item no inventário de uma ficha: diz se aquele personagem sabe usar. */
export type ItemDaFicha = Item & { podeUsar: boolean; motivoNaoPodeUsar: string | null };

/** Molde do catálogo do mestre. */
export type ItemModelo = Item & { grupoExclusivoId: string | null };

export type ItemModeloInput = CamposItem & { grupoExclusivoId: string | null };
export type ItemNoGrupoInput = CamposItem & { fichaId: string | null };

/** Converte o item apresentado de volta para o formulário. */
export function camposDe(i: Item): CamposItem {
  return {
    categoriaId: i.categoria?.id ?? null,
    nome: i.nome,
    descricao: i.descricao,
    imagemUrl: i.imagemUrl,
    efeito: i.efeito,
    espacos: i.espacos,
    usosMaximos: i.usosMaximos,
    requisito: i.requisito,
    requisitoPericiaId: i.requisitoPericia?.id ?? null,
    requisitoClasseId: i.requisitoClasse?.id ?? null,
  };
}

/** "1 espaço", "3 espaços". */
export const rotuloEspacos = (n: number) => `${n} ${n === 1 ? "espaço" : "espaços"}`;

/** "2/3 usos"; null = sem limite. */
export function rotuloUsos(item: Pick<Item, "usosMaximos" | "usosRestantes">) {
  if (item.usosMaximos === null) return null;
  const restam = item.usosRestantes ?? item.usosMaximos;
  return `${restam}/${item.usosMaximos} ${item.usosMaximos === 1 ? "uso" : "usos"}`;
}
