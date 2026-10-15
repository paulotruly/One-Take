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
          <p>© 2026 One-Take. Todos os direitos reservados. Criado e desenvolvido por Paulo Gomes.</p>
        </div>
        <nav className="rodape__links" aria-label="Links do rodapé">
          <Link to="/docs">Documentação</Link>
          {/* Sem destino por enquanto: as páginas de termos e privacidade voltam depois. */}
          <a href="#" onClick={(e) => e.preventDefault()}>Termos de uso</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Política de privacidade</a>
          <a href="https://github.com/paulotruly" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
