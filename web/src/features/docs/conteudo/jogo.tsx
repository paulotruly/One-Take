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
  const { conta } = useRegras();
  return (
    <>
      <p>
        Uma conta serve para as duas coisas: <strong>jogar e mestrar</strong>. Ao <Link to="/cadastro">criar a conta</Link>, você escolhe a
        interface com que começa. Você entra com <strong>nome de usuário e senha</strong>; ninguém precisa informar e-mail. Também é
        pedida a data de nascimento: é preciso ter pelo menos {conta.idadeMinima} anos.
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
        <li>Dá para mudar o <strong>nome de usuário</strong> (usado para entrar e exibido como @usuario), o nome de exibição e a foto (link de uma imagem).</li>
        <li>Se trocar o nome de usuário, passe a entrar com o novo.</li>
      </ul>
      <h2>Senha, dados e exclusão</h2>
      <ul>
        <li>Tudo isso fica em <strong>Configurações da conta</strong> (no menu do perfil, no topo). Editar perfil é só nome de usuário, nome e foto.</li>
        <li><strong>Código de recuperação</strong>: ao criar a conta, o app mostra um código uma única vez. Guarde: é com ele que você troca
          a senha se esquecer. Em Configurações da conta dá para gerar um código novo (com a senha); o anterior deixa de valer.</li>
        <li><strong>Esqueceu a senha?</strong> Use o link na tela de login: informe o nome de usuário, o código e a senha nova. Depois da
          troca, o app mostra um código novo, e as sessões abertas em outros aparelhos são encerradas.</li>
        <li><strong>Baixar meus dados</strong>: a seção Seus dados gera um arquivo com tudo o que está na sua conta, a qualquer momento.</li>
        <li><strong>Excluir a conta</strong>: no fim das configurações, informe a senha e digite o seu nome de usuário. A exclusão é imediata e
          definitiva. Os jogadores dos seus grupos ficam com uma cópia arquivada das fichas deles.</li>
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
        <li>A <strong>vida</strong> o jogador só diminui; aumentar (curar) é com o mestre: o jogador usa a carta ou o item, rola o dado e o mestre lança a cura na ficha.</li>
        <li>Quando um recurso chega a 0, a ficha mostra um <strong>alerta</strong> (veja <Link to="/docs/status">Status</Link>). Vida ou mana em 0 é morte, sem volta.</li>
      </ul>
      <h2>Recuperar vida, mana e esforço</h2>
      <p>
        A recuperação acontece nos <strong>interlúdios</strong> da sessão (as pausas entre uma cena e outra): o personagem se alimenta,
        descansa, usa itens ou habilidades. Quanto cada coisa recupera é o mestre quem diz (ou está no efeito do item ou da carta).
      </p>
      <Destaque tipo="aviso" titulo="Carta que zera a mana">
        Dá para usar uma carta que custa toda a mana que resta, mas mana em 0 é morte. Fique de olho no custo antes de usar.
      </Destaque>
    </>
  );
}

