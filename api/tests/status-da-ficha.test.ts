import { describe, expect, it } from "vitest";
import type { Status } from "../src/generated/prisma/client.js";
import { statusDaFicha } from "../src/modules/fichas/status-da-ficha.js";

const status = (id: string, gatilho: Status["gatilho"] = null) =>
  ({ id, nome: id, efeito: "", tipo: "NEGATIVO", gatilho, ordem: 1, donoId: "d", categoriaId: null }) as unknown as Status;
const CANSADO = status("Cansado", "ESFORCO_ZERO");
const CAIDO = status("Caído");
const cheio = { vidaAtual: 10, manaAtual: 10, esforcoAtual: 5 };

describe("status da ficha", () => {
  it("automático aplicado à mão (carta que cansa) aparece como manual, com turnos", () => {
    const r = statusDaFicha(cheio, [CANSADO, CAIDO], [{ status: CANSADO, turnos: 2 }]);
    expect(r).toEqual([expect.objectContaining({ id: "Cansado", automatico: false, turnos: 2 })]);
  });

  it("se o recurso já ativa o status, ele aparece uma vez só, como automático", () => {
    const r = statusDaFicha({ ...cheio, esforcoAtual: 0 }, [CANSADO, CAIDO], [{ status: CANSADO, turnos: 2 }, { status: CAIDO, turnos: null }]);
    expect(r.map((s) => [s.id, s.automatico])).toEqual([["Caído", false], ["Cansado", true]]);
  });
});
