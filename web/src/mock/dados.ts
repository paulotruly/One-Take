// Dados falsos do modo mock (npm run dev:mock). Nomes e contas são fictícios; nada disso existe no banco.
const atributo = (id: string, nome: string, ordem: number) => ({ id, nome, descricao: `${nome}: atributo de exemplo.`, ordem, kitIds: [] });
export const FIS = atributo("at-fis", "Capacidade física", 0);
export const CAR = atributo("at-car", "Carisma", 1);
export const CON = atributo("at-con", "Conhecimento", 2);
const ATRIBUTOS = [FIS, CAR, CON];

const pericia = (id: string, nome: string, categoria: string, at: typeof FIS) => ({ id, nome, descricao: `${nome}: perícia de exemplo.`, categoria, atributo: at, atributoId: at.id, kitIds: [], origemId: null, usosClasses: 2, usosRacas: 1 });
const PERICIAS = [
  pericia("pe-atl", "Atletismo", "FISICO", FIS),
  pericia("pe-luta", "Luta", "CORPO_A_CORPO", FIS),
  pericia("pe-pont", "Pontaria", "PONTARIA", FIS),
  pericia("pe-ref", "Reflexos", "DEFESA", FIS),
  pericia("pe-res", "Resistência", "DEFESA", FIS),
  pericia("pe-vont", "Vontade", "DEFESA", CAR),
  pericia("pe-pers", "Persuasão", "SOCIAL", CAR),
  pericia("pe-arc", "Arcanismo", "MAGIA", CON),
  pericia("pe-perc", "Percepção", "PERCEPCAO", CON),
];
const pe = (id: string) => PERICIAS.find((p) => p.id === id)!;

const status = (id: string, nome: string, efeito: string, tipo: string, gatilho: string | null = null) => ({ id, nome, efeito, tipo, gatilho, ordem: 0, automatico: !!gatilho, kitIds: [], categoriaId: null, categoria: null });
const STATUS = [
  status("st-env", "Envenenado", "Perde vida no início de cada turno.", "DEBUFF"),
  status("st-ass", "Assustado", "Desvantagem nos testes contra quem causou o medo.", "DEBUFF"),
  status("st-ins", "Inspirado", "Vantagem no próximo teste.", "BUFF"),
  status("st-fur", "Furioso", "Mais dano e menos defesa.", "MISTO"),
  status("st-can", "Cansado", "Esforço em 0: não compra dados.", "DEBUFF", "ESFORCO_ZERO"),
  status("st-mor", "Morto", "Vida ou mana em 0.", "DEBUFF", "VIDA_ZERO"),
];
const st = (id: string, turnos: number | null = null) => ({ ...STATUS.find((s) => s.id === id)!, turnos });
const stResumo = (id: string, turnos: number | null = null) => { const s = st(id, turnos); return { id: s.id, nome: s.nome, tipo: s.tipo, automatico: s.automatico, turnos }; };

let ordemCarta = 0;
const carta = (dono: string, titulo: string, tipoEfeito: string, nivelNecessario: number, custoMana: number, efeito: string, periciaId: string | null = "pe-luta", extra: object = {}) => {
  const p = periciaId ? pe(periciaId) : null;
  return {
    id: `${dono}-${titulo.toLowerCase().replace(/[^a-z]+/g, "-")}`, classeId: dono, titulo, descricao: `${titulo}: uma carta de exemplo.`, condicao: null, tipoEfeito, descricaoEfeito: efeito,
    limiteUsos: null, limitePor: null, nivelNecessario, custoMana, dt: null, alcance: null, statusId: null, periciaId, pericia: p ? { id: p.id, nome: p.nome, atributo: { id: p.atributo.id, nome: p.atributo.nome } } : null,
    periciasDefesa: [], aprimoramentos: [], ordem: ordemCarta++, ...extra,
  };
};

const CONCEITO_BRUXA = { id: "co-bruxa", titulo: "Bruxa", descricao: "Conjuradoras de pactos antigos, cada uma ligada a uma força diferente." };
const CONCEITO_GUERREIRO = { id: "co-guerreiro", titulo: "Guerreiro", descricao: "Mestres das armas, treinados para segurar a linha de frente." };

const classe = (id: string, titulo: string, grupo: string, descricao: string, v: number, m: number, e: number, conceito: { id: string; titulo: string; descricao: string } | null, cartas: (d: string) => ReturnType<typeof carta>[], pericias: [string, number][], extra: object = {}) => ({
  id, titulo, grupo, descricao, imagemUrl: null, pontosVida: v, pontosMana: m, pontosEsforco: e, donoId: "me-mock", origemId: null, kitIds: ["kit-vorgrath"], conceitoId: conceito?.id ?? null, conceito,
  habilidades: cartas(id), pericias: pericias.map(([p, modificador]) => ({ ...pe(p), modificador })), ...extra,
});

