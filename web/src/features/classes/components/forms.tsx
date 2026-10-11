// Formulários de apresentação: recebem valores iniciais, erros por campo e devolvem
// os dados via onEnviar. Não falam com a API.
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import {
  GRUPOS,
  ROTULO_GRUPO,
  type ClasseInput,
  type Grupo,
  type HabilidadeInput,
} from "../types";
import { ExclusividadeField } from "../../grupos/components/ExclusividadeField";
import { ClasseImagem } from "./ClasseImagem";

type BaseProps<T> = {
  onEnviar: (dados: T) => void;
  onCancelar: () => void;
  enviando?: boolean;
  /** Erros por campo vindos da API (`details`). */
  erros?: Record<string, string>;
  /** Erro geral (não associado a campo). */
  erroGeral?: string | null;
};

/** Campo numérico vazio vira undefined: a API responde "Obrigatório". */
const inteiro = (s: string) => (s.trim() === "" ? (undefined as unknown as number) : Number(s));

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

function Form({ onSubmit, children }: { onSubmit: () => void; children: ReactNode }) {
  return (
    <form
      className="form"
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
}

// ---------- Classe ----------
export function ClasseForm({
  inicial,
  rotulo = "Salvar",
  grupos = [],
  conceitos = [],
  ...p
}: BaseProps<ClasseInput> & {
  inicial?: ClasseInput;
  rotulo?: string;
  grupos?: { id: string; titulo: string }[];
  conceitos?: { id: string; titulo: string }[];
}) {
  const [v, setV] = useState({
    grupo: inicial?.grupo ?? ("COMBATENTE" as Grupo),
    titulo: inicial?.titulo ?? "",
    descricao: inicial?.descricao ?? "",
    imagemUrl: inicial?.imagemUrl ?? "",
    pontosVida: String(inicial?.pontosVida ?? ""),
    pontosMana: String(inicial?.pontosMana ?? ""),
    pontosEsforco: String(inicial?.pontosEsforco ?? ""),
  });
  const [grupoExclusivoId, setGrupoExclusivoId] = useState<string | null>(inicial?.grupoExclusivoId ?? null);
  const [conceitoId, setConceitoId] = useState<string>(inicial?.conceitoId ?? "");
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const e = p.erros ?? {};

  return (
    <Form
      onSubmit={() =>
        p.onEnviar({
          grupo: v.grupo,
          titulo: v.titulo,
          descricao: v.descricao,
          imagemUrl: v.imagemUrl.trim() || null,
          pontosVida: inteiro(v.pontosVida),
          pontosMana: inteiro(v.pontosMana),
          pontosEsforco: inteiro(v.pontosEsforco),
          grupoExclusivoId,
          conceitoId: conceitoId || null,
        })
      }
    >
      <Field rotulo="Título" erro={e.titulo}>
        <input value={v.titulo} onChange={set("titulo")} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Classe-conceito (opcional)" erro={e.conceitoId} dica="Se esta classe é uma subclasse, escolha o conceito dela (ex.: Bruxa).">
        <select value={conceitoId} onChange={(ev) => setConceitoId(ev.target.value)}>
          <option value="">Nenhuma (classe avulsa)</option>
          {conceitos.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </Field>
      <Field rotulo="Grupo" erro={e.grupo}>
        <select value={v.grupo} onChange={set("grupo")}>
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {ROTULO_GRUPO[g]}
            </option>
          ))}
        </select>
      </Field>
      <Field rotulo="Descrição" erro={e.descricao}>
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={4} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Vida base" erro={e.pontosVida} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosVida} onChange={set("pontosVida")} />
        </Field>
        <Field rotulo="Mana base" erro={e.pontosMana} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosMana} onChange={set("pontosMana")} />
        </Field>
        <Field rotulo="Esforço base" erro={e.pontosEsforco} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.pontosEsforco} onChange={set("pontosEsforco")} />
        </Field>
      </div>
      <ExclusividadeField valor={grupoExclusivoId} grupos={grupos} onChange={setGrupoExclusivoId} erro={e.grupoExclusivoId} />
      <Field rotulo="Link da imagem" erro={e.imagemUrl} dica="Opcional. Cole o endereço (https://…) de uma imagem.">
        <input type="url" value={v.imagemUrl} onChange={set("imagemUrl")} placeholder="https://…" />
      </Field>
      {v.imagemUrl.trim() && (
        <div className="form__previa">
          <ClasseImagem url={v.imagemUrl.trim()} titulo={v.titulo} />
        </div>
      )}
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo={rotulo} />
    </Form>
  );
}

