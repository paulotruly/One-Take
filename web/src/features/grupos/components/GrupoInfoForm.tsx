// Campos de informação do grupo (apresentação). O container junta com os disponíveis e envia.
import { Field } from "../../../components/ui/Field";
import { ClasseImagem } from "../../classes/components/ClasseImagem";

export type GrupoInfo = {
  titulo: string;
  sinopse: string;
  genero: string;
  imagemUrl: string;
  limiteMembros: string;
  permitirClassesRepetidas: boolean;
};

export function GrupoInfoForm({ valor, onChange, erros = {} }: { valor: GrupoInfo; onChange: (v: GrupoInfo) => void; erros?: Record<string, string> }) {
  const set = (campo: keyof GrupoInfo) => (e: { target: { value: string } }) => onChange({ ...valor, [campo]: e.target.value });
  return (
    <div className="form">
      <Field rotulo="Título" erro={erros.titulo}>
        <input value={valor.titulo} onChange={set("titulo")} maxLength={80} autoFocus />
      </Field>
      <div className="form__linha">
        <Field rotulo="Gênero" erro={erros.genero} dica="Ex.: fantasia, terror, ficção científica.">
          <input value={valor.genero} onChange={set("genero")} maxLength={60} />
        </Field>
        <Field rotulo="Limite de membros" erro={erros.limiteMembros} dica="Quantos jogadores podem entrar.">
          <input type="number" min={1} max={50} step={1} inputMode="numeric" value={valor.limiteMembros} onChange={set("limiteMembros")} />
        </Field>
      </div>
      <Field rotulo="Sinopse" erro={erros.sinopse}>
        <textarea value={valor.sinopse} onChange={set("sinopse")} maxLength={4000} rows={5} />
      </Field>
      <Field rotulo="Link da imagem" erro={erros.imagemUrl} dica="Opcional. Cole o endereço (https://...) de uma imagem.">
        <input type="url" value={valor.imagemUrl} onChange={set("imagemUrl")} placeholder="https://" />
      </Field>
      {valor.imagemUrl.trim() && (
        <div className="form__previa form__previa--larga">
          <ClasseImagem url={valor.imagemUrl.trim()} titulo={valor.titulo} />
        </div>
      )}
      <label className="checklist__item">
        <input
          type="checkbox"
          checked={valor.permitirClassesRepetidas}
          onChange={(e) => onChange({ ...valor, permitirClassesRepetidas: e.target.checked })}
        />
        <span>Permitir classes repetidas (dois jogadores com a mesma classe)</span>
      </label>
    </div>
  );
}
