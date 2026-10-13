// Formulário de NPC (apresentação). Raça obrigatória; com classe, vida/mana/esforço vêm dela; sem classe, o mestre define.
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { KitsField } from "../../kits/components/KitsField";
import { kitsPadrao } from "../../kits/types";
import type { NpcInput } from "../types";

type Opcao = { id: string; titulo: string };
type Props = {
  inicial?: Partial<NpcInput>;
  racas: Opcao[];
  classes: Opcao[];
  rotulo?: string;
  onEnviar: (dados: NpcInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

const numero = (s: string) => (s.trim() === "" ? null : Number(s));

export function NpcForm({ inicial, racas, classes, rotulo = "Salvar NPC", onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [v, setV] = useState({
    nome: inicial?.nome ?? "",
    descricao: inicial?.descricao ?? "",
    imagemUrl: inicial?.imagemUrl ?? "",
    racaId: inicial?.racaId ?? "",
    classeId: inicial?.classeId ?? "",
    nivel: String(inicial?.nivel ?? 1),
    vidaBase: String(inicial?.vidaBase ?? ""),
    manaBase: String(inicial?.manaBase ?? ""),
    esforcoBase: String(inicial?.esforcoBase ?? ""),
  });
  const [kitIds, setKitIds] = useState<string[]>(inicial?.kitIds ?? kitsPadrao());
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const semClasse = !v.classeId;

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      nome: v.nome,
      descricao: v.descricao,
      imagemUrl: v.imagemUrl.trim() || null,
      racaId: v.racaId,
      classeId: v.classeId || null,
      nivel: numero(v.nivel) ?? (undefined as unknown as number),
      vidaBase: semClasse ? numero(v.vidaBase) : null,
      manaBase: semClasse ? numero(v.manaBase) : null,
      esforcoBase: semClasse ? numero(v.esforcoBase) : null,
      kitIds,
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <Field rotulo="Nome" erro={erros.nome}>
        <input value={v.nome} onChange={set("nome")} maxLength={60} autoFocus placeholder="Ex.: Taverneiro Bruno" />
      </Field>
      <div className="form__linha">
        <Field rotulo="Raça" erro={erros.racaId}>
          <select value={v.racaId} onChange={set("racaId")}>
            <option value="">Escolha…</option>
            {racas.map((r) => <option key={r.id} value={r.id}>{r.titulo}</option>)}
          </select>
        </Field>
        <Field rotulo="Classe (opcional)" erro={erros.classeId} dica="Sem classe = NPC simples, sem cartas.">
          <select value={v.classeId} onChange={set("classeId")}>
            <option value="">Nenhuma</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
        </Field>
        <Field rotulo="Nível" erro={erros.nivel}>
          <input type="number" min={1} max={100} step={1} inputMode="numeric" value={v.nivel} onChange={set("nivel")} />
        </Field>
      </div>
      {semClasse && (
        <div className="form__linha">
          <Field rotulo="Vida base" erro={erros.vidaBase} dica="Nível 1">
            <input type="number" min={1} step={1} inputMode="numeric" value={v.vidaBase} onChange={set("vidaBase")} />
          </Field>
          <Field rotulo="Mana base" erro={erros.manaBase}>
            <input type="number" min={1} step={1} inputMode="numeric" value={v.manaBase} onChange={set("manaBase")} />
          </Field>
          <Field rotulo="Esforço base" erro={erros.esforcoBase}>
            <input type="number" min={1} step={1} inputMode="numeric" value={v.esforcoBase} onChange={set("esforcoBase")} />
          </Field>
        </div>
      )}
      <Field rotulo="Descrição (opcional)" erro={erros.descricao} dica="Quem é, o que quer, como fala.">
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={3} />
      </Field>
      <KitsField valor={kitIds} onChange={setKitIds} erro={erros.kitIds} />
      <Field rotulo="Link da imagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
        <input type="url" value={v.imagemUrl} onChange={set("imagemUrl")} placeholder="https://" />
      </Field>
      {v.imagemUrl.trim() && (
        <div className="form__previa">
          <ClasseImagem url={v.imagemUrl.trim()} titulo={v.nome} />
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
