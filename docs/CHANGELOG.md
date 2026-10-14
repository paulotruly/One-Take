# Changelog

Alterações relevantes do One-Take, por data (o projeto ainda não tem versões publicadas; `web/package.json` está em `0.0.0`).
Registre só o que muda comportamento, manutenção ou entendimento do sistema. O porquê detalhado de cada decisão fica em
[`DECISOES.md`](DECISOES.md); as entradas abaixo foram montadas a partir do histórico do git, das migrations e de DECISOES.

Formato de cada entrada: **Resumo**, Motivo, Arquivos/módulos, Impacto (regras ou arquitetura), Procedimentos (migrations, config) e Docs.

## Não commitado (2026-10-13)
- **Tela do kit** (`/mestre/kits/:id`): o que está dentro, por tipo, com link para cada coisa e os grupos que usam o kit; serve
  também para o kit verificado. API `GET /api/kits/:id`. Arquivos: `kits.routes.ts`, `KitDetalhePage.tsx`, `KitsPage.tsx`, `router.tsx`;
  testes em `tests/kits.test.ts`. Docs: API, documentação pública (Kits de RPG).
- **Categorias de status** (do mestre, verificáveis): botão Categorias na página de status, campo Categoria no status, página e
  seletor do grupo separados por categoria (marcar a categoria leva todos os status dela).
  - Arquivos: `api/src/modules/status/categorias.ts` (novo), `status.service.ts`, `status.schemas.ts`, `lib/sistema.ts`, `app.ts`;
    `web/src/features/status/` (`CategoriasStatusModal.tsx`, `categorias.ts`, `status.css`), `DisponiveisSelector.tsx`, `lib/useOculto.ts`.
  - Procedimentos: migration `20261013160000_categorias_de_status` (aplicada). Testes: `tests/categorias-status.test.ts`.
  - Docs: DOMINIO, DADOS, API, DECISOES, documentação pública (Status).
- **Selo verificado ao lado do nome também nos cards e listas**: raças, criaturas, classes (com "pelo kit"), escolha do que vale no
  grupo (classes, raças, atributos, perícias, status), campo Kits dos formulários e aviso do kit ativo.
- **Botão de verificar só com o ícone, ao lado do nome** (ADMIN): o selo cinza vira azul com check branco ao marcar; o texto ficou
  na dica. `SeloVerificado` (selo ou botão) substitui `AlternarVerificado`. Arquivos: `BotaoVerificar.tsx`, `SeloVerificado.tsx`, `ui.css`, `Modal.tsx`.
- **Perícias da raça em selos no card** (ícone da categoria, nome e pontos), com mais espaço acima. Arquivos: `RacasPage.tsx`, `layout.css`.
- **Selo verificado ao lado do nome** (só o ícone, em todas as telas) e situação sempre em selo: "Só leitura" (de outra pessoa),
  "Verificado pelo kit" e "Visível para todos", no lugar dos textos soltos; tipo do status (Buff, Debuff, Misto) também virou selo.
  Arquivos: `verificados/components/VerificadoBadge.tsx` (`AcessoBadge`), `classes/components/Selos.tsx` e as páginas que mostram o selo.
- **Balanceamento de 4 classes do @paulo** (conteúdo no banco, sem mudança de código; conferido com `/balancear`, DT 12 e 15):
  Espadachim (Aparada precisa 1x por combate, testa Reflexos, reduz 2d6 e contra-ataca 1d6; Estocada direta 2d6+2, 2x por combate;
  Investida cortante 2d6+2), Feiticeiro elemental (mana: Punho 5, Esfera 5, Onda 10, Tempestade 20, Meteoro 15) e Necromante
  (Atormentar de almas sem limite por 5 de mana; Exército de esqueletos 4d8; Reanimação 10; Contato com a morte 5). Perícias do
  Arqueiro e do Necromante postas pelo responsável. Segundo ajuste: Guarda firme 1x por combate;
  Esfera ígnea 2d6+3 e Meteoro 3d10; Disparo duplo 1d10 por flecha e Chuva de flechas 3d6; Invocação das almas 1d8 por alma e
  Reanimação 1d8 por cadáver (atacam por 2 a 3 turnos, com 1 de vida), as duas por 5 de mana. Notas finais: Espadachim 124 a 144, Arqueiro 101 a 116, Feiticeiro 84 a 99,
  Necromante 81 a 94. Vida base 30 nas 4 (combates de 3,6 a 5,3 turnos no nível 1) e mana 10 no Espadachim e no Arqueiro
  (margem, já que mana 0 mata). Notas: Espadachim 120 a 137, Arqueiro 101 a 116, Feiticeiro 84 a 99, Necromante 81 a 94.
