# One-Take

Sistema de RPG de mesa para sessões únicas (one-shots). Classes prontas no estilo hero shooter:
o jogador escolhe uma classe com kit de habilidades já definido. Etapa atual: interface do **mestre**
para criar classes, raças, perícias, atributos, itens, NPCs e bestiário e conduzir grupos (status, itens, NPCs, criaturas);
interface do jogador com fichas e inventário (uma conta joga e, se ativar, mestra); login por nickname; regras públicas.
Sessões e rolagem de dados no app ainda não existem (a ficha mostra o teste pronto).

## Stack
- `api/` — Node 22 + TypeScript (ESM) + Express 5 + Prisma 7 (driver adapter `pg`) + Zod 4. Deploy: Render.
- `web/` — React + Vite + TypeScript + React Router + TanStack Query. Deploy: Vercel.
- Supabase: Postgres e Auth (JWT validado na API via JWKS). Imagem da classe é um link externo (sem upload).
- Pastas independentes (sem npm workspaces); cada uma tem seu `package.json` e `.env.example`.

## Comandos
```bash
npm run install:all          # instala api/ e web/ (na raiz)
# API (dentro de api/)
npm run dev                  # servidor com reload (porta 3333)
npm run db:migrate           # cria/aplica migrations em dev (usa DIRECT_URL)
npm run db:deploy            # aplica migrations em produção
npm run db:seed              # estrutura fixa: atributos, status, categorias, perícias base (idempotente; não cria classes)
npm run promover -- email@x  # muda o papel de uma conta pelo email do Supabase Auth (padrão MESTRE)
npm run fixar-classe -- "Título"   # classe de um mestre vira fixa do sistema (--devolver nick desfaz)
npm run exportar -- > ../conteudo.json  # classes e bestas em JSON para a skill de balanceamento (/balancear)
npm test                     # vitest (Prisma mockado, sem banco)
npm run typecheck && npm run build
# Web (dentro de web/)
npm run dev                  # http://localhost:5173
npm run build                # typecheck + build
```

## Convenções
- Código e domínio em português (`Classe`, `Habilidade`, `Pericia`, `ClassePericia`); termos técnicos em inglês quando idiomáticos.
- API: um módulo por recurso em `api/src/modules/<recurso>/` com `*.routes.ts` (HTTP + parse Zod) →
  `*.service.ts` (regras + Prisma) → `*.schemas.ts`. Erros via `AppError` (`api/src/lib/errors.ts`);
  nunca responder erro manualmente.
- Regras de JOGO (números, progressão) ficam em `api/src/regras/` como funções puras e testadas; o front só exibe o que a API calcula.
- Regras de acesso a classes ficam em `classeLegivel` / `classeEditavel` (`classes.service.ts`); recursos filhos reutilizam.
- Schemas de PATCH = `base.partial()` de um objeto **sem defaults** (Zod 4 aplica default em campo opcional).
- Imports relativos com extensão `.js` (ESM nodenext). Client Prisma gerado em `api/src/generated/` (não versionado).
- Web: componentes de apresentação em `features/*/components/` (só props); dados e lógica em `features/*/pages/` e `features/*/api.ts`.
  Estilo só via variáveis de `web/src/styles/tokens.css`.
- **Regras de design (obrigatórias):**
  - **Sem emojis** no código, na interface, em comentários e logs. Nada de caracteres usados como ícone na UI
    (setas, estrelas, corações): ícones **somente do `lucide-react`**.
  - **Tema claro, fundo branco**, interface simples.
  - **Cantos retos**: botões e elementos quadrados/retangulares, nada arredondado (`--raio-*` = 0 nos tokens).
- Mudança de schema: editar `schema.prisma` → `npm run db:migrate -- --name <nome>` → atualizar `docs/DADOS.md`.

## Regra permanente
**Ao concluir qualquer funcionalidade, atualize os arquivos de `docs/` afetados na mesma entrega.**
Documentação desatualizada é pior do que nenhuma. Decisões novas vão para `docs/DECISOES.md` (datadas).
O mesmo vale para a **documentação pública** em `/docs` (`web/src/features/docs/`): cada tópico é um componente em
`conteudo/jogo.tsx` (começando + regras do jogo) ou `conteudo/mestre.tsx` (guia do mestre, guia do jogador, referência),
listado em `topicos.tsx` (navegação lateral). Regra ou funcionalidade nova = atualizar ou criar o tópico.
Números de regra vêm de `useRegras()` (`GET /api/regras`); não escreva números à mão.
A home (`web/src/pages/HomePage.tsx`) é uma landing page curta: só propaganda e links para a documentação.

## Qual doc ler
| Tarefa | Ler |
|---|---|
| Regras do jogo, cartela, perícias, progressão de nível | `docs/DOMINIO.md` |
| Pastas, fluxo de requisição, auth, env, deploy | `docs/ARQUITETURA.md` |
| Banco, relações, por que foi modelado assim | `docs/DADOS.md` |
| Rotas da API (corpo/resposta/erros) | `docs/API.md` |
| Por que algo foi feito de certo jeito | `docs/DECISOES.md` |
| O que está pronto e o que vem depois | `docs/ROADMAP.md` |
