# Mensagens da BMH nos grupos de WhatsApp (diretoria e ADM das unidades)

> Fluxo de origem: "Produção Diaria e Mensal BMH" (`EkmBucG5LoEutBUa`, n8n, tag BMH), envio pelo WhatsApp Evolution
> (credencial "BMH · WhatsApp Evolution (envio aos grupos)"). Grupos: Diretoria, BMH ADM Asa Sul, BMH ADM Taguatinga.

## O que sai e quando (09/10/2026)

- **Horário:** o fluxo começa às 17h, lê a agenda do dia e espera o fim estimado da última sessão (início + 1h30 de sessão
  + 20 min para finalizar no iGut; consulta + 40 min), entre 18h30 e 21h30 (sem agenda: 19h05). Pedido do Jorge: "ao
  término estimado dessas sessões, inclusive no grupo ADM, fica fidedigno e ainda no dia". Antes: 19h05 fixo.
- **Grupos ADM (Asa Sul e Taguatinga):** agenda de hoje (com faltas) e agenda de amanhã, por horário e câmara. Sem o
  "MENSAGEM AUTOMATICA DE TESTE" desde 09/10. Nomes: primeiro nome + sobrenome (o Jorge considera curto o bastante).
- **Diretoria, diário (novo desde 09/10/2026):** `diretoria-diario.js` no nó "Code in JavaScript4", com a busca "Agenda da
  semana passada" antes: por unidade, sessões, ocupação, faltas em %, cobradas, avaliações; total; mesmo dia da semana
  passada; amanhã.
- **Diretoria, mensal:** fluxo novo "BMH · Diretoria · produção do mês" (`fvEYln7d2wWi4N2S`), dia 1 às 8h, código em
  `qual-mes.js` e `diretoria-mensal.js`. Vai ao **grupo da diretoria** (WhatsApp); a chamada manual é prévia no Telegram
  (`?mes=AAAA-MM`; `&grupo=1` manda ao grupo). Setembro enviado ao grupo em 09/10/2026 como teste, com o ok do Jorge.
  O mensal antigo do fluxo de produção não funcionava (pedia o mês inteiro à agenda: 504): gatilho desligado em 09/10.

## Regras (decididas pelo Jorge em 09/10/2026)

- **Falta** = Faltou, Desmarcado ou Desistiu (regra B), nas três mensagens. **Cobrada** = falta com atendimento finalizado.
- **Sessões do mês** = agenda das câmaras (111, 112, 121) finalizada, sem falta: setembro/2026 deu 1.129 + 601 = **1.730**,
  igual ao e-mail mensal do Jorge.
- **Financeiro = produção do mês (DRE, não caixa):** produzido; convênio faturado (sessões em lote); convênio a faturar
  (sessões feitas sem lote: só o usado, não a guia inteira); particular; recebido até hoje dessa produção; e o recebido
  dos 2 meses anteriores. **Recebido** = particular (cartão, D+1) + o que o convênio já pagou dessa produção. O mensal mostra o recebido da produção dos **6 meses anteriores** e o total em aberto (09/10/2026).
- **Avaliações automáticas (pendente):** a recepção escreve PATOLOGIA / DATA DA CIRURGIA / MÉDICO na observação do
  **cadastro** do paciente, que a API do iGut não entrega. O Jorge pediu ao suporte do iGut (09/10/2026). Regional = bairro
  do paciente (vem na API). Visitadora: falta a tabela médico → visitadora (secundário).
- Execuções com sucesso do fluxo mensal e do fluxo de produção não ficam guardadas (têm dado de paciente); erro continua guardado.

## Painel do faturamento (10/11/2026)

- **Pedido do Jorge:** login para a equipe de faturamento sem valores, em número de sessões, sem a Operação e com as mesmas
  subdivisões (unidade, convênio, período, lotes e pacientes).
