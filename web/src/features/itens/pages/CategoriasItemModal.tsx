// Container: gerenciar categorias de item. As fixas do sistema só aparecem; as do mestre podem ser criadas, editadas e excluídas.
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useCategoriasItem, useCriarCategoriaItem, useEditarCategoriaItem, useExcluirCategoriaItem } from "../api";
import { ICONES_ITEM, iconeDe, LISTA_ICONES_ITEM, type CategoriaItem } from "../types";

export function CategoriasItemModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const categorias = useCategoriasItem();
  const criar = useCriarCategoriaItem();
  const editar = useEditarCategoriaItem();
  const excluir = useExcluirCategoriaItem();
  // undefined = lista; null = nova; categoria = editando
  const [emEdicao, setEmEdicao] = useState<CategoriaItem | null | undefined>(undefined);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("pacote");
  const salvando = emEdicao ? editar : criar;

  function abrir(c: CategoriaItem | null) {
    criar.reset();
    editar.reset();
    setNome(c?.nome ?? "");
    setDescricao(c?.descricao ?? "");
    setIcone(c?.icone ?? "pacote");
    setEmEdicao(c);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const dados = { nome, descricao, icone };
    const voltar = () => setEmEdicao(undefined);
    if (emEdicao) editar.mutate({ id: emEdicao.id, dados }, { onSuccess: voltar });
    else criar.mutate(dados, { onSuccess: voltar });
  }

  function fechar() {
    setEmEdicao(undefined);
    onFechar();
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo={emEdicao === undefined ? "Categorias de item" : emEdicao ? "Editar categoria" : "Nova categoria"}>
      {emEdicao === undefined ? (
        <div className="form">
          <p className="pagina__subtitulo">As 4 categorias do sistema valem para todos. Crie as suas para organizar do seu jeito (ex.: Relíquias, Munição, Ervas).</p>
          {categorias.isPending ? (
            <Loading compacto />
          ) : (
            <ul className="lista-simples">
              {(categorias.data ?? []).map((c) => {
                const Icone = iconeDe(c.icone);
                return (
                  <li key={c.id} className="categoria-linha">
                    <span className="item__miniatura item__miniatura--icone" aria-hidden><Icone size={18} /></span>
                    <span className="categoria-linha__texto">
                      <strong>{c.nome} <SeloVerificado tipo="categoriaItem" item={c} /></strong>
                      <span className="pagina__subtitulo">{c.descricao || "Sem descrição"}{c.usos ? ` · ${c.usos} itens` : ""}</span>
                    </span>
                    {c.fixa && <span className="selo selo--fixa" title="Categoria do sistema"><Lock size={12} aria-hidden /> Fixa</span>}
                    {(c.editavel ?? !c.fixa) && (
                      <span className="pericia__acoes">
                        <Button pequeno variante="fantasma" aria-label={`Editar ${c.nome}`} onClick={() => abrir(c)}><Pencil size={14} aria-hidden /></Button>
                        {!c.fixa && (
                          <Button pequeno variante="fantasma" aria-label={`Excluir ${c.nome}`} title="Os itens dela ficam sem categoria" disabled={excluir.isPending}
                            onClick={() => excluir.mutate(c.id)}>
                            <Trash2 size={14} aria-hidden />
                          </Button>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
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
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} autoFocus placeholder="Ex.: Relíquias" />
          </Field>
          <Field rotulo="Descrição (opcional)" erro={errosDeCampo(salvando.error).descricao}>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} />
          </Field>
          <fieldset className="form__grupo">
            <legend>Ícone</legend>
            <div className="seletor-icone" role="radiogroup" aria-label="Ícone da categoria">
              {LISTA_ICONES_ITEM.map((chave) => {
                const { Icone, rotulo } = ICONES_ITEM[chave]!;
                return (
                  <button key={chave} type="button" role="radio" aria-checked={icone === chave} aria-label={rotulo} title={rotulo}
                    className={`seletor-icone__opcao ${icone === chave ? "seletor-icone__opcao--ativa" : ""}`} onClick={() => setIcone(chave)}>
                    <Icone size={20} aria-hidden />
                  </button>
                );
              })}
            </div>
          </fieldset>
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
