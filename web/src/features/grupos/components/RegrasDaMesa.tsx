// Regras de combate de um grupo (apresentação): as padrão ligadas e as próprias do mestre. Cada regra abre e fecha.
import { BookOpen, ScrollText } from "lucide-react";
import type { ReactNode } from "react";
import type { RegraPadrao } from "../../docs/regras";

type Propria = { id: string; titulo: string; texto: string };

type Props = {
  padrao: RegraPadrao[];
  proprias: Propria[];
  /** Ações em cada regra própria (ex.: Editar, Excluir), para o mestre. */
  acoesPropria?: (r: Propria) => ReactNode;
  /** Texto quando o grupo não tem nenhuma regra de combate. */
  vazio?: string;
};

export function RegrasDaMesa({ padrao, proprias, acoesPropria, vazio = "Nenhuma regra de combate neste grupo." }: Props) {
  if (padrao.length === 0 && proprias.length === 0) return <p className="pagina__subtitulo">{vazio}</p>;
  return (
    <div className="regras-mesa">
      {padrao.map((r) => (
        <details key={r.slug} className="regras-mesa__item">
          <summary>
            <BookOpen size={16} aria-hidden /> <strong>{r.titulo}</strong> <span className="pagina__subtitulo">{r.resumo}</span>
          </summary>
          {r.texto.map((t, i) => <p key={i}>{t}</p>)}
        </details>
      ))}
      {proprias.map((r) => (
        <details key={r.id} className="regras-mesa__item regras-mesa__item--propria">
          <summary>
            <ScrollText size={16} aria-hidden /> <strong>{r.titulo}</strong> <span className="selo">Regra da mesa</span>
          </summary>
          {r.texto.split(/\n+/).map((t, i) => <p key={i}>{t}</p>)}
          {acoesPropria && <div className="regras-mesa__acoes">{acoesPropria(r)}</div>}
        </details>
      ))}
    </div>
  );
}
