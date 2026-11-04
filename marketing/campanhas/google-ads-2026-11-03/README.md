# Google Ads da BMH: custo-alvo e teto de novembro (03/11/2026)

Pedido do Jorge em 03/11/2026: "pode fazer o 1" (baixar o custo-alvo) e "5 pode subir para 4400" (teto de novembro).

## O que estava acontecendo

Campanha principal "[LEADS][PESQUISA] - BMH" (`20776450309`), maximizar conversões com custo-alvo de R$ 42:

| | 10 a 20/10 | 21/10 a 02/11 |
|---|---|---|
| Preço do clique | ~R$ 7 | R$ 12 a 20 |
| Buscas perdidas por verba | ~0% | 50% a 90% por dia (77% no período) |
| Buscas perdidas por posição | 20% a 30% | ~1% (3% no período) |
| Custo por conversão | ~R$ 23 | ~R$ 43 |

Desde 21/10 o Google passou a usar o alvo inteiro de R$ 42: sobe o lance, ganha posição e o orçamento (R$ 84,85 desde o
corte do guardião em 23/10) acaba por volta das 14h. As conversões que contam no lance não mudaram (WhatsApp do site e
ligação).

## O que foi feito

| Quando | O quê | Antes | Depois | Como conferi |
|---|---|---|---|---|
| 03/11/2026, ~21h | custo-alvo da campanha principal (`scripts/google-ads-lance.js 20776450309 25`) | R$ 42 | R$ 25 | lido de volta pela API |
| 03/11/2026, ~21h | `teto_mes_2026-11` na `BMH_config` (linha 13) | 3.600 (padrão) | 4.400 | lido de volta pela API do n8n |

Feito 2 dias antes do fim da medição da reorganização (05/11), com o "pode" do Jorge.

**Voltar atrás:** `node --env-file=.env scripts/google-ads-lance.js 20776450309 42`. O teto volta apagando a linha
`teto_mes_2026-11` pelo n8n (a API pública não apaga linha).

## Como ler o efeito (7 a 10 dias)

- Preço do clique e buscas perdidas por verba devem cair; o anúncio volta a aparecer à tarde.
- Se os contatos caírem muito, subir o alvo para R$ 30.

## Não feito (espera o Jorge)

- **Orçamento:** com o teto de R$ 4.400, cabe uns R$ 150 por dia somando as campanhas (hoje R$ 100). Subir no máximo 20%
  por dia (método do Bruno). Ficou para o "pode" explícito.
- **Qualidade (item 2):** separar o grupo "Câmara hiperbárica · Brasília" em três (câmara, oxigenoterapia, clínica e
  medicina), cada um com anúncio que repete o termo, e trocar a página de "Feridas" para `/feridas-que-nao-cicatrizam/` e a
  de "Valor e convênio" para `/convenios/`.
- "hiperbárica asa norte": fica como está ("3 ainda não").
- Verba das campanhas pequenas (tráfego e concorrentes): só depois do CRM ("4 sim só o CRM").
