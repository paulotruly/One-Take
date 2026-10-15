// Hooks de fichas (jogador e mestre) e do inventário.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Convite, CriarFichaInput, FichaArquivada, FichaArquivadaResumo, FichaDetalhe, FichaResumo } from "./types";

export function useMinhasFichas() {
  return useQuery({ queryKey: ["fichas", "minhas"], queryFn: () => api<FichaResumo[]>("/api/fichas") });
}

export function useFichasArquivadas() {
  return useQuery({ queryKey: ["fichas", "arquivadas"], queryFn: () => api<FichaArquivadaResumo[]>("/api/fichas-arquivadas") });
}

export function useFichaArquivada(id: string) {
  return useQuery({ queryKey: ["fichas", "arquivadas", id], queryFn: () => api<FichaArquivada>(`/api/fichas-arquivadas/${id}`) });
}

export function useFicha(id: string) {
  return useQuery({ queryKey: ["fichas", "detalhe", id], queryFn: () => api<FichaDetalhe>(`/api/fichas/${id}`) });
}

export function useConvite(codigo: string) {
  return useQuery({
    queryKey: ["convite", codigo],
    queryFn: () => api<Convite>(`/api/convites/${encodeURIComponent(codigo)}`),
    enabled: codigo.length > 0,
  });
}

/** Fichas aparecem no grupo do mestre (membros, itens vagos), então invalidam os dois. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["fichas", "grupos", "convite", "npcs"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarFicha = () =>
  useEscrita((dados: CriarFichaInput) => api<FichaDetalhe>("/api/fichas", { method: "POST", body: dados }));

/** Rápido: usa a ficha devolvida pela API em vez de recarregar; só o grupo é recarregado. */
export function useEditarFicha(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: Partial<{ nome: string; historia: string | null; imagemUrl: string | null; vidaAtual: number; manaAtual: number; esforcoAtual: number }>) =>
      api<FichaDetalhe>(`/api/fichas/${id}`, { method: "PATCH", body: dados }),
    onSuccess: (ficha) => {
      qc.setQueryData(["fichas", "detalhe", id], ficha);
      return qc.invalidateQueries({ queryKey: ["grupos"] });
    },
  });
}

export const useAplicarStatus = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<FichaDetalhe>(`/api/fichas/${id}/status`, { method: "POST", body: { statusId, turnos } }));

/** Turnos que faltam de um status aplicado (0 tira o status). */
export const useTurnosStatus = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<FichaDetalhe>(`/api/fichas/${id}/status/${statusId}`, { method: "PATCH", body: { turnos } }));
export const useRemoverStatus = (id: string) =>
  useEscrita((statusId: string) => api<FichaDetalhe>(`/api/fichas/${id}/status/${statusId}`, { method: "DELETE" }));

export const useExcluirFicha = () => useEscrita((id: string) => api<void>(`/api/fichas/${id}`, { method: "DELETE" }));

export const useSubirNivel = (id: string) => useEscrita(() => api<FichaDetalhe>(`/api/fichas/${id}/subir-nivel`, { method: "POST" }));

export const useGastarPericia = (id: string) =>
  useEscrita((periciaId: string) => api<FichaDetalhe>(`/api/fichas/${id}/pericias`, { method: "POST", body: { periciaId } }));

/** fichaId nulo = fica vago no grupo (o mestre pode escolher o grupo); npcId = vai para um NPC (só o mestre). */
export const useMoverItem = () =>
  useEscrita(({ itemId, ...destino }: { itemId: string; fichaId: string | null; npcId?: string; grupoId?: string }) =>
    api(`/api/itens/${itemId}/mover`, { method: "POST", body: destino }),
  );

export const useExcluirItem = () => useEscrita((itemId: string) => api<void>(`/api/itens/${itemId}`, { method: "DELETE" }));

export const useExcluirFichaArquivada = () => useEscrita((id: string) => api<void>(`/api/fichas-arquivadas/${id}`, { method: "DELETE" }));
