import { Link } from "react-router";
import { EmptyState } from "../components/ui/States";

/** Rota reservada para a futura interface do jogador. */
export function JogadorPage() {
  return (
    <EmptyState
      titulo="Minhas fichas"
      descricao="Em breve você vai criar fichas e entrar nos grupos com o código do mestre."
    />
  );
}

export function NotFoundPage() {
  return (
    <EmptyState titulo="Página não encontrada" acao={<Link to="/">Voltar ao início</Link>} />
  );
}
