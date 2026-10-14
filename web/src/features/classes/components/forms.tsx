// Formulários de apresentação: recebem valores iniciais, erros por campo e devolvem
// os dados via onEnviar. Não falam com a API.
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import {
  GRUPOS,
  LISTA_TIPOS_EFEITO,
  ROTULO_GRUPO,
  TIPOS_EFEITO,
  type ClasseInput,
  type Grupo,
  type HabilidadeInput,
  type LimiteUso,
  type TipoEfeito,
  ROTULO_LIMITE,
  rotuloLimite,
} from "../types";
import type { RegraDefesa } from "../../docs/regras";
import { KitsField } from "../../kits/components/KitsField";
import { kitsPadrao } from "../../kits/types";
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
  conceitos = [],
  ...p
}: BaseProps<ClasseInput> & {
  inicial?: ClasseInput;
  rotulo?: string;
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
  const [kitIds, setKitIds] = useState<string[]>(inicial?.kitIds ?? kitsPadrao());
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
          kitIds,
          conceitoId: conceitoId || null,
        })
      }
    >
      <Field rotulo="Título" erro={e.titulo}>
        <input value={v.titulo} onChange={set("titulo")} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Arquétipo (opcional)" erro={e.conceitoId} dica="Se esta classe é uma subclasse, escolha o arquétipo dela (ex.: Bruxa).">
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
      <KitsField valor={kitIds} onChange={setKitIds} erro={e.kitIds} />
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

// ---------- Limite de uso (carta e aprimoramento) ----------
/** "Sem limite" ou N vezes por combate/sessão. `semMudanca` = rótulo da opção vazia (no aprimoramento: "Sem mudança"). */
export function CampoLimite({ usos, por, onChange, erro, semMudanca = "Sem limite", rotulo = "Limite de uso" }: {
  usos: string; por: LimiteUso | ""; onChange: (usos: string, por: LimiteUso | "") => void; erro?: string; semMudanca?: string; rotulo?: string;
}) {
  return (
    <div className="form__linha">
      <Field rotulo={rotulo} erro={erro}>
        <select value={por} onChange={(ev) => onChange(ev.target.value ? usos || "1" : "", ev.target.value as LimiteUso | "")}>
          <option value="">{semMudanca}</option>
          {(Object.keys(ROTULO_LIMITE) as LimiteUso[]).map((p) => <option key={p} value={p}>Por {ROTULO_LIMITE[p]}</option>)}
        </select>
      </Field>
      {por && (
        <Field rotulo="Quantas vezes" dica={rotuloLimite(Number(usos) || null, por) ?? "De 1 a 99"}>
          <input type="number" min={1} max={99} step={1} inputMode="numeric" value={usos} onChange={(ev) => onChange(ev.target.value, por)} />
        </Field>
      )}
    </div>
  );
}

