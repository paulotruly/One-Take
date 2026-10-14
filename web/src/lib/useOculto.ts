// Seção que dá para ocultar com a seta: lembra a escolha neste navegador (sem storage, começa aberta).
import { useState } from "react";

export function useOculto(chave: string) {
  const k = `one-take:oculto:${chave}`;
  const [oculto, setOculto] = useState(() => {
    try { return localStorage.getItem(k) === "1"; } catch { return false; }
  });
  function alternar() {
    setOculto((o) => {
      try { if (o) localStorage.removeItem(k); else localStorage.setItem(k, "1"); } catch { /* sem storage: só nesta tela */ }
      return !o;
    });
  }
  return [oculto, alternar] as const;
}