- **Página:** `/webhook/bmh-faturamento` (fluxo "BMH · Faturamento (painel)", `5mh4lPPJv17bEC7N`), credencial
  "BMH · Painel do faturamento (login)" (`RVFzm3Lmx9LCg9Z9`); usuário e senha só no `.env` (`grep PAINEL_FATURAMENTO .env`).
  É o mesmo `painel-diretoria.js` e o mesmo `lote-pacientes.js` no modo "faturamento" (`montar.js faturamento`).
- **Sem R$ nem escondido:** o servidor monta os dados já em sessões; nenhum valor vai para a página nem para a lista de
  pacientes (endereço e chave próprios, `lista_fat` em `BMH_diretoria_chave`).
- **Como as sessões são contadas:** produzido = sessões do mês; a faturar, recebido, a receber e glosado vêm dos lotes
  (`BMH_financeiro_detalhe`); faturado = recebido + a receber; particular = recebido. A glosa é parcial: a sessão glosada
  também está em recebido ou a receber (conferido em 10/11/2026: 821 de 871 mês × unidade × convênio somam o total; nos
  outros 50 a diferença é exatamente a glosa). % = sessões recebidas ÷ produzidas. Prazo de recebimento: média ponderada
  pelas sessões pagas.
- **Voucher e cortesia (Jorge, 10/11/2026: tirar só do a faturar, "no produzido e recebido ele entra"):** o convênio
  "VOUCHER - CORTESIA" (817 sessões no histórico, todas "a faturar" no iGut, R$ 400 de produção) conta no produzido e no
  recebido, como o particular, e nunca no a faturar nem nas listas de atrasado. A lista de pacientes dele abre pelo recebido
  (no iGut as linhas estão "a faturar"). O painel da diretoria não muda.
- **Só sessão conta como sessão (Jorge, 10/11/2026: "o a faturar está divergente"):** a produção do iGut traz também itens
  da agenda CONSULTAS: consulta médica cobrada (código 10101012, ~R$ 89) e, com valor zero, retorno, telemedicina,
  guia/relatório e avaliação sem custo. Eles contavam como "1 sessão" e apareciam no a faturar do faturamento (na diretoria
  não, porque valem R$ 0). Desde 10/11/2026 `financeiro-monta.js`, `financeiro-detalhe.js` e `financeiro-paciente.js` só
  contam sessão quando o tipo ou a descrição diz oxigenoterapia ou o item é de agenda de câmara (MULTIPLACE ou MONOPLACE);
  o valor em R$ continua com tudo (a diretoria não muda). Conferido no iGut em fev/25, set/26 e out/26: a regra separa todos
  os tipos; out/26 passou de 1.590 para 1.586 sessões, com R$ 668.761 igual. Histórico recarregado mês a mês
  (`?so=financeiro&mes=`). Na diretoria, linha só de consulta aparece como "consulta" em vez de "0 sessões". As avaliações
  gratuitas (~170 por mês) não vêm na produção do iGut. "CONSULTAS", "MULTIPLACE" e "MONOPLACE" ao lado do paciente são o
  campo médico solicitante preenchido com o nome da agenda no iGut (340 sessões sem CRM em out/2026).
- **Na Central (10/11/2026):** `/paineis/bmh-faturamento` (porteiro, segredo `central_painel_bmh_faturamento` criado pelo
  `subir.sh` a partir do `.env` da BMH); código em `Jorge_Claude_VsCode/scripts/central/`.
- **Conferido em 10/11/2026 no endereço publicado:** sem login 401; login do faturamento 200, sem nenhum "R$" na tela,
  nov/26 com 495 produzidas = 154 faturadas + 341 a faturar; lista de pacientes com nome, sessões, dias e médicos, sem
  valor; chave errada 403; login do faturamento no painel da diretoria 401. O painel da diretoria não mudou (dados
  idênticos na simulação; fluxo no n8n intocado).

## Painel da diretoria (09/10/2026)

