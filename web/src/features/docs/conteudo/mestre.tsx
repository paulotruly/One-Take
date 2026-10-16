// Tópicos da documentação: guia do mestre, guia do jogador e referência.
import { Activity, Backpack, BadgeCheck, Copy, Footprints, Layers, ListChecks, Lock, PawPrint, Shield, UserRound } from "lucide-react";
import { Link } from "react-router";
import { Cartoes, Destaque, Passos, Tabela } from "../../../components/texto/Manual";
import { useRegras } from "../regras";

// ---------- Guia do mestre ----------

export function MestreVisaoGeral() {
  return (
    <>
      <p>O mestre cria o mundo e conduz o grupo. No app, ele trabalha nestas áreas da barra lateral (no celular, no botão de menu do topo):</p>
      <Cartoes
        itens={[
          { Icone: Shield, titulo: "Grupos", texto: "Seus RPGs: código de entrada, membros, fichas e itens." },
          { Icone: Layers, titulo: "Classes", texto: "Os heróis prontos: recursos, cartela de cartas e perícias." },
          { Icone: Footprints, titulo: "Raças", texto: "Origens: deslocamento e perícias de base." },
          { Icone: UserRound, titulo: "NPCs", texto: "Personagens do mestre com ficha completa e inventário." },
          { Icone: PawPrint, titulo: "Bestiário", texto: "Criaturas para invocar nos grupos, montadas como classes." },
          { Icone: Backpack, titulo: "Itens", texto: "Armas, artefatos, taverna e sebo, sempre à mão para lançar." },
          { Icone: ListChecks, titulo: "Perícias", texto: "Seu catálogo de perícias e atributos." },
          { Icone: Activity, titulo: "Status", texto: "Condições e emoções que aparecem como alerta nas fichas." },
        ]}
      />
      <p>
        Tudo o que você cria é <strong>seu</strong>: outros mestres não veem nem alteram. Não há conteúdo fixo: o que é compartilhado
        com todos é o conteúdo <strong>verificado</strong> pelo administrador do One-Take (como o kit básico, com atributos e status),
        que você usa como está ou duplica para mudar.
      </p>
      <p>
        A interface de mestre é ativada na conta (no cadastro ou depois, em <strong>Mestrar</strong> no topo). A mesma conta continua
        jogando: use <strong>Jogar</strong> no topo para ir às suas fichas.
      </p>
    </>
  );
}

export function MestrePrimeiraSessao() {
  return (
    <Passos
      passos={[
        { titulo: "Ative a interface de mestre", texto: <>No <Link to="/cadastro">cadastro</Link>, escolha "Mestre"; ou, numa conta de jogador, toque em Mestrar no topo.</> },
        { titulo: "Revise o catálogo de perícias", texto: <>Em Perícias você já recebe 18 perícias base. Ajuste, crie novas ou crie um atributo novo. Veja <Link to="/docs/mestre-catalogo">Perícias e atributos</Link>.</> },
        { titulo: "Crie pelo menos uma raça", texto: <>Título, descrição, deslocamento e perícias de base. Veja <Link to="/docs/mestre-racas">Criando raças</Link>.</> },
        { titulo: "Escolha ou crie as classes", texto: <>Use as verificadas, duplique para adaptar ou crie do zero. Veja <Link to="/docs/mestre-classes">Criando classes e cartas</Link>.</> },
        { titulo: "Crie o grupo", texto: <>Informações e o que vale no grupo. Veja <Link to="/docs/mestre-grupos">Montando um grupo</Link>.</> },
        { titulo: "Compartilhe o código", texto: "Na página do grupo aparece o código de 6 caracteres. Os jogadores digitam em Minhas fichas." },
        { titulo: "Prepare itens e criaturas (opcional)", texto: <>Em Itens e Bestiário. Veja <Link to="/docs/mestre-itens">Itens</Link> e <Link to="/docs/mestre-bestiario">Bestiário</Link>.</> },
        { titulo: "Conduza a sessão", texto: <>Peça testes, aplique status, lance itens e invoque criaturas. Veja <Link to="/docs/mestre-sessao">Durante a sessão</Link>.</> },
        { titulo: "No fim, suba o nível", texto: <>Na ficha de cada participante, use Subir nível. Veja <Link to="/docs/mestre-subir-nivel">Subir de nível</Link>.</> },
      ]}
    />
  );
}

