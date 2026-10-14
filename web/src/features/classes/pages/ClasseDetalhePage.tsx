import { Plus } from "lucide-react";
// Página da classe: dados, atalho para a tela de habilidades e perícias (escolhidas do catálogo).
// Toda a lógica de dados/estado de modais fica aqui; os componentes só desenham.
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { EmptyState } from "../../../components/ui/States";
import { useCatalogo, useDesvincularPericia, useVincularPericia } from "../../pericias/api";
import { VinculoPericiaForm } from "../../pericias/components/forms";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import type { PericiaDaClasse } from "../../pericias/types";
import { useClasse, useDuplicarClasse, useExcluirClasse, useProgressao } from "../api";
import { ClasseCabecalho } from "../components/ClasseCabecalho";
import { HabilidadesResumo } from "../components/HabilidadesResumo";
import { ProgressaoPrevia } from "../components/ProgressaoPrevia";

type Exclusao = { tipo: "classe" } | { tipo: "pericia"; pericia: PericiaDaClasse } | null;

export function ClasseDetalhePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const classe = useClasse(id);
  const progressao = useProgressao(id);

  // undefined = modal fechado; null = adicionar perícia; PericiaDaClasse = editando o modificador
  const [periciaEmEdicao, setPericiaEmEdicao] = useState<PericiaDaClasse | null | undefined>(undefined);
  const [exclusao, setExclusao] = useState<Exclusao>(null);

  const catalogo = useCatalogo();
  const vincular = useVincularPericia(id);
  const desvincular = useDesvincularPericia(id);
  const duplicar = useDuplicarClasse();
  const excluirClasse = useExcluirClasse();

  const excluindo = exclusao?.tipo === "classe" ? excluirClasse : desvincular;

  function abrirPericia(p: PericiaDaClasse | null) {
    vincular.reset();
    setPericiaEmEdicao(p);
  }
  const fecharPericia = () => setPericiaEmEdicao(undefined);

  function pedirExclusao(e: NonNullable<Exclusao>) {
    excluirClasse.reset();
    desvincular.reset();
    setExclusao(e);
  }

  function confirmarExclusao() {
    if (exclusao?.tipo === "classe") {
      excluirClasse.mutate(id, { onSuccess: () => navigate("/mestre", { replace: true }) });
    } else if (exclusao?.tipo === "pericia") {
      desvincular.mutate(exclusao.pericia.id, { onSuccess: () => setExclusao(null) });
    }
  }

  if (classe.isPending) return <Loading texto="Carregando classe…" />;
  if (classe.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre">Classes</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(classe.error)} onTentarNovamente={() => classe.refetch()} />
      </div>
    );
  }

  const c = classe.data;
  const editavel = c.editavel ?? !c.fixa;
  // Perícias do catálogo que a classe ainda não tem.
  const disponiveis = (catalogo.data ?? []).filter((p) => !c.pericias.some((cp) => cp.id === p.id));

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre">Classes</LinkVoltar>

      <ClasseCabecalho
        classe={c}
        selo={<SeloVerificado tipo="classe" item={c} />}
        acoes={
          editavel ? (
            <>
              <Link to={`/mestre/classes/${id}/editar`} className="btn">
                Editar classe
              </Link>
              <Button variante="perigo" onClick={() => pedirExclusao({ tipo: "classe" })}>
                Excluir classe
              </Button>
            </>
          ) : (
            <>
              <Button
                variante="primario"
                disabled={duplicar.isPending}
                onClick={() => duplicar.mutate(id, { onSuccess: (copia) => navigate(`/mestre/classes/${copia.id}`) })}
              >
                {duplicar.isPending ? "Duplicando…" : "Duplicar para editar"}
              </Button>
            </>
          )
        }
      />
      {duplicar.isError && <div className="aviso">Não foi possível duplicar: {mensagemDeErro(duplicar.error)}</div>}

      <section className="secao">
        <h2>Habilidades</h2>
        <HabilidadesResumo
          habilidades={c.habilidades}
          href={`/mestre/classes/${id}/habilidades`}
          rotuloLink={editavel ? "Gerenciar habilidades" : "Ver habilidades"}
        />
      </section>

      <section className="secao">
        <h2>Progressão de nível</h2>
        {progressao.isPending ? (
          <Loading compacto texto="Calculando progressão…" />
        ) : progressao.isError ? (
          <ErrorState mensagem={mensagemDeErro(progressao.error)} onTentarNovamente={() => progressao.refetch()} />
        ) : (
          <ProgressaoPrevia progressao={progressao.data} habilidades={c.habilidades} />
        )}
      </section>

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Perícias</h2>
          {editavel && (
            <Button
              onClick={() => abrirPericia(null)}
              disabled={catalogo.isPending || disponiveis.length === 0}
              title={disponiveis.length === 0 && !catalogo.isPending ? "Todas as perícias do catálogo já estão nesta classe" : undefined}
            >
              <Plus size={16} aria-hidden /> Adicionar perícia
            </Button>
          )}
        </div>
        {editavel && catalogo.isError && (
          <div className="aviso">Não foi possível carregar o catálogo: {mensagemDeErro(catalogo.error)}</div>
        )}
        {c.pericias.length === 0 ? (
          <EmptyState
            compacto
            titulo="Nenhuma perícia nesta classe"
            descricao={editavel ? <>Adicione perícias do seu <Link to="/mestre/pericias">catálogo</Link>.</> : undefined}
          />
        ) : (
          <PericiasPorAtributo
            pericias={c.pericias}
            mostrarDescricao={false}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                valor={p.modificador}
                tituloValor="Modificador da classe"
                acoes={
                  editavel && (
                    <>
                      <Button pequeno variante="fantasma" onClick={() => abrirPericia(p)}>
                        Modificador
                      </Button>
                      <Button
                        pequeno
                        variante="fantasma"
                        aria-label={`Remover ${p.nome}`}
                        onClick={() => pedirExclusao({ tipo: "pericia", pericia: p })}
                      >
                        Remover
                      </Button>
                    </>
                  )
                }
              />
            )}
          />
        )}
      </section>

      <Modal
        aberto={periciaEmEdicao !== undefined}
        onFechar={fecharPericia}
        titulo={periciaEmEdicao ? "Modificador da perícia" : "Adicionar perícia"}
      >
        <VinculoPericiaForm
          opcoes={disponiveis}
          fixa={periciaEmEdicao ?? undefined}
          valorInicial={periciaEmEdicao?.modificador ?? 0}
          rotuloValor="Modificador da classe"
          campoValor="modificador"
          dicaValor="Ex.: 2 para +2, -1 para -1."
          enviando={vincular.isPending}
          erros={errosDeCampo(vincular.error)}
          erroGeral={erroDeFormulario(vincular.error)}
          onCancelar={fecharPericia}
          onEnviar={(dados) => vincular.mutate(dados, { onSuccess: fecharPericia })}
        />
      </Modal>

      <ConfirmDialog
        aberto={!!exclusao}
        titulo={exclusao?.tipo === "classe" ? "Excluir classe" : "Remover perícia"}
        rotuloConfirmar={exclusao?.tipo === "classe" ? "Excluir" : "Remover"}
        mensagem={
          exclusao?.tipo === "classe" ? (
            <>Excluir <strong>{c.titulo}</strong> com todas as habilidades e perícias? Não dá para desfazer.</>
          ) : (
            <>Remover <strong>{exclusao?.tipo === "pericia" && exclusao.pericia.nome}</strong> desta classe? A perícia continua no catálogo.</>
          )
        }
        processando={excluindo.isPending}
        erro={excluindo.isError ? mensagemDeErro(excluindo.error) : null}
        onCancelar={() => setExclusao(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
