// Lista agrupada por "conceito" (arquétipo, arquétipo de raça, arquétipo de criatura): cada um vira um grupo com suas variações
// embaixo, e o que não tem conceito fica em "Sem arquétipo". Recebe os dados e as mutações de quem usa; aqui só ficam o desenho e o estado dos modais.
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Visao } from "../../verificados/types";
import { AcessoBadge, VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { useOculto } from "../../../lib/useOculto";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";

export type ConceitoVisao = Visao & { id: string; titulo: string; descricao: string; filhos: { id: string; titulo: string }[] };
type Dados = { titulo: string; descricao: string };
type ItemAgrupavel = { id: string; conceito?: { id: string } | null };

type Props<T extends ItemAgrupavel> = {
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
  /** Itens já filtrados pela tela (grupo, kit). */
  itens: T[];
  /** Com filtro ativo, arquétipos sem nenhum item visível ficam de fora. */
  filtrando: boolean;
  renderItens: (itens: T[]) => ReactNode;
  /** Mostrado quando não há nenhum grupo nem item. */
  vazio: ReactNode;
  /** Link para criar uma variação já ligada ao conceito; sem ele, o botão não aparece. */
  hrefNovoFilho?: (conceitoId: string) => string;
  onNovoFilho?: (conceitoId: string) => void;
  criar: UseMutationResult<unknown, Error, Dados>;
  editar: UseMutationResult<unknown, Error, { id: string; dados: Dados }>;
  excluir: UseMutationResult<unknown, Error, string>;
  /** Selo ao lado do nome (com o botão de verificar, para o ADMIN); sem ele, só o selo se for verificado. */
  selo?: (c: ConceitoVisao) => ReactNode;
};

type GrupoProps = {
  chave: string;
  titulo: string;
  total: number;
  avulso?: boolean;
  selo?: ReactNode;
  acoes?: ReactNode;
  descricao?: string;
  children: ReactNode;
};

function GrupoConceito(p: GrupoProps) {
  const [oculto, alternar] = useOculto(p.chave);
  return (
    <section className={`conceito-grupo ${p.avulso ? "conceito-grupo--avulso" : ""}`}>
      <div className="conceito-grupo__cabecalho">
        <h2>
          <button type="button" className="conceito-grupo__alternar" onClick={alternar} aria-expanded={!oculto} title={oculto ? "Mostrar" : "Ocultar"}>
            {oculto ? <ChevronDown size={20} aria-hidden /> : <ChevronUp size={20} aria-hidden />}
            {p.titulo}
            <span className="pagina__subtitulo">({p.total})</span>
          </button>
        </h2>
        {p.selo}
        {p.acoes && <div className="conceito-grupo__acoes">{p.acoes}</div>}
      </div>
      {!oculto && p.descricao && <p className="pagina__subtitulo conceito-grupo__descricao">{p.descricao}</p>}
      {!oculto && p.children}
    </section>
  );
}

export function ConceitosBloco<T extends ItemAgrupavel>(p: Props<T>) {
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

  const conceitos = p.conceitos ?? [];
  const idsConceitos = new Set(conceitos.map((c) => c.id));
  const grupos = conceitos
    .map((c) => ({ conceito: c, itens: p.itens.filter((i) => i.conceito?.id === c.id) }))
    .filter((g) => g.itens.length > 0 || (!p.filtrando && !g.conceito.deOutro));
  // Arquétipo fora da lista (ex.: cópia de item de outro mestre): o item não pode sumir.
  const avulsos = p.itens.filter((i) => !i.conceito || !idsConceitos.has(i.conceito.id));

  return (
    <>
      <div className="conceitos-barra">
        <p className="pagina__subtitulo">{p.explicacao}</p>
        <Button onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden /> Novo {p.nome}
        </Button>
      </div>

      {p.erro ? <ErrorState mensagem={mensagemDeErro(p.erro)} onTentarNovamente={p.onTentarNovamente} /> : null}

      {p.carregando ? (
        <Loading compacto />
      ) : grupos.length === 0 && avulsos.length === 0 ? (
        p.vazio
      ) : grupos.length === 0 ? (
        p.renderItens(avulsos)
      ) : (
        <div className="conceitos-grupos">
          {grupos.map(({ conceito: c, itens }) => (
            <GrupoConceito
              key={c.id}
              chave={`${p.nome}:${c.id}`}
              titulo={c.titulo}
              total={itens.length}
              descricao={c.descricao}
              selo={
                <>
                  {p.selo ? p.selo(c) : c.verificado && <VerificadoBadge />}
                  {(c.deOutro || c.verificado) && <AcessoBadge item={c} />}
                </>
              }
              acoes={
                !c.deOutro && (
                  <>
                    {p.hrefNovoFilho && (
                      <Link to={p.hrefNovoFilho(c.id)} className="btn btn--pequeno">
                        <Plus size={14} aria-hidden /> {p.rotuloFilho}
                      </Link>
                    )}
                    {p.onNovoFilho && (
                      <Button pequeno onClick={() => p.onNovoFilho!(c.id)}>
                        <Plus size={14} aria-hidden /> {p.rotuloFilho}
                      </Button>
                    )}
                    <Button pequeno variante="fantasma" onClick={() => abrir(c)}>Editar</Button>
                    <Button pequeno variante="perigo" onClick={() => { p.excluir.reset(); setAExcluir(c); }}>Excluir</Button>
                  </>
                )
              }
            >
              {itens.length > 0 ? (
                p.renderItens(itens)
              ) : (
                <p className="pagina__subtitulo">
                  {c.filhos.length === 0 ? `Sem ${p.rotuloFilho.toLowerCase()} ainda: crie pelo menos uma.` : "Nenhuma variação visível aqui."}
                </p>
              )}
            </GrupoConceito>
          ))}
          {avulsos.length > 0 && (
            <GrupoConceito chave={`${p.nome}:avulsos`} titulo="Sem arquétipo" total={avulsos.length} avulso>
              {p.renderItens(avulsos)}
            </GrupoConceito>
          )}
        </div>
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
    </>
  );
}