- **Página:** `/webhook/bmh-diretoria` (fluxo "BMH · Diretoria (painel)", `26y4Uo2WLAAqpK70`), login próprio da diretoria
  (vai escrito na mensagem mensal, pedido do Jorge). Feita para o celular. Filtro por unidade e convênio.
- **Dados:** fluxo "BMH · Diretoria · grava os números" (`9D9x6CKFKKPY8qTu`), toda noite às 23h40: financeiro da produção
  (13 meses, BI) → `BMH_financeiro_mes`; operação de ontem e hoje (agenda) → `BMH_operacao_dia`. Histórico carregado desde
  set/2023, mês a mês (tudo de uma vez estoura a memória do n8n). Manual: `?so=financeiro&mes=AAAA-MM` ou
  `?so=operacao&desde=…&ate=…` (até 40 dias).
- **Regra:** Produzido = Faturado + A faturar; Faturado = Recebido + A receber + Glosado; particular = faturado e recebido.
- **Operação por convênio (20/10/2026):** a carga grava também `BMH_operacao_conv` (dia, unidade, convênio: agendadas,
  atendidas, faltas, cobradas, avaliações; `operacao-conv-monta.js`, convênio da agenda do iGut com o nome igual ao do
  financeiro). Histórico desde set/2023 (21.263 linhas); a soma por convênio bate com o total em todos os 1.757 dias ×
  unidade. Com convênio no filtro, a Operação mostra só dele; Dias e lugares são da clínica, e a Ocupação vira a parte da
  ocupação que veio desse convênio.
- **Por que há "—" antes de nov/2024 (conferido em 22/10/2026):** o iGut tem os números, mas incompletos. Até abr/2024 quase
  nada ia para lote (a faturar de R$ 200 a 380 mil por mês); de mai a out/2024 o lote era lançado mas o pagamento não era
  marcado (jun/24 com 21% recebido); faltas não eram marcadas (0% até set/2024, 13% em nov/2024); avaliações só a partir de
  mar/2024. A operação começa em 09/09/2023: set/23 aparece "(desde 09/09)" e não serve de base para variação.
- **Operação por câmara (22/10/2026):** `BMH_operacao_camara` (`operacao-camara-monta.js`, dia × câmara: multiplace e
  monoplace da Asa Sul, monoplace de Taguatinga; agendadas, atendidas, faltas, cobradas, lugares). Histórico desde set/2023
  (3.417 linhas); a soma das câmaras bate com o total em todos os 1.761 dias × unidade. No painel, tocar no mês (seta) abre
  uma linha por câmara, com a ocupação de cada uma. Com convênio no filtro (22/10/2026), a seta abre as câmaras daquele
  convênio, por `BMH_operacao_camconv` (`operacao-camconv-monta.js`, dia × câmara × convênio; 2.888 dias × câmara e 21.303
  dias × convênio conferidos sem diferença); ocupação = parte da ocupação da câmara que veio do convênio.
- **Linha "Período" na Operação (22/10/2026):** soma dos meses mostrados (com o mês em andamento), como no financeiro; faltas e
  cobradas só de nov/2024 em diante e avaliações desde mar/2024; Var. ano compara só os meses fechados e só quando todos têm
  base completa (senão "—"); Var. mês não se aplica. A seta do Período abre a soma de cada câmara.
- **Mês de início incompleto:** o primeiro mês da clínica (set/23, desde 09/09), de cada unidade (Taguatinga, desde 27/01/2025)
  e de cada câmara aparece "(desde dd/mm)" e não entra em variação (Taguatinga jan/26 aparecia +2.468%).
- **Lista de pacientes dentro da janela, pela chave do dia (22/10/2026):** o n8n manda as páginas com `Content-Security-Policy:
  sandbox` (origem "null"), e o painel também abre pela Central (`central.cannlink.com.br/paineis/bmh-diretoria`, porteiro com
  cookie). De dentro da página isolada, o navegador não manda a senha do n8n nem o cookie da Central ("Load failed" no
  Safari). A lista agora vem do webhook próprio `IDS.diretoria.lista` (sem senha, responde com `Access-Control-Allow-Origin: *`),
  que só aceita a chave do dia (`BMH_diretoria_chave`: a de hoje e a de ontem), gerada pelo painel e entregue só a quem abriu
  o painel com login. Chave errada ou sem chave: 403. Testado no motor do Safari e no Chrome com a página isolada.
