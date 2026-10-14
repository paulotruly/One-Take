# Domínio do One-Take

## A ideia
One-Take é RPG de mesa para **uma sessão só**: a história começa e termina no mesmo encontro.
Para a preparação ser quase zero, ninguém monta personagem do zero: como num hero shooter, cada
jogador **escolhe uma classe pronta**, com habilidades já definidas.

Uma conta faz as duas coisas; no cadastro a pessoa escolhe a **interface** com que começa:
- **Jogador** — interface simples: cria fichas e entra nos grupos com o código do mestre. **Toda conta joga**
  (inclusive quem é mestre, nos grupos de outros mestres; no próprio grupo, não).
- **Mestre** — também carrega a interface de mestre: cria o mundo (classes, raças, perícias, atributos, status, itens,
  bestiário) e conduz os grupos. Pode ser ativada depois ("Mestrar" no topo). O catálogo de perícias do mestre só é
  copiado no primeiro acesso à interface de mestre, para não ocupar espaço de quem nunca mestra.
Cada usuário tem um **perfil** com **nome de usuário** (no código, `nickname`; único, usado para entrar; exibido como @usuario), nome
opcional e foto (link).
O login é por nome de usuário e senha. **Não há e-mail na conta.**

### Conta: senha, dados e exclusão
- **Idade mínima de 12 anos**: o cadastro pede a data de nascimento (só o dono vê). Contas antigas podem não ter a data.
- **Código de recuperação**: no cadastro, o app mostra um código (ex.: `7KQ2M-9XH4T-AB3CD-EF5GH`) uma única vez, e a pessoa só entra
  depois de confirmar que guardou. **Esqueceu a senha?** = nome de usuário + código + senha nova; depois da troca, o código usado deixa de
  valer, o app mostra um novo e as sessões anteriores deixam de valer. Em Configurações da conta dá para gerar um código novo (com a senha).
  Contas antigas sem código veem um aviso para gerar.
- **Baixar meus dados**: um arquivo JSON com a conta, as fichas, as fichas arquivadas e o conteúdo do mestre, a qualquer momento.
- **Excluir a conta**: em Configurações da conta (link discreto no fim), com a senha e o próprio nome de usuário digitado. A exclusão é
  **imediata e definitiva**: apaga o perfil, o login, as fichas (inclusive as arquivadas), os grupos e todo o conteúdo do mestre. Os
  jogadores dos grupos dele ficam com a ficha arquivada.
- Tudo isso fica em **Configurações da conta** (`/conta`), separado de **Editar perfil** (`/perfil`: nome de usuário, nome e foto).

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

### Arquétipos e subclasses
Um **arquétipo** é uma classe generalista (só título e descrição) que agrupa **subclasses** (ex.: Bruxa > Bruxa
elemental, Bruxa assombrosa). Cada subclasse é uma classe normal; o jogador escolhe a subclasse, nunca o arquétipo.
Classes sem arquétipo continuam valendo (avulsas). Só o mestre dono cria arquétipos e liga classes dele a eles.

### Classes fixas x classes do mestre
- **Fixas**: todo mestre vê, ninguém edita; servem de base e podem ser **duplicadas**. O sistema **começa sem classes fixas**:
  uma classe de mestre vira fixa com `npm run fixar-classe -- "Título"` (e volta com `--devolver nick`).
- **Do mestre**: criadas (ou duplicadas) por um mestre. Só ele vê e edita.

## Cartela de habilidades
O **deck de cartas** da classe. Cada classe tem **uma única cartela**: o conjunto ordenado das suas
habilidades. Ela não tem nome nem configuração própria — é simplesmente "as cartas da classe".
Habilidades só existem dentro de uma classe: primeiro se cria a classe, depois as habilidades dela.

## Habilidade (carta)
Cada carta da cartela:
- **Título** e **descrição** (o "sabor" da carta).
- **Condição** (opcional): o que precisa acontecer para poder usar. Ex.: "Ter acertado dois ataques seguidos".
- **Tipo de efeito** (lista fixa do sistema): **Dano** (tira vida), **Defesa** (evita/reduz/anula dano), **Cura** (devolve
  vida ou recurso), **Suporte** (ajuda aliados sem curar), **Fortalecimento** (bônus temporário), **Enfraquecimento**
  (penalidade temporária), **Controle** (prende, derruba, atordoa, força ação), **Mobilidade** (movimento extra),
  **Invocação** (traz criaturas/objetos), **Utilidade** (fora de combate ou o resto).
