import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { ExclusividadeField } from "../../grupos/components/ExclusividadeField";
import type { RacaInput } from "../types";

type Props = {
  inicial?: RacaInput;
  grupos?: { id: string; titulo: string }[];
  conceitos?: { id: string; titulo: string }[];
  onEnviar: (dados: RacaInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

/** Formulário de apresentação da raça. Não fala com a API. */
export function RacaForm({ inicial, grupos = [], conceitos = [], onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [deslocamento, setDeslocamento] = useState(String(inicial?.deslocamento ?? ""));
  const [imagemUrl, setImagemUrl] = useState(inicial?.imagemUrl ?? "");
  const [grupoExclusivoId, setGrupoExclusivoId] = useState<string | null>(inicial?.grupoExclusivoId ?? null);
  const [conceitoId, setConceitoId] = useState(inicial?.conceitoId ?? "");

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      titulo,
      descricao,
      imagemUrl: imagemUrl.trim() || null,
      grupoExclusivoId,
      conceitoId: conceitoId || null,
      deslocamento: deslocamento.trim() === "" ? (undefined as unknown as number) : Number(deslocamento),
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <Field rotulo="Título" erro={erros.titulo}>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Arquétipo de raça (opcional)" erro={erros.conceitoId} dica="Se esta raça é uma sub-raça, escolha o arquétipo dela (ex.: Elfo).">
        <select value={conceitoId} onChange={(e) => setConceitoId(e.target.value)}>
          <option value="">Nenhuma (raça avulsa)</option>
          {conceitos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </Field>
      <Field rotulo="Deslocamento" erro={erros.deslocamento} dica="Quadrados no grid que o personagem anda por turno. Ex.: humano = 8.">
        <input type="number" min={1} step={1} inputMode="numeric" value={deslocamento} onChange={(e) => setDeslocamento(e.target.value)} />
      </Field>
      <Field rotulo="Descrição" erro={erros.descricao}>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} rows={4} />
      </Field>
      <ExclusividadeField valor={grupoExclusivoId} grupos={grupos} onChange={setGrupoExclusivoId} erro={erros.grupoExclusivoId} />
      <Field rotulo="Link da imagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
        <input type="url" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://" />
      </Field>
      {imagemUrl.trim() && (
        <div className="form__previa">
          <ClasseImagem url={imagemUrl.trim()} titulo={titulo} />
        </div>
      )}
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" variante="primario" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar raça"}
        </Button>
      </div>
    </form>
  );
}
