# Arquitetura

## Pastas
```
api/
  prisma/schema.prisma, migrations/, seed.ts (estrutura fixa: atributos, status, categorias, perícias base; sem classes)
  prisma.config.ts           # CLI do Prisma usa DIRECT_URL
  scripts/promover-mestre.ts   # npm run promover
  scripts/cargo.ts            # npm run cargo -- nick ADMIN|USUARIO: troca o cargo da conta (nunca pela interface)
  scripts/fixar-classe.ts      # npm run fixar-classe -- "Título" [--devolver nick]: classe do mestre vira fixa (e volta)
  scripts/exportar-conteudo.ts # npm run exportar: classes e bestas em JSON para o balanceamento
  scripts/concluir-exclusoes.ts # npm run concluir-exclusoes: retoma exclusões de conta que pararam no meio
  src/
    index.ts                 # lê env e sobe o servidor
    app.ts                   # monta Express: cors, json, /health, /api (auth → papel → módulos), erros
    env.ts                   # variáveis validadas com Zod
    lib/                     # prisma (adapter pg), errors (AppError), validacao (helpers Zod), kits, nickname,
                             # config (env lida na hora), codigo-recuperacao (gerar e conferir), supabase-auth
                             # (sessão e Admin API), limite (tentativas por IP em memória)
    middleware/              # auth (autenticar, exigirPapel), error-handler
    modules/<recurso>/       # routes → service → schemas
    regras/                  # regras de jogo puras e testadas (FONTE ÚNICA): progressao, ficha (inventário, pré-requisito de item),
                             # teste (d20, atributo 0, esforço, chances), status, combate (regras padrão da mesa)
    generated/prisma/        # client gerado (gitignored)
  tests/                     # vitest + supertest com Prisma mockado
web/
  src/
    main.tsx, router.tsx     # providers (Query, Auth) e rotas
    styles/tokens.css        # TODAS as cores, espaçamentos e fontes (trocar o tema = mexer aqui)
    styles/base.css, layout.css, home.css
    styles/mobile.css        # ajustes de celular, carregado por último; grades usam minmax(min(Npx, 100%), 1fr)
    lib/supabase.ts          # cliente Supabase + leitura do .env
    lib/api.ts               # fetch com JWT, ApiError, helpers de erro de formulário
    auth/                    # AuthProvider (sessão, useMe) e guards (RequirePapel)
    components/ui/           # Button, Field, Modal, ConfirmDialog, Loading/EmptyState/ErrorState, Avatar, Marca
    components/texto/        # blocos da documentação: Destaque, Passos, Cartoes, Tabela
    features/docs/           # documentação: DocsLayout (lateral + tópico + anterior/próximo), BuscaDocs (filtro por palavras), topicos.tsx, conteudo/
    features/classes/
      types.ts               # tipos espelhando a API + rótulos
      api.ts                 # hooks TanStack Query (leitura e mutações)
      components/            # APRESENTAÇÃO: só props → JSX (cards, deck, forms, selos)
      pages/                 # CONTAINERS: dados, modais e navegação
    features/pericias/       # catálogo de perícias e atributos (types com categorias e ícones, api, components, pages)
    features/racas/          # raças do mestre e arquétipos de raça
    features/itens/          # catálogo de itens (CatalogoItensPage), ItemLinha/ItemDetalhe/ItemForm, LancarItemModal
    features/bestiario/      # bestiário (páginas de criatura), InvocarModal, CriaturaModal
    features/npcs/           # NPCs: lista (NpcLinha), formulário, ficha do NPC com inventário
    features/classes/pages/CartelaEditor.tsx  # editor de cartas usado por classes e criaturas
.claude/skills/balancear/    # skill de balanceamento: SKILL.md (método e referências) + calc.mjs (calculadora)
    layouts/AppLayout.tsx    # topo com navegação (Classes | Perícias), email e "Sair"
    pages/                   # Login, Jogador (placeholder), 404
docs/
```

## Fluxo de uma requisição
1. `cors` → `express.json` (limite 100 kb).
2. `/api/*` → `autenticar`: lê `Authorization: Bearer`, valida o JWT contra o JWKS do Supabase
   (issuer `${SUPABASE_URL}/auth/v1`, audience `authenticated`), faz upsert do `Perfil` e põe `req.usuario`.