const CLASSES = [
  classe("cl-elemental", "Bruxa elemental", "COMBATENTE", "Dobra fogo e gelo para abrir caminho, mas cada feitiço consome a própria mana.", 40, 120, 8, CONCEITO_BRUXA, (d) => [
    carta(d, "Lança de gelo", "DANO", 1, 10, "Causa **2d8** de dano a um alvo a até 6 quadrados.", "pe-arc"),
    carta(d, "Muralha de chamas", "CONTROLE", 1, 15, "Cria uma parede de fogo por **2 turnos**. Quem atravessa sofre 1d6.", "pe-arc"),
    carta(d, "Tempestade", "DANO", 2, 25, "Causa **3d8** em todos a até 2 quadrados do ponto escolhido.", "pe-arc"),
    carta(d, "Pacto elemental", "FORTALECIMENTO", 3, 30, "Por **3 turnos**, suas cartas de dano causam +1d6.", null),
  ], [["pe-arc", 4], ["pe-vont", 2]]),
  classe("cl-assombrosa", "Bruxa assombrosa", "SUPORTE", "Conversa com os mortos e usa o medo para proteger os aliados.", 45, 110, 10, CONCEITO_BRUXA, (d) => [
    carta(d, "Sussurro gelado", "ENFRAQUECIMENTO", 1, 10, "O alvo fica **Assustado** por 2 turnos.", "pe-arc"),
    carta(d, "Bênção dos antigos", "CURA", 1, 15, "Devolve **2d6** de vida a um aliado.", "pe-arc"),
    carta(d, "Espírito guardião", "INVOCACAO", 2, 30, "Invoca um espírito que age no seu turno por 3 turnos.", null),
  ], [["pe-arc", 3], ["pe-pers", 2]]),
  classe("cl-alabardeiro", "Alabardeiro", "VANGUARDISTA", "Mantém os inimigos a distância e protege quem está atrás dele.", 90, 30, 14, CONCEITO_GUERREIRO, (d) => [
    carta(d, "Varredura de alabarda", "DANO", 1, 0, "Causa **2d6+2** em até 3 alvos adjacentes.", "pe-luta", { limiteUsos: 1, limitePor: "COMBATE" }),
    carta(d, "Postura inabalável", "DEFESA", 1, 0, "Até o início do próximo turno, o primeiro dano físico diminui pela metade.", null, { limiteUsos: 3, limitePor: "COMBATE" }),
    carta(d, "Investida de guerra", "MOBILIDADE", 2, 5, "Soma **5 quadrados** ao movimento e ataca ao chegar.", "pe-atl"),
    carta(d, "Interposição", "SUPORTE", 3, 0, "Reação: recebe o golpe no lugar de um aliado adjacente.", null),
  ], [["pe-luta", 4], ["pe-res", 3], ["pe-atl", 2]]),
  classe("cl-paladino", "Paladino", "VANGUARDISTA", "Um escudo para os aliados e uma lâmina para quem ameaça o grupo.", 80, 60, 12, null, (d) => [
    carta(d, "Golpe sagrado", "DANO", 1, 10, "Causa **2d8+2** a um alvo adjacente.", "pe-luta"),
    carta(d, "Imposição de mãos", "CURA", 1, 15, "Devolve **2d6+2** de vida a quem você tocar.", null),
    carta(d, "Aura protetora", "FORTALECIMENTO", 2, 20, "Aliados a até 2 quadrados ganham +2 na defesa por 2 turnos.", null),
  ], [["pe-luta", 3], ["pe-vont", 3]]),
  classe("cl-bardo", "Bardo", "SUPORTE", "Vence batalhas antes de começarem, com palavras e música.", 50, 150, 10, null, (d) => [
    carta(d, "Canção de coragem", "FORTALECIMENTO", 1, 10, "Um aliado fica **Inspirado**.", "pe-pers"),
    carta(d, "Nota dissonante", "DANO", 1, 5, "Causa **1d8** a um alvo a até 6 quadrados.", "pe-pers"),
    carta(d, "Refrão restaurador", "CURA", 2, 20, "Devolve **1d8** de vida a todos os aliados a até 3 quadrados.", null),
  ], [["pe-pers", 5], ["pe-perc", 2]]),
  classe("cl-arqueiro", "Arqueiro das sombras", "COMBATENTE", "Atirador que some nas sombras entre um disparo e outro.", 55, 40, 14, null, (d) => [
    carta(d, "Tiro certeiro", "DANO", 1, 0, "Causa **2d8** a um alvo a até 10 quadrados.", "pe-pont"),
    carta(d, "Passo nas sombras", "MOBILIDADE", 2, 10, "Move 4 quadrados sem provocar ataque de oportunidade.", null),
  ], [["pe-pont", 5]], { kitIds: [] }),
];
const semCartas = ({ habilidades: _h, pericias: _p, ...c }: (typeof CLASSES)[number]) => c;

