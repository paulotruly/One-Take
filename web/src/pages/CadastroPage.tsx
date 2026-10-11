import { Crown, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth, type Papel } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Marca } from "../components/ui/Marca";
import { Loading } from "../components/ui/States";
import { mensagemDeErro } from "../lib/api";

const OPCOES: { papel: Papel; titulo: string; descricao: string; Icone: typeof Crown }[] = [
  { papel: "JOGADOR", titulo: "Sou jogador", descricao: "Crio fichas e entro nos grupos com o código do mestre.", Icone: User },
  { papel: "MESTRE", titulo: "Sou mestre", descricao: "Crio classes, raças, perícias e conduzo os grupos.", Icone: Crown },
];

export function CadastroPage() {
  const { session, cadastrar } = useAuth();
  const navigate = useNavigate();
  const [papel, setPapel] = useState<Papel>("JOGADOR");
  const [nickname, setNickname] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (session === undefined) return <Loading />;
  if (session) return <Navigate to="/area" replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!/^@?[a-zA-Z0-9_.-]{3,20}$/.test(nickname.trim())) {
      return setErro("Nickname: 3 a 20 caracteres, só letras sem acento, números, ponto, hífen ou _.");
    }
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setEnviando(true);
    try {
      await cadastrar({ nickname, senha, papel });
      navigate("/area", { replace: true });
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
            <h1>Criar conta</h1>
            <p className="pagina__subtitulo">Escolha como você vai usar o One-Take.</p>
          </div>
        </div>

        <div className="escolha-papel" role="radiogroup" aria-label="Tipo de conta">
          {OPCOES.map(({ papel: p, titulo, descricao, Icone }) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={papel === p}
              className={`escolha-papel__opcao ${papel === p ? "escolha-papel__opcao--ativa" : ""}`}
              onClick={() => setPapel(p)}
            >
              <Icone size={22} aria-hidden />
              <strong>{titulo}</strong>
              <span>{descricao}</span>
            </button>
          ))}
        </div>

        <Field rotulo="Nickname" dica="É com ele que você entra e aparece para os outros. Ex.: @paulo">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={21} autoComplete="username" placeholder="@seu_nick" required />
        </Field>
        <Field rotulo="Senha" dica="Mínimo de 6 caracteres.">
          <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} required />
        </Field>
        {erro && <div className="aviso" role="alert">{erro}</div>}
        <Button type="submit" variante="primario" disabled={enviando}>
          {enviando ? "Criando conta…" : "Criar conta"}
        </Button>
        <p className="pagina__subtitulo">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
