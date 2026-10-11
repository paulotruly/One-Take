// Include do Prisma para cartas (sem imports, para evitar dependência circular entre módulos).

export const resumoStatus = { select: { id: true, nome: true, tipo: true } } as const;

/** O que acompanha uma carta nas respostas: status que ativa e aprimoramentos por nível. */
export const comStatus = {
  status: resumoStatus,
  aprimoramentos: { orderBy: { nivel: "asc" }, include: { status: resumoStatus } },
} as const;
