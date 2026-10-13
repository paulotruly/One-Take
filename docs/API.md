# API

Base local: `http://localhost:3333`. JSON em tudo.

## Público (sem login)
| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/nicknames/:nickname` | `{ disponivel, motivo? }` |
| POST | `/api/entrar` | corpo `{ login, senha }` (login = nickname, com ou sem @, ou email antigo) → `{ access_token, refresh_token }` do Supabase; erro = 401 "Nickname ou senha incorretos." |
| GET | `/api/regras` | `{ progressao, ficha: { pontosAtributoIniciais, inventarioInicial, inventarioPorNivel }, teste: { ladosDoDado, dadosComAtributoZero, divisorComAtributoZero, esforcoPorDadoExtra, esforcoComAtributoZero, chances: [{ dt, chances: [{ pontos, chance }] }] }, atributosFixos, statusFixos, regrasPadrao }` |

## Autenticação
Todas as rotas sob `/api` exigem `Authorization: Bearer <access_token do Supabase>`.
Rotas de gestão (classes, habilidades, perícias, raças, atributos, grupos, status, conceitos, bestiário, criaturas invocadas, catálogo de itens)
exigem a **interface de mestre ativada** (papel MESTRE). No primeiro acesso a elas, o catálogo de perícias do mestre é criado a partir das perícias base.
Fichas, convites e itens valem para qualquer conta.

## Erros
Formato único:
```json
{ "error": { "code": "VALIDACAO", "message": "Dados inválidos",
  "details": [{ "campo": "pontosVida", "mensagem": "Deve ser no mínimo 1" }] } }
