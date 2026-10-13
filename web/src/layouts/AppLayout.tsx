import { Activity, Backpack, ChevronDown, Crown, Gamepad2, Layers, ListChecks, LogOut, Menu, Package, Settings, PawPrint, ScrollText, Shield, UserPen, UserRound, Users, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Rodape } from "../components/layout/Rodape";
import { SeletorKit } from "../features/kits/components/SeletorKit";
import { interfaceLembrada, lembrarInterface, useAuth, useMe, type Papel } from "../auth/AuthProvider";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Marca } from "../components/ui/Marca";

type LinkTopo = { to: string; rotulo: string; Icone: LucideIcon; /** Caminhos em que o link aparece ativo. */ ativoEm: RegExp };

const LINKS: Record<Papel, LinkTopo[]> = {
  MESTRE: [
    { to: "/mestre/grupos", rotulo: "Grupos", Icone: Shield, ativoEm: /^\/mestre\/(grupos|fichas)/ },
    { to: "/mestre/kits", rotulo: "Kits de RPG", Icone: Package, ativoEm: /^\/mestre\/kits/ },
    { to: "/mestre", rotulo: "Classes", Icone: Layers, ativoEm: /^\/mestre(\/classes.*)?\/?$/ },
    { to: "/mestre/racas", rotulo: "Raças", Icone: Users, ativoEm: /^\/mestre\/racas/ },
    { to: "/mestre/npcs", rotulo: "NPCs", Icone: UserRound, ativoEm: /^\/mestre\/npcs/ },
    { to: "/mestre/bestiario", rotulo: "Bestiário", Icone: PawPrint, ativoEm: /^\/mestre\/bestiario/ },
    { to: "/mestre/itens", rotulo: "Itens", Icone: Backpack, ativoEm: /^\/mestre\/itens/ },
    { to: "/mestre/pericias", rotulo: "Perícias", Icone: ListChecks, ativoEm: /^\/mestre\/pericias/ },
    { to: "/mestre/status", rotulo: "Status", Icone: Activity, ativoEm: /^\/mestre\/status/ },
  ],
  JOGADOR: [
    { to: "/jogador", rotulo: "Minhas fichas", Icone: ScrollText, ativoEm: /^\/jogador/ },
  ],
};

/**
 * Layout das áreas logadas: marca, navegação da interface atual, troca mestre/jogador, perfil e sair.
 * Toda conta joga; quem ativou a interface de mestre alterna entre as duas.
 */
