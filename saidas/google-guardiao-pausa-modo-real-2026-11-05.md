# Guardião do Google da BMH: ligar o modo real da pausa? (05/11/2026)

Fim da medição em simulação (desde 08/10). Fluxo `J8a8SbtlLzud62fl` (ativo, versão de 15/10). Regra: grupo com **R$ 40 em 3 dias
sem nenhum contato** (conversões do Google, que incluem ligação) é pausado. Hoje `guardiao_modo_pausa` = simulação: só propõe no
Telegram, com Aplicar e Ignorar. A campanha Concorrentes está fora da regra até 05/11 (`EM_TESTE`) e **entra amanhã, 06/11**.

Fontes: `BMH_guardiao_registro` (`dados/meta/registro.py`, 15 linhas, 10/10 a 03/11) e `BMH_google_anuncios_dia` (2.974 linhas, até
04/11), pela rota n8n-tabelas-numeros. Simulação das réguas em `dados/meta/simula-pausa.py` (fora do git).

## As 6 pausas simuladas

| Data | Grupo | Gasto em 3 dias | Resposta | O que veio depois (até 04/11) |
|---|---|---|---|---|
| 13/10 | Concorrentes (teste 4 semanas) | R$ 50,40 | sem toque | |
| 14/10 | Concorrentes | R$ 61,78 | sem toque | |
| 15/10 | Concorrentes | R$ 58,75 | **ignorado pelo Jorge** | de 13/10 a 04/11: R$ 214,80 e **13 contatos** (11 + 2 ligações), R$ 16,52 por contato |
| 31/10 | Asa Sul | R$ 53,47 | sem toque | |
| 01/11 | Asa Sul | R$ 43,33 | sem toque | |
| 02/11 | Asa Sul | R$ 43,33 (o mesmo dia 30/10 contado de novo) | sem toque | de 31/10 a 04/11: R$ 15,21 e 0 contato |

Para comparar: a conta inteira, em outubro, gastou R$ 4.403,64 para 132 contatos, **R$ 33,36 por contato**.

## O que o modo real teria feito

- **Concorrentes: falso positivo.** A pausa de 13/10 teria economizado R$ 214,80 e perdido 13 contatos. Os primeiros contatos vieram
  em 22/10, e o grupo virou o de contato mais barato da conta (metade da média). O Jorge acertou ao ignorar.
- **Asa Sul: acerto, de valor pequeno.** A pausa de 31/10 teria economizado R$ 15,21 até 04/11, sem perder contato. Desde 10/10 o grupo
  gastou R$ 213,23 para 2,3 contatos (R$ 92 por contato).
- **Saldo: R$ 230 economizados contra 13 contatos perdidos.** Ao custo médio, 13 contatos valem uns R$ 430.

**Por que a régua erra:** com R$ 33 por contato, R$ 40 é pouco mais que o preço de um contato. Um grupo normal passa 3 dias sem
contato por acaso em cerca de 3 de cada 10 vezes. A régua mais longa (R$ 100 em 7 dias) também teria pausado Concorrentes, em 18/10,
e nunca teria pegado Asa Sul, que gasta pouco por semana.

## Proposta (recomendação do Gerente BMH)

1. **Não ligar o modo real agora: a pausa fica em simulação.** É o que a medição sustenta. Amanhã Concorrentes entra na regra, e com
   R$ 10 a 13 por dia pode receber proposta em qualquer seca de 3 dias. Em simulação, ela só chega como proposta, com Aplicar e
   Ignorar, como foi o caso de 15/10.
2. **Asa Sul fica com decisão humana.** Pausar o grupo à mão é outro pedido, e conversa com o pedido 130 (em "revisar"), que manda as
   buscas com "asa sul" para esse grupo. Se ele for pausado, essas buscas ficam sem anúncio de unidade.
3. **Se o Jorge quiser o modo real mesmo assim:** é uma escrita na `BMH_config` (`guardiao_modo_pausa` = `real`, chave e valor). A VPS
   não escreve nessa tabela: é pelo Mac ou pela Central. Para voltar atrás, gravar `simulacao` na mesma chave. A pausa real é só de
   grupo, nunca religa sozinha, e avisa no robô BMH alertas.

O teto do mês (`guardiao_modo_teto`) já está em real desde outubro (6 aplicações de orçamento no registro) e não muda com esta proposta.