- **Descrição do efeito**: o que a carta causa, em texto livre.
- **Limite de uso** (opcional, lista fixa): **N vezes por combate** ou **N vezes por sessão** (N de 1 a 99). Sem limite = vazio.
- **Negrito** na descrição e no efeito: o texto entre `**dois asteriscos**` aparece em negrito.
- **Nível necessário** (padrão 1): a carta só fica disponível a partir desse nível (ver Progressão).
- **Custo de mana** (opcional, padrão 0): quanto de mana a carta gasta ao ser usada. 0 = não custa mana.
  É aqui que os pontos de mana da classe são usados.
- **Ordem** dentro da cartela (o mestre reordena).
- **Ativa status** (opcional).
- **Defesa do alvo** (opcional): uma ou mais perícias que o alvo pode usar para se defender da carta (informativo; o mestre
  pede o teste ao alvo). Ao escolher a perícia do teste, o formulário marca sozinho as defesas da regra (`api/src/regras/defesas.ts`,
  em `GET /api/regras`); o mestre desmarca ou marca outras à mão. Furtividade x Intuição (alvo em flanco, fora do campo de visão
  ou em ponto cego) ou Percepção (alvo no campo de visão); Luta x Reflexos (chance clara de esquiva) ou Resistência (sem desvio);
  Pontaria x Reflexos; Domínio x Reflexos (projéteis), Resistência (ataque direto, sem esquiva) ou Vontade (mental ou telepático).
- **Perícia do teste** (opcional): qual perícia o personagem testa para usar a carta. Fichas, NPCs e criaturas mostram o teste pronto
  daquele personagem (dados do atributo da perícia + total dele nela; sem a perícia, bônus 0).
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

O modificador (classe) e os pontos (raça, níveis) somam o **bônus** da perícia, usado nos testes (ver "Atributos e testes").

## Raça
Define de onde o personagem vem. Criada pelo mestre (só ele vê e edita). Tem:
- **Título**, **descrição** e **imagem** (link, opcional).
- **Deslocamento**: quantos quadrados do grid o personagem anda por turno (ex.: humano = 8). Mínimo 1.
- **Perícias de base**: perícias do catálogo do mestre que a raça dá ao personagem, cada uma com uma
  quantidade de **pontos** (mínimo 1).
- **Arquétipo de raça** (opcional): como no arquétipo, uma raça generalista (só título e descrição) que agrupa
  **sub-raças** (ex.: Elfo > Elfo da floresta). O jogador escolhe a sub-raça. Excluir o arquétipo não apaga as sub-raças.

## Atributos e testes (dados)
Atributos agrupam as perícias e recebem os dados nos testes.
- **Fixos do sistema** (valem para todos, não editáveis): **Capacidade física**, **Carisma** e **Conhecimento**.
- O **mestre pode criar atributos** próprios (ex.: "Sorte", "Tecnologia") para o tema do RPG dele, e mover
  perícias entre atributos. Atributo com perícias não pode ser excluído (mova as perícias antes).
- Ao criar a ficha, o personagem recebe **3 pontos de atributo** para distribuir. **Cada ponto é um d20.**

### Como o mestre guia uma ação (teste)
1. O mestre diz o **atributo + perícia** que a ação exige (ex.: Capacidade física + Atletismo) e a **DT**.
2. O jogador rola **1 d20 por ponto** no atributo e fica com o **maior** resultado.
3. Soma o **bônus da perícia** (total da ficha), se tiver. Qualquer personagem testa qualquer perícia; sem ela, soma 0.
4. Total ≥ DT = sucesso. Ex.: 2 pontos + Atletismo +5, rolou 10 e 15 → 15 + 5 = **20**.
- **Atributo com 0 pontos**: rola sempre **1 d20** e o resultado vale a **metade** (arredondada para baixo), antes do bônus.
  Com 0, o dado nunca passa de 10.
- **Esforço = dados extras**: cada **1 ponto de esforço** gasto antes da rolagem dá **+1 d20** (2d20 vira 3d20).
  Interpretação: com atributo 0 o esforço não compra dados ("sempre apenas 1 dado"). Não há limite de esforço por teste.
- **DT (faixa de sucesso e falha)**: livre, o mestre define durante a sessão. Não há tabela obrigatória; a documentação
  mostra a chance de cada DT por quantidade de dados (calculada em `regras/teste.ts`).
- O app ainda não rola dados: a ficha mostra o teste pronto de cada perícia (ex.: "2d20 + 5"). Regras em `api/src/regras/teste.ts`.

## Grupo (o RPG do mestre)
- Título, sinopse, gênero, imagem (link), **limite de membros** e um **código de entrada** de 6 caracteres
  (o mestre pode gerar um novo; o antigo deixa de valer).
- **Permitir classes repetidas**: se desligado, dois jogadores do grupo não podem ter a mesma classe.
- O mestre escolhe **o que vale no grupo**: classes (fixas ou dele), raças, atributos e, dentro dos atributos,
  perícias específicas. Isso permite adaptar o sistema a temas diferentes de RPG.
