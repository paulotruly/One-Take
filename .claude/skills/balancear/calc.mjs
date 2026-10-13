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
//   node calc.mjs ranking conteudo.json [--niveis 5] [--dt 12] [--turnos 5] [--combates 3] [--alvos 2] [--falha 0.5]
//     ranking de poder por nível (tudo junto: recursos, acerto, esforço, cartas, limites, mana, cura, defesa), duelos e alertas
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
  const area = /cada inimigo|todos os inimigos|inimigos na área|em área|área de \d|todos os aliados/i.test(texto);
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
  return { titulo: ent.titulo, tipo: ent.grupo ?? "CRIATURA", pAcerto, melhorBonus, pontosAtaque, linhas };
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

// ---------- Ranking (tudo junto) ----------
//
// Nota de poder por nível = dano esperado por turno x vida efetiva, comparada com a mediana das classes do mesmo nível (100).
// Modelo (alvos para comparar, não verdade absoluta):
// - Recursos: vida/mana/esforço base + 5 por nível. Mana 0 mata: o plano guarda 1 de mana. Esforço 0 cansa: guarda 1 de esforço.
// - Sessão de --combates combates de --turnos turnos. Limite "por sessão" é dividido entre os combates; mana e esforço também.
// - Acerto: d20 do atributo (classes: --pontos; criaturas: o maior atributo delas) + perícia da carta (ou a melhor ofensiva)
//   + pontos de perícia do nível (classes: +5 por nível acima do 1 na perícia de ataque; criaturas não ganham).
//   O esforço vira dados extras espalhados pelos turnos.
// - Plano de dano: a cada turno, a melhor carta de dano ainda disponível (usos, mana). Área conta --alvos alvos.
//   Dano que depende de o alvo falhar num teste (esquiva, resistência) usa --falha de chance.
//   Carta que só prepara o próximo ataque ("próximo disparo...") vai para a lista de avaliar no texto.
// - Vida efetiva = vida + cura por combate + proteção por combate (defesa; "anula todo o dano" vale o dano médio de um oponente).

const OFENSIVA = /luta|pontaria|dom[ií]nio|magia|ataque/i;
const DEFENSIVA = /reflexo|defesa|esquiva|resist|bloqueio/i;

function usosDaCarta(limite, combates) {
  if (!limite) return Infinity;
  const n = Number(/(\d+)/.exec(limite)?.[1] ?? 1);
  return /sess/i.test(limite) ? n / combates : n;
}

/** Chance com dados extras fracionários (esforço espalhado): interpola entre floor e ceil. */
function chanceComExtra({ pontos, bonus, dt, extra }) {
  if (pontos <= 0) return chanceTeste({ pontos, bonus, dt });
  const k = Math.floor(extra);
  const f = extra - k;
  return (1 - f) * chanceTeste({ pontos, bonus, dt, esforco: k }) + f * chanceTeste({ pontos, bonus, dt, esforco: k + 1 });
}

function modDaPericia(ent, nome) {
  return ent.pericias.find((p) => p.nome.toLowerCase() === String(nome ?? "").toLowerCase())?.modificador;
}

