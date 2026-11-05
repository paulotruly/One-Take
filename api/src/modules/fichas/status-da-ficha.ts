// Status atuais de uma ficha: automáticos (pelos recursos) + aplicados pelo mestre, só os ativados no grupo.
// Um status automático também pode ser aplicado à mão (ex.: carta que deixa Cansado): aí aparece como manual,
// com turnos e botão de tirar, a não ser que o recurso já o ative (o automático vence).
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
  const peloRecurso = new Set(automaticos.map((a) => a.status.id));
  const manuais = aplicados.filter(({ status: s }) => ativos.has(s.id) && !peloRecurso.has(s.id));
  return [...automaticos.map((a) => ({ ...a, automatico: true })), ...manuais.map((m) => ({ ...m, automatico: false }))]
    .sort((a, b) => a.status.ordem - b.status.ordem || a.status.nome.localeCompare(b.status.nome, "pt-BR"))
    .map(({ status, turnos, automatico }) => ({ ...apresentarStatus(status), automatico, turnos }));
}
