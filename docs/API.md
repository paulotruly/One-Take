# API

Base local: `http://localhost:3333`. JSON em tudo.

## Público (sem login)
| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/nicknames/:nickname` | `{ disponivel, motivo? }` |
| POST | `/api/entrar` | corpo `{ login, senha }` (login = nickname, com ou sem @, ou email antigo) → `{ access_token, refresh_token }` do Supabase; erro = 401 "Nickname ou senha incorretos." |
| GET | `/api/regras` | `{ progressao, ficha: { pontosAtributoIniciais, inventarioInicial, inventarioPorNivel }, atributosFixos: [{ nome, descricao }], statusFixos: [{ nome, descricao, efeito, tipo, gatilho }] }` |

## Autenticação
Todas as rotas sob `/api` exigem `Authorization: Bearer <access_token do Supabase>`.
Rotas de classes, habilidades e perícias exigem papel **MESTRE**. No primeiro acesso a elas, o catálogo de perícias do mestre é criado a partir das perícias base.

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
| 403 | `PROIBIDO` | usuário não é MESTRE |
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
**Habilidade**: `{ id, classeId, titulo, descricao, condicao, tipoEfeito, descricaoEfeito, limite, nivelNecessario, custoMana, ordem }`
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

Limites: título 80, tipo de efeito 60 (texto livre, obrigatório), descrição 2000, condição 500, limite 200, nome de perícia 60, descrição de perícia 1000; pontos de vida/mana/esforço 1–9999 (nenhum pode ser zero); custo de mana 0–999;
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

## Classes-conceito e aprimoramentos (mestre)
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
| GET | `/api/grupos/:id` | — | `GrupoDetalhe`: grupo + `disponiveis { classeIds, racaIds, atributoIds, periciaIds }` + `membros[]` (ficha, jogador, classe, raça, nível, vida/mana/esforço atual/max) + `itensVagos[]` |
| PATCH | `/api/grupos/:id` | subconjunto (limite não pode ficar abaixo dos membros) | `GrupoDetalhe` |
| PUT | `/api/grupos/:id/disponiveis` | `{ classeIds, racaIds, atributoIds, periciaIds }` (perícias do catálogo, dentro dos atributos; nada exclusivo de outro grupo) | `GrupoDetalhe` |
| POST | `/api/grupos/:id/codigo` | — | `GrupoDetalhe` com código novo |
| DELETE | `/api/grupos/:id` | — | `204` (apaga fichas e itens) |
| POST | `/api/grupos/:id/itens` | `{ nome, descricao?, fichaId? }` | `201 Item` (sem ficha = vago) |

Classes, raças e atributos aceitam `grupoExclusivoId` (id de um grupo do mestre ou `null` = geral) no POST/PATCH.

## Fichas, convites e itens (qualquer usuário logado)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/api/convites/:codigo` | — | prévia: grupo, mestre, vagas, `classes[]` (com `ocupada`, `habilidades[]` completas e `pericias[]` com modificador, para o jogador ver os detalhes), `racas[]`, `atributos[]`, `pontosAtributo`, `minhaFichaId`, `souMestre` |
| POST | `/api/fichas` | `{ codigo, nome, classeId, racaId, historia?, imagemUrl?, dados: { [atributoId]: n } }` | `201 FichaDetalhe`. Erros: 404 código; 403 mestre do grupo; 409 `JA_TEM_FICHA`, `GRUPO_CHEIO`, `CLASSE_REPETIDA`; 400 classe/raça fora do grupo ou dados ≠ 3 |
| GET | `/api/fichas` | — | minhas fichas (resumo) |
| GET | `/api/fichas/:id` | — | `FichaDetalhe` (dono ou mestre do grupo): máximos, atuais, atributos com dados, perícias somadas (raça/classe/nível/total), cartas do nível, inventário (capacidade + itens), opções de perícia, outras fichas do grupo, `morto`, `status[]` (automáticos + aplicados), `statusAplicaveis[]` |
| PATCH | `/api/fichas/:id` | `{ nome?, historia?, imagemUrl?, vidaAtual?, manaAtual?, esforcoAtual? }` (atuais limitados a 0..máx) | `FichaDetalhe` |
| POST | `/api/fichas/:id/subir-nivel` | — (só mestre) | `FichaDetalhe` (+1 nível, +5 nos atuais, +5 pontos de perícia) |
| POST | `/api/fichas/:id/pericias` | `{ periciaId }` | gasta 5 pontos (+5 na perícia) · 409 `SEM_PONTOS` |
| POST | `/api/fichas/:id/status` | `{ statusId }` (só mestre; status ativado no grupo e não automático) | `FichaDetalhe` |
| DELETE | `/api/fichas/:id/status/:statusId` | — (só mestre) | `FichaDetalhe` |
| DELETE | `/api/fichas/:id` | — | `204` (dono sai / mestre remove; itens ficam vagos) |
| POST | `/api/itens/:id/mover` | `{ fichaId \| null }` | jogador: do próprio inventário para outra ficha do grupo, descartar (null) ou pegar item vago; mestre: qualquer. 409 `INVENTARIO_CHEIO` |
| PATCH / DELETE | `/api/itens/:id` | `{ nome?, descricao? }` | só mestre |

Erro genérico de exclusão bloqueada: `409 EM_USO` (ex.: classe/raça usada por ficha).
