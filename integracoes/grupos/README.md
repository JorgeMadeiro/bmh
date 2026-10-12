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

## Painel da diretoria (09/10/2026)

- **Página:** `/webhook/bmh-diretoria` (fluxo "BMH · Diretoria (painel)", `26y4Uo2WLAAqpK70`), login próprio da diretoria
  (vai escrito na mensagem mensal, pedido do Jorge). Feita para o celular. Filtro por unidade e convênio.
- **Dados:** fluxo "BMH · Diretoria · grava os números" (`9D9x6CKFKKPY8qTu`), toda noite às 23h40: financeiro da produção
  (13 meses, BI) → `BMH_financeiro_mes`; operação de ontem e hoje (agenda) → `BMH_operacao_dia`. Histórico carregado desde
  set/2023, mês a mês (tudo de uma vez estoura a memória do n8n). Manual: `?so=financeiro&mes=AAAA-MM` ou
  `?so=operacao&desde=…&ate=…` (até 40 dias).
- **Regra:** Produzido = Faturado + A faturar; Faturado = Recebido + A receber + Glosado; particular = faturado e recebido.
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
