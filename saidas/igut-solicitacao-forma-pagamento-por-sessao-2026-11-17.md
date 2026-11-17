Assunto: API v2: ligação entre pagamento e sessão (forma de pagamento do particular)

Olá, equipe iGut,

Somos a BMH (Brasília Medicina Hiperbárica), unidades L2 Sul e Taguatinga, e usamos a API v2 (Bearer + Client Token) para
montar o painel financeiro da diretoria. Precisamos saber, para cada sessão particular realizada, **com qual forma de
pagamento ela foi paga** (PIX, dinheiro, débito, crédito e em quantas parcelas). Hoje a API traz a forma no caixa e a sessão
na produção, mas não traz a ligação entre os dois.

**Endpoints que usamos hoje**

1. `POST /v2/businessintelligences/producao`, corpo `{"Agendamento.data": "AAAA-MM-DD", "Agendamento.data_fim": "AAAA-MM-DD"}`
   - Traz cada sessão (`agendamento_id`, `id`, `paciente_id`, `convenio`, `totalproduzido`, `pago`).
   - Nas sessões do convênio PARTICULAR, `pago` vem "S", mas `data_pagamento` vem "0000-00-00" e `totalpago` vem null em
     todas (conferido em out/2026: 307 sessões).
   - Não traz forma de pagamento nem o id do lançamento ou da fatura que pagou a sessão.

2. `POST /v2/receitasedespesas/financeiro`, corpo `{"Lancamento.mes": "AAAA-MM"}`
   - Traz o caixa do mês em `data.Lancamento[]`, com a forma em `lancamento_forma` ("PIX", "Dinheiro", "Cartao Debito",
     "Cartao Credito 10x" etc.).
   - Nos recebimentos de paciente, `favorecido_id` e `favoredico_nome` vêm vazios, e não vem `paciente_id` nem
     `agendamento_id`.
   - Vêm `lancamento_origem`, `lancamento_fatura` e `lancamento_status_origem` = "consulta", mas esses números não batem com
     `agendamento_id`, `id` nem `paciente_id` da produção, nem com nenhum campo de `POST /v2/consultas/buscar`.
   - Exemplo: `lancamento_id` 26407, 01/10/2026, "Cartao Credito 2x", R$ 400,00, `lancamento_origem` 2813,
     `lancamento_fatura` 2283, `lancamento_parcela` 2.

3. `POST /v2/consultas/buscar`, corpo `{"Agendamento.data": "AAAA-MM-DD", "Agendamento.data_fim": "AAAA-MM-DD"}`
   - Traz o agendamento, mas nenhum campo de pagamento.

**O que pedimos (qualquer uma das opções resolve)**

- **Opção A:** na produção (`businessintelligences/producao`), incluir em cada sessão a forma de pagamento e o id do
  lançamento ou da fatura que a pagou, e preencher `data_pagamento` e `totalpago` também no particular.
- **Opção B:** no caixa (`receitasedespesas/financeiro`), incluir nos recebimentos o `paciente_id` e os `agendamento_id` das
  sessões que aquele pagamento cobre (no caso de pacote, a lista de sessões).
- **Opção C:** um endpoint que, a partir de `lancamento_fatura` ou `lancamento_origem`, devolva a fatura com as sessões
  (`agendamento_id`) e os pagamentos dela.

E uma dúvida: a que se referem `lancamento_origem` e `lancamento_fatura` quando `lancamento_status_origem` é "consulta"?

Obrigado,
Dr. Jorge Madeiro
Diretor médico, BMH
