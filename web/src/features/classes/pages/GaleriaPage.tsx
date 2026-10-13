import { Plus } from "lucide-react";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { useClasses, useDuplicarClasse, useExcluirClasse } from "../api";
import { ClasseCard } from "../components/ClasseCard";
import { ConceitosSecao } from "../components/ConceitosSecao";
import { GrupoFilter } from "../components/GrupoFilter";
import { GRUPOS, ROTULO_GRUPO, type Classe, type Grupo } from "../types";

export function GaleriaPage() {
  const [params, setParams] = useSearchParams();
  const grupoParam = params.get("grupo") as Grupo | null;
  const grupo = grupoParam && GRUPOS.includes(grupoParam) ? grupoParam : undefined;

  const navigate = useNavigate();
  const classes = useClasses(grupo);
  const { kitId } = useKitAtivo();
  const classesNoKit = (classes.data ?? []).filter((x) => x.fixa || soDoKit(x.kitIds, kitId));
  const duplicar = useDuplicarClasse();
  const excluir = useExcluirClasse();
  const [aExcluir, setAExcluir] = useState<Classe | null>(null);

  function filtrar(g: Grupo | undefined) {
    setParams(g ? { grupo: g } : {}, { replace: true });
  }

  async function duplicarClasse(c: Classe) {
    const copia = await duplicar.mutateAsync(c.id).catch(() => null);
    if (copia) navigate(`/mestre/classes/${copia.id}`);
  }

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Classes</h1>
          <p className="pagina__subtitulo">Escolha uma classe para ver o kit, duplique uma fixa ou crie a sua.</p>
        </div>
        <Link to="/mestre/classes/nova" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Nova classe
        </Link>
      </div>

      <ConceitosSecao />

      <h2>Todas as classes</h2>
      <GrupoFilter valor={grupo} onChange={filtrar} />

      {duplicar.isError && <div className="aviso">Não foi possível duplicar: {mensagemDeErro(duplicar.error)}</div>}

      <AvisoKit />
      {classes.isPending ? (
        <Loading texto="Carregando classes…" />
      ) : classes.isError ? (
        <ErrorState mensagem={mensagemDeErro(classes.error)} onTentarNovamente={() => classes.refetch()} />
      ) : classesNoKit.length === 0 ? (
        <EmptyState
          titulo={grupo ? `Nenhuma classe do grupo ${ROTULO_GRUPO[grupo]}` : "Nenhuma classe ainda"}
          descricao="Crie uma classe do zero para começar."
          acao={
            <Link to="/mestre/classes/nova" className="btn btn--primario">
              <Plus size={16} aria-hidden /> Nova classe
            </Link>
          }
        />
      ) : (
        <div className="galeria">
          {classesNoKit.map((c) => (
            <ClasseCard
              key={c.id}
              classe={c}
              href={`/mestre/classes/${c.id}`}
              acoes={
                !(c.editavel ?? !c.fixa) ? (
                  <Button pequeno onClick={() => duplicarClasse(c)} disabled={duplicar.isPending}>
                    {duplicar.isPending && duplicar.variables === c.id ? "Duplicando…" : "Duplicar"}
                  </Button>
                ) : (
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
