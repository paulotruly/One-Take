import { Activity, Droplet, Heart, Skull, Zap, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { GrupoBadge } from "../../classes/components/Selos";
import { StatusBadge } from "../../status/components/StatusBadge";
import type { Membro, Recurso } from "../types";

/** Recurso em uma linha: ícone, valor e barra. */
export function BarraMini({ tipo, Icone, rotulo, recurso }: { tipo: "vida" | "mana" | "esforco"; Icone: LucideIcon; rotulo: string; recurso: Recurso }) {
  const pct = recurso.max > 0 ? Math.min(100, Math.max(0, (recurso.atual / recurso.max) * 100)) : 0;
  return (
    <span className={`barra-mini stat--${tipo}`} title={`${rotulo}: ${recurso.atual} de ${recurso.max}`}>
      <span className="barra-mini__valor">
        <Icone size={12} aria-hidden className="stat__icone" />
        <span className="sr-only">{rotulo}</span> {recurso.atual}/{recurso.max}
      </span>
      <span className="recurso__barra" aria-hidden><span className="recurso__preenchido barra-mini__preenchido" style={{ width: `${pct}%` }} /></span>
    </span>
  );
}

export function BarrasDeRecurso({ vida, mana, esforco }: { vida: Recurso; mana: Recurso; esforco: Recurso }) {
  return (
    <span className="barras-recurso">
      <BarraMini tipo="vida" Icone={Heart} rotulo="Vida" recurso={vida} />
      <BarraMini tipo="mana" Icone={Droplet} rotulo="Mana" recurso={mana} />
      <BarraMini tipo="esforco" Icone={Zap} rotulo="Esforço" recurso={esforco} />
    </span>
  );
}

export function MembroCartao({ m, href, onStatus }: { m: Membro; href: string; onStatus: () => void }) {
  return (
    <li className={`membro-cartao ${m.morto ? "membro-cartao--morto" : ""}`}>
      <Link to={href} className="membro-cartao__link">
        <span className="membro-cartao__topo">
          <Avatar url={m.imagemUrl ?? m.jogador.fotoUrl} nome={m.nome} tamanho={48} />
          <span className="membro__info">
            <strong>{m.nome}</strong>
            <span className="pagina__subtitulo">@{m.jogador.nickname} · Nível {m.nivel}</span>
            <span className="pagina__subtitulo">{m.raca} · {m.classe}</span>
          </span>
        </span>
        <span className="membro-cartao__selos">
          <GrupoBadge grupo={m.funcao} />
          {m.morto && !m.status.some((s) => s.automatico && s.nome.toLowerCase() === "morto") && <span className="selo selo--status-DEBUFF"><Skull size={12} aria-hidden /> Morto</span>}
          {m.status.map((s) => <StatusBadge key={s.id} nome={s.nome} tipo={s.tipo} />)}
        </span>
        <BarrasDeRecurso vida={m.vida} mana={m.mana} esforco={m.esforco} />
      </Link>
      <Button pequeno onClick={onStatus} title="Aplicar ou tirar status">
        <Activity size={14} aria-hidden /> Status
      </Button>
    </li>
  );
}
