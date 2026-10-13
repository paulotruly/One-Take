// Tópicos da documentação: começando e regras do jogo.
import { Backpack, Crown, Dices, Droplet, Footprints, Heart, Layers, ListChecks, Package, PawPrint, Repeat, Sparkles, User, Zap } from "lucide-react";
import { Link } from "react-router";
import { Cartoes, Destaque, Passos, Tabela } from "../../../components/texto/Manual";
import { CategoriaIcone } from "../../pericias/components/CategoriaIcone";
import { CATEGORIAS, LISTA_CATEGORIAS } from "../../pericias/types";
import { LISTA_TIPOS_EFEITO, TIPOS_EFEITO } from "../../classes/types";
import { iconeDe } from "../../itens/types";
import { useRegras } from "../regras";

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
        Uma conta serve para as duas coisas: <strong>jogar e mestrar</strong>. Ao <Link to="/cadastro">criar a conta</Link>, você escolhe a
        interface com que começa. A conta usa só <strong>nickname e senha</strong>: ninguém precisa informar email.
      </p>
      <Cartoes
        itens={[
          { Icone: User, titulo: "Jogador", texto: "Interface simples: entra nos grupos com o código do mestre e cria uma ficha em cada um. Toda conta joga." },
          { Icone: Crown, titulo: "Mestre", texto: "Carrega também a interface de mestre: classes, raças, perícias, itens, bestiário e grupos. Quem é mestre continua podendo jogar nos grupos de outros mestres." },
        ]}
      />
      <ul>
        <li>Começou como jogador e quer mestrar? Toque em <strong>Mestrar</strong> no topo da tela e ative a interface de mestre.</li>
        <li>Quem já é mestre alterna entre <strong>Mestrar</strong> e <strong>Jogar</strong> no topo da tela.</li>
        <li>O catálogo do mestre só é criado no primeiro acesso à interface de mestre: quem nunca mestra não ocupa espaço à toa.</li>
      </ul>
      <h2>Perfil</h2>
      <ul>
        <li>Toque no seu nome, no topo, para abrir o menu do perfil: <strong>Editar perfil</strong> ou <strong>Sair</strong>.</li>
        <li>As páginas da interface ficam na <strong>barra lateral</strong>; no celular, abra pelo botão de menu no canto do topo.</li>
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
      <h2>Arquétipos e subclasses</h2>
      <p>
        Algumas classes são <strong>subclasses</strong> de um <strong>arquétipo</strong>: uma ideia geral que se divide em
        caminhos diferentes. O arquétipo só tem nome e descrição; quem o jogador escolhe é a subclasse.
      </p>
      <Destaque titulo="Exemplo">
        Arquétipo <strong>Bruxa</strong>, com as subclasses <strong>Bruxa elemental</strong> e <strong>Bruxa assombrosa</strong>.
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
      <h2>Arquétipos de raça e sub-raças</h2>
      <p>
        Como nas classes, um <strong>arquétipo de raça</strong> é uma ideia geral (só nome e descrição) que se divide em{" "}
        <strong>sub-raças</strong>. O jogador escolhe a sub-raça. Ex.: <strong>Elfo</strong>, com Elfo da floresta e Elfo sombrio, cada
        uma com seu deslocamento e suas perícias.
      </p>
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
          [
            <span key="e" className="regra__inline"><Zap size={14} aria-hidden /> Esforço</span>,
            "A disposição para ir além: cada ponto gasto antes de um teste vale um dado extra.",
            <strong key="e0">Cansaço (status Cansado).</strong>,
          ],
        ]}
      />
      <Destaque tipo="aviso" titulo="Cuidado com a mana">
        Gastar mana em cartas é poderoso, mas ela também é a vida do personagem. Quem zera a mana morre, mesmo com a vida cheia.
      </Destaque>
      <ul>
        <li>O máximo começa no valor base da classe e sobe +{g.pontosVida} de vida, +{g.pontosMana} de mana e +{g.pontosEsforco} de esforço a cada nível.</li>
        <li>Uma ficha nova começa com tudo cheio.</li>
        <li>Durante a sessão, jogador e mestre ajustam os valores atuais (dá para tirar ou somar vários pontos de uma vez). Eles nunca passam do máximo nem ficam abaixo de zero.</li>
        <li>A <strong>vida</strong> o jogador só diminui; aumentar (curar) é decisão do mestre.</li>
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
      <p>NPCs e criaturas também recebem status, aplicados pelo mestre na ficha deles.</p>
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
      <h2>Pontos de atributo</h2>
      <ul>
        <li>Ao criar a ficha, o jogador distribui <strong>{f.pontosAtributoIniciais} pontos</strong> entre os atributos do grupo. Um atributo pode ficar com 0.</li>
        <li>Cada ponto é um <strong>dado de {r.teste.ladosDoDado} faces</strong> nos testes daquele atributo.</li>
      </ul>
      <p>
        Como os dados viram resultado está em <Link to="/docs/testes">Testes, DT e esforço</Link>.
      </p>
    </>
  );
}

