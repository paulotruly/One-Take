# Decisões

Formato: data — decisão. Motivo.

## 2026-10-11
- **Pastas independentes, sem npm workspaces.** Render e Vercel buildam a partir de `api/` e `web/` com seus próprios lockfiles, sem atrito com hoisting.
- **Prisma 7.10 (não o 8).** Em 2026-10-11 a tag `latest` do pacote `prisma` aponta para `8.0.0-rc.22` (release candidate); `@prisma/client` estável é 7.10.0. Fixado em 7.x.
  Usa `prisma.config.ts` com `DIRECT_URL` para a CLI e `@prisma/adapter-pg` com `DATABASE_URL` (pooled) em runtime, como manda a doc Prisma + Supabase.
- **`npm audit` acusa vulnerabilidades em dependências da CLI do Prisma** (`deepmerge-ts`, `mysql2`). São só de desenvolvimento/build e não vão para o runtime da API; a "correção" sugerida rebaixaria para Prisma 6. Reavaliar quando sair 7.x/8 estável.
- **Validação do JWT via JWKS (`jose`)**, sem chamada ao Supabase por requisição. Requer projeto com *JWT Signing Keys* assimétricas (padrão nos projetos novos). Se o projeto usar o segredo legado HS256, migrar as chaves no painel.
- **Perfil criado no 1º acesso como JOGADOR**; promoção a MESTRE via `npm run promover` ou SQL. Não há cadastro aberto na interface; usuários são criados no painel do Supabase. Fácil de mudar depois.
- **Fixa = `donoId` nulo** em vez de um booleano separado. Uma fonte só da verdade.
- **Classe de outro mestre responde 404**, não 403, para não revelar que existe.
- **RLS ligado sem policies** em todas as tabelas, para a Data API do Supabase não expor dados com a chave anon.
- **Mensagens do Zod em português** (`z.locales.pt()`), campo ausente = "Obrigatório".
- **Schemas de edição sem defaults**: no Zod 4, `default()` em campo opcional é aplicado mesmo quando o campo não veio, o que faria um PATCH parcial resetar valores.
- **Testes da API com Prisma mockado** (vitest + supertest), sem precisar de banco. Integração real: roteiro manual.
- **Imagem da classe por link (`imagemUrl`), sem upload — decisão do produto.** Mais simples por ora; removidos multer,
  Supabase Storage e a service role key. Coluna renomeada de `imagemPath` para `imagemUrl` (migration `imagem_por_link`).
  Se o upload voltar: bucket público + rota `PUT /api/classes/:id/imagem` passando pela API, e duplicar deve copiar o arquivo.
  O bucket `classes-imagens` criado no Supabase ficou sem uso.
- **TypeScript 7 (compilador nativo) na API**: é a versão estável atual e compila o projeto sem ajustes.
- **Front criado com o template oficial do Vite (react-ts)**, mantendo a versão de TypeScript que ele fixa (~6.0) e o `oxlint`.
  Acrescentado `strict: true`.
- **TanStack Query** para dados do front: estados de carregamento/erro prontos e invalidação simples após cada escrita.
- **Formulários sem biblioteca**, controlados com `useState`; a validação é a da API (mensagens por campo).
- **Modais com `<dialog>` nativo** (foco, Esc e backdrop sem dependência).
- **Reordenar cartas com botões de seta (esquerda/direita)**, não drag-and-drop: simples e acessível. Cada clique envia a ordem completa.
- **Usuário recriado no Supabase Auth herda o perfil antigo.** Apagar e recriar um usuário gera id novo com o mesmo email,
  e o `Perfil` antigo bloqueava o novo (email único → 500). Agora, se a conta antiga não existe mais em `auth.users`,
  o id do perfil é atualizado (FKs com `ON UPDATE CASCADE` levam junto as classes). Se a outra conta ainda existir: 409 `EMAIL_EM_USO`.
