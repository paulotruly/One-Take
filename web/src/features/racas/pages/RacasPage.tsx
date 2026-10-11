import { Footprints, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { formatarModificador } from "../../pericias/types";
import { useGrupos } from "../../grupos/api";
import { useCriarRaca, useRacas } from "../api";
import { RacaForm } from "../components/RacaForm";

export function RacasPage() {
  const racas = useRacas();
  const criar = useCriarRaca();
  const navigate = useNavigate();
  const [criando, setCriando] = useState(false);
  const grupos = useGrupos();

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Raças</h1>
          <p className="pagina__subtitulo">Cada raça define o deslocamento e as perícias que o personagem já recebe de base.</p>
        </div>
        <Button
          variante="primario"
          onClick={() => {
            criar.reset();
            setCriando(true);
          }}
        >
          <Plus size={16} aria-hidden /> Nova raça
        </Button>
      </div>

      {racas.isPending ? (
        <Loading texto="Carregando raças…" />
      ) : racas.isError ? (
        <ErrorState mensagem={mensagemDeErro(racas.error)} onTentarNovamente={() => racas.refetch()} />
      ) : racas.data.length === 0 ? (
        <EmptyState titulo="Nenhuma raça ainda" descricao="Crie a primeira raça para usar nas fichas." />
      ) : (
        <ul className="lista-cards">
          {racas.data.map((r) => (
            <li key={r.id}>
              <Link to={`/mestre/racas/${r.id}`} className="card-link card-link--com-imagem">
                <div className="card-link__imagem">
                  <ClasseImagem url={r.imagemUrl} titulo={r.titulo} />
                </div>
                <div className="card-link__topo">
                  <h3>{r.titulo}</h3>
                  <span className="stat" title="Deslocamento por turno">
                    <Footprints size={14} aria-hidden /> {r.deslocamento} quadrados
                  </span>
                </div>
                <p className="card-link__descricao">{r.descricao}</p>
                <p className="card-link__rodape">
                  {r.pericias.length === 0
                    ? "Sem perícias de base"
                    : r.pericias.map((p) => `${p.nome} ${formatarModificador(p.pontos)}`).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal aberto={criando} onFechar={() => setCriando(false)} titulo="Nova raça">
        <RacaForm
          grupos={grupos.data}
          enviando={criar.isPending}
          erros={errosDeCampo(criar.error)}
          erroGeral={erroDeFormulario(criar.error)}
          onCancelar={() => setCriando(false)}
          onEnviar={(dados) => criar.mutate(dados, { onSuccess: (r) => navigate(`/mestre/racas/${r.id}`) })}
        />
      </Modal>
    </div>
  );
}
