# Domínio do One-Take

## A ideia
One-Take é RPG de mesa para **uma sessão só**: a história começa e termina no mesmo encontro.
Para a preparação ser quase zero, ninguém monta personagem do zero: como num hero shooter, cada
jogador **escolhe uma classe pronta**, com habilidades já definidas.

Há dois papéis, escolhidos no cadastro:
- **Mestre** — cria o mundo (classes, raças, perícias, atributos) e conduz os grupos.
- **Jogador** — cria fichas e entra nos grupos com o código do mestre.
Cada usuário tem um **perfil** com **nickname** (único, usado para entrar; exibido como @nickname), nome opcional e foto (link).
Ninguém informa email: o cadastro e o login são por nickname e senha.

## Classe
É o "herói" que o jogador escolhe. Tem:
- **Grupo** — o papel tático na mesa:
  - **Combatente**: causa dano, pressiona inimigos.
  - **Vanguardista**: linha de frente, aguenta e protege.
  - **Suporte**: cura, fortalece aliados, atrapalha inimigos.
- **Título**, **descrição** e uma **imagem** representativa.
- **Pontos de vida, mana e esforço** — os valores **base**: o máximo com que um personagem
  dessa classe começa. **Nenhum pode ser zero** (mínimo 1 em cada). Durante a sessão os valores sobem e descem, mas isso é da **ficha**
  do personagem (futuro); a classe só define o ponto de partida.
- Uma **cartela de habilidades** (única por classe).
- **Perícias**, escolhidas do catálogo do mestre, cada uma com o **modificador** daquela classe.

### Classes-conceito e subclasses
Uma **classe-conceito** é uma classe generalista (só título e descrição) que agrupa **subclasses** (ex.: Bruxa > Bruxa
elemental, Bruxa assombrosa). Cada subclasse é uma classe normal; o jogador escolhe a subclasse, nunca o conceito.
Classes sem conceito continuam valendo (avulsas). Só o mestre dono cria conceitos e liga classes dele a eles.

### Classes fixas x classes do mestre
- **Fixas**: vêm com o sistema, todo mestre vê, ninguém edita. Servem de base: o mestre pode
  **duplicar** uma e editar a cópia.
- **Do mestre**: criadas (ou duplicadas) por um mestre. Só ele vê e edita.

## Cartela de habilidades
O **deck de cartas** da classe. Cada classe tem **uma única cartela**: o conjunto ordenado das suas
habilidades. Ela não tem nome nem configuração própria — é simplesmente "as cartas da classe".
Habilidades só existem dentro de uma classe: primeiro se cria a classe, depois as habilidades dela.

## Habilidade (carta)
Cada carta da cartela:
- **Título** e **descrição** (o "sabor" da carta).
- **Condição** (opcional): o que precisa acontecer para poder usar. Ex.: "Ter acertado dois ataques seguidos".
- **Tipo de efeito**: texto livre e apenas descritivo (ex.: "Dano", "Cura em área", "Controle").
- **Descrição do efeito**: o que a carta causa, em texto livre.
- **Limite** (opcional): "1 vez por sessão", "apenas em combate".
- **Nível necessário** (padrão 1): a carta só fica disponível a partir desse nível (ver Progressão).
- **Custo de mana** (opcional, padrão 0): quanto de mana a carta gasta ao ser usada. 0 = não custa mana.
  É aqui que os pontos de mana da classe são usados.
- **Ordem** dentro da cartela (o mestre reordena).
- **Ativa status** (opcional).
- **Aprimoramentos** (opcional): a partir de um nível, a mesma carta muda (título, efeito, condição, limite, custo de mana,
  status). Campos não preenchidos não mudam; os aprimoramentos se acumulam por nível. A ficha mostra a versão do nível atual.

## Perícia
Habilidade **passiva** usada em rolagens de dados. As perícias são definidas **fora das classes**,
num **catálogo**; a classe apenas escolhe perícias já cadastradas e define o **modificador** dela
para cada uma (ex.: Bastião tem Resistência +3).

Cada perícia do catálogo tem:
- **Nome** e **descrição**, livres.
- **Categoria** (lista fixa do sistema, cada uma com um ícone):
  Corpo a corpo (ataques e combate corpo a corpo) · Magia (magias e ataques não físicos) ·
  Pontaria (precisão para acertar qualquer alvo) · Físico (deslocamento, agilidade e preparo físico) ·
  Defesa (resistência a ataques e desvios) · Social (comunicação, interação social e persuasão) ·
  Conhecimento (conhecimentos e práticas gerais) · Percepção (notar detalhes e intenções).
- **Atributo** ao qual pertence (ver "Atributos e testes"). O mestre pode mover a perícia para qualquer atributo.

### Perícias base e catálogo do mestre
O sistema traz 18 perícias base (Atletismo, Acrobacia, Iniciativa, Furtividade, Luta, Pontaria,
Reflexos, Resistência, Diplomacia, Enganação, Intimidação, Intuição, Percepção, Vontade, Religião,
Adestramento, Sobrevivência, Domínio). No primeiro acesso, cada mestre recebe **uma cópia própria**
delas e pode editar, excluir e criar novas à vontade — 100% personalizável, sem afetar outros mestres.
As classes fixas usam as perícias base do sistema; ao duplicar uma classe fixa, as perícias dela passam
a apontar para as cópias do catálogo do mestre.

O sistema de dados ainda não foi definido; o modificador é só um número.

## Raça
Define de onde o personagem vem. Criada pelo mestre (só ele vê e edita). Tem:
- **Título**, **descrição** e **imagem** (link, opcional).
- **Deslocamento**: quantos quadrados do grid o personagem anda por turno (ex.: humano = 8). Mínimo 1.
- **Perícias de base**: perícias do catálogo do mestre que a raça dá ao personagem, cada uma com uma
  quantidade de **pontos** (mínimo 1).

