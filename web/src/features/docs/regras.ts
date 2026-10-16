// Números das regras para as páginas de documentação: vêm de GET /api/regras (fonte única no código da API).
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export type Regras = {
  progressao: {
    nivelInicial: number;
    nivelMaximo: number;
    ganhoPorNivel: { pontosVida: number; pontosMana: number; pontosEsforco: number; pontosPericia: number };
  };
  ficha: { pontosAtributoIniciais: number; inventarioInicial: number; inventarioPorNivel: number };
  /** Regras de teste (api/src/regras/teste.ts) e tabela de chances por DT, sem bônus. */
  teste: {
    ladosDoDado: number;
    dadosComAtributoZero: number;
    divisorComAtributoZero: number;
    esforcoPorDadoExtra: number;
    esforcoComAtributoZero: boolean;
    /** Máximo de pontos de esforço por rodada. */
    esforcoMaximoPorRodada: number;
    dadosPorVantagem: number;
    chances: { dt: number; chances: { pontos: number; chance: number }[] }[];
  };
  /** Atributos e status base: os do administrador, verificados (não há conteúdo fixo). */
  atributosBase: { nome: string; descricao: string }[];
  statusBase: { nome: string; efeito: string; tipo: "BUFF" | "DEBUFF" | "MISTO"; gatilho: string | null }[];
  conta: { idadeMinima: number };
  /** Defesa do alvo pela perícia do teste da carta (api/src/regras/defesas.ts), pelas perícias base. */
  defesas: RegraDefesa[];
  /** Regras padrão de combate (api/src/regras/combate.ts): valem em todo grupo, menos as que o mestre desligar. */
  regrasPadrao: RegraPadrao[];
};

export type RegraPadrao = { slug: string; titulo: string; resumo: string; texto: string[] };

export type RegraDefesa = { ataque: { id: string; nome: string }; defesa: { id: string; nome: string }; quando: string };

/** Usado só enquanto /api/regras carrega (mesmos valores da regra atual). */
const PADRAO: Regras = {
  progressao: { nivelInicial: 1, nivelMaximo: 100, ganhoPorNivel: { pontosVida: 5, pontosMana: 5, pontosEsforco: 5, pontosPericia: 5 } },
  ficha: { pontosAtributoIniciais: 3, inventarioInicial: 5, inventarioPorNivel: 2 },
  teste: { ladosDoDado: 20, dadosComAtributoZero: 1, divisorComAtributoZero: 2, esforcoPorDadoExtra: 1, esforcoComAtributoZero: false, esforcoMaximoPorRodada: 1, dadosPorVantagem: 1, chances: [] },
  atributosBase: [
    { nome: "Capacidade física", descricao: "Utilizada sempre que o corpo é levado ao limite." },
    { nome: "Carisma", descricao: "A presença do personagem e sua capacidade de lidar com outras pessoas." },
    { nome: "Conhecimento", descricao: "O intelecto e a sensibilidade do personagem diante do mundo." },
  ],
  statusBase: [],
  conta: { idadeMinima: 12 },
  defesas: [],
  regrasPadrao: [],
};

export function useRegras(): Regras {
  const q = useQuery({ queryKey: ["regras"], queryFn: () => api<Regras>("/api/regras"), staleTime: Infinity });
  return q.data ?? PADRAO;
}
