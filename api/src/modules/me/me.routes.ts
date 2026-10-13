import { Router } from "express";
import { conflito } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { usuarioDe } from "../../middleware/auth.js";
import { editarPerfilSchema } from "./me.schemas.js";
import { apresentarConta, camposDaConta } from "../conta/conta.service.js";

// Perfil do próprio usuário (qualquer papel). O e-mail interno do login nunca é exposto; o de contato só para o dono.
export const meRouter = Router();

const publico = camposDaConta;

meRouter.get("/me", async (req, res) => {
  res.json(apresentarConta(await getPrisma().perfil.findUniqueOrThrow({ where: { id: usuarioDe(req).id }, select: publico })));
});

/**
 * Ativa a interface de mestre nesta conta (papel MESTRE). Toda conta joga; só quem ativa ganha a área do mestre,
 * e o catálogo de perícias dele só é criado no primeiro acesso a ela (não gasta espaço de quem nunca mestra).
 */
meRouter.post("/me/mestre", async (req, res) => {
  const usuario = usuarioDe(req);
  res.json(apresentarConta(await getPrisma().perfil.update({ where: { id: usuario.id }, data: { papel: "MESTRE" }, select: publico })));
});

meRouter.patch("/me", async (req, res) => {
  const dados = editarPerfilSchema.parse(req.body);
  const prisma = getPrisma();
  const id = usuarioDe(req).id;
  if (dados.nickname) {
    const outro = await prisma.perfil.findFirst({ where: { nickname: dados.nickname, NOT: { id } }, select: { id: true } });
    if (outro) throw conflito("NICKNAME_EM_USO", `@${dados.nickname} já está em uso.`);
  }
  res.json(apresentarConta(await prisma.perfil.update({ where: { id }, data: dados, select: publico })));
});
