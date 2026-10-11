import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "padrao" | "primario" | "perigo" | "fantasma";
  pequeno?: boolean;
};

export function Button({ variante = "padrao", pequeno, className = "", type = "button", ...props }: Props) {
  const classes = ["btn", variante !== "padrao" && `btn--${variante}`, pequeno && "btn--pequeno", className];
  return <button type={type} className={classes.filter(Boolean).join(" ")} {...props} />;
}
