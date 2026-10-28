# Painel da BMH

> Pedido do Jorge em 08/10/2026: "antes de mexer em algo na BMH, fazer o painel" (base de comparação para as mudanças
> do anúncio e do site). Modelo: o painel de anúncios da Nexo (`Nexo_Claude_VSL/integracoes/painel-anuncios/`).

## Decisões (08/10/2026)

- **Onde:** no n8n, como o da Nexo (página com login que busca os números a cada abertura).
- **Isolamento:** um **usuário próprio da BMH no n8n**, com chave de API própria no `.env` da BMH. As credenciais da BMH
  (Google, iGut) ficam com esse usuário, fora do alcance dos fluxos das outras empresas (regra 7 de
  `seguranca-credenciais`).
- **WhatsApp:** a recepção usa o aplicativo no celular. O painel mede até o clique no WhatsApp; "agendou" e "atendido"
  por canal ficam para quando houver sistema. Os atendimentos entram no total, pelo iGut.
- **iGut:** a chave que já está no n8n (fluxo "Produção Diaria e Mensal BMH").

## No ar no n8n (08/10/2026)

- **Endereço:** `https://automacao.cannlink.com.br/webhook/bmh-painel` (pede login do navegador). Login no `.env`:
  `grep PAINEL_BMH .env` no terminal. `?formato=json` devolve só os dados. Período: `?inicio=AAAA-MM-DD&fim=AAAA-MM-DD`.
- **Fluxos** (ids em `n8n-ids.json`; montar e reenviar com `node --env-file=.env integracoes/painel/n8n/montar.js`):
  - "BMH · Painel · grava o dia" (`AeQIImClkXtRrWIf`), 6h10: Google Ads, Analytics e Search Console dos últimos 28 dias →
    tabelas. Manual: `/webhook/bmh-painel-grava?dias=N` ou `?desde&ate`. Histórico carregado desde 01/09/2025.
  - "BMH · Painel (página)" (`zwEgF9jUwX6TcHhK`): lê as tabelas e entrega `pagina.html`.
  - "BMH · iGut · atendimentos do dia" (`gPRwxWVpbMT0q4AP`), 3h20: sessões realizadas e pacientes distintos por dia e
    unidade (produção do iGut; linha de faturamento não conta), últimos 7 dias. Histórico desde set/2023 (o iGut não tem
    dados antes; jan a mar/2023 responde "Found no matching data"). Taguatinga desde jan/2025. Valor produzido gravado
    em todos os dias desde set/2023 (recarga em blocos de 15 dias em 08/10/2026; o iGut falha em blocos grandes).
- "BMH · Anúncios · guardião diário" (7h30, só Google Ads): R$ 40 em 3 dias sem contato → pausa o grupo; orçamento que
  leva o mês acima do teto → corta na proporção (teto atingido → pausa); anúncio reprovado e alteração feita por outra
  pessoa → avisa (a Triunfo saiu do time e teve os acessos removidos em 28/10/2026: desde então, toda alteração de
  terceiro é estranha). Modo por regra em BMH_config (`guardiao_modo_teto`, `guardiao_modo_pausa`: simulacao |
  real); **começou em simulação em 08/10/2026**; **regra do teto em modo real desde 08/10/2026** ("pode ligar o guardião do teto"), regra de pausa segue em simulação (com botão no Telegram) por 2 semanas. Registro em BMH_guardiao_registro; o painel mostra os 3 últimos dias.
  Teste: `/webhook/bmh-guardiao?teste=1` (não grava nem aplica; manda no Telegram marcado como TESTE, sem botões).

## Telegram, robô "BMH alertas" (@Bmh_alertas_bot), 08/10/2026

Chat do Jorge: 8708228589 (`TELEGRAM_BMH_CHAT` no `.env`). Credencial n8n "BMH · Telegram (robô BMH alertas)".
- **Guardião (7h30):** os avisos numa mensagem; cada proposta (pausar, baixar orçamento) numa mensagem com **Aplicar** e
  **Ignorar**. O botão leva `gd:<código da chave do registro>:a|i`.
