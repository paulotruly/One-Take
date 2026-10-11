// Landing page: apresentação curta do One-Take. O detalhe fica na documentação (/docs).
import { ArrowRight, Backpack, Clock, Crown, Dices, KeyRound, Layers, Palette, TrendingUp, User } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../auth/AuthProvider";

const VANTAGENS = [
  { Icone: Clock, titulo: "Uma sessão, uma história", texto: "A aventura começa e termina no mesmo encontro. Sem campanha que se arrasta por meses." },
  { Icone: Layers, titulo: "Personagem em minutos", texto: "Classes prontas, como num jogo de heróis: escolha, distribua 3 dados e jogue." },
  { Icone: Palette, titulo: "Qualquer tema", texto: "O mestre cria raças, classes, perícias e atributos e escolhe o que vale em cada mesa." },
  { Icone: TrendingUp, titulo: "Evolui a cada participação", texto: "Cada sessão jogada vale um nível: mais vida, novas cartas e mais espaço na mochila." },
];

const PASSOS = [
  { Icone: Crown, titulo: "O mestre cria o grupo", texto: "E compartilha um código de 6 caracteres." },
  { Icone: KeyRound, titulo: "Os jogadores entram", texto: "Digitam o código e montam a ficha com as opções do grupo." },
  { Icone: Dices, titulo: "Todo mundo joga", texto: "Ficha, cartas e inventário na mão durante a sessão." },
];

export function HomePage() {
  const { session } = useAuth();
  return (
    <div className="landing">
      <section className="landing__hero">
        <Dices size={48} aria-hidden />
        <h1>RPG de mesa para quem não tem tempo de campanha.</h1>
        <p className="landing__subtitulo">
          O One-Take é um sistema de RPG de mesa feito para uma sessão só, com o app como apoio: personagens prontos, regras
          simples e controle de fichas, vida, mana, status e inventário num lugar só.
        </p>
        <div className="hero__acoes">
          {session ? (
            <Link to="/area" className="btn btn--primario">Ir para minha área <ArrowRight size={16} aria-hidden /></Link>
          ) : (
            <>
              <Link to="/cadastro" className="btn btn--primario">Começar agora <ArrowRight size={16} aria-hidden /></Link>
              <Link to="/login" className="btn">Entrar</Link>
            </>
          )}
          <Link to="/docs" className="btn">Ler a documentação</Link>
        </div>
      </section>

      <section className="landing__secao">
        <div className="landing__grade">
          {VANTAGENS.map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="landing__vantagem">
              <Icone size={24} aria-hidden />
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__secao">
        <h2>Como funciona</h2>
        <ol className="landing__passos">
          {PASSOS.map(({ Icone, titulo, texto }, i) => (
            <li key={titulo} className="landing__passo">
              <span className="passo__numero">{i + 1}</span>
              <Icone size={22} aria-hidden />
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing__secao landing__papeis">
        <div className="landing__papel">
          <Crown size={24} aria-hidden />
          <h3>Para mestres</h3>
          <p>Monte o mundo, libere o que vale em cada mesa, entregue itens e suba o nível dos personagens.</p>
          <Link to="/docs/mestre-visao-geral">Guia do mestre <ArrowRight size={14} aria-hidden /></Link>
        </div>
        <div className="landing__papel">
          <User size={24} aria-hidden />
          <h3>Para jogadores</h3>
          <p>Entre com o código, escolha raça e classe e acompanhe vida, cartas e inventário na ficha.</p>
          <Link to="/docs/jogador-entrar">Guia do jogador <ArrowRight size={14} aria-hidden /></Link>
        </div>
        <div className="landing__papel">
          <Backpack size={24} aria-hidden />
          <h3>As regras</h3>
          <p>Atributos com d20, perícias, cartas de habilidade, progressão e inventário, explicados por tópico.</p>
          <Link to="/docs/ficha">Regras do jogo <ArrowRight size={14} aria-hidden /></Link>
        </div>
      </section>

      {!session && (
        <section className="landing__chamada">
          <h2>Pronto para a próxima sessão?</h2>
          <Link to="/cadastro" className="btn btn--primario">Criar conta grátis <ArrowRight size={16} aria-hidden /></Link>
        </section>
      )}
    </div>
  );
}
