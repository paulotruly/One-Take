// Busca da documentação: filtro por palavras (sem IA). Ignora acentos e maiúsculas; o tópico precisa ter todas as palavras.
// O texto de cada tópico é lido renderizando os tópicos escondidos uma única vez, na primeira busca.
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { TODOS } from "./topicos";

/** "Ação" -> "acao". */
const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Resultado = { slug: string; titulo: string; secao: string; trecho: string };

/** Trecho em volta da primeira palavra encontrada no texto. */
function trechoDe(texto: string, palavra: string) {
  const i = normalizar(texto).indexOf(palavra);
  if (i < 0) return texto.slice(0, 140);
  const inicio = Math.max(0, i - 60);
  return `${inicio > 0 ? "..." : ""}${texto.slice(inicio, i + 100).trim()}...`;
}

export function BuscaDocs({ busca, onBusca }: { busca: string; onBusca: (v: string) => void }) {
  const [textos, setTextos] = useState<Record<string, string> | null>(null);
  const escondido = useRef<HTMLDivElement>(null);
  const palavras = normalizar(busca).split(/\s+/).filter((p) => p.length >= 2);
  const buscando = palavras.length > 0;

  // Monta o índice depois que os tópicos escondidos renderizaram.
  useEffect(() => {
    if (!buscando || textos || !escondido.current) return;
    const indice: Record<string, string> = {};
    escondido.current.querySelectorAll<HTMLElement>("[data-slug]").forEach((el) => {
      indice[el.dataset.slug!] = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    });
    setTextos(indice);
  }, [buscando, textos]);

  const resultados: Resultado[] = !buscando || !textos
    ? []
    : TODOS.flatMap((t) => {
        const texto = `${t.titulo}. ${t.resumo ?? ""} ${textos[t.slug] ?? ""}`;
        const n = normalizar(texto);
        if (!palavras.every((p) => n.includes(p))) return [];
        return [{ slug: t.slug, titulo: t.titulo, secao: t.secao, trecho: trechoDe(textos[t.slug] ?? t.resumo ?? "", palavras[0]!) }];
      });

  return (
    <div className="docs__busca">
      <label className="docs__campo-busca">
        <Search size={16} aria-hidden />
        <input
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder="Buscar na documentação"
          aria-label="Buscar na documentação"
        />
        {busca && (
          <button type="button" className="docs__limpar" aria-label="Limpar busca" onClick={() => onBusca("")}>
            <X size={14} aria-hidden />
          </button>
        )}
      </label>

      {buscando && (
        <div className="docs__resultados" aria-live="polite">
          {!textos ? (
            <p className="pagina__subtitulo">Buscando…</p>
          ) : resultados.length === 0 ? (
            <p className="pagina__subtitulo">Nada encontrado para "{busca.trim()}".</p>
          ) : (
            <ul>
              {resultados.map((r) => (
                <li key={r.slug}>
                  <Link to={`/docs/${r.slug}`} className="docs__resultado">
                    <span className="docs__resultado-secao">{r.secao}</span>
                    <strong>{r.titulo}</strong>
                    <span className="docs__resultado-trecho">{r.trecho}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {buscando && !textos && (
        <div ref={escondido} hidden aria-hidden>
          {TODOS.map((t) => (
            <div key={t.slug} data-slug={t.slug}>
              <t.Conteudo />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
