// Texto com **negrito**: o trecho entre dois asteriscos duplos aparece em negrito. Não usa HTML (nada é injetado).
import { Fragment } from "react";

export function ComNegrito({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*\n]+?\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.length > 4 && p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}
