// Hooks do catálogo de status do mestre.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { CategoriaStatus, Status, StatusInput } from "./types";

export function useStatus(habilitado = true) {
  return useQuery({ queryKey: ["status"], queryFn: () => api<Status[]>("/api/status"), enabled: habilitado });
}

/** Status aparecem em cartas, grupos e fichas. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["status", "status-categorias", "classes", "grupos", "fichas"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarStatus = () => useEscrita((dados: StatusInput) => api<Status>("/api/status", { method: "POST", body: dados }));

export const useEditarStatus = () =>
  useEscrita(({ id, dados }: { id: string; dados: StatusInput }) => api<Status>(`/api/status/${id}`, { method: "PATCH", body: dados }));

export const useExcluirStatus = () => useEscrita((id: string) => api<void>(`/api/status/${id}`, { method: "DELETE" }));

// ---------- Categorias de status ----------
type CategoriaInput = { nome: string; descricao: string };

export function useCategoriasStatus() {
  return useQuery({ queryKey: ["status-categorias"], queryFn: () => api<CategoriaStatus[]>("/api/status-categorias") });
}

export const useCriarCategoriaStatus = () =>
  useEscrita((dados: CategoriaInput) => api<CategoriaStatus>("/api/status-categorias", { method: "POST", body: dados }));

export const useEditarCategoriaStatus = () =>
  useEscrita(({ id, dados }: { id: string; dados: CategoriaInput }) => api<CategoriaStatus>(`/api/status-categorias/${id}`, { method: "PATCH", body: dados }));

export const useExcluirCategoriaStatus = () => useEscrita((id: string) => api<void>(`/api/status-categorias/${id}`, { method: "DELETE" }));
