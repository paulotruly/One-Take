// Detalhes de uma classe para o jogador decidir: dados, cartela completa e perícias.
import { Lock } from "lucide-react";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import { HabilidadesDeck } from "../../classes/components/HabilidadesDeck";
import { GrupoBadge } from "../../classes/components/Selos";
import { StatsBar } from "../../classes/components/StatsBar";
import type { Classe, Habilidade } from "../../classes/types";
import { PericiaItem } from "../../pericias/components/PericiaItem";
import { PericiasPorAtributo } from "../../pericias/components/PericiasPorAtributo";
import type { PericiaDaClasse } from "../../pericias/types";

type Props = { classe: Classe & { habilidades: Habilidade[]; pericias: PericiaDaClasse[] } };

export function ClasseDetalhes({ classe: c }: Props) {
  const iniciais = c.habilidades.filter((h) => h.nivelNecessario <= 1);
  const depois = c.habilidades.filter((h) => h.nivelNecessario > 1);

  return (
    <div className="classe-detalhes">
      <div className="classe-cabecalho">
        <div className="classe-cabecalho__retrato">
          <ClasseImagem url={c.imagemUrl} titulo={c.titulo} />
        </div>
        <div className="classe-cabecalho__info">
          {c.conceito && <p className="classe-card__conceito">Subclasse de {c.conceito.titulo}</p>}
          <GrupoBadge grupo={c.grupo} />
          <StatsBar vida={c.pontosVida} mana={c.pontosMana} esforco={c.pontosEsforco} />
          <p className="pagina__subtitulo">Vida, mana e esforço iniciais (nível 1). Cada nível soma +5 em cada um.</p>
          <p className="classe-cabecalho__descricao">{c.descricao}</p>
        </div>
      </div>

      <section className="secao">
        <h3>Cartas desde o nível 1 ({iniciais.length})</h3>
        {iniciais.length === 0 ? (
          <p className="pagina__subtitulo">Nenhuma carta no nível inicial.</p>
        ) : (
          <HabilidadesDeck habilidades={iniciais} />
        )}
      </section>

      {depois.length > 0 && (
        <section className="secao">
          <h3>
            <Lock size={16} aria-hidden /> Liberadas ao subir de nível ({depois.length})
          </h3>
          <HabilidadesDeck habilidades={depois} />
        </section>
      )}

      <section className="secao">
        <h3>Perícias da classe</h3>
        {c.pericias.length === 0 ? (
          <p className="pagina__subtitulo">Esta classe não dá perícias.</p>
        ) : (
          <PericiasPorAtributo
            pericias={c.pericias}
            mostrarDescricao={false}
            renderItem={(p) => <PericiaItem key={p.id} pericia={p} valor={p.modificador} tituloValor="Modificador da classe" />}
          />
        )}
      </section>
    </div>
  );
}
