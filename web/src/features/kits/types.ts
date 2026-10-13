// Kits de RPG: coleções do mestre (classes, raças, atributos, perícias, status, itens, criaturas, NPCs).
import type { Visao } from "../verificados/types";
// Sem kit = geral. Uma coisa pode estar em vários kits.

export type Kit = Visao & {
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
/** Marca se o kit ativo é de outra pessoa (verificado): o que o mestre cria não pode entrar nele. */
const CHAVE_DE_OUTRO = "one-take:kit-ativo-de-outro";
export function gravarKitAtivo(id: string | null, deOutro = false) {
  try {
    if (id) localStorage.setItem(CHAVE, id);
    else localStorage.removeItem(CHAVE);
    if (id && deOutro) localStorage.setItem(CHAVE_DE_OUTRO, "1");
    else localStorage.removeItem(CHAVE_DE_OUTRO);
  } catch {
    /* sem armazenamento: tudo bem */
  }
}
function kitAtivoDeOutro() {
  try {
    return localStorage.getItem(CHAVE_DE_OUTRO) === "1";
  } catch {
    return false;
  }
}

/** Kits que um registro novo recebe: o kit ativo, se houver e for do mestre. */
export const kitsPadrao = () => {
  const k = lerKitAtivo();
  return k && !kitAtivoDeOutro() ? [k] : [];
};
