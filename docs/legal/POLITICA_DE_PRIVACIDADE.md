# Política de privacidade do One-Take

**Versão 0.5 (minuta para revisão).** Vigência a partir de [DATA DA PUBLICAÇÃO DO SITE].

Esta política explica quais dados pessoais o One-Take trata, por que, com quem eles são compartilhados e como você pode exercer
seus direitos, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, LGPD). Ela descreve o funcionamento atual
do aplicativo. Se o funcionamento mudar, esta política será atualizada.

## 1. Quem é o controlador

O controlador dos dados é Paulo Gomes, pessoa física, que desenvolve e opera o One-Take (github.com/paulotruly). Não há empresa
envolvida.

- Contato para assuntos de privacidade (provisório): rpgonetake@gmail.com.
- Encarregado: o One-Take é operado por uma pessoa física, como agente de tratamento de pequeno porte, e por isso não indicou um
  encarregado (Resolução CD/ANPD nº 2/2022). O canal de comunicação com os titulares é o mesmo e-mail, respondido pelo próprio controlador.

## 2. A que esta política se aplica

Ao site e ao aplicativo web do One-Take (páginas públicas, área do jogador e área do mestre) e à API que os atende.
Ela não se aplica a sites de terceiros cujos links ou imagens apareçam no aplicativo (veja a seção 7).

## 3. Quais dados tratamos

### 3.1. Dados da conta

O One-Take não pede e-mail, telefone nem documento.

| Dado | Obrigatório? | Para que serve |
|---|---|---|
| Nome de usuário | Sim | Identifica a conta, é usado para entrar e aparece para outras pessoas como `@usuario` |
| Senha | Sim | Autenticação. Veja como ela é guardada na seção 8 |
| Data de nascimento | Sim, em contas novas | Conferir a idade mínima de 12 anos no cadastro. Só você vê. Contas criadas antes dessa regra não têm a data |
| Código de recuperação | Gerado pelo sistema | Trocar a senha se você esquecer. Ele é mostrado só para você, uma vez; o One-Take guarda apenas uma versão cifrada de mão única (hash) e a data em que foi gerado |
| Nome de exibição | Não | Aparece no lugar do nome de usuário, se preenchido |
| Link de foto de perfil | Não | Exibir uma foto. O One-Take guarda só o link; a imagem fica no site de origem |
| Interface de mestre ativada | Gerado pelo sistema | Liberar as funções de mestre |

Para funcionar com o login por nome de usuário, a conta também tem no serviço de autenticação um endereço técnico interno, gerado a
partir do nome de usuário (terminado em `@one-take.local`). Ele não recebe mensagens e não é mostrado a ninguém.

### 3.2. Conteúdo que você cria

- **Como jogador:** fichas de personagem (nome, história, link de imagem, raça, classe, nível, atributos, perícias, recursos como vida,
  mana e esforço, status e inventário) e as cópias arquivadas das suas fichas.
- **Como mestre:** grupos (título, sinopse, gênero, imagem, código de entrada, configurações), classes, raças, atributos, perícias,
  habilidades, status, itens, categorias, criaturas, NPCs, kits e regras da mesa.

Esse conteúdo é, em geral, ficção. Mas textos livres (nome de personagem, história, descrições) podem conter informações pessoais se
você escrever informações pessoais neles. Evite colocar dados pessoais seus ou de outras pessoas nesses campos.

### 3.3. Registros de segurança da conta

- **Marcas técnicas da conta:** quando as sessões anteriores deixaram de valer (por exemplo, depois de trocar a senha com o código de
  recuperação) e quando uma exclusão foi iniciada.

### 3.4. Dados técnicos

- **Endereço IP:** usado apenas na memória do servidor, por até uma hora, para limitar tentativas repetidas de cadastro, de troca de
  senha e de outras ações sensíveis. Ele não é gravado no banco de dados do One-Take.
- **Registros de erro:** quando ocorre um erro inesperado, o servidor registra uma mensagem técnica do erro. Esses registros ficam no
  provedor de hospedagem da API (seção 7) por 7 dias.
- **No seu navegador:** a sessão de login e duas preferências (a última interface usada e o kit ativo do mestre) ficam guardadas no
  armazenamento local do navegador (veja a seção 13).

O One-Take não usa ferramentas de análise de audiência, publicidade, perfis de comportamento nem cookies de rastreamento.

## 4. Por que tratamos os dados e com qual base legal

A LGPD exige que cada uso de dados pessoais tenha uma justificativa legal (art. 7º). As do One-Take são:

