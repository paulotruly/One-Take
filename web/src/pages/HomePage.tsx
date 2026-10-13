// Página inicial pública: apresenta o One-Take, o que já existe no app e como começar. O detalhe fica na documentação (/docs).
// Só funcionalidades implementadas; números de regra vêm de useRegras() (GET /api/regras).
import {
  Activity, ArrowRight, Backpack, BookOpen, ChevronDown, Crown, Dices, Heart, KeyRound, Layers, ListChecks, Package, PawPrint,
  ScrollText, Shield, Smartphone, TrendingUp, UserRound, Users, type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { useRegras } from "../features/docs/regras";

type Recurso = { Icone: LucideIcon; titulo: string; texto: string };

const PARA_O_MESTRE: Recurso[] = [
  { Icone: Layers, titulo: "Classes e cartas", texto: "Classes com vida, mana e esforço base e uma cartela de habilidades: tipo de efeito, custo de mana, nível e aprimoramentos." },
  { Icone: ListChecks, titulo: "Raças, perícias e atributos", texto: "Um catálogo só seu. Crie atributos para o tema da aventura e escolha as perícias de cada classe e raça." },
  { Icone: Shield, titulo: "Grupos com código", texto: "Defina o limite de jogadores, o que vale na mesa, os status ativos e as regras da mesa. Os jogadores entram com um código." },
  { Icone: PawPrint, titulo: "Bestiário e NPCs", texto: "Criaturas montadas como classes e invocadas no nível escolhido. NPCs com ficha, cartas e inventário." },
  { Icone: Backpack, titulo: "Catálogo de itens", texto: "Categorias, espaços, usos e pré-requisitos. Lance itens no grupo ou direto na ficha de um jogador." },
  { Icone: Package, titulo: "Kits de RPG", texto: "Junte o conteúdo de uma aventura num kit e use-o para montar o grupo em poucos cliques." },
];

const PARA_O_JOGADOR: Recurso[] = [
  { Icone: ScrollText, titulo: "Ficha pronta", texto: "Raça, classe, dados por atributo, perícias somadas e o teste de cada perícia já calculado." },
  { Icone: Heart, titulo: "Vida, mana e esforço", texto: "Recursos sempre à vista, com os limites do nível. O mestre cura; você registra o dano." },
  { Icone: Activity, titulo: "Status", texto: "Avisos automáticos de morte e cansaço e os status que o mestre aplica durante a sessão." },
  { Icone: Smartphone, titulo: "Feito para o celular", texto: "Ficha, cartas e inventário em telas pensadas para usar na mesa, pelo telefone." },
];

const PERGUNTAS: { pergunta: string; resposta: ReactNode }[] = [
  {
    pergunta: "Preciso de e-mail para criar uma conta?",
    resposta: "Não. A conta usa só nome de usuário e senha. Para o caso de esquecer a senha, você guarda um código de recuperação que o app mostra ao criar a conta.",
  },
  {
    pergunta: "O app rola os dados?",
    resposta: "Não. A ficha mostra o teste pronto (por exemplo, \"2d20 + 5\") e a mesa rola dados de verdade. Rolagem no app ainda não existe.",
  },
  {
    pergunta: "Posso jogar e mestrar com a mesma conta?",
    resposta: "Sim. Toda conta joga, e a interface de mestre pode ser ativada no cadastro ou depois. Só não dá para ter ficha no seu próprio grupo.",
  },
  {
    pergunta: "Preciso de um mapa ou grid no app?",
    resposta: "Não. O grid de batalha fica na mesa, físico. O app cuida das fichas, das criaturas e dos itens.",
  },
  {
    pergunta: "Dá para usar em outros temas além de fantasia?",
    resposta: (
      <>
        Sim. O mestre cria raças, classes, perícias e atributos próprios e escolhe o que vale em cada grupo.{" "}
        <Link to="/docs/mestre-temas">Veja exemplos de adaptação</Link>.
      </>
    ),
  },
  {
    pergunta: "Onde estão as regras completas?",
    resposta: (
      <>
        Na <Link to="/docs">documentação</Link>: regras do jogo, guia do mestre, guia do jogador e o que ainda não existe no app.
      </>
    ),
  },
];

function Recursos({ titulo, Icone, itens }: { titulo: string; Icone: LucideIcon; itens: Recurso[] }) {
  return (
    <div className="home__grupo-recursos">
      <h3 className="home__subtitulo-grupo"><Icone size={18} aria-hidden /> {titulo}</h3>
      <ul className="home__recursos">
        {itens.map(({ Icone: I, titulo: t, texto }) => (
          <li key={t} className="home__recurso">
            <I size={22} aria-hidden />
            <h4>{t}</h4>
            <p>{texto}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HomePage() {
  const { session } = useAuth();
  const r = useRegras();
  const ganho = r.progressao.ganhoPorNivel;
  const d = `d${r.teste.ladosDoDado}`;

  const passos = [
    { Icone: Crown, quem: "Mestre", titulo: "Monte o mundo", texto: "Crie a conta, ative a interface de mestre e cadastre classes, raças, perícias, itens e criaturas, ou organize tudo num kit." },
    { Icone: KeyRound, quem: "Mestre", titulo: "Crie o grupo", texto: "Escolha o que vale na mesa e compartilhe o código de entrada com os jogadores." },
    { Icone: Users, quem: "Jogadores", titulo: "Entrem e montem a ficha", texto: `Com o código, cada jogador escolhe raça e classe liberadas e distribui ${r.ficha.pontosAtributoIniciais} pontos de atributo (cada ponto é um ${d}).` },
    { Icone: Dices, quem: "Todos", titulo: "Joguem", texto: `O mestre pede atributo + perícia e uma dificuldade. O jogador rola 1 ${d} por ponto, fica com o maior e soma o bônus da perícia.` },
    { Icone: TrendingUp, quem: "Mestre", titulo: "Suba o nível", texto: `Ao fim da sessão, cada personagem pode subir um nível: +${ganho.pontosVida} de vida, +${ganho.pontosMana} de mana, +${ganho.pontosEsforco} de esforço, +${ganho.pontosPericia} pontos de perícia, as cartas do novo nível e +${r.ficha.inventarioPorNivel} espaços no inventário.` },
  ];

  return (
    <div className="home">
      {/* ---------- Hero ---------- */}
      <section className="home__hero" aria-labelledby="home-titulo">
        <div className="home__hero-texto">
          <p className="home__selo">RPG de mesa para one-shots</p>
          <h1 id="home-titulo">Uma sessão. Uma história completa.</h1>
          <p className="home__lead">
            No One-Take, cada jogador escolhe uma classe pronta, com cartas de habilidade já definidas, como num jogo de heróis.
            O app cuida das fichas, do inventário e dos testes; a mesa cuida da história.
          </p>
          <div className="hero__acoes">
            {session ? (
              <Link to="/area" className="btn btn--primario">Ir para minha área <ArrowRight size={16} aria-hidden /></Link>
            ) : (
              <Link to="/cadastro" className="btn btn--primario">Criar conta <ArrowRight size={16} aria-hidden /></Link>
            )}
            <a href="#como-funciona" className="btn">Ver como funciona</a>
          </div>
        </div>

        {/* Exemplo de regra (não é uma tela do app): o teste explicado em uma olhada. */}
        <figure className="home__exemplo" aria-label="Exemplo de teste">
          <figcaption className="home__exemplo-rotulo"><Dices size={16} aria-hidden /> Exemplo de teste</figcaption>
          <dl>
            <div><dt>Ação</dt><dd>Escalar o muro do castelo</dd></div>
            <div><dt>O mestre pede</dt><dd>Capacidade física + Atletismo</dd></div>
            <div><dt>A ficha mostra</dt><dd className="home__teste">2{d} + 5</dd></div>
            <div><dt>Os dados</dt><dd>10 e 15: fica o 15</dd></div>
          </dl>
          <p className="home__exemplo-total">15 + 5 = <strong>20</strong></p>
        </figure>
      </section>

      {/* ---------- O que é ---------- */}
      <section id="sobre" className="home__secao home__sobre" aria-labelledby="sobre-titulo">
        <div>
          <h2 id="sobre-titulo">Feito para quem não tem tempo de campanha</h2>
          <p>
            Preparar uma aventura curta costuma levar mais tempo que jogá-la: criar personagens do zero, explicar regras, controlar fichas no
            papel. O One-Take tira esse peso. O mestre prepara o mundo antes; na hora, os jogadores escolhem um herói pronto e começam a jogar.
          </p>
        </div>
        <ul className="home__publico">
          <li><Crown size={20} aria-hidden /><div><strong>Para mestres</strong><span>que querem preparar one-shots e conduzir o grupo com tudo à mão.</span></div></li>
          <li><UserRound size={20} aria-hidden /><div><strong>Para jogadores</strong><span>que querem chegar, escolher um personagem e jogar, sem montar ficha do zero.</span></div></li>
        </ul>
      </section>

      {/* ---------- Funcionalidades ---------- */}
      <section id="funcionalidades" className="home__secao" aria-labelledby="funcionalidades-titulo">
        <div className="home__cabecalho-secao">
          <h2 id="funcionalidades-titulo">O que já dá para fazer</h2>
          <p>Uma conta para jogar e, se quiser, mestrar. Tudo abaixo já está no app.</p>
        </div>
        <Recursos titulo="Para o mestre" Icone={Crown} itens={PARA_O_MESTRE} />
        <Recursos titulo="Para o jogador" Icone={UserRound} itens={PARA_O_JOGADOR} />
        <p className="home__aviso">
          <strong>Ainda não existe no app:</strong> rolagem de dados, sessões e combate guiado. Os dados são rolados na mesa.{" "}
          <Link to="/docs/limitacoes">Veja a lista completa</Link>.
        </p>
      </section>

      {/* ---------- Como funciona ---------- */}
      <section id="como-funciona" className="home__secao" aria-labelledby="como-titulo">
        <div className="home__cabecalho-secao">
          <h2 id="como-titulo">Como funciona</h2>
          <p>Do mundo pronto ao nível novo, em cinco passos.</p>
        </div>
        <ol className="home__passos">
          {passos.map(({ Icone, quem, titulo, texto }, i) => (
            <li key={titulo} className="home__passo">
              <span className="home__passo-numero" aria-hidden>{i + 1}</span>
              <div>
                <p className="home__passo-quem"><Icone size={14} aria-hidden /> {quem}</p>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="home__guias">
          <Link to="/docs/mestre-primeira-sessao">Primeira sessão, passo a passo <ArrowRight size={14} aria-hidden /></Link>
          <Link to="/docs/jogador-entrar">Guia do jogador <ArrowRight size={14} aria-hidden /></Link>
          <Link to="/docs/testes">Testes, DT e esforço <ArrowRight size={14} aria-hidden /></Link>
        </div>
      </section>

      {/* ---------- Perguntas frequentes ---------- */}
      <section id="perguntas" className="home__secao" aria-labelledby="perguntas-titulo">
        <div className="home__cabecalho-secao">
          <h2 id="perguntas-titulo">Perguntas frequentes</h2>
        </div>
        <div className="home__faq">
          {PERGUNTAS.map(({ pergunta, resposta }) => (
            <details key={pergunta} className="home__pergunta">
              <summary>{pergunta} <ChevronDown size={18} aria-hidden className="home__pergunta-icone" /></summary>
              <p>{resposta}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Chamada final ---------- */}
      <section className="landing__chamada" aria-labelledby="chamada-titulo">
        <div>
          <h2 id="chamada-titulo">Pronto para a próxima sessão?</h2>
          <p className="home__chamada-texto">Crie a conta, monte o grupo e chame a mesa.</p>
        </div>
        <div className="hero__acoes">
          {session ? (
            <Link to="/area" className="btn btn--primario">Ir para minha área <ArrowRight size={16} aria-hidden /></Link>
          ) : (
            <>
              <Link to="/cadastro" className="btn btn--primario">Registrar-se <ArrowRight size={16} aria-hidden /></Link>
              <Link to="/login" className="btn">Login</Link>
            </>
          )}
          <Link to="/docs" className="btn"><BookOpen size={16} aria-hidden /> Documentação</Link>
        </div>
      </section>
    </div>
  );
}
