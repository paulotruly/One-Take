// Status atuais de uma ficha: automáticos (pelos recursos) + aplicados pelo mestre, só os ativados no grupo.
import type { Status } from "../../generated/prisma/client.js";
import { gatilhosAtivos } from "../../regras/status.js";
import { apresentarStatus } from "../status/status.service.js";

type Atuais = { vidaAtual: number; manaAtual: number; esforcoAtual: number };
/** Status aplicado (FichaStatus, NpcStatus, CriaturaStatus): o status e os turnos que faltam (nulo = sem prazo). */
type Aplicado = { status: Status; turnos: number | null };

export function statusDaFicha(atuais: Atuais, ativosNoGrupo: Status[], aplicados: Aplicado[]) {
  const ativos = new Set(ativosNoGrupo.map((s) => s.id));
  const gatilhos = new Set(gatilhosAtivos(atuais));
  const automaticos = ativosNoGrupo.filter((s) => s.gatilho && gatilhos.has(s.gatilho)).map((status) => ({ status, turnos: null }));
  const manuais = aplicados.filter(({ status: s }) => ativos.has(s.id) && !s.gatilho);
  return [...automaticos, ...manuais]
    .sort((a, b) => a.status.ordem - b.status.ordem || a.status.nome.localeCompare(b.status.nome, "pt-BR"))
    .map(({ status, turnos }) => ({ ...apresentarStatus(status), turnos }));
}
