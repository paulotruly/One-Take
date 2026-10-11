// Página da raça: dados (título, descrição, deslocamento) e perícias de base escolhidas do catálogo.
import { Footprints, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useCatalogo } from "../../pericias/api";
import { VinculoPericiaForm } from "../../pericias/components/forms";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import type { PericiaDaRaca } from "../../pericias/types";
import { useDesvincularPericiaRaca, useEditarRaca, useExcluirRaca, useRaca, useVincularPericiaRaca } from "../api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { useGrupos } from "../../grupos/api";
import { RacaForm } from "../components/RacaForm";

type Exclusao = { tipo: "raca" } | { tipo: "pericia"; pericia: PericiaDaRaca } | null;

export function RacaDetalhePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const raca = useRaca(id);
  const catalogo = useCatalogo();
  const editar = useEditarRaca(id);
  const excluir = useExcluirRaca();
  const vincular = useVincularPericiaRaca(id);
  const desvincular = useDesvincularPericiaRaca(id);
  const grupos = useGrupos();

  const [editando, setEditando] = useState(false);
  // undefined = fechado; null = adicionar; PericiaDaRaca = editando pontos
  const [periciaEmEdicao, setPericiaEmEdicao] = useState<PericiaDaRaca | null | undefined>(undefined);
  const [exclusao, setExclusao] = useState<Exclusao>(null);
  const excluindo = exclusao?.tipo === "raca" ? excluir : desvincular;

  if (raca.isPending) return <Loading texto="Carregando raça…" />;
  if (raca.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre/racas">Raças</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(raca.error)} onTentarNovamente={() => raca.refetch()} />
      </div>
    );
  }

  const r = raca.data;
  const disponiveis = (catalogo.data ?? []).filter((p) => !r.pericias.some((rp) => rp.id === p.id));
  const fecharPericia = () => setPericiaEmEdicao(undefined);

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/racas">Raças</LinkVoltar>

      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato">
          <ClasseImagem url={r.imagemUrl} titulo={r.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          <h1>{r.titulo}</h1>
          <span className="stat" title="Deslocamento por turno">
            <Footprints size={14} aria-hidden /> Deslocamento: {r.deslocamento} quadrados por turno
          </span>
          <p className="classe-cabecalho__descricao">{r.descricao}</p>
          <div className="classe-cabecalho__acoes">
          <Button
            onClick={() => {
              editar.reset();
              setEditando(true);
            }}
          >
            Editar raça
          </Button>
          <Button
            variante="perigo"
            onClick={() => {
              excluir.reset();
              setExclusao({ tipo: "raca" });
            }}
          >
            Excluir raça
          </Button>
          </div>
        </div>
      </header>

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Perícias de base</h2>
          <Button
            onClick={() => {
              vincular.reset();
              setPericiaEmEdicao(null);
            }}
            disabled={catalogo.isPending || disponiveis.length === 0}
          >
            <Plus size={16} aria-hidden /> Adicionar perícia
          </Button>
        </div>
        {r.pericias.length === 0 ? (
          <EmptyState
            compacto
            titulo="Esta raça ainda não dá perícias"
            descricao={<>Adicione perícias do seu <Link to="/mestre/pericias">catálogo</Link> com a quantidade de pontos.</>}
          />
        ) : (
          <PericiasPorAtributo
            pericias={r.pericias}
            mostrarDescricao={false}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                valor={p.pontos}
                tituloValor="Pontos de base da raça"
                acoes={
                  <>
                    <Button pequeno variante="fantasma" onClick={() => { vincular.reset(); setPericiaEmEdicao(p); }}>
                      Pontos
                    </Button>
                    <Button
                      pequeno
                      variante="fantasma"
                      aria-label={`Remover ${p.nome}`}
                      onClick={() => { desvincular.reset(); setExclusao({ tipo: "pericia", pericia: p }); }}
                    >
                      Remover
                    </Button>
                  </>
                }
              />
            )}
          />
        )}
      </section>

      <Modal aberto={editando} onFechar={() => setEditando(false)} titulo="Editar raça">
        <RacaForm
          inicial={r}
          grupos={grupos.data}
          enviando={editar.isPending}
          erros={errosDeCampo(editar.error)}
          erroGeral={erroDeFormulario(editar.error)}
          onCancelar={() => setEditando(false)}
          onEnviar={(dados) => editar.mutate(dados, { onSuccess: () => setEditando(false) })}
        />
      </Modal>

      <Modal aberto={periciaEmEdicao !== undefined} onFechar={fecharPericia} titulo={periciaEmEdicao ? "Pontos da perícia" : "Adicionar perícia"}>
        <VinculoPericiaForm
          opcoes={disponiveis}
          fixa={periciaEmEdicao ?? undefined}
          valorInicial={periciaEmEdicao?.pontos ?? 1}
          rotuloValor="Pontos de base"
          campoValor="pontos"
          dicaValor="Quantos pontos o personagem já recebe nessa perícia por ser desta raça."
          minimo={1}
          enviando={vincular.isPending}
          erros={errosDeCampo(vincular.error)}
          erroGeral={erroDeFormulario(vincular.error)}
          onCancelar={fecharPericia}
          onEnviar={(dados) => vincular.mutate(dados, { onSuccess: fecharPericia })}
        />
      </Modal>

      <ConfirmDialog
        aberto={!!exclusao}
        titulo={exclusao?.tipo === "raca" ? "Excluir raça" : "Remover perícia"}
        rotuloConfirmar={exclusao?.tipo === "raca" ? "Excluir" : "Remover"}
        mensagem={
          exclusao?.tipo === "raca" ? (
            <>Excluir a raça <strong>{r.titulo}</strong>? Não dá para desfazer.</>
          ) : (
            <>Remover <strong>{exclusao?.tipo === "pericia" && exclusao.pericia.nome}</strong> desta raça? A perícia continua no catálogo.</>
          )
        }
        processando={excluindo.isPending}
        erro={excluindo.isError ? mensagemDeErro(excluindo.error) : null}
        onCancelar={() => setExclusao(null)}
        onConfirmar={() => {
          if (exclusao?.tipo === "raca") excluir.mutate(id, { onSuccess: () => navigate("/mestre/racas", { replace: true }) });
          else if (exclusao?.tipo === "pericia") desvincular.mutate(exclusao.pericia.id, { onSuccess: () => setExclusao(null) });
        }}
      />
    </div>
  );
}
