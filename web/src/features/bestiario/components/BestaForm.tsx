// Formulário de criatura (apresentação). Valores base são do nível 1; o nível é escolhido ao invocar no grupo.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { KitsField } from "../../kits/components/KitsField";
import { kitsPadrao } from "../../kits/types";
import type { BestaInput } from "../types";

type Props = {
  inicial?: Partial<BestaInput>;
  conceitos?: { id: string; titulo: string }[];
  rotulo?: string;
  onEnviar: (dados: BestaInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

const inteiro = (s: string) => (s.trim() === "" ? (undefined as unknown as number) : Number(s));

export function BestaForm({ inicial, conceitos = [], rotulo = "Salvar", onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [v, setV] = useState({
    titulo: inicial?.titulo ?? "",
    descricao: inicial?.descricao ?? "",
    imagemUrl: inicial?.imagemUrl ?? "",
    pontosVida: String(inicial?.pontosVida ?? ""),
    pontosMana: String(inicial?.pontosMana ?? ""),
    pontosEsforco: String(inicial?.pontosEsforco ?? ""),
    deslocamento: String(inicial?.deslocamento ?? 6),
    conceitoId: inicial?.conceitoId ?? "",
  });
  const [kitIds, setKitIds] = useState<string[]>(inicial?.kitIds ?? kitsPadrao());
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      titulo: v.titulo,
      descricao: v.descricao,
      imagemUrl: v.imagemUrl.trim() || null,
      pontosVida: inteiro(v.pontosVida),
      pontosMana: inteiro(v.pontosMana),
      pontosEsforco: inteiro(v.pontosEsforco),
      deslocamento: inteiro(v.deslocamento),
      conceitoId: v.conceitoId || null,
      kitIds,
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <Field rotulo="Título" erro={erros.titulo}>
        <input value={v.titulo} onChange={set("titulo")} maxLength={80} autoFocus placeholder="Ex.: Lobo das neves" />
      </Field>
      <Field rotulo="Arquétipo de criatura (opcional)" erro={erros.conceitoId} dica="Se esta criatura é uma forma de outra (ex.: Lobo), escolha o arquétipo.">
        <select value={v.conceitoId} onChange={set("conceitoId")}>
          <option value="">Nenhuma (criatura avulsa)</option>
          {conceitos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </Field>
      <Field rotulo="Descrição" erro={erros.descricao}>
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={4} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Vida base" erro={erros.pontosVida} dica="Nível 1. Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosVida} onChange={set("pontosVida")} />
        </Field>
        <Field rotulo="Mana base" erro={erros.pontosMana} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosMana} onChange={set("pontosMana")} />
        </Field>
        <Field rotulo="Esforço base" erro={erros.pontosEsforco} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosEsforco} onChange={set("pontosEsforco")} />
        </Field>
        <Field rotulo="Deslocamento" erro={erros.deslocamento} dica="Quadrados por turno">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.deslocamento} onChange={set("deslocamento")} />
        </Field>
      </div>
      <KitsField valor={kitIds} onChange={setKitIds} erro={erros.kitIds} />
      <Field rotulo="Link da imagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
        <input type="url" value={v.imagemUrl} onChange={set("imagemUrl")} placeholder="https://" />
      </Field>
      {v.imagemUrl.trim() && (
        <div className="form__previa">
          <ClasseImagem url={v.imagemUrl.trim()} titulo={v.titulo} />
        </div>
      )}
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : rotulo}</Button>
      </div>
    </form>
  );
}
