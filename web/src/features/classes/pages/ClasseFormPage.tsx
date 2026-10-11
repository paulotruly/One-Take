import { Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useClasse, useConceitos, useCriarClasse, useEditarClasse } from "../api";
import { useGrupos } from "../../grupos/api";
import { ClasseForm } from "../components/forms";

export function NovaClassePage() {
  const navigate = useNavigate();
  const criar = useCriarClasse();
  const grupos = useGrupos();
  const conceitos = useConceitos();
  const [params] = useSearchParams();
  const conceitoInicial = params.get("conceito");
  if (conceitos.isPending) return <Loading />;
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to="/mestre">Classes</LinkVoltar>
      <h1>Nova classe</h1>
      <p className="pagina__subtitulo">Primeiro crie a classe; depois, na página dela, adicione habilidades e perícias.</p>
      <ClasseForm
        rotulo="Criar classe"
        grupos={grupos.data}
        conceitos={conceitos.data}
        inicial={
          conceitoInicial
            ? { grupo: "COMBATENTE", titulo: "", descricao: "", imagemUrl: null, pontosVida: undefined as unknown as number, pontosMana: undefined as unknown as number, pontosEsforco: undefined as unknown as number, grupoExclusivoId: null, conceitoId: conceitoInicial }
            : undefined
        }
        enviando={criar.isPending}
        erros={errosDeCampo(criar.error)}
        erroGeral={erroDeFormulario(criar.error)}
        onCancelar={() => navigate("/mestre")}
        onEnviar={(dados) => criar.mutate(dados, { onSuccess: (c) => navigate(`/mestre/classes/${c.id}`) })}
      />
    </div>
  );
}

export function EditarClassePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const classe = useClasse(id);
  const editar = useEditarClasse(id);
  const grupos = useGrupos();
  const conceitos = useConceitos();

  if (classe.isPending) return <Loading />;
  if (classe.isError) return <ErrorState mensagem={mensagemDeErro(classe.error)} onTentarNovamente={() => classe.refetch()} />;
  if (classe.data.fixa) return <Navigate to={`/mestre/classes/${id}`} replace />;

  const voltar = () => navigate(`/mestre/classes/${id}`);
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to={`/mestre/classes/${id}`}>{classe.data.titulo}</LinkVoltar>
      <h1>Editar classe</h1>
      <ClasseForm
        inicial={{ ...classe.data, grupoExclusivoId: classe.data.grupoExclusivoId ?? null, conceitoId: classe.data.conceitoId ?? null }}
        grupos={grupos.data}
        conceitos={conceitos.data}
        enviando={editar.isPending}
        erros={errosDeCampo(editar.error)}
        erroGeral={erroDeFormulario(editar.error)}
        onCancelar={voltar}
        onEnviar={(dados) => editar.mutate(dados, { onSuccess: voltar })}
      />
    </div>
  );
}
