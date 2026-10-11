import { z } from "zod";
import { naoEncontrado } from "./errors.js";

// Mensagens de validação em português; campo ausente vira simplesmente "Obrigatório".
z.config({
  ...z.locales.pt(),
  customError: (issue) => (issue.input === undefined ? "Obrigatório" : undefined),
});

/** Texto obrigatório, sem espaços nas pontas. */
export const texto = (max: number) => z.string().trim().min(1, "Obrigatório").max(max);

/** Texto opcional: "" vira null; undefined continua undefined (não altera no PATCH). */
export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v === undefined ? undefined : v || null));

/** Link http(s) opcional; "" vira null. */
export const urlOpcional = () =>
  z
    .union([z.url({ protocol: /^https?$/, error: "Informe um link http(s) válido" }).max(2000), z.literal("")])
    .nullish()
    .transform((v) => (v === undefined ? undefined : v || null));

export const inteiro = (min: number, max: number) =>
  z.number().int("Deve ser um número inteiro").min(min, `Deve ser no mínimo ${min}`).max(max, `Deve ser no máximo ${max}`);

/** Id de rota; id malformado é tratado como "não encontrado". */
export function idDe(valor: unknown, mensagem = "Recurso não encontrado") {
  const r = z.guid().safeParse(valor);
  if (!r.success) throw naoEncontrado(mensagem);
  return r.data;
}