function perfil(ent, nivel, o) {
  const ehClasse = ent._tipo === "classe";
  const vida = ent.vida + (nivel - 1) * GANHO_POR_NIVEL;
  const mana = ent.mana + (nivel - 1) * GANHO_POR_NIVEL;
  const esforco = ent.esforco + (nivel - 1) * GANHO_POR_NIVEL;
  const pontos = ent.atributos?.length ? Math.max(0, ...ent.atributos.map((a) => a.dados)) : o.pontos;
  const bonusNivel = ehClasse ? (nivel - 1) * GANHO_POR_NIVEL : 0;
  const melhorOfensiva = Math.max(0, ...ent.pericias.filter((p) => OFENSIVA.test(p.nome)).map((p) => p.modificador));
  const melhorDefensiva = Math.max(0, ...ent.pericias.filter((p) => DEFENSIVA.test(p.nome)).map((p) => p.modificador));
  const turnosSessao = o.turnos * o.combates;
  const extra = Math.max(0, esforco - 1) / turnosSessao; // dados extras por teste, em média
  const manaCombate = Math.max(0, mana - 1) / o.combates;

  const cartas = ent.cartas
    .filter((c) => c.nivelNecessario <= nivel)
    .map((c) => {
      const ap = (c.aprimoramentos ?? []).filter((a) => a.nivel <= nivel).at(-1);
      const efeito = ap?.efeito ?? c.efeito ?? "";
      const limite = ap?.limite ?? c.limite;
      return { ...c, efeito, custoMana: ap?.custoMana ?? c.custoMana ?? 0, limite, valor: valorDaCarta(efeito), usos: usosDaCarta(limite, o.combates) };
    });

  const avaliarNoTexto = [];
  const semPericia = new Set();
  const opcoesDano = [];
  for (const c of cartas.filter((x) => x.tipoEfeito === "DANO")) {
    if (!c.valor || /^(o|a)?\s*pr[oó]xim[oa]|no pr[oó]ximo (disparo|ataque|golpe)|o pr[oó]ximo (disparo|ataque|golpe)/i.test(c.efeito)) {
      avaliarNoTexto.push(c.titulo);
      continue;
    }
    const bonus = (modDaPericia(ent, c.pericia) ?? melhorOfensiva) + bonusNivel;
    // Dano decidido pelo teste do alvo ("quem falhar sofre 2d6; quem passar, metade"): sem rolagem de ataque.
    const peloAlvo = /quem falhar sofre|se falhar,? sofre|em caso de falha,? sofre/i.test(c.efeito);
    const metadeNoSucesso = /metade do dano/i.test(c.efeito);
    const porTeste = peloAlvo ? o.falha + (metadeNoSucesso ? (1 - o.falha) / 2 : 0) : chanceComExtra({ pontos, bonus, dt: o.dt, extra });
    if (/envenenad|em chamas|sangrament|queimad/i.test(c.efeito)) avaliarNoTexto.push(`${c.titulo} (dano contínuo do status não entra na conta)`);
    if (c.pericia && modDaPericia(ent, c.pericia) === undefined) semPericia.add(c.pericia);
    const esperado = c.valor.media * porTeste * (c.valor.area ? o.alvos : 1);
    if (c.custoMana > mana - 1) avaliarNoTexto.push(`${c.titulo} (custa ${c.custoMana} de mana e só há ${mana})`);
    opcoesDano.push({ titulo: c.titulo, esperado, usos: c.usos, custo: c.custoMana, livre: c.usos === Infinity && c.custoMana === 0, limite: c.limite });
  }
  // Plano de turnos: melhor carta primeiro, respeitando usos e mana (alocação fracionária = valor esperado).
  let turnos = o.turnos;
  let manaResta = manaCombate;
  let dano = 0;
  const usadas = [];
  for (const c of [...opcoesDano].sort((a, b) => b.esperado - a.esperado)) {
    if (turnos <= 0) break;
    const pelaMana = c.custo > 0 ? manaResta / c.custo : Infinity;
    const t = Math.min(turnos, c.usos, pelaMana);
    if (t <= 0) continue;
    dano += t * c.esperado;
    turnos -= t;
    manaResta -= t * c.custo;
    usadas.push(`${c.titulo} x${Number.isInteger(t) ? t : t.toFixed(1)}`);
  }
  for (const c of cartas.filter((x) => !["DANO", "CURA", "DEFESA"].includes(x.tipoEfeito))) avaliarNoTexto.push(c.titulo);

  const cura = cartas
    .filter((c) => c.tipoEfeito === "CURA" && c.valor)
    .reduce((s, c) => s + Math.min(c.usos, o.turnos) * c.valor.media, 0);
  for (const c of cartas.filter((x) => x.tipoEfeito === "CURA" && !x.valor)) avaliarNoTexto.push(c.titulo);

  const defesas = cartas.filter((c) => c.tipoEfeito === "DEFESA").map((c) => {
    const anula = /anula (todo|totalmente|completamente)/i.test(c.efeito);
    const teste = /sucesso|teste/i.test(c.efeito) ? chanceComExtra({ pontos, bonus: melhorDefensiva + bonusNivel, dt: o.dt, extra }) : 1;
    return { titulo: c.titulo, anula, teste, valor: c.valor?.media ?? 0, usos: Math.min(c.usos, o.turnos), livre: c.usos === Infinity && c.custoMana === 0 };
  });

  return { ent, nivel, vida, mana, esforco, pontos, melhorOfensiva, bonusNivel, extra, dano, semPericia: [...semPericia], dpt: dano / o.turnos, pico: Math.max(0, ...opcoesDano.map((c) => c.esperado)), cura, defesas, usadas, avaliarNoTexto, opcoesDano };
}

function cartasDominadas(p) {
  const out = [];
  for (const a of p.opcoesDano) {
    const melhor = p.opcoesDano.find((b) => b !== a && b.esperado > a.esperado * 1.05 && b.custo <= a.custo && b.usos >= a.usos);
    if (melhor) out.push(`${a.titulo} (${a.esperado.toFixed(1)}) é sempre pior que ${melhor.titulo} (${melhor.esperado.toFixed(1)}): mesmo custo ou menos, mesmos usos ou mais`);
  }
  return out;
}