```
| Status | code | Quando |
|---|---|---|
| 400 | `VALIDACAO` | corpo/query inválido (Zod); `details` por campo |
| 400 | `JSON_INVALIDO`, `REQUISICAO_INVALIDA` | JSON malformado, lista de ordem errada |
| 401 | `NAO_AUTENTICADO` | sem token, token inválido/expirado |
| 403 | `PROIBIDO` | interface de mestre não ativada (ou ação só do mestre do grupo) |
| 403 | `NAO_SABE_USAR` | jogador tenta usar item sem cumprir o pré-requisito |
| 409 | `INVENTARIO_CHEIO` | o item (com seus espaços) não cabe |
| 403 | `SO_MESTRE_CURA` | jogador tentou aumentar a vida da própria ficha (só diminuir) |
| 409 | `NIVEL_MAXIMO` | subir nível além do 100 |
| 409 | `EXCLUSIVO_EM_USO` | tornar exclusivo de um grupo algo usado fora dele |
| 403 | `CLASSE_FIXA` | tentativa de alterar classe fixa (ou seus filhos) |
| 404 | `NAO_ENCONTRADO` | não existe, id malformado, ou pertence a outro mestre |
| 409 | `NOME_EM_USO` | já existe perícia/atributo com esse nome |
| 403 | `ATRIBUTO_FIXO` | tentativa de alterar atributo fixo |
| 409 | `ATRIBUTO_EM_USO` | excluir atributo que ainda tem perícias |
| 409 | `EMAIL_EM_USO` | login de uma conta cujo email já pertence a outro perfil ativo (raro) |
| 500 | `ERRO_INTERNO` | inesperado (logado no servidor) |

## Tipos de resposta
**Classe (resumo)**: `{ id, grupo, titulo, descricao, imagemUrl, pontosVida, pontosMana, pontosEsforco, donoId, origemId, fixa, criadoEm, atualizadoEm }`
**Classe (detalhe)**: resumo + `habilidades: Habilidade[]` (a cartela, por `ordem`) + `pericias: PericiaDaClasse[]` (por atributo e nome).
**Habilidade**: `{ id, classeId, bestaId, periciaId, pericia: { id, nome, atributo } | null, titulo, descricao, condicao, tipoEfeito, descricaoEfeito, limite, nivelNecessario, custoMana, ordem }`
Nas fichas, NPCs e criaturas, cada carta vem também com `teste: { pericia, atributo, teste: "2d20 + 5" } | null`. `periciaId` no POST/PATCH = perícia do catálogo do mestre.
`tipoEfeito`: `DANO | DEFESA | CURA | SUPORTE | FORTALECIMENTO | ENFRAQUECIMENTO | CONTROLE | MOBILIDADE | INVOCACAO | UTILIDADE` (obrigatório; outro valor = 400 "Escolha um tipo de efeito").
**PericiaCatalogo**: `{ id, nome, descricao, categoria, atributoId, atributo: Atributo, donoId, origemId, criadoEm, usosClasses, usosRacas }`
**PericiaDaClasse**: `{ id, nome, descricao, categoria, atributo: Atributo, modificador }` (`id` = id da perícia no catálogo)
**PericiaDaRaca**: `{ id, nome, descricao, categoria, atributo: Atributo, pontos }`
**Atributo**: `{ id, nome, descricao, ordem, fixo }` (na listagem, também `pericias` = nº de perícias do mestre nele)
**Raca**: `{ id, donoId, titulo, descricao, imagemUrl, deslocamento, pericias: PericiaDaRaca[], criadoEm, atualizadoEm }`
`categoria`: `CORPO_A_CORPO | MAGIA | PONTARIA | FISICO | DEFESA | SOCIAL | CONHECIMENTO | PERCEPCAO`.

## Rotas
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/health` | — (público) | `200 { status: "ok", banco: "ok" }` ou `503` |
| GET | `/api/me` | — (qualquer papel) | `{ id, nickname, papel, nome, fotoUrl }` (email nunca é exposto). No 1º acesso cria o perfil com `papel` e `nome` do `user_metadata` do cadastro (papel inválido = JOGADOR); conta recriada herda o perfil antigo |
| POST | `/api/me/mestre` | — | ativa a interface de mestre (papel MESTRE) → perfil |
| PATCH | `/api/me` | `{ nickname?, nome?, fotoUrl? }` (`""` = limpar; nickname 3–20 `[a-z0-9_.-]`, único: 409 `NICKNAME_EM_USO`) | perfil |
| GET | `/api/classes?grupo=SUPORTE` | — | `Classe[]` (fixas primeiro, depois as do mestre; por título) |
| POST | `/api/classes` | `{ grupo, titulo, descricao, imagemUrl?, pontosVida, pontosMana, pontosEsforco }` | `201 Classe` (só a classe; habilidades e perícias vêm depois) |
| GET | `/api/classes/:id` | — | `Classe (detalhe)` |
| GET | `/api/classes/:id/progressao` | — | `{ ganhoPorNivel: { pontosVida, pontosMana, pontosEsforco, pontosPericia }, niveis: [{ nivel, pontosVida, pontosMana, pontosEsforco, pontosPericia, habilidades: id[], novasHabilidades: id[] }] }` — do Nv 1 até max(5, maior nível de carta). Vale para fixas |
| PATCH | `/api/classes/:id` | qualquer subconjunto do POST | `Classe` |
| DELETE | `/api/classes/:id` | — | `204` (cascata) |
| POST | `/api/classes/:id/duplicar` | — | `201 Classe (detalhe)` — cópia "(cópia)" do mestre, com habilidades, perícias e o mesmo link de imagem |
| POST | `/api/classes/:classeId/habilidades` | `{ titulo, descricao, tipoEfeito, descricaoEfeito, condicao?, limite?, nivelNecessario? (1), custoMana? (0) }` | `201 Habilidade` (no fim da cartela). Classe inexistente = 404; fixa = 403 |
| PUT | `/api/classes/:classeId/habilidades/ordem` | `{ ids: string[] }` — exatamente as habilidades da classe, na nova ordem | `Habilidade[]` |
| PATCH | `/api/habilidades/:id` | subconjunto | `Habilidade` |
| DELETE | `/api/habilidades/:id` | — | `204` |
| GET | `/api/pericias` | — | `PericiaCatalogo[]` — catálogo do mestre (por atributo e nome) |
| POST | `/api/pericias` | `{ nome, categoria, atributoId, descricao? ("") }` (atributo fixo ou do mestre) | `201 PericiaCatalogo`; nome repetido = `409 NOME_EM_USO` |
| PATCH | `/api/pericias/:id` | subconjunto | `PericiaCatalogo`; só do próprio catálogo (base/outro mestre = 404) |
| DELETE | `/api/pericias/:id` | — | `204` (remove também das classes e raças que a usam) |
| GET | `/api/atributos` | — | `Atributo[]` fixos + do mestre |
| POST | `/api/atributos` | `{ nome, descricao? }` | `201 Atributo`; nome igual a outro (inclusive fixo) = `409 NOME_EM_USO` |
| PATCH | `/api/atributos/:id` | subconjunto | `Atributo`; fixo = `403 ATRIBUTO_FIXO` |
| DELETE | `/api/atributos/:id` | — | `204`; fixo = 403; com perícias = `409 ATRIBUTO_EM_USO` |
| GET | `/api/racas` | — | `Raca[]` do mestre |
| POST | `/api/racas` | `{ titulo, descricao, deslocamento, imagemUrl? }` (link http(s); `""` = sem imagem) | `201 Raca` |
| GET / PATCH / DELETE | `/api/racas/:id` | subconjunto no PATCH | `Raca` / `204`; de outro mestre = 404 |
| PUT | `/api/racas/:id/pericias/:periciaId` | `{ pontos }` (≥1) | adiciona/atualiza perícia de base → `{ racaId, periciaId, pontos }` |
| DELETE | `/api/racas/:id/pericias/:periciaId` | — | `204` |
| PUT | `/api/classes/:classeId/pericias/:periciaId` | `{ modificador }` | adiciona a perícia do catálogo à classe ou atualiza o modificador → `{ classeId, periciaId, modificador }` |
| DELETE | `/api/classes/:classeId/pericias/:periciaId` | — | `204` (só tira da classe; a perícia continua no catálogo) |

