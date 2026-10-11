// Tópicos da documentação: começando e regras do jogo.
import { Backpack, Crown, Dices, Droplet, Footprints, Heart, Layers, ListChecks, Package, Sparkles, User, Zap } from "lucide-react";
import { Link } from "react-router";
import { Cartoes, Destaque, Passos, Tabela } from "../../../components/texto/Manual";
import { CategoriaIcone } from "../../pericias/components/CategoriaIcone";
import { CATEGORIAS, LISTA_CATEGORIAS } from "../../pericias/types";
import { useRegras } from "../regras";

/** Chance de o maior de n d20 ser pelo menos `alvo`. */
const chance = (n: number, alvo: number) => 1 - Math.pow((alvo - 1) / 20, n);
const pct = (x: number) => `${Math.round(x * 100)}%`;

// ---------- Começando ----------

export function Introducao() {
  return (
    <>
      <p>
        Muita gente gosta de RPG de mesa, mas não tem tempo para manter uma campanha que dura meses. As faltas se acumulam e as
        histórias ficam pela metade. O One-Take foi feito para isso.
      </p>
      <Destaque tipo="dica" titulo="RPG de mesa com apoio de tecnologia">
        O jogo continua acontecendo na mesa, com conversa, dados e imaginação. O app é o apoio: guarda as fichas, faz as contas de
        nível e perícias, controla vida, mana, esforço, status e inventário, e avisa quando algo importante acontece (como um
        personagem morrer ou ficar cansado). O mestre e os jogadores ficam livres para narrar.
      </Destaque>
      <Cartoes
        itens={[
          { Icone: Dices, titulo: "Uma sessão, uma história", texto: "A aventura começa e termina no mesmo encontro." },
          { Icone: Layers, titulo: "Personagem pronto", texto: "O jogador escolhe uma classe pronta, como num jogo de heróis, e já pode jogar." },
          { Icone: Crown, titulo: "Tudo num lugar", texto: "Regras, classes, raças, perícias, fichas e inventário ficam no app." },
        ]}
      />
      <p>
        Esta documentação explica as <Link to="/docs/ficha">regras do jogo</Link>, o <Link to="/docs/mestre-visao-geral">trabalho do mestre</Link>{" "}
        e o <Link to="/docs/jogador-entrar">caminho do jogador</Link>. Use o menu ao lado para navegar.
      </p>
    </>
  );
}

export function ComoFunciona() {
  return (
    <>
      <p>Uma aventura no One-Take segue sempre o mesmo caminho:</p>
      <Passos
        passos={[
          { titulo: "O mestre prepara o grupo", texto: "Monta o RPG dele, escolhe quais classes, raças e perícias valem ali e recebe um código de entrada." },
          { titulo: "O jogador entra com o código", texto: "Digita o código no app e vê o grupo: sinopse, gênero, vagas e as opções liberadas." },
          { titulo: "O jogador cria a ficha", texto: "Escolhe raça e classe, distribui os dados de atributo e, se quiser, escreve a história do personagem." },
          { titulo: "A sessão acontece", texto: "Vida, mana e esforço sobem e descem, itens são coletados e as cartas de habilidade são usadas." },
          { titulo: "Fim da sessão: sobe de nível", texto: "Quem participou com o mesmo personagem sobe 1 nível, dado pelo mestre." },
        ]}
      />
    </>
  );
}

export function Contas() {
  return (
    <>
      <p>
        Ao <Link to="/cadastro">criar a conta</Link>, você escolhe um papel. A conta usa só <strong>nickname e senha</strong>: ninguém
        precisa informar email.
      </p>
      <Cartoes
        itens={[
          { Icone: Crown, titulo: "Mestre", texto: "Cria classes, raças, perícias e atributos, monta grupos, entrega itens e é o único que sobe o nível dos personagens." },
          { Icone: User, titulo: "Jogador", texto: "Entra nos grupos com o código do mestre e cria uma ficha em cada um. Cuida do próprio personagem." },
        ]}
      />
      <h2>Perfil</h2>
      <ul>
        <li>Clique no seu nome, no topo, para abrir o perfil.</li>
        <li>Dá para mudar o <strong>nickname</strong> (usado para entrar e exibido como @nickname), o nome de exibição e a foto (link de uma imagem).</li>
        <li>Se trocar o nickname, passe a entrar com o novo.</li>
      </ul>
    </>
  );
}