function ranking(arquivo, o) {
  const dados = JSON.parse(readFileSync(arquivo, "utf8"));
  const todos = [...(dados.classes ?? []).map((c) => ({ ...c, _tipo: "classe" })), ...(dados.bestas ?? []).map((b) => ({ ...b, _tipo: "criatura" }))];
  const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : "-");
  const rotulo = (i) => (i >= 150 ? "APELÃO" : i >= 120 ? "forte" : i >= 80 ? "equilibrado" : i >= 60 ? "fraco" : "MUITO FRACO");
  console.log(`Sessão de referência: ${o.combates} combates de ${o.turnos} turnos, DT ${o.dt}, classes com ${o.pontos} pontos no atributo de ataque, área = ${o.alvos} alvos.`);

  for (let nivel = 1; nivel <= o.niveis; nivel++) {
    const ps = todos.map((e) => perfil(e, nivel, o));
    const classes = ps.filter((p) => p.ent._tipo === "classe");
    const mediana = (xs) => {
      const s = [...xs].sort((a, b) => a - b);
      if (!s.length) return 0;
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };
    const danoRef = mediana(classes.map((p) => p.dpt)) || 5;
    for (const p of ps) {
      p.protecao = p.defesas.reduce((s, d) => s + d.usos * d.teste * (d.anula ? danoRef : d.valor), 0);
      p.vidaEfetiva = p.vida + p.cura + p.protecao;
      p.poder = p.dpt * p.vidaEfetiva;
    }
    const poderRef = mediana(classes.map((p) => p.poder)) || 1;
    console.log(`\n=== Nível ${nivel} · dano de referência ${fmt(danoRef)} por turno ===`);
    console.log("posição | nome | tipo | índice | avaliação | dano/turno | pico | vida/mana/esf | vida efetiva (cura + proteção) | acerto | plano");
    ps.sort((a, b) => b.poder - a.poder).forEach((p, i) => {
      const indice = (p.poder / poderRef) * 100;
      const tipo = p.ent._tipo === "criatura" ? "criatura" : p.ent.grupo;
      const acerto = `${p.pontos}d20+${p.melhorOfensiva + p.bonusNivel}${p.extra ? ` (+${fmt(p.extra, 2)} d20 de esforço)` : ""}`;
      console.log(`${i + 1} | ${p.ent.titulo} | ${tipo} | ${fmt(indice, 0)} | ${p.dpt ? rotulo(indice) : "sem dano mensurável"} | ${fmt(p.dpt)} | ${fmt(p.pico)} | ${p.vida}/${p.mana}/${p.esforco} | ${fmt(p.vidaEfetiva, 0)} (${fmt(p.cura, 0)} + ${fmt(p.protecao, 0)}) | ${acerto} | ${p.usadas.join(", ") || "-"}`);
    });
    // Duelos: turnos para derrubar a vida efetiva do outro.
    if (ps.length > 1) {
      console.log("duelos (quem derruba quem primeiro, em turnos):");
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        const ta = a.dpt ? b.vidaEfetiva / a.dpt : Infinity, tb = b.dpt ? a.vidaEfetiva / b.dpt : Infinity;
        const vence = ta === tb ? "empate" : ta < tb ? a.ent.titulo : b.ent.titulo;
        console.log(`  ${a.ent.titulo} x ${b.ent.titulo}: ${fmt(ta)} x ${fmt(tb)} turnos -> ${vence}`);
      }
    }
    for (const p of ps) {
      const avisos = [];
      if (p.dpt && danoRef && classes.length > 1 && p.ent._tipo === "classe" && (p.vida / p.dpt) < 2) avisos.push("derruba a própria vida em menos de 2 turnos (dano alto para a vida do nível)");
      for (const d of p.defesas) if (d.anula && d.livre) avisos.push(`${d.titulo} anula todo o dano sem custo e sem limite`);
      if (p.ent._tipo === "criatura" && p.dpt && classes.length) {
        const vidaMed = mediana(classes.map((c) => c.vidaEfetiva));
        const t = vidaMed / p.dpt;
        if (t < 2) avisos.push(`como criatura, derruba um personagem mediano em ${fmt(t)} turnos (só se for chefe)`);
      }
      if (p.semPericia.length) avisos.push(`cartas testam ${p.semPericia.join(", ")}, mas a ${p.ent._tipo === "classe" ? "classe" : "criatura"} não tem essa perícia (bônus 0)`);
      avisos.push(...cartasDominadas(p));
      if (p.avaliarNoTexto.length) avisos.push(`avaliar no texto: ${[...new Set(p.avaliarNoTexto)].join(", ")}`);
      if (avisos.length) console.log(`  ${p.ent.titulo}: ${avisos.join(" · ")}`);
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
} else if (cmd === "ranking") {
  ranking(alvo, { niveis: arg("niveis", 5), pontos: arg("pontos", 2), dt: arg("dt", 12), turnos: arg("turnos", 5), combates: arg("combates", 3), alvos: arg("alvos", 2), falha: arg("falha", 0.5) });
} else if (cmd === "relatorio") {
  relatorio(alvo, { niveis: arg("niveis", 3), pontos: arg("pontos", 2), dt: arg("dt", 12) });
} else {
  console.log("Comandos: dados | teste | tabela | relatorio | ranking (veja o topo do arquivo)");
}