const raca = (id: string, titulo: string, descricao: string, deslocamento: number, pericias: [string, number][], conceito: { id: string; titulo: string } | null = null) => ({
  id, titulo, descricao, imagemUrl: null, deslocamento, kitIds: [], conceitoId: conceito?.id ?? null, conceito, pericias: pericias.map(([p, pontos]) => ({ ...pe(p), pontos })),
});
const CONCEITO_ELFO = { id: "cr-elfo", titulo: "Elfo", descricao: "Povos antigos ligados às florestas e às sombras." };
const RACAS = [
  raca("ra-humano", "Humano", "Versátil e teimoso, encontrado em todo lugar.", 6, [["pe-pers", 2]]),
  raca("ra-floresta", "Elfo da floresta", "Rápido e atento, nasce entre as árvores.", 7, [["pe-perc", 3]], CONCEITO_ELFO),
  raca("ra-sombrio", "Elfo sombrio", "Vive longe da luz e confia nas próprias sombras.", 6, [["pe-ref", 3]], CONCEITO_ELFO),
  raca("ra-anao", "Anão", "Baixo, resistente e difícil de derrubar.", 5, [["pe-res", 3]]),
];

const CONCEITO_LOBO = { id: "cb-lobo", titulo: "Lobo", descricao: "Caçadores em matilha que cercam as presas." };
const besta = (id: string, titulo: string, descricao: string, v: number, m: number, e: number, desl: number, conceito: { id: string; titulo: string } | null, cartas: number) => ({
  id, titulo, descricao, imagemUrl: null, pontosVida: v, pontosMana: m, pontosEsforco: e, deslocamento: desl, conceitoId: conceito?.id ?? null, conceito, kitIds: ["kit-vorgrath"], cartas,
});
const BESTAS = [
  besta("be-neves", "Lobo das neves", "Ataca em silêncio e some na nevasca.", 30, 10, 6, 8, CONCEITO_LOBO, 2),
  besta("be-alfa", "Lobo alfa", "Maior e mais esperto, comanda a matilha.", 60, 20, 8, 8, CONCEITO_LOBO, 2),
  besta("be-carnical", "Carniçal da cripta", "Devora o que encontra pelos túneis de Vorgrath.", 45, 5, 4, 5, null, 2),
];
const cartasDaBesta = (id: string) => [
  carta(id, "Mordida", "DANO", 1, 0, "Causa **1d8+2** a um alvo adjacente.", "pe-luta"),
  carta(id, "Investida feroz", "MOBILIDADE", 2, 5, "Corre 4 quadrados e derruba o alvo.", "pe-atl"),
].map((c) => ({ ...c, classeId: null, bestaId: id }));
const bestaDetalhe = (b: (typeof BESTAS)[number]) => ({
  ...b, habilidades: cartasDaBesta(b.id),
  pericias: [{ ...pe("pe-luta"), modificador: 3, teste: "2d20 + 3" }, { ...pe("pe-atl"), modificador: 2, teste: "2d20 + 2" }],
  atributos: ATRIBUTOS.map((a, i) => ({ ...a, dados: i === 0 ? 2 : 0, teste: i === 0 ? "2d20" : "1d20 ÷ 2" })),
});

const categoriaPocao = { id: "ci-pocao", nome: "Poções", icone: "pocao" };
const categoriaArma = { id: "ci-arma", nome: "Armas", icone: "espada" };
const item = (id: string, nome: string, descricao: string, categoria: typeof categoriaPocao | null, espacos: number, usosMaximos: number | null, usosRestantes: number | null, efeito: string | null = null) => ({
  id, nome, descricao, imagemUrl: null, efeito, espacos, usosMaximos, usosRestantes, requisito: null, requisitoPericia: null, requisitoClasse: null, categoria, fichaId: null,
});
const POCAO = item("it-pocao", "Poção de cura", "Um frasco vermelho que cheira a menta.", categoriaPocao, 1, 2, 1, "Devolve 2d6 de vida.");
const ALABARDA = item("it-alabarda", "Alabarda de ferro negro", "Pesada e cheia de marcas de batalha.", categoriaArma, 3, null, null, "+1 de dano em ataques corpo a corpo.");
const CHAVE = item("it-chave", "Chave da cripta", "Fria ao toque, com runas gastas.", null, 1, null, null);
const MAPA = item("it-mapa", "Mapa dos túneis", "Mostra uma passagem que não existe mais.", null, 1, null, null);
const noInventario = <T extends object>(i: T, podeUsar = true) => ({ ...i, podeUsar, motivoNaoPodeUsar: podeUsar ? null : "Exige outra classe." });
const noCatalogo = <T extends object>(i: T) => ({ ...i, kitIds: ["kit-vorgrath"] });