// ---------- Regras do jogo ----------

export function Ficha() {
  const { ficha: f } = useRegras();
  return (
    <>
      <p>
        A ficha é o personagem de um jogador <strong>dentro de um grupo</strong>. Cada jogador tem uma ficha por grupo e pode ter fichas
        em vários grupos.
      </p>
      <Cartoes
        itens={[
          { Icone: User, titulo: "Identidade", texto: "Nome do personagem, imagem (link) e um parágrafo opcional de história." },
          { Icone: Footprints, titulo: "Raça", texto: "De onde ele vem: deslocamento e perícias de base." },
          { Icone: Layers, titulo: "Classe", texto: "O papel dele: vida, mana e esforço, cartas de habilidade e perícias." },
          { Icone: Dices, titulo: "Atributos", texto: `${f.pontosAtributoIniciais} pontos distribuídos; cada ponto é um d20 nos testes.` },
          { Icone: ListChecks, titulo: "Perícias", texto: "Somam o que vem da raça, da classe e dos níveis." },
          { Icone: Backpack, titulo: "Inventário", texto: `Começa com ${f.inventarioInicial} espaços e cresce a cada nível.` },
        ]}
      />
      <p>Cada parte tem um tópico próprio nesta seção.</p>
    </>
  );
}

export function Classes() {
  return (
    <>
      <p>A classe é o herói que o jogador escolhe. Ela já vem pronta, então o personagem nasce jogável. Cada classe pertence a um grupo tático:</p>
      <Tabela
        cabecalho={["Grupo", "Papel na mesa"]}
        linhas={[
          [<strong key="c">Combatente</strong>, "Causa dano e pressiona os inimigos."],
          [<strong key="v">Vanguardista</strong>, "Fica na linha de frente: aguenta golpes e protege os aliados."],
          [<strong key="s">Suporte</strong>, "Cura, fortalece os aliados e atrapalha os inimigos."],
        ]}
      />
      <h2>Classes-conceito e subclasses</h2>
      <p>
        Algumas classes são <strong>subclasses</strong> de uma <strong>classe-conceito</strong>: uma ideia geral que se divide em
        caminhos diferentes. A classe-conceito só tem nome e descrição; quem o jogador escolhe é a subclasse.
      </p>
      <Destaque titulo="Exemplo">
        Classe-conceito <strong>Bruxa</strong>, com as subclasses <strong>Bruxa elemental</strong> e <strong>Bruxa assombrosa</strong>.
        Cada subclasse tem os próprios recursos, cartas e perícias.
      </Destaque>
      <h2>O que a classe define</h2>
      <ul>
        <li><strong>Vida, mana e esforço base</strong>: os valores máximos no nível 1. Nenhum pode ser zero.</li>
        <li><strong>Cartela de habilidades</strong>: o deck de cartas da classe (veja <Link to="/docs/habilidades">Habilidades</Link>).</li>
        <li><strong>Perícias</strong> com modificador, por exemplo Luta +2.</li>
      </ul>
      <Destaque tipo="dica" titulo="Na hora de escolher">
        Ao criar a ficha, use <strong>Ver detalhes</strong> em cada classe para ler todas as cartas, inclusive as que só liberam em
        níveis maiores, e as perícias.
      </Destaque>
    </>
  );
}

export function Racas() {
  return (
    <>
      <p>A raça complementa a classe. Ela define:</p>
      <ul>
        <li><strong>Deslocamento</strong>: quantos quadrados do grid o personagem anda por turno.</li>
        <li><strong>Perícias de base</strong>: perícias que o personagem já recebe por ser daquela raça, com uma quantidade de pontos.</li>
      </ul>
      <Destaque titulo="Exemplo">
        Um Humano com deslocamento 8 e Atletismo +2 anda até 8 quadrados por turno e começa com 2 pontos em Atletismo, somados ao que a
        classe der.
      </Destaque>
    </>
  );
}

