// Tela do kit: o que está dentro, por tipo, com link para cada coisa. "Editar conteúdo" troca por caixas de seleção
// com tudo o que o mestre tem; salvar troca o conteúdo do kit inteiro (e as mesas que usam o kit acompanham).
import { Check, ChevronRight, ListChecks, Package, Pencil } from "lucide-react";
import { Link, useParams } from "react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useBestas } from "../../bestiario/api";
import { ROTULO_GRUPO } from "../../classes/types";
import { useClasses } from "../../classes/api";
import { useCatalogoItens } from "../../itens/api";
import { useNpcs } from "../../npcs/api";
import { useAtributos, useCatalogo } from "../../pericias/api";
import { useRacas } from "../../racas/api";
import { useStatus } from "../../status/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { useDefinirConteudoKit, useEditarKit, useKit, useKitAtivo } from "../api";
import { ConteudoKitEditor, type BlocoKit } from "../components/ConteudoKitEditor";
import type { ConteudoKit, KitDetalhe } from "../types";

type Coisa = { id: string; nome: string };

function Bloco({ titulo, itens, item }: { titulo: string; itens: Coisa[]; item: (c: Coisa) => ReactNode }) {
  if (itens.length === 0) return null;
  return (
    <section className="secao">
      <h2>{titulo} <span className="pagina__subtitulo">({itens.length})</span></h2>
      <div className="kit-grade">{itens.map(item)}</div>
    </section>
  );
}

const ids = (l: Coisa[]) => l.map((c) => c.id);
const conteudoDe = (d: KitDetalhe["dentro"]): ConteudoKit => ({
  classeIds: ids(d.classes), racaIds: ids(d.racas), atributoIds: ids(d.atributos), periciaIds: ids(d.pericias),
  statusIds: ids(d.status), itemIds: ids(d.itens), bestaIds: ids(d.bestas), npcIds: ids(d.npcs),
});

export function KitDetalhePage() {
  const { id = "" } = useParams();
  const kit = useKit(id);
  const { kitId, definir } = useKitAtivo();
  const [editandoConteudo, setEditandoConteudo] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);

  if (kit.isPending) return <Loading texto="Carregando kit…" />;
  if (kit.isError) return <ErrorState mensagem={mensagemDeErro(kit.error)} onTentarNovamente={() => kit.refetch()} />;
  const k = kit.data;
  const d = k.dentro;
  const link = (para: (c: Coisa) => string) => (c: Coisa) => <Link key={c.id} to={para(c)} className="kit-item">{c.nome} <ChevronRight size={14} aria-hidden /></Link>;
  const vazio = Object.entries(d).every(([tipo, l]) => tipo === "grupos" || l.length === 0);

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/kits">Kits de RPG</LinkVoltar>
      <div className="pagina__cabecalho">
        <div>
          <h1><Package size={24} aria-hidden /> {k.nome}</h1>
          {k.descricao && <p className="pagina__subtitulo">{k.descricao}</p>}
        </div>
        <div className="classe-cabecalho__acoes">
          <Button onClick={() => setEditandoNome(true)}><Pencil size={16} aria-hidden /> Editar nome</Button>
          {!editandoConteudo && <Button onClick={() => setEditandoConteudo(true)}><ListChecks size={16} aria-hidden /> Editar conteúdo</Button>}
          {k.id === kitId ? (
            <Button onClick={() => definir(null)}><Check size={16} aria-hidden /> Kit ativo · sair do kit</Button>
          ) : (
            <Button variante="primario" onClick={() => definir(k.id)}>Usar este kit</Button>
          )}
        </div>
      </div>

      {editandoConteudo ? (
        <EditarConteudo kit={k} onFechar={() => setEditandoConteudo(false)} />
      ) : (
        <>
          {!vazio && (
            <p className="pagina__subtitulo kit-resumo">
              {[[d.classes.length, "classes"], [d.racas.length, "raças"], [d.bestas.length, "criaturas"], [d.npcs.length, "NPCs"], [d.itens.length, "itens"]]
                .filter(([n]) => n)
                .map(([n, r]) => `${n} ${r}`)
                .join(" · ")}
            </p>
          )}
          {vazio && (
            <p className="pagina__subtitulo">
              Vazio por enquanto. Use Editar conteúdo para marcar o que entra no kit, ou deixe o kit ativo e crie as coisas: elas entram nele.
            </p>
          )}
          <Bloco titulo="Classes" itens={d.classes} item={link((c) => `/mestre/classes/${c.id}`)} />
          <Bloco titulo="Raças" itens={d.racas} item={link((c) => `/mestre/racas/${c.id}`)} />
          <Bloco titulo="Criaturas" itens={d.bestas} item={link((c) => `/mestre/bestiario/${c.id}`)} />
          <Bloco titulo="NPCs" itens={d.npcs} item={link((c) => `/mestre/npcs/${c.id}`)} />
          <Bloco titulo="Atributos" itens={d.atributos} item={link(() => "/mestre/pericias")} />
          <Bloco titulo="Perícias" itens={d.pericias} item={(c) => (
            <Link key={c.id} to="/mestre/pericias" className="kit-item">
              <span>{c.nome} <span className="pagina__subtitulo">({d.pericias.find((p) => p.id === c.id)?.atributo})</span></span> <ChevronRight size={14} aria-hidden />
            </Link>
          )} />
          <Bloco titulo="Status" itens={d.status} item={(c) => (
            <Link key={c.id} to="/mestre/status"><StatusBadge nome={c.nome} tipo={d.status.find((s) => s.id === c.id)!.tipo} /></Link>
          )} />
          <Bloco titulo="Itens do catálogo" itens={d.itens} item={link(() => "/mestre/itens")} />
          <Bloco titulo="Mesas que usam o kit" itens={d.grupos} item={link((c) => `/mestre/grupos/${c.id}`)} />
        </>
      )}

      <EditarNome kit={k} aberto={editandoNome} onFechar={() => setEditandoNome(false)} />
    </div>
  );
}