- **Kits de RPG**: o mestre junta o conteúdo de uma aventura num kit (classes, raças, atributos, perícias, status, itens do
  catálogo, criaturas e NPCs). Sem kit = **geral** (aparece em tudo); uma coisa pode estar em **vários kits**. Com um **kit ativo**
  (escolhido na lateral), as telas mostram **só o que é do kit** (mais o que é fixo do sistema, que não entra em kit) e o que for
  criado já entra no kit; o geral aparece em **Todos**. O **grupo** pode ter um kit:
  ao escolher, a tela marca o que vale (do kit + gerais; status fixos sempre), e itens, criaturas e NPCs mostrados no grupo seguem o kit.
  Excluir um kit não apaga nada.
- **Conteúdo verificado**: qualquer coisa criada pelo ADMIN (classes, raças, atributos, perícias, status, categorias de item, itens do catálogo, criaturas e NPCs,
  e também **kits de RPG** e **arquétipos**) pode receber o selo **verificado**. **Kit verificado leva tudo o que está nele**: cada coisa
  do kit conta como verificada enquanto estiver lá (inclusive o que entrar depois); tirar do kit tira o selo, a menos que a coisa tenha
  o selo próprio. O kit verificado aparece para todo mestre, que pode usá-lo como kit ativo e no grupo (o que ele cria não entra nesse
  kit). O arquétipo aparece se for verificado ou se tiver variação verificada (só as variações verificadas aparecem para os outros). Verificado aparece para todo mestre, **só leitura** e sempre atualizado: dá para usar nos grupos, lançar os
  itens, invocar as criaturas e **duplicar** (classe, criatura, NPC; a perícia é copiada para o catálogo). Com kit ativo, o verificado
  de outra pessoa segue o kit como o resto (aparece se estiver no kit ativo). Perícias de uma carta verificada contam como a perícia equivalente do mestre (mesma
  origem) na soma da ficha. Cada pessoa pode **ocultar os verificados** da própria interface (Configurações da conta); o que já está em
  uso nos grupos e fichas continua funcionando.
- **Cargo ADMIN** (`Perfil.cargo`, trocado por `npm run cargo -- <nome de usuário> ADMIN`): edita o que é fixo e **não automático**
  (atributos, status sem gatilho, categorias de item, classes fixas) e põe ou tira o selo verificado nas coisas dele. Fixo nunca é
  excluído.
- Membro = jogador com ficha no grupo. Só entra enquanto houver vaga.

## Ficha
Criada pelo jogador ao entrar no grupo com o código (**uma ficha por jogador em cada grupo**; ele pode ter várias no total).
- Nome do personagem, **raça** e **classe** (só as liberadas no grupo), **história** (parágrafo opcional) e imagem (link).
- **3 pontos de atributo** distribuídos entre os atributos do grupo (soma exata 3; atributo pode ficar com 0).
- Vida, mana e esforço **atuais**: começam cheios; jogador e mestre podem mexer, sempre entre 0 e o máximo.
  **A vida o jogador só diminui**; aumentar (curar) é só o mestre. Mana e esforço o jogador ajusta nos dois sentidos.
- **Nível**: só o mestre sobe (ver Progressão).
- **Perícias**: soma dos pontos da raça + modificador da classe + pontos colocados ao subir de nível.
- **Cartas**: as da classe com nível necessário até o nível da ficha.
- O jogador pode sair do grupo e o mestre pode remover o membro; os itens da ficha ficam vagos no grupo.
- **Fichas arquivadas**: quando uma ficha sai do grupo (o jogador sai, o mestre remove, o grupo é excluído ou o mestre exclui a conta), o
  jogador fica com uma **cópia somente leitura** do personagem (retrato do momento: atributos, perícias, cartas, inventário), em Minhas
  fichas. A cópia não depende do conteúdo do mestre e só o jogador pode apagá-la.

## Inventário e itens
- Todo personagem começa com **5 espaços** e ganha **+2 por nível**. Cada item ocupa **1 ou mais espaços**.
- **Catálogo de itens do mestre** (sempre disponível para lançar no grupo vago ou direto numa ficha). Cada item tem:
  título, descrição, imagem (link), **categoria**, **efeito ao usar** (texto),
  **espaços**, **consumo** (sem limite ou N usos) e **pré-requisito para saber usar**: classe, perícia (precisa ter
  total > 0) e/ou texto livre. Pode estar em kits de RPG (nenhum = geral).
- **Categorias de item**: 4 fixas do sistema (Armas, Artefatos, Taverna, Sebo; somente leitura) + as que cada mestre cria
  (nome, descrição e ícone escolhido de uma lista). Excluir uma categoria deixa os itens dela sem categoria.
