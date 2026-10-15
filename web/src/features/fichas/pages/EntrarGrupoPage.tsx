// Entrar num grupo pelo código: mostra o grupo e cria a ficha com o que ele libera.
import { Dices, Footprints, Info, Minus, Plus, Repeat, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { GrupoBadge } from "../../classes/components/Selos";
import { StatsBar } from "../../classes/components/StatsBar";
import { useConvite, useCriarFicha } from "../api";
import { ClasseDetalhes } from "../components/ClasseDetalhes";
import type { Convite, PersonagemDeOutraMesa } from "../types";

export function EntrarGrupoPage() {
  const { codigo = "" } = useParams();
  const convite = useConvite(codigo);

  if (convite.isPending) return <Loading texto="Procurando o grupo…" />;
  if (convite.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/jogador">Minhas fichas</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(convite.error)} />
      </div>
    );
  }
  return <Conteudo codigo={codigo} c={convite.data} />;
}

function Conteudo({ codigo, c }: { codigo: string; c: Convite }) {
  const g = c.grupo;
  const cheio = c.vagas.ocupadas >= c.vagas.limite;
  const incompleto = c.classes.length === 0 || c.racas.length === 0 || c.atributos.length === 0;

  return (
    <div className="pagina">
      <LinkVoltar to="/jogador">Minhas fichas</LinkVoltar>
      <header className="classe-cabecalho">
        <div className="classe-cabecalho__retrato classe-cabecalho__retrato--paisagem">
          <ClasseImagem url={g.imagemUrl} titulo={g.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          <span className="selo">{g.genero}</span>
          <h1>{g.titulo}</h1>
          <p className="pericia__nome">
            <Avatar url={g.mestre.fotoUrl} nome={g.mestre.nome} tamanho={24} /> Mestre: {g.mestre.nome || `@${g.mestre.nickname}`}
          </p>
          <p className="classe-cabecalho__descricao">{g.sinopse}</p>
          <p className="pagina__subtitulo">
            {c.vagas.ocupadas} de {c.vagas.limite} vagas ocupadas
          </p>
        </div>
      </header>

      {c.souMestre ? (
        <EmptyState titulo="Este grupo é seu" descricao="O mestre não cria ficha no próprio grupo." />
      ) : c.minhaFichaId ? (
        <EmptyState
          titulo="Você já está neste grupo"
          acao={<Link to={`/jogador/fichas/${c.minhaFichaId}`} className="btn btn--primario">Abrir minha ficha</Link>}
        />
      ) : cheio ? (
        <EmptyState titulo="Grupo cheio" descricao="Todas as vagas estão ocupadas. Fale com o mestre." />
      ) : incompleto ? (
        <EmptyState titulo="Grupo ainda não está pronto" descricao="O mestre ainda não liberou classes, raças e atributos." />
      ) : (
        <CriarFicha codigo={codigo} c={c} />
      )}
    </div>
  );
}

function CriarFicha({ codigo, c }: { codigo: string; c: Convite }) {
  const navigate = useNavigate();
  const criar = useCriarFicha();
  const [nome, setNome] = useState("");
  const [racaId, setRacaId] = useState("");
  const [classeId, setClasseId] = useState("");
  const [historia, setHistoria] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [dados, setDados] = useState<Record<string, number>>({});
  const [detalheId, setDetalheId] = useState<string | null>(null);
  // Personagem de outra mesa (null = personagem novo): leva nome, história, imagem, classe, raça e nível.
  const [origem, setOrigem] = useState<PersonagemDeOutraMesa | null>(null);
  const detalhe = c.classes.find((cl) => cl.id === detalheId);
  // Subclasses agrupadas pelo arquétipo; classes avulsas no fim.
  const gruposDeClasses = Object.values(
    c.classes.reduce<Record<string, { conceito: (typeof c.classes)[number]["conceito"]; classes: typeof c.classes }>>((acc, cl) => {
      const chave = cl.conceito?.id ?? "~avulsas";
      (acc[chave] ??= { conceito: cl.conceito ?? null, classes: [] }).classes.push(cl);
      return acc;
    }, {}),
  ).sort((a, b) => (a.conceito ? 0 : 1) - (b.conceito ? 0 : 1) || (a.conceito?.titulo ?? "").localeCompare(b.conceito?.titulo ?? "", "pt-BR"));

  const usados = Object.values(dados).reduce((t, n) => t + n, 0);
  const restantes = c.pontosAtributo - usados;
  const erros = errosDeCampo(criar.error);

  function mudarDado(atributoId: string, delta: number) {
    const atual = dados[atributoId] ?? 0;
    const novo = Math.max(0, atual + delta);
    if (delta > 0 && restantes <= 0) return;
    setDados({ ...dados, [atributoId]: novo });
  }

  /** Escolher um personagem de outra mesa preenche tudo; os atributos vêm pelo nome (se a soma bater, senão o jogador distribui). */
  function escolherPersonagem(p: PersonagemDeOutraMesa | null) {
    setOrigem(p);
    if (!p) {
      setNome(""); setHistoria(""); setImagemUrl(""); setRacaId(""); setClasseId(""); setDados({});
      return;
    }
    setNome(p.nome);
    setHistoria(p.historia ?? "");
    setImagemUrl(p.imagemUrl ?? "");
    setRacaId(p.racaId);
    setClasseId(p.classeId);
    const porNome: Record<string, number> = {};
    for (const a of c.atributos) {
      const n = p.atributos.find((x) => x.nome === a.nome)?.dados ?? 0;
      if (n > 0) porNome[a.id] = n;
    }
    const soma = Object.values(porNome).reduce((t, n) => t + n, 0);
    setDados(soma === c.pontosAtributo ? porNome : {});
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    criar.mutate(
      { codigo, nome, racaId, classeId, historia: historia.trim() || null, imagemUrl: imagemUrl.trim() || null, dados, origem: origem?.origem ?? null },
      { onSuccess: (f) => navigate(`/jogador/fichas/${f.id}`, { replace: true }) },
    );
  }

  return (
    <form className="pagina" noValidate onSubmit={enviar}>
      {c.personagens.length > 0 && (
        <section className="secao">
          <h2>Personagem novo ou de outra mesa?</h2>
          <p className="pagina__subtitulo">
            Cada mesa é uma sessão: para subir de nível, leve o mesmo personagem para mais mesas. Ele vem com a classe, a raça e o nível,
            com vida, mana e esforço cheios e sem os itens. Os pontos de perícia dos níveis voltam para você gastar nesta mesa, e a ficha
            da mesa antiga vira arquivada.
          </p>
          <div className="opcoes" role="radiogroup" aria-label="Personagem">
            <button type="button" role="radio" aria-checked={!origem} className={`opcao ${!origem ? "opcao--ativa" : ""}`} onClick={() => escolherPersonagem(null)}>
              <UserPlus size={20} aria-hidden />
              <strong>Personagem novo</strong>
              <span className="opcao__texto">Começa no nível 1.</span>
            </button>
            {c.personagens.map((p) => (
              <button
                key={p.origem.id}
                type="button"
                role="radio"
                aria-checked={origem?.origem.id === p.origem.id}
                disabled={!!p.motivoBloqueio}
                title={p.motivoBloqueio ?? undefined}
                className={`opcao ${origem?.origem.id === p.origem.id ? "opcao--ativa" : ""}`}
                onClick={() => escolherPersonagem(p)}
              >
                <Repeat size={20} aria-hidden />
                <strong>{p.nome}</strong>
                <span className="selo">Nível {p.nivel}</span>
                <span className="opcao__texto">{p.classe} · {p.raca}</span>
                <span className="opcao__texto">{p.motivoBloqueio ?? `Da mesa ${p.grupo}`}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="secao">
        <h2>1. Personagem</h2>
        <div className="form">
          <Field rotulo="Nome do personagem" erro={erros.nome}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
          </Field>
          <Field rotulo="Link da imagem do personagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
            <input type="url" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field rotulo="História (opcional)" erro={erros.historia} dica="Um parágrafo sobre quem é o personagem.">
            <textarea value={historia} onChange={(e) => setHistoria(e.target.value)} maxLength={4000} rows={4} />
          </Field>
        </div>
      </section>

      {origem ? (
        <section className="secao">
          <h2>2. Raça e classe</h2>
          <p>
            <strong>{origem.raca}</strong> e <strong>{origem.classe}</strong>, nível {origem.nivel}: vêm com o personagem.
          </p>
          {(erros.racaId || erros.classeId) && <p className="campo__erro">{erros.racaId ?? erros.classeId}</p>}
        </section>
      ) : (<>
      <section className="secao">
        <h2>2. Raça</h2>
        {erros.racaId && <p className="campo__erro">{erros.racaId}</p>}
        <div className="opcoes" role="radiogroup" aria-label="Raça">
          {c.racas.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={racaId === r.id}
              className={`opcao ${racaId === r.id ? "opcao--ativa" : ""}`}
              onClick={() => setRacaId(r.id)}
            >
              <div className="opcao__imagem"><ClasseImagem url={r.imagemUrl} titulo={r.titulo} /></div>
              {r.conceito && <span className="classe-card__conceito">{r.conceito.titulo}</span>}
              <strong>{r.titulo}</strong>
              <span className="stat"><Footprints size={12} aria-hidden /> {r.deslocamento} quadrados</span>
              <span className="opcao__texto">{r.descricao}</span>
              {r.pericias.length > 0 && (
                <span className="opcao__texto">{r.pericias.map((p) => `${p.nome} +${p.pontos}`).join(" · ")}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="secao">
        <h2>3. Classe</h2>
        {erros.classeId && <p className="campo__erro">{erros.classeId}</p>}
        {gruposDeClasses.map(({ conceito, classes }) => (
        <div key={conceito?.id ?? "avulsas"} className="secao">
          {gruposDeClasses.length > 1 && (
            <div>
              <h3>{conceito ? conceito.titulo : "Outras classes"}</h3>
              {conceito?.descricao && <p className="pagina__subtitulo">{conceito.descricao}</p>}
            </div>
          )}
        <div className="opcoes" role="radiogroup" aria-label={conceito ? `Subclasses de ${conceito.titulo}` : "Classe"}>
          {classes.map((cl) => (
            <div key={cl.id} className="opcao-com-detalhe">
            <button
              type="button"
              role="radio"
              aria-checked={classeId === cl.id}
              disabled={cl.ocupada}
              title={cl.motivoOcupada ?? undefined}
              className={`opcao ${classeId === cl.id ? "opcao--ativa" : ""}`}
              onClick={() => setClasseId(cl.id)}
            >
              <div className="opcao__imagem"><ClasseImagem url={cl.imagemUrl} titulo={cl.titulo} /></div>
              <strong>{cl.titulo}</strong>
              <GrupoBadge grupo={cl.grupo} />
              <StatsBar vida={cl.pontosVida} mana={cl.pontosMana} esforco={cl.pontosEsforco} compacto />
              <span className="opcao__texto">{cl.motivoOcupada ?? cl.descricao}</span>
            </button>
            <Button pequeno variante="fantasma" onClick={() => setDetalheId(cl.id)}>
              <Info size={14} aria-hidden /> Ver detalhes
            </Button>
            </div>
          ))}
        </div>
        </div>
        ))}
      </section>
      </>)}

      <section className="secao">
        <h2>{origem ? "3." : "4."} Atributos</h2>
        <p className="pagina__subtitulo">
          Distribua {c.pontosAtributo} pontos. Cada ponto é um d20: nos testes você rola esses dados e fica com o maior. Restam{" "}
          <strong>{restantes}</strong>.
        </p>
        {erros.dados && <p className="campo__erro">{erros.dados}</p>}
        <ul className="dados-atributos">
          {c.atributos.map((a) => {
            const n = dados[a.id] ?? 0;
            return (
              <li key={a.id} className="dados-atributo">
                <div>
                  <strong>{a.nome}</strong>
                  {a.descricao && <p className="pericia__descricao">{a.descricao}</p>}
                </div>
                <div className="contador">
                  <Button pequeno aria-label={`Menos em ${a.nome}`} onClick={() => mudarDado(a.id, -1)} disabled={n === 0}>
                    <Minus size={14} aria-hidden />
                  </Button>
                  <span className="contador__valor">
                    <Dices size={14} aria-hidden /> {n}d20
                  </span>
                  <Button pequeno aria-label={`Mais em ${a.nome}`} onClick={() => mudarDado(a.id, 1)} disabled={restantes === 0}>
                    <Plus size={14} aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Modal aberto={!!detalhe} onFechar={() => setDetalheId(null)} titulo={detalhe?.titulo ?? ""} largo>
        {detalhe && (
          <>
            <ClasseDetalhes classe={detalhe} />
            <div className="modal__acoes">
              <Button onClick={() => setDetalheId(null)}>Fechar</Button>
              <Button
                variante="primario"
                disabled={detalhe.ocupada}
                title={detalhe.motivoOcupada ?? undefined}
                onClick={() => {
                  setClasseId(detalhe.id);
                  setDetalheId(null);
                }}
              >
                {classeId === detalhe.id ? "Classe escolhida" : "Escolher esta classe"}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {criar.isError && <div className="aviso">{erroDeFormulario(criar.error)}</div>}
      <div className="barra-acoes">
        <Button type="submit" variante="primario" disabled={criar.isPending || !racaId || !classeId || restantes !== 0}>
          {criar.isPending ? "Criando ficha…" : origem ? `Levar ${origem.nome} para esta mesa` : "Criar ficha e entrar no grupo"}
        </Button>
      </div>
    </form>
  );
}
