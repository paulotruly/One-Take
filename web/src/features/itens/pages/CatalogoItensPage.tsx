// Catálogo de itens do mestre: armas, artefatos, taverna e sebo. Os itens ficam sempre à mão para lançar nos grupos.
import { Pencil, Plus, Send, Tags, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useClasses } from "../../classes/api";
import { ExclusividadeField } from "../../grupos/components/ExclusividadeField";
import { useGrupos } from "../../grupos/api";
import { useCatalogo } from "../../pericias/api";
import { useCatalogoItens, useCategoriasItem, useCriarModelo, useEditarModelo, useExcluirModelo, useLancarItem } from "../api";
import { ItemDetalhe, ItemLinha } from "../components/ItemCartao";
import { ItemForm } from "../components/ItemForm";
import { camposDe, type ItemModelo } from "../types";
import { CategoriasItemModal } from "./CategoriasItemModal";

export function CatalogoItensPage() {
  const itens = useCatalogoItens();
  const grupos = useGrupos();
  const classes = useClasses();
  const pericias = useCatalogo();
  const criar = useCriarModelo();
  const editar = useEditarModelo();
  const excluir = useExcluirModelo();
  const lancar = useLancarItem();

  const categorias = useCategoriasItem();
  const [gerenciandoCategorias, setGerenciandoCategorias] = useState(false);
  const [categoria, setCategoria] = useState<string | undefined>(undefined);
  const [aberto, setAberto] = useState<ItemModelo | null>(null);
  // undefined = fechado; null = novo; item = editando
  const [emEdicao, setEmEdicao] = useState<ItemModelo | null | undefined>(undefined);
  const [aExcluir, setAExcluir] = useState<ItemModelo | null>(null);
  const [grupoExclusivoId, setGrupoExclusivoId] = useState<string | null>(null);
  const [lancando, setLancando] = useState<ItemModelo | null>(null);
  const [destinoGrupo, setDestinoGrupo] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [lancadoEm, setLancadoEm] = useState<string | null>(null);
  const salvando = emEdicao ? editar : criar;

  function abrirForm(i: ItemModelo | null) {
    criar.reset();
    editar.reset();
    setAberto(null);
    setGrupoExclusivoId(i?.grupoExclusivoId ?? null);
    setEmEdicao(i);
  }
  const fecharForm = () => setEmEdicao(undefined);

  function abrirLancar(i: ItemModelo) {
    lancar.reset();
    setAberto(null);
    setLancadoEm(null);
    setDestinoGrupo(i.grupoExclusivoId ?? "");
    setQuantidade("1");
    setLancando(i);
  }

  const lista = (itens.data ?? []).filter((i) => !categoria || i.categoria?.id === categoria);
  const opcoesPericias = (pericias.data ?? []).map((p) => ({ id: p.id, rotulo: `${p.nome} (${p.atributo.nome})` }));
  const opcoesClasses = (classes.data ?? []).map((c) => ({ id: c.id, rotulo: c.fixa ? `${c.titulo} (fixa)` : c.titulo }));
  const gruposParaLancar = (grupos.data ?? []).filter((g) => !lancando?.grupoExclusivoId || g.id === lancando.grupoExclusivoId);

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Itens</h1>
          <p className="pagina__subtitulo">Seu catálogo de itens. Lance um item num grupo a qualquer momento: vago para o grupo ou direto numa ficha.</p>
        </div>
        <div className="classe-cabecalho__acoes">
          <Button onClick={() => setGerenciandoCategorias(true)}>
            <Tags size={16} aria-hidden /> Categorias
          </Button>
          <Button variante="primario" onClick={() => abrirForm(null)}>
            <Plus size={16} aria-hidden /> Novo item
          </Button>
        </div>
      </div>

      <div className="filtro" role="group" aria-label="Filtrar por categoria">
        <button type="button" className="filtro__opcao" aria-pressed={!categoria} onClick={() => setCategoria(undefined)}>Todos</button>
        {(categorias.data ?? []).map((c) => (
          <button key={c.id} type="button" className="filtro__opcao" aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>
            {c.nome}
          </button>
        ))}
      </div>

      {itens.isPending ? (
        <Loading texto="Carregando itens…" />
      ) : itens.isError ? (
        <ErrorState mensagem={mensagemDeErro(itens.error)} onTentarNovamente={() => itens.refetch()} />
      ) : lista.length === 0 ? (
        <EmptyState titulo="Nenhum item aqui ainda" descricao="Crie armas, artefatos, itens de taverna e do sebo para usar nas sessões." />
      ) : (
        <ul className="itens">
          {lista.map((i) => (
            <ItemLinha
              key={i.id}
              item={i}
              onAbrir={() => setAberto(i)}
              extra={i.grupoExclusivoId && <span className="selo">Exclusivo: {grupos.data?.find((g) => g.id === i.grupoExclusivoId)?.titulo ?? "grupo"}</span>}
            />
          ))}
        </ul>
      )}

      <Modal aberto={!!aberto} onFechar={() => setAberto(null)} titulo={aberto?.nome ?? ""}>
        {aberto && (
          <>
            <ItemDetalhe item={aberto} />
            <div className="modal__acoes modal__acoes--quebra">
              <Button onClick={() => { excluir.reset(); setAExcluir(aberto); setAberto(null); }}>
                <Trash2 size={16} aria-hidden /> Excluir
              </Button>
              <Button onClick={() => abrirForm(aberto)}>
                <Pencil size={16} aria-hidden /> Editar
              </Button>
              <Button variante="primario" onClick={() => abrirLancar(aberto)}>
                <Send size={16} aria-hidden /> Lançar num grupo
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal aberto={emEdicao !== undefined} onFechar={fecharForm} titulo={emEdicao ? "Editar item" : "Novo item"} largo>
        <ItemForm
          key={emEdicao?.id ?? "novo"}
          inicial={emEdicao ? camposDe(emEdicao) : undefined}
          pericias={opcoesPericias}
          classes={opcoesClasses}
          categorias={categorias.data ?? []}
          extra={<ExclusividadeField valor={grupoExclusivoId} grupos={grupos.data ?? []} onChange={setGrupoExclusivoId} erro={errosDeCampo(salvando.error).grupoExclusivoId} />}
          enviando={salvando.isPending}
          erros={errosDeCampo(salvando.error)}
          erroGeral={erroDeFormulario(salvando.error)}
          onCancelar={fecharForm}
          onEnviar={(campos) => {
            const dados = { ...campos, grupoExclusivoId };
            if (emEdicao) editar.mutate({ id: emEdicao.id, dados }, { onSuccess: fecharForm });
            else criar.mutate(dados, { onSuccess: fecharForm });
          }}
        />
      </Modal>

      <Modal aberto={!!lancando} onFechar={() => setLancando(null)} titulo={`Lançar: ${lancando?.nome ?? ""}`}>
        <div className="form">
          <p className="pagina__subtitulo">O item entra vago no grupo; dali você entrega a um jogador (ou ele mesmo pega). Para mandar direto a uma ficha, use a página do grupo.</p>
          <Field rotulo="Grupo">
            <select value={destinoGrupo} onChange={(e) => setDestinoGrupo(e.target.value)}>
              <option value="">Escolha…</option>
              {gruposParaLancar.map((g) => <option key={g.id} value={g.id}>{g.titulo}</option>)}
            </select>
          </Field>
          <Field rotulo="Quantidade" dica="Cada unidade vira um item separado.">
            <input type="number" min={1} max={20} step={1} inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </Field>
          {lancadoEm && <p className="sucesso">Lançado em {lancadoEm}.</p>}
          {lancar.isError && <div className="aviso">{erroDeFormulario(lancar.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={() => setLancando(null)}>Fechar</Button>
            <Button
              variante="primario"
              disabled={!destinoGrupo || lancar.isPending}
              onClick={() =>
                lancando &&
                lancar.mutate(
                  { modeloId: lancando.id, grupoId: destinoGrupo, fichaId: null, quantidade: Number(quantidade) || 1 },
                  { onSuccess: () => setLancadoEm(grupos.data?.find((g) => g.id === destinoGrupo)?.titulo ?? "grupo") },
                )
              }
            >
              {lancar.isPending ? "Lançando…" : "Lançar"}
            </Button>
          </div>
        </div>
      </Modal>

      <CategoriasItemModal aberto={gerenciandoCategorias} onFechar={() => setGerenciandoCategorias(false)} />

      <ConfirmDialog
        aberto={!!aExcluir}
        titulo="Excluir item do catálogo"
        mensagem={<>Excluir <strong>{aExcluir?.nome}</strong> do catálogo? Os itens já lançados nos grupos continuam lá.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setAExcluir(null)}
        onConfirmar={() => aExcluir && excluir.mutate(aExcluir.id, { onSuccess: () => setAExcluir(null) })}
      />
    </div>
  );
}
