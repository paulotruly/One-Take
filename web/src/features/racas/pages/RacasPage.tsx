import { Footprints, Plus } from "lucide-react";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { ConceitosBloco } from "../../classes/components/ConceitosBloco";
import { formatarModificador } from "../../pericias/types";
import { useConceitosRaca, useCriarConceitoRaca, useCriarRaca, useEditarConceitoRaca, useExcluirConceitoRaca, useRacas } from "../api";
import { RacaForm } from "../components/RacaForm";
import { kitsPadrao } from "../../kits/types";

export function RacasPage() {
  const racas = useRacas();
  const { kitId } = useKitAtivo();
  const racasNoKit = (racas.data ?? []).filter((x) => soDoKit(x.kitIds, kitId));
  const conceitos = useConceitosRaca();
  const criar = useCriarRaca();
  const criarConceito = useCriarConceitoRaca();
  const editarConceito = useEditarConceitoRaca();
  const excluirConceito = useExcluirConceitoRaca();
  const navigate = useNavigate();
  // undefined = fechado; string = conceito já escolhido ("" = avulsa)
  const [criando, setCriando] = useState<string | undefined>(undefined);

  function novaRaca(conceitoId = "") {
    criar.reset();
    setCriando(conceitoId);
  }

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Raças</h1>
          <p className="pagina__subtitulo">Cada raça define o deslocamento e as perícias que o personagem já recebe de base.</p>
        </div>
        <Button variante="primario" onClick={() => novaRaca()}>
          <Plus size={16} aria-hidden /> Nova raça
        </Button>
      </div>

      <ConceitosBloco
        titulo="Arquétipos de raça"
        nome="arquétipo de raça"
        explicacao="Uma raça generalista (ex.: Elfo) com sub-raças (Elfo da floresta, Elfo sombrio). O jogador escolhe a sub-raça."
        exemplo="Ex.: Elfo"
        rotuloFilho="Sub-raça"
        conceitos={conceitos.data?.map((c) => ({ ...c, filhos: c.subracas }))}
        carregando={conceitos.isPending}
        erro={conceitos.error}
        onTentarNovamente={() => conceitos.refetch()}
        hrefFilho={(id) => `/mestre/racas/${id}`}
        onNovoFilho={(id) => novaRaca(id)}
        criar={criarConceito}
        editar={editarConceito}
        excluir={excluirConceito}
      />

      <h2>Todas as raças</h2>
      <AvisoKit />
      {racas.isPending ? (
        <Loading texto="Carregando raças…" />
      ) : racas.isError ? (
        <ErrorState mensagem={mensagemDeErro(racas.error)} onTentarNovamente={() => racas.refetch()} />
      ) : racasNoKit.length === 0 ? (
        <EmptyState titulo="Nenhuma raça ainda" descricao="Crie a primeira raça para usar nas fichas." />
      ) : (
        <ul className="lista-cards">
          {racasNoKit.map((r) => (
            <li key={r.id}>
              <Link to={`/mestre/racas/${r.id}`} className="card-link card-link--com-imagem">
                <div className="card-link__imagem">
                  <ClasseImagem url={r.imagemUrl} titulo={r.titulo} />
                </div>
                <div className="card-link__topo">
                  <div>
                    {r.conceito && <span className="classe-card__conceito">{r.conceito.titulo}</span>}
                    <h3>{r.titulo}</h3>
                  </div>
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

      <Modal aberto={criando !== undefined} onFechar={() => setCriando(undefined)} titulo="Nova raça">
        <RacaForm
          key={criando ?? "fechado"}
          inicial={criando ? { titulo: "", descricao: "", imagemUrl: null, deslocamento: undefined as unknown as number, kitIds: kitsPadrao(), conceitoId: criando } : undefined}
          conceitos={conceitos.data}
          enviando={criar.isPending}
          erros={errosDeCampo(criar.error)}
          erroGeral={erroDeFormulario(criar.error)}
          onCancelar={() => setCriando(undefined)}
          onEnviar={(dados) => criar.mutate(dados, { onSuccess: (r) => navigate(`/mestre/racas/${r.id}`) })}
        />
      </Modal>
    </div>
  );
}
