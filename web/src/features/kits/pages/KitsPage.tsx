// Kits de RPG do mestre: criar, editar, excluir e escolher o kit ativo (filtro da interface).
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { AcessoBadge } from "../../verificados/components/VerificadoBadge";
import { Check, Eye, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useCriarKit, useEditarKit, useExcluirKit, useKitAtivo, useKits } from "../api";
import type { Kit } from "../types";

const ROTULOS: [keyof Kit["conteudo"], string][] = [
  ["classes", "classes"], ["racas", "raças"], ["atributos", "atributos"], ["pericias", "perícias"], ["status", "status"],
  ["itens", "itens"], ["bestas", "criaturas"], ["npcs", "NPCs"], ["grupos", "grupos"],
];

export function KitsPage() {
  const kits = useKits();
  const { kitId, definir } = useKitAtivo();
  const criar = useCriarKit();
  const editar = useEditarKit();
  const excluir = useExcluirKit();

  const [emEdicao, setEmEdicao] = useState<Kit | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<Kit | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const salvando = emEdicao ? editar : criar;

  function abrir(k: Kit | null) {
    criar.reset();
    editar.reset();
    setNome(k?.nome ?? "");
    setDescricao(k?.descricao ?? "");
    setEmEdicao(k);
  }
  const fechar = () => setEmEdicao(undefined);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const dados = { nome, descricao };
    if (emEdicao) editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar });
    else criar.mutate(dados, { onSuccess: (k) => { definir(k.id); fechar(); } });
  }

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Kits de RPG</h1>
          <p className="pagina__subtitulo">
            Um kit junta tudo de uma aventura: classes, raças, perícias, status, itens, criaturas e NPCs. Com um kit ativo, as telas mostram
            só o que é do kit (o geral aparece em Todos), e tudo o que você criar entra nele. Ao criar um grupo, escolha o kit e ele já marca o que vale.
          </p>
        </div>
        <Button variante="primario" onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden /> Novo kit
        </Button>
      </div>

      {kits.isPending ? (
        <Loading texto="Carregando kits…" />
      ) : kits.isError ? (
        <ErrorState mensagem={mensagemDeErro(kits.error)} onTentarNovamente={() => kits.refetch()} />
      ) : kits.data.length === 0 ? (
        <EmptyState titulo="Nenhum kit ainda" descricao="Sem kits, tudo é geral. Crie um kit para organizar o conteúdo de uma aventura." />
      ) : (
        <ul className="conceitos">
          {kits.data.map((k) => (
            <li key={k.id} className={`conceito ${k.id === kitId ? "conceito--ativo" : ""}`}>
              <div className="conceito__topo">
                <h3><Package size={18} aria-hidden /> <Link to={`/mestre/kits/${k.id}`}>{k.nome}</Link> <SeloVerificado tipo="kit" item={k} /></h3>
                {!k.deOutro && (
                  <div className="pericia__acoes">
                    <Button pequeno variante="fantasma" aria-label={`Editar ${k.nome}`} onClick={() => abrir(k)}><Pencil size={14} aria-hidden /></Button>
                    <Button pequeno variante="fantasma" aria-label={`Excluir ${k.nome}`} onClick={() => { excluir.reset(); setAExcluir(k); }}><Trash2 size={14} aria-hidden /></Button>
                  </div>
                )}
              </div>
              {(k.verificado || k.deOutro) && <div><AcessoBadge item={k} /></div>}
              {k.descricao && <p className="pericia__descricao">{k.descricao}</p>}
              <p className="pagina__subtitulo">
                {ROTULOS.filter(([c]) => k.conteudo[c] > 0).map(([c, r]) => `${k.conteudo[c]} ${r}`).join(" · ") || "Vazio por enquanto."}
              </p>
              <div className="conceito__subclasses">
                <Link to={`/mestre/kits/${k.id}`} className="btn btn--pequeno"><Eye size={14} aria-hidden /> Ver o que tem</Link>
                {k.id === kitId ? (
                  <Button pequeno onClick={() => definir(null)}><Check size={14} aria-hidden /> Kit ativo · mostrar tudo</Button>
                ) : (
                  <Button pequeno variante="primario" onClick={() => definir(k.id)}>Usar este kit</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? "Editar kit" : "Novo kit"}>
        <form className="form" noValidate onSubmit={enviar}>
          <Field rotulo="Nome" erro={errosDeCampo(salvando.error).nome}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} autoFocus placeholder="Ex.: Terror no farol" />
          </Field>
          <Field rotulo="Descrição (opcional)" erro={errosDeCampo(salvando.error).descricao}>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} rows={3} />
          </Field>
          {salvando.isError && <div className="aviso">{erroDeFormulario(salvando.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={fechar} disabled={salvando.isPending}>Cancelar</Button>
            <Button type="submit" variante="primario" disabled={salvando.isPending}>{salvando.isPending ? "Salvando…" : emEdicao ? "Salvar" : "Criar e usar"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir kit"
        mensagem={<>Excluir o kit <strong>{aExcluir?.nome}</strong>? Nada é apagado: o que estava só nele vira geral, e os grupos que usavam o kit ficam sem kit.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </div>
  );
}
