import { Archive, LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/ui/Button";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { useFichasArquivadas, useMinhasFichas } from "../api";
import { ROTULO_MOTIVO } from "../types";

export function MinhasFichasPage() {
  const fichas = useMinhasFichas();
  const arquivadas = useFichasArquivadas();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");

  function entrar(e: FormEvent) {
    e.preventDefault();
    const c = codigo.trim().toUpperCase();
    if (c) navigate(`/jogador/entrar/${encodeURIComponent(c)}`);
  }

  return (
    <div className="pagina">
      <div>
        <h1>Minhas fichas</h1>
        <p className="pagina__subtitulo">Uma ficha por grupo. Para entrar num grupo novo, use o código que o mestre passou.</p>
      </div>

      <form className="painel entrar-codigo" onSubmit={entrar}>
        <label htmlFor="codigo" className="campo__rotulo">
          Entrar em um grupo
        </label>
        <div className="entrar-codigo__linha">
          <input
            id="codigo"
            className="entrar-codigo__input"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            maxLength={12}
            autoComplete="off"
          />
          <Button type="submit" variante="primario" disabled={!codigo.trim()}>
            <LogIn size={16} aria-hidden /> Entrar
          </Button>
        </div>
      </form>

      {fichas.isPending ? (
        <Loading texto="Carregando fichas…" />
      ) : fichas.isError ? (
        <ErrorState mensagem={mensagemDeErro(fichas.error)} onTentarNovamente={() => fichas.refetch()} />
      ) : fichas.data.length === 0 ? (
        <EmptyState titulo="Você ainda não tem fichas" descricao="Peça o código de entrada ao mestre e digite acima." />
      ) : (
        <ul className="lista-cards">
          {fichas.data.map((f) => (
            <li key={f.id}>
              <Link to={`/jogador/fichas/${f.id}`} className="card-link card-link--com-imagem">
                <div className="card-link__imagem">
                  <ClasseImagem url={f.imagemUrl ?? f.grupo.imagemUrl} titulo={f.nome} />
                </div>
                <div className="card-link__topo">
                  <h3>{f.nome}</h3>
                  <span className="selo">Nível {f.nivel}</span>
                </div>
                <p className="card-link__descricao">
                  {f.raca} · {f.classe}
                </p>
                <p className="card-link__rodape">Grupo: {f.grupo.titulo}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {arquivadas.data && arquivadas.data.length > 0 && (
        <section className="secao">
          <h2><Archive size={18} aria-hidden /> Fichas arquivadas</h2>
          <p className="pagina__subtitulo">Personagens que saíram de um grupo. São cópias só para leitura; só você pode apagá-las.</p>
          <ul className="lista-cards">
            {arquivadas.data.map((f) => (
              <li key={f.id}>
                <Link to={`/jogador/arquivadas/${f.id}`} className="card-link">
                  <div className="card-link__topo">
                    <h3>{f.nome}</h3>
                    <span className="selo">Nível {f.nivel}</span>
                  </div>
                  <p className="card-link__descricao">{f.raca} · {f.classe}</p>
                  <p className="card-link__rodape">{f.grupo} · {ROTULO_MOTIVO[f.motivo]}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
