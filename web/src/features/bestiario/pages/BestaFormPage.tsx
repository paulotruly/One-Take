import { useNavigate, useParams, useSearchParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useBesta, useConceitosBesta, useCriarBesta, useEditarBesta } from "../api";
import { BestaForm } from "../components/BestaForm";

export function NovaBestaPage() {
  const navigate = useNavigate();
  const criar = useCriarBesta();
  const conceitos = useConceitosBesta();
  const [params] = useSearchParams();
  if (conceitos.isPending) return <Loading />;
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to="/mestre/bestiario">Bestiário</LinkVoltar>
      <h1>Nova criatura</h1>
      <p className="pagina__subtitulo">Primeiro crie a criatura; depois, na página dela, adicione atributos, perícias e cartas.</p>
      <BestaForm
        rotulo="Criar criatura"
        inicial={{ conceitoId: params.get("conceito") }}
        conceitos={conceitos.data}
        enviando={criar.isPending}
        erros={errosDeCampo(criar.error)}
        erroGeral={erroDeFormulario(criar.error)}
        onCancelar={() => navigate("/mestre/bestiario")}
        onEnviar={(dados) => criar.mutate(dados, { onSuccess: (b) => navigate(`/mestre/bestiario/${b.id}`) })}
      />
    </div>
  );
}

export function EditarBestaPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const besta = useBesta(id);
  const editar = useEditarBesta(id);
  const conceitos = useConceitosBesta();

  if (besta.isPending) return <Loading />;
  if (besta.isError) return <ErrorState mensagem={mensagemDeErro(besta.error)} onTentarNovamente={() => besta.refetch()} />;

  const voltar = () => navigate(`/mestre/bestiario/${id}`);
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to={`/mestre/bestiario/${id}`}>{besta.data.titulo}</LinkVoltar>
      <h1>Editar criatura</h1>
      <BestaForm
        inicial={besta.data}
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
