// Hooks do catálogo de perícias, dos atributos e das perícias de uma classe.
// Mudanças aqui afetam classes e raças que usam as perícias, então invalidam tudo isso.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Atributo, AtributoInput, PericiaCatalogo, PericiaInput } from "./types";

const CHAVE = ["pericias"] as const;
const CHAVE_ATRIBUTOS = ["atributos"] as const;

export function useCatalogo() {
  return useQuery({ queryKey: CHAVE, queryFn: () => api<PericiaCatalogo[]>("/api/pericias") });
}

export function useAtributos() {
  return useQuery({ queryKey: CHAVE_ATRIBUTOS, queryFn: () => api<Atributo[]>("/api/atributos") });
}

function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all(
        [CHAVE, CHAVE_ATRIBUTOS, ["classes"], ["racas"]].map((queryKey) => qc.invalidateQueries({ queryKey })),
      ),
  });
}

// ---------- Catálogo ----------
export const useCriarPericia = () =>
  useEscrita((dados: PericiaInput) => api<PericiaCatalogo>("/api/pericias", { method: "POST", body: dados }));

export const useEditarPericia = () =>
  useEscrita(({ id, dados }: { id: string; dados: PericiaInput }) =>
    api<PericiaCatalogo>(`/api/pericias/${id}`, { method: "PATCH", body: dados }),
  );

export const useExcluirPericia = () =>
  useEscrita((id: string) => api<void>(`/api/pericias/${id}`, { method: "DELETE" }));

// ---------- Atributos ----------
export const useCriarAtributo = () =>
  useEscrita((dados: AtributoInput) => api<Atributo>("/api/atributos", { method: "POST", body: dados }));

export const useEditarAtributo = () =>
  useEscrita(({ id, dados }: { id: string; dados: AtributoInput }) =>
    api<Atributo>(`/api/atributos/${id}`, { method: "PATCH", body: dados }),
  );

export const useExcluirAtributo = () =>
  useEscrita((id: string) => api<void>(`/api/atributos/${id}`, { method: "DELETE" }));

// ---------- Perícias de uma classe ----------
/** Adiciona a perícia à classe ou atualiza o modificador. */
export const useVincularPericia = (classeId: string) =>
  useEscrita(({ periciaId, valor }: { periciaId: string; valor: number }) =>
    api(`/api/classes/${classeId}/pericias/${periciaId}`, { method: "PUT", body: { modificador: valor } }),
  );

export const useDesvincularPericia = (classeId: string) =>
  useEscrita((periciaId: string) => api<void>(`/api/classes/${classeId}/pericias/${periciaId}`, { method: "DELETE" }));
