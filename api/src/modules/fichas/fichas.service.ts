// Fichas de personagem. O jogador cria a ficha dentro de um grupo usando o código de entrada.
// Quem pode ver/editar: o dono da ficha e o mestre do grupo. Nível: só o mestre.
import type { z } from "zod";
import { AppError, conflito, naoEncontrado, proibido, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { regrasPadraoAtivas } from "../../regras/combate.js";
import { capacidadeInventario, espacosUsados, FICHA, motivoParaNaoUsar } from "../../regras/ficha.js";
import { notacaoDoTeste } from "../../regras/teste.js";
import { apresentarItem, comRequisitos } from "../itens/itens.apresentar.js";
import { aplicarAprimoramentos, atributosNoNivel, habilidadesNoNivel, pontosPericiaGanhos, PROGRESSAO } from "../../regras/progressao.js";
import { comStatus } from "../habilidades/habilidades.include.js";
import { apresentarAtributo } from "../atributos/atributos.service.js";
import { copiasDoCatalogo, somarPericias, testeDaCarta } from "../pericias/soma.js";
import { apresentarClasse, apresentarPericias } from "../classes/classes.service.js";
import { apresentarStatus, statusUsavel } from "../status/status.service.js";
import { estaMorto } from "../../regras/status.js";
import { statusDaFicha } from "./status-da-ficha.js";
import type { criarFichaSchema, editarFichaSchema } from "./fichas.schemas.js";
import { CAMPO_DO_LIMITE, contarPorFuncao, funcaoCheia, mensagemFuncaoCheia } from "../grupos/funcoes.js";
import type { GrupoClasse } from "../../generated/prisma/client.js";
import { origemDoPersonagem, personagensDoJogador } from "./personagem.js";

// ---------- Acesso ----------

export async function fichaAcessivel(id: string, usuarioId: string) {
  const ficha = await getPrisma().ficha.findUnique({ where: { id }, include: { grupo: { select: { mestreId: true } } } });
  if (!ficha) throw naoEncontrado("Ficha não encontrada");
  const souMestre = ficha.grupo.mestreId === usuarioId;
  if (!souMestre && ficha.jogadorId !== usuarioId) throw naoEncontrado("Ficha não encontrada");
  return { ficha, souMestre };
}

async function grupoPorCodigo(codigo: string) {
  const grupo = await getPrisma().grupo.findUnique({ where: { codigo: codigo.trim().toUpperCase() } });
  if (!grupo) throw naoEncontrado("Código de grupo inválido");
  return grupo;
}

// ---------- Convite (prévia do grupo pelo código) ----------

export async function convite(codigo: string, usuarioId: string) {
  const grupo = await grupoPorCodigo(codigo);
  const prisma = getPrisma();
  const g = await prisma.grupo.findUniqueOrThrow({
    where: { id: grupo.id },
    include: {
      mestre: { select: { nickname: true, nome: true, fotoUrl: true } },
      classes: {
        include: {
          classe: {
            include: {
              habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
              pericias: { include: { pericia: { include: { atributo: true } } } },
              conceito: { select: { id: true, titulo: true, descricao: true } },
            },
          },
        },
      },
      racas: { include: { raca: { include: { pericias: { include: { pericia: { include: { atributo: true } } } }, conceito: { select: { id: true, titulo: true } } } } } },
      atributos: { include: { atributo: true } },
      fichas: { select: { jogadorId: true, classeId: true, id: true, classe: { select: { grupo: true } } } },
      regrasProprias: { orderBy: { criadoEm: "asc" }, select: { id: true, titulo: true, texto: true } },
    },
  });
  const classesOcupadas = new Set(g.fichas.map((f) => f.classeId));
  const porFuncao = contarPorFuncao(g.fichas);
  /** Por que a classe não pode ser escolhida (null = pode). */
  const motivoOcupada = (c: { id: string; grupo: GrupoClasse }) =>
    funcaoCheia(g, porFuncao, c.grupo) ? mensagemFuncaoCheia(g, c.grupo)
    : !g.permitirClassesRepetidas && classesOcupadas.has(c.id) ? "Outro jogador já usa esta classe."
    : null;
  const minhaFicha = g.fichas.find((f) => f.jogadorId === usuarioId);
  const classesDoGrupo = new Map(g.classes.map(({ classe }) => [classe.id, classe]));
  const racasDoGrupo = new Set(g.racas.map(({ raca }) => raca.id));
  /** Personagens de outras mesas que o jogador pode trazer (classe e raça precisam estar liberadas aqui). */
  const personagens = (await personagensDoJogador(usuarioId, g.id)).map((p) => {
    const classe = classesDoGrupo.get(p.classeId);
    const motivoBloqueio = !classe ? `A classe ${p.classe} não está liberada nesta mesa.`
      : !racasDoGrupo.has(p.racaId) ? `A raça ${p.raca} não está liberada nesta mesa.`
      : motivoOcupada(classe);
    return { ...p, motivoBloqueio };
  });
  return {
    grupo: {
      id: g.id, titulo: g.titulo, sinopse: g.sinopse, genero: g.genero, imagemUrl: g.imagemUrl,
      mestre: g.mestre, permitirClassesRepetidas: g.permitirClassesRepetidas,
      limiteCombatentes: g.limiteCombatentes, limiteVanguardistas: g.limiteVanguardistas, limiteSuportes: g.limiteSuportes,
    },
    souMestre: g.mestreId === usuarioId,
    minhaFichaId: minhaFicha?.id ?? null,
    vagas: { limite: g.limiteMembros, ocupadas: g.fichas.length },
    pontosAtributo: FICHA.pontosAtributoIniciais,
    personagens,
    regrasDaMesa: { padrao: regrasPadraoAtivas(g.regrasPadraoDesativadas), proprias: g.regrasProprias },
    classes: g.classes
      .map(({ classe: { habilidades, pericias, ...classe } }) => ({
        ...apresentarClasse(classe),
        // Detalhes para o jogador decidir: cartela completa e perícias com modificador.
        habilidades,
        pericias: apresentarPericias(pericias),
        ocupada: motivoOcupada(classe) !== null,
        motivoOcupada: motivoOcupada(classe),
      }))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR")),
    racas: g.racas
      .map(({ raca }) => ({
        id: raca.id, titulo: raca.titulo, descricao: raca.descricao, imagemUrl: raca.imagemUrl, deslocamento: raca.deslocamento,
        conceito: raca.conceito,
        pericias: raca.pericias.map((rp) => ({ nome: rp.pericia.nome, pontos: rp.pontos, atributo: rp.pericia.atributo.nome })),
      }))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR")),
    atributos: g.atributos.map(({ atributo }) => apresentarAtributo(atributo)).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")),
  };
}

// ---------- Criar ----------

export async function criar(usuarioId: string, dados: z.infer<typeof criarFichaSchema>) {
  const prisma = getPrisma();
  const grupo = await grupoPorCodigo(dados.codigo);
  if (grupo.mestreId === usuarioId) throw proibido("O mestre não cria ficha no próprio grupo.");

  const [jaTem, membros, classeOk, racaOk, atributos] = await Promise.all([
    prisma.ficha.findUnique({ where: { grupoId_jogadorId: { grupoId: grupo.id, jogadorId: usuarioId } }, select: { id: true } }),
    prisma.ficha.count({ where: { grupoId: grupo.id } }),
    prisma.classeNoGrupo.findUnique({ where: { grupoId_classeId: { grupoId: grupo.id, classeId: dados.classeId } }, include: { classe: true } }),
    prisma.racaNoGrupo.findUnique({ where: { grupoId_racaId: { grupoId: grupo.id, racaId: dados.racaId } } }),
    prisma.atributoNoGrupo.findMany({ where: { grupoId: grupo.id }, select: { atributoId: true } }),
  ]);
  if (jaTem) throw conflito("JA_TEM_FICHA", "Você já tem uma ficha neste grupo.");
  if (membros >= grupo.limiteMembros) throw conflito("GRUPO_CHEIO", "O grupo já está com todas as vagas ocupadas.");
  if (!classeOk) throw requisicaoInvalida("Essa classe não está disponível neste grupo.", [{ campo: "classeId", mensagem: "Indisponível neste grupo" }]);
  if (!racaOk) throw requisicaoInvalida("Essa raça não está disponível neste grupo.", [{ campo: "racaId", mensagem: "Indisponível neste grupo" }]);
  const funcao = classeOk.classe.grupo;
  const limiteDaFuncao = grupo[CAMPO_DO_LIMITE[funcao]];
  if (limiteDaFuncao != null && (await prisma.ficha.count({ where: { grupoId: grupo.id, classe: { grupo: funcao } } })) >= limiteDaFuncao) {
    throw conflito("FUNCAO_CHEIA", mensagemFuncaoCheia(grupo, funcao));
  }
  if (!grupo.permitirClassesRepetidas) {
    const repetida = await prisma.ficha.findFirst({ where: { grupoId: grupo.id, classeId: dados.classeId }, select: { id: true } });
    if (repetida) throw conflito("CLASSE_REPETIDA", "Outro jogador já usa essa classe e este grupo não permite classes repetidas.");
  }

  // Dados: só atributos do grupo, soma exata dos pontos iniciais.
  const permitidos = new Set(atributos.map((a) => a.atributoId));
  const entradas = Object.entries(dados.dados).filter(([, n]) => n > 0);
  if (entradas.some(([id]) => !permitidos.has(id))) {
    throw requisicaoInvalida("Algum atributo não está disponível neste grupo.", [{ campo: "dados", mensagem: "Atributo fora do grupo" }]);
  }
  const soma = entradas.reduce((t, [, n]) => t + n, 0);
  if (soma !== FICHA.pontosAtributoIniciais) {
    throw requisicaoInvalida(`Distribua exatamente ${FICHA.pontosAtributoIniciais} pontos de atributo (você usou ${soma}).`, [
      { campo: "dados", mensagem: `Use exatamente ${FICHA.pontosAtributoIniciais} pontos` },
    ]);
  }

  const c = classeOk.classe;
  // Personagem de outra mesa: mesmo nível, recursos cheios, sem itens e os pontos de perícia de todos os níveis para gastar aqui.
  const origem = dados.origem ? await origemDoPersonagem(dados.origem, usuarioId, grupo.id, dados) : null;
  const nivel = origem?.nivel ?? PROGRESSAO.nivelInicial;
  const max = atributosNoNivel(c, nivel);
  const criarFicha = prisma.ficha.create({
    data: {
      grupoId: grupo.id, jogadorId: usuarioId, nome: dados.nome, historia: dados.historia, imagemUrl: dados.imagemUrl,
      classeId: c.id, racaId: dados.racaId, nivel, pontosPericiaDisponiveis: pontosPericiaGanhos(nivel),
      vidaAtual: max.pontosVida, manaAtual: max.pontosMana, esforcoAtual: max.pontosEsforco,
      atributos: { create: entradas.map(([atributoId, n]) => ({ atributoId, dados: n })) },
    },
  });
  if (!dados.origem) return detalhar((await criarFicha).id, usuarioId);

  // A origem deixa de ser um personagem vivo: a ficha ativa vira arquivada (os itens ficam vagos na mesa antiga); a arquivada sai.
  let fim;
  if (dados.origem.tipo === "FICHA") {
    const { retratoDaFicha } = await import("./retrato.js");
    const retrato = await retratoDaFicha(dados.origem.id, usuarioId, "LEVADO_PARA_OUTRA_MESA");
    fim = [prisma.fichaArquivada.create({ data: retrato }), prisma.ficha.delete({ where: { id: dados.origem.id } })];
  } else {
    fim = [prisma.fichaArquivada.delete({ where: { id: dados.origem.id } })];
  }
  const [ficha] = await prisma.$transaction([criarFicha, ...fim]);
  return detalhar(ficha.id, usuarioId);
}

// ---------- Listar e detalhar ----------

export async function listarMinhas(usuarioId: string) {
  const fichas = await getPrisma().ficha.findMany({
    where: { jogadorId: usuarioId },
    orderBy: { atualizadoEm: "desc" },
    include: {
      grupo: { select: { id: true, titulo: true, imagemUrl: true, genero: true } },
      classe: { select: { titulo: true } },
      raca: { select: { titulo: true } },
    },
  });
  return fichas.map((f) => ({
    id: f.id, nome: f.nome, imagemUrl: f.imagemUrl, nivel: f.nivel,
    grupo: f.grupo, classe: f.classe.titulo, raca: f.raca.titulo,
  }));
}

/** Ficha completa com tudo calculado pelas regras: máximos, cartas do nível, perícias somadas, inventário. */
export async function detalhar(id: string, usuarioId: string) {
  const { souMestre } = await fichaAcessivel(id, usuarioId);
  const prisma = getPrisma();
  const f = await prisma.ficha.findUniqueOrThrow({
    where: { id },
    include: {
      grupo: {
        include: {
          mestre: { select: { id: true, nickname: true, nome: true } },
          atributos: { include: { atributo: true } },
          pericias: { include: { pericia: { include: { atributo: true } } } },
          fichas: { select: { id: true, nome: true, jogador: { select: { nickname: true } } } },
          status: { include: { status: true } },
          regrasProprias: { orderBy: { criadoEm: "asc" }, select: { id: true, titulo: true, texto: true } },
        },
      },
      status: { include: { status: true } },
      jogador: { select: { nickname: true, nome: true, fotoUrl: true } },
      classe: {
        include: {
          habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
          pericias: { include: { pericia: { include: { atributo: true } } } },
          conceito: { select: { id: true, titulo: true } },
        },
      },
      raca: { include: { pericias: { include: { pericia: { include: { atributo: true } } } } } },
      atributos: { include: { atributo: true } },
      pericias: { include: { pericia: { include: { atributo: true } } } },
      itens: { orderBy: { criadoEm: "asc" }, include: comRequisitos },
    },
  });

  const copiaDe = await copiasDoCatalogo(f.grupo.mestreId);
  const linhas = somarPericias(["raca", "classe", "nivel"] as const, [
    ...f.raca.pericias.map((rp) => ({ pericia: rp.pericia, fonte: "raca" as const, valor: rp.pontos })),
    ...f.classe.pericias.map((cp) => ({ pericia: cp.pericia, fonte: "classe" as const, valor: cp.modificador })),
    ...f.pericias.map((fp) => ({ pericia: fp.pericia, fonte: "nivel" as const, valor: fp.pontos })),
  ], copiaDe);
  const dadosPorAtributo = new Map(f.atributos.map((fa) => [fa.atributoId, fa.dados]));
  // Teste de cada perícia: d20 do atributo dela + total da perícia (regras/teste.ts).
  const pericias = linhas.map((p) => ({ ...p, teste: notacaoDoTeste(dadosPorAtributo.get(p.atributo.id) ?? 0, p.total) }));
  const periciasComPontos = new Set(pericias.filter((p) => p.total > 0).map((p) => p.id));

  // Onde gastar pontos de nível: perícias do grupo + as que a ficha já tem.
  const opcoes = new Map(pericias.map((p) => [p.id, { id: p.id, nome: p.nome, atributo: p.atributo.nome, tem: true }]));
  for (const { pericia } of f.grupo.pericias) {
    if (!opcoes.has(pericia.id)) opcoes.set(pericia.id, { id: pericia.id, nome: pericia.nome, atributo: pericia.atributo.nome, tem: false });
  }

  const dados = new Map(f.atributos.map((fa) => [fa.atributoId, fa.dados]));
  const atributos = [
    ...f.grupo.atributos.map(({ atributo }) => atributo),
    ...f.atributos.map((fa) => fa.atributo).filter((a) => !f.grupo.atributos.some((ga) => ga.atributoId === a.id)),
  ]
    .map((a) => ({ ...apresentarAtributo(a), dados: dados.get(a.id) ?? 0, teste: notacaoDoTeste(dados.get(a.id) ?? 0) }))
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"));

  const max = atributosNoNivel(f.classe, f.nivel);
  const { habilidades, pericias: _cp, ...classe } = f.classe;
  const ativosNoGrupo = f.grupo.status.map((s) => s.status);
  const atuais = {
    vidaAtual: Math.min(f.vidaAtual, max.pontosVida),
    manaAtual: Math.min(f.manaAtual, max.pontosMana),
    esforcoAtual: Math.min(f.esforcoAtual, max.pontosEsforco),
  };
  return {
    id: f.id,
    nome: f.nome,
    historia: f.historia,
    imagemUrl: f.imagemUrl,
    nivel: f.nivel,
    souMestre,
    souDono: f.jogadorId === usuarioId,
    jogador: f.jogador,
    grupo: { id: f.grupo.id, titulo: f.grupo.titulo, mestre: f.grupo.mestre },
    classe: apresentarClasse(classe),
    raca: { id: f.raca.id, titulo: f.raca.titulo, imagemUrl: f.raca.imagemUrl, deslocamento: f.raca.deslocamento },
    vida: { atual: Math.min(f.vidaAtual, max.pontosVida), max: max.pontosVida },
    mana: { atual: Math.min(f.manaAtual, max.pontosMana), max: max.pontosMana },
    esforco: { atual: Math.min(f.esforcoAtual, max.pontosEsforco), max: max.pontosEsforco },
    atributos,
    pericias,
    pontosPericiaDisponiveis: f.pontosPericiaDisponiveis,
    custoPericia: PROGRESSAO.ganhoPorNivel.pontosPericia,
    opcoesPericia: [...opcoes.values()].sort((a, b) => a.atributo.localeCompare(b.atributo, "pt-BR") || a.nome.localeCompare(b.nome, "pt-BR")),
    /** Cartas do nível, já com os aprimoramentos que valem até o nível da ficha. */
    habilidades: habilidadesNoNivel(habilidades, f.nivel).map((h) => ({
      ...aplicarAprimoramentos(h, f.nivel),
      teste: testeDaCarta(h, new Map(linhas.map((l) => [l.id, l.total])), dadosPorAtributo, copiaDe),
    })),
    proximasHabilidades: habilidades.filter((h) => h.nivelNecessario > f.nivel).length,
    inventario: {
      capacidade: capacidadeInventario(f.nivel),
      usados: espacosUsados(f.itens),
      /** Cada item diz se este personagem sabe usar (pré-requisito de classe/perícia). */
      itens: f.itens.map((i) => {
        const motivo = motivoParaNaoUsar(i, { classeId: f.classeId, pericias: periciasComPontos });
        return { ...apresentarItem(i), podeUsar: motivo === null, motivoNaoPodeUsar: motivo };
      }),
    },
    morto: estaMorto(atuais),
    /** Regras que valem nesta mesa: padrão ligadas + próprias do mestre. */
    regrasDaMesa: { padrao: regrasPadraoAtivas(f.grupo.regrasPadraoDesativadas), proprias: f.grupo.regrasProprias },
    /** Status atuais (automáticos + aplicados), só os ativados no grupo. Efeitos são informativos. */
    status: statusDaFicha(atuais, ativosNoGrupo, f.status),
    /** Status que o mestre pode aplicar nesta ficha (ativados no grupo, não automáticos, ainda não aplicados). */
    statusAplicaveis: ativosNoGrupo
      .filter((st) => !st.gatilho && !f.status.some((fs) => fs.statusId === st.id))
      .map(apresentarStatus)
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")),
    outrasFichas: f.grupo.fichas.filter((o) => o.id !== f.id).map((o) => ({ id: o.id, nome: o.nome, jogador: o.jogador.nickname })),
  };
}

// ---------- Alterar ----------

/**
 * Jogador dono ou mestre: nome, história, imagem e vida/mana/esforço atuais (limitados entre 0 e o máximo).
 * O jogador pode diminuir a vida, mas só o mestre aumenta (cura é decisão da mesa).
 */
export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarFichaSchema>) {
  const { ficha, souMestre } = await fichaAcessivel(id, usuarioId);
  const classe = await getPrisma().classe.findUniqueOrThrow({ where: { id: ficha.classeId } });
  const max = atributosNoNivel(classe, ficha.nivel);
  const limitar = (v: number | undefined, m: number) => (v === undefined ? undefined : Math.min(Math.max(v, 0), m));
  const vidaHoje = Math.min(ficha.vidaAtual, max.pontosVida);
  if (!souMestre && dados.vidaAtual !== undefined && limitar(dados.vidaAtual, max.pontosVida)! > vidaHoje) {
    throw new AppError(403, "SO_MESTRE_CURA", "Só o mestre aumenta a vida. Você pode diminuir.");
  }
  await getPrisma().ficha.update({
    where: { id },
    data: {
      ...dados,
      vidaAtual: limitar(dados.vidaAtual, max.pontosVida),
      manaAtual: limitar(dados.manaAtual, max.pontosMana),
      esforcoAtual: limitar(dados.esforcoAtual, max.pontosEsforco),
    },
  });
  return detalhar(id, usuarioId);
}

