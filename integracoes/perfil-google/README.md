# API do Perfil da Empresa (Google Business Profile) · BMH

> **Aprovado em 14/10/2026** (caso 0-3334000041584): cota padrão de 300 consultas por minuto no projeto
> `bmh-integracoes`. Testado no mesmo dia com a autorização do Google Ads da BMH (`GOOGLE_ADS_REFRESH_TOKEN`, que já tem
> `business.manage`): Account Management, Business Information e Performance respondem. **Falta ativar a "Google My
> Business API" (v4, avaliações e respostas)**: https://console.developers.google.com/apis/api/mybusiness.googleapis.com/overview?project=136521083780

## Perfis da BMH (conta "Brasília Medicina Hiperbárica", `accounts/117754317451946679663`)

| Unidade | Location |
|---|---|
| Asa Sul | `locations/15026912528968655315` |
| Taguatinga | `locations/6381458115148112648` |

A mesma autorização também enxerga perfis de outros negócios do Jorge (Nexo, Cannlink): **não usar** aqui.
Os dois perfis apontam o site para a home (`https://hiperbaricabrasilia.com.br/`), sem UTM.

Primeira leitura (12/09 a 11/10/2026): Asa Sul 2.006 visualizações, 67 ligações, 95 rotas, 18 cliques no site;
Taguatinga 1.671 visualizações, 92 ligações, 76 rotas, 26 cliques no site.

## O que já está ligado (14/10/2026)

- **Números por dia no painel de anúncios** (bloco "Perfil do Google"): o fluxo "BMH · Painel · grava o dia" (6h10,
  regrava os últimos 28 dias) lê a Performance API das duas unidades com a credencial "BMH · Google Ads (renovação do
  acesso)" e grava em `BMH_organico_diario`: fonte `perfil_google` (soma, é o que o painel mostra) e
  `perfil_google_asa_sul` / `perfil_google_taguatinga`; métricas `ligacoes` (toque em ligar), `rotas`, `cliques_site`,
  `exibicoes_busca`, `exibicoes_mapa`, `conversas`. Só grava até o último dia que a API já tem (uns 3 dias de atraso);
  o painel mostra "dados até" e compara com os mesmos dias do período anterior. Cada número tem a divisão por unidade.
  Código: `integracoes/painel/n8n/perfil-google.js`. Histórico carregado desde 20/04/2025 (o Google guarda 18 meses).
- Cópia do fluxo antes da mudança: `dados/n8n-copias/bmh-painel-grava-o-dia-20261014.json`.

- **Avaliações (API v4) ativada pelo Jorge em 14/10/2026**, leitura testada: Asa Sul nota 4,8 com 192 avaliações (163
  sem resposta, 11 delas abaixo de 5 estrelas; 6 nos últimos 90 dias), Taguatinga 4,9 com 70 (todas sem resposta, 4
  abaixo de 5; 1 nos últimos 90 dias).

- **14/10/2026: 14 respostas publicadas** pela API (todas as avaliações abaixo de 5 estrelas que estavam sem resposta),
  aprovadas pelo Jorge. As de antes de 2026 com resposta básica, a pedido dele; as de 2026 levando a crítica à
  coordenação, sem prometer mudança. Faltam as de 5 estrelas sem resposta (~218).
- **14/10/2026: 218 respostas às avaliações de 5 estrelas publicadas**, aprovadas pelo Jorge (as do último ano
  personalizadas, as mais antigas básicas). Mais a 1★ do Ramon (dez/2023), que tinha ficado de fora da primeira lista. Com isso as duas unidades ficaram
  com todas as 262 avaliações respondidas.

- **Avaliação nova no Telegram (14/10/2026):** fluxo **"BMH · Perfil do Google · avaliações"** (`yNozxi1jNwRbLhFR`), a cada
  30 min das 7h às 21h (`7,37 7-21 * * *`): avaliação sem resposta nos dois perfis → sugestão (gpt-5.5 pela credencial
  "BMH · OpenAI · transcrição de áudio", regras da skill `responder-avaliacoes` seção BMH; 4 ou 5★ sem texto usa frase
  pronta; mais de 1 ano = resposta básica) → Telegram (robô BMH alertas) com **Publicar / Ignorar**; responder à mensagem
  com outro texto publica esse texto. Avisos na mensagem: nota baixa, expressão recusada, sigilo (cirurgia, sessão,
  tratamento). Até 5 por rodada. Os botões ficam no fluxo "BMH · Telegram · botões" (que agora também recebe mensagens),
  com travas: só proposta aberta e só os dois perfis da BMH. Tabela `BMH_avaliacoes_google` (`meuAoXOYHo1lt0XQ`): código,
  unidade, nota, data, sugestão, decisão; **sem nome nem texto** de quem avaliou. Execução com sucesso não é guardada.
  Teste: `/webhook/bmh-perfil-avaliacoes-693566a0dd11?modo=teste&simular=1` (2 mais recentes, não grava nem publica).
  Código: `integracoes/perfil-google/n8n/`. Cópia do fluxo de botões antes: `dados/n8n-copias/bmh-telegram-botoes-20261014.json`.

