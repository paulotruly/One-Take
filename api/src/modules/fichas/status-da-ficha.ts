// Status atuais de uma ficha: automáticos (pelos recursos) + aplicados pelo mestre, só os ativados no grupo.
import type { Status } from "../../generated/prisma/client.js";
import { gatilhosAtivos } from "../../regras/status.js";
import { apresentarStatus } from "../status/status.service.js";

type Atuais = { vidaAtual: number; manaAtual: number; esforcoAtual: number };

export function statusDaFicha(atuais: Atuais, ativosNoGrupo: Status[], aplicados: Status[]) {
  const ativos = new Set(ativosNoGrupo.map((s) => s.id));
  const gatilhos = new Set(gatilhosAtivos(atuais));
  const automaticos = ativosNoGrupo.filter((s) => s.gatilho && gatilhos.has(s.gatilho));
  const manuais = aplicados.filter((s) => ativos.has(s.id) && !s.gatilho);
  return [...automaticos, ...manuais].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")).map(apresentarStatus);
}
