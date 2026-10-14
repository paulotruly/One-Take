// Apresentação de itens: linha compacta (boa no celular) e detalhes completos (pop-up).
import { Ban, ChevronRight, Repeat } from "lucide-react";
import type { ReactNode } from "react";
import { iconeDe, rotuloEspacos, rotuloUsos, type Item } from "../types";

function Miniatura({ item }: { item: Item }) {
  const Icone = iconeDe(item.categoria?.icone);
  return item.imagemUrl ? (
    <img className="item__miniatura" src={item.imagemUrl} alt="" loading="lazy" />
  ) : (
    <span className="item__miniatura item__miniatura--icone" aria-hidden>
      <Icone size={20} />
    </span>
  );
}

/** Linha do inventário / catálogo. Toque abre os detalhes. */
export function ItemLinha({ item, onAbrir, naoSabeUsar, extra, aposNome }: { item: Item; onAbrir: () => void; naoSabeUsar?: boolean; extra?: ReactNode; aposNome?: ReactNode }) {
  const usos = rotuloUsos(item);
  return (
    <li className="item">
      <button type="button" className="item__abrir" onClick={onAbrir}>
        <Miniatura item={item} />
        <span className="item__info">
          <strong className="item__nome">{item.nome} {aposNome}</strong>
          <span className="item__chips">
            {item.categoria && <span className="selo">{item.categoria.nome}</span>}
            <span className="selo">{rotuloEspacos(item.espacos)}</span>
            {usos && (
              <span className="selo selo--mana">
                <Repeat size={12} aria-hidden /> {usos}
              </span>
            )}
            {naoSabeUsar && (
              <span className="selo selo--status-DEBUFF" title="Este personagem não cumpre o pré-requisito">
                <Ban size={12} aria-hidden /> Não sabe usar
              </span>
            )}
            {extra}
          </span>
        </span>
        <ChevronRight size={18} className="item__seta" aria-hidden />
      </button>
    </li>
  );
}

/** Tudo sobre o item: imagem, descrição, efeito, espaços, usos e pré-requisitos. */
export function ItemDetalhe({ item, motivoNaoPodeUsar }: { item: Item; motivoNaoPodeUsar?: string | null }) {
  const usos = rotuloUsos(item);
  const Icone = iconeDe(item.categoria?.icone);
  const temRequisito = item.requisito || item.requisitoClasse || item.requisitoPericia;
  return (
    <div className="item-detalhe">
      {item.imagemUrl && <img className="item-detalhe__imagem" src={item.imagemUrl} alt={item.nome} />}
      <div className="carta__selos carta__selos--esquerda">
        <span className="selo"><Icone size={12} aria-hidden /> {item.categoria?.nome ?? "Sem categoria"}</span>
        <span className="selo">{rotuloEspacos(item.espacos)}</span>
        <span className="selo selo--mana"><Repeat size={12} aria-hidden /> {usos ?? "Usos sem limite"}</span>
      </div>
      {item.descricao && <p className="carta__descricao">{item.descricao}</p>}
      {item.efeito && (
        <p className="carta__efeito">
          <strong>Ao usar:</strong> {item.efeito}
        </p>
      )}
      {temRequisito && (
        <div className="item-detalhe__requisitos">
          <strong>Pré-requisito para saber usar</strong>
          <ul>
            {item.requisitoClasse && <li>Classe: {item.requisitoClasse.titulo}</li>}
            {item.requisitoPericia && <li>Ter a perícia {item.requisitoPericia.nome}</li>}
            {item.requisito && <li>{item.requisito}</li>}
          </ul>
        </div>
      )}
      {motivoNaoPodeUsar && <div className="aviso">{motivoNaoPodeUsar}</div>}
    </div>
  );
}
