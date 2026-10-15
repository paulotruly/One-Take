// Hooks dos NPCs do mestre.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { NpcDetalhe, NpcInput, NpcResumo } from "./types";

/** `kitId` = só os que aparecem com aquele kit (do kit + gerais). */
export function useNpcs(kitId?: string | null) {
  return useQuery({ queryKey: ["npcs", "lista", kitId ?? "todos"], queryFn: () => api<NpcResumo[]>(`/api/npcs${kitId ? `?kitId=${kitId}` : ""}`) });
}

export function useNpc(id: string) {
  return useQuery({ queryKey: ["npcs", "detalhe", id], queryFn: () => api<NpcDetalhe>(`/api/npcs/${id}`) });
}

/** NPCs aparecem nos grupos e mexem em itens. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["npcs", "grupos", "itens"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarNpc = () => useEscrita((dados: NpcInput) => api<NpcDetalhe>("/api/npcs", { method: "POST", body: dados }));
export const useEditarNpc = (id: string) =>
  useEscrita((dados: Partial<NpcInput & { vidaAtual: number; manaAtual: number; esforcoAtual: number }>) =>
    api<NpcDetalhe>(`/api/npcs/${id}`, { method: "PATCH", body: dados }),
  );
/** Cópia do NPC (com vida cheia, sem status nem itens); serve para os verificados de outras pessoas. */
export const useDuplicarNpc = () => useEscrita((id: string) => api<NpcDetalhe>(`/api/npcs/${id}/duplicar`, { method: "POST" }));
export const useExcluirNpc = () => useEscrita((id: string) => api<void>(`/api/npcs/${id}`, { method: "DELETE" }));
export const useAplicarStatusNpc = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<NpcDetalhe>(`/api/npcs/${id}/status`, { method: "POST", body: { statusId, turnos } }));
/** Turnos que faltam de um status aplicado (0 tira o status). */
export const useTurnosStatusNpc = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<NpcDetalhe>(`/api/npcs/${id}/status/${statusId}`, { method: "PATCH", body: { turnos } }));
export const useRemoverStatusNpc = (id: string) =>
  useEscrita((statusId: string) => api<NpcDetalhe>(`/api/npcs/${id}/status/${statusId}`, { method: "DELETE" }));
export const useDefinirAtributoNpc = (id: string) =>
  useEscrita(({ atributoId, dados }: { atributoId: string; dados: number }) => api<NpcDetalhe>(`/api/npcs/${id}/atributos/${atributoId}`, { method: "PUT", body: { dados } }));
export const useDefinirPericiaNpc = (id: string) =>
  useEscrita(({ periciaId, valor }: { periciaId: string; valor: number }) => api<NpcDetalhe>(`/api/npcs/${id}/pericias/${periciaId}`, { method: "PUT", body: { pontos: valor } }));