// ---------- Habilidade ----------
export function HabilidadeForm({
  inicial,
  opcoesStatus = [],
  ...p
}: BaseProps<HabilidadeInput> & { inicial?: HabilidadeInput; opcoesStatus?: { id: string; nome: string; automatico: boolean }[] }) {
  const [v, setV] = useState({
    titulo: inicial?.titulo ?? "",
    descricao: inicial?.descricao ?? "",
    condicao: inicial?.condicao ?? "",
    tipoEfeito: inicial?.tipoEfeito ?? "",
    descricaoEfeito: inicial?.descricaoEfeito ?? "",
    limite: inicial?.limite ?? "",
    nivelNecessario: String(inicial?.nivelNecessario ?? 1),
    custoMana: String(inicial?.custoMana ?? 0),
    statusId: inicial?.statusId ?? "",
  });
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const e = p.erros ?? {};

  return (
    <Form
      onSubmit={() =>
        p.onEnviar({
          titulo: v.titulo,
          descricao: v.descricao,
          condicao: v.condicao.trim() || null,
          tipoEfeito: v.tipoEfeito,
          descricaoEfeito: v.descricaoEfeito,
          limite: v.limite.trim() || null,
          nivelNecessario: inteiro(v.nivelNecessario),
          custoMana: inteiro(v.custoMana),
          statusId: v.statusId || null,
        })
      }
    >
      <Field rotulo="Título" erro={e.titulo}>
        <input value={v.titulo} onChange={set("titulo")} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Descrição" erro={e.descricao}>
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={2} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Tipo de efeito" erro={e.tipoEfeito} dica="Texto livre.">
          <input value={v.tipoEfeito} onChange={set("tipoEfeito")} maxLength={60} placeholder="Ex.: Dano, Cura, Controle" />
        </Field>
        <Field rotulo="Nível necessário" erro={e.nivelNecessario} dica="1 = disponível desde o início">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.nivelNecessario} onChange={set("nivelNecessario")} />
        </Field>
        <Field rotulo="Custo de mana" erro={e.custoMana} dica="0 = não custa mana">
          <input type="number" min={0} step={1} inputMode="numeric" value={v.custoMana} onChange={set("custoMana")} />
        </Field>
      </div>
      <Field rotulo="Efeito" erro={e.descricaoEfeito} dica="O que a carta causa.">
        <textarea value={v.descricaoEfeito} onChange={set("descricaoEfeito")} maxLength={2000} rows={2} />
      </Field>
      <Field rotulo="Condição (opcional)" erro={e.condicao} dica="O que precisa acontecer para poder usar.">
        <input value={v.condicao} onChange={set("condicao")} maxLength={500} />
      </Field>
      <Field rotulo="Ativa status (opcional)" erro={e.statusId} dica="Se a carta coloca um status no alvo ou em quem usa. O mestre aplica na ficha durante a sessão.">
        <select value={v.statusId} onChange={set("statusId")}>
          <option value="">Nenhum</option>
          {opcoesStatus.filter((s) => !s.automatico).map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
      </Field>
      <Field rotulo="Limite (opcional)" erro={e.limite} dica='Ex.: "1 vez por sessão", "apenas em combate".'>
        <input value={v.limite} onChange={set("limite")} maxLength={200} />
      </Field>
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo="Salvar carta" />
    </Form>
  );
}
