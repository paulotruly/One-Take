import { Minus, Plus, type LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";

type Props = {
  rotulo: string;
  Icone: LucideIcon;
  /** Classe CSS de cor (stat--vida, stat--mana, stat--esforco). */
  tipo: "vida" | "mana" | "esforco";
  atual: number;
  max: number;
  editavel: boolean;
  ocupado?: boolean;
  onMudar: (novo: number) => void;
};

/**
 * Recurso atual/máximo com barra. Para mudar rápido: digite a quantidade e use Tirar ou Somar
 * (ex.: 7 de dano de uma vez). O valor atual também pode ser digitado direto.
 */
export function BarraRecurso({ rotulo, Icone, tipo, atual, max, editavel, ocupado, onMudar }: Props) {
  const [texto, setTexto] = useState(String(atual));
  const [quantidade, setQuantidade] = useState("");
  useEffect(() => setTexto(String(atual)), [atual]);
  const pct = max > 0 ? Math.round((atual / max) * 100) : 0;
  const limitar = (n: number) => Math.min(Math.max(Math.round(n), 0), max);

  function confirmarAtual() {
    const n = Number(texto);
    if (Number.isFinite(n) && limitar(n) !== atual) onMudar(limitar(n));
    else setTexto(String(atual));
  }

  function aplicar(sinal: 1 | -1) {
    const n = Number(quantidade);
    if (!Number.isFinite(n) || n <= 0) return;
    onMudar(limitar(atual + sinal * n));
    setQuantidade("");
  }

  return (
    <div className={`recurso stat--${tipo} ${atual === 0 ? "recurso--zerado" : ""}`}>
      <div className="recurso__topo">
        <span className="recurso__rotulo">
          <span className="stat__icone"><Icone size={16} aria-hidden /></span> {rotulo}
        </span>
        <span className="recurso__valor">
          {editavel ? (
            <input
              className="recurso__input"
              aria-label={`${rotulo} atual`}
              inputMode="numeric"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onBlur={confirmarAtual}
              onKeyDown={(e) => e.key === "Enter" && confirmarAtual()}
            />
          ) : (
            atual
          )}{" "}
          / {max}
        </span>
      </div>
      <div className="recurso__barra" aria-hidden>
        <div className="recurso__preenchido" style={{ width: `${pct}%` }} />
      </div>
      {editavel && (
        <form
          className="recurso__acoes"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            aplicar(-1);
          }}
        >
          <input
            className="recurso__quantidade"
            aria-label={`Quantidade de ${rotulo}`}
            inputMode="numeric"
            placeholder="Qtd."
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ""))}
          />
          <Button pequeno disabled={ocupado || !quantidade || atual <= 0} onClick={() => aplicar(-1)} title={`Tirar de ${rotulo}`}>
            <Minus size={14} aria-hidden /> Tirar
          </Button>
          <Button pequeno disabled={ocupado || !quantidade || atual >= max} onClick={() => aplicar(1)} title={`Somar em ${rotulo}`}>
            <Plus size={14} aria-hidden /> Somar
          </Button>
        </form>
      )}
    </div>
  );
}
