// Regras dos status automáticos (fonte única). Os efeitos são informativos: não alteram números da ficha.
import type { GatilhoStatus } from "../generated/prisma/enums.js";

type Atuais = { vidaAtual: number; manaAtual: number; esforcoAtual: number };

/** Gatilhos ligados pelos recursos atuais: vida 0 e mana 0 = morte; esforço 0 = cansaço. */
export function gatilhosAtivos({ vidaAtual, manaAtual, esforcoAtual }: Atuais): GatilhoStatus[] {
  const ativos: GatilhoStatus[] = [];
  if (vidaAtual <= 0) ativos.push("VIDA_ZERO");
  if (manaAtual <= 0) ativos.push("MANA_ZERO");
  if (esforcoAtual <= 0) ativos.push("ESFORCO_ZERO");
  return ativos;
}

/** Vida ou mana em 0 = personagem morto. */
export function estaMorto(atuais: Atuais) {
  return atuais.vidaAtual <= 0 || atuais.manaAtual <= 0;
}