export function Recursos() {
  const { ganhoPorNivel: g } = useRegras().progressao;
  return (
    <>
      <p>São os três recursos do personagem. A ficha mostra o valor <strong>atual</strong> e o <strong>máximo</strong> de cada um.</p>
      <Tabela
        cabecalho={["Recurso", "O que é", "Se chegar a 0"]}
        linhas={[
          [<span key="v" className="regra__inline"><Heart size={14} aria-hidden /> Vida</span>, "Quanto dano o personagem aguenta.", <strong key="v0">Morte.</strong>],
          [
            <span key="m" className="regra__inline"><Droplet size={14} aria-hidden /> Mana</span>,
            "A energia vital do personagem, em qualquer universo. Sustenta o vigor e paga as cartas com custo de mana.",
            <strong key="m0">Morte: sem energia vital não há vida.</strong>,
          ],
          [<span key="e" className="regra__inline"><Zap size={14} aria-hidden /> Esforço</span>, "A disposição para agir sem cansar.", <strong key="e0">Cansaço (status Cansado).</strong>],
        ]}
      />
      <Destaque tipo="aviso" titulo="Cuidado com a mana">
        Gastar mana em cartas é poderoso, mas ela também é a vida do personagem. Quem zera a mana morre, mesmo com a vida cheia.
      </Destaque>
      <ul>
        <li>O máximo começa no valor base da classe e sobe +{g.pontosVida} de vida, +{g.pontosMana} de mana e +{g.pontosEsforco} de esforço a cada nível.</li>
        <li>Uma ficha nova começa com tudo cheio.</li>
        <li>Durante a sessão, jogador e mestre ajustam os valores atuais (dá para tirar ou somar vários pontos de uma vez). Eles nunca passam do máximo nem ficam abaixo de zero.</li>
        <li>Quando um recurso chega a 0, a ficha mostra um <strong>alerta</strong> (veja <Link to="/docs/status">Status</Link>).</li>
      </ul>
    </>
  );
}

export function StatusTopico() {
  const r = useRegras();
  const automaticos = r.statusFixos.filter((s) => s.gatilho);
  const manuais = r.statusFixos.filter((s) => !s.gatilho);
  const tipo = { BUFF: "Benefício", DEBUFF: "Prejuízo", MISTO: "Misto" } as const;
  return (
    <>
      <p>
        Status são condições e emoções do personagem: cansado, assustado, inspirado. Cada status tem um <strong>efeito</strong> que
        ajuda ou atrapalha. O app <strong>não muda nenhum número</strong> sozinho: ele mostra um alerta na ficha de quem está com o
        status, e a mesa aplica o efeito.
      </p>
      <h2>Automáticos</h2>
      <p>Aparecem sozinhos quando um recurso chega a 0.</p>
      <Tabela cabecalho={["Status", "Quando", "Efeito"]} linhas={automaticos.map((s) => [<strong key={s.nome}>{s.nome}</strong>, s.descricao, s.efeito])} />
      <h2>Aplicados pelo mestre</h2>
      <p>Durante a sessão, o mestre aplica e remove estes status na ficha de cada personagem. Uma carta de habilidade pode indicar qual status ela ativa.</p>
      <Tabela cabecalho={["Status", "Tipo", "Efeito"]} linhas={manuais.map((s) => [<strong key={s.nome}>{s.nome}</strong>, tipo[s.tipo], s.efeito])} />
      <h2>Personalizável</h2>
      <ul>
        <li>O mestre pode criar status próprios, com nome, tipo e efeito.</li>
        <li>Em cada grupo, o mestre escolhe quais status valem. É opcional: um grupo pode não usar status nenhum.</li>
      </ul>
    </>
  );
}

