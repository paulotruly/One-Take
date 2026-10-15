// Ficha do personagem. Usada pelo jogador (/jogador/fichas/:id) e pelo mestre do grupo (/mestre/fichas/:id).
// Jogador e mestre mexem em vida/mana/esforço, inventário e pontos de perícia; só o mestre sobe o nível.
import { Activity, ArrowUp, Backpack, Dices, Droplet, Footprints, Heart, Plus, Skull, Trash2, TriangleAlert, X, Zap } from "lucide-react";
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
import { HabilidadesDeck } from "../../classes/components/HabilidadesDeck";
import { GrupoBadge } from "../../classes/components/Selos";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import { StatusBadge } from "../../status/components/StatusBadge";
import { AplicarStatusLinha, StatusTurnos } from "../../status/components/StatusTurnos";
import { RegrasDaMesa } from "../../grupos/components/RegrasDaMesa";
import { ROTULO_TIPO } from "../../status/types";
import { useUsarItem } from "../../itens/api";
import { ItemDetalhe, ItemLinha } from "../../itens/components/ItemCartao";
import { LancarItemModal } from "../../itens/pages/LancarItemModal";
import { useAplicarStatus, useEditarFicha, useExcluirFicha, useFicha, useGastarPericia, useMoverItem, useRemoverStatus, useSubirNivel, useTurnosStatus } from "../api";
import { BarraRecurso } from "../components/BarraRecurso";
import type { FichaDetalhe } from "../types";

export function FichaPage() {
  const { id = "" } = useParams();
  const ficha = useFicha(id);
  if (ficha.isPending) return <Loading texto="Carregando ficha…" />;
  if (ficha.isError) {
    return (
      <div className="pagina">
        <ErrorState mensagem={mensagemDeErro(ficha.error)} onTentarNovamente={() => ficha.refetch()} />
      </div>
    );
  }
  return <Ficha f={ficha.data} />;
}