/** Só o mestre do grupo. +1 nível: máximos e atuais sobem pelo ganho e a ficha recebe pontos de perícia. */
export async function subirNivel(id: string, usuarioId: string) {
  const { ficha, souMestre } = await fichaAcessivel(id, usuarioId);
  if (!souMestre) throw proibido("Só o mestre do grupo sobe o nível.");
  if (ficha.nivel >= PROGRESSAO.nivelMaximo) throw new AppError(409, "NIVEL_MAXIMO", `O nível máximo é ${PROGRESSAO.nivelMaximo}.`);
  const g = PROGRESSAO.ganhoPorNivel;
  await getPrisma().ficha.update({
    where: { id },
    data: {
      nivel: ficha.nivel + 1,
      vidaAtual: { increment: g.pontosVida },
      manaAtual: { increment: g.pontosMana },
      esforcoAtual: { increment: g.pontosEsforco },
      pontosPericiaDisponiveis: { increment: g.pontosPericia },
    },
  });
  return detalhar(id, usuarioId);
}

/** Gasta os pontos de um nível: perícia nova com +5 ou +5 numa que já tem (mesma operação). */
export async function gastarPontosPericia(id: string, usuarioId: string, periciaId: string) {
  const atual = await detalhar(id, usuarioId);
  const custo = PROGRESSAO.ganhoPorNivel.pontosPericia;
  if (atual.pontosPericiaDisponiveis < custo) {
    throw new AppError(409, "SEM_PONTOS", "Não há pontos de perícia para distribuir. Eles vêm ao subir de nível.");
  }
  if (!atual.opcoesPericia.some((o) => o.id === periciaId)) {
    throw requisicaoInvalida("Essa perícia não está disponível para esta ficha.", [{ campo: "periciaId", mensagem: "Indisponível" }]);
  }
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.fichaPericia.upsert({
      where: { fichaId_periciaId: { fichaId: id, periciaId } },
      create: { fichaId: id, periciaId, pontos: custo },
      update: { pontos: { increment: custo } },
    }),
    prisma.ficha.update({ where: { id }, data: { pontosPericiaDisponiveis: { decrement: custo } } }),
  ]);
  return detalhar(id, usuarioId);
}

