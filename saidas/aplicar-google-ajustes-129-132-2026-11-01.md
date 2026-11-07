# Aplicar os ajustes do Google Ads da BMH, pedidos 129 a 132 (preparado em 01/11/2026)

**Desde 07/11/2026:** o 132 entra pelo `python3 scripts/n8n/aplica-bmh-mac.py grava`, que guarda a cópia de antes, cria só as
negativas que faltam e lê de volta. O 129, o 130 e o 131 continuam fora.

**Decisões do Jorge (04/11/2026, conferidas no porteiro):**
- **132 APROVADO** (07h03): aplicar as seis negativas da campanha, **inclusive "fibromialgia"** (ele tocou em Aprovar, não em
  Revisar).
- **129, 130 e 131 em "revisar"** (07h02): **não aplicar**. A Central pergunta ao Jorge o que mudar.

Para a janela do Mac, **só depois do toque do Jorge em cada pedido**, e só o aprovado. Proposta completa e números em
`saidas/google-negativas-e-ajustes-2026-11-01.md`. Conta 5066798424, campanha `[LEADS][PESQUISA] - BMH`, API v25.

| Pedido | O que aplicar |
|---|---|
| 129 (A) | pausar a palavra-chave "hiperbarica" **ampla** (BROAD) no grupo TESTE DE PALAVRAS. A de frase fica como está |
| 130 (B) | negativas de **grupo**, frase: "taguatinga" e "asa sul", nos grupos TESTE DE PALAVRAS e Institucional + Concorrentes. **Só essas duas**: o pedido saiu com o texto antigo, que trazia também "brasília medicina hiperbárica", e essa já é negativa da campanha (aplicar menos que o pedido é permitido). Tirar a palavra-chave "Brasília medicina hiperbárica", bloqueada no Institucional, é mudança nova e vai num pedido de limpeza à parte |
| 131 (C) | pausar a palavra-chave "medicina hiperbárica" (frase, PHRASE) no grupo Institucional + Concorrentes |
| 132 (D) | negativas da **campanha**, frase: "estetica", "estética", "antes e depois", "ozônio", "caneta" e "fibromialgia". **"fibromialgia" só se o Jorge confirmou no toque** (veio com "Revisar" para ele decidir) |

## Antes de aplicar o 130

O Gerente BMH confere se os grupos de unidade têm a palavra, pela leitura de termos (`68fEUzJEX6ibQpXh` com
`?grupos=Taguatinga,Asa Sul`):
- **Asa Sul:** conferido em 01/11, tem "hiperbárica asa sul" em frase e exata;
- **Taguatinga:** conferido em 01/11 (leitura de 17:24Z), tem "hiperbárica taguatinga" em exata e frase e "câmara hiperbárica
  taguatinga" em exata e frase. Em outubro, pelas palavras-chave: R$ 148,64 e 11,3 contatos (os termos visíveis eram só R$ 46,85).

**As duas negativas do 130 podem ser aplicadas.** Os grupos de unidade excluem preço e convênio por negativa própria, e essas
buscas continuam indo para o grupo Valor e convênio.

## Passo a passo

1. **Achar os ids** (GAQL, só leitura):
   ```
   SELECT ad_group.id, ad_group.name, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group_criterion.negative
   FROM ad_group_criterion
   WHERE campaign.name = '[LEADS][PESQUISA] - BMH'
     AND ad_group.name IN ('TESTE DE PALAVRAS', 'Institucional + Concorrentes')
     AND ad_group_criterion.type = 'KEYWORD'
   ```
   E o id da campanha: `SELECT campaign.id FROM campaign WHERE campaign.name = '[LEADS][PESQUISA] - BMH'`.
2. **Cópia antes:** gravar o resultado da consulta do passo 1, e as negativas da campanha (`campaign_criterion` com
   `negative = TRUE`), em `dados/google-ads-copias/2026-11-0X-antes.json` (fora do git).
3. **Aplicar só o aprovado:**
   - 129 e 131 (pausar palavra-chave): `adGroupCriteria:mutate` com `update` em
     `customers/5066798424/adGroupCriteria/{ad_group_id}~{criterion_id}`, `status: PAUSED`, `updateMask: status`. Conferir
     antes que o criterion é o certo: texto, correspondência (BROAD no 129, PHRASE no 131) e `negative: false`.
   - 130 (negativa de grupo): `adGroupCriteria:mutate` com `create`:
     `{ adGroup: customers/5066798424/adGroups/{id}, negative: true, keyword: { text, matchType: PHRASE } }`, 2 textos × 2 grupos.
   - 132 (negativa de campanha): `campaignCriteria:mutate` com `create`:
     `{ campaign: customers/5066798424/campaigns/{id}, negative: true, keyword: { text, matchType: PHRASE } }`.
4. **Ler de volta** com a consulta do passo 1 (e a de negativas da campanha). Conferir que mudou só o aprovado.
5. **Avisar** a Central e o Gerente BMH com o que entrou. Uma semana depois, o Gerente BMH compara o custo por contato da campanha
   e dos três grupos com outubro.

## Voltar atrás

- 129 e 131: `status: ENABLED` no mesmo criterion.
- 130 e 132: `remove` do criterion criado, cujo id vem da resposta do `create`.

A cópia do passo 2 tem tudo.
