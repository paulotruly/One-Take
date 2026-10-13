// Conta: cadastro (nickname, data de nascimento e senha), código de recuperação, exclusão e exportação. Sem e-mail.
// O Supabase Auth guarda o login com um e-mail interno do nickname (<nickname>@one-take.local), que ninguém vê.
import type { z } from "zod";
import { codigoConfere, novoCodigo } from "../../lib/codigo-recuperacao.js";
import { AppError, requisicaoInvalida } from "../../lib/errors.js";
import { emailInterno, normalizarNickname } from "../../lib/nickname.js";
import { getPrisma } from "../../lib/prisma.js";
import { conferirSenha, criarUsuario, definirSenha, excluirUsuario, pedirSessao } from "../../lib/supabase-auth.js";
import { retratos } from "../fichas/retrato.js";
import type { cadastroSchema } from "./conta.schemas.js";

const MINUTO = 60_000;

/** O que a própria pessoa vê da conta. */
export const camposDaConta = {
  id: true, nickname: true, papel: true, nome: true, fotoUrl: true, dataNascimento: true, codigoRecuperacaoEm: true,
} as const;

export function apresentarConta(p: { dataNascimento?: Date | null; codigoRecuperacaoEm?: Date | null } & Record<string, unknown>) {
  const { dataNascimento, codigoRecuperacaoEm, ...resto } = p;
  return {
    ...resto,
    /** "AAAA-MM-DD" ou null (contas antigas). */
    dataNascimento: dataNascimento ? dataNascimento.toISOString().slice(0, 10) : null,
    /** Quando o código de recuperação atual foi gerado (null = a conta ainda não tem). */
    codigoRecuperacaoEm: codigoRecuperacaoEm ?? null,
  };
}

// ---------- Cadastro ----------

/** Cria a conta e devolve a sessão e o código de recuperação (mostrado uma única vez). */
export async function cadastrar(dados: z.infer<typeof cadastroSchema>) {
  const prisma = getPrisma();
  if (await prisma.perfil.findUnique({ where: { nickname: dados.nickname }, select: { id: true } })) {
    throw new AppError(409, "NICKNAME_EM_USO", `@${dados.nickname} já está em uso.`, [{ campo: "nickname", mensagem: "Já está em uso" }]);
  }
  const emailLogin = emailInterno(dados.nickname);
  const id = await criarUsuario({ email: emailLogin, senha: dados.senha, metadata: { papel: dados.papel, nickname: dados.nickname, nome: dados.nome ?? null } });
  const { codigo, hash } = novoCodigo();
  try {
    await prisma.perfil.create({
      data: {
        id, email: emailLogin, nickname: dados.nickname, papel: dados.papel, nome: dados.nome ?? null,
        dataNascimento: dados.dataNascimento, codigoRecuperacaoHash: hash, codigoRecuperacaoEm: new Date(),
      },
    });
  } catch (err) {
    // Sem perfil, o usuário do Auth não serve para nada: desfaz para não deixar conta pela metade.
    await excluirUsuario(id).catch(() => console.error("[conta] cadastro: não foi possível desfazer o usuário do Auth"));
    if ((err as { code?: string }).code === "P2002") {
      throw new AppError(409, "NICKNAME_EM_USO", "Este nome de usuário já está em uso.", [{ campo: "nickname", mensagem: "Já está em uso" }]);
    }
    throw err;
  }
  const sessao = await pedirSessao(emailLogin, dados.senha);
  if (!sessao) throw new AppError(502, "AUTH_FALHOU", "Conta criada, mas não foi possível entrar agora. Tente entrar com seu nome de usuário.");
  return { ...sessao, codigoRecuperacao: codigo };
}

// ---------- Código de recuperação ----------

/** Gera um código novo (com a senha atual). O anterior deixa de valer. */
export async function gerarCodigo(perfilId: string, senha: string) {
  const prisma = getPrisma();
  const p = await prisma.perfil.findUniqueOrThrow({ where: { id: perfilId } });
  await conferirSenha(p.email, senha);
  const { codigo, hash } = novoCodigo();
  await prisma.perfil.update({ where: { id: perfilId }, data: { codigoRecuperacaoHash: hash, codigoRecuperacaoEm: new Date() } });
  return { codigoRecuperacao: codigo };
}

