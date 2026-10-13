# Revisão legal: pendências (documento interno)

**Não publicar.** Este arquivo acompanha as minutas `TERMOS_DE_USO.md` e `POLITICA_DE_PRIVACIDADE.md` (versão 0.5, 2026-10-13).
As minutas são um texto técnico baseado no código, **não um parecer jurídico** e não garantem conformidade com a LGPD. Antes de publicar,
o responsável precisa preencher os campos abaixo e, de preferência, revisar com um advogado com experiência em tecnologia e proteção de dados.

As páginas `/termos` e `/privacidade` do site exibem estas minutas, **com os marcadores visíveis**. Enquanto houver marcadores, o site
não deve ser divulgado ao público.

## 1. Decisões já tomadas pelo responsável (2026-10-13)

- Controlador: **Paulo Gomes, pessoa física**, sem empresa. Contato provisório: **rpgonetake@gmail.com** (visível nas páginas públicas).
- **Sem e-mail na conta.** O cadastro pede nome de usuário, data de nascimento e senha. A troca de senha usa um **código de recuperação**
  (mostrado uma vez, guardado só como hash). Os e-mails já guardados e a tabela de links por e-mail foram apagados
  (migration `recuperacao_sem_email`). O Resend deixou de ser fornecedor.
- Idade: **mínimo de 12 anos**, pela data de nascimento declarada no cadastro (conferida na API, `api/src/regras/conta.ts`).
- Exportação: **"Baixar meus dados"** (JSON) em Configurações da conta, a qualquer momento.
- Exclusão: imediata, com senha e o nome de usuário digitado.
- Encerramento do serviço: **sem aviso prévio**; a exportação fica disponível o tempo todo.
- Denúncias: sem procedimento formal; pelo e-mail de contato.
- Mudanças nos documentos: aviso no aplicativo.
- Supabase: projeto `onetake`, região **us-west-2** (Estados Unidos), instância nano. Hospedagem: **Render** (API) e **Vercel** (site),
  ainda não publicados.
- Encarregado: não indicado, como agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022, que inclui pessoas naturais e
  exige um canal de comunicação: o e-mail).
- Base legal da data de nascimento: execução de contrato e obrigação legal (aceita pelo responsável).
- Textos de senhas, backups, registros técnicos, Marco Civil, transferência internacional, direitos dos titulares e logs: redação
  enviada pelo responsável, adaptada ao app sem e-mail. Prazo de resposta: 15 dias para a declaração completa (LGPD, art. 19, II).

## 2. Campos ainda abertos nas minutas

| Marcador | Onde | O que fazer |
|---|---|---|
| `[DATA DA PUBLICAÇÃO DO SITE]` | Termos e política (topo) | Preencher no dia em que o site for publicado (é quando os documentos passam a valer) |
| `[CONFIRMAR SE O NOME "ONE-TAKE" TEM REGISTRO OU PEDIDO DE MARCA]` | Termos 9 | Busca no INPI; risco de conflito com marcas existentes |

## 3. Pendências internas (não aparecem nas minutas)

- **Teste de balanceamento do legítimo interesse (LIA):** documento interno curto que justifica o uso de IP em memória, das marcas de
  sessão e dos registros de erro (finalidade, necessidade, impacto no titular, salvaguardas). Não precisa ser publicado.
- **Transferência internacional:** a política descreve a transferência sem afirmar conformidade contratual. Antes de publicar, verificar
  o mecanismo de cada fornecedor (Supabase usa cláusulas contratuais-padrão; conferir também Render e Vercel). A ANPD publicou
  cláusulas-padrão próprias em 2024 (Resolução CD/ANPD nº 19/2024). Com a saída do Resend, cai a pendência de que ele não assina as
  cláusulas brasileiras.
- **Marco Civil, art. 15:** reavaliar se a operação passar a ser de pessoa jurídica com fins econômicos.

## 4. Fatos verificados no código (2026-10-13)

- Cadastro pela API (`POST /api/cadastro`): nome de usuário, data de nascimento, senha. O usuário é criado no Supabase Auth com um e-mail
  interno `<usuario>@one-take.local`, que não recebe mensagens.
- A senha passa pela API no cadastro, login, reautenticação e troca, e é repassada ao Supabase Auth. A API não grava a senha.
- Código de recuperação: 20 caracteres aleatórios (100 bits), guardado como SHA-256, comparado em tempo constante, trocado a cada uso;
  mesma resposta para usuário inexistente ou código errado; limite de 10 tentativas por hora por IP.
- Depois da troca de senha, a API recusa sessões autenticadas antes dela.
- IP: só em memória, por até 1 hora (`api/src/lib/limite.ts`). Não há registro de acesso em banco.
- Sem cookies próprios; `localStorage` com a sessão do `supabase-js`, a interface lembrada e o kit ativo.
- Sem analytics, anúncios, pagamentos, planos, mensagens entre usuários ou envio de e-mails.

## 5. Riscos identificados

- **Perda do código e da senha:** sem e-mail, quem perde os dois depende do contato manual, e confirmar a identidade sem dado de contato
  é difícil. Definir como o responsável vai confirmar a identidade nesses pedidos.
- **Idade autodeclarada:** a data de nascimento não é conferida com documentos; uma criança pode mentir a idade.
- **Encerramento sem aviso:** a exportação a qualquer momento reduz o risco, mas avaliar frente ao Código de Defesa do Consumidor.
- **E-mail pessoal como canal oficial:** fica visível e recebe pedidos de titulares e denúncias.
- **Enumeração de nomes de usuário:** a tela de cadastro informa se um nome já está em uso; os limites por IP reduzem o abuso.
- **Limites em memória** zeram ao reiniciar a API e valem por instância.
- **Imagens externas:** qualquer link colado por usuários pode registrar o IP de quem vê a página.
- **Login por nome de usuário** (`POST /api/entrar`) ainda não tem limite de tentativas próprio.
- **Registros de erro:** o `error-handler` grava o erro completo com `console.error`; erros do Prisma podem trazer argumentos da consulta.

## 6. Implementação a verificar antes de publicar

- Chamadas reais ao Supabase Admin API (`SUPABASE_SECRET_KEY`): criar usuário, trocar senha e excluir usuário foram testadas só com
  respostas simuladas.
- Expiração de sessões depois da troca de senha (claim `amr` do JWT do Supabase): confirmar com tokens reais.

## 7. Pontos para o advogado

- Bases legais da seção 4 da política e a necessidade de LIA.
- Redação da seção 10 dos termos (autorização sobre o conteúdo e cópias arquivadas).
- Cláusulas de responsabilidade (termos 16) frente ao Código de Defesa do Consumidor.
- Regras para menores (LGPD, art. 14; Estatuto da Criança e do Adolescente).
- Enquadramento como agente de pequeno porte (dispensa de encarregado) e mecanismo das transferências internacionais.
- Aceite eletrônico e registro da versão aceita (hoje o cadastro não tem caixa de aceite).
