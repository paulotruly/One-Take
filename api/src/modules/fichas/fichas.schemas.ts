import { z } from "zod";
import { inteiro, texto, textoOpcional, urlOpcional } from "../../lib/validacao.js";

export const criarFichaSchema = z.object({
  codigo: z.string().trim().min(1, "Obrigatório").transform((c) => c.toUpperCase()),
  nome: texto(60),
  classeId: z.guid("Escolha uma classe"),
  racaId: z.guid("Escolha uma raça"),
  historia: textoOpcional(4000),
  imagemUrl: urlOpcional(),
  /** Dados (d20) por atributo: { [atributoId]: quantidade }. Soma = pontos iniciais. */
  dados: z.record(z.guid(), inteiro(0, 99)),
  /** Levar um personagem de outra mesa (ficha ativa ou arquivada): mesma classe, raça e nível; sem itens; recursos cheios. */
  origem: z.object({ tipo: z.enum(["FICHA", "ARQUIVADA"]), id: z.guid("Personagem inválido") }).nullish(),
});

export const editarFichaSchema = z.object({
  nome: texto(60).optional(),
  historia: textoOpcional(4000),
  imagemUrl: urlOpcional(),
  vidaAtual: inteiro(0, 99999).optional(),
  manaAtual: inteiro(0, 99999).optional(),
  esforcoAtual: inteiro(0, 99999).optional(),
});

export const gastarPericiaSchema = z.object({
  periciaId: z.guid("Escolha uma perícia"),
});
