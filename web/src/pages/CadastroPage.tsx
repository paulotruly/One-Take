import { Crown, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth, type Papel } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Marca } from "../components/ui/Marca";
import { Loading } from "../components/ui/States";
import { errosDeCampo, mensagemDeErro } from "../lib/api";
import { useRegras } from "../features/docs/regras";
import { CodigoRecuperacao } from "../features/conta/components/CodigoRecuperacao";

const OPCOES: { papel: Papel; titulo: string; descricao: string; Icone: typeof Crown }[] = [
  { papel: "JOGADOR", titulo: "Jogador", descricao: "Interface simples: crio fichas e entro nos grupos com o código do mestre.", Icone: User },
  { papel: "MESTRE", titulo: "Mestre", descricao: "Também carrega a interface de mestre: crio o mundo e conduzo os grupos. Continuo podendo jogar.", Icone: Crown },
];

export function CadastroPage() {
  const { session, cadastrar } = useAuth();
  const navigate = useNavigate();
  const [papel, setPapel] = useState<Papel>("JOGADOR");
  const [nickname, setNickname] = useState("");
  const [codigo, setCodigo] = useState<{ codigoRecuperacao: string; entrar: () => Promise<void> } | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const { conta } = useRegras();
  const [hoje] = useState(() => new Date());
  // Data mais recente aceita no seletor (a conferência de verdade é na API).
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  const maxNascimento = `${hoje.getFullYear() - conta.idadeMinima}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(hoje.getDate())}`;
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  if (session === undefined) return <Loading />;
  if (session) return <Navigate to="/area" replace />;

  if (codigo) {
    return (
      <div className="login">
        <div className="login__cartao form">
          <div className="login__topo">
            <Marca />
            <div>
              <h1>Conta criada</h1>
              <p className="pagina__subtitulo">Antes de entrar, guarde o seu código de recuperação.</p>
            </div>
          </div>
          {erro && <div className="aviso" role="alert">{erro}</div>}
          <CodigoRecuperacao
            codigo={codigo.codigoRecuperacao}
            rotulo="Entrar no One-Take"
            onContinuar={() => codigo.entrar().then(() => navigate("/area", { replace: true }), (err) => setErro(mensagemDeErro(err)))}
          />
        </div>
      </div>
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setErros({});
    if (!/^@?[a-zA-Z0-9_.-]{3,20}$/.test(nickname.trim())) {
      return setErro("Nome de usuário: 3 a 20 caracteres, só letras sem acento, números, ponto, hífen ou _.");
    }
    if (!dataNascimento) return setErro("Informe a sua data de nascimento.");
    if (dataNascimento > maxNascimento) return setErro(`É preciso ter pelo menos ${conta.idadeMinima} anos para criar uma conta.`);
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    setEnviando(true);
    try {
      setCodigo(await cadastrar({ nickname, senha, papel, dataNascimento }));
    } catch (err) {
      setErros(errosDeCampo(err));
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
            <p className="pagina__subtitulo">Escolha a interface. Dá para ativar a de mestre depois, quando quiser.</p>
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

        <Field rotulo="Nome de usuário" erro={erros.nickname} dica="É com ele que você entra e aparece para os outros. Ex.: @paulo">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={21} autoComplete="username" placeholder="@seu_usuario" required />
        </Field>
        <Field rotulo="Data de nascimento" erro={erros.dataNascimento} dica={`É preciso ter pelo menos ${conta.idadeMinima} anos. Só você vê.`}>
          <input type="date" autoComplete="bday" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} min="1900-01-01" max={maxNascimento} required />
        </Field>
        <Field rotulo="Senha" erro={erros.senha} dica="Mínimo de 6 caracteres.">
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
