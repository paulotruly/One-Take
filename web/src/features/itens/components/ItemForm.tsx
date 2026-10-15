// Formulário de item (apresentação): usado no catálogo do mestre e para criar um item avulso direto no grupo.
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { ClasseImagem } from "../../classes/components/ClasseImagem";
import type { CamposItem, CategoriaItem } from "../types";

type Opcao = { id: string; rotulo: string };

type Props = {
  inicial?: Partial<CamposItem>;
  pericias: Opcao[];
  classes: Opcao[];
  categorias: CategoriaItem[];
  /** Campos extras no fim (disponibilidade no catálogo, destino no grupo). */
  extra?: ReactNode;
  rotulo?: string;
  onEnviar: (dados: CamposItem) => void;
  onCancelar: () => void;
  enviando?: boolean;
  erros?: Record<string, string>;
  erroGeral?: string | null;
};

const numero = (s: string) => (s.trim() === "" ? (undefined as unknown as number) : Number(s));

export function ItemForm({ inicial, pericias, classes, categorias, extra, rotulo = "Salvar item", onEnviar, onCancelar, enviando, erros = {}, erroGeral }: Props) {
  const [v, setV] = useState({
    categoriaId: inicial?.categoriaId ?? categorias.find((c) => c.nome === "Artefatos")?.id ?? categorias[0]?.id ?? "",
    nome: inicial?.nome ?? "",
    descricao: inicial?.descricao ?? "",
    imagemUrl: inicial?.imagemUrl ?? "",
    efeito: inicial?.efeito ?? "",
    espacos: String(inicial?.espacos ?? 1),
    limitado: inicial?.usosMaximos != null,
    usosMaximos: String(inicial?.usosMaximos ?? 1),
    requisito: inicial?.requisito ?? "",
    requisitoPericiaId: inicial?.requisitoPericiaId ?? "",
    requisitoClasseId: inicial?.requisitoClasseId ?? "",
  });
  const set = (campo: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [campo]: e.target.value });

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar({
      categoriaId: v.categoriaId || null,
      nome: v.nome,
      descricao: v.descricao,
      imagemUrl: v.imagemUrl.trim() || null,
      efeito: v.efeito.trim() || null,
      espacos: numero(v.espacos),
      usosMaximos: v.limitado ? numero(v.usosMaximos) : null,
      requisito: v.requisito.trim() || null,
      requisitoPericiaId: v.requisitoPericiaId || null,
      requisitoClasseId: v.requisitoClasseId || null,
    });
  }

  return (
    <form className="form" noValidate onSubmit={enviar}>
      <Field rotulo="Título" erro={erros.nome}>
        <input value={v.nome} onChange={set("nome")} maxLength={80} autoFocus />
      </Field>
      <Field rotulo="Categoria" erro={erros.categoriaId} dica={categorias.find((c) => c.id === v.categoriaId)?.descricao || "Crie categorias suas em Itens > Categorias."}>
        <select value={v.categoriaId} onChange={set("categoriaId")}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.deOutro ? "" : " (sua)"}</option>)}
        </select>
      </Field>
      <Field rotulo="Descrição" erro={erros.descricao}>
        <textarea value={v.descricao} onChange={set("descricao")} maxLength={1000} rows={3} />
      </Field>
      <Field rotulo="Efeito ao usar (opcional)" erro={erros.efeito} dica='O que acontece quando o personagem usa. Ex.: "Recupera 2d4 de vida".'>
        <textarea value={v.efeito} onChange={set("efeito")} maxLength={1000} rows={2} />
      </Field>
      <div className="form__linha">
        <Field rotulo="Espaços no inventário" erro={erros.espacos} dica="Mínimo 1">
          <input type="number" min={1} step={1} inputMode="numeric" value={v.espacos} onChange={set("espacos")} />
        </Field>
        <Field rotulo="Consumo" erro={erros.usosMaximos} dica={v.limitado ? "Ao acabar os usos, o item some." : "Pode usar quantas vezes quiser."}>
          <select value={v.limitado ? "sim" : "nao"} onChange={(e) => setV({ ...v, limitado: e.target.value === "sim" })}>
            <option value="nao">Sem limite</option>
            <option value="sim">Usos limitados</option>
          </select>
        </Field>
        {v.limitado && (
          <Field rotulo="Quantos usos" erro={erros.usosMaximos}>
            <input type="number" min={1} step={1} inputMode="numeric" value={v.usosMaximos} onChange={set("usosMaximos")} />
          </Field>
        )}
      </div>
      <fieldset className="form__grupo">
        <legend>Pré-requisito para saber usar (opcional)</legend>
        <div className="form__linha">
          <Field rotulo="Classe" erro={erros.requisitoClasseId} dica="Só esta classe sabe usar.">
            <select value={v.requisitoClasseId} onChange={set("requisitoClasseId")}>
              <option value="">Qualquer classe</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.rotulo}</option>)}
            </select>
          </Field>
          <Field rotulo="Perícia" erro={erros.requisitoPericiaId} dica="Precisa ter esta perícia.">
            <select value={v.requisitoPericiaId} onChange={set("requisitoPericiaId")}>
              <option value="">Nenhuma</option>
              {pericias.map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
            </select>
          </Field>
        </div>
        <Field rotulo="Outro requisito (texto)" erro={erros.requisito} dica='Informativo. Ex.: "Só quem já esteve no templo".'>
          <input value={v.requisito} onChange={set("requisito")} maxLength={200} />
        </Field>
      </fieldset>
      <Field rotulo="Link da imagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
        <input type="url" value={v.imagemUrl} onChange={set("imagemUrl")} placeholder="https://" />
      </Field>
      {v.imagemUrl.trim() && (
        <div className="form__previa">
          <ClasseImagem url={v.imagemUrl.trim()} titulo={v.nome} />
        </div>
      )}
      {extra}
      {erroGeral && <div className="aviso">{erroGeral}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={enviando}>Cancelar</Button>
        <Button type="submit" variante="primario" disabled={enviando}>{enviando ? "Salvando…" : rotulo}</Button>
      </div>
    </form>
  );
}
