import { BookOpen, House, LogIn, UserPlus } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { Marca } from "../components/ui/Marca";

/** Layout das páginas públicas (regras e guia), com acesso a entrar/cadastrar. */
export function PublicLayout() {
  const { session } = useAuth();
  const { pathname } = useLocation();
  const links = [
    { to: "/", rotulo: "Início", Icone: House, ativo: (p: string) => p === "/" },
    { to: "/docs", rotulo: "Documentação", Icone: BookOpen, ativo: (p: string) => p.startsWith("/docs") },
  ];

  return (
    <div className="app">
      <header className="topo">
        <div className="topo__conteudo">
          <Marca />
          <nav className="topo__nav" aria-label="Principal">
            {links.map(({ to, rotulo, Icone, ativo }) => (
              <Link key={to} to={to} className={`topo__link ${ativo(pathname) ? "topo__link--ativo" : ""}`}>
                <Icone size={16} aria-hidden />
                <span>{rotulo}</span>
              </Link>
            ))}
          </nav>
          <div className="topo__usuario">
            {session ? (
              <Link to="/area" className="btn btn--primario btn--pequeno">
                Minha área
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn--pequeno">
                  <LogIn size={16} aria-hidden /> Entrar
                </Link>
                <Link to="/cadastro" className="btn btn--primario btn--pequeno">
                  <UserPlus size={16} aria-hidden /> Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