const REGRAS_PROPRIAS = [{ id: "rm-1", titulo: "Noite sem lua", texto: "Enquanto estiverem nos túneis, testes de Percepção têm desvantagem sem uma tocha." }];
export const REGRAS_PADRAO = [
  { slug: "combate-grid-turno", titulo: "Grid, iniciativa e turno", resumo: "Grid físico na mesa. Cada turno é 1 movimento + 1 ação.", texto: ["Texto de exemplo do modo mock. O texto real vem da API."] },
  { slug: "combate-oportunidade", titulo: "Ataque de oportunidade", resumo: "Sair do alcance de um inimigo permite um ataque com a reação dele.", texto: ["Texto de exemplo do modo mock. O texto real vem da API."] },
];

// ---------- Fichas dos jogadores ----------
type Jogador = { nome: string; apelido: string; classe: string; raca: string; nivel: number; vida: number; mana: number; esforco: number; status: string[]; dados: [number, number, number]; historia: string };
const JOGADORES: Record<string, Jogador> = {
  "fi-aria": { nome: "Aria Vento-Frio", apelido: "luna_veiga", classe: "cl-elemental", raca: "ra-floresta", nivel: 2, vida: 28, mana: 75, esforco: 9, status: ["st-ins"], dados: [1, 0, 2], historia: "Saiu do convento das neves para descobrir quem envenenou a mestra dela." },
  "fi-bram": { nome: "Bram Punho-de-Ferro", apelido: "tiago_rocha", classe: "cl-alabardeiro", raca: "ra-anao", nivel: 2, vida: 62, mana: 22, esforco: 3, status: ["st-env"], dados: [2, 0, 1], historia: "Veterano da Guerra das Pontes. Jura que esta é a última missão." },
  "fi-mirela": { nome: "Mirela das Cinzas", apelido: "cami_duarte", classe: "cl-assombrosa", raca: "ra-sombrio", nivel: 2, vida: 18, mana: 40, esforco: 0, status: ["st-ass"], dados: [0, 1, 2], historia: "Ouve vozes desde que voltou da cripta, e algumas dizem a verdade." },
  "fi-teo": { nome: "Teo Sete-Cordas", apelido: "rafa_lima", classe: "cl-bardo", raca: "ra-humano", nivel: 1, vida: 50, mana: 130, esforco: 10, status: [], dados: [0, 2, 1], historia: "Promete uma canção sobre o grupo, e cobra adiantado." },
  "fi-kael": { nome: "Kael Sem-Nome", apelido: "duda_nunes", classe: "cl-paladino", raca: "ra-humano", nivel: 2, vida: 0, mana: 30, esforco: 5, status: ["st-mor"], dados: [2, 1, 0], historia: "Caiu segurando a ponte para os outros passarem." },
  "fi-lyra": { nome: "Lyra Passo-Leve", apelido: "paulo", classe: "cl-arqueiro", raca: "ra-floresta", nivel: 1, vida: 44, mana: 35, esforco: 12, status: [], dados: [2, 0, 1], historia: "Sua personagem de exemplo, jogando na mesa de outra pessoa." },
};
const ganho = { pontosVida: 5, pontosMana: 5, pontosEsforco: 5, pontosPericia: 5 };
const maximos = (cl: (typeof CLASSES)[number], n: number) => ({ vida: cl.pontosVida + (n - 1) * ganho.pontosVida, mana: cl.pontosMana + (n - 1) * ganho.pontosMana, esforco: cl.pontosEsforco + (n - 1) * ganho.pontosEsforco });
const nota = (dados: number, bonus: number) => `${dados > 0 ? `${dados}d20` : "1d20 ÷ 2"}${bonus ? ` + ${bonus}` : ""}`;

export function membro(id: string) {
  const j = JOGADORES[id]!;
  const cl = CLASSES.find((c) => c.id === j.classe)!;
  const m = maximos(cl, j.nivel);
  return {
    fichaId: id, nome: j.nome, imagemUrl: null, nivel: j.nivel, jogador: { nickname: j.apelido, nome: null, fotoUrl: null }, classe: cl.titulo, funcao: cl.grupo,
    raca: RACAS.find((r) => r.id === j.raca)!.titulo, morto: j.vida <= 0 || j.mana <= 0,
    vida: { atual: j.vida, max: m.vida }, mana: { atual: j.mana, max: m.mana }, esforco: { atual: j.esforco, max: m.esforco },
    status: j.status.map((s) => stResumo(s, s === "st-env" ? 2 : null)),
  };
}

