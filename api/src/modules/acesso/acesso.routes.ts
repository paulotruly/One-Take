// Rotas públicas de acesso por nickname (sem login).
import { Router } from "express";
import { z } from "zod";
import { naoAutenticado } from "../../lib/errors.js";
import { emailInterno, nicknameSchema, normalizarNickname } from "../../lib/nickname.js";
import { getPrisma } from "../../lib/prisma.js";

export const acessoRouter = Router();

/** Disponibilidade de um nickname (usada no cadastro antes de criar a conta). */
acessoRouter.get("/nicknames/:nickname", async (req, res) => {
  const r = nicknameSchema.safeParse(req.params.nickname);
  if (!r.success) {
    res.json({ disponivel: false, motivo: r.error.issues[0]?.message });
    return;
  }
  const existe = await getPrisma().perfil.findUnique({ where: { nickname: r.data }, select: { id: true } });
  res.json({ disponivel: !existe, motivo: existe ? "Este nickname já está em uso." : undefined });
});

const entrarSchema = z.object({ login: z.string().min(1, "Obrigatório"), senha: z.string().min(1, "Obrigatório") });

/**
 * Login por nickname: descobre o email da conta (interno ou real, nunca exposto) e pede a sessão ao Supabase.
 * Também aceita email no campo de login, para contas antigas.
 */
acessoRouter.post("/entrar", async (req, res) => {
  const { login, senha } = entrarSchema.parse(req.body);
  let email = login.trim().toLowerCase();
  if (!email.includes("@") || email.startsWith("@")) {
    const nickname = normalizarNickname(login);
    const perfil = await getPrisma().perfil.findUnique({ where: { nickname }, select: { email: true } });
    email = perfil?.email ?? emailInterno(nickname); // conta recém-criada pode ainda não ter perfil
  }

  const resposta = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });
  if (!resposta.ok) throw naoAutenticado("Nickname ou senha incorretos.");
  const sessao = (await resposta.json()) as { access_token: string; refresh_token: string };
  res.json({ access_token: sessao.access_token, refresh_token: sessao.refresh_token });
});
