// Página da criatura: dados, dados por atributo, perícias (com o teste montado), cartela e prévia de progressão.
import { Copy, Dices, Footprints, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { ProgressaoPrevia } from "../../classes/components/ProgressaoPrevia";
import { StatsBar } from "../../classes/components/StatsBar";
import { CartelaEditor } from "../../classes/pages/CartelaEditor";
import { useAtributos, useCatalogo } from "../../pericias/api";
import { VinculoPericiaForm } from "../../pericias/components/forms";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import {
  useBesta,
  useCriarHabilidadeBesta,
  useDefinirAtributoBesta,
  useDesvincularPericiaBesta,
  useDuplicarBesta,
  useExcluirBesta,
  useOrdenarHabilidadesBesta,
  useProgressaoBesta,
  useVincularPericiaBesta,
} from "../api";
import type { PericiaDaBesta } from "../types";

export function BestaDetalhePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const besta = useBesta(id);
  const progressao = useProgressaoBesta(id);
  const atributos = useAtributos();
  const catalogo = useCatalogo();
  const definirAtributo = useDefinirAtributoBesta(id);
  const vincular = useVincularPericiaBesta(id);
  const desvincular = useDesvincularPericiaBesta(id);
  const duplicar = useDuplicarBesta();
  const excluir = useExcluirBesta();
  const criarCarta = useCriarHabilidadeBesta(id);
  const ordenar = useOrdenarHabilidadesBesta(id);

  const [periciaEmEdicao, setPericiaEmEdicao] = useState<PericiaDaBesta | null | undefined>(undefined);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  if (besta.isPending) return <Loading texto="Carreganda criatura…" />;
  if (besta.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre/bestiario">Bestiário</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(besta.error)} onTentarNovamente={() => besta.refetch()} />
      </div>
    );
  }
  const b = besta.data;
  const dados = new Map(b.atributos.map((a) => [a.id, a.dados]));
  const disponiveis = (catalogo.data ?? []).filter((p) => !b.pericias.some((bp) => bp.id === p.id));
  const fecharPericia = () => setPericiaEmEdicao(undefined);

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/bestiario">Bestiário</LinkVoltar>

      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato">
          <ClasseImagem url={b.imagemUrl} titulo={b.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          {b.conceito && <p className="classe-card__conceito">Forma de {b.conceito.titulo}</p>}
          <h1>{b.titulo}</h1>
          <StatsBar vida={b.pontosVida} mana={b.pontosMana} esforco={b.pontosEsforco} />
          <span className="stat"><Footprints size={14} aria-hidden /> Deslocamento: {b.deslocamento} quadrados</span>
          <p className="classe-cabecalho__descricao">{b.descricao}</p>
          <div className="classe-cabecalho__acoes">
            <Link to={`/mestre/bestiario/${id}/editar`} className="btn">Editar criatura</Link>
            <Button disabled={duplicar.isPending} onClick={() => duplicar.mutate(id, { onSuccess: (c) => navigate(`/mestre/bestiario/${c.id}`) })}>
              <Copy size={16} aria-hidden /> Duplicar
            </Button>
            <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmarExclusao(true); }}>Excluir criatura</Button>
          </div>
        </div>
      </header>
      {(duplicar.isError || definirAtributo.isError) && <div className="aviso">{mensagemDeErro(duplicar.error ?? definirAtributo.error)}</div>}

      <section className="secao">
        <h2>Atributos</h2>
        <p className="pagina__subtitulo">Dados (d20) da criatura em cada atributo. Sem dados = rola 1 d20 e o resultado vale a metade.</p>
        {atributos.isPending ? (
          <Loading compacto />
        ) : (
          <ul className="dados-atributos">
            {(atributos.data ?? []).map((a) => {
              const n = dados.get(a.id) ?? 0;
              return (
                <li key={a.id} className="dados-atributo">
                  <div>
                    <strong>{a.nome}</strong>
                    <p className="pericia__descricao">Teste: {b.atributos.find((x) => x.id === a.id)?.teste ?? "1d20 ÷ 2"}</p>
                  </div>
                  <div className="contador">
                    <Button pequeno aria-label={`Menos um dado em ${a.nome}`} disabled={n === 0 || definirAtributo.isPending}
                      onClick={() => definirAtributo.mutate({ atributoId: a.id, dados: n - 1 })}>
                      <Minus size={14} aria-hidden />
                    </Button>
                    <span className="contador__valor"><Dices size={16} aria-hidden /> {n}d20</span>
                    <Button pequeno aria-label={`Mais um dado em ${a.nome}`} disabled={n >= 20 || definirAtributo.isPending}
                      onClick={() => definirAtributo.mutate({ atributoId: a.id, dados: n + 1 })}>
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
          <Button onClick={() => { vincular.reset(); setPericiaEmEdicao(null); }} disabled={catalogo.isPending || disponiveis.length === 0}>
            <Plus size={16} aria-hidden /> Adicionar perícia
          </Button>
        </div>
        {b.pericias.length === 0 ? (
          <EmptyState compacto titulo="Nenhuma perícia" descricao={<>Adicione perícias do seu <Link to="/mestre/pericias">catálogo</Link>.</>} />
        ) : (
          <PericiasPorAtributo
            pericias={b.pericias}
            mostrarDescricao={false}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                valor={p.modificador}
                tituloValor="Modificador"
                rodape={<span className="pericia__usos"><strong className="pericia__teste"><Dices size={12} aria-hidden /> {p.teste}</strong></span>}
                acoes={
                  <>
                    <Button pequeno variante="fantasma" onClick={() => { vincular.reset(); setPericiaEmEdicao(p); }}>Modificador</Button>
                    <Button pequeno variante="fantasma" onClick={() => desvincular.mutate(p.id)} aria-label={`Remover ${p.nome}`}>Remover</Button>
                  </>
                }
              />
            )}
          />
        )}
      </section>

      <section className="secao">
        <h2>Habilidades</h2>
        <p className="pagina__subtitulo">Mesmas regras das classes: cartas com nível necessário e aprimoramentos. Toque numa carta para ver tudo.</p>
        <CartelaEditor habilidades={b.habilidades} editavel criar={criarCarta} ordenar={ordenar} />
      </section>

      <section className="secao">
        <h2>Progressão de nível</h2>
        <p className="pagina__subtitulo">Ao invocar no grupo você escolhe o nível. Os pontos de perícia por nível não se aplicam a criaturas.</p>
        {progressao.isPending ? (
          <Loading compacto />
        ) : progressao.isError ? (
          <ErrorState mensagem={mensagemDeErro(progressao.error)} onTentarNovamente={() => progressao.refetch()} />
        ) : (
          <ProgressaoPrevia progressao={progressao.data} habilidades={b.habilidades} />
        )}
      </section>

      <Modal aberto={periciaEmEdicao !== undefined} onFechar={fecharPericia} titulo={periciaEmEdicao ? "Modificador da perícia" : "Adicionar perícia"}>
        <VinculoPericiaForm
          opcoes={disponiveis}
          fixa={periciaEmEdicao ?? undefined}
          valorInicial={periciaEmEdicao?.modificador ?? 0}
          rotuloValor="Modificador da criatura"
          campoValor="modificador"
          dicaValor="Ex.: 3 para +3."
          enviando={vincular.isPending}
          erros={errosDeCampo(vincular.error)}
          erroGeral={erroDeFormulario(vincular.error)}
          onCancelar={fecharPericia}
          onEnviar={(d) => vincular.mutate(d, { onSuccess: fecharPericia })}
        />
      </Modal>

      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir criatura"
        mensagem={<>Excluir <strong>{b.titulo}</strong> com todas as cartas? As criaturas dela invocadas nos grupos também somem. Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={() => excluir.mutate(id, { onSuccess: () => navigate("/mestre/bestiario", { replace: true }) })}
      />
    </div>
  );
}