/** Caixas de seleção com tudo o que o mestre tem, já marcadas com o que está no kit. */
function EditarConteudo({ kit, onFechar }: { kit: KitDetalhe; onFechar: () => void }) {
  const classes = useClasses();
  const racas = useRacas();
  const bestas = useBestas();
  const npcs = useNpcs();
  const itens = useCatalogoItens();
  const atributos = useAtributos();
  const pericias = useCatalogo();
  const status = useStatus();
  const salvar = useDefinirConteudoKit(kit.id);
  const [valor, setValor] = useState<ConteudoKit>(() => conteudoDe(kit.dentro));

  const consultas = [classes, racas, bestas, npcs, itens, atributos, pericias, status];
  if (consultas.some((c) => c.isPending)) return <Loading compacto texto="Carregando o seu conteúdo…" />;
  const erro = consultas.find((c) => c.isError)?.error;
  if (erro) return <ErrorState mensagem={mensagemDeErro(erro)} />;

  const blocos: BlocoKit[] = [
    { chave: "classeIds", titulo: "Classes", vazio: "Nenhuma classe criada ainda.", opcoes: (classes.data ?? []).map((c) => ({ id: c.id, nome: c.titulo, detalhe: ROTULO_GRUPO[c.grupo] })) },
    { chave: "racaIds", titulo: "Raças", vazio: "Nenhuma raça criada ainda.", opcoes: (racas.data ?? []).map((r) => ({ id: r.id, nome: r.titulo })) },
    { chave: "bestaIds", titulo: "Criaturas", vazio: "Nenhuma criatura no bestiário ainda.", opcoes: (bestas.data ?? []).map((b) => ({ id: b.id, nome: b.titulo })) },
    { chave: "npcIds", titulo: "NPCs", vazio: "Nenhum NPC criado ainda.", opcoes: (npcs.data ?? []).map((n) => ({ id: n.id, nome: n.nome })) },
    { chave: "itemIds", titulo: "Itens do catálogo", vazio: "Nenhum item no catálogo ainda.", opcoes: (itens.data ?? []).map((i) => ({ id: i.id, nome: i.nome })) },
    {
      chave: "atributoIds", titulo: "Atributos", vazio: "Nenhum atributo criado ainda.",
      dica: "Numa mesa com este kit, o atributo marcado leva todas as perícias dele.",
      opcoes: (atributos.data ?? []).map((a) => ({ id: a.id, nome: a.nome })),
    },
    { chave: "periciaIds", titulo: "Perícias", vazio: "Nenhuma perícia criada ainda.", opcoes: (pericias.data ?? []).map((p) => ({ id: p.id, nome: p.nome, detalhe: p.atributo.nome })) },
    {
      chave: "statusIds", titulo: "Status", vazio: "Nenhum status criado ainda.",
      dica: "Os automáticos (vida, mana ou esforço em 0) valem em toda mesa, marcados ou não.",
      opcoes: (status.data ?? []).map((s) => ({ id: s.id, nome: s.nome, detalhe: s.automatico ? "automático" : undefined })),
    },
  ];

  return (
    <section className="secao">
      <p className="pagina__subtitulo">
        Marque o que entra no kit. As mesas que usam este kit passam a valer com o que estiver marcado aqui.
      </p>
      <ConteudoKitEditor blocos={blocos} valor={valor} onChange={setValor} />
      {salvar.isError && <div className="aviso">{erroDeFormulario(salvar.error)}</div>}
      <div className="barra-acoes">
        <Button onClick={onFechar} disabled={salvar.isPending}>Cancelar</Button>
        <Button variante="primario" disabled={salvar.isPending} onClick={() => salvar.mutate(valor, { onSuccess: onFechar })}>
          {salvar.isPending ? "Salvando…" : "Salvar conteúdo"}
        </Button>
      </div>
    </section>
  );
}

function EditarNome({ kit, aberto, onFechar }: { kit: KitDetalhe; aberto: boolean; onFechar: () => void }) {
  const editar = useEditarKit();
  const [nome, setNome] = useState(kit.nome);
  const [descricao, setDescricao] = useState(kit.descricao);
  function enviar(e: FormEvent) {
    e.preventDefault();
    editar.mutate({ id: kit.id, dados: { nome, descricao } }, { onSuccess: onFechar });
  }
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Editar kit">
      <form className="form" noValidate onSubmit={enviar}>
        <Field rotulo="Nome" erro={errosDeCampo(editar.error).nome}>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} autoFocus />
        </Field>
        <Field rotulo="Descrição (opcional)" erro={errosDeCampo(editar.error).descricao}>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} rows={3} />
        </Field>
        {editar.isError && <div className="aviso">{erroDeFormulario(editar.error)}</div>}
        <div className="modal__acoes">
          <Button onClick={onFechar} disabled={editar.isPending}>Cancelar</Button>
          <Button type="submit" variante="primario" disabled={editar.isPending}>{editar.isPending ? "Salvando…" : "Salvar"}</Button>
        </div>
      </form>
    </Modal>
  );
}
