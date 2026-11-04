// Perfil público: nome de usuário, nome e foto.
import { useState, type FormEvent } from "react";
import { normalizarNickname, useEditarPerfil, type Me } from "../../../auth/AuthProvider";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { erroDeFormulario, errosDeCampo } from "../../../lib/api";

export function SecaoPerfil({ me }: { me: Me }) {
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
    <section id="perfil" className="secao">
      <div className="perfil-cabecalho">
        <Avatar url={fotoUrl.trim() || null} nome={nome} tamanho={72} />
        <div>
          <h2>{nome.trim() || `@${normalizarNickname(nickname)}`}</h2>
          <p className="pagina__subtitulo">
            @{me.nickname} · {me.papel === "MESTRE" ? "Mestre e jogador" : "Jogador"}
          </p>
        </div>
      </div>

      <form className="form" noValidate onSubmit={enviar}>
        <Field rotulo="Nome de usuário" erro={erros.nickname} dica="Usado para entrar. Se mudar, passe a entrar com o novo.">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={21} autoComplete="username" />
        </Field>
        <Field rotulo="Nome (opcional)" erro={erros.nome} dica="Se preenchido, aparece no lugar do @usuario.">
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

    </section>
  );
}
