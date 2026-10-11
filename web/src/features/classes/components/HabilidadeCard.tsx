import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { Habilidade } from "../types";
import { StatusBadge } from "../../status/components/StatusBadge";
import { resumoAprimoramento } from "./AprimoramentoForm";
import { CustoManaBadge, EfeitoBadge, NivelBadge } from "./Selos";

export type AcoesCarta = {
  onMover: (direcao: -1 | 1) => void;
  onEditar: () => void;
  onAprimorar?: () => void;
  onExcluir: () => void;
  podeEsquerda: boolean;
  podeDireita: boolean;
  ocupado?: boolean;
};

/** Uma carta do deck. Sem `acoes` = somente leitura. */
export function HabilidadeCard({ habilidade: h, acoes }: { habilidade: Habilidade; acoes?: AcoesCarta }) {
  return (
    <article className="carta">
      <div className="carta__topo">
        <EfeitoBadge tipo={h.tipoEfeito} />
        <span className="carta__selos">
          {h.aprimoradaNoNivel && <span className="selo selo--novo" title="Esta carta já mudou por causa do nível">Aprimorada</span>}
          <CustoManaBadge custo={h.custoMana} />
          <NivelBadge nivel={h.nivelNecessario} />
        </span>
      </div>
      <h3>{h.titulo}</h3>
      <p className="carta__descricao">{h.descricao}</p>
      {h.condicao && (
        <p className="carta__linha">
          <strong>Condição:</strong> {h.condicao}
        </p>
      )}
      <p className="carta__efeito">{h.descricaoEfeito}</p>
      {h.status && (
        <p className="carta__linha">
          <strong>Ativa:</strong> <StatusBadge nome={h.status.nome} tipo={h.status.tipo} />
        </p>
      )}
      {h.limite && (
        <p className="carta__linha">
          <strong>Limite:</strong> {h.limite}
        </p>
      )}
      {h.aprimoramentos && h.aprimoramentos.length > 0 && h.aprimoradaNoNivel === undefined && (
        <ul className="carta__aprimoramentos">
          {h.aprimoramentos.map((a) => (
            <li key={a.id}><strong>Nv {a.nivel}:</strong> {resumoAprimoramento(a)}</li>
          ))}
        </ul>
      )}
      {h.proximoAprimoramento && <p className="carta__linha pagina__subtitulo">Muda no nível {h.proximoAprimoramento}.</p>}
      {acoes && (
        <div className="carta__rodape">
          <div>
            <Button pequeno variante="fantasma" aria-label="Mover para a esquerda" title="Mover para a esquerda"
              disabled={!acoes.podeEsquerda || acoes.ocupado} onClick={() => acoes.onMover(-1)}>
              <ChevronLeft size={16} aria-hidden />
            </Button>
            <Button pequeno variante="fantasma" aria-label="Mover para a direita" title="Mover para a direita"
              disabled={!acoes.podeDireita || acoes.ocupado} onClick={() => acoes.onMover(1)}>
              <ChevronRight size={16} aria-hidden />
            </Button>
          </div>
          <div>
            <Button pequeno variante="fantasma" onClick={acoes.onEditar}>
              Editar
            </Button>
            {acoes.onAprimorar && (
              <Button pequeno variante="fantasma" onClick={acoes.onAprimorar} title="Mudanças da carta em níveis maiores">
                Aprimorar
              </Button>
            )}
            <Button pequeno variante="fantasma" onClick={acoes.onExcluir} aria-label={`Excluir ${h.titulo}`}>
              Excluir
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
