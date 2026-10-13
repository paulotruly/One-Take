// Ficha do NPC (mestre): recursos, dados por atributo, perícias com teste, cartas da classe no nível e inventário.
import { AlternarVerificado } from "../../verificados/pages/AlternarVerificado";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { Dices, Droplet, Footprints, Heart, Minus, Plus, Skull, Trash2, Zap, Copy } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { HabilidadesDeck } from "../../classes/components/HabilidadesDeck";
import { BarraRecurso } from "../../fichas/components/BarraRecurso";
import { useExcluirItem, useMoverItem } from "../../fichas/api";
import { useUsarItem } from "../../itens/api";
import { ItemDetalhe, ItemLinha } from "../../itens/components/ItemCartao";
import { LancarItemModal } from "../../itens/pages/LancarItemModal";
import { useAtributos, useCatalogo } from "../../pericias/api";
import { VinculoPericiaForm } from "../../pericias/components/forms";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import { PainelStatus } from "../../status/components/PainelStatus";
import { useAplicarStatusNpc, useDefinirAtributoNpc, useDefinirPericiaNpc, useDuplicarNpc, useEditarNpc, useExcluirNpc, useNpc, useRemoverStatusNpc } from "../api";
import type { NpcDetalhe, PericiaDoNpc } from "../types";

export function NpcDetalhePage() {
  const { id = "" } = useParams();
  const npc = useNpc(id);
  if (npc.isPending) return <Loading texto="Carregando NPC…" />;
  if (npc.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre/npcs">NPCs</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(npc.error)} onTentarNovamente={() => npc.refetch()} />
      </div>
    );
  }
  return <FichaNpc n={npc.data} />;
}

