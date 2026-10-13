# AGENTS.md: como trabalhar no One-Take

Este arquivo diz **como** um assistente de programação deve trabalhar neste repositório.
O **que** o projeto é (estado, arquitetura, regras de negócio, decisões) está em [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md).
As convenções obrigatórias de código e design estão em [`CLAUDE.md`](CLAUDE.md) e valem para qualquer assistente, não só o Claude.

## Regras de trabalho
- Leia `PROJECT_CONTEXT.md` (e o documento de `docs/` indicado nele para a tarefa) antes de qualquer tarefa relevante.
- Inspecione o código existente antes de propor ou fazer alterações. Procure funções e componentes que já resolvem o problema
  (ex.: `api/src/regras/`, `api/src/lib/`, `web/src/components/ui/`).
- Preserve as tecnologias, a arquitetura e os padrões adotados (módulos `routes -> service -> schemas`, `AppError`, Zod sem defaults
  em PATCH, regras de jogo em `api/src/regras/`, hooks em `features/*/api.ts`, estilo só por `tokens.css`), salvo decisão explícita.
- Respeite as regras de design: sem emojis, ícones só do `lucide-react`, tema claro com fundo branco, cantos retos.
- Não invente funcionalidades, regras de negócio, endpoints ou estruturas de dados. Regra nova vem do responsável pelo produto.
- Faça só o escopo pedido. Evite refatorações não relacionadas.
- Não remova comentários nem documentação úteis sem necessidade.
- Não introduza dependências sem necessidade clara; prefira o que já está no projeto.
- Nunca exponha segredos, credenciais ou dados pessoais (nem em código, logs, commits ou documentação). Cite só nomes de variáveis.
- Não altere migrations já aplicadas; mudança de schema = migration nova (`npm run db:migrate -- --name <nome>`).
- Não apague dados criados por usuários (por exemplo, o conteúdo da conta `@paulo`).
- Não faça commit, push nem deploy sem pedido explícito.
- Rode os testes e verificações disponíveis quando alterar código (ver abaixo).
- Atualize a documentação quando comportamento, arquitetura, regras ou decisões mudarem.
- Registre dúvidas e limitações em vez de assumir comportamentos desconhecidos. Se uma informação não pode ser confirmada, não a
  documente como fato.

## Verificações
| Onde | Comando | Quando |
|---|---|---|
| `api/` | `npm run typecheck` | qualquer mudança na API |
| `api/` | `npm test` | qualquer mudança na API (modelo novo do Prisma -> listar em `tests/prisma-falso.ts`) |
| `api/` | `npx prisma migrate status` | depois de mexer no schema |
| `web/` | `npm run build` (inclui `tsc -b`) | qualquer mudança no front |
| `web/` | `npm run lint` | mudanças no front (hoje há 12 avisos conhecidos; não aumentar) |

## Fluxo obrigatório para cada tarefa
1. Ler o contexto e as instruções aplicáveis (`PROJECT_CONTEXT.md`, `CLAUDE.md`, o documento de `docs/` da área).
2. Inspecionar os arquivos relacionados à tarefa.
3. Identificar quais regras, funcionalidades, contratos de API, modelos de dados ou decisões serão afetados.
4. Implementar somente o escopo solicitado.
5. Executar as verificações pertinentes.
6. Atualizar `PROJECT_CONTEXT.md`, `docs/CHANGELOG.md` e os ADRs (`docs/adr/`) quando necessário, além dos documentos de `docs/`
   que o `CLAUDE.md` exige (DOMINIO, DADOS, API, ARQUITETURA, DECISOES, ROADMAP) e da documentação pública em `web/src/features/docs/`.
7. Revisar os documentos para garantir que descrevem o estado real do código.
8. Informar no resumo final quais documentos foram atualizados e quais pendências permanecem.

Atualize só os documentos afetados pela mudança, não todos de uma vez. Para saber onde cada informação mora:

| Mudou | Atualizar |
|---|---|
| Regra do jogo ou do domínio | `docs/DOMINIO.md`, tabela RN de `PROJECT_CONTEXT.md`, documentação pública |
| Rota, corpo, resposta ou erro | `docs/API.md` |
| Schema do banco | `docs/DADOS.md` (+ migration) |
| Pastas, fluxo, auth, env, deploy | `docs/ARQUITETURA.md`, seções 1.4, 1.7 e 1.9 de `PROJECT_CONTEXT.md` |
| Decisão nova | `docs/DECISOES.md` (datada) e, se for arquitetural, um ADR em `docs/adr/` |
| Funcionalidade entregue | `docs/ROADMAP.md`, seção 1.2 de `PROJECT_CONTEXT.md`, `docs/CHANGELOG.md` |