export function Atributos() {
  const r = useRegras();
  const f = r.ficha;
  return (
    <>
      <p>Atributos são as capacidades gerais do personagem e agrupam as perícias. Os atributos fixos do sistema são:</p>
      <Tabela cabecalho={["Atributo", "Descrição"]} linhas={r.atributosFixos.map((a) => [<strong key={a.nome}>{a.nome}</strong>, a.descricao])} />
      <p>O mestre pode criar outros atributos para o tema do RPG dele (por exemplo, Sanidade num jogo de terror) e escolher quais valem em cada grupo.</p>
      <h2>Como funciona um teste</h2>
      <Passos
        passos={[
          { titulo: `Ao criar a ficha, distribua ${f.pontosAtributoIniciais} pontos`, texto: "Os pontos vão nos atributos que o grupo usa. Um atributo pode ficar com 0." },
          { titulo: "Cada ponto é um dado de 20 faces (d20)", texto: "2 pontos em Capacidade física = 2d20 nesse atributo." },
          { titulo: "Quando uma ação pede teste, role os dados do atributo", texto: "O mestre diz qual atributo a ação usa." },
          { titulo: "Fique com o maior resultado", texto: "Valores baixos tendem a falha, altos a sucesso, e os do meio podem trazer consequências mistas." },
        ]}
      />
      <Destaque titulo="Exemplo">
        Com 2 pontos em Capacidade física, para desviar de uma flecha o jogador rola 2d20 e tira 7 e 16. O resultado da ação é <strong>16</strong>.
      </Destaque>
      <h2>Quanto vale ter mais dados</h2>
      <p>Mais dados não aumentam o número máximo (continua 20), mas aumentam muito a chance de um resultado bom:</p>
      <Tabela
        cabecalho={["Dados", "10 ou mais", "15 ou mais", "Tirar 20"]}
        linhas={[1, 2, 3].map((n) => [`${n}d20`, pct(chance(n, 10)), pct(chance(n, 15)), pct(chance(n, 20))])}
      />
      <p className="pagina__subtitulo">As faixas exatas de sucesso e falha, e como as perícias entram no teste, ainda serão definidas.</p>
    </>
  );
}

export function Pericias() {
  const { ganhoPorNivel: g } = useRegras().progressao;
  return (
    <>
      <p>Perícias são habilidades passivas, aquilo em que o personagem é bom: Luta, Furtividade, Diplomacia. Cada perícia pertence a um atributo e tem uma categoria:</p>
      <Tabela
        cabecalho={["Categoria", "Para quê"]}
        linhas={LISTA_CATEGORIAS.map((c) => [
          <span key={c} className="regra__inline"><CategoriaIcone categoria={c} tamanho={16} /> {CATEGORIAS[c].rotulo}</span>,
          CATEGORIAS[c].descricao,
        ])}
      />
      <h2>De onde vêm os pontos</h2>
      <Tabela
        cabecalho={["Fonte", "Como funciona"]}
        linhas={[
          ["Raça", "Pontos de base que a raça dá."],
          ["Classe", "Modificador que a classe tem naquela perícia."],
          ["Níveis", `A cada nível, ${g.pontosPericia} pontos: uma perícia nova com +${g.pontosPericia} ou +${g.pontosPericia} numa que já tem.`],
        ]}
      />
      <Destaque titulo="Exemplo">
        Raça com Luta +2 e classe com Luta +2: a ficha começa com <strong>Luta 4</strong>. Ao subir de nível, o jogador coloca os{" "}
        {g.pontosPericia} pontos em Luta e passa a ter <strong>Luta {4 + g.pontosPericia}</strong>.
      </Destaque>
    </>
  );
}

export function Habilidades() {
  return (
    <>
      <p>Cada classe tem uma <strong>cartela</strong>: o deck de cartas de habilidade dela. Uma carta tem:</p>
      <Tabela
        cabecalho={["Campo", "O que significa"]}
        linhas={[
          ["Título e descrição", "O nome e o sabor da carta."],
          ["Tipo de efeito", "Uma etiqueta livre: Dano, Cura, Controle."],
          ["Efeito", "O que a carta causa."],
          ["Condição (opcional)", "O que precisa acontecer para poder usar. Ex.: ter acertado dois ataques seguidos."],
          ["Limite (opcional)", "Quantas vezes ou quando pode ser usada. Ex.: 1 vez por sessão."],
          [<span key="m" className="regra__inline"><Droplet size={14} aria-hidden /> Custo de mana</span>, "Quanta mana gasta. Muitas cartas não custam nada."],
          [<span key="n" className="regra__inline"><Sparkles size={14} aria-hidden /> Nível necessário</span>, "A partir de qual nível a carta fica disponível."],
        ]}
      />
      <p>No nível N o personagem tem <strong>todas</strong> as cartas da classe com nível necessário até N.</p>
      <h2>Cartas que melhoram com o nível</h2>
      <p>
        Uma mesma carta pode ter <strong>aprimoramentos</strong>: a partir de um nível, ela muda (efeito mais forte, custo de mana
        menor, novo limite, passa a ativar um status). Os aprimoramentos se acumulam, e a ficha mostra sempre a versão do nível do
        personagem, com o selo "Aprimorada" e o próximo nível em que a carta muda.
      </p>
      <Destaque titulo="Exemplo">
        Faísca: no nível 1 causa dano leve e custa 4 de mana. A partir do nível 2, causa dano médio e custa 2.
      </Destaque>
    </>
  );
}

