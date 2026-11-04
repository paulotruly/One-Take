import type { LucideIcon } from "lucide-react";

type Aba<T extends string> = { id: T; rotulo: string; Icone?: LucideIcon };

/** Abas simples: quem usa guarda a aba atual e mostra o conteúdo dela. */
export function Abas<T extends string>({ abas, atual, onMudar, rotulo }: { abas: Aba<T>[]; atual: T; onMudar: (id: T) => void; rotulo: string }) {
  return (
    <div className="abas" role="tablist" aria-label={rotulo}>
      {abas.map(({ id, rotulo: r, Icone }) => (
        <button key={id} type="button" role="tab" className="abas__aba" aria-selected={id === atual} onClick={() => onMudar(id)}>
          {Icone && <Icone size={16} aria-hidden />} {r}
        </button>
      ))}
    </div>
  );
}
