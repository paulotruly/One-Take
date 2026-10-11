// Documentação: navegação lateral por seções e tópicos, conteúdo ao lado e "anterior/próximo" no fim.
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router";
import { SECOES, TODOS } from "./topicos";

export function DocsPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Volta ao topo e fecha o menu (celular) ao trocar de tópico.
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuAberto(false);
  }, [pathname]);

  if (!slug) return <Navigate to={`/docs/${TODOS[0]!.slug}`} replace />;
  const indice = TODOS.findIndex((t) => t.slug === slug);
  if (indice === -1) return <Navigate to={`/docs/${TODOS[0]!.slug}`} replace />;

  const atual = TODOS[indice]!;
  const anterior = TODOS[indice - 1];
  const proximo = TODOS[indice + 1];
  const Conteudo = atual.Conteudo;

  return (
    <div className="docs">
      <button type="button" className="docs__abrir-menu btn" onClick={() => setMenuAberto(!menuAberto)} aria-expanded={menuAberto}>
        <Menu size={16} aria-hidden /> {atual.secao} / {atual.titulo}
      </button>

      <aside className={`docs__lateral ${menuAberto ? "docs__lateral--aberta" : ""}`} aria-label="Navegação da documentação">
        {SECOES.map((s) => (
          <div key={s.titulo} className="docs__secao">
            <p className="docs__secao-titulo">
              <s.Icone size={14} aria-hidden /> {s.titulo}
            </p>
            <ul>
              {s.topicos.map((t) => (
                <li key={t.slug}>
                  <Link to={`/docs/${t.slug}`} className={`docs__link ${t.slug === slug ? "docs__link--ativo" : ""}`} aria-current={t.slug === slug ? "page" : undefined}>
                    {t.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <article className="docs__artigo">
        <p className="docs__trilha">{atual.secao}</p>
        <h1>{atual.titulo}</h1>
        {atual.resumo && <p className="docs__resumo">{atual.resumo}</p>}
        <div className="docs__conteudo">
          <Conteudo />
        </div>

        <nav className="docs__paginacao" aria-label="Tópicos vizinhos">
          {anterior ? (
            <Link to={`/docs/${anterior.slug}`} className="docs__vizinho">
              <span className="docs__vizinho-rotulo"><ChevronLeft size={14} aria-hidden /> Anterior</span>
              {anterior.titulo}
            </Link>
          ) : <span />}
          {proximo && (
            <Link to={`/docs/${proximo.slug}`} className="docs__vizinho docs__vizinho--proximo">
              <span className="docs__vizinho-rotulo">Próximo <ChevronRight size={14} aria-hidden /></span>
              {proximo.titulo}
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