- **"BMH · Telegram · botões"** (`shml1gDwSqcUX2qu`): recebe o toque, só do chat do Jorge. Aplicar muda no Google Ads na
  hora, com travas: só a conta 5066798424, só pausar ou baixar orçamento, só proposta de hoje ou ontem ainda "simulado",
  e orçamento só se ainda estiver no valor da proposta. Grava a decisão em BMH_guardiao_registro e edita a mensagem.
  Falha passageira não fecha a proposta (aviso no próprio botão).
- **"BMH · Telegram · resumo da manhã"** (`QGDceUjADbnNINb3`, 8h): Google Ads, WhatsApp pelo site e iGut de ontem; o mês
  até ontem contra o teto (projeção igual à do guardião: gasto + orçamento de hoje × dias que faltam) e contra o mesmo
  período do mês anterior; propostas esperando decisão. Manual: `/webhook/bmh-resumo-manha`.
- **"BMH · Anúncios · medição da reorganização"** (`atKLrTjcDA2D6iSS`, quinta 8h20, dia do Jorge na BMH, de 15/10 a 05/11/2026): depois (09/10 até
  ontem) × os mesmos N dias **com anúncio** antes (a conta ficou parada de 22 a 29/09). Custo por contato, preço do clique,
  perda por posição, nota de qualidade ponderada, grupos, concorrentes e grupo de preço. Bloco orgânico (Search Console, semana até 3 dias atrás): posição de "hiperbárica" e "câmara hiperbárica", cliques e exibições de `/perguntas-frequentes/` (trocada em 08/10) e da página inicial, contra a semana anterior e a linha de base de 90 dias; avisa se a posição piorar mais de 3 ou as exibições da página de perguntas caírem mais de 40%. 15/10: régua da 1ª semana (acima de
  R$ 50 **e** pior que antes → recomenda voltar). 05/11: metas, concorrentes e preço (R$ 60). Só recomenda. Teste:
  `/webhook/bmh-medicao-ads?teste=1`. Desligar depois de 05/11.
- **"BMH · Alerta de falha"** (`7u3CuyjESsHmCtMW`): fluxo de erro de todos os fluxos BMH, inclusive o antigo "Produção
  Diaria e Mensal BMH". Manda fluxo, etapa e erro, sem dado de paciente.
- **Valor do iGut ("o produzido", Jorge 08/10/2026):** `totalproduzido` das linhas de sessão e de consulta; linhas de
  faturamento (`e_fatura_sessao`) ficam fora para não contar duas vezes. Aparece no cartão "Sessões no iGut".
- **Tabelas** (n8n data tables): BMH_config (teto e chaves), BMH_google_anuncios_dia, BMH_google_parcela_dia,
  BMH_site_cliques_dia, BMH_organico_diario, BMH_horas, BMH_igut_dia. Só números, sem dado de paciente.
- **Credenciais no n8n:** BMH · Google (conta de serviço) · Search Console e Analytics; BMH · Google Ads (renovação do
  acesso); BMH · Painel (login); BMH · iGut (acesso). Todas presas aos domínios que usam.
- **Conferido:** números do n8n iguais aos da coleta local no mesmo período (gasto, contatos, ligações, cliques, origens,
  busca, horas, visitas, rotas); parcela de impressões 65% × 64% (ponderada por dia, como na Nexo).

## Versão 3 (08/10/2026): a página é a da Nexo

"Formato não tá igual": a página agora é **cópia da página da Nexo** (`Nexo_Claude_VSL/integracoes/painel-anuncios/
pagina.html`) com nome e cores da BMH, e o `coleta.js` entrega os dados **no mesmo formato** do nó "Monta os dados" da
Nexo (`anuncios`, `origens`, `organico`, `organico_tot`, `mes`, `horas`, `google_parcela`...). Mudanças na página, todas
condicionadas a `d.bmh` / `mede_agendamento` / `mede_atendimento` (a página continua servindo à Nexo se voltar para lá):
destaque com custo por contato; "Todas as origens" sem Kommo (contatos, visitas, rotas, atendidos do iGut); "—" em
agendaram e atendidos; leitura sem a regra "conversas que marcam consulta"; textos de Kommo, Tintim e guardião trocados.
Origens = cliques no WhatsApp do site (um por clique, Analytics), pago com a campanha do Google Ads.
**Teto:** R$ 3.600/mês. **Orçamento aplicado no Google Ads em 08/10/2026 ("Pode A"):** LEADS R$ 86/dia e TRÁFEGO R$ 32/dia.
**n8n:** decisão do Jorge de usar a mesma chave das outras empresas (registrada em `seguranca-credenciais`).

