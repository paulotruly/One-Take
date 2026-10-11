import { CATEGORIAS, type CategoriaPericia } from "../types";

/** Ícone (lucide) da categoria da perícia, com o rótulo como texto acessível. */
export function CategoriaIcone({ categoria, tamanho = 18 }: { categoria: CategoriaPericia; tamanho?: number }) {
  const { Icone, rotulo, descricao } = CATEGORIAS[categoria];
  return (
    <span className="categoria-icone" title={`${rotulo}: ${descricao}`}>
      <Icone size={tamanho} aria-hidden />
      <span className="sr-only">{rotulo}</span>
    </span>
  );
}