export function fichaDetalhe(id: string) {
  const j = JOGADORES[id];
  if (!j) return null;
  const cl = CLASSES.find((c) => c.id === j.classe)!;
  const m = membro(id);
  const minha = id === "fi-lyra";
  const dadosDe = (atId: string) => j.dados[ATRIBUTOS.findIndex((a) => a.id === atId)] ?? 0;
  const pericias = cl.pericias.map((p) => {
    const total = p.modificador + (j.nivel - 1);
    return { id: p.id, nome: p.nome, descricao: p.descricao, categoria: p.categoria, atributo: p.atributo, raca: 0, classe: p.modificador, nivel: j.nivel - 1, total, teste: nota(dadosDe(p.atributo.id), total) };
  });
  const habilidades = cl.habilidades.filter((h) => h.nivelNecessario <= j.nivel).map((h) => {
    const per = pericias.find((p) => p.id === h.periciaId);
    return { ...h, teste: h.pericia ? { pericia: h.pericia.nome, atributo: h.pericia.atributo.nome, teste: per?.teste ?? nota(dadosDe(h.pericia.atributo.id), 0) } : null };
  });
  const itens = id === "fi-bram" ? [noInventario(ALABARDA), noInventario(POCAO)] : id === "fi-aria" ? [noInventario(POCAO), noInventario(MAPA, false)] : [noInventario(POCAO)];
  return {
    id, nome: j.nome, historia: j.historia, imagemUrl: null, nivel: j.nivel, souMestre: !minha, souDono: minha, jogador: m.jogador,
    grupo: minha ? { id: "gr-outro", titulo: "Mesa da Ana: A Cidade Afogada", mestre: { id: "outro", nickname: "ana_mestra", nome: "Ana" } } : { id: "gr-vorgrath", titulo: GRUPO_VORGRATH.titulo, mestre: { id: "me-mock", nickname: "paulo", nome: "Paulo" } },
    classe: semCartas(cl), raca: { id: j.raca, titulo: m.raca, imagemUrl: null, deslocamento: RACAS.find((r) => r.id === j.raca)!.deslocamento },
    vida: m.vida, mana: m.mana, esforco: m.esforco, atributos: ATRIBUTOS.map((a) => ({ ...a, dados: dadosDe(a.id), teste: nota(dadosDe(a.id), 0) })),
    pericias, pontosPericiaDisponiveis: id === "fi-bram" ? 5 : 0, custoPericia: 5,
    opcoesPericia: PERICIAS.map((p) => ({ id: p.id, nome: p.nome, atributo: p.atributo.nome, tem: pericias.some((x) => x.id === p.id) })),
    habilidades, proximasHabilidades: cl.habilidades.length - habilidades.length,
    inventario: { capacidade: 5 + (j.nivel - 1) * 2, usados: itens.reduce((t, i) => t + i.espacos, 0), itens },
    outrasFichas: minha ? [] : ["fi-aria", "fi-bram", "fi-mirela", "fi-teo", "fi-kael"].filter((o) => o !== id).map((o) => ({ id: o, nome: JOGADORES[o]!.nome, jogador: JOGADORES[o]!.apelido })),
    morto: m.morto, status: j.status.map((s) => st(s, s === "st-env" ? 2 : null)), statusAplicaveis: STATUS.filter((s) => !j.status.includes(s.id)),
    regrasDaMesa: { padrao: REGRAS_PADRAO, proprias: REGRAS_PROPRIAS },
  };
}

