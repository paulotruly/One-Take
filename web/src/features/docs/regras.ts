// Números das regras para as páginas de documentação: vêm de GET /api/regras (fonte única no código da API).
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export type Regras = {
  progressao: {
    nivelInicial: number;
    ganhoPorNivel: { pontosVida: number; pontosMana: number; pontosEsforco: number; pontosPericia: number };
  };
  ficha: { pontosAtributoIniciais: number; inventarioInicial: number; inventarioPorNivel: number };
  atributosFixos: { nome: string; descricao: string }[];
  statusFixos: { nome: string; descricao: string; efeito: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; gatilho: string | null }[];
};

/** Usado só enquanto /api/regras carrega (mesmos valores da regra atual). */
const PADRAO: Regras = {
  progressao: { nivelInicial: 1, ganhoPorNivel: { pontosVida: 5, pontosMana: 5, pontosEsforco: 5, pontosPericia: 5 } },
  ficha: { pontosAtributoIniciais: 3, inventarioInicial: 5, inventarioPorNivel: 2 },
  atributosFixos: [
    { nome: "Capacidade física", descricao: "Utilizada sempre que o corpo é levado ao limite." },
    { nome: "Carisma", descricao: "A presença do personagem e sua capacidade de lidar com outras pessoas." },
    { nome: "Conhecimento", descricao: "O intelecto e a sensibilidade do personagem diante do mundo." },
  ],
  statusFixos: [],
};

export function useRegras(): Regras {
  const q = useQuery({ queryKey: ["regras"], queryFn: () => api<Regras>("/api/regras"), staleTime: Infinity });
  return q.data ?? PADRAO;
}
