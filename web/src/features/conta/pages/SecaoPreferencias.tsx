// Preferências deste navegador e troca de senha com a conta logada.
import { KeyRound, SlidersHorizontal } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { erroDeFormulario, errosDeCampo } from "../../../lib/api";
import { gravarPreferencias, lerPreferencias, type Preferencias } from "../../../lib/preferencias";
import { useAlterarSenha } from "../api";

export function SecaoPreferencias({ ehMestre }: { ehMestre: boolean }) {
  const [p, setP] = useState<Preferencias>(lerPreferencias);

  function mudar(novo: Partial<Preferencias>) {
    const proximas = { ...p, ...novo };
    setP(proximas);
    gravarPreferencias(proximas);
  }

  return (
    <section id="preferencias" className="secao secao-conta">
      <h2><SlidersHorizontal size={18} aria-hidden /> Preferências</h2>
      <p className="pagina__subtitulo">Valem só neste navegador.</p>
      <div className="form__linha">
        <Field rotulo="Tamanho do texto">
          <select value={p.texto} onChange={(e) => mudar({ texto: e.target.value as Preferencias["texto"] })}>
            <option value="normal">Normal</option>
            <option value="grande">Grande</option>
          </select>
        </Field>
        <Field rotulo="Densidade">
          <select value={p.densidade} onChange={(e) => mudar({ densidade: e.target.value as Preferencias["densidade"] })}>
            <option value="normal">Normal</option>
            <option value="compacta">Compacta</option>
          </select>
        </Field>
        {ehMestre && (
          <Field rotulo="Ao entrar, abrir">
            <select value={p.interfaceInicial} onChange={(e) => mudar({ interfaceInicial: e.target.value as Preferencias["interfaceInicial"] })}>
              <option value="ultima">A última interface usada</option>
              <option value="MESTRE">Mestre</option>
              <option value="JOGADOR">Jogador</option>
            </select>
          </Field>
        )}
      </div>
    </section>
  );
}

export function SecaoSenha() {
  const alterar = useAlterarSenha();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salva, setSalva] = useState(false);
  const erros = errosDeCampo(alterar.error);
  const diferentes = confirmacao !== "" && confirmacao !== senhaNova;

  function enviar(e: FormEvent) {
    e.preventDefault();
    setSalva(false);
    if (senhaNova !== confirmacao) return;
    alterar.mutate({ senhaAtual, senhaNova }, {
      onSuccess: () => {
        setSalva(true);
        setSenhaAtual("");
        setSenhaNova("");
        setConfirmacao("");
      },
    });
  }

  return (
    <section id="senha" className="secao secao-conta">
      <h2><KeyRound size={18} aria-hidden /> Trocar a senha</h2>
      <p className="pagina__subtitulo">Você continua conectado aqui. Outros aparelhos precisam entrar de novo.</p>
      <form className="form" noValidate onSubmit={enviar}>
        <Field rotulo="Senha atual" erro={erros.senhaAtual}>
          <input type="password" autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
        </Field>
        <Field rotulo="Senha nova" erro={erros.senhaNova}>
          <input type="password" autoComplete="new-password" value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} />
        </Field>
        <Field rotulo="Repita a senha nova" erro={diferentes ? "As senhas não são iguais" : undefined}>
          <input type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
        </Field>
        {alterar.isError && !erros.senhaAtual && !erros.senhaNova && <div className="aviso">{erroDeFormulario(alterar.error)}</div>}
        {salva && <p className="sucesso">Senha trocada.</p>}
        <div>
          <Button type="submit" disabled={!senhaAtual || !senhaNova || !confirmacao || diferentes || alterar.isPending}>
            {alterar.isPending ? "Trocando…" : "Trocar a senha"}
          </Button>
        </div>
      </form>
    </section>
  );
}