// ---------- Grupos ----------
const baseGrupo = { imagemUrl: null, permitirClassesRepetidas: false, limiteCombatentes: null, limiteVanguardistas: 2, limiteSuportes: null, regrasPadraoDesativadas: [] as string[], regrasProprias: REGRAS_PROPRIAS };
const criatura = (id: string, b: (typeof BESTAS)[number], nome: string, nivel: number, vida: number, status: ReturnType<typeof stResumo>[]) => ({
  id, bestaId: b.id, nome, nivel, besta: { titulo: b.titulo, imagemUrl: null, deslocamento: b.deslocamento }, vida: { atual: vida, max: b.pontosVida }, mana: { atual: b.pontosMana, max: b.pontosMana }, esforco: { atual: b.pontosEsforco, max: b.pontosEsforco }, status,
});
const CRIATURAS = [criatura("cr-1", BESTAS[1]!, "Alfa de Vorgrath", 2, 41, [stResumo("st-fur", 2)]), criatura("cr-2", BESTAS[0]!, "Lobo das neves 1", 1, 12, [])];
const GRUPO_VORGRATH = {
  ...baseGrupo, id: "gr-vorgrath", titulo: "A Noite de Vorgrath", sinopse: "A cidade fechou os portões ao anoitecer, e os mortos da cripta voltaram a andar. O grupo tem até o amanhecer.", genero: "Fantasia sombria",
  limiteMembros: 6, codigo: "VRG7K2", kitId: "kit-vorgrath", kit: { id: "kit-vorgrath", nome: "Vorgrath" },
  disponiveis: { classeIds: CLASSES.map((c) => c.id), racaIds: RACAS.map((r) => r.id), atributoIds: ATRIBUTOS.map((a) => a.id), periciaIds: PERICIAS.map((p) => p.id), statusIds: STATUS.map((s) => s.id) },
  membros: ["fi-aria", "fi-bram", "fi-mirela", "fi-teo", "fi-kael"].map(membro), statusAtivos: STATUS, itensVagos: [CHAVE, MAPA], criaturas: CRIATURAS,
};
const GRUPO_VAZIO = {
  ...baseGrupo, id: "gr-novo", titulo: "O Último Trem", sinopse: "Grupo novo, ainda em preparação: serve para ver o checklist do que falta.", genero: "Terror", limiteMembros: 4, codigo: "TRM4Q9", kitId: null, kit: null, regrasProprias: [],
  disponiveis: { classeIds: [], racaIds: [], atributoIds: [], periciaIds: [], statusIds: [] }, membros: [], statusAtivos: [], itensVagos: [], criaturas: [],
};
const GRUPO_PEQUENO = {
  ...baseGrupo, id: "gr-feira", titulo: "A Feira de Prata", sinopse: "Um roubo simples durante a maior feira do reino. Nada pode dar errado.", genero: "Aventura", limiteMembros: 3, codigo: "FRP2X5", kitId: null, kit: null, permitirClassesRepetidas: true, limiteVanguardistas: null,
  disponiveis: { classeIds: ["cl-bardo", "cl-paladino"], racaIds: ["ra-humano"], atributoIds: ATRIBUTOS.map((a) => a.id), periciaIds: [], statusIds: [] }, membros: ["fi-teo", "fi-bram"].map(membro), statusAtivos: [], itensVagos: [], criaturas: [],
};
const GRUPOS = [GRUPO_VORGRATH, GRUPO_PEQUENO, GRUPO_VAZIO];
const resumoGrupo = ({ membros, disponiveis: _d, statusAtivos: _s, itensVagos: _i, criaturas: _c, kit: _k, regrasProprias: _r, ...g }: (typeof GRUPOS)[number]) => ({
  ...g, membros: membros.length,
  composicao: membros.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.funcao]: (acc[m.funcao] ?? 0) + 1 }), {}),
});

const npc = (id: string, nome: string, descricao: string, racaId: string, classeId: string | null, nivel: number) => {
  const r = RACAS.find((x) => x.id === racaId)!;
  const cl = CLASSES.find((x) => x.id === classeId);
  const m = cl ? maximos(cl, nivel) : { vida: 30, mana: 20, esforco: 6 };
  return {
    id, nome, descricao, imagemUrl: null, nivel, racaId, classeId, vidaBase: null, manaBase: null, esforcoBase: null, kitIds: ["kit-vorgrath"], raca: { id: r.id, titulo: r.titulo, deslocamento: r.deslocamento },
    classe: cl ? { id: cl.id, titulo: cl.titulo, grupo: cl.grupo } : null, vida: { atual: m.vida, max: m.vida }, mana: { atual: m.mana, max: m.mana }, esforco: { atual: m.esforco, max: m.esforco }, morto: false,
    status: [], statusAplicaveis: STATUS, atributos: ATRIBUTOS.map((a, i) => ({ ...a, dados: i === 1 ? 2 : 1, teste: i === 1 ? "2d20" : "1d20" })),
    pericias: [{ id: "pe-pers", nome: "Persuasão", descricao: "Exemplo.", categoria: "SOCIAL", atributo: CAR, raca: 2, classe: 0, extra: 1, total: 3, teste: "2d20 + 3" }],
    habilidades: cl ? cl.habilidades.filter((h) => h.nivelNecessario <= nivel) : [], proximasHabilidades: 0, inventario: { capacidade: 5, usados: 1, itens: [CHAVE] },
    destinos: { grupos: [{ id: GRUPO_VORGRATH.id, titulo: GRUPO_VORGRATH.titulo }], fichas: [{ id: "fi-aria", nome: "Aria Vento-Frio", jogador: "luna_veiga", grupo: GRUPO_VORGRATH.titulo }] },
  };
};
const NPCS = [npc("np-otta", "Otta, a coveira", "Sabe onde cada corpo foi enterrado, e quem pagou por isso.", "ra-anao", null, 2), npc("np-corvin", "Padre Corvin", "Prega contra os mortos, mas esconde um segredo na cripta.", "ra-humano", "cl-paladino", 3)];
const resumoNpc = ({ racaId: _r, classeId: _c, raca, classe: cl, status: _s, statusAplicaveis: _a, atributos: _b, pericias: _p, habilidades: _h, proximasHabilidades: _x, inventario: _i, destinos: _d, ...n }: (typeof NPCS)[number]) => ({ ...n, raca: raca.titulo, classe: cl?.titulo ?? null });

