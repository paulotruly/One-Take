import { Plus, Users } from "lucide-react";
import { Link } from "react-router";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { useGrupos } from "../api";

export function GruposPage() {
  const grupos = useGrupos();
  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Grupos</h1>
          <p className="pagina__subtitulo">Cada grupo é um RPG seu. Os jogadores entram com o código e criam a ficha lá dentro.</p>
        </div>
        <Link to="/mestre/grupos/novo" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Novo grupo
        </Link>
      </div>

      {grupos.isPending ? (
        <Loading texto="Carregando grupos…" />
      ) : grupos.isError ? (
        <ErrorState mensagem={mensagemDeErro(grupos.error)} onTentarNovamente={() => grupos.refetch()} />
      ) : grupos.data.length === 0 ? (
        <EmptyState
          titulo="Nenhum grupo ainda"
          descricao="Crie o primeiro grupo e compartilhe o código com os jogadores."
          acao={
            <Link to="/mestre/grupos/novo" className="btn btn--primario">
              <Plus size={16} aria-hidden /> Novo grupo
            </Link>
          }
        />
      ) : (
        <ul className="lista-cards">
          {grupos.data.map((g) => (
            <li key={g.id}>
              <Link to={`/mestre/grupos/${g.id}`} className="card-link card-link--com-imagem">
                <div className="card-link__imagem">
                  <ClasseImagem url={g.imagemUrl} titulo={g.titulo} />
                </div>
                <div className="card-link__topo">
                  <h3>{g.titulo}</h3>
                  <span className="selo">{g.genero}</span>
                </div>
                <p className="card-link__descricao">{g.sinopse}</p>
                <p className="card-link__rodape">
                  <Users size={14} aria-hidden /> {g.membros} de {g.limiteMembros} jogadores · código {g.codigo}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
