// Catálogo de status do mestre: os dele (editáveis, inclusive os automáticos) + os verificados de outras pessoas (só leitura).
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { ChevronDown, ChevronUp, Plus, Tags, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { KitsField } from "../../kits/components/KitsField";
import { kitsPadrao } from "../../kits/types";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useOculto } from "../../../lib/useOculto";
import { useCategoriasStatus, useCriarStatus, useEditarStatus, useExcluirStatus, useStatus } from "../api";
import { agruparPorCategoria, type GrupoDeStatus } from "../categorias";
import { CategoriasStatusModal } from "./CategoriasStatusModal";
import { StatusTitulo } from "../components/StatusBadge";
import { LISTA_TIPOS, ROTULO_GATILHO, ROTULO_TIPO, type CategoriaStatus, type Status, type StatusInput, type TipoStatus } from "../types";

export function StatusPage() {
  const status = useStatus();
  const criar = useCriarStatus();
  const editar = useEditarStatus();
  const excluir = useExcluirStatus();
  // undefined = fechado; null = novo; Status = editando
  const [emEdicao, setEmEdicao] = useState<Status | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<Status | null>(null);
  const salvando = emEdicao ? editar : criar;
  const categorias = useCategoriasStatus();
  const [gerenciando, setGerenciando] = useState(false);

  function abrir(s: Status | null) {
    criar.reset();
    editar.reset();
    setEmEdicao(s);
  }
  const fechar = () => setEmEdicao(undefined);

  const { kitId } = useKitAtivo();
  const lista = (status.data ?? []).filter((s) => soDoKit(s.kitIds, kitId));
  const automaticos = lista.filter((s) => s.automatico);
  const manuais = lista.filter((s) => !s.automatico);
  const grupos = agruparPorCategoria(manuais, categorias.data, { comVazias: true });

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
        <div className="classe-cabecalho__acoes">
          <Button onClick={() => setGerenciando(true)}>
            <Tags size={16} aria-hidden /> Categorias
          </Button>
          <Button variante="primario" onClick={() => abrir(null)}>
            <Plus size={16} aria-hidden /> Novo status
          </Button>
        </div>
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
            <p className="pagina__subtitulo">Aparecem sozinhos na ficha quando um recurso chega a 0. Dá para mudar o nome e o efeito, mas não excluir.</p>
            <Lista itens={automaticos} onEditar={abrir} onExcluir={setAExcluir} />
          </section>
          <section className="secao">
            <h2>Aplicados pelo mestre</h2>
            <p className="pagina__subtitulo">Você aplica e remove durante a sessão, na ficha de cada personagem. Cartas de habilidade podem indicar qual status ativam.</p>
            {grupos.length === 1 && grupos[0]!.id === "sem-categoria" ? (
              <Lista itens={manuais} onEditar={abrir} onExcluir={setAExcluir} />
            ) : grupos.length === 0 ? (
              <Lista itens={[]} onEditar={abrir} onExcluir={setAExcluir} />
            ) : (
              grupos.map((g) => <GrupoStatus key={g.id} grupo={g} onEditar={abrir} onExcluir={setAExcluir} />)
            )}
          </section>
        </>
      )}

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? "Editar status" : "Novo status"}>
        <StatusForm
          inicial={emEdicao ? { ...emEdicao, kitIds: emEdicao.kitIds ?? [], categoriaId: emEdicao.categoria?.id ?? emEdicao.categoriaId ?? null } : undefined}
          categorias={categorias.data ?? []}
          enviando={salvando.isPending}
          erros={errosDeCampo(salvando.error)}
          erroGeral={erroDeFormulario(salvando.error)}
          onCancelar={fechar}
          onEnviar={(dados) => (emEdicao ? editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar }) : criar.mutate(dados, { onSuccess: fechar }))}
        />
      </Modal>

      <CategoriasStatusModal aberto={gerenciando} onFechar={() => setGerenciando(false)} />

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

/** Uma categoria de status, que dá para ocultar com a seta (lembrado neste navegador). */
function GrupoStatus({ grupo, onEditar, onExcluir }: { grupo: GrupoDeStatus; onEditar: (s: Status) => void; onExcluir: (s: Status) => void }) {
  const [oculto, alternar] = useOculto(`status-categoria:${grupo.id}`);
  return (
    <div className="status-categoria">
      <button type="button" className="conceitos__alternar status-categoria__titulo" onClick={alternar} aria-expanded={!oculto} title={oculto ? "Mostrar" : "Ocultar"}>
        <h3>{grupo.nome} <span className="pagina__subtitulo">({grupo.itens.length})</span></h3>
        {oculto ? <ChevronDown size={18} aria-hidden /> : <ChevronUp size={18} aria-hidden />}
        <span className="sr-only">{oculto ? "Mostrar" : "Ocultar"}</span>
      </button>
      {!oculto && (grupo.itens.length === 0 ? <p className="pagina__subtitulo">Nenhum status nesta categoria ainda.</p> : <Lista itens={grupo.itens} onEditar={onEditar} onExcluir={onExcluir} />)}
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
            {/* Título, tipo e (por último) o selo/botão de verificado. */}
            <div className="pericia__nome">
              <StatusTitulo nome={s.nome} tipo={s.tipo} />
              <span className={`selo selo--status-${s.tipo}`}>{ROTULO_TIPO[s.tipo]}</span>
              {s.gatilho && <span className="selo"><Zap size={12} aria-hidden /> {ROTULO_GATILHO[s.gatilho]}</span>}
              <SeloVerificado tipo="status" item={s} />
            </div>
            <p><strong>Efeito:</strong> {s.efeito}</p>
          </div>
          {s.editavel && (
            <div className="pericia__acoes">
              <Button pequeno variante="fantasma" onClick={() => onEditar(s)}>Editar</Button>
              {!s.automatico && <Button pequeno variante="fantasma" onClick={() => onExcluir(s)} aria-label={`Excluir ${s.nome}`}>Excluir</Button>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusForm({
  inicial,
  categorias,
  onEnviar,
  onCancelar,
  enviando,
  erros = {},
  erroGeral,
}: {
  inicial?: StatusInput;
  categorias: CategoriaStatus[];
  onEnviar: (d: StatusInput) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
}) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [tipo, setTipo] = useState<TipoStatus>(inicial?.tipo ?? "DEBUFF");
  const [efeito, setEfeito] = useState(inicial?.efeito ?? "");
  const [kitIds, setKitIds] = useState<string[]>(inicial?.kitIds ?? kitsPadrao());
  const [categoriaId, setCategoriaId] = useState(inicial?.categoriaId ?? "");

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({ nome, tipo, efeito, kitIds, categoriaId: categoriaId || null });
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
        <textarea value={efeito} onChange={(e) => setEfeito(e.target.value)} maxLength={1000} rows={3} />
      </Field>
      <Field rotulo="Categoria (opcional)" erro={erros.categoriaId} dica="Para agrupar os status. Crie categorias no botão Categorias.">
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
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
