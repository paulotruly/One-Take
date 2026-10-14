import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Classe } from "../types";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { ClasseImagem } from "./ClasseImagem";
import { GrupoBadge, OrigemBadge } from "./Selos";
import { StatsBar } from "./StatsBar";

type Props = { classe: Classe; href: string; acoes?: ReactNode };

export function ClasseCard({ classe, href, acoes }: Props) {
  return (
    <article className={`classe-card ${classe.fixa ? "classe-card--fixa" : "classe-card--propria"}`}>
      <Link to={href} className="classe-card__link">
        <div className="classe-card__retrato">
          <ClasseImagem url={classe.imagemUrl} titulo={classe.titulo} />
          <div className="classe-card__selos">
            <GrupoBadge grupo={classe.grupo} />
            <OrigemBadge fixa={classe.fixa} deOutro={classe.deOutro} />
          </div>
        </div>
        <div className="classe-card__corpo">
          {classe.conceito && <span className="classe-card__conceito">{classe.conceito.titulo}</span>}
          <h3>{classe.titulo} {classe.verificado && <VerificadoBadge porKit={classe.verificadoPorKit && !classe.seloProprio} />}</h3>
          <StatsBar vida={classe.pontosVida} mana={classe.pontosMana} esforco={classe.pontosEsforco} compacto />
          <p className="classe-card__descricao">{classe.descricao}</p>
        </div>
      </Link>
      {acoes && <div className="classe-card__acoes">{acoes}</div>}
    </article>
  );
}
