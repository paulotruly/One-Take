// Catálogo de status do mestre: fixos do sistema (somente leitura) + os criados por ele.
import { AlternarVerificado } from "../../verificados/pages/AlternarVerificado";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { Lock, Plus, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { KitsField } from "../../kits/components/KitsField";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { kitsPadrao } from "../../kits/types";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useCriarStatus, useEditarStatus, useExcluirStatus, useStatus } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { LISTA_TIPOS, ROTULO_GATILHO, ROTULO_TIPO, type Status, type StatusInput, type TipoStatus } from "../types";

export function StatusPage() {
  const status = useStatus();
  const criar = useCriarStatus();
  const editar = useEditarStatus();
  const excluir = useExcluirStatus();
  // undefined = fechado; null = novo; Status = editando
  const [emEdicao, setEmEdicao] = useState<Status | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<Status | null>(null);
  const salvando = emEdicao ? editar : criar;

  function abrir(s: Status | null) {
    criar.reset();
    editar.reset();
    setEmEdicao(s);
  }
  const fechar = () => setEmEdicao(undefined);

  const { kitId } = useKitAtivo();
  const lista = (status.data ?? []).filter((s) => s.fixo || soDoKit(s.kitIds, kitId));
  const automaticos = lista.filter((s) => s.automatico);
  const manuais = lista.filter((s) => !s.automatico);

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Status</h1>
          <p className="pagina__subtitulo">
            Condições e emoções dos personagens. O efeito é só um aviso na ficha: o sistema não muda nenhum número. Em cada grupo você
            escolhe quais status valem.
          </p>
        </div>
        <Button variante="primario" onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden /> Novo status
        </Button>
      </div>

      <AvisoKit />
      {status.isPending ? (
        <Loading texto="Carregando status…" />
      ) : status.isError ? (
        <ErrorState mensagem={mensagemDeErro(status.error)} onTentarNovamente={() => status.refetch()} />
      ) : (
        <>
          <section className="secao">
            <h2>Automáticos</h2>
            <p className="pagina__subtitulo">Aparecem sozinhos na ficha quando um recurso chega a 0.</p>
            <Lista itens={automaticos} onEditar={abrir} onExcluir={setAExcluir} />
          </section>
          <section className="secao">
            <h2>Aplicados pelo mestre</h2>
            <p className="pagina__subtitulo">Você aplica e remove durante a sessão, na ficha de cada personagem. Cartas de habilidade podem indicar qual status ativam.</p>
            <Lista itens={manuais} onEditar={abrir} onExcluir={setAExcluir} />
          </section>
        </>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? "Editar status" : "Novo status"}>
        <StatusForm
          inicial={emEdicao ? { ...emEdicao, kitIds: emEdicao.kitIds ?? [] } : undefined}
          enviando={salvando.isPending}
          erros={errosDeCampo(salvando.error)}
          erroGeral={erroDeFormulario(salvando.error)}
          onCancelar={fechar}
          onEnviar={(dados) => (emEdicao ? editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar }) : criar.mutate(dados, { onSuccess: fechar }))}
        />
      </Modal>

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir status"
        mensagem={<>Excluir <strong>{aExcluir?.nome}</strong>? Ele sai das fichas e dos grupos, e as cartas que o ativavam ficam sem status.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </div>
  );
}

function Lista({ itens, onEditar, onExcluir }: { itens: Status[]; onEditar: (s: Status) => void; onExcluir: (s: Status) => void }) {
  if (itens.length === 0) return <p className="pagina__subtitulo">Nenhum status aqui.</p>;
  return (
    <ul className="pericias">
      {itens.map((s) => (
        <li key={s.id} className="pericia pericia--atributo">
          <div>
            <div className="pericia__nome">
              <StatusBadge nome={s.nome} tipo={s.tipo} />
              <span className="pagina__subtitulo">{ROTULO_TIPO[s.tipo]}</span>
              {s.fixo && <span className="selo selo--fixa"><Lock size={12} aria-hidden /> Fixo</span>}
              {s.verificado && <VerificadoBadge />}
              {s.gatilho && <span className="selo"><Zap size={12} aria-hidden /> {ROTULO_GATILHO[s.gatilho]}</span>}
            </div>
            {s.descricao && <p className="pericia__descricao">{s.descricao}</p>}
            <p><strong>Efeito:</strong> {s.efeito}</p>
          </div>
          {(s.editavel ?? !s.fixo) && (
            <div className="pericia__acoes">
              <Button pequeno variante="fantasma" onClick={() => onEditar(s)}>Editar</Button>
              {!s.fixo && <Button pequeno variante="fantasma" onClick={() => onExcluir(s)} aria-label={`Excluir ${s.nome}`}>Excluir</Button>}
              <AlternarVerificado tipo="status" item={s} pequeno />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusForm({
  inicial,
  onEnviar,
  onCancelar,
  enviando,
  erros = {},
  erroGeral,
}: {
  inicial?: StatusInput;
  onEnviar: (d: StatusInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [tipo, setTipo] = useState<TipoStatus>(inicial?.tipo ?? "DEBUFF");
  const [efeito, setEfeito] = useState(inicial?.efeito ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [kitIds, setKitIds] = useState<string[]>(inicial?.kitIds ?? kitsPadrao());

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({ nome, tipo, efeito, descricao, kitIds });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <div className="form__linha">
        <Field rotulo="Nome" erro={erros.nome}>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} autoFocus />
        </Field>
        <Field rotulo="Tipo" erro={erros.tipo}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoStatus)}>
            {LISTA_TIPOS.map((t) => <option key={t} value={t}>{ROTULO_TIPO[t]}</option>)}
          </select>
        </Field>
      </div>
      <Field rotulo="Efeito" erro={erros.efeito} dica='O que muda para o personagem. Ex.: "-10 no total dos dados em testes físicos".'>
        <textarea value={efeito} onChange={(e) => setEfeito(e.target.value)} maxLength={500} rows={2} />
      </Field>
      <Field rotulo="Descrição (opcional)" erro={erros.descricao} dica="O que o personagem está sentindo ou passando.">
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500} rows={2} />
      </Field>
      <KitsField valor={kitIds} onChange={setKitIds} erro={erros.kitIds} />
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar status"}</Button>
      </div>
    </form>
  );
}
