// Criar e editar mesa: informações, o kit (o que vale na mesa vem dele) e as regras de combate, numa tela só.
import { Package } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { LinkVoltar } from "../../../components/ui/LinkVoltar";
import { ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import { useRegras } from "../../docs/regras";
import { useKitAtivo, useKits } from "../../kits/api";
import type { Kit } from "../../kits/types";
import { useCriarGrupo, useEditarGrupo, useGrupo } from "../api";
import { GrupoInfoForm, GrupoJogadoresForm, type GrupoInfo } from "../components/GrupoInfoForm";
import type { GrupoDetalhe } from "../types";

/** Limite por função no formulário: vazio = sem limite. */
const limiteParaCampo = (n: number | null | undefined) => (n == null ? "" : String(n));
const campoParaLimite = (v: string) => (v.trim() === "" ? null : Number(v));

export function NovoGrupoPage() {
  return <Formulario />;
}

export function EditarGrupoPage() {
  const { id = "" } = useParams();
  const grupo = useGrupo(id);
  if (grupo.isPending) return <Loading texto="Carregando mesa…" />;
  if (grupo.isError) return <ErrorState mensagem={mensagemDeErro(grupo.error)} onTentarNovamente={() => grupo.refetch()} />;
  return <Formulario grupo={grupo.data} />;
}

function Formulario({ grupo }: { grupo?: GrupoDetalhe }) {
  const navigate = useNavigate();
  const kits = useKits();
  const { kitId: kitAtivo } = useKitAtivo();
  const criar = useCriarGrupo();
  const editar = useEditarGrupo(grupo?.id ?? "");
  const { regrasPadrao } = useRegras();
  // Regras padrão de combate desligadas (slugs); as que saíram do sistema são ignoradas ao salvar.
  const [desativadas, setDesativadas] = useState<string[]>(grupo?.regrasPadraoDesativadas ?? []);
  const alternarRegra = (slug: string, vale: boolean) =>
    setDesativadas((d) => (vale ? d.filter((s) => s !== slug) : [...d, slug]));

  const [info, setInfo] = useState<GrupoInfo>({
    titulo: grupo?.titulo ?? "",
    sinopse: grupo?.sinopse ?? "",
    genero: grupo?.genero ?? "",
    imagemUrl: grupo?.imagemUrl ?? "",
    limiteMembros: String(grupo?.limiteMembros ?? 4),
    permitirClassesRepetidas: grupo?.permitirClassesRepetidas ?? true,
    limiteCombatentes: limiteParaCampo(grupo?.limiteCombatentes),
    limiteVanguardistas: limiteParaCampo(grupo?.limiteVanguardistas),
    limiteSuportes: limiteParaCampo(grupo?.limiteSuportes),
  });
  const [kitId, setKitId] = useState<string | null>(grupo ? grupo.kitId : kitAtivo);
  const kit = kits.data?.find((k) => k.id === kitId) ?? null;

  const erro = criar.error ?? editar.error;
  const enviando = criar.isPending || editar.isPending;

  function dadosInfo() {
    return {
      titulo: info.titulo,
      sinopse: info.sinopse,
      genero: info.genero,
      imagemUrl: info.imagemUrl.trim() || null,
      limiteMembros: info.limiteMembros.trim() === "" ? (undefined as unknown as number) : Number(info.limiteMembros),
      permitirClassesRepetidas: info.permitirClassesRepetidas,
      limiteCombatentes: campoParaLimite(info.limiteCombatentes),
      limiteVanguardistas: campoParaLimite(info.limiteVanguardistas),
      limiteSuportes: campoParaLimite(info.limiteSuportes),
      kitId,
      regrasPadraoDesativadas: desativadas.filter((s) => regrasPadrao.some((r) => r.slug === s)),
    };
  }

  async function salvar() {
    if (grupo) {
      await editar.mutateAsync(dadosInfo());
      navigate(`/mestre/grupos/${grupo.id}`);
    } else {
      const novo = await criar.mutateAsync(dadosInfo());
      navigate(`/mestre/grupos/${novo.id}`);
    }
  }

  return (
    <div className="pagina">
      <LinkVoltar to={grupo ? `/mestre/grupos/${grupo.id}` : "/mestre/grupos"}>{grupo ? grupo.titulo : "Mesas"}</LinkVoltar>
      <div>
        <h1>{grupo ? "Editar mesa" : "Nova mesa"}</h1>
        <p className="pagina__subtitulo">A mesa é o seu RPG: os jogadores entram com o código e criam a ficha com o que está no kit da mesa.</p>
      </div>

      <div className="grupo-form">
        <div className="grupo-form__coluna">
          <section className="secao">
            <h2>Informações</h2>
            <GrupoInfoForm valor={info} onChange={setInfo} erros={errosDeCampo(erro)} />
          </section>
          <section className="secao">
            <h2>Regras de combate</h2>
            <p className="pagina__subtitulo">
              As regras padrão valem em toda mesa. Desmarque as que não quiser nesta mesa; regras próprias você cria na página da mesa.
            </p>
            <div className="regras-padrao__lista">
              {regrasPadrao.map((r) => (
                <label key={r.slug} className="checklist__item">
                  <input type="checkbox" checked={!desativadas.includes(r.slug)} onChange={(e) => alternarRegra(r.slug, e.target.checked)} />
                  <span><strong>{r.titulo}</strong>: {r.resumo}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
        <div className="grupo-form__coluna">
          <section className="secao">
            <h2>O que vale nesta mesa</h2>
            <p className="pagina__subtitulo">
              O que vale na mesa vem do kit: as classes, raças, atributos, perícias e status dele (os status automáticos valem sempre). Monte o kit
              antes, em <Link to="/mestre/kits">Kits de RPG</Link>. Mudou o kit depois? A mesa acompanha.
            </p>
            <Field rotulo="Kit de RPG">
              <select value={kitId ?? ""} onChange={(e) => setKitId(e.target.value || null)} disabled={kits.isPending}>
                <option value="">{grupo && !grupo.kitId ? "Sem kit (mantém o que já estava marcado)" : "Escolha um kit"}</option>
                {(kits.data ?? []).map((k) => <option key={k.id} value={k.id}>{k.nome}</option>)}
              </select>
            </Field>
            {kits.isError && <ErrorState mensagem={mensagemDeErro(kits.error)} onTentarNovamente={() => kits.refetch()} />}
            {kit ? (
              <ResumoDoKit kit={kit} />
            ) : (
              !kits.isPending && (
                <div className="aviso">
                  {(kits.data ?? []).length === 0 ? <>Você ainda não tem kits. <Link to="/mestre/kits">Crie um kit</Link> com as classes e raças da aventura.</> : "Sem kit, os jogadores não têm classes nem raças novas para escolher."}
                </div>
              )
            )}
          </section>
          <section className="secao">
            <h2>Jogadores</h2>
            <GrupoJogadoresForm valor={info} onChange={setInfo} erros={errosDeCampo(erro)} />
          </section>
        </div>
      </div>

      {erro && <div className="aviso">{erroDeFormulario(erro)}</div>}
      <div className="barra-acoes">
        <Button onClick={() => navigate(grupo ? `/mestre/grupos/${grupo.id}` : "/mestre/grupos")} disabled={enviando}>
          Cancelar
        </Button>
        <Button variante="primario" onClick={() => salvar().catch(() => undefined)} disabled={enviando}>
          {enviando ? "Salvando…" : grupo ? "Salvar mesa" : "Criar mesa"}
        </Button>
      </div>
    </div>
  );
}

const ROTULOS_RESUMO: [keyof Kit["conteudo"], string, string][] = [
  ["classes", "classe", "classes"], ["racas", "raça", "raças"], ["atributos", "atributo", "atributos"], ["pericias", "perícia", "perícias"],
  ["status", "status", "status"], ["itens", "item", "itens"], ["bestas", "criatura", "criaturas"], ["npcs", "NPC", "NPCs"],
];

/** O que o kit leva para a mesa, em números, com link para editar o kit. */
function ResumoDoKit({ kit }: { kit: Kit }) {
  const partes = ROTULOS_RESUMO.filter(([c]) => kit.conteudo[c] > 0).map(([c, um, varios]) => `${kit.conteudo[c]} ${kit.conteudo[c] === 1 ? um : varios}`);
  return (
    <div className="aviso-kit">
      <Package size={18} aria-hidden className="aviso-kit__icone" />
      <span>
        <strong>{kit.nome}</strong>: {partes.join(" · ") || "vazio por enquanto"}.
        {kit.conteudo.classes === 0 || kit.conteudo.racas === 0 ? " Sem classe ou raça no kit, os jogadores não conseguem criar a ficha." : ""}
      </span>
      <Link to={`/mestre/kits/${kit.id}`} className="btn btn--pequeno">Editar o kit</Link>
    </div>
  );
}
