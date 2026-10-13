// Kits de RPG: coleções do mestre (classes, raças, atributos, perícias, status, itens, criaturas, NPCs).
// Sem kit = geral. Uma coisa pode estar em vários kits.

export type Kit = {
  id: string;
  nome: string;
  descricao: string;
  conteudo: { classes: number; racas: number; atributos: number; pericias: number; status: number; itens: number; bestas: number; npcs: number; grupos: number };
};

export type KitInput = { nome: string; descricao: string };

/** Kit ativo (telas do mestre): só o que está no kit. Sem kit escolhido ("Todos"), aparece tudo, inclusive o geral. */
export function soDoKit(kitIds: string[] | undefined, kitId: string | null) {
  return !kitId || (kitIds ?? []).includes(kitId);
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