export function MestreCatalogo() {
  return (
    <>
      <p>
        Na primeira vez que você entra como mestre, recebe uma <strong>cópia própria</strong> das 18 perícias base. A partir daí o
        catálogo é seu: mudanças não afetam outros mestres.
      </p>
      <h2>Atributos</h2>
      <Tabela
        cabecalho={["Tipo", "O que dá para fazer"]}
        linhas={[
          [<span key="f" className="regra__inline"><BadgeCheck size={14} aria-hidden /> Do kit básico</span>, "Capacidade física, Carisma e Conhecimento. Verificados pelo administrador do One-Take: só leitura para você; use no grupo como estão."],
          ["Seus", "Crie quantos quiser (ex.: Sanidade, Tecnologia). Pode editar e excluir."],
        ]}
      />
      <p>Um atributo só pode ser excluído quando não tiver perícias. Mova as perícias para outro atributo antes.</p>
      <h2>Perícias</h2>
      <ul>
        <li>Cada perícia tem nome, descrição, <strong>atributo</strong> e <strong>categoria</strong> (corpo a corpo, magia, pontaria e outras).</li>
        <li>Você pode mudar uma perícia de atributo a qualquer momento.</li>
        <li>A lista mostra em quantas classes e raças cada perícia é usada. Editar a perícia reflete em todas elas.</li>
        <li>Excluir uma perícia tira ela das suas classes e raças. Se alguma ficha usa a perícia, a exclusão é bloqueada.</li>
      </ul>
    </>
  );
}

export function MestreRacas() {
  return (
    <>
      <ul>
        <li>Em <strong>Raças &gt; Nova raça</strong>: título, descrição, imagem (link) e <strong>deslocamento</strong> em quadrados por turno.</li>
        <li>Na página da raça, em <strong>Perícias de base</strong>, adicione perícias do catálogo com a quantidade de pontos. Elas somam na ficha de quem escolher a raça.</li>
        <li>Não há raças fixas: cada mestre cria as suas. Um grupo precisa de pelo menos uma raça liberada.</li>
        <li>
          <strong>Arquétipos de raça</strong>: em Raças, crie um arquétipo (ex.: Elfo) e use <strong>Sub-raça</strong> no bloco dele, ou escolha o
          arquétipo no campo "Arquétipo de raça" de qualquer raça. Excluir o arquétipo não apaga as sub-raças.
        </li>
      </ul>
      <Destaque titulo="Exemplo">Elfo: deslocamento 9, Percepção +2, Furtividade +1.</Destaque>
    </>
  );
}

export function MestreClasses() {
  return (
    <>
      <h2>Classes verificadas e classes suas</h2>
      <Tabela
        cabecalho={["Opção", "Como funciona"]}
        linhas={[
          [<span key="f" className="regra__inline"><Lock size={14} aria-hidden /> Usar uma verificada</span>, "Verificadas pelo administrador do One-Take: somente leitura, e podem ser liberadas nos seus grupos como estão."],
          [<span key="d" className="regra__inline"><Copy size={14} aria-hidden /> Duplicar</span>, "Cria uma cópia sua com cartas e perícias, para editar à vontade."],
          ["Criar do zero", "Nova classe cria só a classe; as cartas e perícias você adiciona depois, na página dela."],
        ]}
      />
      <h2>Arquétipos</h2>
      <ul>
        <li>Em <strong>Classes &gt; Novo arquétipo</strong>: título e descrição (ex.: Bruxa).</li>
        <li>No bloco do arquétipo, use <strong>Subclasse</strong> para criar uma classe já ligada a ele, ou escolha o arquétipo no campo "Arquétipo" de qualquer classe sua.</li>
        <li>O jogador escolhe a subclasse; na criação da ficha elas aparecem agrupadas pelo arquétipo.</li>
        <li>Excluir o arquétipo não apaga as subclasses: elas viram classes avulsas.</li>
      </ul>
      <h2>O que configurar</h2>
      <Tabela
        cabecalho={["Parte", "Onde", "Detalhes"]}
        linhas={[
          ["Grupo tático, descrição, imagem", "Editar classe", "Combatente, Vanguardista ou Suporte."],
          ["Vida, mana e esforço base", "Editar classe", "Valores do nível 1; nenhum pode ser zero."],
          ["Cartas de habilidade", "Gerenciar habilidades", "Crie, edite, reordene e exclua. Defina tipo de efeito (lista fixa), nível necessário e custo de mana. As cartas aparecem pequenas em grade; toque numa para ver tudo."],
          ["Perícias", "Página da classe", "Escolha do seu catálogo e defina o modificador da classe."],
        ]}
      />
      <p>
        A página da classe mostra a <strong>prévia de progressão</strong>: vida, mana, esforço e cartas disponíveis em cada nível. Use
        para equilibrar a classe antes de liberar num grupo.
      </p>
      <h2>Aprimorar uma carta</h2>
      <p>
        Em <strong>Gerenciar habilidades</strong>, use <strong>Aprimorar</strong> na carta e crie um aprimoramento: o nível a partir do
        qual ela vale e a carta inteira naquele nível. O formulário já vem preenchido com a versão anterior; mude o que quiser
        (título, descrição do nível, efeito, custo de mana, condição, limite ou status), inclusive tirar o limite ou o status. Dá para
        ter vários aprimoramentos na mesma carta, um por nível; a prévia de progressão marca em que nível cada carta é aprimorada.
      </p>
      <Destaque tipo="dica" titulo="Equilíbrio">
        Cartas fortes ficam melhores com nível necessário maior ou com custo de mana. Assim o personagem cresce sessão a sessão.
      </Destaque>
    </>
  );
}

