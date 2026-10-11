// Nickname: identificador público e de login. Guardado minúsculo e sem "@"; exibido como @nickname.
import { z } from "zod";

export const DOMINIO_EMAIL_INTERNO = "one-take.local";

/** Tira espaços e um "@" inicial, e passa para minúsculo. */
export function normalizarNickname(valor: string) {
  return valor.trim().replace(/^@/, "").toLowerCase();
}

export const nicknameSchema = z
  .string()
  .transform(normalizarNickname)
  .pipe(
    z
      .string()
      .min(3, "Use pelo menos 3 caracteres")
      .max(20, "Use no máximo 20 caracteres")
      .regex(/^[a-z0-9_.-]+$/, "Use só letras sem acento, números, ponto, hífen ou _"),
  );

/** Email interno que o app usa no Supabase Auth para contas criadas por nickname. */
export function emailInterno(nickname: string) {
  return `${nickname}@${DOMINIO_EMAIL_INTERNO}`;
}

/** Nickname a partir da parte local do email (contas criadas fora do app). */
export function nicknameDoEmail(email: string) {
  const base = normalizarNickname(email.split("@")[0] ?? "").replace(/[^a-z0-9_.-]/g, "");
  return (base.length >= 3 ? base : `${base}usuario`).slice(0, 16);
}
