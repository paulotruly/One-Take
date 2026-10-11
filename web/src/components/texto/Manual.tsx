// Blocos de apresentação da documentação (/docs).
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Caixa de destaque: exemplo, dica ou aviso. */
export function Destaque({ tipo = "exemplo", titulo, children }: { tipo?: "exemplo" | "dica" | "aviso"; titulo?: string; children: ReactNode }) {
  return (
    <div className={`destaque destaque--${tipo}`}>
      {titulo && <p className="destaque__titulo">{titulo}</p>}
      {children}
    </div>
  );
}

/** Passos numerados com título e explicação. */
export function Passos({ passos }: { passos: { titulo: string; texto: ReactNode }[] }) {
  return (
    <ol className="passos">
      {passos.map((p, i) => (
        <li key={i} className="passo">
          <span className="passo__numero">{i + 1}</span>
          <div>
            <p className="passo__titulo">{p.titulo}</p>
            <div className="passo__texto">{p.texto}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Grade de cartões curtos (ex.: papéis, partes da ficha). */
export function Cartoes({ itens }: { itens: { Icone: LucideIcon; titulo: string; texto: ReactNode }[] }) {
  return (
    <div className="cartoes">
      {itens.map(({ Icone, titulo, texto }) => (
        <div key={titulo} className="cartao">
          <Icone size={20} aria-hidden />
          <p className="cartao__titulo">{titulo}</p>
          <div className="cartao__texto">{texto}</div>
        </div>
      ))}
    </div>
  );
}

export function Tabela({ cabecalho, linhas }: { cabecalho: ReactNode[]; linhas: ReactNode[][] }) {
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead>
          <tr>{cabecalho.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
