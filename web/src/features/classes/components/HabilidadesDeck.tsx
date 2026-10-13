import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState } from "../../../components/ui/States";
import type { Habilidade } from "../types";
import { HabilidadeCard, HabilidadeDetalhe } from "./HabilidadeCard";

type Acoes = {
  onEditar: (h: Habilidade) => void;
  onAprimorar?: (h: Habilidade) => void;
  onExcluir: (h: Habilidade) => void;
  /** Recebe a nova ordem completa de ids. */
  onReordenar: (ids: string[]) => void;
  reordenando?: boolean;
};

/**
 * A cartela: cartas pequenas em grade; clicar numa carta abre os detalhes num pop-up.
 * Sem `acoes` = somente leitura.
 */
export function HabilidadesDeck({ habilidades, acoes, vazio }: { habilidades: Habilidade[]; acoes?: Acoes; vazio?: string }) {
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const aberta = habilidades.find((h) => h.id === abertaId) ?? null;

  if (habilidades.length === 0) {
    return <EmptyState compacto titulo={vazio ?? "Nenhuma habilidade ainda"} descricao={acoes ? "Crie a primeira carta." : undefined} />;
  }

  function mover(indice: number, direcao: -1 | 1) {
    const ids = habilidades.map((h) => h.id);
    const alvo = indice + direcao;
    [ids[indice], ids[alvo]] = [ids[alvo]!, ids[indice]!];
    acoes?.onReordenar(ids);
  }

  // Fecha o pop-up antes de abrir o formulário (um modal por vez).
  const depoisDeFechar = (fn: (h: Habilidade) => void) => (h: Habilidade) => {
    setAbertaId(null);
    fn(h);
  };

  return (
    <>
      <div className="deck">
        {habilidades.map((h, i) => (
          <HabilidadeCard
            key={h.id}
            habilidade={h}
            onAbrir={() => setAbertaId(h.id)}
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

      <Modal aberto={!!aberta} onFechar={() => setAbertaId(null)} titulo={aberta?.titulo ?? ""}>
        {aberta && (
          <>
            <HabilidadeDetalhe habilidade={aberta} />
            {acoes && (
              <div className="modal__acoes modal__acoes--quebra">
                <Button onClick={() => depoisDeFechar(acoes.onExcluir)(aberta)}>
                  <Trash2 size={16} aria-hidden /> Excluir
                </Button>
                {acoes.onAprimorar && (
                  <Button onClick={() => depoisDeFechar(acoes.onAprimorar!)(aberta)}>
                    <Sparkles size={16} aria-hidden /> Aprimorar
                  </Button>
                )}
                <Button variante="primario" onClick={() => depoisDeFechar(acoes.onEditar)(aberta)}>
                  <Pencil size={16} aria-hidden /> Editar
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
