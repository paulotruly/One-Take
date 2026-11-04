// Preferências deste navegador: tamanho do texto, densidade e interface ao entrar. Sem armazenamento, valem os padrões.
export type Preferencias = {
  texto: "normal" | "grande";
  densidade: "normal" | "compacta";
  interfaceInicial: "ultima" | "MESTRE" | "JOGADOR";
};

const CHAVE = "one-take:preferencias";
const PADRAO: Preferencias = { texto: "normal", densidade: "normal", interfaceInicial: "ultima" };

export function lerPreferencias(): Preferencias {
  try {
    return { ...PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Partial<Preferencias>) };
  } catch {
    return PADRAO;
  }
}

/** Liga as variações de tokens (tokens.css) na raiz da página. */
export function aplicarPreferencias(p = lerPreferencias()) {
  document.documentElement.dataset.texto = p.texto;
  document.documentElement.dataset.densidade = p.densidade;
}

export function gravarPreferencias(p: Preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* sem armazenamento: vale só nesta página */
  }
  aplicarPreferencias(p);
}