export function AppLayout() {
  const { sair } = useAuth();
  const me = useMe();
  const { pathname } = useLocation();
  // Em páginas comuns (perfil, ativar mestre) continua a interface em que a pessoa estava.
  const area: Papel = pathname.startsWith("/mestre")
    ? "MESTRE"
    : pathname.startsWith("/jogador")
      ? "JOGADOR"
      : me.data?.papel === "MESTRE" && interfaceLembrada() === "MESTRE"
        ? "MESTRE"
        : "JOGADOR";
  const links = me.data ? LINKS[area] : [];
  const ehMestre = me.data?.papel === "MESTRE";

  // Gaveta do celular: fecha ao trocar de página.
  const [menuAberto, setMenuAberto] = useState(false);
  const [caminhoDoMenu, setCaminhoDoMenu] = useState(pathname);
  if (caminhoDoMenu !== pathname) {
    setCaminhoDoMenu(pathname);
    setMenuAberto(false);
  }

  useEffect(() => {
    if (pathname.startsWith("/mestre")) lembrarInterface("MESTRE");
    else if (pathname.startsWith("/jogador")) lembrarInterface("JOGADOR");
  }, [pathname]);

  const troca =
    area === "MESTRE"
      ? { to: "/jogador", rotulo: "Jogar", Icone: Gamepad2, titulo: "Ir para a interface de jogador (suas fichas)" }
      : { to: ehMestre ? "/mestre/grupos" : "/ativar-mestre", rotulo: "Mestrar", Icone: Crown, titulo: ehMestre ? "Ir para a interface de mestre" : "Ativar a interface de mestre" };

  return (
    <div className="app">
      <header className="topo">
        <div className="topo__conteudo">
          <Button
            pequeno
            variante="fantasma"
            className="topo__menu"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="navegacao-lateral"
            onClick={() => setMenuAberto((a) => !a)}
          >
            {menuAberto ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </Button>
          <Marca />
          <div className="topo__usuario">
            {me.data && (
              <Link to={troca.to} className="topo__troca" title={troca.titulo}>
                <troca.Icone size={16} aria-hidden />
                <span>{troca.rotulo}</span>
              </Link>
            )}
            {me.data ? (
              <MenuPerfil
                ativo={pathname === "/perfil" || pathname === "/conta"}
                onSair={sair}
                rotulo={
                  <>
                    <Avatar url={me.data.fotoUrl} nome={me.data.nome} tamanho={28} />
                    <span className="topo__nome">{me.data.nome || `@${me.data.nickname}`}</span>
                    <span className="topo__papel">{area === "MESTRE" ? "Mestre" : "Jogador"}</span>
                    <ChevronDown size={14} aria-hidden />
                  </>
                }
              />
            ) : (
              <Button pequeno variante="fantasma" onClick={sair} aria-label="Sair" title="Sair">
                <LogOut size={16} aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="app__corpo">
        {/* Navegação lateral; no celular vira uma gaveta aberta pelo botão de menu. */}
        <nav id="navegacao-lateral" className={`lateral ${menuAberto ? "lateral--aberta" : ""}`} aria-label="Principal">
          {area === "MESTRE" && ehMestre && <SeletorKit />}
          {links.map(({ to, rotulo, Icone, ativoEm }) => {
            const ativo = ativoEm.test(pathname);
            return (
              <Link key={to} to={to} className={`lateral__link ${ativo ? "lateral__link--ativo" : ""}`} aria-current={ativo ? "page" : undefined}>
                <Icone size={18} aria-hidden />
                <span>{rotulo}</span>
              </Link>
            );
          })}
        </nav>
        {menuAberto && <div className="lateral__fundo" aria-hidden onClick={() => setMenuAberto(false)} />}
        <main className="conteudo">
          {me.data && !me.data.codigoRecuperacaoEm && pathname !== "/conta" && (
            <p className="aviso-email" role="status">
              Sua conta não tem código de recuperação: sem ele não dá para trocar a senha se você esquecer.{" "}
              <Link to="/conta">Gerar código</Link>
            </p>
          )}
          <Outlet />
        </main>
      </div>
      <Rodape />
    </div>
  );
}

/** Botão do perfil no topo: abre um menu com "Editar perfil", "Configurações da conta" e "Sair". Fecha com clique fora ou Esc. */
function MenuPerfil({ rotulo, ativo, onSair }: { rotulo: ReactNode; ativo: boolean; onSair: () => void }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div className="menu-perfil" ref={ref}>
      <button
        type="button"
        className={`topo__perfil ${ativo ? "topo__link--ativo" : ""}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title="Meu perfil"
        onClick={() => setAberto((a) => !a)}
      >
        {rotulo}
      </button>
      {aberto && (
        <div className="menu-perfil__lista" role="menu">
          <Link to="/perfil" role="menuitem" className="menu-perfil__item" onClick={() => setAberto(false)}>
            <UserPen size={16} aria-hidden /> Editar perfil
          </Link>
          <Link to="/conta" role="menuitem" className="menu-perfil__item" onClick={() => setAberto(false)}>
            <Settings size={16} aria-hidden /> Configurações da conta
          </Link>
          <button type="button" role="menuitem" className="menu-perfil__item" onClick={() => { setAberto(false); onSair(); }}>
            <LogOut size={16} aria-hidden /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
