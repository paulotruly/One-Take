// Bloco de "conceitos" (arquétipo, arquétipo de raça, arquétipo de criatura): lista, criar, editar e excluir.
// Recebe os dados e as mutações de quem usa; aqui só ficam o desenho e o estado dos modais.
import { GitBranch, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Visao } from "../../verificados/types";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";

export type ConceitoVisao = Visao & { id: string; titulo: string; descricao: string; filhos: { id: string; titulo: string }[] };
type Dados = { titulo: string; descricao: string };

type Props = {
  /** Ex.: "Arquétipos". */
  titulo: string;
  /** Ex.: "arquétipo". */
  nome: string;
  explicacao: string;
  exemplo: string;
  /** Ex.: "Subclasse", "Sub-raça", "Forma". */
  rotuloFilho: string;
  conceitos: ConceitoVisao[] | undefined;
  carregando: boolean;
  erro: unknown;
  onTentarNovamente: () => void;
  hrefFilho: (id: string) => string;
  /** Link para criar uma variação já ligada ao conceito; sem ele, o botão não aparece. */
  hrefNovoFilho?: (conceitoId: string) => string;
  onNovoFilho?: (conceitoId: string) => void;
  criar: UseMutationResult<unknown, Error, Dados>;
  editar: UseMutationResult<unknown, Error, { id: string; dados: Dados }>;
  excluir: UseMutationResult<unknown, Error, string>;
  /** Ações extras por arquétipo (ex.: o botão de verificar). */
  acoesExtra?: (c: ConceitoVisao) => ReactNode;
};

export function ConceitosBloco(p: Props) {
  const [emEdicao, setEmEdicao] = useState<ConceitoVisao | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<ConceitoVisao | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const salvando = emEdicao ? p.editar : p.criar;

  function abrir(c: ConceitoVisao | null) {
    p.criar.reset();
    p.editar.reset();
    setTitulo(c?.titulo ?? "");
    setDescricao(c?.descricao ?? "");
    setEmEdicao(c);
  }
  const fechar = () => setEmEdicao(undefined);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const dados = { titulo, descricao };
    if (emEdicao) p.editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar });
    else p.criar.mutate(dados, { onSuccess: fechar });
  }

  return (
    <section className="secao">
      <div className="secao__cabecalho">
        <div>
          <h2>{p.titulo}</h2>
          <p className="pagina__subtitulo">{p.explicacao}</p>
        </div>
        <Button onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden /> Novo {p.nome}
        </Button>
      </div>

      {p.carregando ? (
        <Loading compacto />
      ) : p.erro ? (
        <ErrorState mensagem={mensagemDeErro(p.erro)} onTentarNovamente={p.onTentarNovamente} />
      ) : !p.conceitos || p.conceitos.length === 0 ? (
        <p className="pagina__subtitulo">Nenhum {p.nome} ainda.</p>
      ) : (
        <ul className="conceitos">
          {p.conceitos.map((c) => (
            <li key={c.id} className="conceito">
              <div className="conceito__topo">
                <h3><GitBranch size={18} aria-hidden /> {c.titulo} {c.verificado && <VerificadoBadge compacto />}</h3>
                {!c.deOutro && (
                  <div className="pericia__acoes">
                    <Button pequeno variante="fantasma" onClick={() => abrir(c)}>Editar</Button>
                    <Button pequeno variante="fantasma" onClick={() => { p.excluir.reset(); setAExcluir(c); }}>Excluir</Button>
                    {p.acoesExtra?.(c)}
                  </div>
                )}
              </div>
              <p className="pericia__descricao">{c.descricao}</p>
              <div className="conceito__subclasses">
                {c.filhos.length === 0 && !c.deOutro ? (
                  <span className="aviso-inline">Sem {p.rotuloFilho.toLowerCase()} ainda: crie pelo menos uma.</span>
                ) : (
                  c.filhos.map((s) => (
                    <Link key={s.id} to={p.hrefFilho(s.id)} className="conceito__subclasse">{s.titulo}</Link>
                  ))
                )}
                {p.hrefNovoFilho && !c.deOutro && (
                  <Link to={p.hrefNovoFilho(c.id)} className="btn btn--pequeno">
                    <Plus size={14} aria-hidden /> {p.rotuloFilho}
                  </Link>
                )}
                {p.onNovoFilho && !c.deOutro && (
                  <Button pequeno onClick={() => p.onNovoFilho!(c.id)}>
                    <Plus size={14} aria-hidden /> {p.rotuloFilho}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? `Editar ${p.nome}` : `Novo ${p.nome}`}>
        <form className="form" noValidate onSubmit={enviar}>
          <Field rotulo="Título" erro={errosDeCampo(salvando.error).titulo}>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} autoFocus placeholder={p.exemplo} />
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
        titulo={`Excluir ${p.nome}`}
        mensagem={<>Excluir <strong>{aExcluir?.titulo}</strong>? As {aExcluir?.filhos.length ?? 0} variações continuam existindo, sem arquétipo.</>}
        processando={p.excluir.isPending}
        erro={p.excluir.isError ? mensagemDeErro(p.excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && p.excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </section>
  );
}
