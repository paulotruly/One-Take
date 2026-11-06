// Posse: tudo pertence à conta que criou. Nada é compartilhado entre contas de mestre; quem joga vê o conteúdo do
// mestre só pela mesa (classes, raças, regras e itens que ele liberou nela).

/** Filtro Prisma: só as coisas do próprio usuário. */
export const doDono = (usuarioId: string) => ({ donoId: usuarioId });

/** A coisa é do usuário. */
export const ehDoDono = (obj: { donoId: string | null }, usuarioId: string) => obj.donoId === usuarioId;
