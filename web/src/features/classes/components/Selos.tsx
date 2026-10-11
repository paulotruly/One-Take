import { Droplet, Lock } from "lucide-react";
import { ROTULO_GRUPO, type Grupo } from "../types";

export function GrupoBadge({ grupo }: { grupo: Grupo }) {
  return <span className={`selo selo--grupo-${grupo}`}>{ROTULO_GRUPO[grupo]}</span>;
}

export function OrigemBadge({ fixa }: { fixa: boolean }) {
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

export function EfeitoBadge({ tipo }: { tipo: string }) {
  return <span className="selo selo--efeito">{tipo}</span>;
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
