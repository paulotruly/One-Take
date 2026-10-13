// Rodapé discreto de todas as páginas: marca, créditos, direitos autorais e links.
import { Link } from "react-router";

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape__conteudo">
        <div className="rodape__creditos">
          <p>
            <Link to="/" className="rodape__marca">One-Take</Link> · RPG de mesa para sessões únicas
          </p>
          <p>© 2026 Paulo Gomes. Todos os direitos reservados. Criado e desenvolvido por Paulo Gomes.</p>
        </div>
        <nav className="rodape__links" aria-label="Links do rodapé">
          <Link to="/docs">Documentação</Link>
          <Link to="/termos">Termos de uso</Link>
          <Link to="/privacidade">Política de privacidade</Link>
          <a href="https://github.com/paulotruly" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
