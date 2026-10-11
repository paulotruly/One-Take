import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { Papel } from "../generated/prisma/enums.js";
import { conflito, naoAutenticado, proibido } from "../lib/errors.js";
import { nicknameDoEmail, nicknameSchema } from "../lib/nickname.js";
import { getPrisma } from "../lib/prisma.js";

export type Usuario = { id: string; email: string; papel: Papel; catalogoIniciado: boolean };

declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

// O Supabase assina os JWTs com chaves assimétricas publicadas no JWKS do projeto.
// jose faz cache das chaves e recarrega quando aparece um `kid` novo.
let jwks: JWTVerifyGetKey | undefined;
export function definirJwks(getKey: JWTVerifyGetKey) {
  jwks = getKey; // usado nos testes
}

async function verificarToken(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  jwks ??= createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${supabaseUrl}/auth/v1`,
    audience: "authenticated",
  });
  if (!payload.sub) throw new Error("token sem sub");
  // user_metadata vem do cadastro (supabase.auth.signUp com options.data): papel, nickname e nome.
  const meta = (payload.user_metadata ?? {}) as { papel?: unknown; nome?: unknown; nickname?: unknown };
  const nick = nicknameSchema.safeParse(meta.nickname ?? "");
  return {
    id: payload.sub,
    email: String(payload.email ?? "").toLowerCase(),
    papel: meta.papel === "MESTRE" ? ("MESTRE" as const) : ("JOGADOR" as const),
    nome: typeof meta.nome === "string" && meta.nome.trim() ? meta.nome.trim().slice(0, 60) : null,
    nickname: nick.success ? nick.data : null,
  };
}

/** Valida o JWT e carrega o perfil (criado como JOGADOR no primeiro acesso). */
export const autenticar: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const [tipo, token] = header.split(" ");
  if (tipo !== "Bearer" || !token) throw naoAutenticado();

  let claims: Claims;
  try {
    claims = await verificarToken(token);
  } catch {
    throw naoAutenticado("Sessão inválida ou expirada. Faça login novamente.");
  }

  const perfil = await carregarPerfil(claims);
  req.usuario = { id: perfil.id, email: perfil.email, papel: perfil.papel, catalogoIniciado: perfil.catalogoIniciado };
  next();
};

type Claims = Awaited<ReturnType<typeof verificarToken>>;

/**
 * Busca o perfil do usuário ou cria com o papel escolhido no cadastro (MESTRE ou JOGADOR; padrão JOGADOR).
 * Caso especial: usuário apagado e recriado no Supabase Auth com o mesmo email ganha um id novo.
 * Se a conta antiga não existe mais, o perfil antigo (papel e classes) é transferido para o id novo
 * (as FKs têm ON UPDATE CASCADE).
 */
async function carregarPerfil({ id, email, papel, nome, nickname }: Claims) {
  const prisma = getPrisma();
  const atual = await prisma.perfil.findUnique({ where: { id } });
  if (atual) return atual;

  const mesmoEmail = email ? await prisma.perfil.findUnique({ where: { email } }) : null;
  if (!mesmoEmail) return prisma.perfil.create({ data: { id, email, papel, nome, nickname: await nicknameLivre(nickname ?? nicknameDoEmail(email)) } });

  const antigaAindaExiste = await prisma.$queryRaw<unknown[]>`
    SELECT 1 FROM auth.users WHERE id = ${mesmoEmail.id}::uuid`;
  if (antigaAindaExiste.length > 0) {
    throw conflito("EMAIL_EM_USO", "Já existe outro perfil com este email.");
  }
  return prisma.perfil.update({ where: { id: mesmoEmail.id }, data: { id } });
}

export const exigirPapel =
  (...papeis: Papel[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.usuario) throw naoAutenticado();
    if (!papeis.includes(req.usuario.papel)) throw proibido("Acesso restrito a mestres");
    next();
  };

/** Atalho para handlers que rodam depois de `autenticar`. */
export function usuarioDe(req: Express.Request): Usuario {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

/** O nickname desejado, ou com sufixo numérico se já estiver em uso. */
async function nicknameLivre(desejado: string) {
  const prisma = getPrisma();
  for (let i = 0; i < 50; i++) {
    const candidato = i === 0 ? desejado : `${desejado.slice(0, 17)}${i + 1}`;
    if (!(await prisma.perfil.findUnique({ where: { nickname: candidato }, select: { id: true } }))) return candidato;
  }
  throw conflito("NICKNAME_EM_USO", "Não foi possível gerar um nickname livre.");
}
