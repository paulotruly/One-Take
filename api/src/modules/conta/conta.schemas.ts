import { z } from "zod";
import { nicknameSchema } from "../../lib/nickname.js";
import { textoOpcional } from "../../lib/validacao.js";
import { problemaNaDataDeNascimento } from "../../regras/conta.js";

/** O Supabase exige no mínimo 6; o bcrypt usa até 72 bytes. */
export const senhaSchema = z.string("Obrigatório").min(6, "Use pelo menos 6 caracteres").max(72, "Use no máximo 72 caracteres");
const senhaAtual = z.string("Obrigatório").min(1, "Obrigatório");

/** "AAAA-MM-DD"; idade mínima conferida com a data do servidor. */
export const dataNascimentoSchema = z
  .iso.date("Informe a data de nascimento")
  .transform((s) => new Date(`${s}T00:00:00Z`))
  .superRefine((data, ctx) => {
    const problema = problemaNaDataDeNascimento(data, new Date());
    if (problema) ctx.addIssue({ code: "custom", message: problema });
  });

export const cadastroSchema = z.object({
  nickname: nicknameSchema,
  senha: senhaSchema,
  papel: z.enum(["JOGADOR", "MESTRE"]).default("JOGADOR"),
  dataNascimento: dataNascimentoSchema,
  nome: textoOpcional(60),
});

export const recuperarSchema = z.object({
  nickname: z.string("Obrigatório").min(1, "Obrigatório"),
  codigo: z.string("Obrigatório").min(1, "Obrigatório").max(64),
  senha: senhaSchema,
});

export const senhaAtualSchema = z.object({ senha: senhaAtual });

/** Exclusão: senha + o próprio nickname digitado (evita exclusão por engano). */
export const exclusaoSchema = z.object({ senha: senhaAtual, confirmacao: z.string("Obrigatório").min(1, "Obrigatório") });
