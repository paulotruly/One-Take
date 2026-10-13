# Modelo de dados

Fonte da verdade: `api/prisma/schema.prisma`. Migrations em `api/prisma/migrations/`.

```
Perfil 1 ──< Classe (donoId, nulo = fixa)
Classe 1 ──< Habilidade   (a "cartela" da classe = suas habilidades por `ordem`)
Classe 1 ──< ClassePericia (modificador) >── 1 Pericia
Perfil 1 ──< Pericia (donoId; nulo = perícia base do sistema)
Atributo 1 ──< Pericia            (Atributo.donoId nulo = fixo do sistema)
Perfil 1 ──< Raca 1 ──< RacaPericia (pontos) >── 1 Pericia
Perfil(mestre) 1 ──< Grupo ──< ClasseNoGrupo / RacaNoGrupo / AtributoNoGrupo / PericiaNoGrupo
Grupo 1 ──< Ficha >── Perfil(jogador), Classe, Raca     (unique grupoId+jogadorId)
Ficha 1 ──< FichaAtributo (dados) / FichaPericia (pontos de nível) / Item ;  Grupo 1 ──< Item (fichaId nulo = vago)
Perfil 1 ──< Kit ──< KitClasse / KitRaca / KitAtributo / KitPericia / KitStatus / KitItemModelo / KitBesta / KitNpc   (sem kit = geral)
Kit 1 ──< Grupo (kitId?, SetNull)
Perfil 1 ──< RacaConceito 1 ──< Raca (conceitoId?) ;  Perfil 1 ──< BestaConceito 1 ──< Besta (conceitoId?)
Perfil 1 ──< ItemModelo 1 ──< Item (modeloId?, cópia dos campos)
Perfil 1 ──< Besta 1 ──< Habilidade (bestaId) / BestaPericia (modificador) / BestaAtributo (dados)
Perfil 1 ──< Npc >── Raca, Classe? ; Npc 1 ──< NpcAtributo (dados) / NpcPericia (pontos extras) / Item (npcId)
Grupo 1 ──< Criatura >── Besta   (criatura invocada: nível e recursos atuais)
Perfil(jogador) 1 ──< FichaArquivada (cópia somente leitura)
```

