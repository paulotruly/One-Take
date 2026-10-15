import { CircleArrowDown, CircleArrowUp, CircleDot } from "lucide-react";
import { ROTULO_TIPO, type TipoStatus } from "../types";

const ICONE = { BUFF: CircleArrowUp, DEBUFF: CircleArrowDown, MISTO: CircleDot } as const;

/** Título do status na lista do catálogo: texto em destaque (sem caixa), com o ícone do tipo. */
export function StatusTitulo({ nome, tipo }: { nome: string; tipo: TipoStatus }) {
  const Icone = ICONE[tipo];
  return (
    <strong className={`status-titulo status-titulo--${tipo}`} title={ROTULO_TIPO[tipo]}>
      <Icone size={16} aria-hidden /> {nome}
    </strong>
  );
}

/** Selo de um status, colorido pelo tipo (benefício, prejuízo, misto). */
export function StatusBadge({ nome, tipo }: { nome: string; tipo: TipoStatus }) {
  const Icone = ICONE[tipo];
  return (
    <span className={`selo selo--status-${tipo}`} title={ROTULO_TIPO[tipo]}>
      <Icone size={12} aria-hidden /> {nome}
    </span>
  );
}
