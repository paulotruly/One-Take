import { Check, Circle } from "lucide-react";
import { Link } from "react-router";

export type ItemProntidao = { rotulo: string; detalhe: string; pronto: boolean; href?: string; acao?: string };

/** Checklist do que falta para o grupo poder jogar. */
export function ProntidaoGrupo({ itens }: { itens: ItemProntidao[] }) {
  const prontos = itens.filter((i) => i.pronto).length;
  return (
    <section className="painel prontidao" aria-label="O que falta para jogar">
      <h2>{prontos === itens.length ? "Pronto para jogar" : `Falta pouco: ${prontos} de ${itens.length}`}</h2>
      <ul className="prontidao__lista">
        {itens.map((i) => (
          <li key={i.rotulo} className={`prontidao__item ${i.pronto ? "prontidao__item--pronto" : ""}`}>
            {i.pronto ? <Check size={18} aria-hidden /> : <Circle size={18} aria-hidden />}
            <span><strong>{i.rotulo}</strong> <span className="pagina__subtitulo">{i.detalhe}</span></span>
            {!i.pronto && i.href && <Link to={i.href}>{i.acao}</Link>}
          </li>
        ))}
      </ul>
    </section>
  );
}
