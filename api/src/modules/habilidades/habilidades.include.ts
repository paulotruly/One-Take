// Include do Prisma para cartas (sem imports, para evitar dependência circular entre módulos).

export const resumoStatus = { select: { id: true, nome: true, tipo: true } } as const;

/** O que acompanha uma carta nas respostas: status que ativa, perícia testada, perícia de defesa do alvo e aprimoramentos. */
export const comStatus = {
  status: resumoStatus,
  pericia: { select: { id: true, nome: true, donoId: true, origemId: true, atributo: { select: { id: true, nome: true } } } },
  periciasDefesa: { include: { pericia: { select: { id: true, nome: true, donoId: true, atributo: { select: { id: true, nome: true } } } } } },
  aprimoramentos: { orderBy: { nivel: "asc" }, include: { status: resumoStatus } },
} as const;
