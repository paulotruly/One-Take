import { BookOpen, House, LogIn, UserPlus } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { Rodape } from "../components/layout/Rodape";
import { Marca } from "../components/ui/Marca";

const ANCORAS = [
  { href: "#funcionalidades", rotulo: "Funcionalidades" },
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#perguntas", rotulo: "Perguntas" },
];

/** Layout das páginas públicas (regras e guia), com acesso a entrar/cadastrar. */
export function PublicLayout() {
  const { pathname } = useLocation();
  const docsAtiva = pathname.startsWith("/docs");

  return (
    <div className="app">
      <header className="topo">
        <div className="topo__conteudo">
          <Marca />
          <nav className="topo__nav" aria-label="Principal">
            <Link to="/" className={`topo__link ${pathname === "/" ? "topo__link--ativo" : ""}`}>
              <House size={16} aria-hidden />
              <span>Início</span>
            </Link>
            {/* Na home, atalhos para as seções da própria página (escondidos no celular). */}
            {pathname === "/" &&
              ANCORAS.map(({ href, rotulo }) => (
                <a key={href} href={href} className="topo__link topo__link--ancora">
                  {rotulo}
                </a>
              ))}
            {/* Documentação sempre por último. */}
            <Link to="/docs" className={`topo__link ${docsAtiva ? "topo__link--ativo" : ""}`}>
              <BookOpen size={16} aria-hidden />
              <span>Documentação</span>
            </Link>
          </nav>
          {/* Com sessão aberta, as páginas de login e cadastro levam direto para a área da conta. */}
          <div className="topo__usuario">
            <Link to="/login" className="btn btn--pequeno">
              <LogIn size={16} aria-hidden /> Login
            </Link>
            <Link to="/cadastro" className="btn btn--primario btn--pequeno">
              <UserPlus size={16} aria-hidden /> Registrar-se
            </Link>
          </div>
        </div>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