Limites: título 80, descrição 2000, condição 500, limite 200, nome de perícia 60, descrição de perícia 1000; pontos de vida/mana/esforço 1–9999 (nenhum pode ser zero); custo de mana 0–999;
nível 1–100; modificador −99 a 99. `imagemUrl`: link http(s) até 2000 caracteres.
Em campos de texto opcionais (inclusive `imagemUrl`), `""` é salvo como `null`.

## Status (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/status` | — | fixos + do mestre: `{ id, nome, descricao, efeito, tipo, gatilho, ordem, fixo, automatico }` |
| POST | `/api/status` | `{ nome, efeito, tipo, descricao? }` (sempre manual, sem gatilho) | `201`; nome repetido = 409 `NOME_EM_USO` |
| PATCH / DELETE | `/api/status/:id` | subconjunto | fixo = 403 `STATUS_FIXO`; excluir tira de fichas, grupos e cartas |

Habilidades aceitam `statusId` (ou `null`) no POST/PATCH e devolvem `status: { id, nome, tipo }`.
Grupos: `disponiveis.statusIds` (status ativados). Membros do grupo trazem `status[]`.

## Arquétipos e aprimoramentos (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/conceitos` | — | conceitos do mestre com `subclasses[]` |
| POST | `/api/conceitos` | `{ titulo, descricao }` | `201` |
| PATCH / DELETE | `/api/conceitos/:id` | subconjunto | excluir mantém as subclasses (sem conceito) |
| POST | `/api/habilidades/:id/aprimoramentos` | `{ nivel, titulo?, descricaoEfeito?, condicao?, limite?, custoMana?, statusId? }` (nível > nível da carta; pelo menos uma mudança) | `201`; nível repetido = 409 `NIVEL_EM_USO` |
| PATCH / DELETE | `/api/aprimoramentos/:id` | mesmo corpo | |

Classes aceitam `conceitoId` (conceito do próprio mestre) e devolvem `conceito: { id, titulo }`. Cartas vêm com `aprimoramentos[]`.
Na ficha, cada carta já vem com os aprimoramentos aplicados, mais `aprimoradaNoNivel` e `proximoAprimoramento`.
A prévia de progressão tem `aprimoradas[]` por nível.