function FichaNpc({ n }: { n: NpcDetalhe }) {
  const navigate = useNavigate();
  const editar = useEditarNpc(n.id);
  const excluir = useExcluirNpc();
  const definirAtributo = useDefinirAtributoNpc(n.id);
  const definirPericia = useDefinirPericiaNpc(n.id);
  const atributos = useAtributos();
  const catalogo = useCatalogo();
  const mover = useMoverItem();
  const usar = useUsarItem();
  const excluirItem = useExcluirItem();
  const aplicarStatus = useAplicarStatusNpc(n.id);
  const removerStatus = useRemoverStatusNpc(n.id);
  const duplicar = useDuplicarNpc();
  const editavel = n.editavel ?? true;

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [periciaEmEdicao, setPericiaEmEdicao] = useState<PericiaDoNpc | null | undefined>(undefined);
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(null);
  const [lancando, setLancando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const itemAberto = n.inventario.itens.find((i) => i.id === itemAbertoId) ?? null;
  const dados = new Map(n.atributos.map((a) => [a.id, a.dados]));
  const voltar = "/mestre/npcs";
  const fecharItem = () => setItemAbertoId(null);
  const cheio = n.inventario.usados >= n.inventario.capacidade;

  return (
    <div className="pagina">
      <LinkVoltar to={voltar}>NPCs</LinkVoltar>

      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato">
          <ClasseImagem url={n.imagemUrl} titulo={n.nome} />
        </div>
        <div className="classe-cabecalho__info">
          <div className="classe-cabecalho__selos">
            <span className="selo selo--nivel">Nível {n.nivel}</span>
            <span className="selo">NPC</span>
            {n.kitIds.length === 0 && !n.deOutro && <span className="selo">Geral</span>}
            {n.verificado && <VerificadoBadge />}
          </div>
          <h1>{n.nome}</h1>
          <p className="pericia__nome">{n.raca.titulo}{n.classe ? ` · ${n.classe.titulo}` : " · sem classe"}</p>
          <span className="stat"><Footprints size={14} aria-hidden /> Deslocamento: {n.raca.deslocamento} quadrados</span>
          {n.descricao && <p className="classe-cabecalho__descricao">{n.descricao}</p>}
          {n.deOutro && <p className="pagina__subtitulo">NPC verificado de outra pessoa: somente leitura. Duplique para ter o seu.</p>}
          <div className="classe-cabecalho__acoes">
            {editavel ? (
              <>
                <Link to={`/mestre/npcs/${n.id}/editar`} className="btn">Editar NPC</Link>
                <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarExclusao(true); }}>Excluir NPC</Button>
                <AlternarVerificado tipo="npc" item={n} />
              </>
            ) : (
              <Button variante="primario" disabled={duplicar.isPending} onClick={() => duplicar.mutate(n.id, { onSuccess: (c) => navigate(`/mestre/npcs/${c.id}`) })}>
                <Copy size={16} aria-hidden /> {duplicar.isPending ? "Duplicando…" : "Duplicar"}
              </Button>
            )}
          </div>
          {duplicar.isError && <div className="aviso">{mensagemDeErro(duplicar.error)}</div>}
        </div>
      </header>

      {(editar.isError || definirAtributo.isError || definirPericia.isError) && (
        <div className="aviso">{mensagemDeErro(editar.error ?? definirAtributo.error ?? definirPericia.error)}</div>
      )}
      {n.morto && (
        <div className="alerta-status alerta-status--morte" role="alert">
          <Skull size={22} aria-hidden />
          <div><strong>NPC morto.</strong> {n.vida.atual === 0 ? "A vida chegou a 0." : "A mana chegou a 0."}</div>
        </div>
      )}

      <PainelStatus
        status={n.status}
        aplicaveis={editavel ? n.statusAplicaveis : []}
        onAplicar={(id) => aplicarStatus.mutate(id)}
        onRemover={(id) => removerStatus.mutate(id)}
        ocupado={!editavel || aplicarStatus.isPending || removerStatus.isPending}
        semAplicaveis="Nenhum status para aplicar."
      />
      {(aplicarStatus.isError || removerStatus.isError) && <div className="aviso">{mensagemDeErro(aplicarStatus.error ?? removerStatus.error)}</div>}

      <section className="secao">
        <h2>Recursos</h2>
        <div className="recursos">
          <BarraRecurso rotulo="Vida" Icone={Heart} tipo="vida" atual={n.vida.atual} max={n.vida.max} editavel={editavel} ocupado={editar.isPending} onMudar={(v) => editar.mutate({ vidaAtual: v })} />
          <BarraRecurso rotulo="Mana" Icone={Droplet} tipo="mana" atual={n.mana.atual} max={n.mana.max} editavel={editavel} ocupado={editar.isPending} onMudar={(v) => editar.mutate({ manaAtual: v })} />
          <BarraRecurso rotulo="Esforço" Icone={Zap} tipo="esforco" atual={n.esforco.atual} max={n.esforco.max} editavel={editavel} ocupado={editar.isPending} onMudar={(v) => editar.mutate({ esforcoAtual: v })} />
        </div>
      </section>

      <section className="secao">
        <h2>Atributos</h2>
        <p className="pagina__subtitulo">Dados (d20) do NPC em cada atributo. Sem dados = 1 d20 com o resultado pela metade.</p>
        {atributos.isPending ? (
          <Loading compacto />
        ) : (
          <ul className="dados-atributos">
            {(atributos.data ?? []).map((a) => {
              const qtd = dados.get(a.id) ?? 0;
              return (
                <li key={a.id} className="dados-atributo">
                  <div>
                    <strong>{a.nome}</strong>
                    <p className="pericia__descricao">Teste: {n.atributos.find((x) => x.id === a.id)?.teste ?? "1d20 ÷ 2"}</p>
                  </div>
                  <div className="contador">
                    <Button pequeno aria-label={`Menos um dado em ${a.nome}`} disabled={!editavel || qtd === 0 || definirAtributo.isPending}
                      onClick={() => definirAtributo.mutate({ atributoId: a.id, dados: qtd - 1 })}>
                      <Minus size={14} aria-hidden />
                    </Button>
                    <span className="contador__valor"><Dices size={16} aria-hidden /> {qtd}d20</span>
                    <Button pequeno aria-label={`Mais um dado em ${a.nome}`} disabled={!editavel || qtd >= 20 || definirAtributo.isPending}
                      onClick={() => definirAtributo.mutate({ atributoId: a.id, dados: qtd + 1 })}>
                      <Plus size={14} aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Perícias</h2>
          <Button onClick={() => { definirPericia.reset(); setPericiaEmEdicao(null); }} disabled={catalogo.isPending} hidden={!editavel}>
            <Plus size={16} aria-hidden /> Pontos extras
          </Button>
        </div>
        <p className="pagina__subtitulo">Somam o que vem da raça, da classe e os pontos extras que você der.</p>
        {n.pericias.length === 0 ? (
          <EmptyState compacto titulo="Sem perícias" descricao="Vêm da raça e da classe, ou dê pontos extras." />
        ) : (
          <PericiasPorAtributo
            pericias={n.pericias}
            mostrarDescricao={false}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                valor={p.total}
                tituloValor="Total"
                rodape={
                  <span className="pericia__usos">
                    <strong className="pericia__teste"><Dices size={12} aria-hidden /> {p.teste}</strong>{" "}
                    {[p.raca && `raça +${p.raca}`, p.classe && `classe ${p.classe >= 0 ? "+" : ""}${p.classe}`, p.extra && `extra ${p.extra >= 0 ? "+" : ""}${p.extra}`].filter(Boolean).join(" · ")}
                  </span>
                }
                acoes={editavel ? <Button pequeno variante="fantasma" onClick={() => { definirPericia.reset(); setPericiaEmEdicao(p); }}>Extra</Button> : undefined}
              />
            )}
          />
        )}
      </section>

      <section className="secao">
        <h2>Habilidades</h2>
        {n.classe ? (
          <>
            <p className="pagina__subtitulo">Cartas da classe {n.classe.titulo} no nível {n.nivel}.{n.proximasHabilidades > 0 && ` Mais ${n.proximasHabilidades} em níveis maiores.`}</p>
            <HabilidadesDeck habilidades={n.habilidades} vazio="Nenhuma carta neste nível" />
          </>
        ) : (
          <p className="pagina__subtitulo">NPC simples, sem classe: não tem cartas. Dê uma classe em Editar NPC se quiser.</p>
        )}
      </section>

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Inventário</h2>
          <span className="selo">{n.inventario.usados} / {n.inventario.capacidade} espaços</span>
        </div>
        {aviso && <p className="sucesso">{aviso}</p>}
        <div hidden={!editavel}>
          <Button onClick={() => setLancando(true)} disabled={cheio}>
            <Plus size={16} aria-hidden /> Dar item do catálogo
          </Button>
        </div>
        {n.inventario.itens.length === 0 ? (
          <EmptyState compacto titulo="Inventário vazio" />
        ) : (
          <ul className="itens">
            {n.inventario.itens.map((item) => (
              <ItemLinha key={item.id} item={item} onAbrir={() => { mover.reset(); usar.reset(); excluirItem.reset(); setItemAbertoId(item.id); }} />
            ))}
          </ul>
        )}
      </section>

      <Modal aberto={!!itemAberto} onFechar={fecharItem} titulo={itemAberto?.nome ?? ""}>
        {itemAberto && (
          <div className="form">
            <ItemDetalhe item={itemAberto} />
            {(mover.isError || usar.isError || excluirItem.isError) && <div className="aviso">{mensagemDeErro(mover.error ?? usar.error ?? excluirItem.error)}</div>}
            <div className="acoes-item" hidden={!editavel}>
              <Button variante="primario" disabled={usar.isPending}
                onClick={() => usar.mutate(itemAberto.id, { onSuccess: (r) => { setAviso(`${itemAberto.nome} usado${r.consumido ? " e acabou" : ""}.`); fecharItem(); } })}>
                Usar
              </Button>
              {n.destinos.fichas.length > 0 && (
                <select value="" aria-label="Entregar para uma ficha"
                  onChange={(e) => e.target.value && mover.mutate({ itemId: itemAberto.id, fichaId: e.target.value }, { onSuccess: fecharItem })}>
                  <option value="">Entregar para…</option>
                  {n.destinos.fichas.map((f) => <option key={f.id} value={f.id}>{f.nome} (@{f.jogador}) · {f.grupo}</option>)}
                </select>
              )}
              {n.destinos.grupos.length > 0 && (
                <select value="" aria-label="Deixar vago num grupo"
                  onChange={(e) => e.target.value && mover.mutate({ itemId: itemAberto.id, fichaId: null, grupoId: e.target.value }, { onSuccess: fecharItem })}>
                  <option value="">Deixar vago no grupo…</option>
                  {n.destinos.grupos.map((g) => <option key={g.id} value={g.id}>{g.titulo}</option>)}
                </select>
              )}
              <Button variante="perigo" onClick={() => excluirItem.mutate(itemAberto.id, { onSuccess: fecharItem })}>
                <Trash2 size={16} aria-hidden /> Excluir item
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <LancarItemModal grupoId={null} npc={{ id: n.id, nome: n.nome }} aberto={lancando} onFechar={() => setLancando(false)} destinos={[]} />

      <Modal aberto={periciaEmEdicao !== undefined} onFechar={() => setPericiaEmEdicao(undefined)} titulo={periciaEmEdicao ? "Pontos extras" : "Dar pontos extras"}>
        <VinculoPericiaForm
          opcoes={catalogo.data ?? []}
          fixa={periciaEmEdicao ?? undefined}
          valorInicial={periciaEmEdicao?.extra ?? 1}
          rotuloValor="Pontos extras"
          campoValor="pontos"
          dicaValor="Somam com raça e classe. 0 tira os pontos extras."
          enviando={definirPericia.isPending}
          erros={errosDeCampo(definirPericia.error)}
          erroGeral={erroDeFormulario(definirPericia.error)}
          onCancelar={() => setPericiaEmEdicao(undefined)}
          onEnviar={(d) => definirPericia.mutate(d, { onSuccess: () => setPericiaEmEdicao(undefined) })}
        />
      </Modal>

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir NPC"
        mensagem={<>Excluir <strong>{n.nome}</strong>? Os {n.inventario.itens.length} itens com ele também são apagados. Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={() => excluir.mutate(n.id, { onSuccess: () => navigate(voltar, { replace: true }) })}
      />
    </div>
  );
}
