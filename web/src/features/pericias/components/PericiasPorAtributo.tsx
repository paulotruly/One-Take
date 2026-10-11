import type { ReactNode } from "react";
import type { AtributoResumo } from "../types";

/** Agrupa perícias pelo atributo (fixos primeiro, na ordem do sistema), com nome e descrição do atributo. */
export function PericiasPorAtributo<T extends { id: string; atributo: AtributoResumo }>({
  pericias,
  renderItem,
  mostrarDescricao = true,
}: {
  pericias: T[];
  renderItem: (p: T) => ReactNode;
  mostrarDescricao?: boolean;
}) {
  const grupos = new Map<string, { atributo: AtributoResumo; itens: T[] }>();
  for (const p of pericias) {
    const g = grupos.get(p.atributo.id) ?? { atributo: p.atributo, itens: [] };
    g.itens.push(p);
    grupos.set(p.atributo.id, g);
  }
  const ordenados = [...grupos.values()].sort(
    (a, b) => a.atributo.ordem - b.atributo.ordem || a.atributo.nome.localeCompare(b.atributo.nome, "pt-BR"),
  );

  return (
    <>
      {ordenados.map(({ atributo, itens }) => (
        <section key={atributo.id} className="atributo" aria-label={atributo.nome}>
          <div className="atributo__cabecalho">
            <h3>{atributo.nome}</h3>
            {mostrarDescricao && atributo.descricao && <p className="atributo__descricao">{atributo.descricao}</p>}
          </div>
          <ul className="pericias">{itens.map(renderItem)}</ul>
        </section>
      ))}
    </>
  );
}
