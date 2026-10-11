import { User } from "lucide-react";
import { useState } from "react";

/** Foto de perfil (link) em formato quadrado; sem foto ou com link quebrado, mostra um ícone. */
export function Avatar({ url, nome, tamanho = 32 }: { url: string | null; nome?: string | null; tamanho?: number }) {
  const [falhou, setFalhou] = useState<string | null>(null);
  const estilo = { width: tamanho, height: tamanho };
  if (!url || falhou === url) {
    return (
      <span className="avatar avatar--vazio" style={estilo} aria-hidden>
        <User size={Math.round(tamanho * 0.55)} />
      </span>
    );
  }
  return (
    <img
      className="avatar"
      style={estilo}
      src={url}
      alt={nome ? `Foto de ${nome}` : ""}
      referrerPolicy="no-referrer"
      onError={() => setFalhou(url)}
    />
  );
}
