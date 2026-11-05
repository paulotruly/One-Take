// Linha horizontal de cartas: desliza no toque, arrasta com o mouse e anda pelos botões.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";

/** Quanto o mouse anda antes de virar arrasto; abaixo disso ainda é clique na carta. */
const LIMIAR_ARRASTO = 5;
/** Fração da largura visível que cada botão avança; o resto mantém contexto. */
const PASSO = 0.8;

export function CartasLinha({ children }: { children: ReactNode }) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{ x: number; scroll: number } | null>(null);
  const arrastou = useRef(false);
  const [arrastando, setArrastando] = useState(false);
  const [limites, setLimites] = useState({ sobra: false, inicio: true, fim: true });

  function medir() {
    const t = trilhoRef.current;
    if (!t) return;
    const inicio = t.scrollLeft <= 1;
    const fim = t.scrollLeft + t.clientWidth >= t.scrollWidth - 1;
    const sobra = t.scrollWidth > t.clientWidth + 1;
    setLimites((l) => (l.inicio === inicio && l.fim === fim && l.sobra === sobra ? l : { sobra, inicio, fim }));
  }

  // Remede quando a tela muda de largura e quando entram, saem ou mudam cartas.
  useEffect(() => {
    const t = trilhoRef.current;
    if (!t) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(t);
    return () => observador.disconnect();
  }, []);
  useEffect(medir, [children]);

  function andar(direcao: -1 | 1) {
    const t = trilhoRef.current;
    if (!t) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: direcao * t.clientWidth * PASSO, behavior: suave ? "smooth" : "auto" });
  }

  // Só o mouse: no toque, quem rola é o navegador.
  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    arrastou.current = false;
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    arrasto.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
  }

  function aoMover(e: PointerEvent<HTMLDivElement>) {
    if (!arrasto.current) return;
    const deslocamento = e.clientX - arrasto.current.x;
    if (!arrastou.current) {
      if (Math.abs(deslocamento) < LIMIAR_ARRASTO) return;
      arrastou.current = true;
      setArrastando(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.currentTarget.scrollLeft = arrasto.current.scroll - deslocamento;
  }

  function aoSoltar() {
    arrasto.current = null;
    setArrastando(false);
  }

  // Soltar depois de arrastar não pode abrir a carta nem acionar os botões dela.
  function aoClicar(e: MouseEvent<HTMLDivElement>) {
    if (!arrastou.current) return;
    arrastou.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div className="cartas-linha">
      {limites.sobra && (
        <Button className="cartas-linha__seta" aria-label="Cartas anteriores" title="Cartas anteriores" disabled={limites.inicio} onClick={() => andar(-1)}>
          <ChevronLeft size={18} aria-hidden />
        </Button>
      )}
      <div
        ref={trilhoRef}
        className={`deck ${limites.sobra ? "deck--arrastavel" : ""} ${arrastando ? "deck--arrastando" : ""}`}
        onScroll={medir}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onClickCapture={aoClicar}
      >
        {children}
      </div>
      {limites.sobra && (
        <Button className="cartas-linha__seta" aria-label="Próximas cartas" title="Próximas cartas" disabled={limites.fim} onClick={() => andar(1)}>
          <ChevronRight size={18} aria-hidden />
        </Button>
      )}
    </div>
  );
}