- **Cartela única por classe, sem entidade própria — decisão do produto.** Substitui "uma ou mais cartelas".
  Habilidades pertencem direto à classe (`Habilidade.classeId`); a migration `cartela_unica` moveu as cartas existentes
  preservando a ordem e removeu a tabela `Cartela`, suas rotas e telas.
- **Criação de classe e de habilidades em interfaces separadas — decisão do produto.** "Nova classe" cria só a classe;
  habilidades têm tela própria (`/mestre/classes/:id/habilidades`), acessível a partir da página da classe já existente.
- **Tipo de efeito vira texto livre — decisão do produto.** Era enum (DANO/SUPORTE/BUFF/DEBUFF/OUTRO); agora é só descritivo,
  como a descrição do efeito. Migration `tipo_efeito_texto` converteu os valores para "Dano", "Suporte" etc. e removeu o enum.
  No front, a carta perdeu a cor por tipo (usa `--cor-efeito`).
- **Perícias viram catálogo, separado das classes — decisão do produto.** Interface própria (`/mestre/pericias`) para definir
  perícias; a classe só escolhe perícias já cadastradas e define o modificador (`ClassePericia`). Migration `catalogo_pericias`
  apagou as perícias antigas (eram só do seed) e o seed cria 18 perícias base.
- **Um catálogo por mestre (cópia das perícias base no 1º acesso)**, em vez de catálogo global compartilhado: cada mestre personaliza
  sem afetar os outros. Classes fixas usam as perícias base; duplicar mapeia para a cópia do mestre (por `origemId` ou nome, criando se faltar).
- **Categorias (emoji) e atributos (CF/CC) são listas fixas do sistema** (enums); o mestre só escolhe entre elas.
- **Modificador fica no vínculo classe↔perícia**, não na perícia do catálogo.
- **Progressão de nível fixa e simples — decisão do produto.** +1 nível por participação, só o mestre sobe. Por nível: +5 vida,
  +5 mana, +5 esforço, +5 pontos de perícia (perícia nova com +5 ou +5 numa existente) e todas as cartas do nível.
- **Nível N libera todas as cartas com nível necessário ≤ N** (cumulativo).
- **Regras de progressão só na API** (`src/regras/progressao.ts`, funções puras com testes). A prévia vem calculada de
  `GET /api/classes/:id/progressao`, sem duplicar a regra no front; as fichas vão usar as mesmas funções.
- **Nesta etapa, só a prévia por classe.** Subir nível de verdade depende de fichas/personagens, que ainda não existem.
- **Habilidades podem custar mana — decisão do produto.** Campo `custoMana` (inteiro, 0 = sem custo, padrão 0). Migration `custo_mana`.
- **Classe não pode começar com vida, mana ou esforço zerados — decisão do produto.** Mínimo 1 em cada, ao criar e ao editar
  (Zod + CHECK no banco, migration `pontos_base_minimo_1`). Interpretado como "nenhum dos três pode ser zero".
- **Mensagens de limite numérico próprias** ("Deve ser no mínimo 1") em vez do texto genérico do Zod.
- **Regras de design — decisão do produto:** sem emojis (só ícones `lucide-react`), tema claro com fundo branco, interface simples,
  cantos retos em tudo (`--raio-*` = 0). Categorias de perícia ganharam ícones: Corpo a corpo = HandFist, Magia = Sparkles,
  Pontaria = Target, Físico = Footprints, Defesa = Shield, Social = MessageCircle, Conhecimento = BookOpen, Percepção = Eye.
  Atributos: Vida = Heart, Mana = Droplet, Esforço = Zap. Classe fixa = Lock.
- **Raças — decisão do produto.** Título, descrição, deslocamento (quadrados por turno) e perícias de base com pontos, do catálogo
  do mestre. Interpretado: o deslocamento é da raça (exemplo do humano), não da classe. Sem raças fixas por enquanto.
- **Atributos viram cadastro — decisão do produto.** Fixos: Capacidade física, Carisma, Conhecimento (CC foi dividido); o mestre cria
  outros e move perícias entre atributos. Interpretado "o jogador pode criar atributos" como o mestre (dono do catálogo).
  Siglas CF/CC removidas da interface.
