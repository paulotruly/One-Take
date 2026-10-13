import type { ReactNode } from "react";
import type { Classe } from "../types";
import { ClasseImagem } from "./ClasseImagem";
import { GrupoBadge, OrigemBadge } from "./Selos";
import { StatsBar } from "./StatsBar";

export function ClasseCabecalho({ classe, acoes }: { classe: Classe; acoes?: ReactNode }) {
  return (
    <header className="classe-cabecalho">
      <div className="classe-cabecalho__retrato">
        <ClasseImagem url={classe.imagemUrl} titulo={classe.titulo} />
      </div>
      <div className="classe-cabecalho__info">
        <div className="classe-cabecalho__selos">
          <GrupoBadge grupo={classe.grupo} />
          <OrigemBadge fixa={classe.fixa} verificado={classe.verificado} deOutro={classe.deOutro} />
        </div>
        {classe.conceito && <p className="classe-card__conceito">Subclasse de {classe.conceito.titulo}</p>}
        <h1>{classe.titulo}</h1>
        <StatsBar vida={classe.pontosVida} mana={classe.pontosMana} esforco={classe.pontosEsforco} />
        <p className="classe-cabecalho__descricao">{classe.descricao}</p>
        {acoes && <div className="classe-cabecalho__acoes">{acoes}</div>}
      </div>
    </header>
  );
}
