Assunto: API v2: paciente, dedução e valor líquido nos recebimentos (receitasedespesas/financeiro e producao)

Olá, equipe iGut,

Usamos a API v2 (Bearer + Client Token) nas nossas duas clínicas, BMH (Brasília Medicina Hiperbárica) e Centro Médico
Nexo, para os painéis financeiros e a DRE. Na tela **Receitas e despesas** do iGut, cada recebimento mostra o nome do
paciente, a forma de pagamento, a conta, o tipo, o valor, a dedução e o líquido. Pela API, parte disso não vem.

**1. `POST /v2/receitasedespesas/financeiro`**, corpo `{"Lancamento.mes": "AAAA-MM"}`

Devolve o livro-caixa do mês em `data.Lancamento[]`.

- **Vem preenchido:** `valor` (só o bruto), `lancamento_forma` (forma de pagamento), `lancamento_tipo`, `categoria_nome`,
  `subcategoria_nome`, `conta_nome`, `unidade_nome`, `lancamento_data`, `lancamento_status_label`, `lancamento_conciliado`,
  `lancamento_fatura`, `lancamento_origem`, `lancamento_status_origem`.
- **Vem vazio:** `favorecido_id` e `favoredico_nome` em todos os recebimentos de paciente (BMH, out/2026: 115 de 115).
- **Não vem:** a dedução e o valor líquido.
- Testamos filtrar por paciente (`Lancamento.paciente_id`, `Paciente.id`, `Lancamento.favorecido_id`): a API ignora o
  filtro e devolve o mês inteiro.
- Exemplo (BMH, out/2026): `lancamento_id` 26407, `lancamento_data` 2026-10-01, `lancamento_forma` "Cartao Credito 2x",
  `valor` 400, `lancamento_fatura` 2283, `lancamento_origem` 2813, `lancamento_status_origem` "consulta",
  `favorecido_id` vazio.

**2. `POST /v2/businessintelligences/producao`**, corpo `{"Agendamento.data": "AAAA-MM-DD", "Agendamento.data_fim": "AAAA-MM-DD"}`

Devolve a produção por procedimento, com `paciente_id`, `agendamento_id`, `totalproduzido` e `pago`.

- **Não vem:** forma de pagamento e valor líquido.
- **Vem vazio no particular:** `data_pagamento` ("0000-00-00") e `totalpago` (null), mesmo com `pago` = "S" (BMH, out/2026:
  307 sessões).

**O que pedimos**

1. No recebimento (`receitasedespesas/financeiro`), o paciente que pagou: `paciente_id` (o mesmo da produção) e o nome,
   em `favorecido_id` e `favoredico_nome` ou em campos novos.
2. Também no recebimento, a **dedução** e o **valor líquido** de cada lançamento, como aparecem na tela.
3. Se possível, os `agendamento_id` das sessões que o recebimento cobre (pacote de várias sessões), ou, na produção, a
   forma de pagamento, o `totalpago` e a `data_pagamento` de cada sessão.

Se já existir outro endpoint ou parâmetro que traga esses campos, pode nos indicar.

Obrigado,
Dr. Jorge Madeiro