export function Testes() {
  const t = useRegras().teste;
  const d = "d" + t.ladosDoDado;
  const maxComZero = Math.floor(t.ladosDoDado / t.divisorComAtributoZero);
  const custo = t.esforcoPorDadoExtra === 1 ? "1 ponto" : t.esforcoPorDadoExtra + " pontos";
  return (
    <>
      <p>Toda ação arriscada vira um <strong>teste</strong>. O mestre guia assim:</p>
      <Passos
        passos={[
          { titulo: "O mestre diz o atributo, a perícia e a DT", texto: "Ex.: pular o muro é Capacidade física + Atletismo, DT 15. A DT é o número que precisa ser alcançado." },
          { titulo: "O jogador rola 1 " + d + " por ponto no atributo", texto: "2 pontos em Capacidade física = 2" + d + "." },
          { titulo: "Fica com o maior dado", texto: "Os outros dados não somam: servem para aumentar a chance de um resultado alto." },
          { titulo: "Soma o bônus da perícia, se tiver", texto: "Qualquer personagem pode testar qualquer perícia; quem não tem a perícia soma 0." },
          { titulo: "Total maior ou igual à DT = sucesso", texto: "Abaixo da DT, a ação falha (ou sai com consequências, se o mestre quiser)." },
        ]}
      />
      <Destaque titulo="Exemplo">
        Capacidade física 2 e Atletismo +5. O jogador rola 2{d} e tira 10 e 15. Fica com o 15 e soma 5: total <strong>20</strong>.
      </Destaque>
      <h2>Atributo com 0 pontos</h2>
      <p>
        Quem tem 0 no atributo rola sempre <strong>apenas {t.dadosComAtributoZero} {d}</strong>, e o resultado vale a <strong>metade</strong>{" "}
        (arredondada para baixo), antes de somar a perícia. Ex.: tirou 15, vale 7. Com 0 pontos o dado nunca passa de {maxComZero}.
      </p>
      <h2>Esforço: dados extras</h2>
      <p>
        Antes de rolar, o jogador pode gastar <strong>pontos de esforço</strong>: cada {custo} dá <strong>+1 {d}</strong>. Quem rolaria 2{d}{" "}
        rola 3{d} gastando {custo} de esforço.
        {!t.esforcoComAtributoZero && " Com 0 no atributo não dá para comprar dados: continua sendo 1 dado pela metade."}
      </p>
      <Destaque tipo="aviso" titulo="Esforço acaba">
        Esforço em 0 deixa o personagem <strong>Cansado</strong>. Guarde para os testes que importam.
      </Destaque>
      <h2>DT: a faixa de sucesso e falha</h2>
      <p>
        A <strong>DT</strong> (dificuldade do teste) é livre: o mestre define na hora, conforme a cena. Não existe tabela obrigatória. A
        tabela abaixo mostra a chance de alcançar cada DT só com os dados (sem bônus de perícia), para ajudar a escolher:
      </p>
      <Tabela
        cabecalho={["DT", ...(t.chances[0]?.chances ?? []).map((c) => (c.pontos === 0 ? "0 pontos" : c.pontos + d))]}
        linhas={t.chances.map((linha) => ["DT " + linha.dt, ...linha.chances.map((c) => pct(c.chance))])}
      />
      <p className="pagina__subtitulo">Cada ponto de bônus de perícia funciona como 1 a menos na DT.</p>
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
          ["Tipo de efeito", "Escolhido de uma lista fixa (veja abaixo)."],
          ["Efeito", "O que a carta causa."],
          ["Perícia do teste (opcional)", "Qual perícia o personagem testa para usar a carta. A ficha mostra o teste pronto daquele personagem (ex.: Luta 2d20 + 5)."],
          ["Condição (opcional)", "O que precisa acontecer para poder usar. Ex.: ter acertado dois ataques seguidos."],
          ["Limite (opcional)", "Quantas vezes ou quando pode ser usada. Ex.: 1 vez por sessão."],
          [<span key="m" className="regra__inline"><Droplet size={14} aria-hidden /> Custo de mana</span>, "Quanta mana gasta. Muitas cartas não custam nada."],
          [<span key="n" className="regra__inline"><Sparkles size={14} aria-hidden /> Nível necessário</span>, "A partir de qual nível a carta fica disponível."],
        ]}
      />
      <p>No nível N o personagem tem <strong>todas</strong> as cartas da classe com nível necessário até N.</p>
      <h2>Tipos de efeito</h2>
      <Tabela
        cabecalho={["Tipo", "O que faz"]}
        linhas={LISTA_TIPOS_EFEITO.map((t) => {
          const { Icone, rotulo, descricao } = TIPOS_EFEITO[t];
          return [<span key={t} className="regra__inline"><Icone size={14} aria-hidden /> {rotulo}</span>, descricao];
        })}
      />
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
      <Destaque tipo="aviso" titulo="Não existe descer de nível">
        Subir de nível é definitivo. O mestre deve ter cuidado antes de confirmar.
      </Destaque>
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
        <li>Cada item ocupa <strong>1 ou mais espaços</strong> (um arco longo pode ocupar 2, uma poção 1).</li>
        <li>Os itens são criados pelo <strong>mestre</strong>, que entrega a um personagem ou deixa vago no grupo.</li>
        <li>O jogador pode <strong>passar</strong> um item para outro membro do grupo (se couber), <strong>descartar</strong> (fica vago no grupo) ou pegar um item vago.</li>
      </ul>
      <h2>Categorias</h2>
      <p>O sistema traz 4 categorias, e cada mestre pode criar as suas (com nome, descrição e ícone), como Relíquias, Munição ou Ervas.</p>
      <Tabela
        cabecalho={["Categoria do sistema", "O que costuma ser"]}
        linhas={[
          ["espada", "Armas", "Espadas, arcos, cajados: o que se usa para lutar."],
          ["joia", "Artefatos", "Objetos especiais, mágicos ou raros."],
          ["caneca", "Taverna", "Comidas, bebidas, poções e outros consumíveis."],
          ["livro", "Sebo", "Livros, mapas, pergaminhos e achados usados."],
        ].map(([icone, nome, descricao]) => {
          const Icone = iconeDe(icone);
          return [<span key={nome} className="regra__inline"><Icone size={14} aria-hidden /> {nome}</span>, descricao];
        })}
      />
      <h2>Usar um item</h2>
      <ul>
        <li>Cada item pode ter um <strong>efeito ao usar</strong> (ex.: recupera 2d4 de vida). O app registra o uso; a mesa aplica o efeito.</li>
        <li>
          <span className="regra__inline"><Repeat size={14} aria-hidden /> Itens com <strong>usos limitados</strong></span> perdem 1 uso a cada vez
          e somem quando os usos acabam. Itens sem limite podem ser usados à vontade.
        </li>
        <li>
          Alguns itens têm <strong>pré-requisito para saber usar</strong>: uma classe (só arqueiros), uma perícia (só quem tem Pontaria) ou
          uma condição em texto. Quem não cumpre pode carregar o item, mas não usa.
        </li>
      </ul>
      <Destaque tipo="dica" titulo="Na prática">
        <span className="regra__inline"><Package size={14} aria-hidden /> O mestre lança "Poção de vida" (2 usos) para o ladino.</span> O
        ladino usa uma vez (resta 1), passa para o guerreiro, que usa a última: a poção acaba.
      </Destaque>
    </>
  );
}