- **Arquétipos mais compactos** (classes, raças e bestiário): cartões numa linha com rolagem horizontal, descrição em 2 linhas
  e botão de seta para ocultar ou mostrar a seção (lembrado no navegador). Arquivos: `ConceitosBloco.tsx`, `classes.css`.
- **Selo verificado e cargo ADMIN**: o ADMIN (cargo no banco, `npm run cargo`) edita o fixo não automático e marca qualquer coisa
  dele como verificada (classes, raças, atributos, perícias, status, categorias de item, itens do catálogo, criaturas e NPCs); todo mestre vê e usa, só leitura, e duplica para mudar.
  Cada pessoa pode ocultar os verificados em Configurações da conta. NPCs e perícias ganharam "duplicar".
  Kits e arquétipos também são verificáveis; **kit verificado leva tudo o que está nele**. Kit "Kit básico do One-Take" criado
  (verificado, vazio) para o @paulo. Selo novo: check branco no selo azul.
  - Procedimentos: migrations `20261013120000_kit_basico_admin`, `20261013130000_verificado_e_cargo` e
    `20261013140000_verificado_em_tudo` e `20261013150000_verificado_kits_arquetipos` (aplicadas); `npm run cargo -- paulo ADMIN` (feito).
  - Docs: DOMINIO, DADOS, API, ARQUITETURA, DECISOES, CLAUDE.md, documentação pública (Conteúdo verificado).
- **Perícias de defesa nas cartas** (opcionais, várias; marcadas sozinhas pela perícia do teste conforme a tabela de
  `api/src/regras/defesas.ts`, e ajustáveis à mão) e **ranking de balanceamento** (`calc.mjs ranking`: poder por nível juntando vida,
  mana, esforço, acerto, cartas, limites, cura e defesa; duelos e alertas).
  - Procedimentos: migrations `20261013100000_pericia_de_defesa` e `20261013110000_pericias_de_defesa_multiplas` (aplicadas).
  - Docs: DOMINIO, DADOS, API, DECISOES, documentação pública (Habilidades), skill `balancear`.
- **Limite de uso da carta padronizado** (N vezes por combate ou por sessão) e **negrito** (`**texto**`) na descrição e no efeito.
  - Arquivos: `api/src/regras/limite.ts`, `habilidades.schemas.ts`, `regras/progressao.ts`, `fichas/retrato.ts`, `scripts/exportar-conteudo.ts`;
    `web/src/features/classes/` (formulários, carta, tipos), `components/texto/ComNegrito.tsx`.
  - Procedimentos: migration `20261013090000_limite_de_uso` (aplicada; as 6 cartas com limite foram convertidas).
  - Docs: DOMINIO, DADOS, API, DECISOES, documentação pública (Habilidades).
- **Sem e-mail: recuperação de senha por código; "nickname" vira "nome de usuário" na interface.**
  - Motivo: decisão do produto (sem depender de domínio e de serviço de e-mail; menos dados pessoais).
  - Arquivos: `api/src/lib/codigo-recuperacao.ts` (novo), `conta.service.ts`, `conta.routes.ts`, `conta.schemas.ts`, `config.ts`, `env.ts`
    (removidos `lib/email.ts` e `lib/tokens.ts`); `web/src/pages/ContaPages.tsx`, `CadastroPage.tsx`, `features/conta/` (código de
    recuperação, exclusão com nome de usuário), `AppLayout.tsx`, textos de login, perfil, home e documentação pública.
  - Procedimentos: migration `20261013080000_recuperacao_sem_email` (aplicada; apaga os e-mails guardados e a tabela de links); tirar
    `RESEND_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_MODO`, `APP_URL` e `TOKEN_*` do `api/.env` (não são mais usadas); reiniciar a API.
  - Docs: legais (versão 0.5, com a redação do responsável), DOMINIO, DADOS, API, ARQUITETURA, DECISOES, ROADMAP.
- **Revisão para celular.** Grades sem largura mínima maior que a tela (15 regras com `minmax(min(Npx, 100%), 1fr)`), `styles/mobile.css`
  (botões que quebram linha, pop-ups quase em tela cheia, topo público só com ícones, cartões de login com menos margem, textos longos
  que quebram). Docs: ARQUITETURA.
