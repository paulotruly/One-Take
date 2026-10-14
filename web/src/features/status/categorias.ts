// Agrupa status por categoria: as categorias na ordem da lista (mesmo vazias, se `comVazias`), depois "Sem categoria".
import type { CategoriaStatus, Status } from "./types";

export type GrupoDeStatus = { id: string; nome: string; itens: Status[] };

export function agruparPorCategoria(status: Status[], categorias: CategoriaStatus[] = [], { comVazias = false } = {}): GrupoDeStatus[] {
  const grupos = new Map<string, GrupoDeStatus>();
  for (const c of categorias) grupos.set(c.id, { id: c.id, nome: c.nome, itens: [] });
  const sem: GrupoDeStatus = { id: "sem-categoria", nome: "Sem categoria", itens: [] };
  for (const s of status) {
    const c = s.categoria;
    if (!c) { sem.itens.push(s); continue; }
    if (!grupos.has(c.id)) grupos.set(c.id, { id: c.id, nome: c.nome, itens: [] });
    grupos.get(c.id)!.itens.push(s);
  }
  return [...grupos.values()].filter((g) => comVazias || g.itens.length > 0).concat(sem.itens.length > 0 ? [sem] : []);
}