export function Criaturas() {
  const { ganhoPorNivel: g } = useRegras().progressao;
  return (
    <>
      <p>
        <span className="regra__inline"><PawPrint size={14} aria-hidden /> Criaturas</span> (monstros, animais, inimigos) ficam no{" "}
        <strong>bestiário</strong> do mestre e funcionam como classes:
      </p>
      <ul>
        <li>vida, mana e esforço base, perícias com modificador e <strong>dados por atributo</strong> (testam como os personagens);</li>
        <li>cartas de habilidade com nível necessário e aprimoramentos;</li>
        <li>a mesma progressão: cada nível acima do 1 dá +{g.pontosVida} de vida, +{g.pontosMana} de mana, +{g.pontosEsforco} de esforço e as cartas daquele nível.</li>
      </ul>
      <p>
        Durante a sessão, o mestre <strong>invoca</strong> criaturas no grupo, no nível que quiser, e acompanha a ficha de cada
        uma (o posicionamento fica no grid físico da mesa). Uma criatura some do grupo quando o mestre remove (fugiu, sumiu) ou sozinha quando{" "}
        <strong>morre</strong>: vida ou mana em 0, a mesma regra dos personagens.
      </p>
      <p>Como as classes, uma criatura pode ser uma <strong>forma</strong> de um arquétipo de criatura (ex.: Lobo, com Lobo das neves e Lobo alfa).</p>
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