- **Minutas legais 0.4:** prazos dos fornecedores (Render 7 dias, Supabase 1 dia e sem backups automáticos no plano gratuito, Vercel 1 hora,
  Resend 30 dias), cláusulas contratuais-padrão na transferência internacional e dispensa de encarregado (agente de pequeno porte).
- **Idade mínima de 12 anos, "Baixar meus dados" e página Configurações da conta.**
  - Arquivos: `api/src/regras/conta.ts`, `conta.schemas.ts`, `conta.service.ts` (`exportarDados`), `conta.routes.ts`, `fichas/retrato.ts`
    (`fotoDaFicha`); `web/src/features/conta/pages/ConfiguracoesContaPage.tsx`, `SecoesDaConta.tsx`, `CadastroPage.tsx`, `PerfilPage.tsx`, `AppLayout.tsx`.
  - Procedimentos: migration `20261013070000_data_nascimento` (aplicada); reiniciar a API.
  - Docs: legais (versão 0.3), DOMINIO, DADOS, API, ARQUITETURA, DECISOES, documentação pública (Contas).
- **E-mail na conta, "Esqueceu a senha?", exclusão de conta confirmada por e-mail e fichas arquivadas.**
  - Motivo: pedido do produto (recuperação de senha e direito de excluir a conta; jogadores não perdem personagens).
  - Arquivos: `api/src/lib/{config,tokens,email,supabase-auth,limite}.ts`, `api/src/modules/conta/`, `api/src/modules/fichas/{arquivo,retrato}.ts`,
    `middleware/auth.ts`, `fichas.service.ts`, `grupos.service.ts`, `scripts/concluir-exclusoes.ts`; `web/src/pages/ContaPages.tsx`,
    `features/conta/`, `FichaArquivadaPage.tsx`, `CadastroPage.tsx`, `LoginPage.tsx`, `PerfilPage.tsx`, `AuthProvider.tsx`, `AppLayout.tsx`.
  - Impacto: o cadastro passa pela API (precisa de `SUPABASE_SECRET_KEY`); sair, ser removido ou ter o grupo excluído arquiva a ficha;
    sessões anteriores à troca de senha são recusadas.
  - Procedimentos: migration `20261013060000_email_senha_exclusao` (aplicada); novas variáveis no `api/.env` (ver ARQUITETURA); reiniciar
    a API e o `npm run dev` do web (o `vite.config.ts` mudou).
  - Docs: DOMINIO, DADOS, API, ARQUITETURA, DECISOES, ROADMAP, documentação pública (Contas, guia do jogador, proteções), `PROJECT_CONTEXT.md`.
- **Minutas de Termos de uso e Política de privacidade** em `docs/legal/` (LGPD), exibidas em `/termos` e `/privacidade` com os campos
  pendentes destacados; pendências internas em `docs/legal/REVISAO_LEGAL_PENDENCIAS.md`.
- **Rodapé discreto em todas as páginas.**
  - Motivo: pedido do produto.
  - Arquivos: `web/src/components/layout/Rodape.tsx`, `layouts/PublicLayout.tsx`, `layouts/AppLayout.tsx`, `styles/layout.css` (o `.app` passou a ocupar a altura da tela).
  - Impacto: nenhum nas regras.
  - Procedimentos: nenhum.
  - Docs: `ARQUITETURA.md`.
- **Topo público com Login e Registrar-se no lugar de "Minha área".**
  - Motivo: pedido do produto.
  - Arquivos: `web/src/layouts/PublicLayout.tsx`.
  - Impacto: os botões aparecem sempre; com sessão aberta, `/login` e `/cadastro` já redirecionam para a área da conta.
  - Procedimentos: nenhum.
  - Docs: `ARQUITETURA.md`, `PROJECT_CONTEXT.md`.
- **Home completa, Termos de uso e Política de privacidade.**
  - Motivo: pedido do produto (página oficial do produto).
  - Arquivos: `web/src/pages/HomePage.tsx`, `web/src/pages/LegalPages.tsx`, `web/src/styles/home.css`, `router.tsx`, `layouts/PublicLayout.tsx`
    (âncoras das seções no topo, só na home e fora do celular), `components/layout/Rodape.tsx` (direitos e links legais).
  - Impacto: rotas públicas novas `/termos` e `/privacidade`; nenhuma regra de jogo mudou (os números da home vêm de `GET /api/regras`).
  - Procedimentos: nenhum.
  - Docs: `CLAUDE.md` (regra da home), ARQUITETURA, DECISOES, `PROJECT_CONTEXT.md`.