export function MestreKits() {
  return (
    <>
      <p>
        Um <strong>kit de RPG</strong> junta o conteúdo de uma aventura: classes, raças, atributos, perícias, status, itens do catálogo,
        criaturas e NPCs. Crie kits no menu <strong>Kits de RPG</strong> e marque, no formulário de cada coisa, em quais kits ela entra.
      </p>
      <Tabela
        cabecalho={["Situação", "O que acontece"]}
        linhas={[
          ["Sem kit (geral)", "Aparece em Todos (sem kit ativo) e pode ser usado em qualquer grupo. É o padrão."],
          ["Em um ou mais kits", "Aparece só com esses kits. A mesma coisa pode estar em vários kits (ex.: um Lobo no kit de terror e no de fantasia)."],
          ["Kit ativo", "Escolhido no topo da navegação lateral. As listas mostram só o que é do kit, e tudo o que você criar já entra nele. Para ver o geral, escolha Todos."],
          ["Grupo com kit", "Ao montar o grupo, escolha o kit: ele já marca as classes, raças, perícias e status do kit (você ajusta). Itens, criaturas e NPCs mostrados no grupo seguem o kit."],
          ["Ver o que tem", "Em Kits de RPG, toque no nome do kit (ou em Ver o que tem): a tela lista tudo o que está nele, por tipo, com link para cada coisa e os grupos que usam o kit."],
        ]}
      />
      <Destaque tipo="dica" titulo="Excluir um kit não apaga nada">
        O que estava só nele vira geral, e os grupos que usavam o kit ficam sem kit. O que já foi liberado nos grupos continua liberado.
      </Destaque>
    </>
  );
}

export function MestreVerificados() {
  return (
    <>
      <p>
        O <strong>conteúdo verificado</strong> é o material pronto do One-Take: classes, raças, atributos, perícias, status, categorias de
        item, itens, criaturas, NPCs, arquétipos e kits de RPG com o selo <strong>Verificado</strong>. Ele aparece para todo mestre, só
        leitura e sempre atualizado. Num <strong>kit verificado</strong>, tudo o que está dentro dele também é verificado.
      </p>
      <Tabela
        cabecalho={["Você quer", "Como"]}
        linhas={[
          ["Usar", "Libere no grupo, lance o item, invoque a criatura ou escolha a raça e a classe num NPC, como faria com o que é seu."],
          ["Usar um kit verificado", "Em Kits de RPG, escolha Usar este kit (as telas mostram só o conteúdo dele) ou escolha o kit ao montar o grupo. O que você criar fica fora dele."],
          ["Mudar", "Duplique a classe, a criatura ou o NPC para ter a sua versão. Perícias: Copiar para o meu catálogo, em Perícias."],
          ["Não ver", "Em Configurações da conta, marque Ocultar o conteúdo verificado. O que já está nos seus grupos e fichas continua funcionando."],
        ]}
      />
      <Destaque tipo="dica" titulo="Com um kit ativo">
        As telas mostram o que está no kit ativo, verificado ou não. Para ver todo o conteúdo verificado, escolha Todos.
      </Destaque>
    </>
  );
}

