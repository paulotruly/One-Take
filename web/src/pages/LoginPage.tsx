import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { Marca } from "../components/ui/Marca";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Loading } from "../components/ui/States";
import { mensagemDeErro } from "../lib/api";

export function LoginPage() {
  const { session, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de ?? "/area";

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (session === undefined) return <Loading />;
  if (session) return <Navigate to={destino} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(login.trim(), senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="login__cartao form" onSubmit={enviar}>
        <div className="login__topo">
          <Marca />
          <div>
            <h1>Entrar</h1>
            <p className="pagina__subtitulo">Mestres e jogadores entram por aqui.</p>
          </div>
        </div>
        <Field rotulo="Nome de usuário">
          <input autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="@seu_usuario" required autoFocus />
        </Field>
        <Field rotulo="Senha">
          <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </Field>
        <p className="login__esqueci">
          <Link to="/recuperar-senha">Esqueceu a senha?</Link>
        </p>
        {erro && <div className="aviso" role="alert">{erro}</div>}
        <Button type="submit" variante="primario" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </Button>
        <p className="pagina__subtitulo">
          Não tem conta? <Link to="/cadastro">Criar conta</Link> · <Link to="/">Ver as regras</Link>
        </p>
      </form>
    </div>
  );
}
