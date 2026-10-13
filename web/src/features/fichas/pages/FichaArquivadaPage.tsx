// Ficha arquivada: cópia somente leitura do personagem, que fica com o jogador mesmo sem o grupo.
import { Archive, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { ComNegrito } from "../../../components/texto/ComNegrito";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { TIPOS_EFEITO, type TipoEfeito } from "../../classes/types";
import { useExcluirFichaArquivada, useFichaArquivada } from "../api";
import { ROTULO_MOTIVO } from "../types";

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function FichaArquivadaPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const ficha = useFichaArquivada(id);
  const excluir = useExcluirFichaArquivada();
  const [confirmar, setConfirmar] = useState(false);

  if (ficha.isPending) return <Loading texto="Carregando ficha…" />;
  if (ficha.isError) return <ErrorState mensagem={mensagemDeErro(ficha.error)} onTentarNovamente={() => ficha.refetch()} />;
  const f = ficha.data;
  const c = f.conteudo;

  return (
    <div className="pagina">
      <LinkVoltar to="/jogador">Minhas fichas</LinkVoltar>
      <div className="aviso-kit" role="status">
        <Archive size={16} aria-hidden />
        <span>
          Ficha arquivada em {data(f.arquivadaEm)}: {ROTULO_MOTIVO[f.motivo].toLowerCase()}. É uma cópia só para leitura, com o personagem como estava.
        </span>
      </div>

      <div className="classe-cabecalho">
        <div className="ficha-arquivada__imagem">
          <ClasseImagem url={c.imagemUrl ?? c.classe.imagemUrl} titulo={f.nome} />
        </div>
        <div>
          <h1>{f.nome}</h1>
          <p className="pagina__subtitulo">{f.raca} · {f.classe} · Nível {f.nivel} · Grupo: {f.grupo}</p>
          {c.historia && <p className="ficha-arquivada__historia">{c.historia}</p>}
        </div>
      </div>

      <section className="secao">
        <h2>Recursos</h2>
        <ul className="ficha-arquivada__grade">
          <li><strong>Vida</strong> {c.vida.atual}/{c.vida.max}</li>
          <li><strong>Mana</strong> {c.mana.atual}/{c.mana.max}</li>
          <li><strong>Esforço</strong> {c.esforco.atual}/{c.esforco.max}</li>
          <li><strong>Deslocamento</strong> {c.raca.deslocamento} quadrados</li>
        </ul>
      </section>

      <section className="secao">
        <h2>Atributos</h2>
        <ul className="ficha-arquivada__grade">
          {c.atributos.map((a) => <li key={a.nome}><strong>{a.nome}</strong> {a.dados} ponto(s) · {a.teste}</li>)}
        </ul>
      </section>

      <section className="secao">
        <h2>Perícias</h2>
        {c.pericias.length === 0 ? <p className="pagina__subtitulo">Nenhuma perícia.</p> : (
          <ul className="ficha-arquivada__lista">
            {c.pericias.map((p) => <li key={p.nome}><span>{p.nome} <span className="pagina__subtitulo">({p.atributo})</span></span><span>+{p.total} · {p.teste}</span></li>)}
          </ul>
        )}
      </section>

      <section className="secao">
        <h2>Cartas</h2>
        {c.habilidades.length === 0 ? <p className="pagina__subtitulo">Nenhuma carta.</p> : (
          <ul className="ficha-arquivada__cartas">
            {c.habilidades.map((h, i) => (
              <li key={`${h.titulo}-${i}`} className="painel">
                <h3>{h.titulo}</h3>
                <p className="pagina__subtitulo">
                  {TIPOS_EFEITO[h.tipoEfeito as TipoEfeito]?.rotulo ?? h.tipoEfeito} · Nível {h.nivelNecessario}
                  {h.custoMana > 0 && ` · ${h.custoMana} de mana`}{h.teste && ` · Teste ${h.teste}`}
                </p>
                <p><ComNegrito texto={h.descricaoEfeito} /></p>
                {h.defesa && h.defesa.length > 0 && <p className="pagina__subtitulo">Defesa do alvo: {[h.defesa].flat().join(" ou ")}</p>}
                {h.condicao && <p className="pagina__subtitulo">Condição: {h.condicao}</p>}
                {h.limite && <p className="pagina__subtitulo">Limite: {h.limite}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="secao">
        <h2>Inventário</h2>
        {c.inventario.length === 0 ? <p className="pagina__subtitulo">Inventário vazio.</p> : (
          <ul className="ficha-arquivada__lista">
            {c.inventario.map((item, i) => (
              <li key={`${item.nome}-${i}`}>
                <span>{item.nome}{item.categoria && <span className="pagina__subtitulo"> · {item.categoria}</span>}</span>
                <span className="pagina__subtitulo">{item.espacos} espaço(s){item.usosRestantes !== null && ` · ${item.usosRestantes} uso(s)`}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div>
        <Button variante="perigo" onClick={() => { excluir.reset(); setConfirmar(true); }}>
          <Trash2 size={16} aria-hidden /> Apagar esta ficha arquivada
        </Button>
      </div>

      <ConfirmDialog
        aberto={confirmar}
        titulo="Apagar ficha arquivada"
        rotuloConfirmar="Apagar"
        mensagem={<>Apagar a cópia de <strong>{f.nome}</strong>? Não dá para desfazer.</>}
        processando={excluir.isPending}
        erro={excluir.isError ? mensagemDeErro(excluir.error) : null}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={() => excluir.mutate(f.id, { onSuccess: () => navigate("/jogador", { replace: true }) })}
      />
    </div>
  );
}