const recuperacaoInvalida = () => new AppError(400, "RECUPERACAO_INVALIDA", "Nome de usuário ou código de recuperação incorretos.");

/**
 * Esqueceu a senha: nickname + código de recuperação + senha nova. Mesma resposta para nickname inexistente ou código errado.
 * Usado, o código é trocado por um novo (devolvido para a pessoa guardar) e as sessões anteriores deixam de valer.
 */
export async function recuperarSenha(nickname: string, codigo: string, senha: string) {
  const prisma = getPrisma();
  const p = await prisma.perfil.findUnique({ where: { nickname: normalizarNickname(nickname) } });
  if (!p || p.exclusaoIniciadaEm || !codigoConfere(codigo, p.codigoRecuperacaoHash)) throw recuperacaoInvalida();
  await definirSenha(p.id, senha);
  const novo = novoCodigo();
  // Só troca se o código ainda for o mesmo (dois pedidos ao mesmo tempo: só um vence).
  const { count } = await prisma.perfil.updateMany({
    where: { id: p.id, codigoRecuperacaoHash: p.codigoRecuperacaoHash },
    data: { codigoRecuperacaoHash: novo.hash, codigoRecuperacaoEm: new Date(), sessoesValidasDesde: new Date() },
  });
  if (count !== 1) throw recuperacaoInvalida();
  return { codigoRecuperacao: novo.codigo };
}

// ---------- Exclusão ----------

/** Exclui a conta na hora, com a senha e o próprio nickname digitado como confirmação. */
export async function pedirExclusao(perfilId: string, senha: string, confirmacao: string) {
  const p = await getPrisma().perfil.findUniqueOrThrow({ where: { id: perfilId } });
  if (normalizarNickname(confirmacao) !== p.nickname) {
    throw requisicaoInvalida("Digite o seu nome de usuário para confirmar.", [{ campo: "confirmacao", mensagem: "Não confere com o seu nome de usuário" }]);
  }
  await conferirSenha(p.email, senha);
  await excluirConta(perfilId);
}

/** Tempo depois do qual outra execução pode retomar uma exclusão que parou no meio. */
const RETOMAR_APOS_MS = 5 * MINUTO;

/**
 * Exclusão definitiva, idempotente e retomável:
 * 1. marca a conta (bloqueia o uso e impede outra execução simultânea);
 * 2. tira o retrato das fichas dos jogadores dos grupos deste mestre (eles ficam com uma cópia arquivada);
 * 3. apaga o usuário do Supabase Auth (encerra login e sessões);
 * 4. numa transação: arquiva as cópias, apaga os grupos dele, as fichas dele em outros grupos (itens ficam vagos lá), os NPCs
 *    e o perfil (o resto do conteúdo dele cai em cascata: classes, raças, perícias, itens do catálogo, bestiário, kits, tokens).
 * Se algo falhar, a marca fica (a conta continua bloqueada) e a exclusão é retomada por `npm run concluir-exclusoes`.
 */
export async function excluirConta(perfilId: string, agora = new Date()) {
  const prisma = getPrisma();
  const { count } = await prisma.perfil.updateMany({
    where: { id: perfilId, OR: [{ exclusaoIniciadaEm: null }, { exclusaoIniciadaEm: { lt: new Date(agora.getTime() - RETOMAR_APOS_MS) } }] },
    data: { exclusaoIniciadaEm: agora },
  });
  if (count === 0) {
    const ainda = await prisma.perfil.findUnique({ where: { id: perfilId }, select: { id: true } });
    if (!ainda) {
      await excluirUsuario(perfilId); // perfil já apagado: garante que o Auth também foi
      return;
    }
    throw new AppError(409, "EXCLUSAO_EM_ANDAMENTO", "A exclusão desta conta já está em andamento. Tente de novo em alguns minutos.");
  }

  const fichasDeTerceiros = await prisma.ficha.findMany({ where: { grupo: { mestreId: perfilId }, jogadorId: { not: perfilId } }, select: { id: true, jogadorId: true } });
  const copias = await retratos(fichasDeTerceiros, "GRUPO_EXCLUIDO");

  await excluirUsuario(perfilId);

  await prisma.$transaction([
    ...(copias.length ? [prisma.fichaArquivada.createMany({ data: copias })] : []),
    prisma.grupo.deleteMany({ where: { mestreId: perfilId } }),
    prisma.ficha.deleteMany({ where: { jogadorId: perfilId } }),
    prisma.npc.deleteMany({ where: { donoId: perfilId } }),
    prisma.perfil.delete({ where: { id: perfilId } }),
  ]);
  console.log("[conta] exclusão concluída");
}

