// Criar e editar grupo: informações + o que vale no grupo, numa tela só.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useClasses } from "../../classes/api";
import { useAtributos, useCatalogo } from "../../pericias/api";
import { useRacas } from "../../racas/api";
import { useStatus } from "../../status/api";
import { useCriarGrupo, useDefinirDisponiveis, useEditarGrupo, useGrupo } from "../api";
import { DisponiveisSelector } from "../components/DisponiveisSelector";
import { GrupoInfoForm, type GrupoInfo } from "../components/GrupoInfoForm";
import type { Disponiveis, GrupoDetalhe } from "../types";

export function NovoGrupoPage() {
  return <Formulario />;
}

export function EditarGrupoPage() {
  const { id = "" } = useParams();
  const grupo = useGrupo(id);
  if (grupo.isPending) return <Loading texto="Carregando grupo…" />;
  if (grupo.isError) return <ErrorState mensagem={mensagemDeErro(grupo.error)} onTentarNovamente={() => grupo.refetch()} />;
  return <Formulario grupo={grupo.data} />;
}

function Formulario({ grupo }: { grupo?: GrupoDetalhe }) {
  const navigate = useNavigate();
  const classes = useClasses();
  const racas = useRacas();
  const atributos = useAtributos();
  const catalogo = useCatalogo();
  const status = useStatus();
  const criar = useCriarGrupo();
  const editar = useEditarGrupo(grupo?.id ?? "");
  const definir = useDefinirDisponiveis(grupo?.id ?? "");

  const [info, setInfo] = useState<GrupoInfo>({
    titulo: grupo?.titulo ?? "",
    sinopse: grupo?.sinopse ?? "",
    genero: grupo?.genero ?? "",
    imagemUrl: grupo?.imagemUrl ?? "",
    limiteMembros: String(grupo?.limiteMembros ?? 4),
    permitirClassesRepetidas: grupo?.permitirClassesRepetidas ?? true,
  });
  const [disponiveis, setDisponiveis] = useState<Disponiveis>(
    grupo?.disponiveis ?? { classeIds: [], racaIds: [], atributoIds: [], periciaIds: [], statusIds: [] },
  );

  // Grupo novo já começa com os status fixos do sistema ativados (dá para desmarcar).
  const [statusIniciados, setStatusIniciados] = useState(!!grupo);
  useEffect(() => {
    if (statusIniciados || !status.data) return;
    setDisponiveis((d) => ({ ...d, statusIds: status.data.filter((s) => s.fixo).map((s) => s.id) }));
    setStatusIniciados(true);
  }, [status.data, statusIniciados]);

  const carregando = classes.isPending || racas.isPending || atributos.isPending || catalogo.isPending || status.isPending;
  const erroCarga = classes.error ?? racas.error ?? atributos.error ?? catalogo.error ?? status.error;
  const erro = criar.error ?? editar.error ?? definir.error;
  const enviando = criar.isPending || editar.isPending || definir.isPending;

  function dadosInfo() {
    return {
      titulo: info.titulo,
      sinopse: info.sinopse,
      genero: info.genero,
      imagemUrl: info.imagemUrl.trim() || null,
      limiteMembros: info.limiteMembros.trim() === "" ? (undefined as unknown as number) : Number(info.limiteMembros),
      permitirClassesRepetidas: info.permitirClassesRepetidas,
    };
  }

  async function salvar() {
    if (grupo) {
      await editar.mutateAsync(dadosInfo());
      await definir.mutateAsync(disponiveis);
      navigate(`/mestre/grupos/${grupo.id}`);
    } else {
      const novo = await criar.mutateAsync({ ...dadosInfo(), disponiveis });
      navigate(`/mestre/grupos/${novo.id}`);
    }
  }

  return (
    <div className="pagina">
      <LinkVoltar to={grupo ? `/mestre/grupos/${grupo.id}` : "/mestre/grupos"}>{grupo ? grupo.titulo : "Grupos"}</LinkVoltar>
      <div>
        <h1>{grupo ? "Editar grupo" : "Novo grupo"}</h1>
        <p className="pagina__subtitulo">O grupo é o seu RPG: os jogadores entram com o código e criam a ficha com o que você liberar aqui.</p>
      </div>

      <div className="grupo-form">
        <section className="secao">
          <h2>Informações</h2>
          <GrupoInfoForm valor={info} onChange={setInfo} erros={errosDeCampo(erro)} />
        </section>
        <section className="secao">
          <h2>O que vale neste grupo</h2>
          {carregando ? (
            <Loading compacto texto="Carregando classes, raças e perícias…" />
          ) : erroCarga ? (
            <ErrorState mensagem={mensagemDeErro(erroCarga)} />
          ) : (
            <DisponiveisSelector
              grupoId={grupo?.id ?? null}
              classes={classes.data ?? []}
              racas={racas.data ?? []}
              atributos={atributos.data ?? []}
              pericias={catalogo.data ?? []}
              status={status.data ?? []}
              valor={disponiveis}
              onChange={setDisponiveis}
            />
          )}
        </section>
      </div>

      {erro && <div className="aviso">{erroDeFormulario(erro)}</div>}
      <div className="barra-acoes">
        <Button onClick={() => navigate(grupo ? `/mestre/grupos/${grupo.id}` : "/mestre/grupos")} disabled={enviando}>
          Cancelar
        </Button>
        <Button variante="primario" onClick={() => salvar().catch(() => undefined)} disabled={enviando || carregando}>
          {enviando ? "Salvando…" : grupo ? "Salvar grupo" : "Criar grupo"}
        </Button>
      </div>
    </div>
  );
}