- O item lançado é uma **cópia** do molde: editar o catálogo não muda itens já lançados. O mestre também cria
  **itens avulsos** direto no grupo.
- **Usar**: o dono da ficha (se cumprir o pré-requisito) ou o mestre. O app conta os usos; ao chegar a 0 o item é
  consumido (some). O efeito é aplicado pela mesa. Pré-requisito em texto é só informativo.
- O jogador pode passar um item para outro membro do grupo, **descartar** (fica **vago no grupo**) ou pegar um item
  vago. O mestre pode mover, editar e excluir qualquer item. Ninguém passa do limite de espaços.

## NPCs
- Personagens do mestre **com ficha**: nome, descrição, imagem, **raça (obrigatória)**, **classe (opcional)**, **nível**, dados por
  atributo, perícias (raça + classe + pontos extras do mestre), cartas da classe no nível (com aprimoramentos) e **inventário**.
- **NPC simples** = só raça, sem classe e sem cartas; aí o mestre define vida, mana e esforço base. Com classe, a base é a da classe.
  A progressão é a mesma das fichas (+5 por nível); mudar nível, classe ou base faz o atual acompanhar a diferença.
- **Kits de RPG**: a página do grupo mostra os NPCs do kit dele e os gerais; todos ficam na página NPCs.
- Vida ou mana em 0 = morto (aviso na ficha; o NPC não some).
- **Inventário**: mesma capacidade das fichas (5 + 2 por nível). O mestre lança itens do catálogo no NPC, usa, entrega a uma ficha
  (de qualquer grupo dele), deixa vago num grupo ou exclui. Excluir o NPC apaga os itens dele.
  Itens com NPC geral não pertencem a grupo nenhum; excluir um grupo não apaga itens que estão com NPCs.

## Bestiário (criaturas)
- Criaturas do mestre, montados **como classes**: título, descrição, imagem, vida/mana/esforço base (nível 1, nenhum zero),
  **deslocamento**, perícias com modificador, **dados por atributo** (testam como personagens) e cartela com nível
  necessário e aprimoramentos.
- **Arquétipo de criatura** com várias **formas** (ex.: Lobo > Lobo das neves). Pode estar em kits de RPG (nenhum = geral).
- **Invocar no grupo**: o mestre escolhe a criatura, o **nível** (mesma progressão das classes: +5 vida/mana/esforço por
  nível e as cartas do nível; os pontos de perícia não se aplicam a criaturas) e a quantidade ("Lobo 1", "Lobo 2").
  Entram com recursos cheios.
- O **grid de batalha é físico** (na mesa): o app não guarda posições, só a ficha de cada criatura.
- A criatura some quando o mestre remove (fugiu) ou **sozinho quando morre**: vida ou mana em 0.

## Recursos e status
O One-Take é RPG de mesa com apoio de tecnologia: o app controla fichas e avisa; a mesa narra e aplica os efeitos.
- **Vida em 0 = morte.** **Mana em 0 = morte**: mana é a energia vital do personagem em qualquer universo (e sustenta o vigor).
  **Esforço em 0 = cansaço** (status Cansado).
- **Status** são condições/emoções com efeito de benefício, prejuízo ou misto. O efeito é **só informativo**: a ficha mostra um
  alerta, nenhum número muda.
  - **Automáticos** (do sistema): Morto (vida 0), Sem energia vital (mana 0), Cansado (esforço 0).
  - **Aplicados pelo mestre** durante a sessão: fixos do sistema (Assustado, Furioso, Inspirado, Confiante, Envenenado,
    Atordoado; proposta inicial) e os criados por cada mestre.
  - **Categorias de status** (do mestre, ex.: Elementais, Mentais): só organizam. A página de status mostra os aplicados pelo
    mestre separados por categoria (cada uma oculta com a seta); ao montar o grupo, marcar a categoria leva todos os status dela.
    Excluir a categoria não apaga os status. Categoria verificada aparece para todo mestre (só leitura); a categoria privada de outra
    pessoa não aparece nem no status verificado dela.
  - Em cada grupo o mestre escolhe quais status valem (opcional). Grupo novo começa com os fixos marcados.
  - Uma carta de habilidade pode indicar o status que **ativa** (campo opcional); o mestre aplica na ficha do alvo.
  - **NPCs e criaturas** também recebem status. Valem os ativados no grupo (criatura invocada) ou todos os do mestre (NPC).

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
**Descer de nível não é possível** (regra do jogo): subir é definitivo, o mestre confirma com cuidado. Nível máximo: 100.
Os +5 pontos de perícia de cada nível são usados na ficha (perícia nova do grupo com +5, ou +5 numa que já tem).

## Ainda não existe
Sessões, rolagem de dados no app (e gastar esforço pelo app ao rolar). O grid de batalha não terá versão no app (é físico).