/** Retoma exclusões que pararam no meio (marcadas há mais de 5 minutos). Devolve quantas terminaram e quantas falharam. */
export async function concluirExclusoesPendentes(agora = new Date()) {
  const pendentes = await getPrisma().perfil.findMany({
    where: { exclusaoIniciadaEm: { lt: new Date(agora.getTime() - RETOMAR_APOS_MS) } },
    select: { id: true },
  });
  let concluidas = 0;
  let falhas = 0;
  for (const { id } of pendentes) {
    try {
      await excluirConta(id, agora);
      concluidas++;
    } catch {
      falhas++;
      console.error("[conta] uma exclusão pendente falhou de novo; será tentada na próxima execução");
    }
  }
  return { concluidas, falhas };
}

// ---------- Exportação (portabilidade) ----------

/**
 * Todos os dados da conta em JSON, para o próprio titular baixar quando quiser.
 * Fica de fora o que não é dele ou é interno: dados de outros jogadores, e-mail técnico do login, hashes de links.
 */
export async function exportarDados(perfilId: string) {
  const prisma = getPrisma();
  const dono = { where: { donoId: perfilId } };
  const p = await prisma.perfil.findUniqueOrThrow({ where: { id: perfilId } });
  const { fotoDaFicha } = await import("../fichas/retrato.js");
  const minhas = await prisma.ficha.findMany({ where: { jogadorId: perfilId }, select: { id: true } });
  const [
    arquivadas, grupos, classes, conceitosClasse, racas, conceitosRaca, atributos, pericias, status, itens, categorias, bestas,
    conceitosBesta, npcs, kits,
  ] = await Promise.all([
    prisma.fichaArquivada.findMany({ where: { jogadorId: perfilId }, omit: { jogadorId: true } }),
    prisma.grupo.findMany({
      where: { mestreId: perfilId },
      include: { regrasProprias: true, criaturas: true, _count: { select: { fichas: true } } },
    }),
    prisma.classe.findMany({ ...dono, include: { habilidades: { include: { aprimoramentos: true } }, pericias: true } }),
    prisma.classeConceito.findMany(dono),
    prisma.raca.findMany({ ...dono, include: { pericias: true } }),
    prisma.racaConceito.findMany(dono),
    prisma.atributo.findMany(dono),
    prisma.pericia.findMany(dono),
    prisma.status.findMany(dono),
    prisma.itemModelo.findMany(dono),
    prisma.categoriaItem.findMany(dono),
    prisma.besta.findMany({ ...dono, include: { habilidades: { include: { aprimoramentos: true } }, pericias: true, atributos: true } }),
    prisma.bestaConceito.findMany(dono),
    prisma.npc.findMany({ ...dono, include: { atributos: true, pericias: true, itens: true, status: true } }),
    prisma.kit.findMany(dono),
  ]);
  return {
    geradoEm: new Date().toISOString(),
    conta: {
      nickname: p.nickname,
      nome: p.nome,
      fotoUrl: p.fotoUrl,
      codigoDeRecuperacaoGeradoEm: p.codigoRecuperacaoEm,
      dataNascimento: p.dataNascimento ? p.dataNascimento.toISOString().slice(0, 10) : null,
      interfaceDeMestre: p.papel === "MESTRE",
      criadaEm: p.criadoEm,
    },
    fichas: await Promise.all(minhas.map((f) => fotoDaFicha(f.id, perfilId))),
    fichasArquivadas: arquivadas,
    mestre: {
      grupos: grupos.map(({ _count, mestreId: _m, ...g }) => ({ ...g, membros: _count.fichas })),
      classes, arquetiposDeClasse: conceitosClasse, racas, arquetiposDeRaca: conceitosRaca, atributos, pericias, status,
      catalogoDeItens: itens, categoriasDeItem: categorias, bestiario: bestas, arquetiposDeCriatura: conceitosBesta, npcs, kits,
    },
  };
}
