---
name: balancear
description: Verifica com matemática se classes (nível 1, 2, 3) e criaturas do bestiário do One-Take estão fortes demais ou fracos demais, usando as regras de rolagem (maior de N d20 + bônus, esforço = +1 d20) e médias de dano/cura/defesa das cartas. Use quando o usuário pedir para balancear, revisar, comparar ou checar se uma classe, carta ou criatura está apelativo.
---

# Balancear classes e criaturas do One-Take

Objetivo: ninguém apelativo **sem querer**. A análise é matemática (médias e chances), não opinião.
Nunca altere classes, cartas ou criaturas sem o usuário aprovar: entregue um relatório com sugestões.

## Regras que valem (fonte: `api/src/regras/`)
- Teste: rola 1 d20 por ponto no atributo, fica com o **maior**, soma o bônus da perícia (sem a perícia, 0).
  Atributo com 0 pontos: 1 d20 e o resultado vale a **metade** (arredondada para baixo). Ou seja, com 0 o total máximo é 10 + bônus.
- Esforço: cada ponto gasto antes da rolagem dá **+1 d20** (não vale com atributo 0). Esforço é um recurso de "dados extras".
- DT (faixa de sucesso e falha) é livre: o mestre define na hora. Use DT 12 (média) e 15 (difícil) como referência.
- Personagem começa com 3 pontos de atributo (normalmente 1 a 2 no atributo de ataque); criaturas têm os dados que o mestre definir.
- Progressão: +5 vida, +5 mana, +5 esforço e +5 pontos de perícia por nível; cartas com nível necessário ≤ nível; aprimoramentos mudam a carta.
- Vida 0 ou mana 0 = morte. Esforço 0 = cansado.
- Tipos de efeito fixos: Dano, Defesa, Cura, Suporte, Fortalecimento, Enfraquecimento, Controle, Mobilidade, Invocação, Utilidade.

## Passo a passo
1. **Pegar os dados.** Na pasta `api/`: `npm run exportar -- > ../conteudo.json`
   (ou `npm run exportar -- --titulo Espadachim > ../conteudo.json` para uma só). Precisa do `api/.env` e da migration aplicada.
   Sem banco: monte o JSON à mão no mesmo formato (veja `exemplo.json` nesta pasta).
2. **Rodar o relatório.** `node .claude/skills/balancear/calc.mjs relatorio conteudo.json --niveis 3 --dt 12` e de novo com `--dt 15`.
   Outras ferramentas: `calc.mjs dados "2d8+2"`, `calc.mjs teste --pontos 2 --bonus 5 --dt 15 --esforco 1`, `calc.mjs tabela`.
3. **Ler as cartas uma a uma** (o script só entende efeitos com dados escritos, tipo "2d8 + 2", "4 ataques ... 1d6").
   Para cartas sem números (controle, suporte, "anula todo o dano"), avalie pelo texto usando os critérios abaixo.
4. **Comparar com os pares** do mesmo nível e do mesmo grupo (Combatente, Vanguardista, Suporte) e com as criaturas.
5. **Escrever o relatório** (formato no fim). Mostre a conta de cada número que justificar uma sugestão.

## Referências (alvos, não leis)
Valores médios úteis: 1d4 = 2,5 · 1d6 = 3,5 · 1d8 = 4,5 · 1d10 = 5,5 · 1d12 = 6,5 · 2d6 = 7 · 2d8 = 9.
Maior de 2d20 = 13,8 em média; 1d20 = 10,5; atributo 0 = 5.

| Medida | Saudável | Investigar |
|---|---|---|
| Turnos para derrubar a vida mediana das classes do mesmo nível (dano esperado por turno, carta repetível) | 3 a 5 | < 2 (apelativo) ou > 8 num Combatente (fraco) |
| Chance de acerto contra DT 12 com o melhor ataque, nível 1 | 60% a 85% | > 90% (quase não erra) |
| Bônus de perícia da classe no nível 1 | +1 a +3 por perícia | +5 ou mais já no nível 1 (equivale a um nível inteiro de pontos) |
| Pico (carta limitada) vs dano repetível | até 2x | > 2,5x, ou pico que derruba alguém de vida mediana sozinho |
| Cura por uso vs dano esperado por turno de um Combatente do mesmo nível | 0,8x a 1,5x | > 2x sem custo/limite |
| Defesa: redução média vs dano esperado de um Combatente | até 0,7x por uso | anula 100% sem custo nem limite |
| Vida + mana + esforço base (soma) | perto das outras classes (seed: 60) | 30% acima ou abaixo sem motivo do grupo |

Sinais de problema que a matemática não pega sozinha:
- Carta **dominada**: outra carta da mesma classe faz mais, com o mesmo custo e menos condições (ninguém vai usar a pior).
- Carta forte **sem custo e sem limite** (mana 0, sem "x usos por combate") que anula ou repete efeito grande.
- Defesa/controle que tira o turno do alvo todo turno.
- Criatura de nível N com dano esperado por turno que derruba um jogador do mesmo nível em 1 a 2 turnos (só se for chefe de propósito).
- Recursos: mana muito baixa com cartas que custam mana; esforço alto = muitos dados extras (cada 1 de esforço vale +1 d20).

## Formato do relatório
Para cada classe/criatura:
- **Resumo** em uma linha: equilibrado / forte / fraco / apelativo, e em que nível.
- **Números** (tabela do script, DT 12 e 15).
- **Cartas a revisar**, cada uma com: o problema, a conta, e uma sugestão concreta (ex.: "Estocada direta: 2d8+2 (11) sem limite, enquanto Corte horizontal faz 1d10+2 (7,5): Corte horizontal fica dominado. Sugestão: Estocada 2 usos por combate, ou Corte horizontal 1d10+4").
- **O que está bom** (para não mexer).
Feche com as decisões que dependem do designer (ex.: "o Espadachim deve ser o melhor duelista do jogo?").
