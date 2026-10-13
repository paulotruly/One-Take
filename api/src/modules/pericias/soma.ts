// Soma de perícias de um personagem (ficha ou NPC): uma linha por perícia, com quanto veio de cada fonte e o total.
// Perícias base (das classes fixas, donoId nulo) contam como a cópia do catálogo do mestre (mesma origem).
// Fonte única usada pela ficha, pelo NPC e pelo pré-requisito de itens.
import type { Atributo, Pericia } from "../../generated/prisma/client.js";
import { getPrisma } from "../../lib/prisma.js";
import { notacaoDoTeste } from "../../regras/teste.js";
import { apresentarAtributo, porAtributoENome } from "../atributos/atributos.service.js";

/** Liga cada perícia base à cópia dela no catálogo do mestre. */
export async function copiasDoCatalogo(mestreId: string) {
  const copias = await getPrisma().pericia.findMany({ where: { donoId: mestreId, origemId: { not: null } }, select: { id: true, origemId: true } });
  return new Map(copias.map((c) => [c.origemId!, c.id]));
}

type Entrada<F extends string> = { pericia: Pericia & { atributo: Atributo }; fonte: F; valor: number };

export type LinhaPericia<F extends string> = {
  id: string;
  nome: string;
  descricao: string;
  categoria: Pericia["categoria"];
  atributo: ReturnType<typeof apresentarAtributo>;
  total: number;
} & Record<F, number>;

/** Soma as entradas por perícia, ordenando por atributo e nome. Todas as fontes aparecem em cada linha (0 se não contribuiu). */
export function somarPericias<F extends string>(fontes: readonly F[], entradas: Entrada<F>[], copiaDe: Map<string, string>): LinhaPericia<F>[] {
  const linhas = new Map<string, LinhaPericia<F>>();
  for (const { pericia: p, fonte, valor } of entradas) {
    const chave = p.donoId === null ? (copiaDe.get(p.id) ?? p.id) : p.id;
    let l = linhas.get(chave);
    if (!l) {
      l = { id: chave, nome: p.nome, descricao: p.descricao, categoria: p.categoria, atributo: apresentarAtributo(p.atributo), total: 0 } as LinhaPericia<F>;
      for (const f of fontes) (l as Record<string, number>)[f] = 0;
      linhas.set(chave, l);
    }
    (l as Record<string, number>)[fonte] += valor;
    l.total += valor;
  }
  return [...linhas.values()].sort(porAtributoENome);
}

type CartaComPericia = { pericia?: { id: string; nome: string; donoId: string | null; atributo: { id: string; nome: string } } | null };

/**
 * Teste para usar a carta, para um personagem: dados do atributo da perícia + total dele nela (0 se não tem).
 * Ex.: { pericia: "Luta", atributo: "Capacidade física", teste: "2d20 + 5" }. Sem perícia definida = null.
 */
export function testeDaCarta(carta: CartaComPericia, totais: Map<string, number>, dadosPorAtributo: Map<string, number>, copiaDe: Map<string, string>) {
  const p = carta.pericia;
  if (!p) return null;
  const chave = p.donoId === null ? (copiaDe.get(p.id) ?? p.id) : p.id;
  return { pericia: p.nome, atributo: p.atributo.nome, teste: notacaoDoTeste(dadosPorAtributo.get(p.atributo.id) ?? 0, totais.get(chave) ?? 0) };
}
