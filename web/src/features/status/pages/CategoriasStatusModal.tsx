// Container: gerenciar as categorias de status do mestre (criar, editar, excluir). As verificadas de outra pessoa só aparecem.
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { AcessoBadge } from "../../verificados/components/VerificadoBadge";
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { useCategoriasStatus, useCriarCategoriaStatus, useEditarCategoriaStatus, useExcluirCategoriaStatus } from "../api";
import type { CategoriaStatus } from "../types";

export function CategoriasStatusModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const categorias = useCategoriasStatus();
  const criar = useCriarCategoriaStatus();
  const editar = useEditarCategoriaStatus();
  const excluir = useExcluirCategoriaStatus();
  // undefined = lista; null = nova; categoria = editando
  const [emEdicao, setEmEdicao] = useState<CategoriaStatus | null | undefined>(undefined);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const salvando = emEdicao ? editar : criar;

  function abrir(c: CategoriaStatus | null) {
    criar.reset();
    editar.reset();
    setNome(c?.nome ?? "");
    setDescricao(c?.descricao ?? "");
    setEmEdicao(c);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const dados = { nome, descricao };
    const voltar = () => setEmEdicao(undefined);
    if (emEdicao) editar.mutate({ id: emEdicao.id, dados }, { onSuccess: voltar });
    else criar.mutate(dados, { onSuccess: voltar });
  }

  function fechar() {
    setEmEdicao(undefined);
    onFechar();
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo={emEdicao === undefined ? "Categorias de status" : emEdicao ? "Editar categoria" : "Nova categoria"}>
      {emEdicao === undefined ? (
        <div className="form">
          <p className="pagina__subtitulo">
            Agrupe os status do seu jeito (ex.: Elementais, Mentais, Físicos). Na página de status e ao montar um grupo, eles aparecem
            separados por categoria. Excluir uma categoria não apaga os status.
          </p>
          {categorias.isPending ? (
            <Loading compacto />
          ) : (categorias.data ?? []).length === 0 ? (
            <p className="pagina__subtitulo">Nenhuma categoria ainda.</p>
          ) : (
            <ul className="lista-simples">
              {(categorias.data ?? []).map((c) => (
                <li key={c.id} className="categoria-linha">
                  <span className="item__miniatura item__miniatura--icone" aria-hidden><Tags size={18} /></span>
                  <span className="categoria-linha__texto">
                    <strong>{c.nome} <SeloVerificado tipo="categoriaStatus" item={c} /></strong>
                    <span className="pagina__subtitulo">{c.descricao || "Sem descrição"}{c.usos ? ` · ${c.usos} status` : ""}</span>
                  </span>
                  <AcessoBadge item={c} />
                  {!c.deOutro && (
                    <span className="pericia__acoes">
                      <Button pequeno variante="fantasma" aria-label={`Editar ${c.nome}`} onClick={() => abrir(c)}><Pencil size={14} aria-hidden /></Button>
                      <Button pequeno variante="fantasma" aria-label={`Excluir ${c.nome}`} title="Os status dela ficam sem categoria" disabled={excluir.isPending}
                        onClick={() => excluir.mutate(c.id)}>
                        <Trash2 size={14} aria-hidden />
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {excluir.isError && <div className="aviso">{mensagemDeErro(excluir.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={fechar}>Fechar</Button>
            <Button variante="primario" onClick={() => abrir(null)}><Plus size={16} aria-hidden /> Nova categoria</Button>
          </div>
        </div>
      ) : (
        <form className="form" noValidate onSubmit={enviar}>
          <Field rotulo="Nome" erro={errosDeCampo(salvando.error).nome}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} autoFocus placeholder="Ex.: Elementais" />
          </Field>
          <Field rotulo="Descrição (opcional)" erro={errosDeCampo(salvando.error).descricao}>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} />
          </Field>
          {salvando.isError && <div className="aviso">{erroDeFormulario(salvando.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={() => setEmEdicao(undefined)} disabled={salvando.isPending}>Voltar</Button>
            <Button type="submit" variante="primario" disabled={salvando.isPending}>{salvando.isPending ? "Salvando…" : "Salvar categoria"}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