- **Documentação central.**
  - Motivo: dar contexto completo a novas sessões e assistentes.
  - Arquivos: `PROJECT_CONTEXT.md`, `AGENTS.md`, `docs/CHANGELOG.md`, `docs/adr/README.md`; ponteiro no `CLAUDE.md`.
  - Impacto: nenhum no código.
  - Procedimentos: nenhum.

## 2026-10-13 (commits `26d4406` e `a4482e2`)
- **Kits de RPG no lugar de "exclusivo de um grupo"; o kit ativo mostra só o kit.**
  - Motivo: decisão do produto (organizar o conteúdo por aventura).
  - Arquivos: `api/src/lib/kits.ts`, `api/src/modules/kits/`, schemas e services de classes, raças, atributos, perícias, status,
    itens, bestas e NPCs; `web/src/features/kits/`, formulários e listas.
  - Impacto: as regras de exclusividade (`EXCLUSIVO_EM_USO`) deixaram de existir; o grupo ganhou `kitId`.
  - Procedimentos: migration `20261013050000_kits_de_rpg` (converte os exclusivos num kit por grupo); `npm run db:deploy` e reiniciar a API.
  - Docs: DOMINIO, DADOS, API, ARQUITETURA, DECISOES, ROADMAP e o tópico público "Kits de RPG".
- **Correções do mapeamento de inconsistências.**
  - Arquivos: `itens.service.ts`, `criaturas.service.ts`, `fichas.service.ts`, `habilidades.service.ts`, `pericias/soma.ts`.
  - Impacto: o item com NPC não pertence a grupo; nível máximo 100; o jogador só diminui a vida (`SO_MESTRE_CURA`); o nível
    necessário da carta não alcança um aprimoramento; nomes de criatura não se repetem; a soma de perícias ficou unificada.
  - Docs: DECISOES.
- **Status em NPCs e criaturas.**
  - Procedimentos: migration `20261013030000_status_npc_criatura`.
- **Perícia do teste na habilidade** (`Habilidade.periciaId`; a ficha mostra o teste pronto da carta).
  - Procedimentos: migration `20261013040000_pericia_da_habilidade`.
- **NPCs com ficha e inventário.**
  - Impacto: `Item.grupoId` ficou opcional e ganhou `npcId`.
  - Procedimentos: migration `20261013020000_npcs`.
- **Grid removido do sistema** (o grid é físico).
  - Procedimentos: migration `20261013010000_remove_grid`.
- **Categorias de item personalizáveis** (4 fixas + as do mestre).
  - Procedimentos: migration `20261013000000_categorias_de_item`.
- **Sem conteúdo pronto no banco.**
  - Impacto: as classes fixas de exemplo, o seed de teste e a conta @teste foram removidos; `db:seed` cria só a estrutura fixa.
- **"Conceito" vira "Arquétipo" e "bicho" vira "criatura"** na interface. Tabelas e rotas mantêm os nomes antigos.

## 2026-10-12 (commit `444df5a`)
- **Regra de teste com d20** (atributo 0 pela metade, esforço = +1 d20, DT livre).
  - Arquivos: `api/src/regras/teste.ts` e o teste pronto na ficha.
- **Uma conta para jogar e mestrar** (`POST /api/me/mestre`).
- **Tipos de efeito voltam a ser lista fixa; catálogo de itens; bestiário com invocação e morte automática.**
  - Procedimentos: migration `20261012000000_itens_bestiario_tipo_efeito`.
- **Interface:** arquétipo de raça, cartas em grade com pop-up, ficha e inventário para celular, navegação lateral e menu do perfil.
- **Documentação pública** com busca por palavras.
- **Ferramentas:** skill de balanceamento e scripts `fixar-classe` e `exportar`.

## 2026-10-11 (commit `6925e50`)
- **Estrutura inicial.**
  - Arquivos: `api/` (Express 5, Prisma 7, Zod 4, auth via JWKS do Supabase, RLS sem policies) e `web/` (React, Vite, TanStack Query).
- **Primeira leva de funcionalidades:** classes, cartela única, perícias como catálogo por mestre, progressão de nível, raças,
  atributos como cadastro, cadastro com papel, login por nickname, grupos, fichas, inventário, status, arquétipos e aprimoramentos,
  regras da mesa.
  - Procedimentos: migrations de `20261011000000_inicial` a `20261011150000_regras_da_mesa`.