export function MestreBestiario() {
  return (
    <>
      <p>
        Em <strong>Bestiário</strong> você monta as criaturas como monta classes, e com <strong>dados por atributo</strong> (as criaturas fazem
        testes como os personagens).
      </p>
      <Passos
        passos={[
          { titulo: "Nova criatura", texto: "Título, descrição, imagem, vida/mana/esforço base (nível 1, nenhum zero) e deslocamento." },
          { titulo: "Atributos", texto: "Na página da criatura, use + e - para dar dados (d20) em cada atributo." },
          { titulo: "Perícias", texto: "Escolha do seu catálogo e defina o modificador. A página mostra o teste pronto." },
          { titulo: "Cartas", texto: "A mesma cartela das classes: tipo de efeito, nível necessário, custo, aprimoramentos." },
        ]}
      />
      <ul>
        <li><strong>Nível</strong>: você escolhe ao invocar no grupo. A progressão é a mesma das classes (a prévia aparece na página da criatura).</li>
        <li><strong>Arquétipo de criatura</strong>: uma criatura geral (ex.: Lobo) com formas (Lobo das neves, Lobo alfa).</li>
        <li><strong>Kits de RPG</strong>: em quais kits a criatura aparece (nenhum = geral). Ao invocar, o grupo mostra as do kit dele e as gerais.</li>
        <li><strong>Duplicar</strong> cria uma cópia com cartas, perícias e atributos para fazer variações rápido.</li>
      </ul>
      <Destaque tipo="dica" titulo="Equilíbrio">
        Compare o dano esperado da criatura com a vida dos personagens do mesmo nível. Uma criatura comum não deveria derrubar um personagem em 1 ou 2
        turnos, a não ser que seja um chefe de propósito.
      </Destaque>
    </>
  );
}

export function MestreNpcs() {
  const { ficha: f } = useRegras();
  return (
    <>
      <p>
        Em <strong>NPCs</strong> você cria os personagens do mestre (taverneiros, vilões, aliados). Todo NPC tem <strong>ficha</strong>,
        como os personagens dos jogadores.
      </p>
      <Tabela
        cabecalho={["Parte", "Como funciona"]}
        linhas={[
          ["Raça", "Obrigatória: dá deslocamento e perícias de base."],
          ["Classe", "Opcional. Com classe, o NPC usa a vida/mana/esforço e as cartas dela. Sem classe, é um NPC simples: você define vida, mana e esforço base."],
          ["Nível", "Mesma progressão dos personagens. Você pode mudar à vontade; o valor atual acompanha."],
          ["Atributos e perícias", "Dados por atributo com + e -; perícias da raça e da classe, mais pontos extras que você der. A ficha mostra o teste pronto."],
          ["Inventário", `Mesma capacidade das fichas (${f.inventarioInicial} espaços no nível 1, +${f.inventarioPorNivel} por nível). Dê itens do catálogo, use, entregue a um jogador ou deixe vago num grupo.`],
          ["Kits de RPG", "Em quais kits o NPC aparece (nenhum = geral). A página do grupo mostra os NPCs do kit dele e os gerais."],
        ]}
      />
      <p>Vida ou mana em 0 deixa o NPC morto (a ficha avisa). Excluir um NPC apaga os itens que estão com ele.</p>
    </>
  );
}

export function MestreItens() {
  return (
    <>
      <p>Em <strong>Itens</strong> fica o seu catálogo. Cada item tem:</p>
      <Tabela
        cabecalho={["Campo", "Para quê"]}
        linhas={[
          ["Título, descrição e imagem", "O que o jogador vê."],
          ["Categoria", "Armas, Artefatos, Taverna, Sebo ou uma categoria sua (botão Categorias: nome, descrição e ícone)."],
          ["Efeito ao usar", "O que acontece quando o personagem usa (a mesa aplica)."],
          ["Espaços", "Quantos espaços ocupa no inventário (mínimo 1)."],
          ["Consumo", "Sem limite, ou um número de usos: ao acabar, o item some."],
          ["Pré-requisito", "Classe e/ou perícia exigidas para saber usar, e um requisito em texto. Quem não cumpre carrega, mas não usa."],
          ["Kits de RPG", "Em quais kits o item aparece (nenhum = geral). Ao lançar num grupo, o catálogo mostra o do kit do grupo e o geral."],
        ]}
      />
      <ul>
        <li>Os itens ficam sempre à mão: <strong>Lançar num grupo</strong> no catálogo, ou <strong>Lançar do catálogo</strong> na página do grupo e <strong>Dar item do catálogo</strong> na ficha.</li>
        <li>O item lançado é uma <strong>cópia</strong>: editar o catálogo depois não muda os itens que já estão com os jogadores.</li>
      </ul>
      <Destaque titulo="Exemplo">
        Arco longo (Armas): 2 espaços, sem limite, pré-requisito perícia Pontaria. Poção de vida (Taverna): 1 espaço, 1 uso, efeito
        "recupera 2d4 de vida".
      </Destaque>
    </>
  );
}

