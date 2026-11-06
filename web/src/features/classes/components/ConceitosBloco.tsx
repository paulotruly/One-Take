// Lista com filtro por "conceito" (arquétipo, arquétipo de raça, arquétipo de criatura): uma linha de filtros no topo
// (Todas, cada arquétipo, Sem arquétipo) e uma grade única embaixo. Com um arquétipo escolhido, aparecem a descrição dele e as
// ações (variação nova, editar, excluir). Recebe os dados e as mutações de quem usa; aqui só ficam o desenho e o estado dos modais.
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";

export type ConceitoVisao = { id: string; titulo: string; descricao: string; filhos: { id: string; titulo: string }[] };
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
  /** Mostrado quando não há nenhum arquétipo nem item. */
  vazio: ReactNode;
  /** Link para criar uma variação já ligada ao conceito; sem ele, o botão não aparece. */
  hrefNovoFilho?: (conceitoId: string) => string;
  onNovoFilho?: (conceitoId: string) => void;
  criar: UseMutationResult<unknown, Error, Dados>;
  editar: UseMutationResult<unknown, Error, { id: string; dados: Dados }>;
  excluir: UseMutationResult<unknown, Error, string>;
};

/** Filtro escolhido: todos, sem arquétipo ou o id de um arquétipo. */
type Filtro = "todos" | "avulsos" | string;

function Chip({ ativo, rotulo, total, onEscolher }: { ativo: boolean; rotulo: string; total: number; onEscolher: () => void }) {
  return (
    <button type="button" className="filtro-chip" aria-pressed={ativo} onClick={onEscolher}>
      {rotulo} <span className="filtro-chip__total">{total}</span>
    </button>
  );
}

export function ConceitosBloco<T extends ItemAgrupavel>(p: Props<T>) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
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
  const doConceito = (id: string) => p.itens.filter((i) => i.conceito?.id === id);
  // Arquétipo fora da lista: o item não pode sumir.
  const avulsos = p.itens.filter((i) => !i.conceito || !idsConceitos.has(i.conceito.id));
  const visiveis = conceitos.filter((c) => !p.filtrando || doConceito(c.id).length > 0);
  // O arquétipo escolhido pode ter sumido (excluído ou fora do filtro da tela): volta para Todas.
  const escolhido = conceitos.find((c) => c.id === filtro) ?? null;
  const atual: Filtro = filtro === "avulsos" || escolhido ? filtro : "todos";
  const lista = atual === "todos" ? p.itens : atual === "avulsos" ? avulsos : doConceito(atual);
  const novo = (
    <Button pequeno variante="fantasma" onClick={() => abrir(null)} title={p.explicacao}>
      <Plus size={14} aria-hidden /> Novo {p.nome}
    </Button>
  );

  return (
    <>
      {p.erro ? <ErrorState mensagem={mensagemDeErro(p.erro)} onTentarNovamente={p.onTentarNovamente} /> : null}

      {p.carregando ? (
        <Loading compacto />
      ) : conceitos.length === 0 && p.itens.length === 0 ? (
        <>
          <div className="conceitos-filtro">{novo}</div>
          {p.vazio}
        </>
      ) : (
        <>
          <div className="conceitos-filtro" role="group" aria-label={`Filtrar por ${p.nome}`}>
            <Chip ativo={atual === "todos"} rotulo="Todas" total={p.itens.length} onEscolher={() => setFiltro("todos")} />
            {visiveis.map((c) => (
              <Chip key={c.id} ativo={atual === c.id} rotulo={c.titulo} total={doConceito(c.id).length} onEscolher={() => setFiltro(c.id)} />
            ))}
            {avulsos.length > 0 && conceitos.length > 0 && (
              <Chip ativo={atual === "avulsos"} rotulo={`Sem ${p.nome}`} total={avulsos.length} onEscolher={() => setFiltro("avulsos")} />
            )}
            {novo}
          </div>

          {escolhido && (
            <div className="conceito-escolhido">
              <p className="pagina__subtitulo conceito-escolhido__descricao">{escolhido.descricao}</p>
              <div className="conceito-escolhido__acoes">
                {p.hrefNovoFilho && (
                  <Link to={p.hrefNovoFilho(escolhido.id)} className="btn btn--pequeno"><Plus size={14} aria-hidden /> {p.rotuloFilho}</Link>
                )}
                {p.onNovoFilho && (
                  <Button pequeno onClick={() => p.onNovoFilho!(escolhido.id)}><Plus size={14} aria-hidden /> {p.rotuloFilho}</Button>
                )}
                <Button pequeno variante="fantasma" onClick={() => abrir(escolhido)}><Pencil size={14} aria-hidden /> Editar {p.nome}</Button>
                <Button pequeno variante="perigoSutil" onClick={() => { p.excluir.reset(); setAExcluir(escolhido); }}><Trash2 size={14} aria-hidden /> Excluir</Button>
              </div>
            </div>
          )}

          {lista.length > 0 ? (
            p.renderItens(lista)
          ) : (
            <p className="pagina__subtitulo">
              {escolhido && escolhido.filhos.length === 0 ? `Sem ${p.rotuloFilho.toLowerCase()} ainda: crie a primeira.` : "Nada para mostrar com este filtro."}
            </p>
          )}
        </>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? `Editar ${p.nome}` : `Novo ${p.nome}`}>
        <form className="form" noValidate onSubmit={enviar}>
          {!emEdicao && <p className="pagina__subtitulo">{p.explicacao}</p>}
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
        mensagem={<>Excluir <strong>{aExcluir?.titulo}</strong>? As {aExcluir?.filhos.length ?? 0} variações continuam existindo, sem {p.nome}.</>}
        processando={p.excluir.isPending}
        erro={p.excluir.isError ? mensagemDeErro(p.excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && p.excluir.mutate(aExcluir.id, { onSuccess: () => { setAExcluir(null); setFiltro("todos"); } })}
      />
    </>
  );
}
