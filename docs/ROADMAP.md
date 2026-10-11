# Roadmap

## Pronto
- Base do monorepo, schema Prisma, migration inicial (com CHECKs e RLS), seed de 3 classes fixas.
- API: autenticação (JWT Supabase via JWKS), papel MESTRE/JOGADOR, CRUD de classes,
  habilidades, catálogo de perícias por mestre (com 18 perícias base) e perícias das classes, duplicar classe, imagem por link, reordenar cartas, erros padronizados, testes.

- Interface do mestre: login, galeria estilo seleção de herói (filtro por grupo, fixa x minha, vida/mana/esforço),
  criar/editar classe com link de imagem, tela própria de habilidades (cartela única, cartas reordenáveis), catálogo de perícias
  (categorias por emoji, atributos CF/CC) e perícias da classe escolhidas do catálogo com modificador,
  exclusão com confirmação, estados de carregamento/vazio/erro. Rota `/jogador` reservada.
- Regras de progressão de nível (API, fonte única) e prévia por nível na página da classe.
- Raças (deslocamento + perícias de base), atributos como cadastro (3 fixos + do mestre).
- Cadastro como mestre ou jogador, perfil (nome e foto), página pública de regras e guia do mestre.
- Login por nickname. Grupos (código de entrada, limite, classes repetidas, o que vale no grupo, exclusividade),
  fichas (raça, classe, história, imagem, dados por atributo, recursos, perícias somadas, cartas do nível),
  subir nível, pontos de perícia, inventário com itens (entregar, passar, descartar, pegar), interface do jogador.

## Em andamento
- Instruções de deploy (Render, Vercel).

## A seguir (fora do escopo atual)
- Sessões, rolagem de dados no app, combate.

## Ideias em aberto
- O que fazer ao excluir uma classe usada por fichas (bloquear? arquivar? soft delete?).
- Drag-and-drop para reordenar cartas (hoje: botões de seta).
- Upload de imagem para o Supabase Storage (hoje é só link externo).
- Testes de integração contra um Postgres real (ex.: branch do Supabase ou container).
- Testes de componentes no front (hoje só typecheck + build).
- Code-splitting do bundle (o supabase-js deixa o JS principal com ~590 kB; ~170 kB gzip).
- "Restaurar perícias base" no catálogo do mestre (hoje, base apagada só volta ao duplicar uma classe fixa que a use).
- Definir: cartas de um nível são todas recebidas ou escolhidas? Perícia nova é escolhida ou pré-determinada?
- Recuperar senha sem email (ex.: mestre redefine a senha de um jogador do grupo).
- Descer de nível / desfazer gasto de pontos de perícia.
- Mestre jogar no grupo de outro mestre (hoje cada conta tem um papel).
- Jogador criar itens próprios (hoje só o mestre cria).
