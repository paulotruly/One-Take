// NPCs do mestre: personagens com ficha, gerais ou exclusivos de um grupo.
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { useNpcs } from "../api";
import { NpcLinha } from "../components/NpcLinha";

export function NpcsPage() {
  const npcs = useNpcs();
  const { kitId } = useKitAtivo();
  const lista = (npcs.data ?? []).filter((n) => soDoKit(n.kitIds, kitId));

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>NPCs</h1>
          <p className="pagina__subtitulo">
            Personagens do mestre com ficha completa: raça, classe (opcional), nível, perícias, cartas e inventário. Organize por kit de RPG.
          </p>
        </div>
        <Link to="/mestre/npcs/novo" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Novo NPC
        </Link>
      </div>
      <AvisoKit />

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