export function MestreGrupos() {
  const { ficha: f } = useRegras();
  return (
    <>
      <h2>Informações</h2>
      <ul>
        <li>Título, gênero, sinopse e imagem (link): é o que o jogador vê ao digitar o código.</li>
        <li><strong>Limite de membros</strong>: quantos jogadores podem entrar. Não pode ficar abaixo de quem já entrou.</li>
        <li><strong>Permitir classes repetidas</strong>: desligado, cada classe só pode ser escolhida por um jogador.</li>
        <li>
          <strong>Limite por função</strong>: quantos jogadores podem escolher classes Combatentes, Vanguardistas e Suportes (ex.: no máximo 1
          Vanguardista). Vazio = sem limite; 0 = ninguém daquela função. Não pode ficar abaixo de quantos já escolheram a função; na criação
          da ficha, a classe de uma função cheia aparece bloqueada, com o motivo.
        </li>
      </ul>
      <h2>O que vale neste grupo</h2>
      <ul>
        <li>Marque as <strong>classes</strong> (suas ou verificadas) e as <strong>raças</strong> que os jogadores podem escolher.</li>
        <li>Marque os <strong>atributos</strong>: marcar um atributo leva todas as perícias dele. Depois desmarque perícias específicas que não fazem sentido na aventura.</li>
        <li>Os {f.pontosAtributoIniciais} pontos de atributo (d20) da ficha são distribuídos só entre os atributos marcados.</li>
        <li>Para os jogadores conseguirem criar ficha, o grupo precisa de pelo menos uma classe, uma raça e um atributo.</li>
      </ul>
      <h2>Regras de combate</h2>
      <ul>
        <li>As <Link to="/docs/combate-padrao">regras padrão de combate</Link> valem em todo grupo novo. Em Editar grupo, seção Regras de combate, desmarque as que não quiser nesta mesa.</li>
        <li>Na página do grupo, em Regras de combate, use <strong>Regra da mesa</strong> para criar regras próprias (título e texto). Dá para editar e excluir.</li>
        <li>Os jogadores veem as regras que valem na ficha, em Regras da mesa.</li>
      </ul>
      <h2>Código de entrada</h2>
      <ul>
        <li>Na página do grupo: <strong>Copiar</strong> o código ou <strong>Gerar novo</strong> (o antigo deixa de funcionar na hora).</li>
        <li>Quem já entrou continua no grupo mesmo se o código mudar.</li>
      </ul>
    </>
  );
}

export function MestreSessao() {
  const { ficha: f } = useRegras();
  return (
    <>
      <h2>Guiando uma ação (teste)</h2>
      <Passos
        passos={[
          { titulo: "Diga o atributo, a perícia e a DT", texto: "Ex.: Capacidade física + Atletismo, DT 15. A DT é livre: você decide na hora." },
          { titulo: "O jogador rola e soma", texto: "Rola 1 d20 por ponto no atributo, fica com o maior e soma o bônus da perícia (se tiver). Pode gastar esforço para rolar mais dados." },
          { titulo: "Compare com a DT", texto: "Igual ou maior: sucesso. A ficha mostra o teste pronto de cada perícia (ex.: 2d20 + 5)." },
        ]}
      />
      <p>
        Regras completas em <Link to="/docs/testes">Testes, DT e esforço</Link>. No combate, o ataque é contra a defesa do alvo (empate é do
        atacante) ou contra uma DT que você diz em voz alta: veja <Link to="/docs/combate">Combate</Link>.
      </p>
      <h2>Fichas dos membros</h2>
      <p>Na página do grupo você vê todos os membros com vida, mana e esforço. Clique num membro para abrir a ficha. Na ficha você pode:</p>
      <ul>
        <li>Ajustar vida, mana e esforço atuais: digite a quantidade e use Tirar ou Somar (ex.: 7 de dano de uma vez), ou digite o valor. O jogador também pode, mas a vida ele só diminui: aumentar é com você.</li>
        <li>Aplicar e remover status (veja <Link to="/docs/mestre-status">Status na sessão</Link>). Vida ou mana em 0 mostra o aviso de morte.</li>
        <li>Ver atributos, perícias com o teste pronto (ex.: 2d20 + 5) e as cartas disponíveis no nível atual.</li>
        <li>Editar nome, imagem e história do personagem.</li>
        <li>Remover o membro do grupo: a ficha é apagada e os itens dele ficam vagos no grupo.</li>
      </ul>
      <h2>Itens</h2>
      <ul>
        <li>Na página do grupo, <strong>Lançar do catálogo</strong> coloca um item seu no grupo (vago) ou direto numa ficha, quantas unidades quiser. Na ficha do membro, <strong>Dar item do catálogo</strong> faz o mesmo.</li>
        <li><strong>Item avulso</strong> cria um item só daquele grupo, sem entrar no catálogo.</li>
        <li>Itens vagos podem ser entregues por você a qualquer membro, ou pegos pelos jogadores.</li>
        <li>Cada personagem tem um limite de espaços ({f.inventarioInicial} no nível 1, +{f.inventarioPorNivel} por nível) e cada item ocupa os espaços dele. Ninguém passa do limite.</li>
      </ul>
      <h2>Criaturas</h2>
      <ul>
        <li>Na página do grupo, em <strong>Criaturas &gt; Invocar criatura</strong>: escolha a criatura do bestiário, o nível e quantas.</li>
        <li>Toque numa criatura para abrir a ficha dela: recursos, testes e cartas do nível. O posicionamento é no grid físico da mesa.</li>
        <li>Vida ou mana em 0: a criatura morre e some sozinha. Para tirar uma criatura que fugiu, use <strong>Remover</strong> na ficha dela.</li>
      </ul>
    </>
  );
}

