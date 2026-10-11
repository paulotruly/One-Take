import { Droplet, Heart, Zap } from "lucide-react";

type Props = { vida: number; mana: number; esforco: number; compacto?: boolean };

const STATS = [
  { chave: "vida", Icone: Heart, rotulo: "Vida" },
  { chave: "mana", Icone: Droplet, rotulo: "Mana" },
  { chave: "esforco", Icone: Zap, rotulo: "Esforço" },
] as const;

/** Pontos base de vida, mana e esforço da classe. */
export function StatsBar({ compacto, ...valores }: Props) {
  return (
    <div className={`stats ${compacto ? "stats--compacto" : ""}`}>
      {STATS.map((s) => (
        <span key={s.chave} className={`stat stat--${s.chave}`} title={`${s.rotulo} base`}>
          <span className="stat__icone" aria-hidden>
            <s.Icone size={compacto ? 12 : 14} />
          </span>
          {!compacto && <span className="stat__rotulo">{s.rotulo}</span>}
          <span>
            {compacto && <span className="sr-only">{s.rotulo} </span>}
            {valores[s.chave]}
          </span>
        </span>
      ))}
    </div>
  );
}