- **Valor bruto, sempre (decisão do Jorge, 20/10/2026):** não descontar retenção de imposto (`retencao_em_reais`: R$ 2.600
  em 242 sessões em 26 meses) nem estorno (`total_estorno`: 3 sessões, R$ 1.419). Não é pendência de conferência.
- **Auditoria de 20/10/2026 (iGut × tabelas, set/24 a out/26):** produção, sessões, recebido, a receber, a faturar e glosado
  com diferença zero, nas duas unidades; nenhuma sessão fora por unidade; as 5 agendas (111, 112, 113, 120, 121) lidas.
  Corrigido no mesmo dia: meses com mais de 13 meses que ainda têm pendência passam a ser refeitos em toda atualização
  (R$ 58.640 a receber de 2025 ficavam parados); prazo de recebimento e as duas listas de cobrança sem corte e com todos os
  convênios. Para saber: "sessões" do financeiro inclui consultas, retornos e avaliações sem custo (a operação conta só
  câmara); falta cobrada ("Faltou" no BI) entra na produção.
- **Corte de confiança:** o iGut só registra lote e pagamento de forma completa **desde nov/2024** (antes, "a faturar" e "a
  receber" inflados) e faltas também desde nov/2024; avaliações desde mar/2024. O painel mostra "—" antes disso e o bloco
  Atenção só olha de nov/2024 em diante (a receber > 90 dias: R$ 526 mil, GEAP R$ 221 mil e ASSEFAZ R$ 202 mil; a faturar
  atrasado: R$ 36 mil, TJDFT R$ 20 mil).
- **Conferido:** setembro/2026 = 1.128 + 601 sessões (igual ao e-mail), produzido R$ 752.093, recebido R$ 122.860.
- **Mensagem mensal curta** (dia 1, 8h): sessões, faltas, avaliações, produzido, recebido, comparação, link e login.

## Testes antes de liberar (09/10/2026, pedido do Jorge)

- Login: sem senha, senha errada e usuário errado → 401; certo → 200 em ~1,3 s, `no-store`, `noindex`.
- `testa-painel.js` (rodar com `NODE_PATH=<node_modules com playwright-core>`): 360, 390 e 1280 px sem rolagem lateral e
  sem erro; **318 combinações** (unidade × 53 opções de convênio × só pendentes), identidades do financeiro em cada linha,
  total = soma das linhas, período (um mês só; "De" depois de "Até" se ajusta). Tudo OK.
- Gravação noturna como às 23h40: 58 s, sem erro, sem duplicar linhas.
- Mensagem mensal (prévia no Telegram): link e login presentes, 337 caracteres.
- Horário das mensagens de 09/10: 19h50 (multiplace das 18h + 1h30 + 20 min).
- Todos os fluxos BMH ligados ao "BMH · Alerta de falha"; os que leem dado de paciente não guardam execução com sucesso.
- Filtros enxutos (pedido do Jorge): unidade, convênio, período (abre nos últimos 12 meses + o corrente) e "só pendentes".

## Detalhe por lote (09/10/2026)

- Tocar num valor azul do financeiro (a faturar, recebido, a receber, glosado; mês ou total do período) ou num convênio
  do bloco Atenção abre a lista por convênio e lote: lote, mês, unidade, sessões, dias e valor. Particular entra no
  recebido como "PARTICULAR (cartão)". **Sem nome de paciente** (a senha circula no grupo; LGPD): lote e dias bastam
  para achar no iGut.
- Dados: `BMH_financeiro_detalhe` (`financeiro-detalhe.js`, desde nov/2024), gravada junto com o financeiro às 23h40.
  Linha que deixa de existir (lote pago, atendimento trocado de convênio) volta zerada; vale também para o resumo.
- Conferido: detalhe = resumo em todos os 24 meses e situações; `testa-detalhe.js`: 152 toques (unidades × convênios ×
  células e Atenção), soma da janela = valor tocado, sem erro, 360 px. Página: ~276 KB, abre em 2 a 4 s.

## Pacientes do lote (3º nível, 09/10/2026)

- No detalhe, cada lote (e cada "a faturar") tem o link "pacientes ›" → `/webhook/bmh-diretoria-lote` (fluxo
  `4KY2KHpFp1BMxtcc`), com **login do financeiro** (o da diretoria recebe 401). Lista paciente, sessões, dias, médico
  solicitante e valor, com botão "Copiar lista para a equipe". Consulta o BI do iGut na hora; **nada é gravado** e o
  n8n não guarda a execução (nem de erro).
- Conferido: ASSEFAZ lote 42 jun/26 Asa Sul = 8 pacientes, 50 sessões, R$ 18.490 (igual ao painel); TJDFT a faturar jul/26
  Taguatinga = 3 pacientes, R$ 9.615; Bradesco lote 137 jul/26 = 26 pacientes, R$ 88.576. 360 px sem rolagem lateral.
- "Só pendentes" passou a esconder mês com pendência abaixo de 1% do produzido (ou de R$ 1 mil).
- **Ajuste (09/10/2026, Jorge: "abre outra página para login e não dá em nada"):** "pacientes ›" agora abre **na própria
  janela do detalhe**; a senha do financeiro é pedida num campo dentro do painel na 1ª vez e fica guardada só naquela aba;
  vai num cabeçalho (`X-BMH-Financeiro`), sem a tela de login do navegador. Testado: senha errada avisa, certa lista os
  pacientes (soma igual à linha do lote), 2º lote abre direto, "voltar" retorna ao detalhe. Sem senha ou com o login da
  diretoria: 403. A credencial antiga (login do navegador) foi apagada.
- **Um painel só, um login só (09/10/2026, Jorge: "não precisa ter outra senha, só quem acessa é a diretoria" e "deixar
  tudo em um painel só"):** a lista de pacientes saiu do endereço separado e da senha do financeiro (ambos apagados) e
  passou para o próprio fluxo do painel (`/webhook/bmh-diretoria?...&formato=json`), com o login da diretoria. Se o
  navegador não reenviar o login na consulta, a janela carrega a lista como página embutida (`&embutido=1`), que sempre
  reaproveita o login. Testado nos dois casos (8 pacientes, R$ 18.490 no lote 42 da ASSEFAZ). O fluxo do painel não
  guarda execução nenhuma (nem de erro), porque a lista tem nome de paciente.
- **Pacientes guardados (09/10/2026, "pode guardar o nome dos pacientes no n8n"):** `BMH_financeiro_paciente`
  (`financeiro-paciente.js`), gravada às 23h40 com o financeiro; a lista do 3º nível lê essa tabela (abre na hora, funciona
  com o iGut fora; mostra "dados de dd/mm hh:mm"). Sem o botão de copiar (Ctrl+C basta). "Atenção" virou "Para cobrar";
  "Só pendentes" saiu (não ajudava). **Prazo de recebimento** por convênio: `BMH_prazo_recebimento` (`prazo-monta.js`),
  dias entre a sessão e o pagamento na linha de fatura do iGut, média ponderada pelo valor (desde nov/2024: 88 dias;
  ASSEFAZ 182, GEAP 152).
- **Particular também (09/10/2026):** `BMH_financeiro_paciente` guarda os pacientes particulares (situação "recebido", sem
  lote); no detalhe do recebido, "PARTICULAR (cartão)" ganhou "pacientes ›". Conferido: soma dos particulares = recebido
  particular do resumo em todos os 46 meses × unidade; convênio segue igual ao detalhe nos 2.147 lotes.