- **Cadastro aberto com escolha de papel (mestre ou jogador) — decisão do produto.** O papel vai no `user_metadata` do Supabase e a
  API o usa só ao criar o perfil. Consequência: qualquer pessoa pode virar mestre se escolher; mudar o papel depois continua sendo
  pelo `npm run promover`.
- **Perfil com nome e foto por link** (`PATCH /api/me`); avatar quadrado, sem foto = ícone.
- **Página inicial pública com as regras** e **guia do mestre**. Números das regras vêm de `GET /api/regras` (fonte única
  `api/src/regras/`), para a página não ficar desatualizada. Marca provisória: ícone `Dices` no lugar do nome.
- **Login por nickname, sem email — decisão do produto.** Email interno `<nickname>@one-take.local` no Supabase; login passa pela
  API (`POST /api/entrar`) para resolver nickname em email sem expô-lo. Contas antigas com email real também entram pelo
  nickname. Consequência: sem "esqueci minha senha" por email; exige "Confirm email" desligado no Supabase.
  Conta do dono: @paulo. Nickname pode ser trocado no perfil.
- **Grupos, fichas e inventário — decisão do produto.** Regras: 1 ficha por jogador por grupo; mestre não cria ficha no próprio
  grupo; 3 pontos de atributo com soma exata, podendo ficar 0 em algum atributo (pode haver mais de 3 atributos); vida/mana/esforço
  atuais limitados a 0..máximo; subir nível também soma +5 nos atuais; atributos que saem do grupo continuam na ficha.
- **Itens criados pelo mestre** (nome + descrição), entregues a uma ficha ou vagos no grupo; jogador passa, descarta ou pega item
  vago. (Sugestão adotada enquanto o produto não definir outra coisa.)
- **Exclusividade (geral x exclusivo de um grupo)** em classes, raças e atributos, opcional. Interpretado "grupo de perícias" como atributo.
- **Exclusão de algo usado por fichas é bloqueada** (FK RESTRICT + 409 `EM_USO`) em vez de apagar fichas em cascata.
- Tabelas de disponibilidade chamadas `ClasseNoGrupo` etc. porque `GrupoClasse` já era o enum Combatente/Vanguardista/Suporte.
- **Regras e guia do mestre como manual completo** (sumário, passo a passo, exemplos, tabelas, glossário). Pontos ainda não
  definidos (uso do esforço, faixas de sucesso, perícia no teste) aparecem como "ainda será definido", sem inventar regra.
  A tabela de chances do d20 é matemática (1 - (alvo-1)/20 elevado ao nº de dados), não regra nova.
- **Home vira landing page curta; regras e guias vão para uma documentação em `/docs`** (formato de documentação de software:
  navegação lateral por seções, um tópico por página, anterior/próximo). Seções: Começando, Regras do jogo, Guia do mestre,
  Guia do jogador, Referência. `/guia-do-mestre` redireciona para `/docs/mestre-visao-geral`.
- **Vida 0 e mana 0 = morte; esforço 0 = cansaço — decisão do produto.** Mana é a energia vital. A ficha mostra aviso de morte.
- **Status informativos — decisão do produto.** Fixos do sistema (3 automáticos + 6 manuais, proposta inicial a ajustar com o designer
  em `api/prisma/status-base.ts`) e criados pelo mestre; ativados por grupo; mestre aplica/remove; carta pode indicar o status que ativa.
  Status do mestre são sempre manuais (gatilho só no sistema). Efeitos não alteram números.
- **Ajuste rápido de recursos**: quantidade + Tirar/Somar; a ficha usa a resposta da API em vez de recarregar tudo.
- **Classe-conceito — decisão do produto.** Entidade própria (`ClasseConceito`, só título e descrição) com subclasses = classes normais
  (`Classe.conceitoId`). Interpretações: classes avulsas continuam permitidas; conceito sem subclasse aparece com aviso; excluir o
  conceito não apaga as subclasses.
