// Página do grupo para o mestre. Mesa: membros e criaturas, para usar na sessão. Preparação: o que falta, NPCs, itens vagos,
// regras e o que vale no grupo.
import { Check, ClipboardList, Copy, Link2, PawPrint, Plus, RefreshCw, Send, Swords, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Abas } from "../../../components/ui/Abas";
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
import { useNpcs } from "../../npcs/api";
import { NpcLinha } from "../../npcs/components/NpcLinha";
import { ItemDetalhe, ItemLinha } from "../../itens/components/ItemCartao";
import { ItemForm } from "../../itens/components/ItemForm";
import { LancarItemModal } from "../../itens/pages/LancarItemModal";
import { useCatalogo } from "../../pericias/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { useRegras } from "../../docs/regras";
import { useCriarRegra, useEditarRegra, useExcluirGrupo, useExcluirRegra, useGrupo, useNovoCodigo } from "../api";
import { BarrasDeRecurso, MembroCartao } from "../components/MembroCartao";
import { ProntidaoGrupo } from "../components/ProntidaoGrupo";
import { RegraDaMesaForm } from "../components/RegraDaMesaForm";
import { RegrasDaMesa } from "../components/RegrasDaMesa";
import type { RegraDaMesa } from "../types";
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
  const npcs = useNpcs(grupo.data?.kitId ?? null);
  const { regrasPadrao } = useRegras();
  const criarRegra = useCriarRegra(id);
  const editarRegra = useEditarRegra();
  const excluirRegra = useExcluirRegra();
  // Regra própria em edição: null = nova; undefined = fechado.
  const [regraEmEdicao, setRegraEmEdicao] = useState<RegraDaMesa | null | undefined>(undefined);
  const [regraAExcluir, setRegraAExcluir] = useState<RegraDaMesa | null>(null);

  const [copiado, setCopiado] = useState<"link" | "codigo" | null>(null);
  const [params, setParams] = useSearchParams();
  const aba = params.get("aba") === "preparacao" ? "preparacao" : "mesa";
  const [confirmarCodigo, setConfirmarCodigo] = useState(false);
  const [itemAExcluir, setItemAExcluir] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [criandoItem, setCriandoItem] = useState(false);
  const [itemDestino, setItemDestino] = useState("");
  const [lancando, setLancando] = useState(false);
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(null);
  const [statusDe, setStatusDe] = useState<string | null>(null);
  const [invocando, setInvocando] = useState(false);
  const [fichaCriatura, setFichaCriatura] = useState<string | null>(null);
  const [avisoCriatura, setAvisoCriatura] = useState<string | null>(null);

  if (grupo.isPending) return <Loading texto="Carregando mesa…" />;
  if (grupo.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre/grupos">Mesas</LinkVoltar>
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

  async function copiar(oque: "link" | "codigo", texto: string) {
    await navigator.clipboard.writeText(texto).catch(() => undefined);
    setCopiado(oque);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/grupos">Mesas</LinkVoltar>

      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato classe-cabecalho__retrato--paisagem">
          <ClasseImagem url={g.imagemUrl} titulo={g.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          <div className="classe-cabecalho__selos">
            <span className="selo">{g.genero}</span>
            {g.kit && <span className="selo">Kit: {g.kit.nome}</span>}
            <span className="selo">{g.permitirClassesRepetidas ? "Classes podem repetir" : "Sem classes repetidas"}</span>
            {([["Combatentes", g.limiteCombatentes], ["Vanguardistas", g.limiteVanguardistas], ["Suportes", g.limiteSuportes]] as const).map(
              ([rotulo, limite]) => limite !== null && <span key={rotulo} className="selo">{limite === 0 ? `Sem ${rotulo}` : `Até ${limite} ${rotulo}`}</span>,
            )}
          </div>
          <h1>{g.titulo}</h1>
          <p className="classe-cabecalho__descricao">{g.sinopse}</p>
          <div className="classe-cabecalho__acoes">
            <Link to={`/mestre/grupos/${id}/editar`} className="btn">Editar mesa</Link>
          </div>
        </div>
      </header>

      <section className="painel codigo-entrada">
        <div>
          <p className="pagina__subtitulo">Código de entrada</p>
          <p className="codigo-entrada__codigo">{g.codigo}</p>
          <p className="pagina__subtitulo">{g.membros.length} de {g.limiteMembros} vagas ocupadas. Envie o link ou peça para o jogador digitar o código em "Minhas fichas".</p>
        </div>
        <div className="classe-cabecalho__acoes">
          <Button variante="primario" onClick={() => copiar("link", `${window.location.origin}/jogador/entrar/${encodeURIComponent(g.codigo)}`)}>
            {copiado === "link" ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />} {copiado === "link" ? "Link copiado" : "Copiar convite"}
          </Button>
          <Button onClick={() => copiar("codigo", g.codigo)}>
            {copiado === "codigo" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copiado === "codigo" ? "Copiado" : "Copiar código"}
          </Button>
          <Button onClick={() => { novoCodigo.reset(); setConfirmarCodigo(true); }} title="O código antigo deixa de funcionar">
            <RefreshCw size={16} aria-hidden /> Gerar novo
          </Button>
        </div>
      </section>


      <Abas
        rotulo="Partes da mesa"
        atual={aba}
        onMudar={(a) => setParams(a === "mesa" ? {} : { aba: a }, { replace: true })}
        abas={[{ id: "mesa", rotulo: "Em jogo", Icone: Swords }, { id: "preparacao", rotulo: "Preparação", Icone: ClipboardList }]}
      />

      {aba === "mesa" && (
        <>
          {incompleto && (
            <div className="aviso">
              Os jogadores ainda não conseguem criar fichas. <Link to={`/mestre/grupos/${id}?aba=preparacao`}>Veja o que falta na preparação</Link>.
            </div>
          )}
      {/* ---------- Membros ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Membros <span className="pagina__subtitulo">({g.membros.length} de {g.limiteMembros})</span></h2>
        </div>
        {g.membros.length === 0 ? (
          <EmptyState compacto titulo="Ninguém entrou ainda" descricao="Envie o link de convite ou o código aos jogadores." />
        ) : (
          <ul className="membros-grade">
            {g.membros.map((m) => <MembroCartao key={m.fichaId} m={m} href={`/mestre/fichas/${m.fichaId}`} onStatus={() => setStatusDe(m.fichaId)} />)}
          </ul>
        )}
      </section>

      {/* ---------- Criaturas invocadas ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <div>
            <h2>Criaturas</h2>
            <p className="pagina__subtitulo">Criaturas invocadas por você nesta mesa. Toque numa para abrir a ficha: recursos, testes e cartas do nível.</p>
          </div>
          <Button variante="primario" onClick={() => setInvocando(true)}>
            <PawPrint size={16} aria-hidden /> Invocar criatura
          </Button>
        </div>
        {avisoCriatura && <p className="sucesso">{avisoCriatura}</p>}
        {g.criaturas.length === 0 ? (
          <EmptyState compacto titulo="Nenhuma criatura na mesa" descricao="Invoque criaturas do seu bestiário quando a cena pedir." />
        ) : (
          <ul className="criaturas">
            {g.criaturas.map((c) => (
              <li key={c.id}>
                <button type="button" className="criatura" onClick={() => setFichaCriatura(c.id)}>
                  <Avatar url={c.besta.imagemUrl} nome={c.nome} tamanho={40} />
                  <span className="criatura__info">
                    <strong>{c.nome} <span className="pagina__subtitulo">· nível {c.nivel}</span></strong>
                    {c.status.length > 0 && (
                      <span className="membro__status">{c.status.map((s) => <StatusBadge key={s.id} nome={s.nome} tipo={s.tipo} />)}</span>
                    )}
                    <BarrasDeRecurso vida={c.vida} mana={c.mana} esforco={c.esforco} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

        </>
      )}

      {aba === "preparacao" && (
        <>
          <ProntidaoGrupo
            itens={[
              { rotulo: "Classes", detalhe: `${d.classeIds.length} liberadas`, pronto: d.classeIds.length > 0, href: `/mestre/grupos/${id}/editar`, acao: "Liberar" },
              { rotulo: "Raças", detalhe: `${d.racaIds.length} liberadas`, pronto: d.racaIds.length > 0, href: `/mestre/grupos/${id}/editar`, acao: "Liberar" },
              { rotulo: "Atributos", detalhe: `${d.atributoIds.length} liberados`, pronto: d.atributoIds.length > 0, href: `/mestre/grupos/${id}/editar`, acao: "Liberar" },
              { rotulo: "Jogadores", detalhe: `${g.membros.length} de ${g.limiteMembros} vagas`, pronto: g.membros.length > 0 },
            ]}
          />
      {/* ---------- NPCs do kit do grupo ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <div>
            <h2>NPCs</h2>
            <p className="pagina__subtitulo">
              {g.kit ? <>NPCs do kit {g.kit.nome} e os gerais.</> : <>Todos os seus NPCs (a mesa não tem kit).</>} Gerencie em <Link to="/mestre/npcs">NPCs</Link>.
            </p>
          </div>
          <Link to={`/mestre/npcs/novo?grupo=${id}${g.kitId ? `&kit=${g.kitId}` : ""}`} className="btn">
            <Plus size={16} aria-hidden /> Novo NPC
          </Link>
        </div>
        {npcs.isPending ? (
          <Loading compacto />
        ) : npcs.isError ? (
          <ErrorState mensagem={mensagemDeErro(npcs.error)} onTentarNovamente={() => npcs.refetch()} />
        ) : npcs.data.length === 0 ? (
          <EmptyState compacto titulo="Nenhum NPC para esta mesa" />
        ) : (
          <ul className="membros">{npcs.data.map((n) => <NpcLinha key={n.id} n={n} />)}</ul>
        )}
      </section>

      {/* ---------- Itens vagos ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Itens vagos na mesa</h2>
          <div className="classe-cabecalho__acoes">
            <Button onClick={() => setLancando(true)}>
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
        <div className="secao__cabecalho">
          <div>
            <h2>Regras de combate</h2>
            <p className="pagina__subtitulo">
              As padrão ligadas nesta mesa (<Link to={`/mestre/grupos/${id}/editar`}>ligar ou desligar</Link>) e as suas. Os jogadores veem na ficha.
            </p>
          </div>
          <Button onClick={() => { criarRegra.reset(); setRegraEmEdicao(null); }}><Plus size={16} aria-hidden /> Regra da mesa</Button>
        </div>
        <RegrasDaMesa
          padrao={regrasPadrao.filter((r) => !g.regrasPadraoDesativadas.includes(r.slug))}
          proprias={g.regrasProprias}
          acoesPropria={(r) => (
            <>
              <Button pequeno onClick={() => { editarRegra.reset(); setRegraEmEdicao(r); }}>Editar</Button>
              <Button pequeno variante="perigoSutil" onClick={() => setRegraAExcluir(r)}><Trash2 size={14} aria-hidden /> Excluir</Button>
            </>
          )}
        />
      </section>

      <section className="secao">
        <h2>O que vale nesta mesa</h2>
        <p className="pagina__subtitulo">
          {d.classeIds.length} classes · {d.racaIds.length} raças · {d.atributoIds.length} atributos · {d.periciaIds.length} perícias · {d.statusIds.length} status.{" "}
          <Link to={`/mestre/grupos/${id}/editar`}>Alterar</Link>
        </p>
      </section>


          <section className="secao secao-conta">
            <h2>Encerrar</h2>
            <p className="pagina__subtitulo">Excluir a mesa apaga criaturas e itens dela. Cada jogador fica com uma cópia arquivada da própria ficha.</p>
            <div><Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarExclusao(true); }}>Excluir mesa</Button></div>
          </section>
        </>
      )}

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
              <Button variante="perigo" onClick={() => { excluirItem.reset(); setItemAbertoId(null); setItemAExcluir(itemAberto.id); }}>
                <Trash2 size={16} aria-hidden /> Excluir item
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={criandoItem} onFechar={() => setCriandoItem(false)} titulo="Item avulso" largo>
        <p className="pagina__subtitulo">Um item só desta mesa, sem entrar no catálogo. Para reaproveitar em outras sessões, crie em Itens.</p>
        <ItemForm
          key={criandoItem ? "aberto" : "fechado"}
          pericias={(pericias.data ?? []).map((p) => ({ id: p.id, rotulo: `${p.nome} (${p.atributo.nome})` }))}
          classes={(classes.data ?? []).map((c) => ({ id: c.id, rotulo: c.titulo }))}
          categorias={categorias.data ?? []}
          rotulo="Criar item"
          extra={
            <Field rotulo="Entregar para" dica="Sem destino, o item fica vago na mesa." erro={errosDeCampo(criarItem.error).fichaId}>
              <select value={itemDestino} onChange={(e) => setItemDestino(e.target.value)}>
                <option value="">Ninguém (vago na mesa)</option>
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

      <LancarItemModal grupoId={id} kitId={g.kitId} aberto={lancando} onFechar={() => setLancando(false)} destinos={destinos} />
      <StatusMembroModal grupoId={id} membro={membroStatus} statusAtivos={g.statusAtivos} onFechar={() => setStatusDe(null)} />
      <InvocarModal grupoId={id} kitId={g.kitId} aberto={invocando} onFechar={() => setInvocando(false)} />
      <CriaturaModal
        criaturaId={fichaCriatura}
        onFechar={() => setFichaCriatura(null)}
        onSumiu={(msg) => {
          setFichaCriatura(null);
          setAvisoCriatura(msg);
        }}
      />

      <Modal aberto={regraEmEdicao !== undefined} onFechar={() => setRegraEmEdicao(undefined)} titulo={regraEmEdicao ? "Editar regra da mesa" : "Nova regra da mesa"}>
        {regraEmEdicao !== undefined && (
          <RegraDaMesaForm
            inicial={regraEmEdicao ?? undefined}
            enviando={criarRegra.isPending || editarRegra.isPending}
            erros={errosDeCampo(regraEmEdicao ? editarRegra.error : criarRegra.error)}
            erroGeral={erroDeFormulario(regraEmEdicao ? editarRegra.error : criarRegra.error)}
            onCancelar={() => setRegraEmEdicao(undefined)}
            onEnviar={(dados) =>
              regraEmEdicao
                ? editarRegra.mutate({ id: regraEmEdicao.id, dados }, { onSuccess: () => setRegraEmEdicao(undefined) })
                : criarRegra.mutate(dados, { onSuccess: () => setRegraEmEdicao(undefined) })
            }
          />
        )}
      </Modal>

      <ConfirmDialog
        aberto={confirmarCodigo}
        titulo="Gerar novo código"
        rotuloConfirmar="Gerar novo"
        mensagem={<>O código <strong>{g.codigo}</strong> e os links de convite já enviados deixam de funcionar. Quem já está na mesa continua nela.</>}
        processando={novoCodigo.isPending}
        erro={novoCodigo.isError ? mensagemDeErro(novoCodigo.error) : null}
        onCancelar={() => setConfirmarCodigo(false)}
        onConfirmar={() => novoCodigo.mutate(undefined, { onSuccess: () => setConfirmarCodigo(false) })}
      />

      <ConfirmDialog
        aberto={!!itemAExcluir}
        titulo="Excluir item"
        rotuloConfirmar="Excluir"
        mensagem={<>Excluir <strong>{g.itensVagos.find((i) => i.id === itemAExcluir)?.nome}</strong>? Não dá para desfazer.</>}
        processando={excluirItem.isPending}
        erro={excluirItem.isError ? mensagemDeErro(excluirItem.error) : null}
        onCancelar={() => setItemAExcluir(null)}
        onConfirmar={() => itemAExcluir && excluirItem.mutate(itemAExcluir, { onSuccess: () => setItemAExcluir(null) })}
      />

      <ConfirmDialog
        aberto={!!regraAExcluir}
        titulo="Excluir regra da mesa"
        mensagem={<>Excluir a regra <strong>{regraAExcluir?.titulo}</strong>?</>}
        processando={excluirRegra.isPending}
        erro={excluirRegra.isError ? mensagemDeErro(excluirRegra.error) : null}
        onCancelar={() => setRegraAExcluir(null)}
        onConfirmar={() => excluirRegra.mutate(regraAExcluir!.id, { onSuccess: () => setRegraAExcluir(null) })}
      />

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir mesa"
        mensagem={<>Excluir <strong>{g.titulo}</strong>? As criaturas e todos os itens da mesa serão apagados, e as {g.membros.length} fichas saem dela (cada jogador fica com uma cópia arquivada da sua). Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={() => excluir.mutate(id, { onSuccess: () => navigate("/mestre/grupos", { replace: true }) })}
      />
    </div>
  );
}