3. Rotas de gestão → `exigirPapel("MESTRE")` → `garantirCatalogo` (1ª vez: copia as perícias base para o mestre).
4. Rota: `schema.parse(req.body)` (Zod) → `service` (regras de acesso + Prisma) → JSON.
5. Qualquer erro lançado (Express 5 captura async) → `error-handler` → `{ error: { code, message, details? } }`.

## Autenticação
- Login por **nickname e senha**: o front chama `POST /api/entrar`, a API acha o email interno da conta e pede a sessão ao Supabase;
  o front guarda a sessão e manda o `access_token` em cada chamada.
- API não chama o Supabase por requisição: só verifica a assinatura (chaves públicas em cache).
- Papel vem da tabela `Perfil`, não do token. Novo usuário = JOGADOR. Promover: `npm run promover -- email` (lê `auth.users`; não precisa ter logado antes).
- **Cadastro pela API** (`POST /api/cadastro`): a API cria o usuário no Supabase Auth pela **Admin API** (chave secreta, só no servidor),
  com o e-mail interno do nome de usuário já confirmado, cria o perfil com o hash do código de recuperação e devolve a sessão e o código;
  o front mostra o código e só faz `setSession` depois que a pessoa confirma que guardou.
- **Esqueceu a senha** (`POST /api/senha/recuperar`): nome de usuário + código; a senha é trocada pela Admin API. Não há e-mail.
- **Sessões**: `autenticar` recusa tokens autenticados antes de `sessoesValidasDesde` (claim `amr`) e contas em exclusão.
- **Limites**: por IP em memória (`limitarPorOrigem`). Atrás do Render, use `TRUST_PROXY=1`.

## Imagens
Por enquanto a imagem da classe é um **link externo** (`imagemUrl`), validado como http(s) e
exibido direto pelo front. Não há upload nem uso do Supabase Storage.

## Variáveis de ambiente
### api/.env
| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Postgres via pooler Supavisor, modo transaction (porta 6543) + `?pgbouncer=true`. Runtime. |
| `DIRECT_URL` | Session pooler (porta 5432) ou conexão direta. Migrations e seed. |
| `SUPABASE_URL` | `https://<ref>.supabase.co` — JWKS e issuer do JWT. |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publishable/anon (pública), a mesma do web — usada no login por nickname. |
| `CORS_ORIGIN` | Origens do front separadas por vírgula. |
| `PORT` | Porta HTTP (Render define sozinho). |
| `SUPABASE_SECRET_KEY` | Chave **secreta** do Supabase (Project Settings > API Keys > Secret keys). Cadastro, "esqueceu a senha" e exclusão de conta. Nunca no web. |
| `TRUST_PROXY` | `1` atrás de proxy (Render): o limite por IP usa o X-Forwarded-For. |

## Configuração do Supabase (uma vez)
1. Criar projeto em supabase.com. Guardar a senha do banco.
2. **Connect → ORM → Prisma**: copiar a URL da porta 6543 para `DATABASE_URL` (com `?pgbouncer=true`)
   e a da porta 5432 para `DIRECT_URL`.
3. **Connect → Framework**: a URL do projeto (mostrada como `NEXT_PUBLIC_SUPABASE_URL`) vai em
   `SUPABASE_URL` (api) e `VITE_SUPABASE_URL` (web); a *publishable key* vai em `VITE_SUPABASE_PUBLISHABLE_KEY` (web).
   **Project Settings → JWT Keys**: confirmar que usa *JWT Signing Keys* (assimétricas).
4. **Authentication → Users → Add user**: criar o mestre (email + senha, "Auto Confirm User").
5. **Authentication → Sign In / Providers → Email**: deixar **Allow new users to sign up** ligado e **desligar
   Confirm email** (obrigatório: as contas usam email interno `@one-take.local`, que não recebe mensagens).
5b. Rodar `npm run db:deploy` e `npm run db:seed` em `api/`.
6. Rodar `npm run promover -- email-do-mestre` (cria o perfil a partir de `auth.users`, se preciso).

## Web
- Públicas: `/` (página inicial: hero, funcionalidades, como funciona, perguntas, com âncoras no topo), `/termos` e `/privacidade`
  (`pages/LegalPages.tsx`), `/docs` e `/docs/:slug` (documentação com navegação lateral; tópicos em
  `features/docs/topicos.tsx`, números de `GET /api/regras`), `/guia-do-mestre` (redireciona para a documentação), `/login`, `/cadastro`
  (escolha "Sou mestre"/"Sou jogador"; papel e nome vão no `user_metadata` do Supabase). `/area` redireciona pelo papel.