function Ficha({ f }: { f: FichaDetalhe }) {
  const navigate = useNavigate();
  const editar = useEditarFicha(f.id);
  const subir = useSubirNivel(f.id);
  const gastar = useGastarPericia(f.id);
  const mover = useMoverItem();
  const excluir = useExcluirFicha();
  const aplicarStatus = useAplicarStatus(f.id);
  const removerStatus = useRemoverStatus(f.id);
  const turnosStatus = useTurnosStatus(f.id);
  const usar = useUsarItem();
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [lancandoItem, setLancandoItem] = useState(false);
  const itemAberto = f.inventario.itens.find((i) => i.id === itemAbertoId) ?? null;

  const [confirmarNivel, setConfirmarNivel] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [editando, setEditando] = useState(false);
  const [periciaEscolhida, setPericiaEscolhida] = useState("");

  const voltar = f.souMestre ? `/mestre/grupos/${f.grupo.id}` : "/jogador";
  const cheio = f.inventario.usados >= f.inventario.capacidade;
  // A morte já tem o aviso grande; os demais status viram alertas.
  const alertas = f.status.filter((st) => st.gatilho !== "VIDA_ZERO" && st.gatilho !== "MANA_ZERO");
  const erroAcao = editar.error ?? gastar.error ?? mover.error ?? subir.error ?? aplicarStatus.error ?? removerStatus.error ?? turnosStatus.error;
  const destinosItem = [{ id: f.id, rotulo: f.nome }, ...f.outrasFichas.map((o) => ({ id: o.id, rotulo: `${o.nome} (@${o.jogador})` }))];

  return (
    <div className="pagina">
      <LinkVoltar to={voltar}>{f.souMestre ? f.grupo.titulo : "Minhas fichas"}</LinkVoltar>

      {/* ---------- Cabeçalho ---------- */}
      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato">
          <ClasseImagem url={f.imagemUrl ?? f.classe.imagemUrl} titulo={f.nome} />
        </div>
        <div className="classe-cabecalho__info">
          <div className="classe-cabecalho__selos">
            <span className="selo selo--nivel">Nível {f.nivel}</span>
            <GrupoBadge grupo={f.classe.grupo} />
          </div>
          <h1>{f.nome}</h1>
          <p className="pericia__nome">
            <Avatar url={f.jogador.fotoUrl} nome={f.jogador.nome} tamanho={24} />
            {f.jogador.nome || `@${f.jogador.nickname}`} · {f.raca.titulo} · {f.classe.titulo} · Grupo {f.grupo.titulo}
          </p>
          <span className="stat" title="Deslocamento por turno">
            <Footprints size={14} aria-hidden /> Deslocamento: {f.raca.deslocamento} quadrados
          </span>
          {f.historia && <p className="classe-cabecalho__descricao">{f.historia}</p>}
          <div className="classe-cabecalho__acoes">
            {f.souMestre && (
              <Button variante="primario" onClick={() => { subir.reset(); setConfirmarNivel(true); }}>
                <ArrowUp size={16} aria-hidden /> Subir nível
              </Button>
            )}
            <Button onClick={() => { editar.reset(); setEditando(true); }}>Editar personagem</Button>
            <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarSaida(true); }}>
              {f.souMestre ? "Remover do grupo" : "Sair do grupo"}
            </Button>
          </div>
        </div>
      </header>

      {erroAcao && <div className="aviso">{mensagemDeErro(erroAcao)}</div>}

      {/* ---------- Alertas de status (só avisos: o sistema não altera números) ---------- */}
      {f.morto && (
        <div className="alerta-status alerta-status--morte" role="alert">
          <Skull size={22} aria-hidden />
          <div>
            <strong>Personagem morto.</strong>{" "}
            {f.vida.atual === 0 ? "A vida chegou a 0." : "A mana, a energia vital, chegou a 0."} Fale com o mestre.
          </div>
        </div>
      )}
      {alertas.length > 0 && (
        <section className="alertas-status" aria-label="Status do personagem">
          {alertas.map((st) => (
            <div key={st.id} className={`alerta-status alerta-status--${st.tipo}`} role="status">
              <TriangleAlert size={18} aria-hidden />
              <div className="alerta-status__texto">
                <p>
                  <StatusBadge nome={st.nome} tipo={st.tipo} />{" "}
                  <span className="pagina__subtitulo">{st.automatico ? "automático" : ROTULO_TIPO[st.tipo]}</span>{" "}
                  <StatusTurnos status={st} ocupado={turnosStatus.isPending}
                    onMudarTurnos={f.souMestre ? (t) => turnosStatus.mutate({ statusId: st.id, turnos: t }) : undefined} />
                </p>
                <p><strong>{st.efeito}</strong></p>
              </div>
              {f.souMestre && !st.automatico && (
                <Button pequeno variante="fantasma" aria-label={`Remover ${st.nome}`} title="Remover status" onClick={() => removerStatus.mutate(st.id)}>
                  <X size={14} aria-hidden />
                </Button>
              )}
            </div>
          ))}
        </section>
      )}
      {/* Mestre: aplicar status manualmente (morte e cansaço aparecem sozinhos pelos recursos). */}
      {f.souMestre && (
        <section className="painel" aria-label="Aplicar status">
          <h2 className="painel__titulo"><Activity size={18} aria-hidden /> Status</h2>
          {f.statusAplicaveis.length > 0 ? (
            <AplicarStatusLinha aplicaveis={f.statusAplicaveis} ocupado={aplicarStatus.isPending}
              onAplicar={(statusId, turnos, pronto) => aplicarStatus.mutate({ statusId, turnos }, { onSuccess: pronto })} />
          ) : (
            <p className="pagina__subtitulo">
              Nenhum status para aplicar. Ative status no grupo em <Link to={`/mestre/grupos/${f.grupo.id}/editar`}>Editar grupo</Link> (seção Status).
            </p>
          )}
          <p className="pagina__subtitulo">Turnos é opcional (vazio = até você tirar). A cada turno, use o -1 no alerta; em 0 o status sai. Para tirar na hora, use o X.</p>
        </section>
      )}

      {/* ---------- Recursos ---------- */}
      <section className="secao">
        <h2>Recursos</h2>
        <div className="recursos">
          <BarraRecurso rotulo="Vida" Icone={Heart} tipo="vida" atual={f.vida.atual} max={f.vida.max} editavel podeAumentar={f.souMestre} ocupado={editar.isPending}
            onMudar={(v) => editar.mutate({ vidaAtual: v })} />
          <BarraRecurso rotulo="Mana" Icone={Droplet} tipo="mana" atual={f.mana.atual} max={f.mana.max} editavel ocupado={editar.isPending}
            onMudar={(v) => editar.mutate({ manaAtual: v })} />
          <BarraRecurso rotulo="Esforço" Icone={Zap} tipo="esforco" atual={f.esforco.atual} max={f.esforco.max} editavel ocupado={editar.isPending}
            onMudar={(v) => editar.mutate({ esforcoAtual: v })} />
        </div>
      </section>

      {/* ---------- Atributos ---------- */}
      <section className="secao">
        <h2>Atributos</h2>
        <p className="pagina__subtitulo">
          Nos testes, role os d20 do atributo, fique com o maior e some o bônus da perícia. Cada ponto de esforço gasto dá +1 d20.
          Atributo em 0: 1 d20 e o resultado vale a metade.
        </p>
        <ul className="dados-atributos">
          {f.atributos.map((a) => (
            <li key={a.id} className="dados-atributo">
              <div>
                <strong>{a.nome}</strong>
                {a.descricao && <p className="pericia__descricao">{a.descricao}</p>}
              </div>
              <span className="contador__valor" title="Teste sem perícia"><Dices size={16} aria-hidden /> {a.teste}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Perícias ---------- */}
      <section className="secao">
        <h2>Perícias</h2>
        {f.pontosPericiaDisponiveis >= f.custoPericia && (
          <div className="painel">
            <p>
              Você tem <strong>{f.pontosPericiaDisponiveis} pontos de perícia</strong>. Use {f.custoPericia} numa perícia nova ou some +{f.custoPericia} numa que já tem.
            </p>
            <div className="entrar-codigo__linha">
              <select value={periciaEscolhida} onChange={(e) => setPericiaEscolhida(e.target.value)} aria-label="Perícia">
                <option value="">Escolha a perícia…</option>
                {f.opcoesPericia.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome} ({o.atributo}){o.tem ? "" : " · nova"}
                  </option>
                ))}
              </select>
              <Button variante="primario" disabled={!periciaEscolhida || gastar.isPending}
                onClick={() => gastar.mutate(periciaEscolhida, { onSuccess: () => setPericiaEscolhida("") })}>
                Usar +{f.custoPericia}
              </Button>
            </div>
          </div>
        )}
        {f.pericias.length === 0 ? (
          <EmptyState compacto titulo="Sem perícias ainda" descricao="Elas vêm da raça, da classe e dos pontos de nível." />
        ) : (
          <PericiasPorAtributo
            pericias={f.pericias}
            mostrarDescricao={false}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                valor={p.total}
                tituloValor="Total"
                rodape={
                  <span className="pericia__usos">
                    <strong className="pericia__teste" title="Como rolar"><Dices size={12} aria-hidden /> {p.teste}</strong>{" "}
                    {[p.raca && `raça +${p.raca}`, p.classe && `classe ${p.classe >= 0 ? "+" : ""}${p.classe}`, p.nivel && `níveis +${p.nivel}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                }
              />
            )}
          />
        )}
      </section>

      {/* ---------- Habilidades ---------- */}
      <section className="secao">
        <h2>Habilidades</h2>
        <p className="pagina__subtitulo">
          Cartas disponíveis no nível {f.nivel}.{f.proximasHabilidades > 0 && ` Mais ${f.proximasHabilidades} liberam em níveis maiores.`}
        </p>
        <HabilidadesDeck habilidades={f.habilidades} vazio="Nenhuma carta neste nível" />
      </section>

      {/* ---------- Regras de combate da mesa ---------- */}
      <section className="secao">
        <h2>Regras da mesa</h2>
        <p className="pagina__subtitulo">Regras de combate que valem neste grupo. Toque numa regra para ler.</p>
        <RegrasDaMesa padrao={f.regrasDaMesa.padrao} proprias={f.regrasDaMesa.proprias} />
      </section>

      {/* ---------- Inventário ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2><Backpack size={20} aria-hidden /> Inventário</h2>
          <span className="selo">{f.inventario.usados} / {f.inventario.capacidade} espaços</span>
        </div>
        <div className="inventario__barra" aria-hidden>
          <div
            className={`inventario__preenchido ${cheio ? "inventario__preenchido--cheio" : ""}`}
            style={{ width: `${Math.min(100, (f.inventario.usados / f.inventario.capacidade) * 100)}%` }}
          />
        </div>
        {aviso && <p className="sucesso">{aviso}</p>}
        {f.souMestre && (
          <div>
            <Button onClick={() => setLancandoItem(true)}>
              <Plus size={16} aria-hidden /> Dar item do catálogo
            </Button>
          </div>
        )}
        {f.inventario.itens.length === 0 ? (
          <EmptyState compacto titulo="Inventário vazio" descricao="O mestre entrega os itens durante a sessão." />
        ) : (
          <ul className="itens">
            {f.inventario.itens.map((item) => (
              <ItemLinha
                key={item.id}
                item={item}
                naoSabeUsar={!item.podeUsar}
                onAbrir={() => {
                  usar.reset();
                  mover.reset();
                  setItemAbertoId(item.id);
                }}
              />
            ))}
          </ul>
        )}
        {cheio && <p className="pagina__subtitulo">Inventário cheio. Cada nível dá mais espaço.</p>}
      </section>

      <Modal aberto={!!itemAberto} onFechar={() => setItemAbertoId(null)} titulo={itemAberto?.nome ?? ""}>
        {itemAberto && (
          <div className="form">
            <ItemDetalhe item={itemAberto} motivoNaoPodeUsar={itemAberto.motivoNaoPodeUsar} />
            {(usar.isError || mover.isError) && <div className="aviso">{mensagemDeErro(usar.error ?? mover.error)}</div>}
            <div className="acoes-item">
              <Button
                variante="primario"
                disabled={usar.isPending || (!itemAberto.podeUsar && !f.souMestre)}
                onClick={() =>
                  usar.mutate(itemAberto.id, {
                    onSuccess: (r) => {
                      const efeito = itemAberto.efeito ? ` Efeito: ${itemAberto.efeito}` : "";
                      setAviso(r.consumido ? `${itemAberto.nome} foi usado e acabou.${efeito}` : `${itemAberto.nome} usado.${efeito}`);
                      setItemAbertoId(null);
                    },
                  })
                }
              >
                {usar.isPending ? "Usando…" : "Usar"}
              </Button>
              {f.outrasFichas.length > 0 && (
                <select
                  value=""
                  aria-label={`Passar ${itemAberto.nome}`}
                  onChange={(e) => e.target.value && mover.mutate({ itemId: itemAberto.id, fichaId: e.target.value }, { onSuccess: () => setItemAbertoId(null) })}
                >
                  <option value="">Passar para…</option>
                  {f.outrasFichas.map((o) => (
                    <option key={o.id} value={o.id}>{o.nome} (@{o.jogador})</option>
                  ))}
                </select>
              )}
              <Button onClick={() => mover.mutate({ itemId: itemAberto.id, fichaId: null }, { onSuccess: () => setItemAbertoId(null) })}>
                <Trash2 size={16} aria-hidden /> Descartar (fica vago no grupo)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {f.souMestre && (
        <LancarItemModal grupoId={f.grupo.id} aberto={lancandoItem} onFechar={() => setLancandoItem(false)} destinos={destinosItem} destinoInicial={f.id} />
      )}

      <EditarPersonagem aberto={editando} f={f} onFechar={() => setEditando(false)} editar={editar} />

      <ConfirmDialog
        aberto={confirmarNivel}
        titulo="Subir nível"
        rotuloConfirmar="Subir nível"
        mensagem={
          <>
            {f.nome} vai para o nível {f.nivel + 1}: +5 de vida, mana e esforço, +5 pontos de perícia, novas cartas e +2 espaços no inventário.{" "}
            <strong>Não dá para descer de nível depois.</strong>
          </>
        }
        processando={subir.isPending}
        erro={subir.isError ? mensagemDeErro(subir.error) : null}
        onCancelar={() => setConfirmarNivel(false)}
        onConfirmar={() => subir.mutate(undefined, { onSuccess: () => setConfirmarNivel(false) })}
      />

      <ConfirmDialog
        aberto={confirmarSaida}
        titulo={f.souMestre ? "Remover do grupo" : "Sair do grupo"}
        rotuloConfirmar={f.souMestre ? "Remover" : "Sair"}
        mensagem={<>A ficha de <strong>{f.nome}</strong> sai do grupo e os itens dela ficam vagos lá. {f.souMestre ? "O jogador" : "Você"} fica com uma cópia arquivada do personagem, só para leitura.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarSaida(false)}
        onConfirmar={() => excluir.mutate(f.id, { onSuccess: () => navigate(voltar, { replace: true }) })}
      />
    </div>
  );
}

function EditarPersonagem({ aberto, f, onFechar, editar }: { aberto: boolean; f: FichaDetalhe; onFechar: () => void; editar: ReturnType<typeof useEditarFicha> }) {
  const [nome, setNome] = useState(f.nome);
  const [historia, setHistoria] = useState(f.historia ?? "");
  const [imagemUrl, setImagemUrl] = useState(f.imagemUrl ?? "");
  const erros = errosDeCampo(editar.error);

  function enviar(e: FormEvent) {
    e.preventDefault();
    editar.mutate({ nome, historia: historia.trim() || null, imagemUrl: imagemUrl.trim() || null }, { onSuccess: onFechar });
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Editar personagem">
      <form className="form" noValidate onSubmit={enviar}>
        <Field rotulo="Nome do personagem" erro={erros.nome}>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} autoFocus />
        </Field>
        <Field rotulo="Link da imagem" erro={erros.imagemUrl}>
          <input type="url" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://" />
        </Field>
        <Field rotulo="História" erro={erros.historia}>
          <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} maxLength={4000} rows={5} />
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
