import { BadgeCheck, Globe, Lock, Package } from "lucide-react";
import type { Visao } from "../types";

/** Selo verificado ao lado do nome: só o ícone (check branco no selo azul), como nas redes sociais. */
export function VerificadoBadge({ porKit = false }: { porKit?: boolean }) {
  return (
    <span className="selo-verificado" title={porKit ? "Verificado pelo kit: disponível para todo mestre" : "Verificado: disponível para todo mestre"}>
      <BadgeCheck className="selo-verificado__icone" size="1.15em" aria-hidden />
      <span className="sr-only">Verificado</span>
    </span>
  );
}

/** Situação de algo verificado, sempre como selo: só leitura (de outra pessoa), verificado pelo kit ou visível para todos (meu). */
export function AcessoBadge({ item }: { item: Visao }) {
  if (item.deOutro) {
    return (
      <span className="selo selo--leitura" title="De outra pessoa: só leitura. Duplique ou copie para ter a sua versão.">
        <Lock size={12} aria-hidden /> Só leitura
      </span>
    );
  }
  if (!item.verificado) return null;
  if (item.verificadoPorKit && !item.seloProprio) {
    return (
      <span className="selo selo--verificado" title="Está num kit verificado: tire do kit para deixar de ser verificado">
        <Package size={12} aria-hidden /> Verificado pelo kit
      </span>
    );
  }
  return (
    <span className="selo selo--verificado" title="Todo mestre vê e usa (só leitura)">
      <Globe size={12} aria-hidden /> Visível para todos
    </span>
  );
}
