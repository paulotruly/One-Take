// Retrato de uma ficha para o arquivo (cópia somente leitura que fica com o jogador). Ver arquivo.ts.
import type { MotivoArquivamento } from "../../generated/prisma/enums.js";
import { rotuloLimite } from "../../regras/limite.js";
import { detalhar } from "./fichas.service.js";

/** Retrato da ficha, calculado com as regras atuais. Não guarda dados de outras pessoas (mestre, outros membros). */
export async function retratoDaFicha(fichaId: string, jogadorId: string, motivo: MotivoArquivamento) {
  return { jogadorId, motivo, ...(await fotoDaFicha(fichaId, jogadorId)) };
}

/** A ficha como o jogador a vê, sem ids nem dados de outras pessoas (também usada na exportação de dados). */
export async function fotoDaFicha(fichaId: string, jogadorId: string) {
  const f = await detalhar(fichaId, jogadorId);
  return {
    nome: f.nome,
    nivel: f.nivel,
    classe: f.classe.titulo,
    raca: f.raca.titulo,
    grupo: f.grupo.titulo,
    conteudo: {
      historia: f.historia,
      imagemUrl: f.imagemUrl,
      classe: { titulo: f.classe.titulo, grupo: f.classe.grupo, descricao: f.classe.descricao, imagemUrl: f.classe.imagemUrl },
      raca: { titulo: f.raca.titulo, deslocamento: f.raca.deslocamento, imagemUrl: f.raca.imagemUrl },
      vida: f.vida,
      mana: f.mana,
      esforco: f.esforco,
      atributos: f.atributos.map((a) => ({ nome: a.nome, dados: a.dados, teste: a.teste })),
      pericias: f.pericias.map((p) => ({ nome: p.nome, atributo: p.atributo.nome, total: p.total, teste: p.teste })),
      habilidades: f.habilidades.map((h) => ({
        titulo: h.titulo, descricao: h.descricao, tipoEfeito: h.tipoEfeito, descricaoEfeito: h.descricaoEfeito,
        condicao: h.condicao, limite: rotuloLimite(h.limiteUsos, h.limitePor), custoMana: h.custoMana, nivelNecessario: h.nivelNecessario,
        teste: h.teste?.teste ?? null,
      })),
      inventario: f.inventario.itens.map((i) => ({
        nome: i.nome, descricao: i.descricao, efeito: i.efeito, espacos: i.espacos, categoria: i.categoria?.nome ?? null, usosRestantes: i.usosRestantes,
      })),
    },
  };
}

/** Retratos das fichas indicadas (antes de apagar). */
export async function retratos(fichas: { id: string; jogadorId: string }[], motivo: MotivoArquivamento) {
  return Promise.all(fichas.map((f) => retratoDaFicha(f.id, f.jogadorId, motivo)));
}