## Entidades
| Tabela | Campos principais | Observações |
|---|---|---|
| `Perfil` | `id` (= `auth.users.id`), `email` (do login no Auth: interno `<nick>@one-take.local` nas contas do app), `nickname` (único), `papel`, `nome?`, `fotoUrl?`, `dataNascimento?` (DATE; obrigatória em cadastros novos), `codigoRecuperacaoHash?` (SHA-256), `codigoRecuperacaoEm?`, `sessoesValidasDesde?`, `exclusaoIniciadaEm?` | Criado no cadastro (`POST /api/cadastro`) ou no 1º acesso de uma conta criada fora do app |
| `FichaArquivada` | `jogadorId`, `nome`, `nivel`, `classe`, `raca`, `grupo` (textos), `motivo`, `conteudo` (JSON), `arquivadaEm` | Cópia da ficha que saiu do grupo; sem FK para o conteúdo do mestre |
| `Classe` | `grupo`, `titulo`, `descricao`, `imagemUrl?`, `pontosVida`, `pontosMana`, `pontosEsforco`, `donoId?`, `origemId?` | `donoId` nulo = fixa |
| `Habilidade` | `classeId?` **ou** `bestaId?` (CHECK: exatamente um), `titulo`, `descricao`, `condicao?`, `tipoEfeito` (enum `TipoEfeito`), `periciaId?` (perícia do teste, SetNull), `descricaoEfeito`, `limiteUsos?` + `limitePor?` (enum `LimiteUso`: COMBATE, SESSAO; os dois juntos ou nulos, CHECK), `nivelNecessario` (≥1, padrão 1), `custoMana` (≥0, padrão 0 = sem custo), `ordem` | Cartela de classe ou de criatura |
| `Pericia` | `nome`, `descricao`, `categoria`, `atributoId`, `donoId?`, `origemId?` | Catálogo. `donoId` nulo = base do sistema. Nome único por dono |
| `ClassePericia` | `classeId`, `periciaId`, `modificador` | Perícia que a classe tem. PK composta |
| `Atributo` | `nome`, `descricao`, `ordem`, `donoId?` | `donoId` nulo = fixo (Capacidade física, Carisma, Conhecimento). Nome único por dono |
| `Raca` | `donoId`, `titulo`, `descricao`, `imagemUrl?`, `deslocamento` (≥1), `conceitoId?` | Do mestre; `conceitoId` = sub-raça (SetNull ao excluir o conceito) |
| `RacaConceito` | `donoId`, `titulo`, `descricao` | raça generalista que agrupa sub-raças |
| `RacaPericia` | `racaId`, `periciaId`, `pontos` (≥1) | Perícia de base da raça. PK composta |
| `Grupo` | `kitId?` (SetNull), `mestreId`, `titulo`, `sinopse`, `genero`, `imagemUrl?`, `limiteMembros` (1–50), `codigo` (único), `permitirClassesRepetidas` | O RPG do mestre |
| `Kit` | `donoId`, `nome`, `descricao` | Kit de RPG do mestre |
| `KitClasse`, `KitRaca`, `KitAtributo`, `KitPericia`, `KitStatus`, `KitItemModelo`, `KitBesta`, `KitNpc` | `kitId` + id da coisa | PK composta, índice no id da coisa |
| `ClasseNoGrupo`, `RacaNoGrupo`, `AtributoNoGrupo`, `PericiaNoGrupo` | `grupoId` + id do item | O que vale no grupo |
| `Ficha` | `grupoId`, `jogadorId`, `nome`, `historia?`, `imagemUrl?`, `classeId`, `racaId`, `nivel`, `vidaAtual`, `manaAtual`, `esforcoAtual`, `pontosPericiaDisponiveis` | 1 por jogador por grupo |
| `FichaAtributo` | `fichaId`, `atributoId`, `dados` | d20 por atributo |
| `FichaPericia` | `fichaId`, `periciaId`, `pontos` | pontos de nível gastos |
| `CategoriaItem` | `nome`, `descricao`, `icone` (chave da lista `ICONES_ITEM`), `ordem`, `donoId?` | `donoId` nulo = fixa (ids `...8004-1..4`); nome único por dono |
| `ItemModelo` | `donoId`, `categoriaId?`, `nome`, `descricao`, `imagemUrl?`, `efeito?`, `espacos` (≥1), `usosMaximos?` (≥1; nulo = sem limite), `requisito?`, `requisitoPericiaId?`, `requisitoClasseId?` | Catálogo de itens do mestre (molde) |
| `Item` | `grupoId?`, `fichaId?`, `npcId?`, `modeloId?`, mesmos campos do molde + `usosRestantes?` | Com ficha ou NPC = no inventário; nenhum = vago no grupo. CHECK: tem grupo ou NPC; não está com ficha e NPC ao mesmo tempo |
| `Npc` | `donoId`, `nome`, `descricao`, `imagemUrl?`, `racaId`, `classeId?`, `nivel` (≥1), `vidaBase?`/`manaBase?`/`esforcoBase?` (obrigatórios sem classe, CHECK), `vidaAtual`, `manaAtual`, `esforcoAtual` | Raça e classe com `RESTRICT` (409 `EM_USO`) |
| `NpcStatus` / `CriaturaStatus` | `npcId`/`criaturaId`, `statusId`, `aplicadoEm` | status aplicados pelo mestre |
| `NpcAtributo` / `NpcPericia` | `npcId` + `atributoId`/`periciaId`, `dados`/`pontos` | d20 por atributo / pontos extras na perícia |
| `Besta` | `donoId`, `titulo`, `descricao`, `imagemUrl?`, `pontosVida/Mana/Esforco` (≥1), `deslocamento` (≥1), `conceitoId?` | Criatura do bestiário |
| `BestaConceito` | `donoId`, `titulo`, `descricao` | criatura generalista com formas |
| `BestaPericia` | `bestaId`, `periciaId`, `modificador` | PK composta |
| `BestaAtributo` | `bestaId`, `atributoId`, `dados` (≥0) | d20 da criatura por atributo |
| `Criatura` | `grupoId`, `bestaId`, `nome`, `nivel` (≥1), `vidaAtual`, `manaAtual`, `esforcoAtual` | Criatura invocada no grupo; apagado ao morrer ou ser removido |
| `Status` | `nome`, `descricao`, `efeito`, `tipo` (BUFF/DEBUFF/MISTO), `gatilho?` (VIDA_ZERO/MANA_ZERO/ESFORCO_ZERO), `ordem`, `donoId?` | `donoId` nulo = fixo; só fixos têm gatilho |
| `StatusNoGrupo` | `grupoId`, `statusId` | status ativados no grupo |
| `FichaStatus` | `fichaId`, `statusId`, `aplicadoEm` | status aplicados pelo mestre |
`Habilidade.statusId?` = status que a carta ativa (SetNull se o status for excluído).
| `ClasseConceito` | `donoId`, `titulo`, `descricao` | classe generalista; `Classe.conceitoId?` liga as subclasses (SetNull ao excluir) |
| `HabilidadeAprimoramento` | `habilidadeId`, `nivel` (≥2, único por carta), `titulo?`, `descricaoEfeito?`, `condicao?`, `limiteUsos?` + `limitePor?` (juntos), `custoMana?`, `statusId?` | nulos = não mudam |

