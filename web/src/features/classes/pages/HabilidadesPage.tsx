// Tela própria de habilidades de uma classe (que já precisa existir).
import { useParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { useClasse, useCriarHabilidade, useOrdenarHabilidades } from "../api";
import { GrupoBadge } from "../components/Selos";
import { CartelaEditor } from "./CartelaEditor";

export function HabilidadesPage() {
  const { id = "" } = useParams();
  const classe = useClasse(id);
  const criar = useCriarHabilidade(id);
  const ordenar = useOrdenarHabilidades(id);

  if (classe.isPending) return <Loading texto="Carregando habilidades…" />;
  if (classe.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre">Classes</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(classe.error)} onTentarNovamente={() => classe.refetch()} />
      </div>
    );
  }

  const c = classe.data;

  return (
    <div className="pagina">
      <LinkVoltar to={`/mestre/classes/${id}`}>{c.titulo}</LinkVoltar>
      <div className="classe-cabecalho__info">
        <div className="classe-cabecalho__selos">
          <GrupoBadge grupo={c.grupo} />
        </div>
        <h1>Habilidades de {c.titulo}</h1>
        <p className="pagina__subtitulo">
          {c.habilidades.length} {c.habilidades.length === 1 ? "carta" : "cartas"} na cartela · toque numa carta para ver tudo
          {" · use as setas da carta para reordenar"}
        </p>
      </div>
      <CartelaEditor habilidades={c.habilidades} editavel criar={criar} ordenar={ordenar} />
    </div>
  );
}
