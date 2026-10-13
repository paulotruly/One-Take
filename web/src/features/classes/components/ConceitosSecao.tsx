// Arquétipos do mestre na galeria (container: dados + mutações).
import { useConceitos, useCriarConceito, useEditarConceito, useExcluirConceito } from "../api";
import { ConceitosBloco } from "./ConceitosBloco";

export function ConceitosSecao() {
  const conceitos = useConceitos();
  return (
    <ConceitosBloco
      titulo="Arquétipos"
      nome="arquétipo"
      explicacao="Uma classe generalista (ex.: Bruxa) com subclasses (Bruxa elemental, Bruxa assombrosa). O jogador escolhe a subclasse."
      exemplo="Ex.: Bruxa"
      rotuloFilho="Subclasse"
      conceitos={conceitos.data?.map((c) => ({ ...c, filhos: c.subclasses }))}
      carregando={conceitos.isPending}
      erro={conceitos.error}
      onTentarNovamente={() => conceitos.refetch()}
      hrefFilho={(id) => `/mestre/classes/${id}`}
      hrefNovoFilho={(id) => `/mestre/classes/nova?conceito=${id}`}
      criar={useCriarConceito()}
      editar={useEditarConceito()}
      excluir={useExcluirConceito()}
    />
  );
}
