// Calculadora da documentação: a conta é da API (GET /api/regras/chance); aqui só os campos e o resultado.
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Field } from "../../components/ui/Field";
import { api, mensagemDeErro } from "../../lib/api";
import { useRegras } from "./regras";

const inteiro = (texto: string, min: number, max: number) => {
  const n = Number(texto);
  return texto.trim() !== "" && Number.isInteger(n) && n >= min && n <= max ? n : null;
};

export function CalculadoraChance() {
  const t = useRegras().teste;
  const [pontos, setPontos] = useState("2");
  const [bonus, setBonus] = useState("5");
  const [dt, setDt] = useState("15");
  const [esforco, setEsforco] = useState(false);

  const valores = { pontos: inteiro(pontos, 0, 20), bonus: inteiro(bonus, -50, 100), dt: inteiro(dt, 1, 200) };
  const validos = valores.pontos !== null && valores.bonus !== null && valores.dt !== null;
  const usaEsforco = esforco && valores.pontos !== 0;
  const consulta = useQuery({
    queryKey: ["regras", "chance", valores, usaEsforco],
    enabled: validos,
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<{ chance: number; media: number; notacao: string }>(
        `/api/regras/chance?pontos=${valores.pontos}&bonus=${valores.bonus}&dt=${valores.dt}&esforco=${usaEsforco ? t.esforcoMaximoPorRodada : 0}`,
      ),
  });

  return (
    <div className="calculadora painel">
      <div className="calculadora__campos">
        <Field rotulo="Pontos no atributo"><input type="number" inputMode="numeric" min={0} max={20} value={pontos} onChange={(e) => setPontos(e.target.value)} /></Field>
        <Field rotulo="Bônus da perícia"><input type="number" inputMode="numeric" min={-50} max={100} value={bonus} onChange={(e) => setBonus(e.target.value)} /></Field>
        <Field rotulo="DT"><input type="number" inputMode="numeric" min={1} max={200} value={dt} onChange={(e) => setDt(e.target.value)} /></Field>
      </div>
      <label className="checklist__item">
        <input type="checkbox" checked={esforco} disabled={valores.pontos === 0} onChange={(e) => setEsforco(e.target.checked)} />
        <span>Gastar esforço antes de rolar</span>
      </label>
      {!validos ? (
        <p className="pagina__subtitulo">Preencha os três campos com números inteiros.</p>
      ) : consulta.isError ? (
        <div className="aviso">{mensagemDeErro(consulta.error)}</div>
      ) : consulta.data ? (
        <p className="calculadora__resultado" aria-live="polite">
          <strong>{Math.round(consulta.data.chance * 100)}%</strong> de chance com {consulta.data.notacao}. Total médio: {consulta.data.media.toFixed(1).replace(".", ",")}.
        </p>
      ) : (
        <p className="pagina__subtitulo">Calculando…</p>
      )}
    </div>
  );
}