## Grupos (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/grupos` | — | grupos do mestre com `membros` (nº de fichas) |
| POST | `/api/grupos` | `{ titulo, sinopse, genero, imagemUrl?, limiteMembros, permitirClassesRepetidas, disponiveis? }` | `201 GrupoDetalhe` (código gerado) |
| GET | `/api/grupos/:id` | — | `GrupoDetalhe`: grupo + `disponiveis { classeIds, racaIds, atributoIds, periciaIds, statusIds }` + `membros[]` (ficha, jogador, classe, raça, nível, vida/mana/esforço atual/max, status) + `statusAtivos[]` + `itensVagos: Item[]` + `criaturas: Criatura[]` |
| PATCH | `/api/grupos/:id` | subconjunto (limite não pode ficar abaixo dos membros) | `GrupoDetalhe` |
| PUT | `/api/grupos/:id/disponiveis` | `{ classeIds, racaIds, atributoIds, periciaIds }` (perícias do catálogo, dentro dos atributos; nada exclusivo de outro grupo) | `GrupoDetalhe` |
| POST | `/api/grupos/:id/codigo` | — | `GrupoDetalhe` com código novo |
| DELETE | `/api/grupos/:id` | — | `204` (apaga fichas e itens) |
| POST | `/api/grupos/:id/itens` | campos de item + `fichaId?` (item avulso) | `201 Item` (sem ficha = vago) |
| POST | `/api/grupos/:id/criaturas` | `{ bestaId, nivel? (1), quantidade? (1, máx 20) }` | `201 Criatura[]` (todas do grupo). Criatura exclusivo de outro grupo = 400 |

Classes, raças e atributos aceitam `grupoExclusivoId` (id de um grupo do mestre ou `null` = geral) no POST/PATCH.

## Fichas, convites e itens (qualquer usuário logado)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/convites/:codigo` | — | prévia: grupo, mestre, vagas, `classes[]` (com `ocupada`, `habilidades[]` completas e `pericias[]` com modificador, para o jogador ver os detalhes), `racas[]`, `atributos[]`, `pontosAtributo`, `minhaFichaId`, `souMestre` |
| POST | `/api/fichas` | `{ codigo, nome, classeId, racaId, historia?, imagemUrl?, dados: { [atributoId]: n } }` | `201 FichaDetalhe`. Erros: 404 código; 403 mestre do grupo; 409 `JA_TEM_FICHA`, `GRUPO_CHEIO`, `CLASSE_REPETIDA`; 400 classe/raça fora do grupo ou dados ≠ 3 |
| GET | `/api/fichas` | — | minhas fichas (resumo) |
| GET | `/api/fichas/:id` | — | `FichaDetalhe` (dono ou mestre do grupo): máximos, atuais, atributos com dados e `teste` ("2d20"), perícias somadas (raça/classe/nível/total) com `teste` ("2d20 + 5"), cartas do nível, inventário `{ capacidade, usados, itens: (Item & { podeUsar, motivoNaoPodeUsar })[] }`, opções de perícia, outras fichas do grupo, `morto`, `status[]`, `statusAplicaveis[]` |
| PATCH | `/api/fichas/:id` | `{ nome?, historia?, imagemUrl?, vidaAtual?, manaAtual?, esforcoAtual? }` (atuais limitados a 0..máx) | `FichaDetalhe` |
| POST | `/api/fichas/:id/subir-nivel` | — (só mestre) | `FichaDetalhe` (+1 nível, +5 nos atuais, +5 pontos de perícia) |
| POST | `/api/fichas/:id/pericias` | `{ periciaId }` | gasta 5 pontos (+5 na perícia) · 409 `SEM_PONTOS` |
| POST | `/api/fichas/:id/status` | `{ statusId }` (só mestre; status ativado no grupo e não automático) | `FichaDetalhe` |
| DELETE | `/api/fichas/:id/status/:statusId` | — (só mestre) | `FichaDetalhe` |
| DELETE | `/api/fichas/:id` | — | `204` (dono sai / mestre remove; itens ficam vagos) |
| POST | `/api/itens/:id/mover` | `{ fichaId \| null, npcId?, grupoId? }` | jogador: do próprio inventário para outra ficha do grupo, descartar (null) ou pegar item vago. Mestre: qualquer; `npcId` manda para um NPC; ficha de qualquer grupo dele quando o item vem de NPC; `grupoId` escolhe onde fica vago (obrigatório para item de NPC sem grupo). 409 `INVENTARIO_CHEIO` |
| POST | `/api/itens/:id/usar` | — | dono da ficha (com pré-requisito) ou mestre → `{ consumido, item \| null }`. Usos limitados perdem 1; no último o item é apagado. Item vago = 400 |
| PATCH / DELETE | `/api/itens/:id` | campos de item (parciais) + `usosRestantes?` | só mestre. Mudar `usosMaximos` limita os restantes ao novo máximo |