Enums: `Papel`, `GrupoClasse` (COMBATENTE, VANGUARDISTA, SUPORTE), `CategoriaPericia` (CORPO_A_CORPO, MAGIA, PONTARIA, FISICO, DEFESA, SOCIAL, CONHECIMENTO, PERCEPCAO),
`TipoEfeito` (DANO, DEFESA, CURA, SUPORTE, FORTALECIMENTO, ENFRAQUECIMENTO, CONTROLE, MOBILIDADE, INVOCACAO, UTILIDADE).
Nomes no código x na interface: `ClasseConceito`/`RacaConceito`/`BestaConceito` = **Arquétipo** (de classe, de raça, de criatura);
`Besta` = criatura do bestiário; `Criatura` = criatura invocada num grupo.
`Perfil.papel = MESTRE` significa "interface de mestre ativada"; toda conta joga.
`Perfil.catalogoIniciado` marca que o mestre já recebeu a cópia das perícias base.

## Por que assim
- **Fixa = `donoId` nulo.** Uma única fonte da verdade; impossível ter "fixa com dono". A API expõe `fixa: boolean`.
- **Valores base na Classe, atuais na Ficha (futura).** A ficha vai referenciar `classeId` e guardar vida/mana/esforço atuais.
  CHECK no banco garante pontos ≥ 1 (nenhuma classe começa zerada).
- **Cartela única, sem tabela.** Cada classe tem um só deck, sem nome nem atributos; então a cartela é apenas o
  conjunto de `Habilidade` com aquele `classeId`. Se um dia voltarem vários decks, recria-se a entidade
  `Cartela` e uma migration move as habilidades para uma cartela padrão por classe.
- **`ordem` inteira** em Habilidade: reordenar reescreve as posições das cartas da classe numa transação (decks são pequenos).
- **`nivelNecessario`** com CHECK ≥ 1; será consumido pelas fichas.
- **`custoMana` inteiro com 0 = sem custo** (em vez de nulo): mais simples de somar/comparar quando as fichas gastarem mana. CHECK ≥ 0.
- **`tipoEfeito` é enum** (lista fixa, decisão do produto de 2026-10-12). A migration `itens_bestiario_tipo_efeito` converteu os textos
  antigos (Dano, Defesa, Suporte, Buff→Fortalecimento, Debuff→Enfraquecimento; o resto→Utilidade). Rótulos e descrições ficam no front.
