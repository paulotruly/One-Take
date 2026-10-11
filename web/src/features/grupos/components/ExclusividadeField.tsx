import { Field } from "../../../components/ui/Field";

/** "Geral" ou "Exclusivo de um grupo" (opcional) para classes, raças e atributos. */
export function ExclusividadeField({
  valor,
  grupos,
  onChange,
  erro,
}: {
  valor: string | null;
  grupos: { id: string; titulo: string }[];
  onChange: (grupoId: string | null) => void;
  erro?: string;
}) {
  return (
    <Field
      rotulo="Disponibilidade"
      erro={erro}
      dica="Geral: pode ser liberado em qualquer grupo. Exclusivo: só vale no grupo escolhido e já entra liberado nele."
    >
      <select value={valor ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">Geral</option>
        {grupos.map((g) => (
          <option key={g.id} value={g.id}>
            Exclusivo de: {g.titulo}
          </option>
        ))}
      </select>
    </Field>
  );
}