// ---------- Habilidade ----------
export function HabilidadeForm({
  inicial,
  opcoesStatus = [],
  opcoesPericias = [],
  regrasDefesa = [],
  ...p
}: BaseProps<HabilidadeInput> & {
  inicial?: HabilidadeInput;
  opcoesStatus?: { id: string; nome: string; automatico: boolean }[];
  /** Perícias do catálogo do mestre (para escolher a perícia testada pela carta). */
  opcoesPericias?: { id: string; nome: string; origemId?: string | null; atributo: { nome: string } }[];
  /** Tabela de defesa do alvo (GET /api/regras): marca as defesas sozinho ao escolher a perícia do teste. */
  regrasDefesa?: RegraDefesa[];
}) {
  const [v, setV] = useState({
    titulo: inicial?.titulo ?? "",
    descricao: inicial?.descricao ?? "",
    condicao: inicial?.condicao ?? "",
    tipoEfeito: inicial?.tipoEfeito ?? ("" as TipoEfeito | ""),
    descricaoEfeito: inicial?.descricaoEfeito ?? "",
    limiteUsos: inicial?.limiteUsos ? String(inicial.limiteUsos) : "",
    limitePor: inicial?.limitePor ?? ("" as LimiteUso | ""),
    nivelNecessario: String(inicial?.nivelNecessario ?? 1),
    custoMana: String(inicial?.custoMana ?? 0),
    statusId: inicial?.statusId ?? "",
    periciaId: inicial?.periciaId ?? "",
  });
  const [defesas, setDefesas] = useState<string[]>(inicial?.periciasDefesaIds ?? []);
  // Defesas da tabela para a perícia do teste, já como perícias do catálogo do mestre (pela base ou pelo nome).
  const mesma = (p: { id: string; nome: string; origemId?: string | null }, base: { id: string; nome: string }) =>
    (p.origemId ?? p.id) === base.id || p.nome.trim().toLowerCase() === base.nome.toLowerCase();
  const sugeridas = (periciaId: string) => {
    const ataque = opcoesPericias.find((x) => x.id === periciaId);
    if (!ataque) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const r of regrasDefesa.filter((r) => mesma(ataque, r.ataque))) {
      const d = opcoesPericias.find((x) => mesma(x, r.defesa));
      if (d) m.set(d.id, r.quando);
    }
    return m;
  };
  const sugestoes = sugeridas(v.periciaId);
  const trocarPericia = (periciaId: string) => {
    const antes = [...sugestoes.keys()];
    const depois = [...sugeridas(periciaId).keys()];
    setV({ ...v, periciaId });
    // Troca só o que foi marcado sozinho; o que o mestre marcou à mão fica.
    setDefesas((d) => [...new Set([...d.filter((x) => !antes.includes(x)), ...depois])]);
  };
  const alternarDefesa = (id: string, marcar: boolean) => setDefesas((d) => (marcar ? [...new Set([...d, id])] : d.filter((x) => x !== id)));
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });
  const e = p.erros ?? {};

  return (
    <Form
      onSubmit={() =>
        p.onEnviar({
          titulo: v.titulo,
          descricao: v.descricao,
          condicao: v.condicao.trim() || null,
          tipoEfeito: v.tipoEfeito as TipoEfeito,
          descricaoEfeito: v.descricaoEfeito,
          limiteUsos: v.limitePor ? inteiro(v.limiteUsos) : null,
          limitePor: v.limitePor || null,
          nivelNecessario: inteiro(v.nivelNecessario),
          custoMana: inteiro(v.custoMana),
          statusId: v.statusId || null,
          periciaId: v.periciaId || null,
          periciasDefesaIds: defesas,
        })
      }
    >
      <Field rotulo="Título" erro={e.titulo}>
        <input value={v.titulo} onChange={set("titulo")} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Descrição" erro={e.descricao} dica="Para negrito, use dois asteriscos: **assim**.">
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={2000} rows={2} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Tipo de efeito" erro={e.tipoEfeito} dica={v.tipoEfeito ? TIPOS_EFEITO[v.tipoEfeito].descricao : "Lista fixa do sistema."}>
          <select value={v.tipoEfeito} onChange={set("tipoEfeito")}>
            <option value="">Escolha…</option>
            {LISTA_TIPOS_EFEITO.map((t) => (
              <option key={t} value={t}>{TIPOS_EFEITO[t].rotulo}</option>
            ))}
          </select>
        </Field>
        <Field rotulo="Nível necessário" erro={e.nivelNecessario} dica="1 = disponível desde o início">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.nivelNecessario} onChange={set("nivelNecessario")} />
        </Field>
        <Field rotulo="Custo de mana" erro={e.custoMana} dica="0 = não custa mana">
          <input type="number" min={0} step={1} inputMode="numeric" value={v.custoMana} onChange={set("custoMana")} />
        </Field>
      </div>
      <Field rotulo="Efeito" erro={e.descricaoEfeito} dica="O que a carta causa. Negrito: **assim**.">
        <textarea value={v.descricaoEfeito} onChange={set("descricaoEfeito")} maxLength={2000} rows={2} />
      </Field>
      <Field rotulo="Condição (opcional)" erro={e.condicao} dica="O que precisa acontecer para poder usar.">
        <input value={v.condicao} onChange={set("condicao")} maxLength={500} />
      </Field>
      <Field rotulo="Perícia do teste" erro={e.periciaId} dica="Qual perícia o personagem testa para usar a carta. A ficha mostra o teste pronto (ex.: 2d20 + 5).">
        <select value={v.periciaId} onChange={(ev) => trocarPericia(ev.target.value)}>
          <option value="">Nenhuma (sem teste ou o mestre decide)</option>
          {opcoesPericias.map((p) => (
            <option key={p.id} value={p.id}>{p.nome} ({p.atributo.nome})</option>
          ))}
        </select>
      </Field>
      <fieldset className="form__grupo">
        <legend>Defesa do alvo (opcional)</legend>
        <p className="campo__dica">
          Perícias que o alvo pode usar para se defender desta carta. Ao escolher a perícia do teste, as defesas da regra são marcadas
          sozinhas; desmarque as que não valem ou marque outras.
        </p>
        {opcoesPericias.length === 0 ? (
          <p className="pagina__subtitulo">Nenhuma perícia no catálogo.</p>
        ) : (
          <div className="checklist">
            {opcoesPericias.map((p) => (
              <label key={p.id} className={`checklist__item ${defesas.includes(p.id) ? "checklist__item--marcado" : ""}`}>
                <input type="checkbox" checked={defesas.includes(p.id)} onChange={(ev) => alternarDefesa(p.id, ev.target.checked)} />
                <span>
                  {p.nome} <span className="pagina__subtitulo">({p.atributo.nome})</span>
                  {sugestoes.has(p.id) && <span className="campo__dica"> Pela regra: {sugestoes.get(p.id)!.toLowerCase()}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
        {e.periciasDefesaIds && <span className="campo__erro">{e.periciasDefesaIds}</span>}
      </fieldset>
      <Field rotulo="Ativa status (opcional)" erro={e.statusId} dica="Se a carta coloca um status no alvo ou em quem usa. O mestre aplica na ficha durante a sessão.">
        <select value={v.statusId} onChange={set("statusId")}>
          <option value="">Nenhum</option>
          {opcoesStatus.filter((s) => !s.automatico).map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
      </Field>
      <CampoLimite usos={v.limiteUsos} por={v.limitePor} erro={e.limiteUsos ?? e.limitePor}
        onChange={(usos, por) => setV({ ...v, limiteUsos: usos, limitePor: por })} />
      <Rodape enviando={p.enviando} onCancelar={p.onCancelar} erroGeral={p.erroGeral} rotulo="Salvar carta" />
    </Form>
  );
}
