// Ficha da criatura invocada (container): recursos ajustáveis, atributos, perícias com teste e cartas do nível.
// Vida ou mana em 0 = a criatura morre e some do grupo.
import { Dices, Droplet, Footprints, Heart, LogOut, Zap } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { HabilidadesDeck } from "../../classes/components/HabilidadesDeck";
import { BarraRecurso } from "../../fichas/components/BarraRecurso";
import { useCriatura, useEditarCriatura, useRemoverCriatura } from "../api";

type Props = {
  criaturaId: string | null;
  onFechar: () => void;
  /** Avisa a página quando a criatura some (morreu ou foi removida). */
  onSumiu: (mensagem: string) => void;
};

export function CriaturaModal({ criaturaId, onFechar, onSumiu }: Props) {
  const criatura = useCriatura(criaturaId);
  const editar = useEditarCriatura();
  const remover = useRemoverCriatura();
  const c = criatura.data;

  function mudar(dados: { vidaAtual?: number; manaAtual?: number; esforcoAtual?: number }) {
    if (!c) return;
    editar.mutate(
      { id: c.id, dados },
      { onSuccess: (r) => r.removida && onSumiu(`${c.nome} morreu e saiu do grupo.`) },
    );
  }

  return (
    <Modal aberto={!!criaturaId} onFechar={onFechar} titulo={c ? `${c.nome} · nível ${c.nivel}` : "Criatura"} largo>
      {criatura.isPending ? (
        <Loading compacto />
      ) : criatura.isError || !c ? (
        <ErrorState mensagem={mensagemDeErro(criatura.error)} onTentarNovamente={() => criatura.refetch()} />
      ) : (
        <div className="form">
          <p className="pagina__subtitulo">
            {c.besta.titulo} · <Footprints size={12} aria-hidden /> {c.besta.deslocamento} quadrados por turno
          </p>
          {(editar.isError || remover.isError) && <div className="aviso">{mensagemDeErro(editar.error ?? remover.error)}</div>}
          <div className="recursos">
            <BarraRecurso rotulo="Vida" Icone={Heart} tipo="vida" atual={c.vida.atual} max={c.vida.max} editavel ocupado={editar.isPending} onMudar={(v) => mudar({ vidaAtual: v })} />
            <BarraRecurso rotulo="Mana" Icone={Droplet} tipo="mana" atual={c.mana.atual} max={c.mana.max} editavel ocupado={editar.isPending} onMudar={(v) => mudar({ manaAtual: v })} />
            <BarraRecurso rotulo="Esforço" Icone={Zap} tipo="esforco" atual={c.esforco.atual} max={c.esforco.max} editavel ocupado={editar.isPending} onMudar={(v) => mudar({ esforcoAtual: v })} />
          </div>
          <p className="pagina__subtitulo">Vida ou mana em 0: a criatura morre e some do grupo sozinho.</p>

          {c.atributos.length > 0 && (
            <div>
              <h3>Atributos</h3>
              <ul className="lista-simples">
                {c.atributos.map((a) => (
                  <li key={a.id}><strong>{a.nome}</strong>: <Dices size={12} aria-hidden /> {a.teste}</li>
                ))}
              </ul>
            </div>
          )}
          {c.pericias.length > 0 && (
            <div>
              <h3>Perícias</h3>
              <ul className="lista-simples">
                {c.pericias.map((p) => (
                  <li key={p.id}><strong>{p.nome}</strong> ({p.atributo.nome}): <Dices size={12} aria-hidden /> {p.teste}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3>Cartas no nível {c.nivel}</h3>
            <HabilidadesDeck habilidades={c.habilidades} vazio="Nenhuma carta neste nível" />
            {c.proximasHabilidades > 0 && <p className="pagina__subtitulo">Mais {c.proximasHabilidades} em níveis maiores.</p>}
          </div>

          <div className="modal__acoes modal__acoes--quebra">
            <Button
              variante="perigo"
              disabled={remover.isPending}
              onClick={() => remover.mutate(c.id, { onSuccess: () => onSumiu(`${c.nome} saiu do grupo.`) })}
            >
              <LogOut size={16} aria-hidden /> Remover (fugiu, sumiu)
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