Erro genérico de exclusão bloqueada: `409 EM_USO` (ex.: classe/raça usada por ficha).

## Itens (formato)
**Item**: `{ id, categoria: { id, nome, icone } | null, nome, descricao, imagemUrl, efeito, espacos, usosMaximos, usosRestantes, requisito, requisitoPericia: { id, nome } | null, requisitoClasse: { id, titulo } | null, fichaId?, modeloId? }`
Campos de item no corpo: `{ categoriaId? (Artefatos; null = sem categoria), nome, descricao? (""), imagemUrl?, efeito?, espacos? (1), usosMaximos? (null = sem limite), requisito?, requisitoPericiaId?, requisitoClasseId? }`
(perícia do catálogo do mestre; classe fixa ou do mestre). Limites: nome 80, descrição/efeito 1000, requisito 200, espaços 1–99, usos 1–999.

## Catálogo de itens (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/catalogo-itens?grupoId=` | — | moldes do mestre (com `grupoExclusivoId`); com `grupoId`, só os que podem ir para aquele grupo |
| POST | `/api/catalogo-itens` | campos de item + `grupoExclusivoId?` | `201` |
| PATCH / DELETE | `/api/catalogo-itens/:id` | parcial | itens já lançados não mudam (são cópias) |
| POST | `/api/catalogo-itens/:id/lancar` | `{ grupoId, fichaId?, quantidade? (1–20) }` ou `{ npcId, quantidade? }` | `201 { lancados }`; sem ficha = vago. Item exclusivo de um grupo só vai para NPC exclusivo do mesmo grupo. 409 `INVENTARIO_CHEIO` |

## Conceitos de raça e de besta (mestre)
`/api/conceitos-raca` e `/api/conceitos-besta`: mesmas rotas de `/api/conceitos` (GET, POST, PATCH/DELETE `/:id`, corpo `{ titulo, descricao }`),
com `subracas[]` e `formas[]`. Raças e bestas aceitam `conceitoId` (do próprio mestre) e devolvem `conceito: { id, titulo }`.

## Bestiário (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/bestas` | — | bestas do mestre com `conceito` e `cartas` (nº) |
| POST | `/api/bestas` | `{ titulo, descricao, imagemUrl?, pontosVida, pontosMana, pontosEsforco (≥1), deslocamento (≥1), conceitoId?, grupoExclusivoId? }` | `201 BestaDetalhe` |
| GET / PATCH / DELETE | `/api/bestas/:id` | parcial no PATCH | `BestaDetalhe` / `204` (apaga cartela e criaturas invocadas dela). De outro mestre = 404 |
| GET | `/api/bestas/:id/progressao` | — | igual à prévia da classe |
| POST | `/api/bestas/:id/duplicar` | — | `201 BestaDetalhe` "(cópia)" com cartas, aprimoramentos, perícias e atributos |
| PUT / DELETE | `/api/bestas/:id/pericias/:periciaId` | `{ modificador }` (−99..99) | `BestaDetalhe` |
| PUT | `/api/bestas/:id/atributos/:atributoId` | `{ dados }` (0..20; 0 tira) | `BestaDetalhe` |
| POST | `/api/bestas/:bestaId/habilidades` | igual ao das classes | `201 Habilidade` |
| PUT | `/api/bestas/:bestaId/habilidades/ordem` | `{ ids }` | `Habilidade[]` |
**BestaDetalhe**: besta + `habilidades[]` + `pericias: { id, nome, descricao, categoria, atributo, modificador, teste }[]` + `atributos: (Atributo & { dados, teste })[]`.
Cartas de besta usam as mesmas rotas `/api/habilidades/:id` e `/api/aprimoramentos/:id` das classes.

