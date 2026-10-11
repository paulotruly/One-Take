import { Dices } from "lucide-react";
import { Link } from "react-router";

/** Marca provisória: ícone no lugar do nome One-Take. */
export function Marca() {
  return (
    <Link to="/" className="marca" aria-label="One-Take: início">
      <Dices size={26} aria-hidden />
    </Link>
  );
}
