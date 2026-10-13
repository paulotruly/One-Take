// Formato público de itens (molde e item lançado) e validação dos pré-requisitos.
// Sem imports de services, para não criar dependência circular.
import { getPrisma } from "../../lib/prisma.js";
import { naoEncontrado } from "../../lib/errors.js";
import { validarCategoria } from "./categorias.js";

/** Include dos nomes dos pré-requisitos. */
export const comRequisitos = {
  categoria: { select: { id: true, nome: true, icone: true } },
  requisitoPericia: { select: { id: true, nome: true } },
  requisitoClasse: { select: { id: true, titulo: true } },
} as const;

type ItemBase = {
  id: string;
  categoria?: { id: string; nome: string; icone: string } | null;
  nome: string;
  descricao: string;
  imagemUrl: string | null;
  efeito: string | null;
  espacos: number;
  usosMaximos: number | null;
  requisito: string | null;
  requisitoPericiaId: string | null;
  requisitoClasseId: string | null;
  requisitoPericia?: { id: string; nome: string } | null;
  requisitoClasse?: { id: string; titulo: string } | null;
};

export function apresentarItem<T extends ItemBase & { usosRestantes?: number | null; fichaId?: string | null; modeloId?: string | null }>(i: T) {
  return {
    id: i.id,
    categoria: i.categoria ?? null,
    nome: i.nome,
    descricao: i.descricao,
    imagemUrl: i.imagemUrl,
    efeito: i.efeito,
    espacos: i.espacos,
    usosMaximos: i.usosMaximos,
    usosRestantes: i.usosRestantes ?? null,
    requisito: i.requisito,
    requisitoPericia: i.requisitoPericia ?? null,
    requisitoClasse: i.requisitoClasse ?? null,
    ...(i.fichaId !== undefined && { fichaId: i.fichaId }),
    ...(i.modeloId !== undefined && { modeloId: i.modeloId }),
  };
}

/** Categoria e pré-requisitos precisam ser do mestre (ou fixos): perícia do catálogo dele; classe fixa ou dele. */
export async function validarRequisitos(d: { requisitoPericiaId?: string | null; requisitoClasseId?: string | null; categoriaId?: string | null }, mestreId: string) {
  const prisma = getPrisma();
  await validarCategoria(d.categoriaId, mestreId);
  if (d.requisitoPericiaId) {
    const p = await prisma.pericia.findUnique({ where: { id: d.requisitoPericiaId }, select: { donoId: true } });
    if (!p || p.donoId !== mestreId) throw naoEncontrado("Perícia do pré-requisito não encontrada");
  }
  if (d.requisitoClasseId) {
    const c = await prisma.classe.findUnique({ where: { id: d.requisitoClasseId }, select: { donoId: true } });
    if (!c || (c.donoId !== null && c.donoId !== mestreId)) throw naoEncontrado("Classe do pré-requisito não encontrada");
  }
}
