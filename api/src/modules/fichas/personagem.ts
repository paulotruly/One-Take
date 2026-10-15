// Personagem entre mesas: cada mesa (grupo) é uma sessão, e o nível sobe participando de mais mesas com o mesmo personagem.
// Levar o personagem cria uma ficha nova na mesa nova: mesmo nome, história, imagem, classe, raça e nível; vida, mana e esforço
// cheios; sem itens; pontos de perícia de todos os níveis para gastar de novo (o catálogo de perícias é do mestre da mesa).
// A classe e a raça precisam estar liberadas na mesa nova. A origem deixa de existir como personagem vivo: a ficha ativa vira
// arquivada (motivo LEVADO_PARA_OUTRA_MESA) e a arquivada usada como origem é apagada. Assim só há uma cópia viva do personagem.
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";

export type Origem = { tipo: "FICHA" | "ARQUIVADA"; id: string };

type ConteudoArquivado = { historia?: string | null; imagemUrl?: string | null; atributos?: { nome: string; dados: number }[] };

/** Personagens do jogador que podem ir para outra mesa: fichas de outros grupos e arquivadas que guardam a classe e a raça. */
export async function personagensDoJogador(usuarioId: string, grupoIdAtual: string) {
  const prisma = getPrisma();
  const [fichas, arquivadas] = await Promise.all([
    prisma.ficha.findMany({
      where: { jogadorId: usuarioId, NOT: { grupoId: grupoIdAtual } },
      orderBy: { atualizadoEm: "desc" },
      include: {
        grupo: { select: { titulo: true } },
        classe: { select: { titulo: true } },
        raca: { select: { titulo: true } },
        atributos: { include: { atributo: { select: { nome: true } } } },
      },
    }),
    prisma.fichaArquivada.findMany({ where: { jogadorId: usuarioId, classeId: { not: null }, racaId: { not: null } }, orderBy: { arquivadaEm: "desc" } }),
  ]);
  return [
    ...fichas.map((f) => ({
      origem: { tipo: "FICHA" as const, id: f.id },
      nome: f.nome, nivel: f.nivel, historia: f.historia, imagemUrl: f.imagemUrl,
      classeId: f.classeId, racaId: f.racaId, classe: f.classe.titulo, raca: f.raca.titulo, grupo: f.grupo.titulo,
      atributos: f.atributos.map((a) => ({ nome: a.atributo.nome, dados: a.dados })),
    })),
    ...arquivadas.map((a) => {
      const c = a.conteudo as ConteudoArquivado;
      return {
        origem: { tipo: "ARQUIVADA" as const, id: a.id },
        nome: a.nome, nivel: a.nivel, historia: c.historia ?? null, imagemUrl: c.imagemUrl ?? null,
        classeId: a.classeId!, racaId: a.racaId!, classe: a.classe, raca: a.raca, grupo: a.grupo,
        atributos: c.atributos ?? [],
      };
    }),
  ];
}

/** A origem do personagem, do próprio jogador (e não deste grupo). Confere que a classe e a raça escolhidas são as dele. */
export async function origemDoPersonagem(origem: Origem, usuarioId: string, grupoId: string, escolha: { classeId: string; racaId: string }) {
  const prisma = getPrisma();
  const o =
    origem.tipo === "FICHA"
      ? await prisma.ficha.findFirst({ where: { id: origem.id, jogadorId: usuarioId, NOT: { grupoId } }, select: { nivel: true, classeId: true, racaId: true } })
      : await prisma.fichaArquivada.findFirst({ where: { id: origem.id, jogadorId: usuarioId }, select: { nivel: true, classeId: true, racaId: true } });
  if (!o || !o.classeId || !o.racaId) throw naoEncontrado("Personagem não encontrado");
  if (o.classeId !== escolha.classeId || o.racaId !== escolha.racaId) {
    throw requisicaoInvalida("O personagem leva a mesma classe e a mesma raça.", [{ campo: "classeId", mensagem: "Use a classe do personagem" }]);
  }
  return o;
}
