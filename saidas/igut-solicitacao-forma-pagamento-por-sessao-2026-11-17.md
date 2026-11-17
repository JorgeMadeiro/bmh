Assunto: API v2, receitasedespesas/financeiro: paciente (favorecido) e dedução vêm vazios nos recebimentos

Olá, equipe iGut,

Somos a BMH (Brasília Medicina Hiperbárica), unidades L2 Sul e Taguatinga, e usamos a API v2 (Bearer + Client Token) para
o painel financeiro da diretoria.

**Endpoint:** `POST /v2/receitasedespesas/financeiro`, corpo `{"Lancamento.mes": "AAAA-MM"}`

Na tela **Receitas e despesas** do iGut, cada recebimento mostra o nome do paciente, a forma de pagamento, a conta, o
tipo, o valor e a dedução. Pela API, o mesmo recebimento vem assim:

- `lancamento_forma`, `valor`, `conta_nome`, `lancamento_data`, `unidade_nome`: preenchidos;
- `favorecido_id` e `favoredico_nome`: **vazios** em todos os recebimentos de paciente (conferido em out/2026: 115
  recebimentos de particular, todos sem favorecido);
- dedução e valor líquido: **não vêm**.

Exemplo (out/2026): `lancamento_id` 26407, `lancamento_data` 2026-10-01, `lancamento_forma` "Cartao Credito 2x",
`valor` 400, `lancamento_fatura` 2283, `lancamento_origem` 2813, `lancamento_status_origem` "consulta",
`favorecido_id` vazio.

**O que pedimos**

1. Preencher no recebimento o paciente que pagou: `paciente_id` (o mesmo `paciente_id` de
   `POST /v2/businessintelligences/producao`) e o nome, em `favorecido_id` e `favoredico_nome` ou em campos novos.
2. Incluir a dedução e o valor líquido de cada lançamento, como aparecem na tela.
3. Se possível, os `agendamento_id` das sessões que o recebimento cobre (pacote de várias sessões).

Também testamos filtrar o mesmo endpoint por paciente (`Lancamento.paciente_id`, `Paciente.id`, `Lancamento.favorecido_id`)
e a API ignora o filtro e devolve o mês inteiro. Se existir outro endpoint ou parâmetro que já traga esses campos,
pode nos indicar.

Obrigado,
Dr. Jorge Madeiro
Diretor médico, BMH