export function MestreStatus() {
  return (
    <>
      <p>Status mostram alertas nas fichas (ex.: Cansado: -10 no total dos dados em testes físicos). Eles não mudam números: a mesa aplica o efeito.</p>
      <h2>Catálogo</h2>
      <ul>
        <li>Em <strong>Status</strong>, no menu, ficam os seus status e os verificados de outras pessoas (somente leitura). Nenhum status é fixo.</li>
        <li>Crie status próprios com nome, tipo (benefício, prejuízo ou misto) e efeito.</li>
        <li>Os automáticos (Morto, Sem energia vital, Cansado) aparecem sozinhos quando vida, mana ou esforço chegam a 0. Quem tem um deles pode mudar o nome e o efeito, mas não excluir.</li>
        <li>
          Para agrupar, use o botão <strong>Categorias</strong> e crie as suas (ex.: Elementais, Mentais). No status, escolha a categoria: a
          página passa a mostrar os status separados por categoria, e cada uma se oculta com a seta.
        </li>
      </ul>
      <h2>No grupo</h2>
      <ul>
        <li>Ao criar ou editar o grupo, marque quais status valem ali. Um grupo novo começa com os status automáticos marcados (e, com kit, os do kit).</li>
        <li>Com categorias, marque a categoria para levar todos os status dela de uma vez; depois desmarque os que não quiser.</li>
        <li>Status desmarcados não aparecem nas fichas daquele grupo nem podem ser aplicados.</li>
      </ul>
      <h2>Durante a sessão</h2>
      <ul>
        <li>
          Na página do grupo, cada membro tem o botão <strong>Status</strong>: abre a lista do que ele tem, com X para tirar, e o campo para
          aplicar um status novo.
        </li>
        <li>Na ficha do personagem há a mesma coisa, no quadro <strong>Status</strong> logo abaixo do cabeçalho.</li>
        <li><strong>Turnos</strong>: ao aplicar, anote quantos turnos o status dura (opcional). A cada turno, use o <strong>-1</strong> no status; em 0 ele sai sozinho. Sem turnos, dura até você tirar.</li>
        <li>Status se acumulam: o mesmo personagem pode ter vários, e os efeitos somam.</li>
        <li>Se nenhum status aparece para aplicar, é porque o grupo não tem status ativados: marque em Editar grupo, seção Status.</li>
        <li>NPCs e criaturas também recebem status: na ficha do NPC e na ficha da criatura (toque nela na página do grupo).</li>
        <li>Ao criar uma carta de habilidade, use o campo <strong>Ativa status</strong> para indicar o status que ela causa. Quando a carta for usada, aplique na ficha do alvo (o status de uma carta vai sempre para o alvo).</li>
      </ul>
    </>
  );
}

