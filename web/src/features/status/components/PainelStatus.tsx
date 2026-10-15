// Status atuais de um personagem (alertas) + aplicar/tirar (apresentação; quem usa passa as ações).
// Usado na ficha do NPC e na ficha da criatura.
import { Activity, X } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { ROTULO_TIPO, type Status } from "../types";
import { StatusBadge } from "./StatusBadge";
import { AplicarStatusLinha, StatusTurnos } from "./StatusTurnos";

type Props = {
  status: Status[];
  aplicaveis: Status[];
  onAplicar: (statusId: string, turnos: number | null) => void;
  onRemover: (statusId: string) => void;
  /** Tirar turnos de um status aplicado (0 tira o status). Sem isso, os turnos só aparecem. */
  onMudarTurnos?: (statusId: string, turnos: number) => void;
  ocupado?: boolean;
  /** Texto quando não há o que aplicar (ex.: "ative status no grupo"). */
  semAplicaveis?: string;
};

export function PainelStatus({ status, aplicaveis, onAplicar, onRemover, onMudarTurnos, ocupado, semAplicaveis }: Props) {
  return (
    <section className="painel" aria-label="Status">
      <h2 className="painel__titulo"><Activity size={18} aria-hidden /> Status</h2>
      {status.length === 0 ? (
        <p className="pagina__subtitulo">Nenhum status agora.</p>
      ) : (
        <ul className="lista-simples">
          {status.map((st) => (
            <li key={st.id} className={`alerta-status alerta-status--${st.tipo}`}>
              <div className="alerta-status__texto">
                <p><StatusBadge nome={st.nome} tipo={st.tipo} /> <span className="pagina__subtitulo">{st.automatico ? "automático" : ROTULO_TIPO[st.tipo]}</span>{" "}
                  <StatusTurnos status={st} ocupado={ocupado} onMudarTurnos={onMudarTurnos && ((t) => onMudarTurnos(st.id, t))} /></p>
                {st.efeito && <p><strong>{st.efeito}</strong></p>}
              </div>
              {!st.automatico && (
                <Button pequeno variante="fantasma" aria-label={`Tirar ${st.nome}`} title="Tirar status" disabled={ocupado} onClick={() => onRemover(st.id)}>
                  <X size={14} aria-hidden />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {aplicaveis.length > 0 ? (
        <AplicarStatusLinha aplicaveis={aplicaveis} ocupado={ocupado} onAplicar={(id, turnos, pronto) => { onAplicar(id, turnos); pronto(); }} />
      ) : (
        semAplicaveis && <p className="pagina__subtitulo">{semAplicaveis}</p>
      )}
    </section>
  );
}
