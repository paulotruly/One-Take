// Página do grupo para o mestre: código de entrada, membros (fichas e status), criaturas invocadas, itens vagos
// e o que vale no grupo.
import { Activity, Check, Copy, Droplet, Heart, PawPrint, Plus, RefreshCw, Send, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { CriaturaModal } from "../../bestiario/pages/CriaturaModal";
import { InvocarModal } from "../../bestiario/pages/InvocarModal";
import { useClasses } from "../../classes/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { useExcluirItem, useMoverItem } from "../../fichas/api";
import { useCategoriasItem, useCriarItemNoGrupo } from "../../itens/api";
import { ItemDetalhe, ItemLinha } from "../../itens/components/ItemCartao";
import { ItemForm } from "../../itens/components/ItemForm";
import { LancarItemModal } from "../../itens/pages/LancarItemModal";
import { useCatalogo } from "../../pericias/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { useExcluirGrupo, useGrupo, useNovoCodigo } from "../api";
import { StatusMembroModal } from "./StatusMembroModal";

export function GrupoDetalhePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const grupo = useGrupo(id);
  const novoCodigo = useNovoCodigo(id);
  const excluir = useExcluirGrupo();
  const criarItem = useCriarItemNoGrupo(id);
  const moverItem = useMoverItem();
  const excluirItem = useExcluirItem();
  const classes = useClasses();
  const pericias = useCatalogo();
  const categorias = useCategoriasItem();

  const [copiado, setCopiado] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [criandoItem, setCriandoItem] = useState(false);
  const [itemDestino, setItemDestino] = useState("");
  const [lancando, setLancando] = useState(false);
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(null);
  const [statusDe, setStatusDe] = useState<string | null>(null);
  const [invocando, setInvocando] = useState(false);
  const [fichaCriatura, setFichaCriatura] = useState<string | null>(null);
  const [avisoCriatura, setAvisoCriatura] = useState<string | null>(null);

  if (grupo.isPending) return <Loading texto="Carregando grupo…" />;
  if (grupo.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre/grupos">Grupos</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(grupo.error)} onTentarNovamente={() => grupo.refetch()} />
      </div>
    );
  }
  const g = grupo.data;
  const d = g.disponiveis;
  const incompleto = d.classeIds.length === 0 || d.racaIds.length === 0 || d.atributoIds.length === 0;
  const destinos = g.membros.map((m) => ({ id: m.fichaId, rotulo: `${m.nome} (@${m.jogador.nickname})` }));
  const itemAberto = g.itensVagos.find((i) => i.id === itemAbertoId) ?? null;
  const membroStatus = g.membros.find((m) => m.fichaId === statusDe) ?? null;

  async function copiar() {
    await navigator.clipboard.writeText(g.codigo).catch(() => undefined);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/grupos">Grupos</LinkVoltar>

      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato classe-cabecalho__retrato--paisagem">
          <ClasseImagem url={g.imagemUrl} titulo={g.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          <div className="classe-cabecalho__selos">
            <span className="selo">{g.genero}</span>
            <span className="selo">{g.permitirClassesRepetidas ? "Classes podem repetir" : "Sem classes repetidas"}</span>
          </div>
          <h1>{g.titulo}</h1>
          <p className="classe-cabecalho__descricao">{g.sinopse}</p>
          <div className="classe-cabecalho__acoes">
            <Link to={`/mestre/grupos/${id}/editar`} className="btn">Editar grupo</Link>
            <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarExclusao(true); }}>Excluir grupo</Button>
          </div>
        </div>
      </header>

      <section className="painel codigo-entrada">
        <div>
          <p className="pagina__subtitulo">Código de entrada</p>
          <p className="codigo-entrada__codigo">{g.codigo}</p>
          <p className="pagina__subtitulo">{g.membros.length} de {g.limiteMembros} vagas ocupadas. O jogador digita o código em "Minhas fichas".</p>
        </div>
        <div className="classe-cabecalho__acoes">
          <Button onClick={copiar}>
            {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copiado ? "Copiado" : "Copiar"}
          </Button>
          <Button onClick={() => novoCodigo.mutate()} disabled={novoCodigo.isPending} title="O código antigo deixa de funcionar">
            <RefreshCw size={16} aria-hidden /> Gerar novo
          </Button>
        </div>
      </section>

      {incompleto && (
        <div className="aviso">
          Para os jogadores conseguirem criar fichas, libere pelo menos uma classe, uma raça e um atributo em{" "}
          <Link to={`/mestre/grupos/${id}/editar`}>Editar grupo</Link>.
        </div>
      )}

      {/* ---------- Membros ---------- */}
      <section className="secao">
        <h2>Membros</h2>
        {g.membros.length === 0 ? (
          <EmptyState compacto titulo="Ninguém entrou ainda" descricao="Compartilhe o código de entrada com os jogadores." />
        ) : (
          <ul className="membros">
            {g.membros.map((m) => (
              <li key={m.fichaId} className="membro-linha">
                <Link to={`/mestre/fichas/${m.fichaId}`} className="membro">
                  <Avatar url={m.imagemUrl ?? m.jogador.fotoUrl} nome={m.nome} tamanho={48} />
                  <div className="membro__info">
                    <strong>{m.nome}</strong>
                    <span className="pagina__subtitulo">@{m.jogador.nickname} · {m.raca} · {m.classe} · Nível {m.nivel}</span>
                    {m.status.length > 0 && (
                      <span className="membro__status">{m.status.map((s) => <StatusBadge key={s.id} nome={s.nome} tipo={s.tipo} />)}</span>
                    )}
                  </div>
                  <div className="stats stats--compacto">
                    <span className="stat stat--vida"><Heart size={12} aria-hidden /> {m.vida.atual}/{m.vida.max}</span>
                    <span className="stat stat--mana"><Droplet size={12} aria-hidden /> {m.mana.atual}/{m.mana.max}</span>
                    <span className="stat stat--esforco"><Zap size={12} aria-hidden /> {m.esforco.atual}/{m.esforco.max}</span>
                  </div>
                </Link>
                <Button pequeno onClick={() => setStatusDe(m.fichaId)} title="Aplicar ou tirar status">
                  <Activity size={14} aria-hidden /> Status
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Criaturas invocadas ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <div>
            <h2>Criaturas</h2>
            <p className="pagina__subtitulo">Criaturas invocadas por você neste grupo. Toque numa para abrir a ficha: recursos, testes e cartas do nível.</p>
          </div>
          <Button variante="primario" onClick={() => setInvocando(true)}>
            <PawPrint size={16} aria-hidden /> Invocar criatura
          </Button>
        </div>
        {avisoCriatura && <p className="sucesso">{avisoCriatura}</p>}
        {g.criaturas.length === 0 ? (
          <EmptyState compacto titulo="Nenhuma criatura no grupo" descricao="Invoque criaturas do seu bestiário quando a cena pedir." />
        ) : (
          <ul className="criaturas">
            {g.criaturas.map((c) => (
              <li key={c.id}>
                <button type="button" className="criatura" onClick={() => setFichaCriatura(c.id)}>
                  <Avatar url={c.besta.imagemUrl} nome={c.nome} tamanho={40} />
                  <span className="criatura__info">
                    <strong>{c.nome} <span className="pagina__subtitulo">· nível {c.nivel}</span></strong>
                    <span className="stats stats--compacto">
                      <span className="stat stat--vida"><Heart size={12} aria-hidden /> {c.vida.atual}/{c.vida.max}</span>
                      <span className="stat stat--mana"><Droplet size={12} aria-hidden /> {c.mana.atual}/{c.mana.max}</span>
                      <span className="stat stat--esforco"><Zap size={12} aria-hidden /> {c.esforco.atual}/{c.esforco.max}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Itens vagos ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Itens vagos no grupo</h2>
          <div className="classe-cabecalho__acoes">
            <Button variante="primario" onClick={() => setLancando(true)}>
              <Send size={16} aria-hidden /> Lançar do catálogo
            </Button>
            <Button onClick={() => { criarItem.reset(); setItemDestino(""); setCriandoItem(true); }}>
              <Plus size={16} aria-hidden /> Item avulso
            </Button>
          </div>
        </div>
        {g.itensVagos.length === 0 ? (
          <EmptyState compacto titulo="Nenhum item vago" descricao="Itens lançados sem dono ou descartados pelos jogadores aparecem aqui." />
        ) : (
          <ul className="itens">
            {g.itensVagos.map((item) => (
              <ItemLinha key={item.id} item={item} onAbrir={() => { moverItem.reset(); excluirItem.reset(); setItemAbertoId(item.id); }} />
            ))}
          </ul>
        )}
      </section>

      <section className="secao">
        <h2>O que vale neste grupo</h2>
        <p className="pagina__subtitulo">
          {d.classeIds.length} classes · {d.racaIds.length} raças · {d.atributoIds.length} atributos · {d.periciaIds.length} perícias · {d.statusIds.length} status.{" "}
          <Link to={`/mestre/grupos/${id}/editar`}>Alterar</Link>
        </p>
      </section>

      {/* ---------- Modais ---------- */}
      <Modal aberto={!!itemAberto} onFechar={() => setItemAbertoId(null)} titulo={itemAberto?.nome ?? ""}>
        {itemAberto && (
          <div className="form">
            <ItemDetalhe item={itemAberto} />
            {(moverItem.isError || excluirItem.isError) && <div className="aviso">{mensagemDeErro(moverItem.error ?? excluirItem.error)}</div>}
            <div className="acoes-item">
              {destinos.length > 0 && (
                <select value="" aria-label={`Entregar ${itemAberto.nome}`}
                  onChange={(e) => e.target.value && moverItem.mutate({ itemId: itemAberto.id, fichaId: e.target.value }, { onSuccess: () => setItemAbertoId(null) })}>
                  <option value="">Entregar para…</option>
                  {destinos.map((m) => <option key={m.id} value={m.id}>{m.rotulo}</option>)}
                </select>
              )}
              <Button variante="perigo" onClick={() => excluirItem.mutate(itemAberto.id, { onSuccess: () => setItemAbertoId(null) })}>
                <Trash2 size={16} aria-hidden /> Excluir item
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={criandoItem} onFechar={() => setCriandoItem(false)} titulo="Item avulso" largo>
        <p className="pagina__subtitulo">Um item só deste grupo, sem entrar no catálogo. Para reaproveitar em outras sessões, crie em Itens.</p>
        <ItemForm
          key={criandoItem ? "aberto" : "fechado"}
          pericias={(pericias.data ?? []).map((p) => ({ id: p.id, rotulo: `${p.nome} (${p.atributo.nome})` }))}
          classes={(classes.data ?? []).map((c) => ({ id: c.id, rotulo: c.titulo }))}
          categorias={categorias.data ?? []}
          rotulo="Criar item"
          extra={
            <Field rotulo="Entregar para" dica="Sem destino, o item fica vago no grupo." erro={errosDeCampo(criarItem.error).fichaId}>
              <select value={itemDestino} onChange={(e) => setItemDestino(e.target.value)}>
                <option value="">Ninguém (vago no grupo)</option>
                {destinos.map((m) => <option key={m.id} value={m.id}>{m.rotulo}</option>)}
              </select>
            </Field>
          }
          enviando={criarItem.isPending}
          erros={errosDeCampo(criarItem.error)}
          erroGeral={erroDeFormulario(criarItem.error)}
          onCancelar={() => setCriandoItem(false)}
          onEnviar={(campos) => criarItem.mutate({ ...campos, fichaId: itemDestino || null }, { onSuccess: () => setCriandoItem(false) })}
        />
      </Modal>

      <LancarItemModal grupoId={id} aberto={lancando} onFechar={() => setLancando(false)} destinos={destinos} />
      <StatusMembroModal grupoId={id} membro={membroStatus} statusAtivos={g.statusAtivos} onFechar={() => setStatusDe(null)} />
      <InvocarModal grupoId={id} aberto={invocando} onFechar={() => setInvocando(false)} />
      <CriaturaModal
        criaturaId={fichaCriatura}
        onFechar={() => setFichaCriatura(null)}
        onSumiu={(msg) => {
          setFichaCriatura(null);
          setAvisoCriatura(msg);
        }}
      />

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir grupo"
        mensagem={<>Excluir <strong>{g.titulo}</strong>? As {g.membros.length} fichas, as criaturas e todos os itens do grupo serão apagados. Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={() => excluir.mutate(id, { onSuccess: () => navigate("/mestre/grupos", { replace: true }) })}
      />
    </div>
  );
}
