// Seletor do kit ativo na navegação lateral do mestre.
import { Package } from "lucide-react";
import { useKitAtivo, useKits } from "../api";

export function SeletorKit() {
  const kits = useKits();
  const { kitId, definir } = useKitAtivo();
  if (!kits.data || kits.data.length === 0) return null;
  return (
    <label className="seletor-kit">
      <span className="seletor-kit__rotulo">
        <Package size={14} aria-hidden /> Kit ativo
      </span>
      <select value={kitId ?? ""} onChange={(e) => definir(e.target.value || null)}>
        <option value="">Todos</option>
        {kits.data.map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}
      </select>
    </label>
  );
}
