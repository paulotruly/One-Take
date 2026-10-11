// Formulário (apresentação) de aprimoramento: a partir de um nível, o que muda na carta.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import type { AprimoramentoInput, Habilidade } from "../types";

type Props = {
  carta: Habilidade;
  inicial?: AprimoramentoInput;
  opcoesStatus: { id: string; nome: string; automatico: boolean }[];
  onEnviar: (dados: AprimoramentoInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

export function AprimoramentoForm({ carta, inicial, opcoesStatus, onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [v, setV] = useState({
    nivel: String(inicial?.nivel ?? carta.nivelNecessario + 1),
    titulo: inicial?.titulo ?? "",
    descricaoEfeito: inicial?.descricaoEfeito ?? "",
    condicao: inicial?.condicao ?? "",
    limite: inicial?.limite ?? "",
    custoMana: inicial?.custoMana === null || inicial?.custoMana === undefined ? "" : String(inicial.custoMana),
    statusId: inicial?.statusId ?? "",
  });
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      nivel: v.nivel.trim() === "" ? (undefined as unknown as number) : Number(v.nivel),
      titulo: v.titulo.trim() || null,
      descricaoEfeito: v.descricaoEfeito.trim() || null,
      condicao: v.condicao.trim() || null,
      limite: v.limite.trim() || null,
      custoMana: v.custoMana.trim() === "" ? null : Number(v.custoMana),
      statusId: v.statusId || null,
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <p className="pagina__subtitulo">
        Preencha só o que muda. O que ficar vazio continua como na carta original ("{carta.titulo}").
      </p>
      <Field rotulo="A partir do nível" erro={erros.nivel} dica={`Maior que ${carta.nivelNecessario} (nível da carta).`}>
        <input type="number" min={carta.nivelNecessario + 1} step={1} inputMode="numeric" value={v.nivel} onChange={set("nivel")} autoFocus />
      </Field>
      <Field rotulo="Novo efeito" erro={erros.descricaoEfeito} dica={`Hoje: ${carta.descricaoEfeito}`}>
        <textarea value={v.descricaoEfeito} onChange={set("descricaoEfeito")} maxLength={2000} rows={2} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Novo custo de mana" erro={erros.custoMana} dica={`Hoje: ${carta.custoMana}`}>
          <input type="number" min={0} step={1} inputMode="numeric" value={v.custoMana} onChange={set("custoMana")} />
        </Field>
        <Field rotulo="Novo título" erro={erros.titulo}>
          <input value={v.titulo} onChange={set("titulo")} maxLength={80} placeholder={carta.titulo} />
        </Field>
      </div>
      <Field rotulo="Nova condição" erro={erros.condicao}>
        <input value={v.condicao} onChange={set("condicao")} maxLength={500} placeholder={carta.condicao ?? ""} />
      </Field>
      <Field rotulo="Novo limite" erro={erros.limite}>
        <input value={v.limite} onChange={set("limite")} maxLength={200} placeholder={carta.limite ?? ""} />
      </Field>
      <Field rotulo="Passa a ativar status" erro={erros.statusId}>
        <select value={v.statusId} onChange={set("statusId")}>
          <option value="">Sem mudança</option>
          {opcoesStatus.filter((s) => !s.automatico).map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Field>
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar aprimoramento"}</Button>
      </div>
    </form>
  );
}

/** Texto curto do que muda (para listas). */
export function resumoAprimoramento(a: AprimoramentoInput & { status?: { nome: string } | null }) {
  const partes = [];
  if (a.titulo) partes.push(`título "${a.titulo}"`);
  if (a.descricaoEfeito) partes.push(`efeito: ${a.descricaoEfeito}`);
  if (a.custoMana !== null) partes.push(`custo ${a.custoMana} de mana`);
  if (a.condicao) partes.push(`condição: ${a.condicao}`);
  if (a.limite) partes.push(`limite: ${a.limite}`);
  if (a.status) partes.push(`ativa ${a.status.nome}`);
  return partes.join(" · ");
}
