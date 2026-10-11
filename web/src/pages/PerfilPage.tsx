import { useState, type FormEvent } from "react";
import { normalizarNickname, useEditarPerfil, useMe, type Me } from "../auth/AuthProvider";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { ErrorState, Loading } from "../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../lib/api";

export function PerfilPage() {
  const me = useMe();
  if (me.isPending) return <Loading texto="Carregando perfil…" />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  return <FormularioPerfil me={me.data} />;
}

function FormularioPerfil({ me }: { me: Me }) {
  const editar = useEditarPerfil();
  const [nickname, setNickname] = useState(me.nickname);
  const [nome, setNome] = useState(me.nome ?? "");
  const [fotoUrl, setFotoUrl] = useState(me.fotoUrl ?? "");
  const [salvo, setSalvo] = useState(false);
  const erros = errosDeCampo(editar.error);

  function enviar(e: FormEvent) {
    e.preventDefault();
    setSalvo(false);
    editar.mutate(
      { nickname: normalizarNickname(nickname), nome: nome.trim() || null, fotoUrl: fotoUrl.trim() || null },
      { onSuccess: () => setSalvo(true) },
    );
  }

  return (
    <div className="pagina pagina--estreita">
      <div className="perfil-cabecalho">
        <Avatar url={fotoUrl.trim() || null} nome={nome} tamanho={72} />
        <div>
          <h1>{nome.trim() || `@${normalizarNickname(nickname)}`}</h1>
          <p className="pagina__subtitulo">
            @{me.nickname} · {me.papel === "MESTRE" ? "Mestre" : "Jogador"}
          </p>
        </div>
      </div>

      <form className="form" noValidate onSubmit={enviar}>
        <Field rotulo="Nickname" erro={erros.nickname} dica="Usado para entrar. Se mudar, passe a entrar com o novo.">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={21} autoComplete="username" />
        </Field>
        <Field rotulo="Nome (opcional)" erro={erros.nome} dica="Se preenchido, aparece no lugar do @nickname.">
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
        </Field>
        <Field rotulo="Link da foto de perfil" erro={erros.fotoUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
          <input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://" />
        </Field>
        {editar.isError && <div className="aviso">{erroDeFormulario(editar.error)}</div>}
        {salvo && <p className="sucesso">Perfil salvo.</p>}
        <div>
          <Button type="submit" variante="primario" disabled={editar.isPending}>
            {editar.isPending ? "Salvando…" : "Salvar perfil"}
          </Button>
        </div>
      </form>
    </div>
  );
}
