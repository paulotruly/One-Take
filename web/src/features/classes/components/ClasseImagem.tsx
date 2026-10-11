import { useState } from "react";

/** Imagem da classe por link; se faltar ou quebrar, mostra a inicial do título. */
export function ClasseImagem({ url, titulo }: { url: string | null; titulo: string }) {
  const [falhou, setFalhou] = useState<string | null>(null);

  if (!url || falhou === url) {
    return (
      <div className="classe-imagem classe-imagem--vazia" aria-hidden>
        {titulo.trim().charAt(0).toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      className="classe-imagem"
      src={url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFalhou(url)}
    />
  );
}
