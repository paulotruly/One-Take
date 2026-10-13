// Campo "Kits" dos formulários do mestre: em quais kits de RPG a coisa está. Nenhum = geral.
import { Link } from "react-router";
import { useKits } from "../api";

export function KitsField({ valor, onChange, erro }: { valor: string[]; onChange: (kitIds: string[]) => void; erro?: string }) {
  const kits = useKits();
  // Só os kits do mestre: um kit verificado de outra pessoa é só leitura.
  const lista = (kits.data ?? []).filter((k) => !k.deOutro);
  const alternar = (id: string, marcar: boolean) => onChange(marcar ? [...new Set([...valor, id])] : valor.filter((k) => k !== id));
  return (
    <fieldset className="form__grupo">
      <legend>Kits de RPG</legend>
      {lista.length === 0 ? (
        <p className="pagina__subtitulo">
          Sem kits: fica geral (aparece em todos os grupos). Crie kits em <Link to="/mestre/kits">Kits</Link> para organizar por aventura.
        </p>
      ) : (
        <>
          <div className="checklist">
            {lista.map((k) => (
              <label key={k.id} className={`checklist__item ${valor.includes(k.id) ? "checklist__item--marcado" : ""}`}>
                <input type="checkbox" checked={valor.includes(k.id)} onChange={(e) => alternar(k.id, e.target.checked)} />
                <span>{k.nome}</span>
              </label>
            ))}
          </div>
          <p className="campo__dica">{valor.length === 0 ? "Nenhum marcado: geral. Aparece em Todos e em qualquer grupo, mas não com um kit ativo." : "Aparece só nos kits marcados (e nos grupos que usam esses kits)."}</p>
        </>
      )}
      {erro && <span className="campo__erro">{erro}</span>}
    </fieldset>
  );
}
