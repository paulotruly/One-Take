import { useId, type ReactElement, type ReactNode } from "react";
import { cloneElement } from "react";

type Props = {
  rotulo: string;
  erro?: string;
  dica?: ReactNode;
  /** Um único <input>, <select> ou <textarea>; recebe id e aria automaticamente. */
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
};

export function Field({ rotulo, erro, dica, children }: Props) {
  const id = useId();
  const idErro = `${id}-erro`;
  return (
    <div className={`campo ${erro ? "campo--invalido" : ""}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {cloneElement(children, { id, "aria-invalid": !!erro, "aria-describedby": erro ? idErro : undefined })}
      {dica && !erro && <span className="campo__dica">{dica}</span>}
      {erro && (
        <span className="campo__erro" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  );
}
