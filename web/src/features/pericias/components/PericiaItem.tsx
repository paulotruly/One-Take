import type { ReactNode } from "react";
import { formatarModificador, type CategoriaPericia } from "../types";
import { CategoriaIcone } from "./CategoriaIcone";

type Props = {
  pericia: { nome: string; descricao: string; categoria: CategoriaPericia };
  /** Mostra a coluna de valor (modificador da classe ou pontos da raça). */
  valor?: number;
  tituloValor?: string;
  rodape?: ReactNode;
  /** Selos ao lado do nome (verificado, só leitura). */
  aposNome?: ReactNode;
  acoes?: ReactNode;
};

export function PericiaItem({ pericia: p, valor, tituloValor, rodape, aposNome, acoes }: Props) {
  return (
    <li className={`pericia ${valor !== undefined ? "pericia--com-mod" : ""}`}>
      <span className="pericia__icone">
        <CategoriaIcone categoria={p.categoria} />
      </span>
      {valor !== undefined && (
        <span className="pericia__mod" title={tituloValor}>
          {formatarModificador(valor)}
        </span>
      )}
      <div>
        <div className="pericia__nome">
          <strong>{p.nome}</strong>
          {aposNome}
        </div>
        {p.descricao && <p className="pericia__descricao">{p.descricao}</p>}
        {rodape}
      </div>
      {acoes && <div className="pericia__acoes">{acoes}</div>}
    </li>
  );
}
