// Turnos de um status aplicado (apresentação): o mestre anota quantos turnos ele dura e tira 1 por turno (de quem usou a carta); em 0 o status sai.
import { Hourglass, Minus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ROTULO_TIPO, type Status } from "../types";

const rotuloTurnos = (n: number) => `${n} ${n === 1 ? "turno" : "turnos"}`;

/** "3 turnos" e o botão de tirar 1 (só para quem pode). Sem prazo: nada aparece. */
export function StatusTurnos({ status, onMudarTurnos, ocupado }: { status: Status; onMudarTurnos?: (turnos: number) => void; ocupado?: boolean }) {
  if (status.automatico || status.turnos == null) return null;
  return (
    <span className="status-turnos">
      <span className="selo" title="Turnos que faltam"><Hourglass size={12} aria-hidden /> {rotuloTurnos(status.turnos)}</span>
      {onMudarTurnos && (
        <Button pequeno variante="fantasma" disabled={ocupado} onClick={() => onMudarTurnos(status.turnos! - 1)}
          aria-label={`Tirar 1 turno de ${status.nome}`} title={status.turnos === 1 ? "Tirar o último turno (o status sai)" : "Tirar 1 turno"}>
          <Minus size={14} aria-hidden /> 1
        </Button>
      )}
    </span>
  );
}

/** Escolher um status e, se quiser, por quantos turnos (vazio = sem prazo). */
export function AplicarStatusLinha({ aplicaveis, onAplicar, ocupado, rotulo = "Aplicar status" }: {
  aplicaveis: Status[];
  onAplicar: (statusId: string, turnos: number | null, pronto: () => void) => void;
  ocupado?: boolean;
  rotulo?: string;
}) {
  const [escolhido, setEscolhido] = useState("");
  const [turnos, setTurnos] = useState("");
  const pronto = () => { setEscolhido(""); setTurnos(""); };
  return (
    <div className="entrar-codigo__linha">
      <select value={escolhido} onChange={(e) => setEscolhido(e.target.value)} aria-label="Status para aplicar">
        <option value="">Escolha um status…</option>
        {aplicaveis.map((st) => <option key={st.id} value={st.id}>{st.nome} ({ROTULO_TIPO[st.tipo]})</option>)}
      </select>
      <input className="status-turnos__campo" type="number" min={1} max={99} step={1} inputMode="numeric" value={turnos}
        onChange={(e) => setTurnos(e.target.value)} placeholder="Turnos" aria-label="Turnos (vazio = sem prazo)" title="Quantos turnos dura (vazio = sem prazo)" />
      <Button variante="primario" disabled={!escolhido || ocupado} onClick={() => onAplicar(escolhido, turnos.trim() ? Number(turnos) : null, pronto)}>
        {rotulo}
      </Button>
    </div>
  );
}