- **Aprimoramento de carta — decisão do produto.** A mesma carta muda a partir de um nível; o aprimoramento guarda só os campos que
  mudam (título, efeito, condição, limite, custo de mana, status) e eles se acumulam por nível. Cálculo em `aplicarAprimoramentos`.

## 2026-10-12
- **Regra de teste — decisão do produto.** Mestre diz atributo + perícia; jogador rola 1 d20 por ponto, fica com o maior e soma o
  bônus da perícia (sem a perícia, 0). Atributo 0 = 1 d20 com resultado pela metade. Fonte única: `api/src/regras/teste.ts`.
  Interpretações: metade **arredondada para baixo** e **antes** de somar o bônus; atributo 0 **não** compra dados com esforço
  ("sempre apenas 1 dado"); sem limite de esforço por teste. A ficha mostra o teste pronto ("2d20 + 5"); rolar no app continua fora.
- **Esforço = dados extras — decisão do produto.** 1 ponto de esforço = +1 d20 no teste.
- **DT livre — decisão do produto.** "Faixa de sucesso e falha" = DT, definida pelo mestre na sessão. Sem tabela de DT oficial;
  a documentação mostra só a matemática (chance por DT e dados).
- **Descer de nível não existe — decisão do produto** (deixa de ser "ideia em aberto"). A confirmação de subir nível avisa.
- **Uma conta, duas interfaces — decisão do produto.** Toda conta joga; a interface de mestre é ativada no cadastro ou depois
  (`POST /api/me/mestre`). Reaproveita `Perfil.papel` (MESTRE = ativada), sem coluna nova; o catálogo de perícias continua sendo
  copiado só no 1º acesso à área de mestre. Mestre pode jogar nos grupos de outros mestres (já era permitido pela API; o front bloqueava).
  Não há "desativar mestre" por enquanto.
- **Tipo de efeito volta a ser lista fixa — decisão do produto** (desfaz a de 2026-10-11). Dano, Defesa, Cura, Suporte, Fortalecimento,
  Enfraquecimento, Controle, Mobilidade, Invocação, Utilidade (nomes em português, propostos por mim). Buff/Debuff viraram
  Fortalecimento/Enfraquecimento. Cada tipo tem ícone lucide e descrição no front.
- **Raça-conceito — decisão do produto**, igual à classe-conceito (`RacaConceito`, `Raca.conceitoId`).
- **Itens com catálogo — decisão do produto.** Categorias Armas, Artefatos, Taverna, Sebo; efeito, espaços, consumo e pré-requisito.
  Interpretações: item lançado é **cópia** do molde; pré-requisito = classe e/ou perícia com total > 0 (conferidos) + texto
  (informativo); quem não cumpre carrega mas não usa; o mestre pode usar por qualquer um; item esgotado é apagado;
  inventário conta **espaços**, não itens; "Taverna" = consumíveis de comer/beber, "Sebo" = livros/mapas/achados.
- **Bestiário — decisão do produto.** Bichos como classes (com dados por atributo), besta-conceito com formas, invocação no grupo,
  grid, morte automática. Interpretações: o **nível é escolhido ao invocar** (a besta guarda valores de nível 1, como a classe);
  bichos não ganham pontos de perícia por nível; morte = vida **ou mana** em 0 (mesma regra das fichas); uma casa do grid por
  bicho; só bichos no grid (fichas no grid ficam para depois); cartela polimórfica (`Habilidade.bestaId`) para reaproveitar tudo.
- **Itens e bichos sem "o que vale no grupo".** O mestre tem o catálogo sempre disponível; só a exclusividade restringe.
- **Cartas pequenas em grade, detalhes em pop-up — decisão do produto.** Corrige os botões que saíam da carta: a barra virou ícones
  (mover, editar, aprimorar, excluir) que quebram linha; os detalhes completos abrem num modal com as mesmas ações.
