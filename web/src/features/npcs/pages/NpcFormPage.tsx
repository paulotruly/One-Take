import { useNavigate, useParams, useSearchParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useClasses } from "../../classes/api";
import { useRacas } from "../../racas/api";
import { useCriarNpc, useEditarNpc, useNpc } from "../api";
import { NpcForm } from "../components/NpcForm";

function useOpcoes() {
  const racas = useRacas();
  const classes = useClasses();
  return {
    carregando: racas.isPending || classes.isPending,
    racas: (racas.data ?? []).map((r) => ({ id: r.id, titulo: r.conceito ? `${r.conceito.titulo}: ${r.titulo}` : r.titulo })),
    classes: (classes.data ?? []).map((c) => ({ id: c.id, titulo: c.fixa ? `${c.titulo} (fixa)` : c.titulo })),
  };
}

export function NovoNpcPage() {
  const navigate = useNavigate();
  const criar = useCriarNpc();
  const opcoes = useOpcoes();
  const [params] = useSearchParams();
  const grupo = params.get("grupo");
  const kit = params.get("kit");
  if (opcoes.carregando) return <Loading />;
  const voltar = grupo ? `/mestre/grupos/${grupo}` : "/mestre/npcs";
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to={voltar}>{grupo ? "Grupo" : "NPCs"}</LinkVoltar>
      <h1>Novo NPC</h1>
      {opcoes.racas.length === 0 && <div className="aviso">Crie pelo menos uma raça antes: todo NPC tem raça.</div>}
      <NpcForm
        rotulo="Criar NPC"
        inicial={kit ? { kitIds: [kit] } : undefined}
        {...opcoes}
        enviando={criar.isPending}
        erros={errosDeCampo(criar.error)}
        erroGeral={erroDeFormulario(criar.error)}
        onCancelar={() => navigate(voltar)}
        onEnviar={(dados) => criar.mutate(dados, { onSuccess: (n) => navigate(`/mestre/npcs/${n.id}`) })}
      />
    </div>
  );
}

export function EditarNpcPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const npc = useNpc(id);
  const editar = useEditarNpc(id);
  const opcoes = useOpcoes();
  if (npc.isPending || opcoes.carregando) return <Loading />;
  if (npc.isError) return <ErrorState mensagem={mensagemDeErro(npc.error)} onTentarNovamente={() => npc.refetch()} />;
  const voltar = () => navigate(`/mestre/npcs/${id}`);
  return (
    <div className="pagina pagina--estreita">
      <LinkVoltar to={`/mestre/npcs/${id}`}>{npc.data.nome}</LinkVoltar>
      <h1>Editar NPC</h1>
      <NpcForm
        inicial={npc.data}
        {...opcoes}
        enviando={editar.isPending}
        erros={errosDeCampo(editar.error)}
        erroGeral={erroDeFormulario(editar.error)}
        onCancelar={voltar}
        onEnviar={(dados) => editar.mutate(dados, { onSuccess: voltar })}
      />
    </div>
  );
}
