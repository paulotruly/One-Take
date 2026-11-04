# ADR-019: Tema escuro dark fantasy minimalista

- **Status:** Aceito
- **Data:** 2026-11-04
- **Responsável pela decisão:** Paulo Gomes

## Contexto
A interface usava fundo branco, primária índigo e a fonte do sistema. Segundo o responsável, ela parecia uma plataforma de saúde, e não um RPG. A regra de tema claro vinha do ADR-012, resumido no `PROJECT_CONTEXT.md`, e as demais regras de design continuam válidas.

## Decisão
- O tema passa a ser escuro, em direção dark fantasy minimalista, e substitui só a parte de tema do ADR-012. Cantos retos e ícones apenas do `lucide-react` continuam obrigatórios.
- `--cor-primaria` passa a ser o destaque dourado (links, foco, ícones ativos, títulos). O novo `--cor-acao` é o botão primário, em dourado preenchido com texto escuro. Vermelho fica só para ações destrutivas e perigo (`--cor-perigo*`), para um botão de criar não parecer de apagar.
- Títulos `h1` e `h2` usam Cinzel; o restante usa Inter. As fontes são pacotes `@fontsource-variable` incluídos no build, sem chamada ao Google Fonts.
- Os ornamentos são feitos só com CSS: cantoneiras nos cards principais e linha com losango abaixo dos títulos. Nenhum caractere é usado como ícone.
- Pares de texto e fundo atendem AA (4.5:1), e o contorno de campo atinge 3:1.

## Alternativas consideradas
- **Grimório ornamentado:** texturas, molduras de metal e efeitos de brilho. Rejeitada porque pesa mais e pode atrapalhar a leitura de fichas e formulários longos.
- **Híbrido:** ornamentação só na home e nas páginas de entrada. Rejeitada em favor de um visual único no app.
- **Fontes pelo Google Fonts:** rejeitada para não adicionar um fornecedor externo.

## Consequências
- O visual segue centralizado em `web/src/styles/tokens.css`, e as telas não mudaram de estrutura.
- Cores de ação e de destaque têm tokens separados, embora hoje usem o mesmo dourado.
- O build fica maior por incluir as fontes.
- Não há seletor de tema: o app tem só o tema escuro.
