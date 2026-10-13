import { Droplet, Lock } from "lucide-react";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { ROTULO_GRUPO, TIPOS_EFEITO, type Grupo, type TipoEfeito } from "../types";

export function GrupoBadge({ grupo }: { grupo: Grupo }) {
  return <span className={`selo selo--grupo-${grupo}`}>{ROTULO_GRUPO[grupo]}</span>;
}

/** Fixa, verificada de outra pessoa ou minha (com o selo, se for verificada). */
export function OrigemBadge({ fixa, verificado = false, deOutro = false }: { fixa: boolean; verificado?: boolean; deOutro?: boolean }) {
  if (deOutro) return <VerificadoBadge />;
  if (!fixa && verificado) {
    return (
      <>
        <span className="selo selo--propria" title="Classe criada por você">Minha</span>
        <VerificadoBadge />
      </>
    );
  }
  return fixa ? (
    <span className="selo selo--fixa" title="Classe do sistema: somente leitura">
      <Lock size={12} aria-hidden /> Fixa
    </span>
  ) : (
    <span className="selo selo--propria" title="Classe criada por você">
      Minha
    </span>
  );
}

export function EfeitoBadge({ tipo }: { tipo: TipoEfeito }) {
  const t = TIPOS_EFEITO[tipo] ?? TIPOS_EFEITO.UTILIDADE;
  return (
    <span className={`selo selo--efeito selo--efeito-${tipo}`} title={t.descricao}>
      <t.Icone size={12} aria-hidden /> {t.rotulo}
    </span>
  );
}

export function CustoManaBadge({ custo }: { custo: number }) {
  if (custo <= 0) return null;
  return (
    <span className="selo selo--mana" title={`Custa ${custo} de mana`}>
      <Droplet size={12} aria-hidden /> {custo} mana
    </span>
  );
}

export function NivelBadge({ nivel }: { nivel: number }) {
  if (nivel <= 1) return null;
  return (
    <span className="selo selo--nivel" title={`Disponível a partir do nível ${nivel}`}>
      Nv {nivel}
    </span>
  );
}