## Criaturas invocadas (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/criaturas/:id` | — | `Criatura` + `descricao`, `atributos`, `pericias` (com `teste`), `habilidades` do nível (aprimoradas), `proximasHabilidades` |
| PATCH | `/api/criaturas/:id` | `{ nome?, vidaAtual?, manaAtual?, esforcoAtual? }` (atuais limitados a 0..máx) | `{ removida: false, criatura }`; vida ou mana em 0 = `{ removida: true, motivo: "morreu" }` (a criatura é apagada) |
| DELETE | `/api/criaturas/:id` | — | `204` (fugiu/sumiu) |
**Criatura**: `{ id, bestaId, nome, nivel, besta: { titulo, imagemUrl, deslocamento }, vida, mana, esforco: { atual, max } }`.

## Categorias de item (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/categorias-item` | — | fixas + do mestre: `{ id, nome, descricao, icone, ordem, fixa, usos }` |
| POST | `/api/categorias-item` | `{ nome (até 40), descricao? (""), icone? ("pacote") }` | `201`; nome igual a outra (fixa ou sua, sem diferenciar maiúsculas) = 409 `NOME_EM_USO` |
| PATCH / DELETE | `/api/categorias-item/:id` | parcial | fixa = 403 `CATEGORIA_FIXA`; excluir deixa os itens sem categoria |
`icone`: `pacote | espada | machado | arco | escudo | joia | anel | coroa | varinha | caneca | pocao | comida | livro | pergaminho | mapa | chave | moeda | roupa | martelo | bomba`.

## NPCs (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/npcs?grupoId=` | — | NPCs do mestre (com `grupoId`: só os exclusivos daquele grupo): `{ id, nome, descricao, imagemUrl, nivel, raca, classe, grupoExclusivo, vida, mana, esforco, morto }` |
| POST | `/api/npcs` | `{ nome, racaId, classeId?, nivel? (1), vidaBase?, manaBase?, esforcoBase? (obrigatórios sem classe), descricao?, imagemUrl?, grupoExclusivoId? }` | `201 NpcDetalhe` (recursos cheios). Sem classe e sem base = 400 com os campos faltando |
| GET / PATCH / DELETE | `/api/npcs/:id` | PATCH: parcial + `vidaAtual?`, `manaAtual?`, `esforcoAtual?` | `NpcDetalhe` / `204` (apaga os itens dele). Mudar nível/classe/base faz o atual acompanhar a diferença |
| PUT | `/api/npcs/:id/atributos/:atributoId` | `{ dados }` (0..20; 0 tira) | `NpcDetalhe` |
| PUT | `/api/npcs/:id/pericias/:periciaId` | `{ pontos }` (−99..99; 0 tira) | `NpcDetalhe` |
**NpcDetalhe**: dados do NPC + `raca`, `classe`, `vida`/`mana`/`esforco` `{ atual, max }`, `morto`, `atributos` (com `teste`), `pericias` (raça/classe/extra/total + `teste`),
`habilidades` do nível (aprimoradas), `proximasHabilidades`, `inventario { capacidade, usados, itens }`, `destinos { grupos[], fichas[] }` (para onde os itens podem ir).

## Status em NPCs e criaturas (mestre)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/api/npcs/:id/status` | `{ statusId }` | `NpcDetalhe` (agora com `status[]` e `statusAplicaveis[]`) |
| DELETE | `/api/npcs/:id/status/:statusId` | — | `NpcDetalhe` |
| POST | `/api/criaturas/:id/status` | `{ statusId }` | ficha da criatura (com `statusDetalhado[]` e `statusAplicaveis[]`) |
| DELETE | `/api/criaturas/:id/status/:statusId` | — | ficha da criatura |
Valem os status ativados no grupo (NPC exclusivo, criatura) ou todos os do mestre (NPC geral). Automáticos (vida/mana/esforço em 0) aparecem sozinhos.
A `Criatura` no grupo traz `status[]` (resumo). `PATCH /api/fichas/:id`: o jogador só diminui `vidaAtual` (aumentar = 403 `SO_MESTRE_CURA`).