export function Progressao() {
  const r = useRegras();
  const g = r.progressao.ganhoPorNivel;
  const f = r.ficha;
  const sobe = (n: number) => n - r.progressao.nivelInicial;
  return (
    <>
      <p>
        Como cada aventura dura um dia, subir de nível é rápido: <strong>1 nível por participação</strong> com o mesmo personagem. Só o
        mestre sobe o nível. A cada nível o personagem ganha:
      </p>
      <ul>
        <li>+{g.pontosVida} de vida, +{g.pontosMana} de mana e +{g.pontosEsforco} de esforço (no máximo e no valor atual);</li>
        <li>{g.pontosPericia} pontos de perícia para usar;</li>
        <li>todas as cartas daquele nível;</li>
        <li>+{f.inventarioPorNivel} espaços no inventário.</li>
      </ul>
      <Tabela
        cabecalho={["Nível", "Vida / mana / esforço", "Pontos de perícia", "Espaços no inventário"]}
        linhas={[1, 2, 3, 4, 5].map((n) => [
          `Nível ${n}`,
          sobe(n) === 0 ? "valores base da classe" : `base +${sobe(n) * g.pontosVida} / +${sobe(n) * g.pontosMana} / +${sobe(n) * g.pontosEsforco}`,
          sobe(n) * g.pontosPericia,
          f.inventarioInicial + sobe(n) * f.inventarioPorNivel,
        ])}
      />
    </>
  );
}

export function Inventario() {
  const { ficha: f } = useRegras();
  return (
    <>
      <ul>
        <li>Todo personagem começa com <strong>{f.inventarioInicial} espaços</strong> e ganha +{f.inventarioPorNivel} por nível: quanto mais experiente, mais bagagem aguenta.</li>
        <li>Cada item ocupa um espaço e tem nome e descrição. Os itens são criados pelo <strong>mestre</strong>, que entrega a um personagem ou deixa no grupo.</li>
        <li>O jogador pode <strong>passar</strong> um item para outro membro do mesmo grupo, se ele tiver espaço.</li>
        <li>O jogador pode <strong>descartar</strong> um item: ele fica <strong>vago no grupo</strong>, e qualquer membro com espaço pode pegá-lo.</li>
      </ul>
      <Destaque tipo="dica" titulo="Na prática">
        <span className="regra__inline"><Package size={14} aria-hidden /> O mestre cria "Chave de bronze" e entrega ao ladino.</span> O
        ladino passa para o guerreiro, que a descarta quando não precisa mais; a chave fica no grupo para quem quiser.
      </Destaque>
    </>
  );
}

export function Grupos() {
  return (
    <>
      <p>O grupo é o RPG de um mestre. Ele tem título, sinopse, gênero, imagem e um <strong>limite de membros</strong>.</p>
      <ul>
        <li>Para entrar, o jogador digita o <strong>código de entrada</strong> de 6 caracteres que o mestre compartilha.</li>
        <li>Só dá para entrar enquanto houver <strong>vaga</strong>. Cada jogador tem uma ficha por grupo.</li>
        <li>O mestre escolhe <strong>o que vale no grupo</strong>: classes, raças, atributos e perícias. Assim o mesmo sistema serve para fantasia, terror ou ficção científica.</li>
        <li>O grupo pode ou não <strong>permitir classes repetidas</strong>. Se não permitir, cada classe só pode ser escolhida por um jogador.</li>
      </ul>
    </>
  );
}
