# DRE e fluxo de caixa da BMH

> Pedido do Jorge em 12/11/2026: "veja o DRE e fluxo de caixa da Nexo e faça o mesmo para a BMH, adicionando também o
> painel no andar dela na Central 3D". Molde: `Nexo_Claude_VSL/integracoes/dre/` (mesmas abas, contas e avisos).

## Onde

- **Página:** `https://automacao.cannlink.com.br/webhook/bmh-dre` (celular e computador), com o **login da diretoria**
  (decisão do Jorge, 12/11/2026). `?ano=2025` muda o ano; "Baixar em Excel" (`&formato=xlsx`); "Atualizar agora"
  (`?atualizar=1`, refaz o mês atual e o anterior, uns 40 s).
- **Na Central:** `central.cannlink.com.br/paineis/bmh-dre` (porteiro, mesmo segredo da diretoria) e uma tela na sala
  da BMH na Central 3D. Código em `Jorge_Claude_VsCode/scripts/central/`; publicar com `subir.sh`.
- **Fluxos** (ids em `integracoes/painel/n8n-ids.json`, montados por `integracoes/painel/n8n/montar.js dre drePagina`):
  - "BMH · DRE · atualiza do iGut" (`oOkY8CylGSLRrh4N`): todo dia às 4h05 refaz o mês atual e os 3 anteriores. Manual:
    `/webhook/<dre.atualiza>?mes=AAAA-MM` (um mês). Se o iGut falhar num mês, aquele mês não é gravado (não zera).
  - "BMH · DRE · página" (`lgPuqETovK8yAFNe`): a página, o Excel e o "conferido" (POST com chave interna).
- **Tabelas:** `BMH_dre_mensal` (`5kDb2bEbOHvU1btu`, `chave` = `mes|linha`) e `BMH_dre_conferidos` (`57orfVtY2DnNysmH`).
- **Código:** `regras.js` (linhas e classificação; entra no começo dos dois fluxos), `meses.js`, `monta-dre.js`,
  `resumo.js` (atualização); `calcula.js`, `planilha.js`, `pagina.js`, `marca.js` (página).

## De onde vêm os números (tudo do iGut, desde jan/2024)

- **Receita por competência** (como na Nexo): produção do iGut (BI) pela data do atendimento, pago ou não, pelo
  **valor produzido** (o mesmo do painel da diretoria; out/2026 bate centavo por centavo: R$ 668.761,35). Linhas:
  sessões de convênio, sessões particulares, consultas e outros atendimentos. Fora voucher e cortesia. Sessão = mesma
  regra do financeiro da diretoria (oxigenoterapia ou agenda de câmara).
- **Glosas de convênio:** dedução no mês da sessão, junto com os impostos ("Impostos e glosas").
- **Despesas:** lançamentos do mês no livro-caixa do iGut (`receitasedespesas/financeiro`), pagos ou não, pela data do
  lançamento. No iGut da BMH o tipo é só RECEITA ou DESPESA: a linha sai da categoria e da subcategoria (`regras.js`).
- **Decisões do Jorge (12/11/2026):** plantão médico (honorários médicos) = **custo variável**; equipamentos (parcelas
  das câmaras) = **investimento**, abaixo do EBITDA; CEMEP = **despesa não operacional**; "Cartão de crédito" = fatura do
  cartão da empresa (custo fixo, linha própria); "Receita com serviços › Particular" lançada como despesa (pagamentos de
  "produção realizada do mês", R$ 5 por sessão a Jorge e Ieda em out/2026) fica em **A classificar**, com cada lançamento
  no "Para conferir", até o Jorge dizer a linha.
- **Recebimentos lançados à mão em 2024** ("Receita com serviços › Convênio", jan a nov/2024, R$ 3,66 milhões): repetem
  as baixas automáticas por sessão dos mesmos dias (mai/2024: R$ 421 mil à mão + R$ 492 mil automáticos para R$ 454 mil de
  produção). Ficam fora da DRE e da soma do fluxo de caixa; aparecem numa linha "fora da soma" e no "Para conferir".
- **Fluxo de caixa:** só o pago e o recebido, pela data do lançamento. Recebimento de convênio = baixa sem forma de
  pagamento; particular = cartão, PIX ou dinheiro. Previsto = lançado e ainda não pago ou recebido. Sem saldo bancário
  (o iGut não traz).
- **Para conferir:** "Receita com serviços" lançada como despesa (um aviso por lançamento); mesmo favorecido, mesmo valor
  e mesma descrição no mês (fora salários, plantões, benefícios e retirada); parcelas da mesma série no mesmo mês;
  categoria que não combina com o favorecido (Caesb, telefonia, contador, oxigênio, lavanderia); favorecido fora da linha
  de costume; linha 40% e R$ 1.500 acima da média; "A classificar" do mês. A regra da Nexo de "2 favorecidos no aluguel"
  não vale (a BMH tem duas unidades e vários contratos). Marcar como conferido: fica riscado e some às 23h59.
- Nenhum dado de paciente é gravado; os dois fluxos não guardam execução.
