// Início do mestre: grupos recentes, o que já foi criado e o próximo passo.
import { ArrowRight, Backpack, Layers, PawPrint, Plus, Shield, Users, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { useMe } from "../../../auth/AuthProvider";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { useBestas } from "../../bestiario/api";
import { useClasses } from "../../classes/api";
import { useRacas } from "../../racas/api";
import { useGrupos } from "../api";

function Contagem({ to, Icone, rotulo, total }: { to: string; Icone: LucideIcon; rotulo: string; total: number | undefined }) {
  return (
    <Link to={to} className="painel-mestre__contagem">
      <Icone size={20} aria-hidden />
      <strong>{total ?? "-"}</strong>
      <span className="pagina__subtitulo">{rotulo}</span>
    </Link>
  );
}

export function PainelMestrePage() {
  const me = useMe();
  const grupos = useGrupos();
  const classes = useClasses();
  const racas = useRacas();
  const bestas = useBestas();

  const minhas = <T extends { deOutro?: boolean }>(lista: T[] | undefined) => lista?.filter((x) => !x.deOutro).length;
  const totalClasses = minhas(classes.data);
  const totalRacas = minhas(racas.data);
  const totalBestas = minhas(bestas.data);

  // Só o próximo passo que falta, na ordem em que um mestre costuma preparar a mesa.
  const passo = !grupos.data
    ? null
    : (classes.data?.length ?? 0) === 0
      ? { texto: "Crie a primeira classe, ou duplique uma verificada.", to: "/mestre/classes/nova", acao: "Criar classe" }
      : (racas.data?.length ?? 0) === 0
        ? { texto: "Crie a primeira raça para as fichas.", to: "/mestre/racas", acao: "Ir para raças" }
        : grupos.data.length === 0
          ? { texto: "Com classes e raças prontas, monte a mesa e chame os jogadores.", to: "/mestre/grupos/novo", acao: "Criar mesa" }
          : grupos.data.find((g) => g.membros === 0)
            ? { texto: `Ninguém entrou em ${grupos.data.find((g) => g.membros === 0)!.titulo} ainda. Envie o convite aos jogadores.`, to: `/mestre/grupos/${grupos.data.find((g) => g.membros === 0)!.id}`, acao: "Abrir mesa" }
            : null;

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Olá, {me.data?.nome || `@${me.data?.nickname ?? ""}`}</h1>
          <p className="pagina__subtitulo">O que está acontecendo nas suas mesas.</p>
        </div>
        <Link to="/mestre/grupos/novo" className="btn btn--primario"><Plus size={16} aria-hidden /> Nova mesa</Link>
      </div>

      {passo && (
        <div className="destaque painel-mestre__passo">
          <span><strong>Próximo passo:</strong> {passo.texto}</span>
          <Link to={passo.to} className="btn">{passo.acao} <ArrowRight size={16} aria-hidden /></Link>
        </div>
      )}

      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Mesas recentes</h2>
          <Link to="/mestre/grupos">Ver todos</Link>
        </div>
        {grupos.isPending ? (
          <Loading compacto />
        ) : grupos.isError ? (
          <ErrorState mensagem={mensagemDeErro(grupos.error)} onTentarNovamente={() => grupos.refetch()} />
        ) : grupos.data.length === 0 ? (
          <p className="pagina__subtitulo">Nenhuma mesa ainda.</p>
        ) : (
          <ul className="painel-mestre__grupos">
            {grupos.data.slice(0, 3).map((g) => (
              <li key={g.id}>
                <Link to={`/mestre/grupos/${g.id}`} className="painel-mestre__grupo">
                  <Shield size={20} aria-hidden />
                  <span className="membro__info">
                    <strong>{g.titulo}</strong>
                    <span className="pagina__subtitulo"><Users size={12} aria-hidden /> {g.membros} de {g.limiteMembros} jogadores · código {g.codigo}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="secao">
        <h2>Seu conteúdo</h2>
        <div className="painel-mestre__contagens">
          <Contagem to="/mestre" Icone={Layers} rotulo="Classes" total={totalClasses} />
          <Contagem to="/mestre/racas" Icone={Users} rotulo="Raças" total={totalRacas} />
          <Contagem to="/mestre/bestiario" Icone={PawPrint} rotulo="Criaturas" total={totalBestas} />
          <Link to="/mestre/itens" className="painel-mestre__contagem">
            <Backpack size={20} aria-hidden />
            <strong>Itens</strong>
            <span className="pagina__subtitulo">Abrir catálogo</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
