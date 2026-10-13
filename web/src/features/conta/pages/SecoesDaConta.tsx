// Seções de Configurações da conta: código de recuperação, seus dados e (discreta, no fim) excluir a conta.
import { BadgeCheck, Download, KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, type Me } from "../../../auth/AuthProvider";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useExcluirConta, useExportarDados, useGerarCodigo, useOcultarVerificados } from "../api";
import { CodigoRecuperacao } from "../components/CodigoRecuperacao";

const dataPorExtenso = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function SecaoRecuperacao({ me }: { me: Me }) {
  const gerar = useGerarCodigo();
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");

  function fechar() {
    setAberto(false);
    setSenha("");
    gerar.reset();
  }

  return (
    <section id="recuperacao" className="secao secao-conta">
      <h2><KeyRound size={18} aria-hidden /> Código de recuperação</h2>
      <p className="pagina__subtitulo">
        Se você esquecer a senha, entra em "Esqueceu a senha?" no login e usa este código para escolher uma nova.
      </p>
      {me.codigoRecuperacaoEm ? (
        <p>Código atual gerado em {dataPorExtenso(me.codigoRecuperacaoEm)}.</p>
      ) : (
        <div className="aviso" role="status">Sua conta ainda não tem código de recuperação. Sem ele não dá para recuperar a senha.</div>
      )}
      <div>
        <Button onClick={() => setAberto(true)}>{me.codigoRecuperacaoEm ? "Gerar um código novo" : "Gerar código"}</Button>
      </div>

      <Modal aberto={aberto} onFechar={fechar} titulo="Código de recuperação">
        {gerar.isSuccess ? (
          <CodigoRecuperacao codigo={gerar.data.codigoRecuperacao} rotulo="Concluir" onContinuar={fechar} />
        ) : (
          <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); gerar.mutate(senha); }}>
            {me.codigoRecuperacaoEm && <p className="pagina__subtitulo">O código anterior deixa de valer.</p>}
            <Field rotulo="Sua senha" erro={errosDeCampo(gerar.error).senha} dica="Para confirmar que é você.">
              <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
            </Field>
            {gerar.isError && !errosDeCampo(gerar.error).senha && <div className="aviso">{mensagemDeErro(gerar.error)}</div>}
            <div className="modal__acoes">
              <Button onClick={fechar}>Cancelar</Button>
              <Button type="submit" variante="primario" disabled={!senha || gerar.isPending}>{gerar.isPending ? "Gerando…" : "Gerar código"}</Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}

/** Mostrar ou esconder o conteúdo verificado (classes, raças, itens, criaturas, NPCs... prontos do One-Take). */
export function SecaoVerificados({ me }: { me: Me }) {
  const ocultar = useOcultarVerificados();
  const oculto = !!me.ocultarVerificados;
  return (
    <section className="secao secao-conta">
      <h2><BadgeCheck size={18} aria-hidden /> Conteúdo verificado</h2>
      <p className="pagina__subtitulo">
        O conteúdo verificado do One-Take aparece para todo mestre, só leitura: dá para usar nos grupos e duplicar.
        Se preferir trabalhar só com o que é seu, esconda. O que já está em uso nos seus grupos e fichas continua funcionando.
      </p>
      <label className="checklist__item">
        <input type="checkbox" checked={oculto} disabled={ocultar.isPending} onChange={(e) => ocultar.mutate(e.target.checked)} />
        <span>Ocultar o conteúdo verificado da minha interface</span>
      </label>
      {ocultar.isError && <div className="aviso">{mensagemDeErro(ocultar.error)}</div>}
    </section>
  );
}

export function SecaoDados({ me }: { me: Me }) {
  const exportar = useExportarDados();
  return (
    <section className="secao secao-conta">
      <h2><Download size={18} aria-hidden /> Seus dados</h2>
      <p className="pagina__subtitulo">
        Data de nascimento: {me.dataNascimento ? dataPorExtenso(me.dataNascimento) : "não informada (conta criada antes dessa regra)"}. Só você vê.
      </p>
      <p className="pagina__subtitulo">
        Baixe um arquivo com tudo o que está na sua conta: perfil, fichas (inclusive as arquivadas) e o que você criou como mestre.
      </p>
      <div>
        <Button onClick={() => exportar.mutate()} disabled={exportar.isPending}>
          <Download size={16} aria-hidden /> {exportar.isPending ? "Preparando…" : "Baixar meus dados (JSON)"}
        </Button>
      </div>
      {exportar.isError && <div className="aviso">{mensagemDeErro(exportar.error)}</div>}
    </section>
  );
}

/** Discreta de propósito: um link pequeno no fim da página; o aviso completo fica no pop-up. */
export function SecaoExcluirConta({ me }: { me: Me }) {
  const excluir = useExcluirConta();
  const { sair } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [entendi, setEntendi] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [senha, setSenha] = useState("");
  const erros = errosDeCampo(excluir.error);

  function fechar() {
    setAberto(false);
    setEntendi(false);
    setConfirmacao("");
    setSenha("");
    excluir.reset();
  }

  function confirmar() {
    excluir.mutate({ senha, confirmacao }, {
      onSuccess: async () => {
        await sair();
        navigate("/conta-excluida", { replace: true });
      },
    });
  }

  return (
    <section className="secao-conta secao-conta--discreta">
      <p className="pagina__subtitulo">
        <button type="button" className="link-botao link-botao--discreto" onClick={() => setAberto(true)}>Excluir minha conta</button>
      </p>

      <Modal aberto={aberto} onFechar={fechar} titulo="Excluir minha conta">
        <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); confirmar(); }}>
          <p>A exclusão é imediata e não pode ser desfeita. Será apagado:</p>
          <ul className="lista-consequencias">
            <li>seu perfil, nome de usuário e login;</li>
            <li>suas fichas, inclusive as arquivadas;</li>
            <li>os grupos que você mestra (os jogadores ficam com uma cópia arquivada das fichas deles);</li>
            <li>tudo o que você criou como mestre: classes, raças, perícias, atributos, status, itens, bestiário, NPCs e kits.</li>
          </ul>
          <p className="pagina__subtitulo">
            As cópias arquivadas dos jogadores guardam os textos seus usados nas fichas deles (classe, raça, cartas e itens), sem o seu nome de usuário.
            Se quiser, baixe seus dados antes.
          </p>
          <label className="checklist__item">
            <input type="checkbox" checked={entendi} onChange={(e) => setEntendi(e.target.checked)} />
            <span>Entendi que a exclusão é definitiva.</span>
          </label>
          <Field rotulo={`Digite o seu nome de usuário (${me.nickname})`} erro={erros.confirmacao}>
            <input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoComplete="off" />
          </Field>
          <Field rotulo="Sua senha" erro={erros.senha}>
            <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Field>
          {excluir.isError && !erros.senha && !erros.confirmacao && <div className="aviso">{mensagemDeErro(excluir.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={fechar}>Cancelar</Button>
            <Button type="submit" variante="perigo" disabled={!entendi || !senha || !confirmacao || excluir.isPending}>
              {excluir.isPending ? "Excluindo…" : "Excluir minha conta"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
