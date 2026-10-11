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
Classe / Raca / Atributo .grupoExclusivoId? >── Grupo   (nulo = geral)
```

## Entidades
| Tabela | Campos principais | Observações |
|---|---|---|
| `Perfil` | `id` (= `auth.users.id`), `email` (interno `<nick>@one-take.local` para contas do app), `nickname` (único), `papel`, `nome?`, `fotoUrl?` | Criado no 1º acesso à API com o papel e nome escolhidos no cadastro |
| `Classe` | `grupo`, `titulo`, `descricao`, `imagemUrl?`, `pontosVida`, `pontosMana`, `pontosEsforco`, `donoId?`, `origemId?` | `donoId` nulo = fixa |
| `Habilidade` | `classeId`, `titulo`, `descricao`, `condicao?`, `tipoEfeito` (texto livre), `descricaoEfeito`, `limite?`, `nivelNecessario` (≥1, padrão 1), `custoMana` (≥0, padrão 0 = sem custo), `ordem` | |
| `Pericia` | `nome`, `descricao`, `categoria`, `atributoId`, `donoId?`, `origemId?` | Catálogo. `donoId` nulo = base do sistema. Nome único por dono |
| `ClassePericia` | `classeId`, `periciaId`, `modificador` | Perícia que a classe tem. PK composta |
| `Atributo` | `nome`, `descricao`, `ordem`, `donoId?` | `donoId` nulo = fixo (Capacidade física, Carisma, Conhecimento). Nome único por dono |
| `Raca` | `donoId`, `titulo`, `descricao`, `imagemUrl?`, `deslocamento` (≥1) | Do mestre |
| `RacaPericia` | `racaId`, `periciaId`, `pontos` (≥1) | Perícia de base da raça. PK composta |
| `Grupo` | `mestreId`, `titulo`, `sinopse`, `genero`, `imagemUrl?`, `limiteMembros` (1–50), `codigo` (único), `permitirClassesRepetidas` | O RPG do mestre |
| `ClasseNoGrupo`, `RacaNoGrupo`, `AtributoNoGrupo`, `PericiaNoGrupo` | `grupoId` + id do item | O que vale no grupo |
| `Ficha` | `grupoId`, `jogadorId`, `nome`, `historia?`, `imagemUrl?`, `classeId`, `racaId`, `nivel`, `vidaAtual`, `manaAtual`, `esforcoAtual`, `pontosPericiaDisponiveis` | 1 por jogador por grupo |
| `FichaAtributo` | `fichaId`, `atributoId`, `dados` | d20 por atributo |
| `FichaPericia` | `fichaId`, `periciaId`, `pontos` | pontos de nível gastos |
| `Item` | `grupoId`, `fichaId?`, `nome`, `descricao` | `fichaId` nulo = vago no grupo |
| `Status` | `nome`, `descricao`, `efeito`, `tipo` (BUFF/DEBUFF/MISTO), `gatilho?` (VIDA_ZERO/MANA_ZERO/ESFORCO_ZERO), `ordem`, `donoId?` | `donoId` nulo = fixo; só fixos têm gatilho |
| `StatusNoGrupo` | `grupoId`, `statusId` | status ativados no grupo |
| `FichaStatus` | `fichaId`, `statusId`, `aplicadoEm` | status aplicados pelo mestre |
`Habilidade.statusId?` = status que a carta ativa (SetNull se o status for excluído).
| `ClasseConceito` | `donoId`, `titulo`, `descricao` | classe generalista; `Classe.conceitoId?` liga as subclasses (SetNull ao excluir) |
| `HabilidadeAprimoramento` | `habilidadeId`, `nivel` (≥2, único por carta), `titulo?`, `descricaoEfeito?`, `condicao?`, `limite?`, `custoMana?`, `statusId?` | nulos = não mudam |

Enums: `Papel`, `GrupoClasse` (COMBATENTE, VANGUARDISTA, SUPORTE), `CategoriaPericia` (CORPO_A_CORPO, MAGIA, PONTARIA, FISICO, DEFESA, SOCIAL, CONHECIMENTO, PERCEPCAO).
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
- **`tipoEfeito` é texto livre**, só descritivo: nenhuma regra depende dele. Se um dia o sistema precisar agir pelo tipo, vira enum de novo.
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
