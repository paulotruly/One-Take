import { useState } from "react";
import type { Habilidade, Progressao } from "../types";
import { NivelBadge } from "./Selos";
import { StatsBar } from "./StatsBar";

/** Prévia por nível: atributos, pontos de perícia e cartas disponíveis. Só exibe; regras vêm da API. */
export function ProgressaoPrevia({ progressao, habilidades }: { progressao: Progressao; habilidades: Habilidade[] }) {
  const [nivel, setNivel] = useState(progressao.niveis[0]?.nivel ?? 1);
  const atual = progressao.niveis.find((n) => n.nivel === nivel) ?? progressao.niveis[0];
  if (!atual) return null;

  const g = progressao.ganhoPorNivel;
  const porId = new Map(habilidades.map((h) => [h.id, h]));
  const cartas = atual.habilidades.map((id) => porId.get(id)).filter((h): h is Habilidade => !!h);
  const novas = new Set(atual.novasHabilidades);
  const aprimoradas = new Set(atual.aprimoradas ?? []);
  const subidas = atual.nivel - (progressao.niveis[0]?.nivel ?? 1);

  return (
    <div className="painel">
      <p className="painel__descricao">
        A cada nível: +{g.pontosVida} vida, +{g.pontosMana} mana, +{g.pontosEsforco} esforço, +{g.pontosPericia} pontos de
        perícia (uma perícia nova com +{g.pontosPericia} ou +{g.pontosPericia} numa existente) e as cartas daquele nível.
        Só o mestre sobe o nível, 1 por participação.
      </p>

      <div className="filtro" role="group" aria-label="Nível">
        {progressao.niveis.map((n) => (
          <button
            key={n.nivel}
            type="button"
            className="filtro__opcao"
            aria-pressed={n.nivel === nivel}
            onClick={() => setNivel(n.nivel)}
          >
            Nv {n.nivel}
          </button>
        ))}
      </div>

      <div className="progressao">
        <div className="progressao__linha">
          <StatsBar vida={atual.pontosVida} mana={atual.pontosMana} esforco={atual.pontosEsforco} />
          {subidas > 0 && (
            <span className="painel__descricao">
              (+{subidas * g.pontosVida} / +{subidas * g.pontosMana} / +{subidas * g.pontosEsforco} sobre a base)
            </span>
          )}
        </div>
        <p>
          <strong>Perícias:</strong>{" "}
          {atual.pontosPericia === 0
            ? "as da classe"
            : `as da classe + ${atual.pontosPericia} pontos para distribuir (${atual.pontosPericia / g.pontosPericia}× nova perícia com +${g.pontosPericia} ou +${g.pontosPericia} numa existente)`}
        </p>
        <div>
          <strong>Cartas disponíveis ({cartas.length}):</strong>
          {cartas.length === 0 ? (
            <p className="painel__descricao">Nenhuma carta neste nível.</p>
          ) : (
            <ul className="resumo-habilidades">
              {cartas.map((h) => (
                <li key={h.id}>
                  {h.titulo} <NivelBadge nivel={h.nivelNecessario} />
                  {novas.has(h.id) && nivel > 1 && <span className="selo selo--novo">nova</span>}
                  {aprimoradas.has(h.id) && <span className="selo selo--novo">aprimorada</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
