// Formulários de apresentação de perícias e atributos. Não falam com a API.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import {
  CATEGORIAS,
  LISTA_CATEGORIAS,
  type AtributoInput,
  type AtributoResumo,
  type CategoriaPericia,
  type PericiaInput,
} from "../types";
import { ExclusividadeField } from "../../grupos/components/ExclusividadeField";
import { CategoriaIcone } from "./CategoriaIcone";

type BaseProps<T> = {
  onEnviar: (dados: T) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

function Rodape({ enviando, onCancelar, erroGeral, rotulo }: { enviando?: boolean; onCancelar: () => void; erroGeral?: string | null; rotulo: string }) {
  return (
    <>
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" variante="primario" disabled={enviando}>
          {enviando ? "Salvando…" : rotulo}
        </Button>
      </div>
    </>
  );
}

const enviarCom = (fn: () => void) => (e: FormEvent) => {
  e.preventDefault();
  fn();
};

/** Campo numérico vazio vira undefined: a API responde "Obrigatório". */
const inteiro = (s: string) => (s.trim() === "" ? (undefined as unknown as number) : Number(s));

/** Atributos na ordem de exibição: fixos primeiro, depois os do mestre por nome. */
const ordenar = (a: AtributoResumo, b: AtributoResumo) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR");

// ---------- Perícia do catálogo ----------
export function PericiaCatalogoForm({
  inicial,
  atributos,
  ...p
}: BaseProps<PericiaInput> & { inicial?: PericiaInput; atributos: AtributoResumo[] }) {
  const [v, setV] = useState({
    nome: inicial?.nome ?? "",
    descricao: inicial?.descricao ?? "",
    categoria: inicial?.categoria ?? ("FISICO" as CategoriaPericia),
    atributoId: inicial?.atributoId ?? [...atributos].sort(ordenar)[0]?.id ?? "",
  });
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const e = p.erros ?? {};

  return (
    <form className="form" noValidate onSubmit={enviarCom(() => p.onEnviar(v))}>
      <Field rotulo="Nome" erro={e.nome}>
        <input value={v.nome} onChange={set("nome")} maxLength={60} autoFocus />
      </Field>
      <div className="form__linha">
        <Field rotulo="Atributo" erro={e.atributoId}>
          <select value={v.atributoId} onChange={set("atributoId")}>
            {[...atributos].sort(ordenar).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field rotulo="Categoria" erro={e.categoria} dica={CATEGORIAS[v.categoria].descricao}>
          <select value={v.categoria} onChange={set("categoria")}>
            {LISTA_CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIAS[c].rotulo}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field rotulo="Descrição" erro={e.descricao}>
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={1000} rows={3} />
      </Field>
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo="Salvar perícia" />
    </form>
  );
}

// ---------- Atributo ----------
export function AtributoForm({
  inicial,
  grupos = [],
  ...p
}: BaseProps<AtributoInput> & { inicial?: AtributoInput; grupos?: { id: string; titulo: string }[] }) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [grupoExclusivoId, setGrupoExclusivoId] = useState<string | null>(inicial?.grupoExclusivoId ?? null);
  const e = p.erros ?? {};
  return (
    <form className="form" noValidate onSubmit={enviarCom(() => p.onEnviar({ nome, descricao, grupoExclusivoId }))}>
      <Field rotulo="Nome" erro={e.nome}>
        <input value={nome} onChange={(ev) => setNome(ev.target.value)} maxLength={60} autoFocus />
      </Field>
      <Field rotulo="Descrição (opcional)" erro={e.descricao}>
        <textarea value={descricao} onChange={(ev) => setDescricao(ev.target.value)} maxLength={1000} rows={3} />
      </Field>
      <ExclusividadeField valor={grupoExclusivoId} grupos={grupos} onChange={setGrupoExclusivoId} erro={e.grupoExclusivoId} />
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo="Salvar atributo" />
    </form>
  );
}

// ---------- Perícia numa classe ou raça ----------
type Opcao = { id: string; nome: string; categoria: CategoriaPericia; atributo: AtributoResumo };

/**
 * Escolhe uma perícia JÁ cadastrada no catálogo e um valor (modificador da classe ou pontos da raça).
 * Com `fixa`, a perícia não muda (edição só do valor).
 */
export function VinculoPericiaForm({
  opcoes,
  fixa,
  valorInicial = 0,
  rotuloValor,
  campoValor,
  dicaValor,
  minimo,
  ...p
}: BaseProps<{ periciaId: string; valor: number }> & {
  opcoes: Opcao[];
  fixa?: Opcao;
  valorInicial?: number;
  rotuloValor: string;
  /** Nome do campo na API, para mostrar o erro de validação certo. */
  campoValor: string;
  dicaValor?: string;
  minimo?: number;
}) {
  const [periciaId, setPericiaId] = useState(fixa?.id ?? opcoes[0]?.id ?? "");
  const [valor, setValor] = useState(String(valorInicial));
  const e = p.erros ?? {};

  const grupos = new Map<string, { atributo: AtributoResumo; itens: Opcao[] }>();
  for (const o of opcoes) {
    const g = grupos.get(o.atributo.id) ?? { atributo: o.atributo, itens: [] };
    g.itens.push(o);
    grupos.set(o.atributo.id, g);
  }

  return (
    <form className="form" noValidate onSubmit={enviarCom(() => p.onEnviar({ periciaId, valor: inteiro(valor) }))}>
      {fixa ? (
        <p className="pericia__nome">
          <CategoriaIcone categoria={fixa.categoria} />
          <strong>{fixa.nome}</strong>
          <span className="pagina__subtitulo">{fixa.atributo.nome}</span>
        </p>
      ) : (
        <Field rotulo="Perícia do catálogo">
          <select value={periciaId} onChange={(ev) => setPericiaId(ev.target.value)} autoFocus>
            {[...grupos.values()]
              .sort((a, b) => ordenar(a.atributo, b.atributo))
              .map(({ atributo, itens }) => (
                <optgroup key={atributo.id} label={atributo.nome}>
                  {itens.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome} ({CATEGORIAS[o.categoria].rotulo})
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </Field>
      )}
      <Field rotulo={rotuloValor} erro={e[campoValor]} dica={dicaValor}>
        <input
          type="number"
          step={1}
          min={minimo}
          inputMode="numeric"
          value={valor}
          onChange={(ev) => setValor(ev.target.value)}
          autoFocus={!!fixa}
        />
      </Field>
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo={fixa ? "Salvar" : "Adicionar"} />
    </form>
  );
}
