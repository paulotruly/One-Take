import { GRUPOS, ROTULO_GRUPO, type Grupo } from "../types";

type Props = { valor: Grupo | undefined; onChange: (g: Grupo | undefined) => void };

export function GrupoFilter({ valor, onChange }: Props) {
  const opcoes: { valor: Grupo | undefined; rotulo: string }[] = [
    { valor: undefined, rotulo: "Todos" },
    ...GRUPOS.map((g) => ({ valor: g, rotulo: ROTULO_GRUPO[g] })),
  ];
  return (
    <div className="filtro" role="group" aria-label="Filtrar por grupo">
      {opcoes.map((o) => (
        <button
          key={o.rotulo}
          type="button"
          className="filtro__opcao"
          aria-pressed={valor === o.valor}
          onClick={() => onChange(o.valor)}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
