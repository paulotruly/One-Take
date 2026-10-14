// Bestiário do mestre: criaturas montadas como classes, prontas para invocar nos grupos.
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { AvisoKit } from "../../kits/components/AvisoKit";
import { useKitAtivo } from "../../kits/api";
import { soDoKit } from "../../kits/types";
import { Footprints, PawPrint, Plus } from "lucide-react";
import { Link } from "react-router";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { ConceitosBloco } from "../../classes/components/ConceitosBloco";
import { StatsBar } from "../../classes/components/StatsBar";
import { useBestas, useConceitosBesta, useCriarConceitoBesta, useEditarConceitoBesta, useExcluirConceitoBesta } from "../api";

export function BestiarioPage() {
  const bestas = useBestas();
  const { kitId } = useKitAtivo();
  const bestasNoKit = (bestas.data ?? []).filter((x) => soDoKit(x.kitIds, kitId));
  const conceitos = useConceitosBesta();

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Bestiário</h1>
          <p className="pagina__subtitulo">
            Criaturas funcionam como classes: vida, mana e esforço, perícias, dados por atributo e cartas com nível. No grupo, você invoca
            as criaturas no nível que quiser e acompanha a ficha de cada uma.
          </p>
        </div>
        <Link to="/mestre/bestiario/novo" className="btn btn--primario">
          <Plus size={16} aria-hidden /> Nova criatura
        </Link>
      </div>

      <ConceitosBloco
        titulo="Arquétipos de criatura"
        nome="arquétipo de criatura"
        explicacao="Uma criatura generalista (ex.: Lobo) com várias formas (Lobo das neves, Lobo alfa)."
        exemplo="Ex.: Lobo"
        rotuloFilho="Forma"
        conceitos={conceitos.data?.map((c) => ({ ...c, filhos: c.formas }))}
        carregando={conceitos.isPending}
        erro={conceitos.error}
        onTentarNovamente={() => conceitos.refetch()}
        hrefFilho={(id) => `/mestre/bestiario/${id}`}
        hrefNovoFilho={(id) => `/mestre/bestiario/novo?conceito=${id}`}
        criar={useCriarConceitoBesta()}
        editar={useEditarConceitoBesta()}
        excluir={useExcluirConceitoBesta()}
        selo={(c) => <SeloVerificado tipo="bestaConceito" item={c} />}
      />

      <h2>Todas as criaturas</h2>
      <AvisoKit />
      {bestas.isPending ? (
        <Loading texto="Carregando bestiário…" />
      ) : bestas.isError ? (
        <ErrorState mensagem={mensagemDeErro(bestas.error)} onTentarNovamente={() => bestas.refetch()} />
      ) : bestasNoKit.length === 0 ? (
        <EmptyState titulo="Nenhuma criatura ainda" descricao="Crie a primeira criatura para invocar nas sessões." />
      ) : (
        <div className="galeria">
          {bestasNoKit.map((b) => (
            <article key={b.id} className="classe-card">
              <Link to={`/mestre/bestiario/${b.id}`} className="classe-card__link">
                <div className="classe-card__retrato">
                  <ClasseImagem url={b.imagemUrl} titulo={b.titulo} />
                  <div className="classe-card__selos">
                    <span className="selo"><PawPrint size={12} aria-hidden /> Criatura</span>
                    <span className="selo">{b.cartas ?? 0} cartas</span>
                  </div>
                </div>
                <div className="classe-card__corpo">
                  {b.conceito && <span className="classe-card__conceito">{b.conceito.titulo}</span>}
                  <h3>{b.titulo} {b.verificado && <VerificadoBadge porKit={b.verificadoPorKit && !b.seloProprio} />}</h3>
                  <StatsBar vida={b.pontosVida} mana={b.pontosMana} esforco={b.pontosEsforco} compacto />
                  <span className="stat"><Footprints size={12} aria-hidden /> {b.deslocamento} quadrados</span>
                  <p className="classe-card__descricao">{b.descricao}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
