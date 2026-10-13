// Hooks de dados das classes (TanStack Query). Toda escrita invalida o cache afetado.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type {
  AprimoramentoInput,
  Conceito,
  ConceitoInput,
  Classe,
  ClasseDetalhe,
  ClasseInput,
  Grupo,
  Habilidade,
  HabilidadeInput,
  Progressao,
} from "./types";

export const chaves = {
  lista: (grupo?: Grupo) => ["classes", "lista", grupo ?? "todos"] as const,
  detalhe: (id: string) => ["classes", "detalhe", id] as const,
  progressao: (id: string) => ["classes", "progressao", id] as const,
};

export function useClasses(grupo?: Grupo) {
  return useQuery({
    queryKey: chaves.lista(grupo),
    queryFn: () => api<Classe[]>(`/api/classes${grupo ? `?grupo=${grupo}` : ""}`),
  });
}

export function useClasse(id: string) {
  return useQuery({
    queryKey: chaves.detalhe(id),
    queryFn: () => api<ClasseDetalhe>(`/api/classes/${id}`),
  });
}

export function useProgressao(id: string) {
  return useQuery({
    queryKey: chaves.progressao(id),
    queryFn: () => api<Progressao>(`/api/classes/${id}/progressao`),
  });
}

/** Invalida tudo de classes (listas e detalhes) e do bestiário, que usa as mesmas cartas. */
function useInvalidar() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ["classes"] }), qc.invalidateQueries({ queryKey: ["bestas"] })]);
}

function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: fn, onSuccess: invalidar });
}

// ---------- Classe ----------
export const useCriarClasse = () =>
  useEscrita((dados: ClasseInput) => api<Classe>("/api/classes", { method: "POST", body: dados }));

export const useEditarClasse = (id: string) =>
  useEscrita((dados: Partial<ClasseInput>) => api<Classe>(`/api/classes/${id}`, { method: "PATCH", body: dados }));

export const useExcluirClasse = () =>
  useEscrita((id: string) => api<void>(`/api/classes/${id}`, { method: "DELETE" }));

export const useDuplicarClasse = () =>
  useEscrita((id: string) => api<ClasseDetalhe>(`/api/classes/${id}/duplicar`, { method: "POST" }));

// ---------- Habilidade ----------
export const useCriarHabilidade = (classeId: string) =>
  useEscrita((dados: HabilidadeInput) =>
    api<Habilidade>(`/api/classes/${classeId}/habilidades`, { method: "POST", body: dados }),
  );

export const useEditarHabilidade = () =>
  useEscrita(({ id, dados }: { id: string; dados: HabilidadeInput }) =>
    api<Habilidade>(`/api/habilidades/${id}`, { method: "PATCH", body: dados }),
  );

export const useExcluirHabilidade = () =>
  useEscrita((id: string) => api<void>(`/api/habilidades/${id}`, { method: "DELETE" }));

export const useOrdenarHabilidades = (classeId: string) =>
  useEscrita((ids: string[]) =>
    api<Habilidade[]>(`/api/classes/${classeId}/habilidades/ordem`, { method: "PUT", body: { ids } }),
  );

// ---------- Aprimoramentos de carta ----------
export const useCriarAprimoramento = () =>
  useEscrita(({ habilidadeId, dados }: { habilidadeId: string; dados: AprimoramentoInput }) =>
    api(`/api/habilidades/${habilidadeId}/aprimoramentos`, { method: "POST", body: dados }),
  );

export const useEditarAprimoramento = () =>
  useEscrita(({ id, dados }: { id: string; dados: AprimoramentoInput }) => api(`/api/aprimoramentos/${id}`, { method: "PATCH", body: dados }));

export const useExcluirAprimoramento = () => useEscrita((id: string) => api<void>(`/api/aprimoramentos/${id}`, { method: "DELETE" }));

// ---------- Arquétipos ----------
export function useConceitos() {
  return useQuery({ queryKey: ["classes", "conceitos"], queryFn: () => api<Conceito[]>("/api/conceitos") });
}

export const useCriarConceito = () => useEscrita((dados: ConceitoInput) => api<Conceito>("/api/conceitos", { method: "POST", body: dados }));

export const useEditarConceito = () =>
  useEscrita(({ id, dados }: { id: string; dados: ConceitoInput }) => api<Conceito>(`/api/conceitos/${id}`, { method: "PATCH", body: dados }));

export const useExcluirConceito = () => useEscrita((id: string) => api<void>(`/api/conceitos/${id}`, { method: "DELETE" }));
