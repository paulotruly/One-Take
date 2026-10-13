// Código de recuperação: troca a senha sem e-mail. Mostrado uma vez ao usuário; o banco guarda só o SHA-256.
// 20 caracteres do alfabeto Crockford base32 (sem I, L, O, U) = 100 bits aleatórios, em blocos de 5: "7KQ2M-9XH4T-...".
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TAMANHO = 20;

/** Maiúsculas, sem espaços e hífens; O vira 0 e I/L viram 1 (letras que se confundem ao copiar à mão). */
export function normalizarCodigo(codigo: string) {
  return codigo.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
}

export const hashDoCodigo = (codigo: string) => createHash("sha256").update(normalizarCodigo(codigo), "utf8").digest("hex");

/** Código novo em texto (para mostrar uma vez) e o hash (para guardar). */
export function novoCodigo() {
  const bruto = Array.from({ length: TAMANHO }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  const codigo = bruto.match(/.{5}/g)!.join("-");
  return { codigo, hash: hashDoCodigo(codigo) };
}

/** Compara em tempo constante. Hash ausente (conta sem código) nunca confere. */
export function codigoConfere(codigo: string, hash: string | null) {
  if (!hash || typeof codigo !== "string" || normalizarCodigo(codigo).length !== TAMANHO) return false;
  return timingSafeEqual(Buffer.from(hashDoCodigo(codigo), "hex"), Buffer.from(hash, "hex"));
}
