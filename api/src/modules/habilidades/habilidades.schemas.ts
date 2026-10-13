import { z } from "zod";
import { LimiteUso, TipoEfeito } from "../../generated/prisma/enums.js";
import { inteiro, texto, textoOpcional } from "../../lib/validacao.js";

const limiteUsos = inteiro(1, 99).nullable();
const limitePor = z.enum(LimiteUso, "Escolha combate ou sessão").nullable();

/** Limite: os dois juntos (vezes e período) ou nenhum. No PATCH, mandar um exige mandar o outro. */
function limiteCompleto(v: { limiteUsos?: number | null; limitePor?: string | null }, ctx: z.RefinementCtx) {
  const temUsos = v.limiteUsos !== undefined && v.limiteUsos !== null;
  const temPor = v.limitePor !== undefined && v.limitePor !== null;
  if (temUsos !== temPor || (v.limiteUsos === undefined) !== (v.limitePor === undefined)) {
    ctx.addIssue({ code: "custom", message: "Escolha quantas vezes e se é por combate ou por sessão", path: [temUsos ? "limitePor" : "limiteUsos"] });
  }
}

// Sem defaults aqui: no Zod 4 o default seria aplicado também no PATCH (partial),
// sobrescrevendo o valor salvo.
const base = z.object({
  titulo: texto(80),
  descricao: texto(2000),
  condicao: textoOpcional(500),
  /** Lista fixa do sistema (Dano, Defesa, Cura…). */
  tipoEfeito: z.enum(TipoEfeito, "Escolha um tipo de efeito"),
  descricaoEfeito: texto(2000),
  limiteUsos,
  limitePor,
  nivelNecessario: inteiro(1, 100),
  custoMana: inteiro(0, 999),
  /** Status que a carta ativa (opcional). */
  statusId: z.guid("Status inválido").nullable(),
  /** Perícia que o personagem testa para usar a carta (opcional). */
  periciaId: z.guid("Perícia inválida").nullable(),
});

export const criarHabilidadeSchema = base
  .extend({
    nivelNecessario: base.shape.nivelNecessario.default(1),
    custoMana: base.shape.custoMana.default(0),
    statusId: base.shape.statusId.default(null),
    periciaId: base.shape.periciaId.default(null),
    limiteUsos: limiteUsos.default(null),
    limitePor: limitePor.default(null),
  })
  .superRefine(limiteCompleto);
export const editarHabilidadeSchema = base.partial().superRefine(limiteCompleto);

export const ordenarHabilidadesSchema = z.object({
  ids: z.array(z.guid()).min(1),
});

/** Aprimoramento: nível + o que muda. Campos ausentes/nulos continuam como na carta. */
export const aprimoramentoSchema = z
  .object({
    nivel: inteiro(2, 100),
    titulo: textoOpcional(80).transform((v) => v ?? null),
    descricaoEfeito: textoOpcional(2000).transform((v) => v ?? null),
    condicao: textoOpcional(500).transform((v) => v ?? null),
    limiteUsos: limiteUsos.optional().transform((v) => v ?? null),
    limitePor: limitePor.optional().transform((v) => v ?? null),
    custoMana: inteiro(0, 999).nullish().transform((v) => v ?? null),
    statusId: z.guid("Status inválido").nullish().transform((v) => v ?? null),
  })
  .superRefine(limiteCompleto)
  .refine(
    (a) => [a.titulo, a.descricaoEfeito, a.condicao, a.limiteUsos, a.custoMana, a.statusId].some((v) => v !== null),
    { message: "Mude pelo menos uma coisa na carta (efeito, custo, limite…)", path: ["descricaoEfeito"] },
  );
