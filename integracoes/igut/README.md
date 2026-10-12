# iGut da BMH: o que a API entrega (conferido em 09/10/2026)

> Diagnóstico por fluxo temporário no n8n (credencial "BMH · iGut (acesso)"), que devolveu só totais e nomes de campos;
> apagado no mesmo dia. Nenhum dado de paciente gravado.

## Endpoints

| Endpoint | Para quê | Cuidado |
|---|---|---|
| `POST /v2/consultas/buscar` `{"Agendamento.data","Agendamento.data_fim"}` | agenda: paciente, horário, tipo, confirmado, status, convênio, agenda (Profissional), unidade, bairro/cidade do paciente | **mês inteiro dá 504 (tempo esgotado)**: pedir **dia a dia**. Era isso que quebrava o relatório mensal do fluxo "Produção Diaria e Mensal BMH" |
| `POST /v2/businessintelligences/producao` (mesmo corpo) | um item por procedimento: `totalproduzido`, `totalcobrado`, `totalpago`, `e_fatura_sessao`, `lote`, `pago`, `convenio`, `profissional`, `status_descricao` | só Confirmado/Não Confirmado (falta não aparece aqui) |
| `POST /v2/receitasedespesas/financeiro` `{"Lancamento.mes":"AAAA-MM"}` | livro-caixa: RECEITA e DESPESA por categoria | setembro/2026: receitas R$ 482.702 (407 lançamentos) |

## Agendas (Profissional.id)

111 MONOPLACE (Asa Sul) · 112 MULTIPLACE (Asa Sul) · 113 CONSULTAS (Asa Sul) · 120 CONSULTAS TAGUATINGA · 121 MONOPLACE
TAGUATINGA. Tipos: Sessão de Oxigenoterapia Hiperbarica, Avaliação sem Custo, Reserva de Horário Avaliação (a 1ª sessão
reservada para quem faz a avaliação: é a "programação" da mensagem da recepção), Retorno, Telemedicina, Consulta Medica.
`confirmado`: Confirmado, Nao Confirmado, Faltou, Desmarcado, Desistiu. `status`: Agendado, Em Andamento, Finalizado,
Fila de Espera.

## Setembro/2026 (para conferir as regras)

- **Sessões = agenda das câmaras com status Finalizado:** Asa Sul **1.128** (igual ao e-mail mensal do Jorge), Taguatinga
  601 (e-mail: 602). Faltou: Asa Sul 6 (1 finalizada = cobrada), Taguatinga 32. Desmarcado: 127 e 35.
- **BI, linhas de sessão (produzido):** Asa Sul R$ 500.362, Taguatinga R$ 251.731 (R$ 752.093).
- **BI, linhas de fatura:** convênio com lote R$ 249.651, convênio sem lote R$ 427.779; particular R$ 123.840 (R$ 94.290
  pagos). Hipótese a confirmar com o Jorge: com lote = faturado, sem lote = a faturar.
- **Avaliações (09/10):** observação do agendamento vazia em todas; médico solicitante vazio nas avaliações (preenchido
  em 49 de 125 agendamentos do dia); bairro e cidade do paciente vêm na maioria.
