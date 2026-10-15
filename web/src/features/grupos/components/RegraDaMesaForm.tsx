// Formulário (apresentação) de regra própria da mesa: título e texto.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import type { RegraDaMesaInput } from "../types";

type Props = {
  inicial?: RegraDaMesaInput;
  onEnviar: (dados: RegraDaMesaInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

export function RegraDaMesaForm({ inicial, onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [texto, setTexto] = useState(inicial?.texto ?? "");
  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({ titulo: titulo.trim(), texto: texto.trim() });
  }
  return (
    <form className="form" noValidate onSubmit={enviar}>
      <Field rotulo="Título" erro={erros.titulo}>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Regra" erro={erros.texto} dica="Como funciona nesta mesa. Cada linha vira um parágrafo.">
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} rows={6} />
      </Field>
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar regra"}</Button>
      </div>
    </form>
  );
}