- **Perícia como catálogo + vínculo.** A definição (nome, descrição, categoria, atributo) vive em `Pericia`;
  o número específico da classe vive em `ClassePericia.modificador`. Editar a perícia no catálogo reflete em todas as classes que a usam.
- **Um catálogo por mestre**, copiado das perícias base (`donoId` nulo) uma única vez (`catalogoIniciado`), para cada mestre
  personalizar sem afetar os outros. `origemId` liga a cópia à base; é usado ao duplicar classe fixa para achar a perícia equivalente.
- **Categorias e atributos são enums** (listas fixas do sistema); rótulos, ícones (lucide) e descrições ficam no front (`features/pericias/types.ts`).
- Excluir perícia do catálogo remove o vínculo das classes (cascata em `ClassePericia`).
- **`imagemUrl`** é um link externo colado pelo mestre (não há upload por enquanto). Duplicar copia o link.
  Se o upload voltar, provavelmente vira `imagemPath` (caminho no bucket) — ver DECISOES.
- **`origemId`** registra de qual classe uma cópia veio (informativo, sem FK — a origem pode ser excluída).
- **Exclusão em cascata** de Classe → Habilidades e vínculos de perícia (`ClassePericia`). Quando existirem fichas, rever (ver ROADMAP).
- **RLS ligado sem policies** em todas as tabelas: a Data API do Supabase (chave anon) não enxerga nada;
  só a nossa API (papel `postgres`, que ignora RLS) acessa os dados.
- UUIDs em tudo, para ids poderem ir para URLs sem expor contagem.
- **Atributo como tabela** (não enum): 3 fixos do sistema + os de cada mestre. Perícia aponta para `atributoId`
  (`ON DELETE RESTRICT`: a API só exclui atributo sem perícias). A migration `atributos` converteu CF para Capacidade física
  e CC para Carisma (perícias sociais e Vontade) ou Conhecimento (o resto).
- **Raça do mestre** (sem raças fixas por enquanto). Perícias de base em `RacaPericia.pontos`, escolhidas do catálogo.
- **Constantes de ficha** (3 pontos de atributo, inventário 5 + 2 por nível) ficam em `api/src/regras/ficha.ts`.
- **Disponibilidade por tabelas de junção** (`*NoGrupo`): uma fonte só para "o que vale no grupo". O kit do grupo só serve
  para a tela pré-marcar; não restringe o que é gravado.
- **Kits de RPG por tabelas de junção** (`Kit*`, muitos-para-muitos, Cascade dos dois lados): uma coisa pode estar em vários kits;
  sem linha = geral. Filtro "do kit + geral" em `visivelNoKit` (`api/src/lib/kits.ts`); `definirKits` troca a lista inteira.
  A migration `kits_de_rpg` substituiu `grupoExclusivoId`: criou um kit por grupo que tinha coisas exclusivas (com o nome do grupo),
  ligou o grupo a ele e moveu as exclusivas para o kit (perícias pelos atributos exclusivos).
- **Ficha guarda só o que muda** (nível, atuais, dados, pontos gastos). Máximos, cartas disponíveis, perícias somadas
  e capacidade do inventário são calculados com `api/src/regras/` a cada leitura.
- **Perícias base (classes fixas) contam como a cópia do catálogo do mestre** (mesmo `origemId`) ao somar na ficha.
- **`ON DELETE RESTRICT`** de Ficha para Classe e Raca, e de FichaAtributo/FichaPericia para Atributo/Pericia: não dá
  para excluir algo usado por fichas (a API responde 409 `EM_USO`). Excluir o grupo apaga fichas e itens.
- **Status automáticos não são gravados na ficha**: são calculados dos recursos atuais (`api/src/regras/status.ts`) a cada leitura,
  e só aparecem se o status estiver ativado no grupo. Os aplicados pelo mestre ficam em `FichaStatus`.
