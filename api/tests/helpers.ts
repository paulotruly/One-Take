// Utilitários de teste: usuários, JWTs assinados localmente e dados falsos.
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { definirJwks } from "../src/middleware/auth.js";
import { prismaFalso } from "./prisma-falso.js";

export { prismaFalso };

export const MESTRE = { id: "11111111-1111-4111-8111-111111111111", email: "mestre@x.com", papel: "MESTRE", catalogoIniciado: true };
export const JOGADOR = { id: "22222222-2222-4222-8222-222222222222", email: "jogador@x.com", papel: "JOGADOR", catalogoIniciado: false };
export const OUTRO_MESTRE_ID = "33333333-3333-4333-8333-333333333333";

const ISS = "https://teste.supabase.co/auth/v1";
let chavePrivada: CryptoKey;

export async function prepararJwks() {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  chavePrivada = privateKey;
  const jwk = { ...(await exportJWK(publicKey)), kid: "teste", alg: "ES256" };
  definirJwks(createLocalJWKSet({ keys: [jwk] }));
}

export async function token(
  usuario: { id: string; email: string },
  opcoes: { aud?: string; iss?: string; metadata?: Record<string, unknown> } = {},
) {
  return new SignJWT({ email: usuario.email, user_metadata: opcoes.metadata ?? {} })
    .setProtectedHeader({ alg: "ES256", kid: "teste" })
    .setSubject(usuario.id)
    .setIssuer(opcoes.iss ?? ISS)
    .setAudience(opcoes.aud ?? "authenticated")
    .setExpirationTime("5m")
    .sign(chavePrivada);
}

/** Faz o "login" de um usuário: a busca de perfil devolve esse papel. */
export function logarComo(usuario: typeof MESTRE) {
  prismaFalso.perfil.findUnique.mockResolvedValue(usuario);
}

export function classeFake(sobrescrever: Record<string, unknown> = {}) {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    grupo: "COMBATENTE",
    titulo: "Teste",
    descricao: "Desc",
    imagemUrl: null,
    pontosVida: 10,
    pontosMana: 5,
    pontosEsforco: 3,
    donoId: MESTRE.id,
    origemId: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...sobrescrever,
  };
}
