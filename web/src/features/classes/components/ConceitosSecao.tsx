// Classes do mestre agrupadas por arquétipo na galeria (container: dados + mutações).
import type { ReactNode } from "react";
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { useConceitos, useCriarConceito, useEditarConceito, useExcluirConceito } from "../api";
import type { Classe } from "../types";
import { ConceitosBloco } from "./ConceitosBloco";

type Props = {
  classes: Classe[];
  filtrando: boolean;
  renderClasses: (classes: Classe[]) => ReactNode;
  vazio: ReactNode;
};

export function ConceitosSecao({ classes, filtrando, renderClasses, vazio }: Props) {
  const conceitos = useConceitos();
  return (
    <ConceitosBloco
      nome="arquétipo"
      explicacao="Uma classe generalista (ex.: Bruxa) com subclasses (Bruxa elemental, Bruxa assombrosa). O jogador escolhe a subclasse."
      exemplo="Ex.: Bruxa"
      rotuloFilho="Subclasse"
      conceitos={conceitos.data?.map((c) => ({ ...c, filhos: c.subclasses }))}
      carregando={conceitos.isPending}
      erro={conceitos.error}
      onTentarNovamente={() => conceitos.refetch()}
      itens={classes}
      filtrando={filtrando}
      renderItens={renderClasses}
      vazio={vazio}
      hrefNovoFilho={(id) => `/mestre/classes/nova?conceito=${id}`}
      criar={useCriarConceito()}
      editar={useEditarConceito()}
      excluir={useExcluirConceito()}
      selo={(c) => <SeloVerificado tipo="classeConceito" item={c} />}
    />
  );
}
