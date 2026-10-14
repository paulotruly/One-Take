// Tela do kit: o que está dentro, por tipo, com link para cada coisa. Serve para o kit do mestre e para o verificado.
import { Check, Package } from "lucide-react";
import { Link, useParams } from "react-router";
import type { ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { AcessoBadge } from "../../verificados/components/VerificadoBadge";
import { SeloVerificado } from "../../verificados/pages/SeloVerificado";
import { useKit, useKitAtivo } from "../api";

type Coisa = { id: string; nome: string };

function Bloco({ titulo, itens, item }: { titulo: string; itens: Coisa[]; item: (c: Coisa) => ReactNode }) {
  if (itens.length === 0) return null;
  return (
    <section className="secao">
      <h2>{titulo} <span className="pagina__subtitulo">({itens.length})</span></h2>
      <div className="conceito__subclasses">{itens.map(item)}</div>
    </section>
  );
}

export function KitDetalhePage() {
  const { id = "" } = useParams();
  const kit = useKit(id);
  const { kitId, definir } = useKitAtivo();

  if (kit.isPending) return <Loading texto="Carregando kit…" />;
  if (kit.isError) return <ErrorState mensagem={mensagemDeErro(kit.error)} onTentarNovamente={() => kit.refetch()} />;
  const k = kit.data;
  const d = k.dentro;
  const link = (para: (c: Coisa) => string) => (c: Coisa) => <Link key={c.id} to={para(c)} className="conceito__subclasse">{c.nome}</Link>;
  const vazio = Object.entries(d).every(([tipo, l]) => tipo === "grupos" || l.length === 0);

  return (
    <div className="pagina">
      <LinkVoltar to="/mestre/kits">Kits de RPG</LinkVoltar>
      <div className="pagina__cabecalho">
        <div>
          {(k.verificado || k.deOutro) && <div className="classe-cabecalho__selos"><AcessoBadge item={k} /></div>}
          <h1><Package size={24} aria-hidden /> {k.nome} <SeloVerificado tipo="kit" item={k} /></h1>
          {k.descricao && <p className="pagina__subtitulo">{k.descricao}</p>}
        </div>
        {k.id === kitId ? (
          <Button onClick={() => definir(null)}><Check size={16} aria-hidden /> Kit ativo · mostrar tudo</Button>
        ) : (
          <Button variante="primario" onClick={() => definir(k.id)}>Usar este kit</Button>
        )}
      </div>

      {vazio && (
        <p className="pagina__subtitulo">
          Vazio por enquanto. {k.deOutro ? "" : "Para pôr algo no kit, marque o kit no campo Kits de RPG do formulário de cada coisa."}
        </p>
      )}
      <Bloco titulo="Classes" itens={d.classes} item={link((c) => `/mestre/classes/${c.id}`)} />
      <Bloco titulo="Raças" itens={d.racas} item={link((c) => `/mestre/racas/${c.id}`)} />
      <Bloco titulo="Criaturas" itens={d.bestas} item={link((c) => `/mestre/bestiario/${c.id}`)} />
      <Bloco titulo="NPCs" itens={d.npcs} item={link((c) => `/mestre/npcs/${c.id}`)} />
      <Bloco titulo="Atributos" itens={d.atributos} item={link(() => "/mestre/pericias")} />
      <Bloco titulo="Perícias" itens={d.pericias} item={(c) => (
        <Link key={c.id} to="/mestre/pericias" className="conceito__subclasse">
          {c.nome} <span className="pagina__subtitulo">({d.pericias.find((p) => p.id === c.id)?.atributo})</span>
        </Link>
      )} />
      <Bloco titulo="Status" itens={d.status} item={(c) => (
        <Link key={c.id} to="/mestre/status"><StatusBadge nome={c.nome} tipo={d.status.find((s) => s.id === c.id)!.tipo} /></Link>
      )} />
      <Bloco titulo="Itens do catálogo" itens={d.itens} item={link(() => "/mestre/itens")} />
      <Bloco titulo="Grupos que usam o kit" itens={d.grupos} item={link((c) => `/mestre/grupos/${c.id}`)} />
    </div>
  );
}