## Atributos e testes (dados)
Atributos agrupam as perícias e recebem os dados nos testes.
- **Fixos do sistema** (valem para todos, não editáveis): **Capacidade física**, **Carisma** e **Conhecimento**.
- O **mestre pode criar atributos** próprios (ex.: "Sorte", "Tecnologia") para o tema do RPG dele, e mover
  perícias entre atributos. Atributo com perícias não pode ser excluído (mova as perícias antes).
- Ao criar a ficha, o personagem recebe **3 pontos de atributo** para distribuir. **Cada ponto é um d20.**
  Quando uma ação exige teste, o jogador rola tantos d20 quanto tem no atributo relacionado e usa o **maior**
  resultado. Ex.: 2 pontos em Capacidade física para desviar de uma flecha = rola 2d20 e fica com o maior.
- Valores baixos tendem a falha, altos a sucesso, intermediários a consequências mistas. Os detalhes
  (faixas, como as perícias entram no teste) ainda serão definidos.

## Grupo (o RPG do mestre)
- Título, sinopse, gênero, imagem (link), **limite de membros** e um **código de entrada** de 6 caracteres
  (o mestre pode gerar um novo; o antigo deixa de valer).
- **Permitir classes repetidas**: se desligado, dois jogadores do grupo não podem ter a mesma classe.
- O mestre escolhe **o que vale no grupo**: classes (fixas ou dele), raças, atributos e, dentro dos atributos,
  perícias específicas. Isso permite adaptar o sistema a temas diferentes de RPG.
- **Geral ou exclusivo**: ao criar uma classe, raça ou atributo, o mestre pode marcá-lo como exclusivo de um grupo
  (sempre opcional). Exclusivo só pode valer naquele grupo e já entra liberado nele. Tudo pode ficar "geral" e ser
  restringido só na hora de montar o grupo.
- Membro = jogador com ficha no grupo. Só entra enquanto houver vaga.

## Ficha
Criada pelo jogador ao entrar no grupo com o código (**uma ficha por jogador em cada grupo**; ele pode ter várias no total).
- Nome do personagem, **raça** e **classe** (só as liberadas no grupo), **história** (parágrafo opcional) e imagem (link).
- **3 pontos de atributo** distribuídos entre os atributos do grupo (soma exata 3; atributo pode ficar com 0).
- Vida, mana e esforço **atuais**: começam cheios; jogador e mestre podem mexer, sempre entre 0 e o máximo.
- **Nível**: só o mestre sobe (ver Progressão).
- **Perícias**: soma dos pontos da raça + modificador da classe + pontos colocados ao subir de nível.
- **Cartas**: as da classe com nível necessário até o nível da ficha.
- O jogador pode sair do grupo (apaga a ficha) e o mestre pode remover o membro; os itens da ficha ficam vagos no grupo.

## Inventário
- Todo personagem começa com **5 espaços** e ganha **+2 por nível**.
- **Itens** têm nome e descrição e são criados pelo **mestre**, que entrega a um personagem ou deixa vago no grupo.
- O jogador pode passar um item para outro membro do grupo, **descartar** (o item fica **vago no grupo**) ou pegar
  um item vago. O mestre pode mover, editar e excluir qualquer item. Ninguém passa do limite de espaços.

## Recursos e status
O One-Take é RPG de mesa com apoio de tecnologia: o app controla fichas e avisa; a mesa narra e aplica os efeitos.
- **Vida em 0 = morte.** **Mana em 0 = morte**: mana é a energia vital do personagem em qualquer universo (e sustenta o vigor).
  **Esforço em 0 = cansaço** (status Cansado).
- **Status** são condições/emoções com efeito de benefício, prejuízo ou misto. O efeito é **só informativo**: a ficha mostra um
  alerta, nenhum número muda.
  - **Automáticos** (do sistema): Morto (vida 0), Sem energia vital (mana 0), Cansado (esforço 0).
  - **Aplicados pelo mestre** durante a sessão: fixos do sistema (Assustado, Furioso, Inspirado, Confiante, Envenenado,
    Atordoado; proposta inicial) e os criados por cada mestre.
  - Em cada grupo o mestre escolhe quais status valem (opcional). Grupo novo começa com os fixos marcados.
  - Uma carta de habilidade pode indicar o status que **ativa** (campo opcional); o mestre aplica na ficha do alvo.

## Progressão de nível
O One-Take dura um dia, então a progressão é **rápida, simples e fixa**:
- O personagem sobe **1 nível por participação** (com o mesmo personagem).
- **Só o mestre** sobe o nível de um jogador, manualmente.
- A cada nível acima do 1, o personagem ganha:
  - **+5 de vida, +5 de mana e +5 de esforço** (máximos);
  - **+5 pontos de perícia**: uma **perícia nova com +5** ou **+5 numa perícia que já tem**;
  - **todas as cartas daquele nível** da cartela da classe. O nível N tem todas as cartas com nível necessário ≤ N (cumulativo);
  - **+2 espaços de inventário**.

Ainda em aberto (o designer vai definir): se as cartas de um nível são todas recebidas ou escolhidas, e se a perícia
nova é escolhida pelo jogador ou já determinada. Por ora: recebe todas as cartas; a escolha da perícia fica para a ficha.

O mestre sobe o nível na ficha do membro; cada classe também mostra uma **prévia** da progressão.
Os +5 pontos de perícia de cada nível são usados na ficha (perícia nova do grupo com +5, ou +5 numa que já tem).

## Ainda não existe
Sessões, rolagem de dados no app, combate, descer de nível, mestre jogar no grupo de outro mestre.
