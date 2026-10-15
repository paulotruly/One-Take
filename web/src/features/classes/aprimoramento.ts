// Aprimoramento de carta: a versão da carta logo antes de um nível e o resumo do que muda (para listas e formulário).
import { rotuloLimite, type Aprimoramento, type AprimoramentoInput, type Habilidade } from "./types";

type Versao = Omit<AprimoramentoInput, "nivel"> & { status?: { nome: string } | null };
export type CartaComAprimoramentos = Pick<Habilidade, "titulo" | "descricao" | "descricaoEfeito" | "condicao" | "limiteUsos" | "limitePor" | "custoMana" | "statusId" | "nivelNecessario"> & {
  status?: { nome: string } | null;
  aprimoramentos?: Aprimoramento[];
};

/** A carta como ela está logo antes do nível dado (último aprimoramento abaixo dele, ou a carta). */
export function versaoAntes(carta: CartaComAprimoramentos, nivel: number): Versao {
  const anterior = (carta.aprimoramentos ?? []).filter((a) => a.nivel < nivel).sort((a, b) => a.nivel - b.nivel).at(-1);
  const v = anterior ?? carta;
  return {
    titulo: v.titulo,
    descricao: v.descricao,
    descricaoEfeito: v.descricaoEfeito,
    condicao: v.condicao ?? null,
    limiteUsos: v.limiteUsos ?? null,
    limitePor: v.limitePor ?? null,
    custoMana: v.custoMana,
    statusId: v.statusId ?? null,
    status: v.status ?? null,
  };
}

/** Texto curto do que muda em relação à versão anterior (para listas). */
export function resumoAprimoramento(a: Aprimoramento, carta: CartaComAprimoramentos) {
  const antes = versaoAntes(carta, a.nivel);
  const partes = [];
  if (a.titulo !== antes.titulo) partes.push(`título "${a.titulo}"`);
  if (a.descricaoEfeito !== antes.descricaoEfeito) partes.push(`efeito: ${a.descricaoEfeito}`);
  if (a.custoMana !== antes.custoMana) partes.push(`custo ${a.custoMana} de mana`);
  if ((a.condicao ?? null) !== antes.condicao) partes.push(a.condicao ? `condição: ${a.condicao}` : "sem condição");
  if (a.limiteUsos !== antes.limiteUsos || a.limitePor !== antes.limitePor) partes.push(`limite: ${rotuloLimite(a.limiteUsos, a.limitePor) ?? "sem limite"}`);
  if (a.statusId !== antes.statusId) partes.push(a.status ? `ativa ${a.status.nome}` : "não ativa status");
  if (a.descricao !== antes.descricao) partes.push("descrição nova");
  return partes.join(" · ") || "Sem mudanças em relação à versão anterior.";
}
