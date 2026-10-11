import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Habilidade } from "../types";
import { CustoManaBadge, EfeitoBadge, NivelBadge } from "./Selos";

/** Resumo da cartela na página da classe, com link para a tela de habilidades. */
export function HabilidadesResumo({
  habilidades,
  href,
  rotuloLink,
}: {
  habilidades: Habilidade[];
  href: string;
  rotuloLink: string;
}) {
  return (
    <div className="painel">
      <div className="painel__cabecalho">
        <p className="painel__descricao">
          {habilidades.length === 0
            ? "Nenhuma habilidade ainda."
            : `${habilidades.length} ${habilidades.length === 1 ? "carta" : "cartas"} na cartela`}
        </p>
        <Link to={href} className="btn btn--primario">
          {rotuloLink} <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      {habilidades.length > 0 && (
        <ul className="resumo-habilidades">
          {habilidades.map((h) => (
            <li key={h.id}>
              <EfeitoBadge tipo={h.tipoEfeito} /> {h.titulo} <CustoManaBadge custo={h.custoMana} />{" "}
              <NivelBadge nivel={h.nivelNecessario} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
