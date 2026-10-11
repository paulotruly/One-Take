// Catálogo do mestre: atributos (3 fixos + os dele) e perícias (nome, descrição, categoria, atributo).
// Classes e raças usam perícias deste catálogo.
import { Lock, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { Modal } from "../../../components/ui/Modal";
import { EmptyState, ErrorState, Loading } from "../../../components/ui/States";
import { erroDeFormulario, errosDeCampo, mensagemDeErro } from "../../../lib/api";
import {
  useAtributos,
  useCatalogo,
  useCriarAtributo,
  useCriarPericia,
  useEditarAtributo,
  useEditarPericia,
  useExcluirAtributo,
  useExcluirPericia,
} from "../api";
import { useGrupos } from "../../grupos/api";
import { CategoriaIcone } from "../components/CategoriaIcone";
import { AtributoForm, PericiaCatalogoForm } from "../components/forms";
import { PericiaItem } from "../components/PericiaItem";
import { PericiasPorAtributo } from "../components/PericiasPorAtributo";
import { CATEGORIAS, LISTA_CATEGORIAS, type Atributo, type PericiaCatalogo } from "../types";

function usos(p: PericiaCatalogo) {
  const partes = [];
  if (p.usosClasses) partes.push(`${p.usosClasses} ${p.usosClasses === 1 ? "classe" : "classes"}`);
  if (p.usosRacas) partes.push(`${p.usosRacas} ${p.usosRacas === 1 ? "raça" : "raças"}`);
  return partes.length ? `Usada em ${partes.join(" e ")}` : "Não usada em classes nem raças";
}

type Exclusao = { tipo: "pericia"; item: PericiaCatalogo } | { tipo: "atributo"; item: Atributo } | null;

export function PericiasPage() {
  const catalogo = useCatalogo();
  const atributos = useAtributos();
  const criar = useCriarPericia();
  const editar = useEditarPericia();
  const excluirPericia = useExcluirPericia();
  const criarAtributo = useCriarAtributo();
  const editarAtributo = useEditarAtributo();
  const excluirAtributo = useExcluirAtributo();
  const grupos = useGrupos();

  // undefined = fechado; null = novo; objeto = editando
  const [periciaEmEdicao, setPericiaEmEdicao] = useState<PericiaCatalogo | null | undefined>(undefined);
  const [atributoEmEdicao, setAtributoEmEdicao] = useState<Atributo | null | undefined>(undefined);
  const [exclusao, setExclusao] = useState<Exclusao>(null);

  const salvandoPericia = periciaEmEdicao ? editar : criar;
  const salvandoAtributo = atributoEmEdicao ? editarAtributo : criarAtributo;
  const excluindo = exclusao?.tipo === "atributo" ? excluirAtributo : excluirPericia;

  function abrirPericia(p: PericiaCatalogo | null) {
    criar.reset();
    editar.reset();
    setPericiaEmEdicao(p);
  }
  function abrirAtributo(a: Atributo | null) {
    criarAtributo.reset();
    editarAtributo.reset();
    setAtributoEmEdicao(a);
  }
  function pedirExclusao(e: NonNullable<Exclusao>) {
    excluirPericia.reset();
    excluirAtributo.reset();
    setExclusao(e);
  }
  const fecharPericia = () => setPericiaEmEdicao(undefined);
  const fecharAtributo = () => setAtributoEmEdicao(undefined);

  return (
    <div className="pagina">
      <div className="pagina__cabecalho">
        <div>
          <h1>Perícias e atributos</h1>
          <p className="pagina__subtitulo">
            Seu catálogo. Edite as perícias da base ou crie novas, em qualquer atributo. Classes e raças usam estas perícias.
          </p>
        </div>
      </div>

      {/* ---------- Atributos ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Atributos</h2>
          <Button onClick={() => abrirAtributo(null)}>
            <Plus size={16} aria-hidden /> Novo atributo
          </Button>
        </div>
        {atributos.isPending ? (
          <Loading compacto texto="Carregando atributos…" />
        ) : atributos.isError ? (
          <ErrorState mensagem={mensagemDeErro(atributos.error)} onTentarNovamente={() => atributos.refetch()} />
        ) : (
          <ul className="pericias">
            {atributos.data.map((a) => (
              <li key={a.id} className="pericia pericia--atributo">
                <div>
                  <div className="pericia__nome">
                    <strong>{a.nome}</strong>
                    {a.fixo && (
                      <span className="selo selo--fixa" title="Atributo fixo do sistema">
                        <Lock size={12} aria-hidden /> Fixo
                      </span>
                    )}
                  </div>
                  {a.descricao && <p className="pericia__descricao">{a.descricao}</p>}
                  <span className="pericia__usos">
                    {a.pericias} {a.pericias === 1 ? "perícia" : "perícias"} no seu catálogo
                  </span>
                </div>
                {!a.fixo && (
                  <div className="pericia__acoes">
                    <Button pequeno variante="fantasma" onClick={() => abrirAtributo(a)}>
                      Editar
                    </Button>
                    <Button pequeno variante="fantasma" aria-label={`Excluir ${a.nome}`} onClick={() => pedirExclusao({ tipo: "atributo", item: a })}>
                      Excluir
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Perícias ---------- */}
      <section className="secao">
        <div className="secao__cabecalho">
          <h2>Perícias</h2>
          <Button variante="primario" onClick={() => abrirPericia(null)} disabled={!atributos.data}>
            <Plus size={16} aria-hidden /> Nova perícia
          </Button>
        </div>

        <ul className="categorias" aria-label="Categorias">
          {LISTA_CATEGORIAS.map((c) => (
            <li key={c}>
              <CategoriaIcone categoria={c} tamanho={14} /> {CATEGORIAS[c].descricao}
            </li>
          ))}
        </ul>

        {catalogo.isPending ? (
          <Loading texto="Carregando perícias…" />
        ) : catalogo.isError ? (
          <ErrorState mensagem={mensagemDeErro(catalogo.error)} onTentarNovamente={() => catalogo.refetch()} />
        ) : catalogo.data.length === 0 ? (
          <EmptyState titulo="Nenhuma perícia no catálogo" descricao="Crie perícias para poder adicioná-las às classes e raças." />
        ) : (
          <PericiasPorAtributo
            pericias={catalogo.data}
            renderItem={(p) => (
              <PericiaItem
                key={p.id}
                pericia={p}
                rodape={<span className="pericia__usos">{usos(p)}</span>}
                acoes={
                  <>
                    <Button pequeno variante="fantasma" onClick={() => abrirPericia(p)}>
                      Editar
                    </Button>
                    <Button pequeno variante="fantasma" aria-label={`Excluir ${p.nome}`} onClick={() => pedirExclusao({ tipo: "pericia", item: p })}>
                      Excluir
                    </Button>
                  </>
                }
              />
            )}
          />
        )}
      </section>

      <Modal aberto={periciaEmEdicao !== undefined} onFechar={fecharPericia} titulo={periciaEmEdicao ? "Editar perícia" : "Nova perícia"}>
        <PericiaCatalogoForm
          inicial={periciaEmEdicao ?? undefined}
          atributos={atributos.data ?? []}
          enviando={salvandoPericia.isPending}
          erros={errosDeCampo(salvandoPericia.error)}
          erroGeral={erroDeFormulario(salvandoPericia.error)}
          onCancelar={fecharPericia}
          onEnviar={(dados) =>
            periciaEmEdicao
              ? editar.mutate({ id: periciaEmEdicao.id, dados }, { onSuccess: fecharPericia })
              : criar.mutate(dados, { onSuccess: fecharPericia })
          }
        />
      </Modal>

      <Modal aberto={atributoEmEdicao !== undefined} onFechar={fecharAtributo} titulo={atributoEmEdicao ? "Editar atributo" : "Novo atributo"}>
        <AtributoForm
          inicial={atributoEmEdicao ? { ...atributoEmEdicao, grupoExclusivoId: atributoEmEdicao.grupoExclusivoId ?? null } : undefined}
          grupos={grupos.data}
          enviando={salvandoAtributo.isPending}
          erros={errosDeCampo(salvandoAtributo.error)}
          erroGeral={erroDeFormulario(salvandoAtributo.error)}
          onCancelar={fecharAtributo}
          onEnviar={(dados) =>
            atributoEmEdicao
              ? editarAtributo.mutate({ id: atributoEmEdicao.id, dados }, { onSuccess: fecharAtributo })
              : criarAtributo.mutate(dados, { onSuccess: fecharAtributo })
          }
        />
      </Modal>

      <ConfirmDialog
        aberto={!!exclusao}
        titulo={exclusao?.tipo === "atributo" ? "Excluir atributo" : "Excluir perícia"}
        mensagem={
          exclusao?.tipo === "atributo" ? (
            <>Excluir o atributo <strong>{exclusao.item.nome}</strong>? Só é possível se nenhuma perícia estiver nele.</>
          ) : (
            <>
              Excluir <strong>{exclusao?.item.nome}</strong> do catálogo? Ela será removida das classes e raças que a usam. Não dá para
              desfazer.
            </>
          )
        }
        processando={excluindo.isPending}
        erro={excluindo.isError ? mensagemDeErro(excluindo.error) : null}
        onCancelar={() => setExclusao(null)}
        onConfirmar={() =>
          exclusao &&
          (exclusao.tipo === "atributo" ? excluirAtributo : excluirPericia).mutate(exclusao.item.id, {
            onSuccess: () => setExclusao(null),
          })
        }
      />
    </div>
  );
}