- Logado (qualquer papel): `/perfil` (nickname, nome e foto por link).
- Jogador: `/jogador` (minhas fichas + entrar com código), `/jogador/entrar/:codigo` (criar ficha), `/jogador/fichas/:id`.
- **Login por nickname**: o front chama `POST /api/entrar`; a API acha o email da conta pelo nickname, pede a sessão ao
  Supabase (`/auth/v1/token?grant_type=password` com a chave publishable) e devolve os tokens; o front faz `setSession`.
  O cadastro passa pela API (`POST /api/cadastro`), que cria o usuário com o e-mail interno `<nickname>@one-take.local`.
- Sem login (fora dos layouts): `/recuperar-senha` (código de recuperação) e `/conta-excluida` (`pages/ContaPages.tsx`).
  Termos e Política (`pages/LegalPages.tsx`) renderizam as minutas de `docs/legal/` via `?raw` (o `vite.config.ts` libera ler `..`;
  na Vercel, manter "Include files outside the root directory" ligado). `/conta` (Configurações da conta, `features/conta/pages/ConfiguracoesContaPage.tsx`): e-mail, seus dados
  (data de nascimento e exportação), código de recuperação e, discreta no fim, a exclusão. `/perfil` é só o perfil público. Aviso de conta sem código no `AppLayout`. Jogador: `/jogador/arquivadas/:id`.
- Mestre: `/mestre/grupos`, `/mestre/grupos/novo`, `/mestre/grupos/:id`, `/mestre/grupos/:id/editar`, `/mestre/fichas/:id`,
  `/mestre` (galeria, `?grupo=` no filtro), `/mestre/racas`, `/mestre/racas/:id`, `/mestre/classes/nova` (só a classe),
  `/mestre/classes/:id` (dados, resumo das habilidades, perícias), `/mestre/classes/:id/editar`,
  `/mestre/classes/:id/habilidades` (criar/editar/reordenar/excluir cartas), `/mestre/pericias` (catálogo); `/jogador` (reservada, tela vazia); `/` redireciona conforme o papel.
- `RequirePapel` exige sessão; com `papel="MESTRE"`, exige a interface de mestre ativada (senão vai para `/ativar-mestre`).
  `/jogador` vale para qualquer conta. O topo alterna **Mestrar**/**Jogar**; `/area` volta à última interface usada (localStorage).
- Mestre também: `/mestre/npcs`, `/mestre/npcs/novo` (`?grupo=` volta ao grupo, `?kit=` já marca o kit), `/mestre/npcs/:id`, `/mestre/npcs/:id/editar`, `/mestre/bestiario`, `/mestre/bestiario/novo`, `/mestre/bestiario/:id`, `/mestre/bestiario/:id/editar`, `/mestre/itens`, `/mestre/kits`.
  Kit ativo: guardado no navegador (`features/kits/types.ts`, try/catch); `useKitAtivo` + `soDoKit` filtram as listas (só o kit; fixos do sistema sempre) e o kit ativo é o padrão dos formulários. No grupo vale `visivelNoKit` (kit + gerais).
  Logado: `/ativar-mestre`.
- Layouts: `PublicLayout` (regras, guia; botões Login e Registrar-se sempre visíveis, que com sessão levam à área da conta; links no topo) e `AppLayout` (topo com marca, troca Mestrar/Jogar
  e menu do perfil com Editar perfil e Sair; navegação da interface numa **barra lateral**, que no celular vira gaveta aberta pelo botão de menu). Os dois têm o `Rodape` (`components/layout/Rodape.tsx`): créditos, direitos autorais, Documentação, Termos de uso, Política de privacidade e GitHub.
- Se a API responder 401, o front faz `signOut` e volta ao login.
- Dados: TanStack Query; toda mutação invalida as queries `["classes", ...]`.
- Erros de validação da API (`details`) aparecem embaixo de cada campo dos formulários.

### web/.env
| Variável | Para quê |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | chave publishable/anon (pública; nunca a secret) |
| `VITE_API_URL` | URL da API (`http://localhost:3333` ou a do Render) |

## Deploy
Detalhado ao fim da fase de deploy (ver ROADMAP).
