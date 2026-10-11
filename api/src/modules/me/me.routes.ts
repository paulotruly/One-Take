import { Router } from "express";
import { conflito } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { usuarioDe } from "../../middleware/auth.js";
import { editarPerfilSchema } from "./me.schemas.js";

// Perfil do próprio usuário (qualquer papel). O email interno nunca é exposto.
export const meRouter = Router();

const publico = { id: true, nickname: true, papel: true, nome: true, fotoUrl: true } as const;

meRouter.get("/me", async (req, res) => {
  res.json(await getPrisma().perfil.findUniqueOrThrow({ where: { id: usuarioDe(req).id }, select: publico }));
});

meRouter.patch("/me", async (req, res) => {
  const dados = editarPerfilSchema.parse(req.body);
  const prisma = getPrisma();
  const id = usuarioDe(req).id;
  if (dados.nickname) {
    const outro = await prisma.perfil.findFirst({ where: { nickname: dados.nickname, NOT: { id } }, select: { id: true } });
    if (outro) throw conflito("NICKNAME_EM_USO", `@${dados.nickname} já está em uso.`);
  }
  res.json(await prisma.perfil.update({ where: { id }, data: dados, select: publico }));
});
