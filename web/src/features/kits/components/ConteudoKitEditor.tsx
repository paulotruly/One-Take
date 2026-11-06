// Caixas de seleção do que está no kit, por tipo (classes, raças, criaturas, NPCs, itens, atributos, perícias, status).
import type { ReactNode } from "react";
import type { ConteudoKit } from "../types";

export type OpcaoKit = { id: string; nome: string; detalhe?: ReactNode };
export type BlocoKit = { chave: keyof ConteudoKit; titulo: string; vazio: string; opcoes: OpcaoKit[]; dica?: string };

type Props = { blocos: BlocoKit[]; valor: ConteudoKit; onChange: (v: ConteudoKit) => void };

export function ConteudoKitEditor({ blocos, valor, onChange }: Props) {
  const definir = (chave: keyof ConteudoKit, ids: string[]) => onChange({ ...valor, [chave]: ids });
  const alternar = (chave: keyof ConteudoKit, id: string, marcar: boolean) =>
    definir(chave, marcar ? [...new Set([...valor[chave], id])] : valor[chave].filter((x) => x !== id));

  return (
    <div className="disponiveis">
      {blocos.map((b) => (
        <fieldset key={b.chave} className="disponiveis__bloco">
          <legend>
            {b.titulo} <span className="pagina__subtitulo">({valor[b.chave].length} de {b.opcoes.length})</span>
          </legend>
          {b.dica && <p className="pagina__subtitulo">{b.dica}</p>}
          {b.opcoes.length === 0 ? (
            <p className="pagina__subtitulo">{b.vazio}</p>
          ) : (
            <>
              <div className="disponiveis__atalhos">
                <button type="button" className="link-botao" onClick={() => definir(b.chave, b.opcoes.map((o) => o.id))}>Marcar todos</button>
                <button type="button" className="link-botao" onClick={() => definir(b.chave, [])}>Limpar</button>
              </div>
              <div className="checklist">
                {b.opcoes.map((o) => {
                  const marcado = valor[b.chave].includes(o.id);
                  return (
                    <label key={o.id} className={`checklist__item ${marcado ? "checklist__item--marcado" : ""}`}>
                      <input type="checkbox" checked={marcado} onChange={(e) => alternar(b.chave, o.id, e.target.checked)} />
                      <span>{o.nome}{o.detalhe && <> <span className="pagina__subtitulo">· {o.detalhe}</span></>}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </fieldset>
      ))}
    </div>
  );
}
