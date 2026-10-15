import { Droplet, HeartHandshake, Lock, Shield, Swords, type LucideIcon } from "lucide-react";
import { ROTULO_GRUPO, TIPOS_EFEITO, type Grupo, type TipoEfeito } from "../types";

const ICONE_GRUPO: Record<Grupo, LucideIcon> = { COMBATENTE: Swords, VANGUARDISTA: Shield, SUPORTE: HeartHandshake };

export function GrupoBadge({ grupo }: { grupo: Grupo }) {
  const Icone = ICONE_GRUPO[grupo];
  return (
    <span className={`selo selo--grupo selo--grupo-${grupo}`}>
      <Icone size={12} aria-hidden /> {ROTULO_GRUPO[grupo]}
    </span>
  );
}

/** De outra pessoa (só leitura) ou minha. O selo verificado vai ao lado do nome. */
export function OrigemBadge({ deOutro = false }: { deOutro?: boolean }) {
  if (deOutro) {
    return (
      <span className="selo selo--leitura" title="Classe verificada de outra pessoa: só leitura. Duplique para ter a sua.">
        <Lock size={12} aria-hidden /> Só leitura
      </span>
    );
  }
  return (
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
