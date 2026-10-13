import { z } from "zod";
import { nicknameSchema } from "../../lib/nickname.js";
import { textoOpcional, urlOpcional } from "../../lib/validacao.js";

export const editarPerfilSchema = z.object({
  nickname: nicknameSchema.optional(),
  nome: textoOpcional(60),
  fotoUrl: urlOpcional(),
  /** Esconde da própria interface o conteúdo verificado de outras pessoas. */
  ocultarVerificados: z.boolean().optional(),
});
