import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export function LinkVoltar({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="link-voltar">
      <ArrowLeft size={16} aria-hidden />
      {children}
    </Link>
  );
}
