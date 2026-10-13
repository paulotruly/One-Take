import { ChevronLeft, ChevronRight, Pencil, Sparkles, Trash2 } from "lucide-react";
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

/**
 * Carta pequena do deck: tipo, custo, nível e título. Clicar abre os detalhes (onAbrir).
 * Com `acoes`, mostra uma barra de ícones (mover, editar, aprimorar, excluir) que cabe na carta.
 */
export function HabilidadeCard({ habilidade: h, onAbrir, acoes }: { habilidade: Habilidade; onAbrir: () => void; acoes?: AcoesCarta }) {
  return (
    <article className="carta">
      <button type="button" className="carta__abrir" onClick={onAbrir} title="Ver detalhes da carta">
        <span className="carta__topo">
          <EfeitoBadge tipo={h.tipoEfeito} />
        </span>
        <strong className="carta__titulo">{h.titulo}</strong>
        <span className="carta__selos">
          <CustoManaBadge custo={h.custoMana} />
          <NivelBadge nivel={h.nivelNecessario} />
          {h.aprimoradaNoNivel && <span className="selo selo--novo" title="Esta carta já mudou por causa do nível">Aprimorada</span>}
          {!h.aprimoradaNoNivel && (h.aprimoramentos?.length ?? 0) > 0 && (
            <span className="selo selo--novo" title="Muda em níveis maiores">+{h.aprimoramentos!.length} nv</span>
          )}
        </span>
        {h.teste ? <span className="carta__limite">{h.teste.pericia}: {h.teste.teste}</span> : h.pericia && <span className="carta__limite">Teste: {h.pericia.nome}</span>}
        {h.limite && <span className="carta__limite">{h.limite}</span>}
      </button>
      {acoes && (
        <div className="carta__rodape">
          <Button pequeno variante="fantasma" aria-label="Mover para a esquerda" title="Mover para a esquerda"
            disabled={!acoes.podeEsquerda || acoes.ocupado} onClick={() => acoes.onMover(-1)}>
            <ChevronLeft size={14} aria-hidden />
          </Button>
          <Button pequeno variante="fantasma" aria-label="Mover para a direita" title="Mover para a direita"
            disabled={!acoes.podeDireita || acoes.ocupado} onClick={() => acoes.onMover(1)}>
            <ChevronRight size={14} aria-hidden />
          </Button>
          <Button pequeno variante="fantasma" aria-label={`Editar ${h.titulo}`} title="Editar" onClick={acoes.onEditar}>
            <Pencil size={14} aria-hidden />
          </Button>
          {acoes.onAprimorar && (
            <Button pequeno variante="fantasma" aria-label={`Aprimorar ${h.titulo}`} title="Aprimorar: mudanças em níveis maiores" onClick={acoes.onAprimorar}>
              <Sparkles size={14} aria-hidden />
            </Button>
          )}
          <Button pequeno variante="fantasma" aria-label={`Excluir ${h.titulo}`} title="Excluir" onClick={acoes.onExcluir}>
            <Trash2 size={14} aria-hidden />
          </Button>
        </div>
      )}
    </article>
  );
}

/** Conteúdo completo da carta (usado no pop-up). */
export function HabilidadeDetalhe({ habilidade: h }: { habilidade: Habilidade }) {
  return (
    <div className="carta-detalhe">
      <div className="carta__selos carta__selos--esquerda">
        <EfeitoBadge tipo={h.tipoEfeito} />
        <CustoManaBadge custo={h.custoMana} />
        <NivelBadge nivel={h.nivelNecessario} />
        {h.aprimoradaNoNivel && <span className="selo selo--novo">Aprimorada no nível {h.aprimoradaNoNivel}</span>}
      </div>
      <p className="carta__descricao">{h.descricao}</p>
      {(h.teste || h.pericia) && (
        <p className="carta__linha carta__teste">
          <strong>Teste:</strong> {h.teste ? <>{h.teste.pericia} ({h.teste.atributo}): <b>{h.teste.teste}</b></> : <>{h.pericia!.nome} ({h.pericia!.atributo.nome})</>}
        </p>
      )}
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
    </div>
  );
}
