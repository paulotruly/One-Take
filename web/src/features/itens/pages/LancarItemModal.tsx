// Container: o mestre escolhe um item do catálogo e lança no grupo (vago) ou direto numa ficha.
// Usado na página do grupo e na ficha do personagem.
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, mensagemDeErro } from "../../../lib/api";
import { useCatalogoItens, useCategoriasItem, useLancarItem } from "../api";
import { ItemDetalhe, ItemLinha } from "../components/ItemCartao";
import type { ItemModelo } from "../types";

type Props = {
  grupoId: string;
  aberto: boolean;
  onFechar: () => void;
  /** Fichas que podem receber. */
  destinos: { id: string; rotulo: string }[];
  /** Destino já escolhido (ex.: aberto pela ficha). */
  destinoInicial?: string | null;
};

export function LancarItemModal({ grupoId, aberto, onFechar, destinos, destinoInicial = null }: Props) {
  const catalogo = useCatalogoItens(grupoId);
  const lancar = useLancarItem();
  const categorias = useCategoriasItem();
  const [categoria, setCategoria] = useState<string | undefined>(undefined);
  const [escolhido, setEscolhido] = useState<ItemModelo | null>(null);
  const [destino, setDestino] = useState<string>(destinoInicial ?? "");
  const [quantidade, setQuantidade] = useState("1");
  const [ultimo, setUltimo] = useState<string | null>(null);

  function fechar() {
    setEscolhido(null);
    setUltimo(null);
    lancar.reset();
    onFechar();
  }

  const lista = (catalogo.data ?? []).filter((i) => !categoria || i.categoria?.id === categoria);

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo={escolhido ? `Lançar: ${escolhido.nome}` : "Lançar item do catálogo"}>
      {!escolhido ? (
        <div className="form">
          {ultimo && <p className="sucesso">{ultimo}</p>}
          <div className="filtro" role="group" aria-label="Filtrar por categoria">
            <button type="button" className="filtro__opcao" aria-pressed={!categoria} onClick={() => setCategoria(undefined)}>Todos</button>
            {(categorias.data ?? []).map((c) => (
              <button key={c.id} type="button" className="filtro__opcao" aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>
                {c.nome}
              </button>
            ))}
          </div>
          {catalogo.isPending ? (
            <Loading compacto />
          ) : catalogo.isError ? (
            <ErrorState mensagem={mensagemDeErro(catalogo.error)} onTentarNovamente={() => catalogo.refetch()} />
          ) : lista.length === 0 ? (
            <EmptyState compacto titulo="Nenhum item no catálogo" descricao={<>Crie itens em <Link to="/mestre/itens">Itens</Link>.</>} />
          ) : (
            <ul className="itens">
              {lista.map((i) => (
                <ItemLinha key={i.id} item={i} onAbrir={() => { lancar.reset(); setQuantidade("1"); setEscolhido(i); }} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="form">
          <ItemDetalhe item={escolhido} />
          <Field rotulo="Para quem">
            <select value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="">Ninguém (vago no grupo)</option>
              {destinos.map((d) => <option key={d.id} value={d.id}>{d.rotulo}</option>)}
            </select>
          </Field>
          <Field rotulo="Quantidade">
            <input type="number" min={1} max={20} step={1} inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </Field>
          {lancar.isError && <div className="aviso">{erroDeFormulario(lancar.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={() => setEscolhido(null)} disabled={lancar.isPending}>Voltar</Button>
            <Button
              variante="primario"
              disabled={lancar.isPending}
              onClick={() =>
                lancar.mutate(
                  { modeloId: escolhido.id, grupoId, fichaId: destino || null, quantidade: Number(quantidade) || 1 },
                  {
                    onSuccess: () => {
                      const para = destinos.find((d) => d.id === destino)?.rotulo;
                      setUltimo(`${escolhido.nome} lançado ${para ? `para ${para}` : "vago no grupo"}.`);
                      setEscolhido(null);
                    },
                  },
                )
              }
            >
              {lancar.isPending ? "Lançando…" : "Lançar"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
