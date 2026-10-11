// Bloco da galeria com as classes-conceito do mestre (container: dados + modais).
import { GitBranch, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useConceitos, useCriarConceito, useEditarConceito, useExcluirConceito } from "../api";
import type { Conceito } from "../types";

export function ConceitosSecao() {
  const conceitos = useConceitos();
  const criar = useCriarConceito();
  const editar = useEditarConceito();
  const excluir = useExcluirConceito();
  const [emEdicao, setEmEdicao] = useState<Conceito | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<Conceito | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const salvando = emEdicao ? editar : criar;

  function abrir(c: Conceito | null) {
    criar.reset();
    editar.reset();
    setTitulo(c?.titulo ?? "");
    setDescricao(c?.descricao ?? "");
    setEmEdicao(c);
  }
  const fechar = () => setEmEdicao(undefined);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const dados = { titulo, descricao };
    if (emEdicao) editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar });
    else criar.mutate(dados, { onSuccess: fechar });
  }

  return (
    <section className="secao">
      <div className="secao__cabecalho">
        <div>
          <h2>Classes-conceito</h2>
          <p className="pagina__subtitulo">
            Uma classe generalista (ex.: Bruxa) com subclasses (Bruxa elemental, Bruxa assombrosa). O jogador escolhe a subclasse.
          </p>
        </div>
        <Button onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden /> Nova classe-conceito
        </Button>
      </div>

      {conceitos.isPending ? (
        <Loading compacto />
      ) : conceitos.isError ? (
        <ErrorState mensagem={mensagemDeErro(conceitos.error)} onTentarNovamente={() => conceitos.refetch()} />
      ) : conceitos.data.length === 0 ? (
        <p className="pagina__subtitulo">Nenhuma classe-conceito ainda.</p>
      ) : (
        <ul className="conceitos">
          {conceitos.data.map((c) => (
            <li key={c.id} className="conceito">
              <div className="conceito__topo">
                <h3><GitBranch size={18} aria-hidden /> {c.titulo}</h3>
                <div className="pericia__acoes">
                  <Button pequeno variante="fantasma" onClick={() => abrir(c)}>Editar</Button>
                  <Button pequeno variante="fantasma" onClick={() => { excluir.reset(); setAExcluir(c); }}>Excluir</Button>
                </div>
              </div>
              <p className="pericia__descricao">{c.descricao}</p>
              <div className="conceito__subclasses">
                {c.subclasses.length === 0 ? (
                  <span className="aviso-inline">Sem subclasses ainda: crie pelo menos uma.</span>
                ) : (
                  c.subclasses.map((s) => (
                    <Link key={s.id} to={`/mestre/classes/${s.id}`} className="conceito__subclasse">{s.titulo}</Link>
                  ))
                )}
                <Link to={`/mestre/classes/nova?conceito=${c.id}`} className="btn btn--pequeno">
                  <Plus size={14} aria-hidden /> Subclasse
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? "Editar classe-conceito" : "Nova classe-conceito"}>
        <form className="form" noValidate onSubmit={enviar}>
          <Field rotulo="Título" erro={errosDeCampo(salvando.error).titulo}>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} autoFocus placeholder="Ex.: Bruxa" />
          </Field>
          <Field rotulo="Descrição" erro={errosDeCampo(salvando.error).descricao}>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} rows={4} />
          </Field>
          {salvando.isError && <div className="aviso">{erroDeFormulario(salvando.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={fechar} disabled={salvando.isPending}>Cancelar</Button>
            <Button type="submit" variante="primario" disabled={salvando.isPending}>{salvando.isPending ? "Salvando…" : "Salvar"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir classe-conceito"
        mensagem={<>Excluir <strong>{aExcluir?.titulo}</strong>? As {aExcluir?.subclasses.length ?? 0} subclasses continuam existindo como classes avulsas.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </section>
  );
}