| Finalidade | Dados | Base legal (LGPD, art. 7º) |
|---|---|---|
| Criar e manter a conta, permitir o login | Nome de usuário, senha, endereço técnico interno, interface ativada | Execução de contrato (inciso V): são necessários para prestar o serviço que você pediu ao se cadastrar |
| Permitir trocar a senha sem e-mail | Código de recuperação (hash) | Execução de contrato (inciso V) |
| Conferir a idade mínima | Data de nascimento | Execução de contrato (inciso V) e cumprimento de obrigação legal (inciso II), por causa das regras de proteção de crianças (LGPD, art. 14) |
| Entregar uma cópia dos seus dados quando você pedir | Todos os dados da sua conta | Cumprimento de obrigação legal (inciso II): direito de portabilidade e de acesso (LGPD, art. 18) |
| Mostrar seu perfil a quem joga com você | Nome de usuário, nome e link de foto | Execução de contrato (inciso V) |
| Guardar e exibir fichas, grupos e conteúdo do mestre | Conteúdo da seção 3.2 | Execução de contrato (inciso V) |
| Manter cópias arquivadas das fichas dos jogadores | Fichas arquivadas | Execução de contrato (inciso V), em favor do jogador dono da ficha |
| Proteger as contas contra abuso: limitar tentativas repetidas, encerrar sessões antigas depois da troca de senha e registrar erros para corrigir falhas | IP (só na memória, por até uma hora), marcas técnicas da conta, registros de erro | Legítimo interesse (inciso IX): o uso é pequeno, temporário e serve para proteger as próprias contas dos usuários |
| Atender pedidos de titulares e obrigações legais | Os dados necessários a cada pedido | Cumprimento de obrigação legal (inciso II) e exercício regular de direitos (inciso VI), quando aplicável |

Não usamos o consentimento como base para o funcionamento do serviço. Se algum dia uma finalidade depender de consentimento, ele será
pedido de forma separada e poderá ser revogado.

## 5. Por que cada dado é pedido

- **Nome de usuário e senha:** sem eles não há conta.
- **Data de nascimento:** só para conferir que você tem pelo menos 12 anos. Ela não aparece para ninguém além de você.
- **Código de recuperação:** é o meio de trocar a senha sem e-mail. Só você conhece o código; o One-Take não consegue lê-lo.
- **Nome e foto:** opcionais, só para personalizar o perfil.
- **Dados das fichas e do conteúdo do mestre:** são o próprio jogo. Você decide o que escrever.

## 6. Quem vê o quê

| Dado | Quem pode ver |
|---|---|
| Data de nascimento e código de recuperação | Só você (o código, só na hora em que é gerado) |
| Senha | Ninguém (nem a equipe do One-Take tem acesso à senha em texto) |
| Se um nome de usuário já existe | Qualquer pessoa, na tela de cadastro (para avisar que o nome está em uso) |
| Nome de usuário, nome e foto do mestre de um grupo | Pessoas logadas que têm o código de entrada do grupo |
| Nome de usuário de um jogador e nome do personagem dele | Os outros membros do mesmo grupo |
| Ficha completa e nome de usuário, nome e foto do jogador | O próprio jogador e o mestre do grupo |
| Conteúdo criado pelo mestre | O próprio mestre; os membros dos grupos dele veem o que ele liberou no grupo (classes, raças, regras, itens entregues) |
| Fichas arquivadas | Só o jogador dono |

## 7. Compartilhamento com fornecedores

Não vendemos dados pessoais. Para funcionar, o One-Take usa fornecedores que tratam dados em nosso nome (operadores):

| Fornecedor | O que faz | Dados envolvidos |
|---|---|---|
| Supabase | Banco de dados e serviço de autenticação | Todos os dados da conta e do conteúdo; a senha é processada e guardada pelo serviço de autenticação |
| Render | Hospedagem da API | Dados que passam pela API e registros de erro |
| Vercel | Hospedagem do site | Dados técnicos de acesso às páginas, conforme a política do fornecedor |

**Imagens por link:** quando uma página mostra uma imagem colada por um usuário (foto de perfil, imagem de classe, ficha ou item),
o seu navegador busca essa imagem diretamente no site de origem. Esse site pode registrar o seu IP e informações do navegador, conforme
as regras dele. O One-Take não controla esses sites.

Também podemos fornecer dados quando a lei exigir ou por ordem de autoridade competente.

## 8. Armazenamento e segurança

### Armazenamento e segurança das senhas

As senhas dos usuários são gerenciadas pelo Supabase Auth, serviço de autenticação utilizado pelo One-Take. As senhas são armazenadas
por meio de hash criptográfico, uma técnica de mão única que não permite recuperar diretamente a senha original. O One-Take não armazena
as senhas em suas próprias tabelas da aplicação.

