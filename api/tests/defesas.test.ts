import { describe, expect, it } from "vitest";
import { PERICIAS_BASE } from "../prisma/pericias-base.js";
import { BASE, DEFESAS, defesasContra } from "../src/regras/defesas.js";

describe("defesa do alvo", () => {
  it("os ids batem com as perícias base do seed", () => {
    for (const [nome, id] of Object.entries(BASE)) expect(PERICIAS_BASE.find((p) => p.id === id)?.nome).toBe(nome);
  });

  it("cada perícia de ataque traz as defesas da tabela", () => {
    expect(defesasContra(BASE.Luta).map((d) => d.defesa.nome)).toEqual(["Reflexos", "Resistência"]);
    expect(defesasContra(BASE.Domínio).map((d) => d.defesa.nome)).toEqual(["Reflexos", "Resistência", "Vontade"]);
    expect(defesasContra(BASE.Reflexos)).toEqual([]);
    expect(DEFESAS).toHaveLength(8);
  });
});