- **Site de cada perfil (14/10/2026, "pode" do Jorge):** Asa Sul → `/hiperbarica-asa-sul/?utm_source=google&utm_medium=organic&utm_campaign=perfil-asa-sul`,
  Taguatinga → `/hiperbarica-taguatinga/?utm_source=google&utm_medium=organic&utm_campaign=perfil-taguatinga` (antes os dois
  apontavam para a home). Aceito pela API; o Google deixa em análise antes de mostrar. Para voltar: mesmo PATCH com
  `websiteUri` = `https://hiperbaricabrasilia.com.br/`.
- **Nota na home (14/10/2026):** fluxo "BMH · Perfil do Google · nota para o site" (`uaM8n9o97K5YH9QR`,
  `/webhook/bmh-nota-google?chave=` com `NOTA_GOOGLE_CHAVE` do `.env`) → snippet 8 "BMH · nota do Google" no Code Snippets
  (`site/codigo/nota-google.php.modelo`; a chave entra no envio), que busca 2x por dia pelo agendador do WordPress e
  guarda; shortcode `[bmh_nota_google unidade= campo= padrao=]`. Na home (1352 e `site/paginas/home-v2.html`): 4º item
  da faixa de provas ("4,8 e 4,9 no Google · 262 avaliações") e a nota no cartão de cada unidade, com link para o perfil
  no Maps. Só nota e total: nenhum texto de avaliação (depoimento passa pela trava do CFM). Cópia da home antes:
  `dados/home-1352-antes-nota-google-20261014.html`.
- Links do Google para pedir avaliação (para um pedido no fim do tratamento): Asa Sul
  `https://search.google.com/local/writereview?placeid=ChIJJXS9NUUlWpMRlYawN2nXqeA`, Taguatinga
  `https://search.google.com/local/writereview?placeid=ChIJxQ67LUozWpMRRY1izF8vR8Y`.

## Falta

-   perfil apontando para a página da unidade com UTM (muda o perfil público: só com o "pode" do Jorge).

## Histórico

- **08/10/2026, 1º pedido: recusado na hora** ("doesn't meet our criteria"). Causa provável: na pergunta "Does your
  organization currently have an active, allowlisted Google Cloud Project ID?" a resposta certa é **No** (o projeto
  aprovado é o da Nexo, outra empresa).
- **08/10/2026, 2º pedido:** pela conta dona dos perfis, empresa "BMH Asa Sul", perfil verificado há mais de 60 dias
  (Yes), projeto allowlisted (**No**). Foi para análise.

## Dados do pedido

| | |
|---|---|
| Projeto do Google Cloud | `bmh-integracoes` · **número 136521083780** |
| Perfis | Asa Sul e Taguatinga (o acesso vale para o projeto, não por unidade) |
| Site | `https://hiperbaricabrasilia.com.br` (cadastrado nos dois perfis) |
| Tipo | Basic API Access, uso próprio |

**Como saber se aprovou:** chamar `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` com o token do
projeto. Cota 0 (erro 429 com `quota_limit_value: "0"`) = não aprovado; 200 ou 403 de permissão = aprovado.

## Depois da aprovação

1. Ativar no projeto as APIs do Perfil da Empresa (Account Management, Business Information, Performance e a
   "Google My Business API" v4, das avaliações e postagens): clique do Jorge no console.
2. A autorização OAuth do Google Ads da BMH (`GOOGLE_ADS_REFRESH_TOKEN`) já inclui `business.manage`: testar com ela.
3. Usar: nota e avaliações na home ("O que dizem no Google"), números do perfil (ligações, rotas, cliques no site) no
   relatório, respostas às avaliações com aprovação humana.
4. Apontar o "site" de cada perfil para a página da própria unidade, com UTM:
   `/hiperbarica-asa-sul/?utm_source=google&utm_medium=organic&utm_campaign=perfil-asa-sul` e o mesmo para Taguatinga.
   Nunca usar o projeto ou a autorização da Nexo para os perfis da BMH.

## Ocorrências

- **30/10/2026, 17:37 (Brasília):** "BMH · Perfil do Google · avaliações" (`yNozxi1jNwRbLhFR`), execução 750547, erro 503 do
  Google no nó "Avaliações do perfil" (BMH_falhas, linha 6). Isolado: a `BMH_falhas` não tem outra linha desse fluxo, e a
  vigia marcou rodadas até 31/10, 7h37. Nada se perdeu: o nó lê todas as avaliações sem resposta, sem janela de tempo, e
  tira só as que já viraram proposta; a rodada seguinte, 30 min depois, pega a mesma avaliação. Conferido em 31/10 pelo
  Gerente BMH. **Se repetir:** pôr nova tentativa na chamada do Google dentro do nó (ele é de código, então a tentativa
  vai no código ou nas opções do nó), numa cópia de homologação, e pedir pelo porteiro.