### Outras medidas

- O código de recuperação também é guardado só como hash; ao ser usado, ele é trocado por um novo.
- O acesso aos dados passa sempre pela API, que confere a sessão em cada pedido. O acesso direto ao banco pela chave pública fica
  bloqueado.
- Há limites de tentativas para cadastro e para a troca de senha com o código.
- Depois de trocar a senha com o código de recuperação, as sessões abertas antes deixam de ser aceitas pela API.
- A chave de administração do serviço de autenticação fica só no servidor.

Nenhum sistema é totalmente seguro. Se ocorrer um incidente de segurança que possa causar risco ou dano relevante, comunicaremos os
titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD), conforme a LGPD.

## 9. Por quanto tempo guardamos

- **Conta, perfil e conteúdo:** enquanto a conta existir. Não há exclusão automática por inatividade.
- **Fichas arquivadas:** até o jogador dono apagá-las ou excluir a conta.
- **IP para limite de tentativas:** até uma hora, só na memória do servidor.

### Registros de acesso e logs técnicos

O One-Take utiliza serviços de terceiros que podem gerar registros técnicos relacionados à autenticação, à segurança e ao funcionamento
da aplicação. Esses registros podem incluir informações como data e hora de eventos, tentativas de autenticação e endereços IP, conforme
os dados efetivamente coletados por cada serviço.

A disponibilidade e o período de retenção desses registros dependem das configurações e das políticas dos fornecedores utilizados. Nos
planos gratuitos usados hoje, segundo a documentação de cada um em outubro de 2026:

| Fornecedor | O que fica registrado | Prazo |
|---|---|---|
| Render (API) | Registros do servidor, incluindo os de erro | 7 dias |
| Supabase (banco) | Registros de acesso à API e ao banco | 1 dia |
| Supabase (autenticação) | Registros de auditoria de login | 1 hora |
| Vercel (site) | Registros de execução | 1 hora |

Esses registros poderão ser utilizados para fins de segurança, prevenção de fraudes, diagnóstico de problemas técnicos e cumprimento de
obrigações legais, quando aplicável. O tratamento e a eventual conservação dos registros observarão a legislação aplicável e os
princípios de necessidade e segurança. Se o plano de algum fornecedor mudar, esta tabela será atualizada.

### Cópias de segurança e exclusão de dados

O projeto One-Take utiliza o plano gratuito do Supabase, que não inclui cópias de segurança automáticas do banco de dados gerenciadas pelo
fornecedor. O Supabase recomenda a realização de exportações periódicas para manter cópias de segurança próprias.

Caso sejam realizadas exportações ou criadas outras cópias de segurança, os dados excluídos poderão permanecer nessas cópias até que elas
sejam eliminadas. O prazo dependerá do mecanismo de backup utilizado e de sua política de retenção.

A exclusão de dados do banco principal não garante, por si só, a remoção imediata de eventuais cópias mantidas separadamente.

### Registros técnicos e obrigações legais de guarda

Os serviços utilizados pelo One-Take podem gerar registros técnicos relacionados ao funcionamento da aplicação, à autenticação e à
segurança. O Supabase, por exemplo, disponibiliza logs técnicos com retenção que varia conforme o plano contratado.

Esses registros técnicos não se confundem necessariamente com os registros de acesso à aplicação previstos na legislação brasileira. O
One-Take não afirma manter um sistema próprio de registros de acesso além das informações efetivamente coletadas por seus serviços.

Considerando o caráter pessoal e não comercial do projeto, o enquadramento na obrigação de guarda prevista no artigo 15 da Lei nº
12.965/2014 (Marco Civil da Internet) deverá ser reavaliado caso a forma de operação do One-Take se altere. A aplicação observará as
obrigações legais de conservação de registros que forem efetivamente aplicáveis.

## 10. Seus direitos

Pela LGPD (art. 18), você pode pedir: confirmação de que tratamos seus dados; acesso aos dados; correção de dados incompletos,
inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade
com a lei; portabilidade; eliminação dos dados tratados com consentimento; informação sobre com quem compartilhamos; informação sobre
a possibilidade de não fornecer consentimento e suas consequências; e revogação do consentimento. Você também pode se opor a um
tratamento feito com base em legítimo interesse, se achar que ele não cumpre a lei, e pode reclamar à ANPD.

## 11. Como exercer seus direitos

Muita coisa você mesmo faz no aplicativo:

| O que | Onde |
|---|---|
| Ver e corrigir nome de usuário, nome e foto | Editar perfil |
| Gerar um código de recuperação novo (com a senha atual) | Configurações da conta |
| Baixar uma cópia de todos os seus dados (arquivo JSON) | Configurações da conta, seção Seus dados |
| Ver e editar suas fichas | Minhas fichas |
| Apagar uma ficha arquivada | Página da ficha arquivada |
| Excluir a conta | Configurações da conta, no fim da página |

