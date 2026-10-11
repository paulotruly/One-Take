import { Activity, BookOpen, Layers, ListChecks, LogOut, ScrollText, Shield, Users, type LucideIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import { useAuth, useMe, type Papel } from "../auth/AuthProvider";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Marca } from "../components/ui/Marca";

type LinkTopo = { to: string; rotulo: string; Icone: LucideIcon; /** Caminhos em que o link aparece ativo. */ ativoEm: RegExp };

const LINKS: Record<Papel, LinkTopo[]> = {
  MESTRE: [
    { to: "/mestre/grupos", rotulo: "Grupos", Icone: Shield, ativoEm: /^\/mestre\/(grupos|fichas)/ },
    { to: "/mestre", rotulo: "Classes", Icone: Layers, ativoEm: /^\/mestre(\/classes.*)?\/?$/ },
    { to: "/mestre/racas", rotulo: "Raças", Icone: Users, ativoEm: /^\/mestre\/racas/ },
    { to: "/mestre/pericias", rotulo: "Perícias", Icone: ListChecks, ativoEm: /^\/mestre\/pericias/ },
    { to: "/mestre/status", rotulo: "Status", Icone: Activity, ativoEm: /^\/mestre\/status/ },
    { to: "/docs/mestre-visao-geral", rotulo: "Documentação", Icone: BookOpen, ativoEm: /^\/docs/ },
  ],
  JOGADOR: [
    { to: "/jogador", rotulo: "Minhas fichas", Icone: ScrollText, ativoEm: /^\/jogador/ },
    { to: "/docs/jogador-entrar", rotulo: "Documentação", Icone: BookOpen, ativoEm: /^\/docs/ },
  ],
};

/** Layout das áreas logadas: barra com marca, navegação do papel, perfil e sair. */
export function AppLayout() {
  const { sair } = useAuth();
  const me = useMe();
  const { pathname } = useLocation();
  const links = me.data ? LINKS[me.data.papel] : [];

  return (
    <div className="app">
      <header className="topo">
        <div className="topo__conteudo">
          <Marca />
          <nav className="topo__nav" aria-label="Principal">
            {links.map(({ to, rotulo, Icone, ativoEm }) => {
              const ativo = ativoEm.test(pathname);
              return (
                <Link key={to} to={to} className={`topo__link ${ativo ? "topo__link--ativo" : ""}`} aria-current={ativo ? "page" : undefined}>
                  <Icone size={16} aria-hidden />
                  <span>{rotulo}</span>
                </Link>
              );
            })}
          </nav>
          <div className="topo__usuario">
            {me.data && (
              <Link to="/perfil" className={`topo__perfil ${pathname === "/perfil" ? "topo__link--ativo" : ""}`} title="Meu perfil">
                <Avatar url={me.data.fotoUrl} nome={me.data.nome} tamanho={28} />
                <span className="topo__nome">{me.data.nome || `@${me.data.nickname}`}</span>
                <span className="topo__papel">{me.data.papel === "MESTRE" ? "Mestre" : "Jogador"}</span>
              </Link>
            )}
            <Button pequeno variante="fantasma" onClick={sair} aria-label="Sair" title="Sair">
              <LogOut size={16} aria-hidden />
            </Button>
          </div>
        </div>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