export function MestreSubirNivel() {
  const r = useRegras();
  const g = r.progressao.ganhoPorNivel;
  return (
    <>
      <p>A regra é 1 nível por participação. Ao fim da mesa, na ficha de cada participante, clique em <strong>Subir nível</strong> (antes de o jogador levar o personagem para outra mesa). O personagem recebe:</p>
      <ul>
        <li>+{g.pontosVida} de vida, +{g.pontosMana} de mana e +{g.pontosEsforco} de esforço (no máximo e no valor atual);</li>
        <li>{g.pontosPericia} pontos de perícia, que o jogador (ou você) usa na ficha: perícia nova do grupo com +{g.pontosPericia}, ou +{g.pontosPericia} numa que já tem;</li>
        <li>as cartas daquele nível;</li>
        <li>+{r.ficha.inventarioPorNivel} espaços no inventário.</li>
      </ul>
      <Destaque tipo="aviso" titulo="Atenção">Não existe descer de nível: subir é definitivo. Confira antes de confirmar. O nível máximo é {r.progressao.nivelMaximo}.</Destaque>
    </>
  );
}

export function MestreProtecoes() {
  return (
    <>
      <p>Para não quebrar fichas de jogadores, o sistema bloqueia algumas exclusões:</p>
      <Tabela
        cabecalho={["Item", "Quando não dá para excluir"]}
        linhas={[
          ["Classe ou raça", "Quando alguma ficha usa."],
          ["Perícia", "Quando alguma ficha colocou pontos nela."],
          ["Atributo", "Quando ainda tem perícias (mova antes) ou quando fichas têm dados nele."],
          ["Status automático", "Nunca: a ficha usa ele quando vida, mana ou esforço chegam a 0 (dá para editar)."],
          ["Coisa verificada de outra pessoa", "Nunca: é só leitura para você. Duplique para ter a sua."],
        ]}
      />
      <p>Excluir um <strong>grupo</strong> é permitido, com confirmação: apaga as criaturas invocadas e os itens dele, e as fichas saem do grupo. Cada jogador fica com uma cópia arquivada (só leitura) da própria ficha. O mesmo vale quando você remove um membro ou exclui a sua conta.</p>
      <p>Excluir um item do catálogo não mexe nos itens já lançados nos grupos (são cópias). Excluir uma criatura do bestiário tira também as criaturas dela invocadas.</p>
    </>
  );
}

export function MestreTemas() {
  return (
    <>
      <p>Com atributos próprios, kits de RPG e a escolha do que vale em cada grupo, o mesmo sistema serve para aventuras bem diferentes.</p>
      <Destaque titulo="Exemplo: terror">
        Crie o kit <strong>Terror</strong> e, nele, o atributo <strong>Sanidade</strong> com as perícias Coragem e Ocultismo. No grupo, escolha o kit,
        desmarque as perícias de magia e libere só classes de suporte e vanguarda. Os jogadores vão distribuir os d20 entre Capacidade
        física, Conhecimento e Sanidade.
      </Destaque>
    </>
  );
}

// ---------- Guia do jogador ----------

export function JogadorEntrar() {
  const { ficha: f } = useRegras();
  return (
    <Passos
      passos={[
        { titulo: "Crie a conta", texto: <>No <Link to="/cadastro">cadastro</Link>, escolha "Jogador", um nome de usuário, a data de nascimento e uma senha, e guarde o código de recuperação. (Toda conta joga, inclusive a de mestre.)</> },
        { titulo: "Peça o código ao mestre", texto: "São 6 caracteres. Digite em Minhas fichas, no campo Entrar em um grupo." },
        { titulo: "Veja o grupo", texto: "Aparecem a sinopse, o gênero, o mestre, as vagas e o que dá para escolher." },
        { titulo: "Crie a ficha ou traga um personagem", texto: `Nome, imagem e história (opcionais), raça, classe (use Ver detalhes para comparar) e ${f.pontosAtributoIniciais} pontos de atributo. Já jogou outra mesa? Escolha o mesmo personagem: ele vem com o nível, sem os itens.` },
        { titulo: "Pronto", texto: "A ficha aparece em Minhas fichas. Você tem uma ficha por grupo." },
      ]}
    />
  );
}

