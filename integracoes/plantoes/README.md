# Plantões médicos: fechamento do mês e e-mails (09/10/2026)

> Pedido do Jorge: automatizar o que ele fazia todo dia 1 (aba do mês a partir do formulário dos médicos, conferência
> das lacunas, e-mail de honorários e e-mail de produção). Regras do prompt que ele usava + regras da BMH:
> Asa Sul manhã 8:00–14:00 e tarde 15:00–20:30; Taguatinga manhã 8:00–14:00 e tarde 15:00–19:00; R$ 75/hora;
> pagamento até o 10º dia útil; NF no 1º dia útil. Não inventa plantão: aponta a lacuna e o Jorge completa.

## Planilha

"Planilha Prestação Serviço Médico" (`1E2DJykq0SAARKh9ci5MEtuCfDsXOzbPAlazjOFO5XKM`), compartilhada com a conta de serviço
`bmh-site@bmh-integracoes` (Editor); API do Google Sheets ativada no projeto em 09/10/2026.
- **Respostas:** o formulário (A carimbo · B e-mail · C nome · D CRM · E data · F turno · G unidade · I início · J término).
- **MM/AA** (ex.: "09/26"): aba do mês, uma por mês desde jan/2024. Desde 09/10/2026 a cobertura vai **dentro** da aba do mês (pedido do Jorge): no fim, uma
  linha por turno sem formulário (data, turno, unidade e horário padrão; nome e CRM em branco), **em vermelho** enquanto
  o nome estiver vazio. O TOTAL soma toda linha com CRM, então a lacuna preenchida entra no total e no e-mail.
- **Pagamento** (criada em 09/10/2026 com os dados do e-mail de honorários que o Jorge colou, autorizado): CRM, nome no
  formulário, nome no e-mail, dados para pagamento, NF. **Dado pessoal dos médicos**: só o Jorge mantém; os fluxos só leem.

## Fluxos (n8n)

1. **"BMH · Plantões · fechamento do mês"** (`QaQ4SIaS2neUfUuS`), dia 1 às 8h: lê Respostas, aplica as regras
   (`monta-mes.js`: mês da data do plantão; Específico vira manhã + tarde; duplicados pelo médico, fica o envio mais
   recente; nome mais longo e CRM mais frequente), cria a aba "MM/AA" (com as lacunas em vermelho no fim) com fórmulas (separador `;`, a
   planilha é pt-BR), e manda as divergências no Telegram com o botão **"Pronto, gerar os e-mails"**. Se a aba já existe,
   não mexe (avisa). No refazer, apaga também a "Cobertura MM/AA" antiga, se houver. Manual: `/webhook/bmh-plantoes-mes?mes=AAAA-MM` (`&refazer=1` recria; `&prefixo=teste` testa).
2. **Botão "Pronto"** (fluxo "BMH · Telegram · botões", `pl:AAAA-MM:ok`, só o chat do Jorge) → chama o fluxo 3 com chave.
3. **"BMH · Plantões · e-mails do mês"** (`qNDy08i41junIQk9`): lê a aba do mês já completa + Pagamento, soma as sessões
   do mês (`BMH_operacao_dia`) e monta os e-mails (`emails.js`) no formato do Jorge. Com o Gmail autorizado, cria os dois
   **rascunhos** no Gmail dele; sem, manda os textos no Telegram. Não guarda execução (tem dado de pagamento).
   Destinatários: `BMH_config` → `email_honorarios_para` (Ieda, Alberto, Ivan e bmhiperbarica, do cabeçalho que o
   Jorge colou), `email_producao_para` (os mesmos, pedido do Jorge). Assunto "Honorários Médicos Mês/Ano" e
   abertura "Bom dia, espero que estejam bem. Segue honorários médicos de Mês, aos cuidados de Ieda:". Sai da conta
   jorgemadeiro@hiperbaricabrasilia.com.br.

4. **Aba Geral** (resumo mensal do Jorge), no mesmo "Pronto": o fluxo 3 preenche a linha do mês (honorário por unidade,
   horas, sessões do iGut, média por dia, ocupação, valor por sessão, e o total). Honorário é fórmula que soma a aba do
   mês (linhas com CRM), então corrigir a aba corrige a Geral; aba antiga feita à mão (valor em texto) vai com o valor já
   somado. Mês sem linha ganha uma abaixo da última, com o formato da de cima. Com `&prefixo=teste` não mexe na Geral.
   Jul a set/2026 preenchidos em 09/10/2026: julho da aba 07/26 (sem e-mail para conferir), agosto do e-mail que o Jorge
   colou (R$ 47.630 = aba + R$ 750 lançados à mão), setembro pela aba 09/26 (= R$ 46.253,75 que ele já tinha posto).
   Sessões: as do iGut batem com as que ele digitava (jul 1.891, ago 1.779; set 1.729 contra 1.730).

5. **Aba Geral, tabela de baixo (mono e multi da Asa Sul):** preenchida 1x por mês pelo relatório mensal da diretoria
   ("BMH · Diretoria · produção do mês", dia 1 às 8h, `integracoes/grupos/geral-camaras.js`): sessões finalizadas sem
   falta da agenda 111 (monoplace) e 112 (multiplace), média por dia e ocupação com o divisor da linha (ou da última
   preenchida). Dia sem agenda conta zero; se o iGut falhar num dia, não grava e avisa no Telegram. Manual só da Geral:
   `/webhook/bmh-producao-mes?mes=AAAA-MM&so=geral`. Fev a set/2026 preenchidos em 09/10/2026; mono + multi = sessões da
   Asa Sul em jul a set e diferem 1 a 3 sessões em fev a jun (números digitados na época). Janeiro ficou o do Jorge.

## Conferido (setembro/2026)

- Horas por médico e unidade calculadas do formulário = aba "09/26" do Jorge, exceto as lacunas que ele completou à mão
  (Jorge 43,3 h Asa Sul + 10 h Taguatinga; Lee Marvin 16 h): 547,4 h + 69,3 h = 616,7 h da aba dele. As 7 lacunas
  apontadas são exatamente essas.
- E-mail de honorários montado da aba "09/26" dele: R$ 46.253,75 (= total da aba). Produção: 1.128 + 601 (painel).
- Teste ponta a ponta no n8n com `prefixo=teste` (aba "teste 09/26"): sem erro de fórmula; 13 turnos sem formulário no
  fim, em vermelho; preencher nome e CRM de um deles somou 6 h e R$ 450 no total, e apagar tirou de novo.

## Falta

- Gmail: ativar a API do Gmail no projeto e rodar `python3 scripts/gmail-autorizar.py` (entrar com jorgemadeiro@hiperbaricabrasilia.com.br) (escopo só gmail.compose);
  depois criar a credencial n8n "BMH · Gmail (renovação do acesso)" e reenviar `montar.js plantoesEmails`.
- Preencher na aba Pagamento os médicos sem dados
  (Gustavo Montalvão, Francis, Julia) e o Pix do Dr. Gustavo Cury e do Dr. Guilherme; Pix do Dr. Lee Marvin: fica o
  59.522.793/0001-51, o do e-mail mais recente (agosto); o 36.947.211/0001-83 só aparece em junho, em Taguatinga.
  Para achar os que faltam: `python3 scripts/gmail-buscar-honorarios.py "nome" ...` (leitura, uma vez, nada guardado); confirmar o CRM da Dra. Ana Giullia (35251 ou 35252).
