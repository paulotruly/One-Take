import { Plus } from "lucide-react";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { useClasses, useExcluirClasse } from "../api";
import { ClasseCard } from "../components/ClasseCard";
import { ConceitosSecao } from "../components/ConceitosSecao";
import { GrupoFilter } from "../components/GrupoFilter";
import { GRUPOS, ROTULO_GRUPO, type Classe, type Grupo } from "../types";

export function GaleriaPage() {
  const [params, setParams] = useSearchParams();
  const grupoParam = params.get("grupo") as Grupo | null;
  const grupo = grupoParam && GRUPOS.includes(grupoParam) ? grupoParam : undefined;

  const classes = useClasses(grupo);
  const { kitId } = useKitAtivo();
  const classesNoKit = (classes.data ?? []).filter((x) => soDoKit(x.kitIds, kitId));
  const excluir = useExcluirClasse();
  const [aExcluir, setAExcluir] = useState<Classe | null>(null);

  function filtrar(g: Grupo | undefined) {
    setParams(g ? { grupo: g } : {}, { replace: true });
  }

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Classes</h1>
          <p className="pagina__subtitulo">Abra uma classe para ver a cartela ou crie uma nova.</p>
        </div>
        <Link to="/mestre/classes/nova" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Nova classe
        </Link>
      </div>

      <GrupoFilter valor={grupo} onChange={filtrar} />


      {classes.isPending ? (
        <Loading texto="Carregando classes…" />
      ) : classes.isError ? (
        <ErrorState mensagem={mensagemDeErro(classes.error)} onTentarNovamente={() => classes.refetch()} />
      ) : (
        <ConceitosSecao
          classes={classesNoKit}
          filtrando={!!grupo || !!kitId}
          vazio={
            <EmptyState
              titulo={grupo ? `Nenhuma classe da função ${ROTULO_GRUPO[grupo]}` : "Nenhuma classe ainda"}
              descricao="Crie uma classe do zero para começar."
              acao={
                <Link to="/mestre/classes/nova" className="btn btn--primario">
                  <Plus size={16} aria-hidden /> Nova classe
                </Link>
              }
            />
          }
          renderClasses={(lista) => (
            <div className="galeria">
              {lista.map((c) => (
                <ClasseCard
                  key={c.id}
                  classe={c}
                  href={`/mestre/classes/${c.id}`}
                  acoes={
                    (
                      <>
                        <Link to={`/mestre/classes/${c.id}/editar`} className="btn btn--pequeno">
                          Editar
                        </Link>
                        <Button pequeno variante="perigo" onClick={() => { excluir.reset(); setAExcluir(c); }}>
                          Excluir
                        </Button>
                      </>
                    )
                  }
                />
              ))}
            </div>
          )}
        />
      )}

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir classe"
        mensagem={
          <>
            Excluir <strong>{aExcluir?.titulo}</strong> com todas as habilidades e perícias? Não dá para desfazer.
          </>
        }
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </div>
  );
}