### Direitos dos titulares e solicitações de privacidade

O titular poderá exercer seus direitos relacionados aos dados pessoais por meio das funcionalidades disponíveis no One-Take ou, quando a
solicitação não puder ser realizada diretamente pelo aplicativo, pelo endereço de e-mail rpgonetake@gmail.com.

Esse canal poderá ser utilizado para solicitar informações sobre o tratamento de dados pessoais, corrigir informações cadastrais,
incluindo a data de nascimento, ou tratar de questões relacionadas a contas cujo código de recuperação e cuja senha foram perdidos.

Para proteger a conta e os dados pessoais, o One-Take poderá solicitar informações adicionais razoáveis para confirmar a identidade do
solicitante.

As solicitações serão atendidas sem custos, observados os prazos e procedimentos previstos na legislação aplicável. Para os pedidos de
confirmação da existência de tratamento e de acesso aos dados pessoais que exijam uma declaração completa, será observado o prazo legal
de até 15 (quinze) dias. Para os demais pedidos, serão observados os prazos legais específicos aplicáveis.

## 12. Crianças e adolescentes

O One-Take é para quem tem **pelo menos 12 anos**. O cadastro pede a data de nascimento e recusa quem ainda não completou 12 anos.
A data é declarada pela própria pessoa: o One-Take não confere documentos. Adolescentes (de 12 a 17 anos) devem usar o serviço com o
conhecimento dos pais ou responsáveis. Se você é responsável por uma criança que criou uma conta informando uma idade falsa, escreva
para rpgonetake@gmail.com para excluirmos a conta.

## 13. Armazenamento no navegador e cookies

O aplicativo não cria cookies próprios. Ele usa o armazenamento local do navegador para:

- a sessão de login (necessária para você continuar conectado);
- a última interface usada (jogador ou mestre);
- o kit de RPG ativo na área do mestre.

Sair da conta apaga a sessão. As preferências podem ser apagadas limpando os dados do site no navegador. Sites de onde vêm imagens
colocadas por usuários podem usar cookies próprios (seção 7).

## 14. Transferência internacional de dados pessoais

O One-Take utiliza serviços de terceiros que podem realizar o tratamento ou o armazenamento de dados pessoais fora do Brasil, incluindo
o Supabase, o Render e a Vercel.

O banco de dados e o serviço de autenticação do Supabase estão configurados na região us-west-2, localizada no estado do Oregon, Estados
Unidos. Os demais fornecedores também podem processar determinados dados em infraestrutura internacional, conforme seus serviços e
respectivos termos contratuais.

As transferências internacionais de dados pessoais deverão observar a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais,
LGPD) e a regulamentação aplicável da Autoridade Nacional de Proteção de Dados (ANPD), mediante hipótese legal e mecanismo válido para
cada operação de transferência.

O tratamento por fornecedores estrangeiros não afasta os direitos dos titulares previstos na legislação brasileira.

## 15. O que acontece quando você exclui a conta

1. Em Configurações da conta, você pede a exclusão informando a senha e digitando o seu nome de usuário.
2. A exclusão é **imediata e definitiva**:
   - o seu acesso (login e sessões) é apagado do serviço de autenticação;
   - são apagados o seu perfil (nome de usuário, nome, foto, data de nascimento, código de recuperação), as suas fichas (inclusive as
     arquivadas) e todo o conteúdo que você criou como mestre, incluindo os seus grupos;
   - itens das suas fichas em grupos de outros mestres ficam no grupo, sem dono.
3. O que **continua existindo**, porque pertence a outras pessoas: se você era mestre, cada jogador dos seus grupos fica com uma cópia
   arquivada da própria ficha. Essa cópia guarda o título do grupo e textos que você criou usados na ficha (nome e descrição da classe e
   da raça, cartas e itens), mas não guarda o seu nome de usuário nem outros dados seus (o inventário aparece só como lista de nomes e
   descrições, porque os itens em si são apagados com os grupos).
4. Cópias de segurança e registros dos fornecedores seguem o que está descrito na seção 9.

Se a exclusão falhar no meio (por exemplo, por uma queda de um fornecedor), a conta fica bloqueada e a exclusão é retomada até terminar.

## 16. Mudanças nesta política

Quando esta política mudar, a data de vigência e a versão serão atualizadas nesta página. Mudanças relevantes serão avisadas no
aplicativo.

## 17. Contato

rpgonetake@gmail.com
