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
Classe / Raca / Atributo / ItemModelo / Besta .grupoExclusivoId? >── Grupo   (nulo = geral)
Perfil 1 ──< RacaConceito 1 ──< Raca (conceitoId?) ;  Perfil 1 ──< BestaConceito 1 ──< Besta (conceitoId?)
Perfil 1 ──< ItemModelo 1 ──< Item (modeloId?, cópia dos campos)
Perfil 1 ──< Besta 1 ──< Habilidade (bestaId) / BestaPericia (modificador) / BestaAtributo (dados)
Grupo 1 ──< Criatura >── Besta   (criatura invocada: nível e recursos atuais)
```

## Entidades
| Tabela | Campos principais | Observações |
|---|---|---|
| `Perfil` | `id` (= `auth.users.id`), `email` (interno `<nick>@one-take.local` para contas do app), `nickname` (único), `papel`, `nome?`, `fotoUrl?` | Criado no 1º acesso à API com o papel e nome escolhidos no cadastro |
| `Classe` | `grupo`, `titulo`, `descricao`, `imagemUrl?`, `pontosVida`, `pontosMana`, `pontosEsforco`, `donoId?`, `origemId?` | `donoId` nulo = fixa |
| `Habilidade` | `classeId?` **ou** `bestaId?` (CHECK: exatamente um), `titulo`, `descricao`, `condicao?`, `tipoEfeito` (enum `TipoEfeito`), `descricaoEfeito`, `limite?`, `nivelNecessario` (≥1, padrão 1), `custoMana` (≥0, padrão 0 = sem custo), `ordem` | Cartela de classe ou de criatura |
| `Pericia` | `nome`, `descricao`, `categoria`, `atributoId`, `donoId?`, `origemId?` | Catálogo. `donoId` nulo = base do sistema. Nome único por dono |
| `ClassePericia` | `classeId`, `periciaId`, `modificador` | Perícia que a classe tem. PK composta |
| `Atributo` | `nome`, `descricao`, `ordem`, `donoId?` | `donoId` nulo = fixo (Capacidade física, Carisma, Conhecimento). Nome único por dono |
| `Raca` | `donoId`, `titulo`, `descricao`, `imagemUrl?`, `deslocamento` (≥1), `conceitoId?` | Do mestre; `conceitoId` = sub-raça (SetNull ao excluir o conceito) |
| `RacaConceito` | `donoId`, `titulo`, `descricao` | raça generalista que agrupa sub-raças |
| `RacaPericia` | `racaId`, `periciaId`, `pontos` (≥1) | Perícia de base da raça. PK composta |
| `Grupo` | `mestreId`, `titulo`, `sinopse`, `genero`, `imagemUrl?`, `limiteMembros` (1–50), `codigo` (único), `permitirClassesRepetidas` | O RPG do mestre |
| `ClasseNoGrupo`, `RacaNoGrupo`, `AtributoNoGrupo`, `PericiaNoGrupo` | `grupoId` + id do item | O que vale no grupo |
| `Ficha` | `grupoId`, `jogadorId`, `nome`, `historia?`, `imagemUrl?`, `classeId`, `racaId`, `nivel`, `vidaAtual`, `manaAtual`, `esforcoAtual`, `pontosPericiaDisponiveis` | 1 por jogador por grupo |
| `FichaAtributo` | `fichaId`, `atributoId`, `dados` | d20 por atributo |
| `FichaPericia` | `fichaId`, `periciaId`, `pontos` | pontos de nível gastos |
| `CategoriaItem` | `nome`, `descricao`, `icone` (chave da lista `ICONES_ITEM`), `ordem`, `donoId?` | `donoId` nulo = fixa (ids `...8004-1..4`); nome único por dono |
| `ItemModelo` | `donoId`, `categoriaId?`, `nome`, `descricao`, `imagemUrl?`, `efeito?`, `espacos` (≥1), `usosMaximos?` (≥1; nulo = sem limite), `requisito?`, `requisitoPericiaId?`, `requisitoClasseId?`, `grupoExclusivoId?` | Catálogo de itens do mestre (molde) |
| `Item` | `grupoId`, `fichaId?`, `modeloId?`, mesmos campos do molde + `usosRestantes?` | `fichaId` nulo = vago no grupo. Cópia do molde ao lançar |
| `Besta` | `donoId`, `titulo`, `descricao`, `imagemUrl?`, `pontosVida/Mana/Esforco` (≥1), `deslocamento` (≥1), `conceitoId?`, `grupoExclusivoId?` | Criatura do bestiário |
| `BestaConceito` | `donoId`, `titulo`, `descricao` | criatura generalista com formas |
| `BestaPericia` | `bestaId`, `periciaId`, `modificador` | PK composta |
| `BestaAtributo` | `bestaId`, `atributoId`, `dados` (≥0) | d20 da criatura por atributo |
| `Criatura` | `grupoId`, `bestaId`, `nome`, `nivel` (≥1), `vidaAtual`, `manaAtual`, `esforcoAtual` | Criatura invocada no grupo; apagado ao morrer ou ser removido |
| `Status` | `nome`, `descricao`, `efeito`, `tipo` (BUFF/DEBUFF/MISTO), `gatilho?` (VIDA_ZERO/MANA_ZERO/ESFORCO_ZERO), `ordem`, `donoId?` | `donoId` nulo = fixo; só fixos têm gatilho |
| `StatusNoGrupo` | `grupoId`, `statusId` | status ativados no grupo |
| `FichaStatus` | `fichaId`, `statusId`, `aplicadoEm` | status aplicados pelo mestre |
`Habilidade.statusId?` = status que a carta ativa (SetNull se o status for excluído).
| `ClasseConceito` | `donoId`, `titulo`, `descricao` | classe generalista; `Classe.conceitoId?` liga as subclasses (SetNull ao excluir) |
| `HabilidadeAprimoramento` | `habilidadeId`, `nivel` (≥2, único por carta), `titulo?`, `descricaoEfeito?`, `condicao?`, `limite?`, `custoMana?`, `statusId?` | nulos = não mudam |

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
- **Disponibilidade por tabelas de junção** (`*NoGrupo`): uma fonte só para "o que vale no grupo". Exclusividade
  (`grupoExclusivoId` em Classe/Raca/Atributo) é aplicada pela API: ao marcar exclusivo, o item sai dos outros grupos
  e entra no dele; o grupo não aceita item exclusivo de outro grupo.
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
- **Itens e criaturas não têm tabelas `*NoGrupo`**: ficam sempre disponíveis ao mestre; só a exclusividade (`grupoExclusivoId`) restringe.
