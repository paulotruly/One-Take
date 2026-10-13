import { BadgeCheck } from "lucide-react";

/** Selo de conteúdo verificado do One-Take: check branco no fundo azul. `compacto` = só o ícone. */
export function VerificadoBadge({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className={`selo-verificado${compacto ? " selo-verificado--compacto" : ""}`} title="Verificado: disponível para todo mestre">
      <BadgeCheck className="selo-verificado__icone" size={compacto ? 18 : 16} aria-hidden />
      {compacto ? <span className="sr-only">Verificado</span> : "Verificado"}
    </span>
  );
}
