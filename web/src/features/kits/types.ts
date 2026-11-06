// Kits de RPG: coleções do mestre (classes, raças, atributos, perícias, status, itens, criaturas, NPCs).
// Sem kit = geral. Uma coisa pode estar em vários kits.

export type Kit = {
  id: string;
  nome: string;
  descricao: string;
  conteudo: { classes: number; racas: number; atributos: number; pericias: number; status: number; itens: number; bestas: number; npcs: number; grupos: number };
};

export type KitInput = { nome: string; descricao: string };

/** O que está no kit, marcado na tela do kit (a lista inteira de cada tipo). */
export type ConteudoKit = {
  classeIds: string[]; racaIds: string[]; atributoIds: string[]; periciaIds: string[]; statusIds: string[]; itemIds: string[]; bestaIds: string[]; npcIds: string[];
};

type Coisa = { id: string; nome: string };
/** Tela do kit: o que está dentro, por tipo (os grupos só para o dono). */
export type KitDetalhe = Kit & {
  dentro: {
    classes: Coisa[]; racas: Coisa[]; atributos: Coisa[]; pericias: (Coisa & { atributo: string })[];
    status: (Coisa & { tipo: "BUFF" | "DEBUFF" | "MISTO" })[]; itens: Coisa[]; bestas: Coisa[]; npcs: Coisa[]; grupos: Coisa[];
  };
};

/** Com kit ativo: o que é do kit ou é geral (sem kit), como no grupo. Sem kit ativo, aparece tudo. */
export function soDoKit(kitIds: string[] | undefined, kitId: string | null) {
  return !kitId || (kitIds ?? []).length === 0 || (kitIds ?? []).includes(kitId);
}

/** Grupo com kit: o que é do kit ou é geral (sem kit). Sem kit, aparece tudo. */
export function visivelNoKit(kitIds: string[] | undefined, kitId: string | null) {
  if (!kitId) return true;
  return !kitIds || kitIds.length === 0 || kitIds.includes(kitId);
}

// Kit ativo no navegador (conveniência local, não precisa ir para o servidor).
const CHAVE = "one-take:kit-ativo";
export function lerKitAtivo(): string | null {
  try {
    return localStorage.getItem(CHAVE) || null;
  } catch {
    return null;
  }
}
export function gravarKitAtivo(id: string | null) {
  try {
    if (id) localStorage.setItem(CHAVE, id);
    else localStorage.removeItem(CHAVE);
  } catch {
    /* sem armazenamento: tudo bem */
  }
}

/** Kits que um registro novo recebe: o kit ativo, se houver. */
export const kitsPadrao = () => {
  const k = lerKitAtivo();
  return k ? [k] : [];
};
