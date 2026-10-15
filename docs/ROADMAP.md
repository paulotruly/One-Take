# Roadmap

## Pronto
- Base do monorepo, schema Prisma, migration inicial (com CHECKs e RLS), seed da estrutura fixa (atributos, status, categorias de item, perícias base).
- API: autenticação (JWT Supabase via JWKS), papel MESTRE/JOGADOR, CRUD de classes,
  habilidades, catálogo de perícias por mestre (com 18 perícias base) e perícias das classes, duplicar classe, imagem por link, reordenar cartas, erros padronizados, testes.

- Interface do mestre: login, galeria estilo seleção de herói (filtro por grupo, verificada x minha, vida/mana/esforço),
  criar/editar classe com link de imagem, tela própria de habilidades (cartela única, cartas reordenáveis), catálogo de perícias
  (categorias por emoji, atributos CF/CC) e perícias da classe escolhidas do catálogo com modificador,
  exclusão com confirmação, estados de carregamento/vazio/erro. Rota `/jogador` reservada.
- Regras de progressão de nível (API, fonte única) e prévia por nível na página da classe.
- Raças (deslocamento + perícias de base), atributos como cadastro (do mestre; os 3 do seed são do ADMIN, verificados).
- Cadastro como mestre ou jogador, perfil (nome e foto), página pública de regras e guia do mestre.
- Login por nickname. Grupos (código de entrada, limite, classes repetidas, o que vale no grupo),
  fichas (raça, classe, história, imagem, dados por atributo, recursos, perícias somadas, cartas do nível),
  subir nível, pontos de perícia, inventário com itens (entregar, passar, descartar, pegar), interface do jogador.

- Regra de teste (d20 + perícia, atributo 0, esforço = dados extras, DT livre) com teste pronto na ficha; tipos de efeito fixos;
  arquétipo de raça; uma conta para jogar e mestrar; catálogo de itens (categorias, espaços, usos, pré-requisito, usar); bestiário
  (criaturas como classes, arquétipo de criatura, invocar no grupo, morte automática); cartas em grade com pop-up; status visível na
  ficha e no grupo; ficha e inventário para celular; skill de balanceamento e script `exportar` (o `fixar-classe` saiu em 2026-10-14: não há mais conteúdo fixo).

- NPCs com ficha (raça, classe opcional, nível, dados, perícias, cartas, inventário).
- Kits de RPG (no lugar de "exclusivo de um grupo"): coleções por aventura, kit ativo que filtra a interface, kit do grupo.
- Conta sem e-mail com código de recuperação ("Esqueceu a senha?"), idade mínima de 12 anos, exportação dos dados, exclusão da conta,
  fichas arquivadas; minutas de Termos de uso e Política de privacidade.

- Regras de combate definidas e visíveis (documentação, página do grupo, ficha), regras da mesa, turnos nos status e aprimoramento
  como carta inteira por nível; personagem entre mesas (2026-10-14).

## Em andamento
- Instruções de deploy (Render, Vercel).
- Configurar a chave secreta do Supabase em produção; revisar as minutas legais (`docs/legal/REVISAO_LEGAL_PENDENCIAS.md`).

## A seguir (fora do escopo atual)
- Sessões, rolagem de dados no app (com gasto de esforço).

## Ideias em aberto
- Drag-and-drop para reordenar cartas (hoje: botões de seta).
- Upload de imagem para o Supabase Storage (hoje é só link externo).
- Testes de integração contra um Postgres real (ex.: branch do Supabase ou container).
- Testes de componentes no front (hoje só typecheck + build).
- Code-splitting do bundle (o supabase-js deixa o JS principal com ~590 kB; ~170 kB gzip).
- "Restaurar perícias base" no catálogo do mestre (hoje, base apagada só volta ao duplicar uma classe verificada que a use).
- Definir: cartas de um nível são todas recebidas ou escolhidas? Perícia nova é escolhida ou pré-determinada?
- Desfazer gasto de pontos de perícia (descer de nível não existe por regra).
- "Desativar" a interface de mestre.
- Jogador criar itens próprios (hoje só o mestre cria).
- Limite de tentativas no login por nickname.
