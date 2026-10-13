// Linha de NPC (lista de NPCs e página do grupo).
import { Droplet, Heart, Skull, Zap } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "../../../components/ui/Avatar";
import type { NpcResumo } from "../types";

/** Linha de NPC (também usada na página do grupo). */
export function NpcLinha({ n }: { n: NpcResumo }) {
  return (
    <li>
      <Link to={`/mestre/npcs/${n.id}`} className="membro">
        <Avatar url={n.imagemUrl} nome={n.nome} tamanho={48} />
        <div className="membro__info">
          <strong>{n.nome} {n.morto && <span className="selo selo--status-DEBUFF"><Skull size={12} aria-hidden /> Morto</span>}</strong>
          <span className="pagina__subtitulo">
            {n.raca}{n.classe ? ` · ${n.classe}` : ""} · Nível {n.nivel}{n.grupoExclusivo ? ` · ${n.grupoExclusivo.titulo}` : " · Geral"}
          </span>
        </div>
        <div className="stats stats--compacto">
          <span className="stat stat--vida"><Heart size={12} aria-hidden /> {n.vida.atual}/{n.vida.max}</span>
          <span className="stat stat--mana"><Droplet size={12} aria-hidden /> {n.mana.atual}/{n.mana.max}</span>
          <span className="stat stat--esforco"><Zap size={12} aria-hidden /> {n.esforco.atual}/{n.esforco.max}</span>
        </div>
      </Link>
    </li>
  );
}
