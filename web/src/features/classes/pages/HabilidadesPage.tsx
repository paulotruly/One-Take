import { Plus } from "lucide-react";
// Tela própria de habilidades de uma classe (que já precisa existir):
// criar, editar, reordenar e excluir as cartas da cartela da classe.
import { useState } from "react";
import { useParams } from "react-router";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import {
  useClasse,
  useCriarAprimoramento,
  useCriarHabilidade,
  useEditarAprimoramento,
  useEditarHabilidade,
  useExcluirAprimoramento,
  useExcluirHabilidade,
  useOrdenarHabilidades,
} from "../api";
import { AprimoramentoForm, resumoAprimoramento } from "../components/AprimoramentoForm";
import { useStatus } from "../../status/api";
import { HabilidadeForm } from "../components/forms";
import { HabilidadesDeck } from "../components/HabilidadesDeck";
import { GrupoBadge, OrigemBadge } from "../components/Selos";
import type { Aprimoramento, Habilidade } from "../types";

export function HabilidadesPage() {
  const { id = "" } = useParams();
  const classe = useClasse(id);
  const criar = useCriarHabilidade(id);
  const editar = useEditarHabilidade();
  const excluir = useExcluirHabilidade();
  const ordenar = useOrdenarHabilidades(id);
  const status = useStatus();

  // undefined = modal fechado; null = nova; Habilidade = editando
  const [emEdicao, setEmEdicao] = useState<Habilidade | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<Habilidade | null>(null);
  const salvando = emEdicao ? editar : criar;

  // Aprimoramentos: carta aberta e aprimoramento em edição (null = novo; undefined = só a lista).
  const [aprimorando, setAprimorando] = useState<Habilidade | null>(null);
  const [aprimEmEdicao, setAprimEmEdicao] = useState<Aprimoramento | null | undefined>(undefined);
  const criarAprim = useCriarAprimoramento();
  const editarAprim = useEditarAprimoramento();
  const excluirAprim = useExcluirAprimoramento();
  const salvandoAprim = aprimEmEdicao ? editarAprim : criarAprim;

  function abrir(h: Habilidade | null) {
    criar.reset();
    editar.reset();
    setEmEdicao(h);
  }
  const fechar = () => setEmEdicao(undefined);

  if (classe.isPending) return <Loading texto="Carregando habilidades…" />;
  if (classe.isError) {
    return (
      <div className="pagina">
        <LinkVoltar to="/mestre">Classes</LinkVoltar>
        <ErrorState mensagem={mensagemDeErro(classe.error)} onTentarNovamente={() => classe.refetch()} />
      </div>
    );
  }

  const c = classe.data;
  const editavel = !c.fixa;
  // A carta aberta no modal sempre com os dados mais novos.
  const cartaAprimorando = aprimorando ? c.habilidades.find((h) => h.id === aprimorando.id) ?? null : null;

  return (
    <div className="pagina">
      <LinkVoltar to={`/mestre/classes/${id}`}>{c.titulo}</LinkVoltar>

      <div className="pagina__cabecalho">
        <div>
          <div className="classe-cabecalho__selos">
            <GrupoBadge grupo={c.grupo} />
            <OrigemBadge fixa={c.fixa} />
          </div>
          <h1>Habilidades de {c.titulo}</h1>
          <p className="pagina__subtitulo">
            {c.habilidades.length} {c.habilidades.length === 1 ? "carta" : "cartas"} na cartela
            {editavel ? " · use as setas para reordenar" : " · classe fixa, somente leitura"}
          </p>
        </div>
        {editavel && (
          <Button variante="primario" onClick={() => abrir(null)}>
            <Plus size={16} aria-hidden /> Nova habilidade
          </Button>
        )}
      </div>

      {ordenar.isError && <div className="aviso">Não foi possível reordenar: {mensagemDeErro(ordenar.error)}</div>}

      <HabilidadesDeck
        habilidades={c.habilidades}
        acoes={
          editavel
            ? {
                onEditar: abrir,
                onExcluir: (h) => {
                  excluir.reset();
                  setAExcluir(h);
                },
                onAprimorar: (h) => {
                  setAprimEmEdicao(undefined);
                  setAprimorando(h);
                },
                onReordenar: (ids) => ordenar.mutate(ids),
                reordenando: ordenar.isPending,
              }
            : undefined
        }
      />

      <Modal aberto={emEdicao !== undefined} onFechar={fechar} titulo={emEdicao ? "Editar habilidade" : "Nova habilidade"}>
        <HabilidadeForm
          inicial={emEdicao ?? undefined}
          opcoesStatus={status.data}
          enviando={salvando.isPending}
          erros={errosDeCampo(salvando.error)}
          erroGeral={erroDeFormulario(salvando.error)}
          onCancelar={fechar}
          onEnviar={(dados) =>
            emEdicao
              ? editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fechar })
              : criar.mutate(dados, { onSuccess: fechar })
          }
        />
      </Modal>

      <Modal aberto={!!cartaAprimorando} onFechar={() => setAprimorando(null)} titulo={`Aprimoramentos: ${cartaAprimorando?.titulo ?? ""}`} largo>
        {cartaAprimorando && aprimEmEdicao === undefined && (
          <div className="form">
            <p className="pagina__subtitulo">
              A partir de certo nível, a mesma carta pode mudar (efeito, custo, limite…). Na ficha, o jogador vê a versão do nível dele.
            </p>
            {(cartaAprimorando.aprimoramentos ?? []).length === 0 ? (
              <p>Esta carta ainda não muda com o nível.</p>
            ) : (
              <ul className="pericias">
                {(cartaAprimorando.aprimoramentos ?? []).map((a) => (
                  <li key={a.id} className="pericia pericia--atributo">
                    <div>
                      <strong>A partir do nível {a.nivel}</strong>
                      <p className="pericia__descricao">{resumoAprimoramento(a)}</p>
                    </div>
                    <div className="pericia__acoes">
                      <Button pequeno variante="fantasma" onClick={() => { editarAprim.reset(); setAprimEmEdicao(a); }}>Editar</Button>
                      <Button pequeno variante="fantasma" onClick={() => excluirAprim.mutate(a.id)}>Excluir</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {excluirAprim.isError && <div className="aviso">{mensagemDeErro(excluirAprim.error)}</div>}
            <div className="modal__acoes">
              <Button onClick={() => setAprimorando(null)}>Fechar</Button>
              <Button variante="primario" onClick={() => { criarAprim.reset(); setAprimEmEdicao(null); }}>Novo aprimoramento</Button>
            </div>
          </div>
        )}
        {cartaAprimorando && aprimEmEdicao !== undefined && (
          <AprimoramentoForm
            carta={cartaAprimorando}
            inicial={aprimEmEdicao ?? undefined}
            opcoesStatus={status.data ?? []}
            enviando={salvandoAprim.isPending}
            erros={errosDeCampo(salvandoAprim.error)}
            erroGeral={erroDeFormulario(salvandoAprim.error)}
            onCancelar={() => setAprimEmEdicao(undefined)}
            onEnviar={(dados) =>
              aprimEmEdicao
                ? editarAprim.mutate({ id: aprimEmEdicao.id, dados }, { onSuccess: () => setAprimEmEdicao(undefined) })
                : criarAprim.mutate({ habilidadeId: cartaAprimorando.id, dados }, { onSuccess: () => setAprimEmEdicao(undefined) })
            }
          />
        )}
      </Modal>

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir habilidade"
        mensagem={<>Excluir a habilidade <strong>{aExcluir?.titulo}</strong>? Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </div>
  );
}