/**
 * Dono sai do grupo ou mestre remove o membro. Os itens da ficha ficam vagos no grupo, e o jogador fica com uma cópia
 * arquivada do personagem (somente leitura), que só ele pode apagar.
 */
export async function excluir(id: string, usuarioId: string) {
  const { ficha, souMestre } = await fichaAcessivel(id, usuarioId);
  // Import tardio: retrato.ts usa detalhar() deste módulo (evita dependência circular).
  const { retratoDaFicha } = await import("./retrato.js");
  const retrato = await retratoDaFicha(id, ficha.jogadorId, souMestre ? "REMOVIDO_PELO_MESTRE" : "SAIU_DO_GRUPO");
  const prisma = getPrisma();
  await prisma.$transaction([prisma.fichaArquivada.create({ data: retrato }), prisma.ficha.delete({ where: { id } })]);
}

// ---------- Status (só o mestre aplica e remove) ----------

export async function aplicarStatus(id: string, usuarioId: string, statusId: string, turnos: number | null = null) {
  const { ficha, souMestre } = await fichaAcessivel(id, usuarioId);
  if (!souMestre) throw proibido("Só o mestre do grupo aplica status.");
  const status = await statusUsavel(statusId, usuarioId);
  if (status.gatilho) throw requisicaoInvalida("Este status é automático: ele aparece sozinho pelos recursos da ficha.");
  const ativo = await getPrisma().statusNoGrupo.findUnique({ where: { grupoId_statusId: { grupoId: ficha.grupoId, statusId } } });
  if (!ativo) throw requisicaoInvalida("Este status não está ativado no grupo.");
  await getPrisma().fichaStatus.upsert({ where: { fichaId_statusId: { fichaId: id, statusId } }, create: { fichaId: id, statusId, turnos }, update: { turnos } });
  return detalhar(id, usuarioId);
}

export async function removerStatus(id: string, usuarioId: string, statusId: string) {
  const { souMestre } = await fichaAcessivel(id, usuarioId);
  if (!souMestre) throw proibido("Só o mestre do grupo remove status.");
  await getPrisma().fichaStatus.deleteMany({ where: { fichaId: id, statusId } });
  return detalhar(id, usuarioId);
}

/** O mestre muda os turnos que faltam de um status aplicado (tira 1 por turno); 0 tira o status. */
export async function definirTurnosStatus(id: string, usuarioId: string, statusId: string, turnos: number | null) {
  const { souMestre } = await fichaAcessivel(id, usuarioId);
  if (!souMestre) throw proibido("Só o mestre do grupo muda os turnos de um status.");
  const where = { fichaId: id, statusId };
  if (turnos === 0) await getPrisma().fichaStatus.deleteMany({ where });
  else {
    const r = await getPrisma().fichaStatus.updateMany({ where, data: { turnos } });
    if (r.count === 0) throw naoEncontrado("Este status não está aplicado.");
  }
  return detalhar(id, usuarioId);
}