const KIT_DENTRO = {
  classes: CLASSES.filter((c) => c.id !== "cl-arqueiro").map((c) => ({ id: c.id, nome: c.titulo })), racas: [], atributos: [], pericias: [{ id: "pe-arc", nome: "Arcanismo", atributo: "Conhecimento" }], status: [{ id: "st-env", nome: "Envenenado", tipo: "DEBUFF" }],
  itens: [{ id: "it-pocao", nome: "Poção de cura" }], bestas: BESTAS.map((b) => ({ id: b.id, nome: b.titulo })), npcs: NPCS.map((n) => ({ id: n.id, nome: n.nome })), grupos: [{ id: GRUPO_VORGRATH.id, nome: GRUPO_VORGRATH.titulo }],
};
const KIT = { id: "kit-vorgrath", nome: "Vorgrath", descricao: "Tudo o que a noite em Vorgrath precisa.", conteudo: { classes: 5, racas: 0, atributos: 0, pericias: 1, status: 1, itens: 1, bestas: 3, npcs: 2, grupos: 1 } };

// Mesmas contas de api/src/regras/teste.ts, só para o mock responder sem a API.
export function chance(pontos: number, bonus: number, dt: number, esforco: number) {
  const n = pontos > 0 ? pontos + esforco : 1;
  const alvo = pontos > 0 ? dt - bonus : (dt - bonus) * 2;
  const p = alvo <= 1 ? 1 : alvo > 20 ? 0 : 1 - ((alvo - 1) / 20) ** n;
  let media = bonus;
  for (let v = 1; v <= 20; v++) media += ((v / 20) ** n - ((v - 1) / 20) ** n) * (pontos > 0 ? v : Math.floor(v / 2));
  return { chance: p, media, notacao: nota(pontos > 0 ? n : 0, bonus) };
}

export const REGRAS = {
  progressao: { nivelInicial: 1, nivelMaximo: 100, ganhoPorNivel: ganho },
  ficha: { pontosAtributoIniciais: 3, inventarioInicial: 5, inventarioPorNivel: 2 },
  teste: {
    ladosDoDado: 20, dadosComAtributoZero: 1, divisorComAtributoZero: 2, esforcoPorDadoExtra: 1, esforcoComAtributoZero: false, esforcoMaximoPorRodada: 1, dadosPorVantagem: 1,
    chances: [5, 8, 10, 12, 15, 18, 20, 25].map((dt) => ({ dt, chances: [0, 1, 2, 3, 4].map((pontos) => ({ pontos, chance: chance(pontos, 0, dt, 0).chance })) })),
  },
  atributosBase: ATRIBUTOS.map(({ nome, descricao }) => ({ nome, descricao })), statusBase: STATUS.map(({ nome, efeito, tipo, gatilho }) => ({ nome, efeito, tipo, gatilho })),
  conta: { idadeMinima: 12 }, defesas: [], regrasPadrao: REGRAS_PADRAO,
};

function progressao(habilidades: { id: string; nivelNecessario: number }[], base: { pontosVida: number; pontosMana: number; pontosEsforco: number }) {
  const niveis = [1, 2, 3, 4, 5].map((nivel) => ({
    nivel, pontosVida: base.pontosVida + (nivel - 1) * ganho.pontosVida, pontosMana: base.pontosMana + (nivel - 1) * ganho.pontosMana, pontosEsforco: base.pontosEsforco + (nivel - 1) * ganho.pontosEsforco, pontosPericia: (nivel - 1) * ganho.pontosPericia,
    habilidades: habilidades.filter((h) => h.nivelNecessario <= nivel).map((h) => h.id), novasHabilidades: habilidades.filter((h) => h.nivelNecessario === nivel).map((h) => h.id), aprimoradas: [] as string[],
  }));
  return { ganhoPorNivel: ganho, niveis };
}

export const ME = { id: "me-mock", nickname: "paulo", papel: "MESTRE", nome: "Paulo", fotoUrl: null, codigoRecuperacaoEm: "2026-10-20T12:00:00Z", dataNascimento: "1995-05-10" };

