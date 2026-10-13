// Termos de uso e Política de privacidade. O texto vem direto das minutas em docs/legal/ (fonte única; ver REVISAO_LEGAL_PENDENCIAS.md,
// que é interno e não é exibido). Marcadores entre colchetes ainda não preenchidos aparecem destacados.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import politica from "../../../docs/legal/POLITICA_DE_PRIVACIDADE.md?raw";
import termos from "../../../docs/legal/TERMOS_DE_USO.md?raw";
import { LinkVoltar } from "../components/ui/LinkVoltar";

// ---------- Markdown mínimo: títulos, parágrafos, listas, tabelas, **negrito**, `código`, [link](url) ----------

function emLinha(texto: string): ReactNode[] {
  const partes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)|(\[[A-ZÀ-Ú]{2,}[^\]]*\])/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));
    if (m[1] !== undefined) partes.push(<strong key={k++}>{emLinha(m[1])}</strong>);
    else if (m[2] !== undefined) partes.push(<code key={k++}>{m[2]}</code>);
    else if (m[3] !== undefined) {
      const href = m[4]!;
      partes.push(href.startsWith("/") ? <Link key={k++} to={href}>{m[3]}</Link> : <a key={k++} href={href} target="_blank" rel="noopener noreferrer">{m[3]}</a>);
    } else partes.push(<mark key={k++} className="legal__pendente">{m[5]}</mark>);
    ultimo = re.lastIndex;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

function blocos(md: string): ReactNode[] {
  const linhas = md.replace(/\r/g, "").split("\n");
  const saida: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < linhas.length) {
    const l = linhas[i]!;
    if (!l.trim()) { i++; continue; }
    const titulo = /^(#{1,3})\s+(.*)$/.exec(l);
    if (titulo) {
      const nivel = titulo[1]!.length;
      const conteudo = emLinha(titulo[2]!);
      saida.push(nivel === 1 ? <h1 key={k++}>{conteudo}</h1> : nivel === 2 ? <h2 key={k++}>{conteudo}</h2> : <h3 key={k++}>{conteudo}</h3>);
      i++;
      continue;
    }
    if (l.startsWith("|")) {
      const tabela: string[][] = [];
      while (i < linhas.length && linhas[i]!.startsWith("|")) {
        const celulas = linhas[i]!.slice(1, -1).split("|").map((c) => c.trim());
        if (!celulas.every((c) => /^-+$/.test(c))) tabela.push(celulas);
        i++;
      }
      const [cabecalho = [], ...corpo] = tabela;
      saida.push(
        <div key={k++} className="legal__tabela">
          <table>
            <thead><tr>{cabecalho.map((c, j) => <th key={j}>{emLinha(c)}</th>)}</tr></thead>
            <tbody>{corpo.map((r, j) => <tr key={j}>{r.map((c, n) => <td key={n}>{emLinha(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    const item = /^(\s*)(-|\d+\.)\s+(.*)$/;
    if (item.test(l)) {
      const ordenada = /^\s*\d+\./.test(l);
      const itens: { texto: string; filhos: string[] }[] = [];
      while (i < linhas.length && (item.test(linhas[i]!) || /^\s{2,}\S/.test(linhas[i]!))) {
        const m = item.exec(linhas[i]!);
        if (m && m[1]!.length === 0) itens.push({ texto: m[3]!, filhos: [] });
        else if (m) itens.at(-1)?.filhos.push(m[3]!);
        else if (itens.length) {
          const alvo = itens.at(-1)!;
          if (alvo.filhos.length) alvo.filhos[alvo.filhos.length - 1] += ` ${linhas[i]!.trim()}`;
          else alvo.texto += ` ${linhas[i]!.trim()}`;
        }
        i++;
      }
      const lis = itens.map((it, j) => (
        <li key={j}>
          {emLinha(it.texto)}
          {it.filhos.length > 0 && <ul>{it.filhos.map((f, n) => <li key={n}>{emLinha(f)}</li>)}</ul>}
        </li>
      ));
      saida.push(ordenada ? <ol key={k++}>{lis}</ol> : <ul key={k++}>{lis}</ul>);
      continue;
    }
    const paragrafo: string[] = [];
    while (i < linhas.length && linhas[i]!.trim() && !/^(#|\||\s*(-|\d+\.)\s)/.test(linhas[i]!)) paragrafo.push(linhas[i++]!.trim());
    saida.push(<p key={k++}>{emLinha(paragrafo.join(" "))}</p>);
  }
  return saida;
}

function PaginaLegal({ md }: { md: string }) {
  const pendentes = (md.match(/\[[A-ZÀ-Ú]{2,}[^\]]*\]/g) ?? []).length;
  return (
    <article className="pagina pagina--texto legal">
      <LinkVoltar to="/">Início</LinkVoltar>
      {pendentes > 0 && (
        <p className="aviso" role="note">
          Minuta em revisão: os trechos destacados ainda serão preenchidos pelo responsável antes da publicação oficial.
        </p>
      )}
      <Fragment>{blocos(md)}</Fragment>
    </article>
  );
}

export const TermosPage = () => <PaginaLegal md={termos} />;
export const PrivacidadePage = () => <PaginaLegal md={politica} />;
