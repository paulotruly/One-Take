// NPCs do mestre: personagens com ficha, gerais ou exclusivos de um grupo.
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { useGrupos } from "../../grupos/api";
import { useNpcs } from "../api";
import { NpcLinha } from "../components/NpcLinha";

export function NpcsPage() {
  const [params, setParams] = useSearchParams();
  const filtro = params.get("grupo") ?? "";
  const npcs = useNpcs();
  const grupos = useGrupos();
  const lista = (npcs.data ?? []).filter((n) => !filtro || (filtro === "geral" ? !n.grupoExclusivo : n.grupoExclusivo?.id === filtro));

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>NPCs</h1>
          <p className="pagina__subtitulo">
            Personagens do mestre com ficha completa: raça, classe (opcional), nível, perícias, cartas e inventário. Gerais ou exclusivos de um grupo.
          </p>
        </div>
        <Link to="/mestre/npcs/novo" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Novo NPC
        </Link>
      </div>

      <div className="filtro" role="group" aria-label="Filtrar por grupo">
        <button type="button" className="filtro__opcao" aria-pressed={!filtro} onClick={() => setParams({}, { replace: true })}>Todos</button>
        <button type="button" className="filtro__opcao" aria-pressed={filtro === "geral"} onClick={() => setParams({ grupo: "geral" }, { replace: true })}>Gerais</button>
        {(grupos.data ?? []).map((g) => (
          <button key={g.id} type="button" className="filtro__opcao" aria-pressed={filtro === g.id} onClick={() => setParams({ grupo: g.id }, { replace: true })}>
            {g.titulo}
          </button>
        ))}
      </div>

      {npcs.isPending ? (
        <Loading texto="Carregando NPCs…" />
      ) : npcs.isError ? (
        <ErrorState mensagem={mensagemDeErro(npcs.error)} onTentarNovamente={() => npcs.refetch()} />
      ) : lista.length === 0 ? (
        <EmptyState titulo="Nenhum NPC aqui" descricao="Crie taverneiros, vilões, aliados: com classe e cartas, ou simples, só com raça." />
      ) : (
        <ul className="membros">{lista.map((n) => <NpcLinha key={n.id} n={n} />)}</ul>
      )}
    </div>
  );
}
