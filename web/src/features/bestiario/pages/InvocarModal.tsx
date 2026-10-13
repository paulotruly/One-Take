// Container: o mestre escolhe uma criatura do bestiário, o nível e quantas invocar no grupo.
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo } from "../../../lib/api";
import { useBestas, useInvocar } from "../api";

export function InvocarModal({ grupoId, aberto, onFechar }: { grupoId: string; aberto: boolean; onFechar: () => void }) {
  const bestas = useBestas();
  const invocar = useInvocar(grupoId);
  const [bestaId, setBestaId] = useState("");
  const [nivel, setNivel] = useState("1");
  const [quantidade, setQuantidade] = useState("1");
  // Só criaturas gerais ou exclusivas deste grupo.
  const opcoes = (bestas.data ?? []).filter((b) => !b.grupoExclusivoId || b.grupoExclusivoId === grupoId);
  const erros = errosDeCampo(invocar.error);

  function fechar() {
    invocar.reset();
    onFechar();
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo="Invocar criatura">
      {bestas.isPending ? (
        <Loading compacto />
      ) : opcoes.length === 0 ? (
        <EmptyState compacto titulo="Nenhuma criatura no bestiário" descricao={<>Crie criaturas em <Link to="/mestre/bestiario">Bestiário</Link>.</>} />
      ) : (
        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            invocar.mutate(
              { bestaId, nivel: Number(nivel) || 1, quantidade: Number(quantidade) || 1 },
              { onSuccess: fechar },
            );
          }}
        >
          <Field rotulo="Criatura" erro={erros.bestaId}>
            <select value={bestaId} onChange={(e) => setBestaId(e.target.value)}>
              <option value="">Escolha…</option>
              {opcoes.map((b) => (
                <option key={b.id} value={b.id}>{b.conceito ? `${b.conceito.titulo}: ${b.titulo}` : b.titulo}</option>
              ))}
            </select>
          </Field>
          <div className="form__linha">
            <Field rotulo="Nível" erro={erros.nivel} dica="Mesma progressão das classes">
              <input type="number" min={1} max={100} step={1} inputMode="numeric" value={nivel} onChange={(e) => setNivel(e.target.value)} />
            </Field>
            <Field rotulo="Quantidade" erro={erros.quantidade} dica="Até 20 de uma vez">
              <input type="number" min={1} max={20} step={1} inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </Field>
          </div>
          <p className="pagina__subtitulo">As criaturas entram com vida, mana e esforço cheios. Toque numa criatura na lista para abrir a ficha dela.</p>
          {invocar.isError && <div className="aviso">{erroDeFormulario(invocar.error)}</div>}
          <div className="modal__acoes">
            <Button onClick={fechar} disabled={invocar.isPending}>Cancelar</Button>
            <Button type="submit" variante="primario" disabled={!bestaId || invocar.isPending}>{invocar.isPending ? "Invocando…" : "Invocar"}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
