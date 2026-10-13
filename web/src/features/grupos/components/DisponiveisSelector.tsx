// Escolha do que vale no grupo: classes, raças, atributos (grupos de perícias), perícias específicas e status.
// O kit do grupo só pré-marca; aqui o mestre ajusta à vontade.
import type { ReactNode } from "react";
import { ROTULO_GRUPO, type Classe } from "../../classes/types";
import type { Atributo, PericiaCatalogo } from "../../pericias/types";
import type { Raca } from "../../racas/types";
import type { Status } from "../../status/types";
import { StatusBadge } from "../../status/components/StatusBadge";
import type { Disponiveis } from "../types";

type Props = {
  classes: Classe[];
  racas: Raca[];
  atributos: Atributo[];
  pericias: PericiaCatalogo[];
  status: Status[];
  valor: Disponiveis;
  onChange: (d: Disponiveis) => void;
};

function Caixa({ marcado, onChange, children }: { marcado: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className={`checklist__item ${marcado ? "checklist__item--marcado" : ""}`}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function alternar(lista: string[], id: string, marcar: boolean) {
  return marcar ? [...new Set([...lista, id])] : lista.filter((x) => x !== id);
}

export function DisponiveisSelector({ classes: cls, racas: rcs, atributos: atrs, pericias, status, valor, onChange }: Props) {
  const set = (parcial: Partial<Disponiveis>) => onChange({ ...valor, ...parcial });

  function marcarAtributo(a: Atributo, marcar: boolean) {
    const doAtributo = pericias.filter((p) => p.atributoId === a.id).map((p) => p.id);
    set({
      atributoIds: alternar(valor.atributoIds, a.id, marcar),
      periciaIds: marcar ? [...new Set([...valor.periciaIds, ...doAtributo])] : valor.periciaIds.filter((id) => !doAtributo.includes(id)),
    });
  }

  function todos(campo: keyof Disponiveis, ids: string[], marcar: boolean) {
    set({ [campo]: marcar ? [...new Set([...valor[campo], ...ids])] : valor[campo].filter((id) => !ids.includes(id)) });
  }

  return (
    <div className="disponiveis">
      <fieldset className="disponiveis__bloco">
        <legend>
          Classes <span className="pagina__subtitulo">({valor.classeIds.length} de {cls.length})</span>
        </legend>
        <div className="disponiveis__atalhos">
          <button type="button" className="link-botao" onClick={() => todos("classeIds", cls.map((c) => c.id), true)}>Marcar todas</button>
          <button type="button" className="link-botao" onClick={() => todos("classeIds", cls.map((c) => c.id), false)}>Limpar</button>
        </div>
        {cls.length === 0 ? (
          <p className="pagina__subtitulo">Nenhuma classe disponível.</p>
        ) : (
          <div className="checklist">
            {cls.map((c) => (
              <Caixa key={c.id} marcado={valor.classeIds.includes(c.id)} onChange={(m) => set({ classeIds: alternar(valor.classeIds, c.id, m) })}>
                {c.titulo} <span className="pagina__subtitulo">· {ROTULO_GRUPO[c.grupo]}{c.fixa ? " · fixa" : ""}</span>
              </Caixa>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="disponiveis__bloco">
        <legend>
          Raças <span className="pagina__subtitulo">({valor.racaIds.length} de {rcs.length})</span>
        </legend>
        <div className="disponiveis__atalhos">
          <button type="button" className="link-botao" onClick={() => todos("racaIds", rcs.map((r) => r.id), true)}>Marcar todas</button>
          <button type="button" className="link-botao" onClick={() => todos("racaIds", rcs.map((r) => r.id), false)}>Limpar</button>
        </div>
        {rcs.length === 0 ? (
          <p className="pagina__subtitulo">Nenhuma raça criada ainda. Crie raças no menu Raças.</p>
        ) : (
          <div className="checklist">
            {rcs.map((r) => (
              <Caixa key={r.id} marcado={valor.racaIds.includes(r.id)} onChange={(m) => set({ racaIds: alternar(valor.racaIds, r.id, m) })}>
                {r.titulo} <span className="pagina__subtitulo">· {r.deslocamento} quadrados</span>
              </Caixa>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="disponiveis__bloco">
        <legend>
          Atributos e perícias <span className="pagina__subtitulo">({valor.atributoIds.length} atributos, {valor.periciaIds.length} perícias)</span>
        </legend>
        <p className="pagina__subtitulo">Marque um atributo para levar todas as perícias dele; depois desmarque as que não quiser.</p>
        {atrs.map((a) => {
          const marcado = valor.atributoIds.includes(a.id);
          const doAtributo = pericias.filter((p) => p.atributoId === a.id);
          return (
            <div key={a.id} className="disponiveis__atributo">
              <Caixa marcado={marcado} onChange={(m) => marcarAtributo(a, m)}>
                <strong>{a.nome}</strong>
              </Caixa>
              {marcado && doAtributo.length > 0 && (
                <div className="checklist checklist--recuado">
                  {doAtributo.map((p) => (
                    <Caixa key={p.id} marcado={valor.periciaIds.includes(p.id)} onChange={(m) => set({ periciaIds: alternar(valor.periciaIds, p.id, m) })}>
                      {p.nome}
                    </Caixa>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </fieldset>

      <fieldset className="disponiveis__bloco">
        <legend>
          Status <span className="pagina__subtitulo">({valor.statusIds.length} de {status.length})</span>
        </legend>
        <p className="pagina__subtitulo">Opcional. Só os status marcados aparecem nas fichas deste grupo e podem ser aplicados.</p>
        <div className="disponiveis__atalhos">
          <button type="button" className="link-botao" onClick={() => todos("statusIds", status.map((s) => s.id), true)}>Marcar todos</button>
          <button type="button" className="link-botao" onClick={() => todos("statusIds", status.map((s) => s.id), false)}>Limpar</button>
        </div>
        <div className="checklist">
          {status.map((s) => (
            <Caixa key={s.id} marcado={valor.statusIds.includes(s.id)} onChange={(m) => set({ statusIds: alternar(valor.statusIds, s.id, m) })}>
              <StatusBadge nome={s.nome} tipo={s.tipo} /> {s.automatico && <span className="pagina__subtitulo">automático</span>}
            </Caixa>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