- **Status na ficha visível sempre para o mestre.** O seletor só aparecia se o grupo tivesse status ativados e não tinha título;
  virou o quadro "Status" (com aviso e link quando não há status ativados) e um botão Status em cada membro na página do grupo.
- **Fichas e inventário pensados para celular.** Itens em linhas grandes e tocáveis com ações num pop-up; barra do topo rola de lado.
- **Classe fixa a partir de classe do mestre**: script `npm run fixar-classe` (troca perícias pelas base, tira status próprios das cartas,
  conceito e exclusividade). Escolhido em vez de colocar no seed para não congelar a classe enquanto o designer ainda edita;
  `--devolver nick` desfaz. Em produção, rodar o script lá também (ou mover a classe para o seed quando estiver pronta).
- **Skill de balanceamento** em `.claude/skills/balancear` (método + calculadora `calc.mjs`) e `npm run exportar` para gerar o JSON.
  Referências de equilíbrio ("3 a 5 turnos para derrubar a vida mediana" etc.) são proposta inicial, ajustáveis pelo designer.
- **Navegação lateral e menu do perfil — decisão do produto.** Na área logada, os links da interface (mestre ou jogador) ficam numa
  barra lateral; no celular ela vira gaveta (botão de menu no topo, fecha ao trocar de página ou tocar fora). Clicar no perfil abre um
  menu com Editar perfil e Sair (o botão de sair separado saiu). A área pública continua com links no topo.

## 2026-10-13
- **"Conceito" vira "Arquétipo" na interface — decisão do produto.** Arquétipo (de classe), arquétipo de raça e arquétipo de criatura;
  as variações continuam subclasse, sub-raça e forma. Tabelas e rotas mantêm os nomes antigos (`ClasseConceito`, `/api/conceitos`...)
  para não mexer no banco por causa de um rótulo.
- **"Bicho" vira "criatura" — decisão do produto** (escolhida entre Criatura, Ameaça, Fera e Adversário). O menu continua "Bestiário".
- **Categorias de item personalizáveis — decisão do produto.** As 4 categorias viram tabela: fixas do sistema (somente leitura, como os
  status fixos) + criadas pelo mestre com nome, descrição e ícone de uma lista fechada (sem upload). Escolhido o modelo dos status
  (fixas + próprias) em vez do das perícias (cópia por mestre) para não duplicar linhas para cada mestre.
- **A migration `itens_bestiario_tipo_efeito` já estava aplicada** quando o arquivo foi regenerado por engano; o arquivo foi restaurado
  byte a byte (checksum igual ao de `_prisma_migrations`) e as categorias foram para uma migration nova (`categorias_de_item`).
- **Documentação só na área pública — decisão do produto.** O link Documentação saiu da barra lateral das interfaces (ele levava para
  fora do app); a documentação fica na home. Ganhou **busca por palavras** (sem IA): ignora acentos e maiúsculas, o tópico precisa ter
  todas as palavras, e o texto é lido renderizando os tópicos escondidos na primeira busca.
- **Botão de menu só no celular.** A regra `.topo__menu { display: none }` perdia para `.btn` (CSS carregado depois); usa `.topo .topo__menu`.
- **Seed de teste** (`npm run db:seed-teste`): conteúdo para testar tudo na conta de um mestre (padrão @paulo), com ids fixos
  (`00000000-0000-4000-9xxx-...`), idempotente e sem apagar nada do mestre. Jogadores de teste são perfis sem login (@teste_ana,
  @teste_bruno, @teste_caio), só para o mestre ver fichas. Grupo "Mesa de teste", código `TESTEA`.
- **Sem grid no sistema — decisão do produto.** O grid de batalha é totalmente físico. Saíram a seção Campo de batalha, o tamanho do grid
  do grupo e a posição das criaturas (migration `remove_grid`). As criaturas continuam: invocar, ficha, recursos, remover, morte automática.
