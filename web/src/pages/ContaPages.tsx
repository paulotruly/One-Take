// Páginas da conta abertas sem login: "Esqueceu a senha?" (com o código de recuperação) e a confirmação de conta excluída.
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Marca } from "../components/ui/Marca";
import { CodigoRecuperacao } from "../features/conta/components/CodigoRecuperacao";
import { api, errosDeCampo, mensagemDeErro } from "../lib/api";

function Cartao({ titulo, subtitulo, children }: { titulo: string; subtitulo?: ReactNode; children: ReactNode }) {
  return (
    <div className="login">
      <div className="login__cartao form">
        <div className="login__topo">
          <Marca />
          <div>
            <h1>{titulo}</h1>
            {subtitulo && <p className="pagina__subtitulo">{subtitulo}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function RecuperarSenhaPage() {
  const { sair } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [repetir, setRepetir] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [novoCodigo, setNovoCodigo] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setErros({});
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== repetir) return setErro("As duas senhas não são iguais.");
    setEnviando(true);
    try {
      const r = await api<{ codigoRecuperacao: string }>("/api/senha/recuperar", { method: "POST", body: { nickname: usuario.trim(), codigo, senha } });
      await sair(); // a sessão deste navegador (se houver) também deixou de valer
      setNovoCodigo(r.codigoRecuperacao);
    } catch (err) {
      setErros(errosDeCampo(err));
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <Cartao titulo="Senha alterada">
        <div className="resultado resultado--ok" role="status">
          <CheckCircle2 size={18} aria-hidden /> <span>Pronto. As sessões abertas em outros aparelhos foram encerradas.</span>
        </div>
        <Link to="/login" className="btn btn--primario">Entrar com a nova senha</Link>
      </Cartao>
    );
  }

  if (novoCodigo) {
    return (
      <Cartao titulo="Senha alterada" subtitulo="O código que você usou deixou de valer. Guarde o novo:">
        <CodigoRecuperacao codigo={novoCodigo} onContinuar={() => setConcluido(true)} />
      </Cartao>
    );
  }

  return (
    <Cartao titulo="Esqueceu a senha?" subtitulo="Use o código de recuperação que você guardou ao criar a conta.">
      <form className="form" onSubmit={enviar}>
        <Field rotulo="Nome de usuário" erro={erros.nickname}>
          <input autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="@seu_usuario" required autoFocus />
        </Field>
        <Field rotulo="Código de recuperação" erro={erros.codigo} dica="Ex.: 7KQ2M-9XH4T-AB3CD-EF5GH. Maiúsculas e hífens não importam.">
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" spellCheck={false} required />
        </Field>
        <Field rotulo="Nova senha" erro={erros.senha} dica="Mínimo de 6 caracteres.">
          <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} required />
        </Field>
        <Field rotulo="Repita a nova senha">
          <input type="password" autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} required />
        </Field>
        {erro && <div className="aviso" role="alert">{erro}</div>}
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar nova senha"}</Button>
      </form>
      <p className="pagina__subtitulo">
        Perdeu o código? Escreva para <a href="mailto:rpgonetake@gmail.com">rpgonetake@gmail.com</a>. <Link to="/login">Voltar ao login</Link>
      </p>
    </Cartao>
  );
}

export function ContaExcluidaPage() {
  return (
    <Cartao titulo="Conta excluída">
      <div className="resultado resultado--ok" role="status">
        <CheckCircle2 size={18} aria-hidden /> <span>Sua conta e os seus dados foram excluídos. Obrigado por ter jogado.</span>
      </div>
      <Link to="/" className="btn">Ir para o início</Link>
    </Cartao>
  );
}
