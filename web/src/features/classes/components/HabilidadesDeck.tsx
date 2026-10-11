import { EmptyState } from "../../../components/ui/States";
import type { Habilidade } from "../types";
import { HabilidadeCard } from "./HabilidadeCard";

type Acoes = {
  onEditar: (h: Habilidade) => void;
  onAprimorar?: (h: Habilidade) => void;
  onExcluir: (h: Habilidade) => void;
  /** Recebe a nova ordem completa de ids. */
  onReordenar: (ids: string[]) => void;
  reordenando?: boolean;
};

/** A cartela da classe: as habilidades lado a lado, como cartas. Sem `acoes` = somente leitura. */
export function HabilidadesDeck({ habilidades, acoes }: { habilidades: Habilidade[]; acoes?: Acoes }) {
  if (habilidades.length === 0) {
    return (
      <EmptyState
        titulo="Nenhuma habilidade ainda"
        descricao={acoes ? "Crie a primeira carta desta classe." : undefined}
      />
    );
  }

  function mover(indice: number, direcao: -1 | 1) {
    const ids = habilidades.map((h) => h.id);
    const alvo = indice + direcao;
    [ids[indice], ids[alvo]] = [ids[alvo]!, ids[indice]!];
    acoes?.onReordenar(ids);
  }

  return (
    <div className="deck">
      {habilidades.map((h, i) => (
        <HabilidadeCard
          key={h.id}
          habilidade={h}
          acoes={
            acoes && {
              onMover: (d) => mover(i, d),
              onEditar: () => acoes.onEditar(h),
              onAprimorar: acoes.onAprimorar && (() => acoes.onAprimorar!(h)),
              onExcluir: () => acoes.onExcluir(h),
              podeEsquerda: i > 0,
              podeDireita: i < habilidades.length - 1,
              ocupado: acoes.reordenando,
            }
          }
        />
      ))}
    </div>
  );
}
