# Registros de decisões arquiteturais (ADR)

Esta pasta guarda as decisões **arquiteturais ou técnicas** novas do One-Take, uma por arquivo.
As decisões anteriores a 2026-10-13 estão em [`../DECISOES.md`](../DECISOES.md), com data e motivo. Elas **não** foram copiadas
para arquivos daqui, para não duplicar nem inventar detalhes que não foram registrados na época. O resumo numerado (ADR-001 a
ADR-018) fica em [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md#110-decisões-técnicas).

## Quando criar um ADR
- Escolha de tecnologia, biblioteca ou serviço externo.
- Mudança de arquitetura: camadas, fluxo de dados, autenticação, modelo de dados com impacto amplo, deploy.
- Troca de uma decisão anterior.

Decisões **de produto** (regras do jogo, textos, telas) continuam só em `DECISOES.md`, datadas. Uma decisão que é ao mesmo tempo
de produto e de arquitetura vai nos dois: uma linha em `DECISOES.md` e o ADR com os detalhes técnicos.

## Como numerar e nomear
- Próximo número livre: **ADR-019** (os números 001 a 018 já são usados no resumo do `PROJECT_CONTEXT.md`).
- Arquivo: `ADR-019-titulo-curto-com-hifens.md`, por exemplo `ADR-019-rate-limit-no-login.md`.
- Um ADR aceito não é reescrito: se a decisão mudar, crie um ADR novo com status "Aceito" e marque o antigo como
  "Substituído por ADR-0XX".

## Modelo
```markdown
# ADR-0XX: <título>

- **Status:** Proposto | Aceito | Rejeitado | Substituído por ADR-0YY
- **Data:** AAAA-MM-DD
- **Responsável pela decisão:** <quem decidiu>

## Contexto
O problema e as restrições. Só fatos verificáveis (código, docs, pedidos do responsável).

## Decisão
O que foi decidido, de forma direta.

## Alternativas consideradas
Só as que foram realmente avaliadas. Se não houver registro, escreva "Não registradas".

## Consequências
O que melhora, o que piora, limitações e o que precisa ser feito (migrations, config, docs).

## Relação com decisões anteriores
Decisões de `DECISOES.md` ou ADRs que esta complementa ou substitui.

## Pendências de confirmação
O que ainda precisa ser confirmado pelo responsável (deixe vazio se nada).
```

## Regras
- Não registre motivos que não foram confirmados; escreva "motivo não registrado".
- Atualize o resumo da seção 1.10 do `PROJECT_CONTEXT.md` e o `docs/CHANGELOG.md` ao aceitar um ADR.
