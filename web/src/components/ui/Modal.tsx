import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type Props = {
  titulo: ReactNode;
  aberto: boolean;
  onFechar: () => void;
  children: ReactNode;
  /** Modal mais largo, para conteúdo extenso (ex.: detalhes de classe). */
  largo?: boolean;
};

/** Modal baseado em <dialog> nativo (foco, Esc e backdrop de graça). */
export function Modal({ titulo, aberto, onFechar, children, largo }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className={`modal ${largo ? "modal--largo" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onFechar();
      }}
    >
      {aberto && (
        <div className="modal__conteudo">
          <div className="modal__cabecalho">
            <h2>{titulo}</h2>
            <Button variante="fantasma" pequeno onClick={onFechar} aria-label="Fechar">
              <X size={16} aria-hidden />
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