## Arquivos

- `coleta.js`: busca Google Ads (API), Analytics (GA4 418169293) e Search Console e devolve um JSON. Período por
  `--inicio/--fim` (padrão: 28 dias até ontem) e o anterior do mesmo tamanho.
- `pagina.html`: a página; os dados entram no marcador `/*__DADOS__*/null`. Sem "duas chaves seguidas" (o n8n
  transforma em expressão).
- `previa.js`: junta os dois e grava `saidas/painel/painel-previa.html` (prévia local).

## Como cada número é contado

- **Contatos do anúncio:** conversões do Google Ads (WhatsApp do site + ligação pelo anúncio).
- **Contatos sem anúncio:** evento `click` do Analytics para `api.whatsapp.com`/`wa.me` em visita não paga (tem histórico).
- **Por caso e por botão:** evento `clique_whatsapp` (Tag Manager versão 4), desde 08/10/2026.
- **Taxa por página de entrada:** cliques no WhatsApp ÷ visitas que começaram na página (`landingPage`).

## Para ligar no n8n (falta o Jorge)

1. No n8n (`automacao.cannlink.com.br`), como dono: **Settings › Users › Invite**, e-mail só da BMH (pode ser
   `jorgemadeirotorres+bmh@gmail.com`, que chega na mesma caixa), papel **Member**. Aceitar o convite e criar a senha.
2. Entrar como esse usuário: **Settings › n8n API › Create an API key** ("Claude BMH", sem vencimento).
3. No terminal: `bash scripts/guardar-chave.sh N8N_URL N8N_API_KEY` (URL: `https://automacao.cannlink.com.br`).
4. Como dono: no fluxo "Produção Diaria e Mensal BMH", **⋯ › Move** para o usuário da BMH, junto com a credencial do iGut.
5. Login do painel: `bash scripts/guardar-chave.sh PAINEL_BMH_USUARIO PAINEL_BMH_SENHA`.

Depois disso o Claude cria as credenciais do Google no usuário da BMH, o fluxo da página e a leitura diária do iGut.

## Padrão dos fluxos e vigia (15/10/2026, T6 e S3 do bastão da Pessoal, aprovados pelo Jorge)

- **Notas:** toda nota de cabeçalho dos fluxos do montador começa com **Traz / Envia / Limites**.
- **Limite de 1 h por execução** (`executionTimeout: 3600` no `ajustes()`): execução travada vira erro e o "BMH · Alerta
  de falha" avisa.
- **Vigia de parados:** "BMH · Vigia · fluxos parados" (`6wNDORbM8I1jGEyU`), das 7h às 22h aos 23 min. Cada fluxo agendado
  (mapa `VIGIA` no montador) ganhou os nós "Vigia · marca que rodou" e "Vigia · grava", que anotam o início em
  `BMH_vigia` (`0kBTGpt8EjCjmR9t`). Prazos com folga: diário 26 h, avaliações 11 h, semanal 170 h, mensal 745 h. Um aviso
  por problema. Testado em 15/10 com uma linha de teste (avisou uma vez, não repetiu; linha apagada).
- **Google orgânico da semana:** "BMH · Google orgânico · semana" (`WiOZe3DeyyANNhdr`), segunda às 7h07: cliques,
  exibições e posição da semana (que termina 3 dias antes) contra a anterior, as buscas mais clicadas, mudanças de
  posição com volume e UMA ação de 10 minutos (página nova publicada antes da semana e sem exibição; senão busca LOCAL
  com pouco clique; senão "nada urgente"). Genéricas do Brasil inteiro ficam fora da ação (auditoria, achado A10).
  Teste: `/webhook/bmh-google-organico-semana?teste=1`.
- Cópias dos fluxos antes dessas mudanças: `dados/n8n-copias/20261015-antes-vigia/`.