export function JogadorFicha() {
  return (
    <>
      <p>A ficha reúne tudo do personagem durante a sessão:</p>
      <Tabela
        cabecalho={["Parte", "O que dá para fazer"]}
        linhas={[
          ["Recursos", "Ajustar vida, mana e esforço atuais com os botões ou digitando. A vida você só diminui: aumentar (curar) é com o mestre."],
          ["Atributos", "Ver quantos d20 rolar em cada atributo."],
          ["Perícias", "Ver o teste pronto (ex.: 2d20 + 5), o total e de onde vem cada ponto. Depois de subir de nível, usar os pontos de perícia."],
          ["Habilidades", "Cartas pequenas em grade: toque numa para ver tudo. Mostra as do seu nível e quantas ainda vão liberar."],
          ["Inventário", "Toque num item para ver os detalhes e Usar, Passar para outro membro ou Descartar (fica vago no grupo). Itens que você não sabe usar aparecem marcados."],
          ["Personagem", "Editar nome, imagem e história. Sair do grupo tira a ficha do grupo, mas você fica com uma cópia arquivada (só leitura) em Minhas fichas."],
        ]}
      />
    </>
  );
}

// ---------- Referência ----------

export function Glossario() {
  return (
    <Tabela
      cabecalho={["Termo", "Significado"]}
      linhas={[
        ["One-shot / One-Take", "Aventura que começa e termina numa sessão só."],
        ["Mestre", "Quem prepara o mundo, conduz a história e sobe o nível dos personagens."],
        ["Grupo", "O RPG de um mestre: reúne os jogadores e define o que vale naquela aventura."],
        ["Código de entrada", "Os 6 caracteres que o jogador digita para entrar num grupo."],
        ["Ficha", "O personagem de um jogador dentro de um grupo."],
        ["Classe", "O herói pronto que o jogador escolhe: recursos, cartas e perícias."],
        ["Raça", "A origem do personagem: deslocamento e perícias de base."],
        ["Atributo", "Capacidade geral (ex.: Capacidade física) que recebe os d20 dos testes."],
        ["d20", "Dado de 20 faces. Nos testes, rola-se um por ponto no atributo e vale o maior."],
        ["DT", "Dificuldade do teste: o número que o total precisa alcançar. O mestre define na hora."],
        ["Esforço", "Recurso do personagem; cada ponto gasto antes de um teste dá +1 d20."],
        ["Bestiário", "As criaturas do mestre, montadas como classes, para invocar nos grupos."],
        ["Arquétipo", "Classe, raça ou criatura generalista que agrupa variações (subclasses, sub-raças, formas)."],
        ["Perícia", "Habilidade passiva em que o personagem é bom, com um valor."],
        ["Cartela", "O deck de cartas de habilidade de uma classe."],
        ["Deslocamento", "Quantos quadrados do grid o personagem anda por turno."],
        ["Item vago", "Item que está no grupo sem dono, esperando alguém pegar."],
        ["Mesa", "Um grupo jogado numa sessão. Para subir de nível, o personagem participa de mais mesas."],
        ["Rodada", "Uma volta completa na ordem de Iniciativa: cada participante joga um turno."],
        ["Turno", "A vez de um participante: 1 movimento + 1 ação."],
        ["Reação", "O que um personagem faz fora do próprio turno: carta que diz \"Reação\", Intervenção defensiva ou ataque de oportunidade. 1 por rodada."],
        ["Ataque de oportunidade", "Ataque que se faz, gastando a reação, quando um inimigo sai andando do seu alcance corpo a corpo."],
        ["Vantagem", "+1 d20 no teste, ficando com o maior. Não acumula."],
        ["Desvantagem", "-1 d20 no teste; com 1 dado só, rola 2 e fica com o menor. Anula a vantagem."],
        ["Carta ligada", "Carta cujo efeito passa a valer a partir do momento em que é usada (ou em que a condição passa a valer) e dura o que ela diz."],
        ["Preparação", "Gastar a ação de um turno para a carta sair no turno seguinte."],
        ["Invocação", "Criatura trazida por uma carta. Age no turno de quem invocou, sem gastar a ação dele."],
        ["Interlúdio", "Pausa entre cenas da sessão, quando os personagens comem, descansam e recuperam vida, mana e esforço."],
        ["Regra da mesa", "Regra própria que o mestre cria num grupo, além ou no lugar das regras padrão de combate."],
      ]}
    />
  );
}

export function Limitacoes() {
  return (
    <ul>
      <li>Rolagem de dados dentro do app (por enquanto, role na mesa; a ficha mostra o teste pronto).</li>
      <li>Gastar esforço pelo app ao rolar (por enquanto, o jogador tira os pontos de esforço na ficha).</li>
      <li>Jogador criar itens próprios (hoje só o mestre cria).</li>
    </ul>
  );
}
