#!/usr/bin/env node
// Calculadora de balanceamento do One-Take (sem dependências).
// Mesmas regras de teste da API (api/src/regras/teste.ts): maior de N d20 + bônus; atributo 0 = 1 d20 dividido por 2;
// cada ponto de esforço gasto = +1 d20. Progressão: +5 vida/mana/esforço por nível acima do 1.
//
// Uso:
//   node calc.mjs dados "2d8+2"                       média, mínimo, máximo e chance por faixa
//   node calc.mjs teste --pontos 2 --bonus 5 --dt 15 [--esforco 1]
//   node calc.mjs tabela [--bonus 0]                  chances por DT x pontos no atributo
//   node calc.mjs relatorio conteudo.json [--niveis 3] [--pontos 2] [--dt 12]
//     (conteudo.json = saída de `npm run exportar` na pasta api/)

import { readFileSync } from "node:fs";

const LADOS = 20;
const GANHO_POR_NIVEL = 5;

// ---------- Dados ----------

/** "2d8+2" -> { n: 2, faces: 8, mod: 2 } */
export function lerDados(txt) {
  const m = /(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/i.exec(txt);
  if (!m) return null;
  return { n: Number(m[1]), faces: Number(m[2]), mod: m[3] ? (m[3] === "-" ? -1 : 1) * Number(m[4]) : 0 };
}

/** Distribuição exata da soma de n dados de `faces` faces. */
function distribuicao({ n, faces, mod }) {
  let dist = new Map([[0, 1]]);
  for (let i = 0; i < n; i++) {
    const nova = new Map();
    for (const [s, p] of dist) for (let f = 1; f <= faces; f++) nova.set(s + f, (nova.get(s + f) ?? 0) + p / faces);
    dist = nova;
  }
  return new Map([...dist].map(([s, p]) => [s + mod, p]));
}

export const mediaDados = ({ n, faces, mod }) => (n * (faces + 1)) / 2 + mod;

// ---------- Teste (d20) ----------

function dadosDoTeste(pontos, esforco = 0) {
  return pontos <= 0 ? 1 : pontos + esforco;
}

/** Chance do maior de n d20 ser >= alvo. */
function chanceMaior(n, alvo) {
  if (alvo <= 1) return 1;
  if (alvo > LADOS) return 0;
  return 1 - ((alvo - 1) / LADOS) ** n;
}

export function chanceTeste({ pontos, bonus = 0, dt, esforco = 0 }) {
  const n = dadosDoTeste(pontos, esforco);
  const precisa = dt - bonus;
  return pontos > 0 ? chanceMaior(n, precisa) : chanceMaior(n, precisa * 2);
}

export function mediaTeste({ pontos, bonus = 0, esforco = 0 }) {
  const n = dadosDoTeste(pontos, esforco);
  let media = 0;
  for (let v = 1; v <= LADOS; v++) media += ((v / LADOS) ** n - ((v - 1) / LADOS) ** n) * (pontos > 0 ? v : Math.floor(v / 2));
  return media + bonus;
}

// ---------- Cartas ----------

/** Quantas vezes por combate (Infinity = à vontade). "1 vez por sessão" conta como 1 por combate (one-shot). */
function usosPorCombate(limite) {
  if (!limite) return Infinity;
  const m = /(\d+)\s*(uso|usos|vez|vezes)/i.exec(limite);
  if (m) return Number(m[1]);
  if (/uma vez|1x/i.test(limite)) return 1;
  return Infinity;
}

/** Valor médio da carta (dano, cura ou redução), contando ataques múltiplos ("4 ataques ... 1d6"). */
function valorDaCarta(texto) {
  const dados = lerDados(texto ?? "");
  if (!dados) return null;
  const golpes = /(\d+)\s+ataques/i.exec(texto)?.[1];
  const area = /cada inimigo|todos os inimigos|em área|todos os aliados/i.test(texto);
  return { media: mediaDados(dados) * (golpes ? Number(golpes) : 1), golpes: golpes ? Number(golpes) : 1, area, dados };
}

const OFENSIVAS = /luta|pontaria|domínio|dominio|magia/i;

function analisar(ent, { niveis, pontos, dt }) {
  const melhorBonus = Math.max(0, ...ent.pericias.filter((p) => OFENSIVAS.test(p.nome)).map((p) => p.modificador));
  const pontosAtaque = ent.atributos?.length ? Math.max(0, ...ent.atributos.map((a) => a.dados)) : pontos;
  const pAcerto = chanceTeste({ pontos: pontosAtaque, bonus: melhorBonus, dt });
  const linhas = [];
  for (let nivel = 1; nivel <= niveis; nivel++) {
    const cartas = ent.cartas
      .filter((c) => c.nivelNecessario <= nivel)
      .map((c) => {
        const aprim = (c.aprimoramentos ?? []).filter((a) => a.nivel <= nivel).at(-1);
        const efeito = aprim?.efeito ?? c.efeito;
        return { ...c, efeito, custoMana: aprim?.custoMana ?? c.custoMana, limite: aprim?.limite ?? c.limite, valor: valorDaCarta(efeito), usos: usosPorCombate(aprim?.limite ?? c.limite) };
      });
    const dano = cartas.filter((c) => c.tipoEfeito === "DANO" && c.valor);
    const repetivel = Math.max(0, ...dano.filter((c) => c.usos === Infinity && c.custoMana === 0).map((c) => c.valor.media));
    const pico = Math.max(0, ...dano.map((c) => c.valor.media));
    const cura = Math.max(0, ...cartas.filter((c) => c.tipoEfeito === "CURA" && c.valor).map((c) => c.valor.media));
    const defesa = Math.max(0, ...cartas.filter((c) => c.tipoEfeito === "DEFESA" && c.valor).map((c) => c.valor.media));
    linhas.push({
      nivel,
      vida: ent.vida + (nivel - 1) * GANHO_POR_NIVEL,
      mana: ent.mana + (nivel - 1) * GANHO_POR_NIVEL,
      esforco: ent.esforco + (nivel - 1) * GANHO_POR_NIVEL,
      cartas: cartas.length,
      danoRepetivel: repetivel,
      danoPico: pico,
      danoEsperadoTurno: repetivel * pAcerto,
      cura,
      defesa,
      semNumero: cartas.filter((c) => !c.valor).map((c) => c.titulo),
    });
  }
  return { titulo: ent.titulo, tipo: ent.grupo ?? "BICHO", pAcerto, melhorBonus, pontosAtaque, linhas };
}

function relatorio(arquivo, opcoes) {
  const dados = JSON.parse(readFileSync(arquivo, "utf8"));
  const todos = [...(dados.classes ?? []).map((c) => ({ ...c, _tipo: "classe" })), ...(dados.bestas ?? []).map((b) => ({ ...b, _tipo: "criatura" }))];
  const analises = todos.map((e) => ({ ...analisar(e, opcoes), _tipo: e._tipo }));
  const fmt = (n) => (Number.isFinite(n) ? n.toFixed(1) : "-");
  for (let nivel = 1; nivel <= opcoes.niveis; nivel++) {
    const doNivel = analises.map((a) => ({ a, l: a.linhas[nivel - 1] }));
    const vidas = doNivel.filter((x) => x.a._tipo === "classe").map((x) => x.l.vida).sort((p, q) => p - q);
    const vidaMediana = vidas[Math.floor(vidas.length / 2)] ?? 30;
    console.log(`\n=== Nível ${nivel} (DT de referência ${opcoes.dt}; vida mediana das classes: ${vidaMediana}) ===`);
    console.log("titulo | tipo | vida/mana/esf | P(acerto) | dano/turno esperado | pico | cura | defesa | turnos p/ derrubar a vida mediana");
    for (const { a, l } of doNivel) {
      const turnos = l.danoEsperadoTurno > 0 ? vidaMediana / l.danoEsperadoTurno : Infinity;
      const alerta =
        l.danoEsperadoTurno === 0 ? "" : turnos < 2 ? "  << APELATIVO? derruba em menos de 2 turnos" : turnos > 8 && a.tipo === "COMBATENTE" ? "  << fraco para combatente" : "";
      console.log(
        `${a.titulo} | ${a._tipo === "criatura" ? "criatura" : a.tipo} | ${l.vida}/${l.mana}/${l.esforco} | ${(a.pAcerto * 100).toFixed(0)}% (${a.pontosAtaque}d20+${a.melhorBonus}) | ${fmt(l.danoEsperadoTurno)} | ${fmt(l.danoPico)} | ${fmt(l.cura)} | ${fmt(l.defesa)} | ${fmt(turnos)}${alerta}`,
      );
      if (l.semNumero.length) console.log(`   cartas sem dados no efeito (avaliar no texto): ${l.semNumero.join(", ")}`);
    }
  }
}

// ---------- CLI ----------

function arg(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? Number(process.argv[i + 1]) : padrao;
}

const [cmd, alvo] = process.argv.slice(2);
if (cmd === "dados") {
  const d = lerDados(alvo ?? "");
  if (!d) throw new Error('Use algo como "2d8+2"');
  const dist = [...distribuicao(d)].sort((a, b) => a[0] - b[0]);
  console.log(`${alvo}: média ${mediaDados(d).toFixed(2)}, mínimo ${dist[0][0]}, máximo ${dist.at(-1)[0]}`);
  let acumulado = 1;
  for (const [s, p] of dist) {
    console.log(`  >= ${String(s).padStart(3)}: ${(acumulado * 100).toFixed(1)}%`);
    acumulado -= p;
  }
} else if (cmd === "teste") {
  const o = { pontos: arg("pontos", 1), bonus: arg("bonus", 0), dt: arg("dt", 12), esforco: arg("esforco", 0) };
  console.log(`${dadosDoTeste(o.pontos, o.esforco)}d20${o.pontos <= 0 ? " ÷ 2" : ""} + ${o.bonus} contra DT ${o.dt}: ${(chanceTeste(o) * 100).toFixed(1)}% · média ${mediaTeste(o).toFixed(2)}`);
} else if (cmd === "tabela") {
  const bonus = arg("bonus", 0);
  console.log(`DT | 0 pts | 1 | 2 | 3 | 4   (bônus ${bonus})`);
  for (const dt of [5, 8, 10, 12, 15, 18, 20, 25, 30]) {
    console.log(`${dt} | ${[0, 1, 2, 3, 4].map((p) => `${(chanceTeste({ pontos: p, bonus, dt }) * 100).toFixed(0)}%`).join(" | ")}`);
  }
} else if (cmd === "relatorio") {
  relatorio(alvo, { niveis: arg("niveis", 3), pontos: arg("pontos", 2), dt: arg("dt", 12) });
} else {
  console.log("Comandos: dados | teste | tabela | relatorio (veja o topo do arquivo)");
}