/** Respostas de leitura. Devolve undefined para o que o mock não conhece. */
export function responder(caminho: string, q: URLSearchParams): unknown {
  const r = (padrao: RegExp) => caminho.match(padrao);
  let m: RegExpMatchArray | null;

  if (caminho === "/api/me") return ME;
  if (caminho === "/api/regras") return REGRAS;
  if (caminho === "/api/regras/chance") return chance(Number(q.get("pontos")), Number(q.get("bonus") ?? 0), Number(q.get("dt")), Number(q.get("esforco") ?? 0));

  if (caminho === "/api/grupos") return GRUPOS.map(resumoGrupo);
  if ((m = r(/^\/api\/grupos\/([^/]+)$/))) return GRUPOS.find((g) => g.id === m![1]);

  if (caminho === "/api/fichas") return ["fi-lyra"].map((id) => { const f = fichaDetalhe(id)!; return { id, nome: f.nome, imagemUrl: null, nivel: f.nivel, grupo: { id: f.grupo.id, titulo: f.grupo.titulo, imagemUrl: null, genero: "Fantasia" }, classe: f.classe.titulo, raca: f.raca.titulo }; });
  if ((m = r(/^\/api\/fichas\/([^/]+)$/))) return fichaDetalhe(m[1]!);
  if (caminho === "/api/fichas-arquivadas") return [];

  if (caminho === "/api/classes") return CLASSES.filter((c) => !q.get("grupo") || c.grupo === q.get("grupo")).map(semCartas);
  if ((m = r(/^\/api\/classes\/([^/]+)\/progressao$/))) { const c = CLASSES.find((x) => x.id === m![1]); return c && progressao(c.habilidades, c); }
  if ((m = r(/^\/api\/classes\/([^/]+)$/))) return CLASSES.find((c) => c.id === m![1]);
  if (caminho === "/api/conceitos") return [CONCEITO_BRUXA, CONCEITO_GUERREIRO, { id: "co-vazio", titulo: "Necromante", descricao: "Arquétipo ainda sem subclasse, para ver o estado vazio." }].map((c) => ({ ...c, subclasses: CLASSES.filter((x) => x.conceitoId === c.id).map(semCartas) }));

  if (caminho === "/api/racas") return RACAS;
  if ((m = r(/^\/api\/racas\/([^/]+)$/))) return RACAS.find((x) => x.id === m![1]);
  if (caminho === "/api/conceitos-raca") return [{ ...CONCEITO_ELFO, subracas: RACAS.filter((x) => x.conceitoId === CONCEITO_ELFO.id) }];

  if (caminho === "/api/bestas") return BESTAS;
  if ((m = r(/^\/api\/bestas\/([^/]+)\/progressao$/))) { const b = BESTAS.find((x) => x.id === m![1]); return b && progressao(cartasDaBesta(b.id), b); }
  if ((m = r(/^\/api\/bestas\/([^/]+)$/))) { const b = BESTAS.find((x) => x.id === m![1]); return b && bestaDetalhe(b); }
  if (caminho === "/api/conceitos-besta") return [{ ...CONCEITO_LOBO, formas: BESTAS.filter((b) => b.conceitoId === CONCEITO_LOBO.id) }];
  if ((m = r(/^\/api\/criaturas\/([^/]+)$/))) {
    const c = CRIATURAS.find((x) => x.id === m![1]);
    if (!c) return undefined;
    const d = bestaDetalhe(BESTAS.find((b) => b.id === c.bestaId)!);
    return { ...c, grupoId: GRUPO_VORGRATH.id, descricao: d.descricao, atributos: d.atributos, pericias: d.pericias, habilidades: d.habilidades, proximasHabilidades: 0, statusDetalhado: c.status.map((s) => st(s.id, s.turnos)), statusAplicaveis: STATUS };
  }

  if (caminho === "/api/npcs") return NPCS.map(resumoNpc);
  if ((m = r(/^\/api\/npcs\/([^/]+)$/))) return NPCS.find((n) => n.id === m![1]);
  if (caminho === "/api/catalogo-itens") return [POCAO, ALABARDA, CHAVE, MAPA].map(noCatalogo);
  if (caminho === "/api/categorias-item") return [categoriaPocao, categoriaArma].map((c) => ({ ...c, descricao: `${c.nome} de exemplo.`, ordem: 0, usos: 1 }));
  if (caminho === "/api/kits") return [KIT];
  if (caminho === `/api/kits/${KIT.id}`) return {
    ...KIT,
    dentro: {
      classes: CLASSES.filter((c) => c.kitIds.includes(KIT.id)).map((c) => ({ id: c.id, nome: c.titulo })),
      racas: [], atributos: [], pericias: [], status: [], itens: [], bestas: [], npcs: [],
      grupos: GRUPOS.filter((g) => g.kitId === KIT.id).map((g) => ({ id: g.id, nome: g.titulo })),
    },
  };
  if ((m = r(/^\/api\/kits\/([^/]+)$/))) return m[1] === KIT.id ? { ...KIT, dentro: KIT_DENTRO } : undefined;
  if (caminho === "/api/pericias") return PERICIAS;
  if (caminho === "/api/atributos") return ATRIBUTOS.map((a) => ({ ...a, pericias: PERICIAS.filter((p) => p.atributoId === a.id).length }));
  if (caminho === "/api/status") return STATUS;
  if (caminho === "/api/status-categorias") return [];
  return undefined;
}
