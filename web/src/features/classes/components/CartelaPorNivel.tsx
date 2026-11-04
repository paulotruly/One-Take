// Cartela na página da classe: escolha o nível para ver recursos e cartas liberadas. Só exibe; as regras vêm da API.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState } from "../../../components/ui/States";
import { TIPOS_EFEITO, type Habilidade, type Progressao, type TipoEfeito } from "../types";
import { HabilidadeCard, HabilidadeDetalhe } from "./HabilidadeCard";
import { StatsBar } from "./StatsBar";

type Props = { habilidades: Habilidade[]; progressao: Progressao; acao?: ReactNode };

export function CartelaPorNivel({ habilidades, progressao, acao }: Props) {
  const [nivel, setNivel] = useState(progressao.niveis[0]?.nivel ?? 1);
  const [tipo, setTipo] = useState<TipoEfeito | null>(null);
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const atual = progressao.niveis.find((n) => n.nivel === nivel) ?? progressao.niveis[0];
  if (!atual) return null;

  const g = progressao.ganhoPorNivel;
  const liberadas = new Set(atual.habilidades);
  const novas = new Set(atual.novasHabilidades);
  const aprimoradas = new Set(atual.aprimoradas ?? []);
  const primeiroNivel = progressao.niveis[0]?.nivel ?? 1;
  const tipos = [...new Set(habilidades.map((h) => h.tipoEfeito))];
  const visiveis = habilidades.filter((h) => !tipo || h.tipoEfeito === tipo);
  const niveisDasCartas = [...new Set(visiveis.map((h) => h.nivelNecessario))].sort((a, b) => a - b);
  // A ordem do pop-up segue a da tela (por nível), para as setas andarem de carta em carta.
  const ordem = niveisDasCartas.flatMap((n) => visiveis.filter((h) => h.nivelNecessario === n));
  const indice = ordem.findIndex((h) => h.id === abertaId);
  const aberta = indice >= 0 ? ordem[indice]! : null;

  function mover(direcao: -1 | 1) {
    const proxima = ordem[indice + direcao];
    if (proxima) setAbertaId(proxima.id);
  }

  function teclas(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") mover(-1);
    if (e.key === "ArrowRight") mover(1);
  }

  return (
    <div className="cartela">
      <div className="cartela__nivel">
        <div className="filtro" role="group" aria-label="Nível">
          {progressao.niveis.map((n) => (
            <button key={n.nivel} type="button" className="filtro__opcao" aria-pressed={n.nivel === nivel} onClick={() => setNivel(n.nivel)}>
              Nível {n.nivel}
            </button>
          ))}
        </div>
        {acao}
      </div>

      <div className="cartela__resumo">
        <StatsBar vida={atual.pontosVida} mana={atual.pontosMana} esforco={atual.pontosEsforco} />
        <span className="pagina__subtitulo">
          {atual.habilidades.length} de {habilidades.length} {habilidades.length === 1 ? "carta liberada" : "cartas liberadas"}
          {atual.pontosPericia > 0 && ` · ${atual.pontosPericia} pontos de perícia para distribuir`}
        </span>
      </div>
      <p className="pagina__subtitulo">
        A cada nível: +{g.pontosVida} vida, +{g.pontosMana} mana, +{g.pontosEsforco} esforço, +{g.pontosPericia} pontos de perícia e as cartas daquele nível.
        Só o mestre sobe o nível, 1 por participação.
      </p>

      {tipos.length > 1 && (
        <div className="filtro" role="group" aria-label="Tipo de efeito">
          <button type="button" className="filtro__opcao" aria-pressed={!tipo} onClick={() => setTipo(null)}>Todos os tipos</button>
          {tipos.map((t) => {
            const { Icone, rotulo } = TIPOS_EFEITO[t] ?? TIPOS_EFEITO.UTILIDADE;
            return (
              <button key={t} type="button" className="filtro__opcao filtro__opcao--icone" aria-pressed={tipo === t} onClick={() => setTipo(t)}>
                <Icone size={14} aria-hidden /> {rotulo}
              </button>
            );
          })}
        </div>
      )}

      {habilidades.length === 0 ? (
        <EmptyState compacto titulo="Nenhuma carta na cartela ainda" />
      ) : (
        niveisDasCartas.map((n) => (
          <section key={n} className="cartela__bloco">
            <h3 className="cartela__titulo-nivel">Cartas do nível {n}</h3>
            <div className="deck">
              {visiveis.filter((h) => h.nivelNecessario === n).map((h) => (
                <HabilidadeCard
                  key={h.id}
                  habilidade={h}
                  bloqueada={!liberadas.has(h.id)}
                  marca={aprimoradas.has(h.id) ? "Aprimorada" : novas.has(h.id) && nivel > primeiroNivel ? "Nova" : undefined}
                  onAbrir={() => setAbertaId(h.id)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <Modal aberto={!!aberta} onFechar={() => setAbertaId(null)} titulo={aberta?.titulo ?? ""}>
        {aberta && (
          <div className="cartela__detalhe" onKeyDown={teclas}>
            <HabilidadeDetalhe habilidade={aberta} />
            {!liberadas.has(aberta.id) && <p className="pagina__subtitulo">Liberada no nível {aberta.nivelNecessario}.</p>}
            <div className="modal__acoes">
              <Button onClick={() => mover(-1)} disabled={indice <= 0}><ChevronLeft size={16} aria-hidden /> Anterior</Button>
              <span className="cartela__posicao pagina__subtitulo">{indice + 1} de {ordem.length}</span>
              <Button onClick={() => mover(1)} disabled={indice >= ordem.length - 1}>Próxima <ChevronRight size={16} aria-hidden /></Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