- **Aprimoramento guarda só o que muda**; a carta final é calculada por `aplicarAprimoramentos` (`api/src/regras/progressao.ts`)
  com o nível da ficha. Duplicar classe copia os aprimoramentos.
- **Cartela polimórfica** (`Habilidade.classeId` ou `bestaId`): criaturas reaproveitam cartas, aprimoramentos, telas e regras de nível.
  O CHECK `Habilidade_dono` garante exatamente um dono.
- **Item lançado = cópia do molde** (não referência): o item na mão do jogador não muda se o mestre editar o catálogo, e o
  catálogo pode ser apagado sem quebrar inventários (`modeloId` SetNull). `usosRestantes` só existe na cópia.
- **Capacidade do inventário soma `espacos`** (`espacosUsados` em `regras/ficha.ts`), não a quantidade de itens.
- **Pré-requisito do item** é conferido por `motivoParaNaoUsar` (`regras/ficha.ts`): classe igual e/ou perícia com total > 0
  (perícia base de classe fixa conta como a cópia do catálogo do mestre).
- **Criatura guarda só o que muda** (nível e atuais; o posicionamento é no grid físico da mesa); máximos e cartas vêm da besta + `regras/progressao.ts`. Morte (vida
  ou mana 0, `estaMorto`) apaga a linha: não há "criatura morto" guardado.
- **Categoria de item como tabela** (era enum até a migration `categorias_de_item`, que converteu os valores para as 4 fixas).
  `categoriaId` é SetNull: apagar a categoria não apaga itens.
- **Itens, criaturas e NPCs não têm tabelas `*NoGrupo`**: no grupo aparecem os do kit dele mais os gerais (sem kit: todos).
- **Soma de perícias numa função só** (`api/src/modules/pericias/soma.ts`): ficha, NPC e pré-requisito de item usam `somarPericias`;
  o teste de uma carta para um personagem sai de `testeDaCarta`.
- **Sem e-mail de contato** (migration `recuperacao_sem_email`, depois de `email_senha_exclusao`): a conta não guarda e-mail real. O
  Supabase Auth usa o e-mail interno do nome de usuário só como identificador técnico. A troca de senha usa o **código de recuperação**:
  20 caracteres (100 bits) do alfabeto Crockford, mostrado uma vez e guardado como SHA-256 (`api/src/lib/codigo-recuperacao.ts`),
  trocado a cada uso com `updateMany` condicionado ao hash antigo (dois usos simultâneos: só um vence). A migration apagou os e-mails
  guardados, a tabela `TokenConta` e o enum `TipoTokenConta`.
- **Ficha arquivada como retrato JSON** (`modules/fichas/retrato.ts`): calculada com as regras na hora de arquivar, sem dados de outras
  pessoas (sem mestre nem outros membros); assim o personagem sobrevive à exclusão do grupo e do conteúdo do mestre.
- **Exclusão de conta em ordem explícita** (`excluirConta` em `conta.service.ts`), por causa dos FKs RESTRICT de Ficha/Npc: marca a conta,
  tira os retratos, apaga o usuário do Auth e, numa transação, cria as cópias, apaga os grupos, as fichas dele, os NPCs e o perfil (o resto
  cai em cascata). Idempotente e retomável (`npm run concluir-exclusoes`).
- **Data de nascimento como `DATE`** (migration `data_nascimento`), nula em contas anteriores: a idade mínima (12 anos, `api/src/regras/conta.ts`)
  é conferida no cadastro com a data do servidor. Só o dono vê.
- **Limite de uso como dois campos** (migration `limite_de_uso`): era texto livre (`limite`). A migration converteu os textos no padrão
  "N uso(s)/vez(es) por combate|sessão" e mandaria o resto para o fim da `condicao` da carta (no banco do responsável, todos converteram).
  O texto mostrado ("2 vezes por combate") sai de `rotuloLimite` (`api/src/regras/limite.ts`; o front tem a mesma função em `features/classes/types.ts`).