export function StatusTopico() {
  const r = useRegras();
  const automaticos = r.statusBase.filter((s) => s.gatilho);
  const manuais = r.statusBase.filter((s) => !s.gatilho);
  const tipo = { BUFF: "Benefício", DEBUFF: "Prejuízo", MISTO: "Misto" } as const;
  const quando: Record<string, string> = { VIDA_ZERO: "Vida em 0", MANA_ZERO: "Mana em 0", ESFORCO_ZERO: "Esforço em 0" };
  return (
    <>
      <p>
        Status são condições e emoções do personagem: cansado, assustado, inspirado. Cada status tem um <strong>efeito</strong> que
        ajuda ou atrapalha. O app <strong>não muda nenhum número</strong> sozinho: ele mostra um alerta na ficha de quem está com o
        status, e a mesa aplica o efeito.
      </p>
      <h2>Automáticos</h2>
      <p>Aparecem sozinhos quando um recurso chega a 0.</p>
      <Tabela cabecalho={["Status", "Quando", "Efeito"]} linhas={automaticos.map((s) => [<strong key={s.nome}>{s.nome}</strong>, quando[s.gatilho ?? ""] ?? "", s.efeito])} />
      <h2>Aplicados pelo mestre</h2>
      <p>Durante a sessão, o mestre aplica e remove estes status na ficha de cada personagem. Uma carta de habilidade pode indicar qual status ela ativa.</p>
      <Tabela cabecalho={["Status", "Tipo", "Efeito"]} linhas={manuais.map((s) => [<strong key={s.nome}>{s.nome}</strong>, tipo[s.tipo], s.efeito])} />
      <p>NPCs e criaturas também recebem status, aplicados pelo mestre na ficha deles.</p>
      <h2>Quanto tempo dura</h2>
      <ul>
        <li>Depende de onde o status veio (a carta, o item ou a cena dizem). Ao aplicar, o mestre pode anotar quantos <strong>turnos</strong> ele dura.</li>
        <li>A cada turno, o mestre tira 1 (botão -1 no status). Quando chega a 0, o status sai sozinho. Sem turnos anotados, dura até o mestre tirar.</li>
        <li>Status diferentes <strong>se acumulam</strong>: os efeitos somam (ex.: Inspirado e Confiante juntos dão +10 num teste de Carisma).</li>
        <li>Quando uma carta <strong>ativa um status</strong>, ele vai sempre para o <strong>alvo</strong> da carta.</li>
      </ul>
      <h2>Personalizável</h2>
      <p>Os status acima são os do kit básico, verificados pelo administrador do One-Take. Nenhum status é fixo:</p>
      <ul>
        <li>O mestre pode criar status próprios, com nome, tipo e efeito, e editar os seus (até os automáticos, que só não podem ser excluídos).</li>
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
      <p>Atributos são as capacidades gerais do personagem e agrupam as perícias. Os atributos do kit básico, verificados pelo administrador do One-Take, são:</p>
      <Tabela cabecalho={["Atributo", "Descrição"]} linhas={r.atributosBase.map((a) => [<strong key={a.nome}>{a.nome}</strong>, a.descricao])} />
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
        rola 3{d} gastando {custo} de esforço. No máximo <strong>{t.esforcoMaximoPorRodada} {t.esforcoMaximoPorRodada === 1 ? "ponto" : "pontos"} de esforço por rodada</strong>,
        e isso vale também para a defesa.
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
  const { defesas } = useRegras();
  return (
    <>
      <p>Cada classe tem uma <strong>cartela</strong>: o deck de cartas de habilidade dela. Uma carta tem:</p>
      <Tabela
        cabecalho={["Campo", "O que significa"]}
        linhas={[
          ["Título e descrição", "O nome e o sabor da carta. Texto entre **dois asteriscos** aparece em negrito."],
          ["Tipo de efeito", "Escolhido de uma lista fixa (veja abaixo)."],
          ["Efeito", "O que a carta causa."],
          ["Perícia do teste (opcional)", "Qual perícia o personagem testa para usar a carta. A ficha mostra o teste pronto daquele personagem (ex.: Luta 2d20 + 5)."],
          ["Defesa do alvo (opcional)", "Perícias que o alvo pode usar para se defender da carta (uma ou mais). Ao escolher a perícia do teste, as defesas da tabela abaixo são marcadas sozinhas; o mestre ajusta."],
          ["Condição (opcional)", "O que precisa acontecer para poder usar. Ex.: ter acertado dois ataques seguidos."],
          ["Limite (opcional)", "Quantas vezes pode ser usada: N vezes por combate ou N vezes por sessão. Sem limite, à vontade."],
          [<span key="m" className="regra__inline"><Droplet size={14} aria-hidden /> Custo de mana</span>, "Quanta mana gasta. Muitas cartas não custam nada."],
          [<span key="n" className="regra__inline"><Sparkles size={14} aria-hidden /> Nível necessário</span>, "A partir de qual nível a carta fica disponível."],
        ]}
      />
      <p>No nível N o personagem tem <strong>todas</strong> as cartas da classe com nível necessário até N.</p>
      <h2>Defesa do alvo</h2>
      <p>Contra cada perícia de ataque, o alvo se defende com a perícia que combina com a situação:</p>
      <Tabela
        cabecalho={["Ataque", "Defesa", "Quando"]}
        linhas={defesas.map((d) => [d.ataque.nome, d.defesa.nome, d.quando])}
      />
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
        Uma mesma carta pode ter <strong>aprimoramentos</strong>: a partir de um nível, ela vira outra versão de si mesma, com título,
        descrição, efeito, custo de mana, condição, limite e status próprios (o que não mudou fica igual). Também dá para tirar coisas,
        como o limite de uso. A ficha mostra sempre a versão do nível do personagem, com o selo "Aprimorada" e o próximo nível em que
        a carta muda.
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
      <h2>O mesmo personagem em outra mesa</h2>
      <p>
        Cada mesa é uma sessão. Para subir de nível, o personagem precisa participar de mais mesas. Ao entrar num grupo novo, escolha o
        personagem em vez de criar um novo:
      </p>
      <ul>
        <li>Ele vem com nome, história, imagem, classe, raça e nível. A classe e a raça precisam estar liberadas na mesa nova.</li>
        <li>Começa com vida, mana e esforço cheios e <strong>sem itens</strong> (os itens ficam na mesa antiga).</li>
        <li>Os pontos de perícia de todos os níveis voltam para você gastar nas perícias da mesa nova. Os atributos são distribuídos de novo.</li>
        <li>A ficha da mesa antiga vira uma cópia arquivada. Peça ao mestre para subir o nível antes de levar o personagem.</li>
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
        <li>Cada item ocupa <strong>1 ou mais espaços</strong> (um arco longo pode ocupar 2, uma poção 1).</li>
        <li>Os itens são criados pelo <strong>mestre</strong>, que entrega a um personagem ou deixa vago no grupo.</li>
        <li>O jogador pode <strong>passar</strong> um item para outro membro do grupo (se couber), <strong>descartar</strong> (fica vago no grupo) ou pegar um item vago.</li>
      </ul>
      <h2>Categorias</h2>
      <p>O kit básico traz 4 categorias, verificadas pelo administrador do One-Take, e cada mestre pode criar as suas (com nome, descrição e ícone), como Relíquias, Munição ou Ervas.</p>
      <Tabela
        cabecalho={["Categoria do kit básico", "O que costuma ser"]}
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

export function Combate() {
  const t = useRegras().teste;
  return (
    <>
      <p>
        O combate acontece na mesa, num grid físico. O app guarda as fichas (vida, mana, esforço, status) e mostra o teste pronto de
        cada carta; a mesa rola os dados e aplica o resultado. Estas regras valem em todo grupo. As{" "}
        <Link to="/docs/combate-padrao">regras padrão de combate</Link> (grid, alcance, intervenção e outras) o mestre pode desligar e trocar.
      </p>
      <h2>Ordem e turno</h2>
      <ul>
        <li>A <strong>Iniciativa</strong> define a ordem dos turnos: no início do combate, cada um testa Capacidade física + Iniciativa e o maior começa.</li>
        <li>Cada turno é <strong>1 movimento + 1 ação</strong>. Toda ação que não é movimento é ação (atacar, usar carta, usar item). Não dá para trocar um pelo outro.</li>
        <li>Cartas só são usadas no <strong>próprio turno</strong>. A exceção é a Intervenção defensiva, uma regra padrão que deixa defender um aliado no turno de outra pessoa.</li>
        <li>Quando um combate começa e termina é o mestre quem define. É isso que reinicia as cartas com limite "por combate".</li>
      </ul>
      <h2>Ataque contra defesa</h2>
      <Passos
        passos={[
          { titulo: "O atacante testa", texto: "Usa a carta (ou ataca) e rola o teste dela: dados do atributo + a perícia do teste." },
          { titulo: "O alvo se defende", texto: "Rola os dados do atributo da perícia de defesa + o bônus dela, se tiver (veja a tabela de defesa em Habilidades). Pode gastar esforço." },
          { titulo: "Compara os totais", texto: "Ataque maior ou igual à defesa: acerta. Empate é do atacante." },
          { titulo: "Dano", texto: "Se acertou, rola o dano da carta e tira da vida do alvo. Uma defesa bem-sucedida evita todo o dano." },
        ]}
      />
      <p>
        O mestre pode usar uma <strong>DT</strong> no lugar da defesa (ex.: um alvo parado, um objeto). Nesse caso ele diz a DT em voz
        alta, antes da rolagem.
      </p>
      <h2>Esforço</h2>
      <p>
        Cada ponto de esforço gasto antes de um teste dá +1 d{t.ladosDoDado}, no máximo {t.esforcoMaximoPorRodada}{" "}
        {t.esforcoMaximoPorRodada === 1 ? "ponto" : "pontos"} por rodada, no ataque ou na defesa.
      </p>
      <h2>Cura, morte e recuperação</h2>
      <ul>
        <li><strong>Cura</strong>: o jogador usa a carta ou o item, rola o dado e o mestre lança a cura na ficha (a vida só o mestre aumenta).</li>
        <li><strong>Morte</strong>: vida ou mana em 0, o personagem morreu. Não há volta.</li>
        <li>Uma carta pode custar toda a mana que resta. Dá para usar, mas a mana em 0 mata: fique atento.</li>
        <li><strong>Recuperação</strong>: nos interlúdios da sessão, comendo, descansando, com itens ou habilidades.</li>
      </ul>
      <h2>Status no combate</h2>
      <ul>
        <li>O status que uma carta ativa vai sempre para o <strong>alvo</strong>.</li>
        <li>O mestre anota quantos turnos o status dura e tira 1 a cada turno; em 0, ele sai.</li>
        <li>Status se acumulam: os efeitos somam.</li>
        <li>"Perícias de defesa" são as da categoria Defesa: Reflexos, Resistência e Vontade.</li>
      </ul>
    </>
  );
}

export function CombatePadrao() {
  const { regrasPadrao } = useRegras();
  return (
    <>
      <p>
        Estas regras valem em todo grupo, a menos que o mestre desligue alguma (em Editar grupo, seção Regras de combate). O mestre
        também pode criar regras próprias na página do grupo. Os jogadores veem as regras que valem na própria ficha, em Regras da mesa.
      </p>
      {regrasPadrao.map((r) => (
        <section key={r.slug} id={r.slug}>
          <h2>{r.titulo}</h2>
          {r.texto.map((t, i) => <p key={i}>{t}</p>)}
        </section>
      ))}
    </>
  );
}
