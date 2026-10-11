// Página do grupo para o mestre: código de entrada, membros (fichas), itens vagos e o que vale no grupo.
import { Check, Copy, Droplet, Heart, Package, Plus, RefreshCw, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { useExcluirItem, useMoverItem } from "../../fichas/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { useCriarItem, useExcluirGrupo, useGrupo, useNovoCodigo } from "../api";

export function GrupoDetalhePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const grupo = useGrupo(id);
  const novoCodigo = useNovoCodigo(id);
  const excluir = useExcluirGrupo();
  const criarItem = useCriarItem(id);
  const moverItem = useMoverItem();
  const excluirItem = useExcluirItem();

  const [copiado, setCopiado] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [criandoItem, setCriandoItem] = useState(false);
  const [itemNome, setItemNome] = useState("");
  const [itemDescricao, setItemDescricao] = useState("");
  const [itemDestino, setItemDestino] = useState("");

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

  async function copiar() {
    await navigator.clipboard.writeText(g.codigo).catch(() => undefined);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  function enviarItem(e: FormEvent) {
    e.preventDefault();
    criarItem.mutate(
      { nome: itemNome, descricao: itemDescricao, fichaId: itemDestino || null },
      {
        onSuccess: () => {
          setCriandoItem(false);
          setItemNome("");
          setItemDescricao("");
          setItemDestino("");
        },
      },
    );
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
            <Link to={`/mestre/grupos/${id}/editar`} className="btn">
              Editar grupo
            </Link>
            <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarExclusao(true); }}>
              Excluir grupo
            </Button>
          </div>
        </div>
      </header>

      <section className="painel codigo-entrada">
        <div>
          <p className="pagina__subtitulo">Código de entrada</p>
          <p className="codigo-entrada__codigo">{g.codigo}</p>
          <p className="pagina__subtitulo">
            {g.membros.length} de {g.limiteMembros} vagas ocupadas. O jogador digita o código em "Minhas fichas".
          </p>
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

      <section className="secao">
        <h2>Membros</h2>
        {g.membros.length === 0 ? (
          <EmptyState compacto titulo="Ninguém entrou ainda" descricao="Compartilhe o código de entrada com os jogadores." />
        ) : (
          <ul className="membros">
            {g.membros.map((m) => (
              <li key={m.fichaId}>
                <Link to={`/mestre/fichas/${m.fichaId}`} className="membro">
                  <Avatar url={m.imagemUrl ?? m.jogador.fotoUrl} nome={m.nome} tamanho={48} />
                  <div className="membro__info">
                    <strong>{m.nome}</strong>
                    <span className="pagina__subtitulo">
                      @{m.jogador.nickname} · {m.raca} · {m.classe} · Nível {m.nivel}
                    </span>
                    {m.status.length > 0 && (
                      <span className="membro__status">
                        {m.status.map((s) => <StatusBadge key={s.id} nome={s.nome} tipo={s.tipo} />)}
                      </span>
                    )}
                  </div>
                  <div className="stats stats--compacto">
                    <span className="stat stat--vida"><Heart size={12} aria-hidden /> {m.vida.atual}/{m.vida.max}</span>
                    <span className="stat stat--mana"><Droplet size={12} aria-hidden /> {m.mana.atual}/{m.mana.max}</span>
                    <span className="stat stat--esforco"><Zap size={12} aria-hidden /> {m.esforco.atual}/{m.esforco.max}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Itens vagos no grupo</h2>
          <Button onClick={() => { criarItem.reset(); setCriandoItem(true); }}>
            <Plus size={16} aria-hidden /> Novo item
          </Button>
        </div>
        {(moverItem.isError || excluirItem.isError) && (
          <div className="aviso">{mensagemDeErro(moverItem.error ?? excluirItem.error)}</div>
        )}
        {g.itensVagos.length === 0 ? (
          <EmptyState compacto titulo="Nenhum item vago" descricao="Itens criados sem dono ou descartados pelos jogadores aparecem aqui." />
        ) : (
          <ul className="pericias">
            {g.itensVagos.map((item) => (
              <li key={item.id} className="pericia pericia--atributo">
                <div>
                  <div className="pericia__nome">
                    <Package size={16} aria-hidden /> <strong>{item.nome}</strong>
                  </div>
                  {item.descricao && <p className="pericia__descricao">{item.descricao}</p>}
                </div>
                <div className="pericia__acoes">
                  {g.membros.length > 0 && (
                    <select
                      className="select-pequeno"
                      value=""
                      aria-label={`Entregar ${item.nome}`}
                      onChange={(e) => e.target.value && moverItem.mutate({ itemId: item.id, fichaId: e.target.value })}
                    >
                      <option value="">Entregar para…</option>
                      {g.membros.map((m) => (
                        <option key={m.fichaId} value={m.fichaId}>
                          {m.nome} (@{m.jogador.nickname})
                        </option>
                      ))}
                    </select>
                  )}
                  <Button pequeno variante="fantasma" onClick={() => excluirItem.mutate(item.id)}>
                    Excluir
                  </Button>
                </div>
              </li>
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

      <Modal aberto={criandoItem} onFechar={() => setCriandoItem(false)} titulo="Novo item">
        <form className="form" noValidate onSubmit={enviarItem}>
          <Field rotulo="Nome" erro={errosDeCampo(criarItem.error).nome}>
            <input value={itemNome} onChange={(e) => setItemNome(e.target.value)} maxLength={80} autoFocus />
          </Field>
          <Field rotulo="Descrição (opcional)">
            <textarea value={itemDescricao} onChange={(e) => setItemDescricao(e.target.value)} maxLength={1000} rows={3} />
          </Field>
          <Field rotulo="Entregar para" dica="Sem destino, o item fica vago no grupo.">
            <select value={itemDestino} onChange={(e) => setItemDestino(e.target.value)}>
              <option value="">Ninguém (vago no grupo)</option>
              {g.membros.map((m) => (
                <option key={m.fichaId} value={m.fichaId}>
                  {m.nome} (@{m.jogador.nickname})
                </option>
              ))}
            </select>
          </Field>
          {criarItem.isError && <div className="aviso">{erroDeFormulario(criarItem.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={() => setCriandoItem(false)} disabled={criarItem.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variante="primario" disabled={criarItem.isPending}>
              {criarItem.isPending ? "Salvando…" : "Criar item"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir grupo"
        mensagem={
          <>
            Excluir <strong>{g.titulo}</strong>? As {g.membros.length} fichas e todos os itens do grupo serão apagados. Não dá para desfazer.
          </>
        }
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={() => excluir.mutate(id, { onSuccess: () => navigate("/mestre/grupos", { replace: true }) })}
      />
    </div>
  );
}
