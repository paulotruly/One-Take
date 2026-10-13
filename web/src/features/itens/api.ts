// Hooks do catálogo de itens do mestre e das ações com itens (lançar, criar no grupo, editar, usar).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { CategoriaItem, CategoriaItemInput, Item, ItemModelo, ItemModeloInput, ItemNoGrupoInput } from "./types";

/** `kitId` = só o que aparece com aquele kit (do kit + gerais). */
export function useCatalogoItens(kitId?: string | null) {
  return useQuery({
    queryKey: ["itens", "catalogo", kitId ?? "todos"],
    queryFn: () => api<ItemModelo[]>(`/api/catalogo-itens${kitId ? `?kitId=${kitId}` : ""}`),
  });
}

/** Itens mexem no inventário das fichas e nos itens vagos do grupo. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["itens", "fichas", "grupos", "npcs"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

/** Categorias fixas do sistema + as do mestre. */
export function useCategoriasItem() {
  return useQuery({ queryKey: ["itens", "categorias"], queryFn: () => api<CategoriaItem[]>("/api/categorias-item") });
}

export const useCriarCategoriaItem = () =>
  useEscrita((dados: CategoriaItemInput) => api<CategoriaItem>("/api/categorias-item", { method: "POST", body: dados }));
export const useEditarCategoriaItem = () =>
  useEscrita(({ id, dados }: { id: string; dados: CategoriaItemInput }) => api<CategoriaItem>(`/api/categorias-item/${id}`, { method: "PATCH", body: dados }));
export const useExcluirCategoriaItem = () => useEscrita((id: string) => api<void>(`/api/categorias-item/${id}`, { method: "DELETE" }));

export const useCriarModelo = () => useEscrita((dados: ItemModeloInput) => api<ItemModelo>("/api/catalogo-itens", { method: "POST", body: dados }));

export const useEditarModelo = () =>
  useEscrita(({ id, dados }: { id: string; dados: Partial<ItemModeloInput> }) => api<ItemModelo>(`/api/catalogo-itens/${id}`, { method: "PATCH", body: dados }));

export const useExcluirModelo = () => useEscrita((id: string) => api<void>(`/api/catalogo-itens/${id}`, { method: "DELETE" }));

export const useLancarItem = () =>
  useEscrita(({ modeloId, ...dados }: { modeloId: string; grupoId?: string; fichaId?: string | null; npcId?: string; quantidade: number }) =>
    api<{ lancados: number }>(`/api/catalogo-itens/${modeloId}/lancar`, { method: "POST", body: dados }),
  );

export const useCriarItemNoGrupo = (grupoId: string) =>
  useEscrita((dados: ItemNoGrupoInput) => api<Item>(`/api/grupos/${grupoId}/itens`, { method: "POST", body: dados }));

export const useEditarItem = () =>
  useEscrita(({ id, dados }: { id: string; dados: Partial<ItemNoGrupoInput> & { usosRestantes?: number | null } }) =>
    api<Item>(`/api/itens/${id}`, { method: "PATCH", body: dados }),
  );

export const useUsarItem = () =>
  useEscrita((id: string) => api<{ consumido: boolean; item: Item | null }>(`/api/itens/${id}/usar`, { method: "POST" }));
