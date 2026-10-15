// Formulário (apresentação) de aprimoramento: a carta inteira a partir de um nível. Vem preenchido com a versão anterior
// (o aprimoramento de nível menor ou a carta); o mestre muda o que quiser, inclusive a descrição daquele nível.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import type { AprimoramentoInput, LimiteUso } from "../types";
import { versaoAntes, type CartaComAprimoramentos } from "../aprimoramento";
import { CampoLimite } from "./forms";

type Props = {
  carta: CartaComAprimoramentos;
  inicial?: AprimoramentoInput;
  opcoesStatus: { id: string; nome: string; automatico: boolean }[];
  onEnviar: (dados: AprimoramentoInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

export function AprimoramentoForm({ carta, inicial, opcoesStatus, onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const ultimoNivel = Math.max(carta.nivelNecessario, ...(carta.aprimoramentos ?? []).map((a) => a.nivel));
  const nivelInicial = inicial?.nivel ?? ultimoNivel + 1;
  const base = inicial ?? versaoAntes(carta, nivelInicial);
  const [v, setV] = useState({
    nivel: String(nivelInicial),
    titulo: base.titulo,
    descricao: base.descricao,
    descricaoEfeito: base.descricaoEfeito,
    condicao: base.condicao ?? "",
    limiteUsos: base.limiteUsos ? String(base.limiteUsos) : "",
    limitePor: base.limitePor ?? ("" as LimiteUso | ""),
    custoMana: String(base.custoMana),
    statusId: base.statusId ?? "",
  });
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const numero = (t: string) => (t.trim() === "" ? (undefined as unknown as number) : Number(t));

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      nivel: numero(v.nivel),
      titulo: v.titulo.trim(),
      descricao: v.descricao.trim(),
      descricaoEfeito: v.descricaoEfeito.trim(),
      condicao: v.condicao.trim() || null,
      limiteUsos: v.limitePor ? numero(v.limiteUsos) : null,
      limitePor: v.limitePor || null,
      custoMana: numero(v.custoMana),
      statusId: v.statusId || null,
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <p className="pagina__subtitulo">
        A carta inteira a partir deste nível. Os campos já vêm com a versão anterior: mude só o que quiser (o resto pode ficar igual).
      </p>
      <div className="form__linha">
        <Field rotulo="A partir do nível" erro={erros.nivel} dica={`Maior que ${carta.nivelNecessario} (nível da carta).`}>
          <input type="number" min={carta.nivelNecessario + 1} step={1} inputMode="numeric" value={v.nivel} onChange={set("nivel")} autoFocus />
        </Field>
        <Field rotulo="Título" erro={erros.titulo}>
          <input value={v.titulo} onChange={set("titulo")} maxLength={80} />
        </Field>
      </div>
      <Field rotulo="Descrição neste nível" erro={erros.descricao} dica="O sabor da carta neste nível. Pode ser igual à anterior.">
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={2} />
      </Field>
      <Field rotulo="Efeito" erro={erros.descricaoEfeito}>
        <textarea value={v.descricaoEfeito} onChange={set("descricaoEfeito")} maxLength={2000} rows={2} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Custo de mana" erro={erros.custoMana} dica="0 = não custa mana.">
          <input type="number" min={0} step={1} inputMode="numeric" value={v.custoMana} onChange={set("custoMana")} />
        </Field>
        <Field rotulo="Condição (opcional)" erro={erros.condicao}>
          <input value={v.condicao} onChange={set("condicao")} maxLength={500} />
        </Field>
      </div>
      <CampoLimite usos={v.limiteUsos} por={v.limitePor} erro={erros.limiteUsos ?? erros.limitePor}
        onChange={(usos, por) => setV({ ...v, limiteUsos: usos, limitePor: por })} />
      <Field rotulo="Ativa status (no alvo)" erro={erros.statusId}>
        <select value={v.statusId} onChange={set("statusId")}>
          <option value="">Nenhum</option>
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
