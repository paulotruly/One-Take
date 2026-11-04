// Título da aba do navegador por página.
const TITULOS: [RegExp, string][] = [
  [/^\/mestre\/inicio/, "Início"],
  [/^\/mestre\/grupos/, "Grupos"],
  [/^\/mestre\/fichas/, "Ficha"],
  [/^\/mestre\/kits/, "Kits de RPG"],
  [/^\/mestre\/racas/, "Raças"],
  [/^\/mestre\/npcs/, "NPCs"],
  [/^\/mestre\/bestiario/, "Bestiário"],
  [/^\/mestre\/itens/, "Itens"],
  [/^\/mestre\/pericias/, "Perícias"],
  [/^\/mestre\/status/, "Status"],
  [/^\/mestre/, "Classes"],
  [/^\/jogador/, "Minhas fichas"],
  [/^\/docs/, "Documentação"],
  [/^\/conta/, "Perfil e conta"],
  [/^\/login/, "Entrar"],
  [/^\/cadastro/, "Criar conta"],
  [/^\/recuperar-senha/, "Recuperar senha"],
  [/^\/ativar-mestre/, "Ativar mestre"],
];

export function atualizarTitulo(caminho: string) {
  const titulo = TITULOS.find(([padrao]) => padrao.test(caminho))?.[1];
  document.title = titulo ? `${titulo} · One-Take` : "One-Take";
}