- **Sem conteúdo pronto no banco — decisão do produto.** Apagados o conteúdo do seed de teste, as 3 classes fixas de exemplo
  (Lâmina Rubra, Bastião, Tecelã de Luz) e a conta @teste com a ficha dela (usava a Lâmina Rubra). Ficaram a estrutura do sistema
  (atributos, perícias base, status e categorias fixas) e tudo o que @paulo criou. O `db:seed` não cria mais classes e o
  `db:seed-teste` foi removido.
- **NPCs com ficha — decisão do produto.** Raça obrigatória, classe opcional (NPC simples = só raça, sem cartas, com base de
  vida/mana/esforço própria), nível, dados, perícias, cartas e inventário; geral ou exclusivo de um grupo. Interpretações: NPC é uma
  entidade própria (não uma `Ficha`), porque NPC geral não pertence a grupo e não tem jogador; NPC não ganha pontos de perícia por
  nível, o mestre dá pontos extras direto; morte não apaga o NPC (só avisa); mestre pode mudar o nível para baixo (a regra de não descer
  vale para personagens de jogadores). Para o inventário, `Item.grupoId` passou a ser opcional (item de NPC geral não tem grupo) e
  ganhou `npcId`; itens com NPC não aparecem como vagos.
- **Correções do mapeamento de inconsistências (2026-10-13).** Item com NPC geral não pertence a grupo (excluir grupo não o apaga);
  excluir grupo solta os itens que estão com NPCs; nível necessário da carta não pode alcançar um aprimoramento; nomes de criatura
  continuam do maior número (sem repetir); nível máximo 100 ao subir; NPC exclusivo só entrega itens dentro do grupo dele;
  raça/classe exclusiva só em NPC do mesmo grupo; não vira exclusivo o que está em uso fora do grupo (`EXCLUSIVO_EM_USO`);
  barra lateral lembra a interface em páginas comuns; busca da documentação visível no celular; soma de perícias unificada.
- **Jogador só diminui a vida — decisão do produto.** Aumentar a vida (cura) é só o mestre. Interpretado só para a vida; mana e
  esforço o jogador continua ajustando nos dois sentidos.
- **Esforço continua manual — decisão do produto.** O app não desconta esforço ao rolar.
- **Status em NPCs e criaturas — decisão do produto.** Tabelas `NpcStatus` e `CriaturaStatus`; valem os status do grupo (NPC exclusivo,
  criatura) ou todos os do mestre (NPC geral).
- **Perícia do teste na habilidade — decisão do produto.** Campo opcional `Habilidade.periciaId` (opcional para não invalidar as cartas
  que já existem); a ficha de cada personagem mostra o teste pronto para usar a carta. Duplicar classe e `fixar-classe` remapeiam a perícia.
- **Kits de RPG no lugar de "exclusivo de um grupo" (2026-10-13) — decisão do produto.** Kits substituem a exclusividade e uma coisa
  pode estar em vários kits. Vale para classes, raças, atributos, perícias, status, itens do catálogo, criaturas e NPCs. Interpretações:
  sem kit = geral (aparece em todos); o kit ativo é guardado no navegador (filtro de interface, não dado do jogo) e vira o kit padrão
  do que for criado; o kit do grupo só pré-marca o que vale (não trava o PUT de disponíveis) e filtra itens, criaturas e NPCs mostrados
  no grupo; excluir kit não apaga conteúdo. A migration converteu os dados: um kit por grupo que tinha exclusivos, ligado ao grupo.
  As regras antigas de exclusividade (`EXCLUSIVO_EM_USO`, NPC exclusivo só com raça/classe do grupo) deixaram de existir.
- **Kit ativo mostra só o kit (2026-10-13) — decisão do produto.** Com um kit ativo, as listas do mestre não mostram o geral; o geral
  aparece em "Todos". Interpretações: o que é fixo do sistema (classes fixas, atributos e status fixos) continua aparecendo, porque não
  pode entrar em kit; no grupo com kit, itens, criaturas, NPCs e a pré-marcação continuam com o do kit mais o geral.
