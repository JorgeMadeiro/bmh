# Google Ads da BMH: análise completa (08/10/2026)

> Leitura pela API, últimos 90 dias (09/07 a 07/10/2026) e histórico de 13 meses. **Nada foi alterado.** Complementa
> o [diagnóstico de 07/10](google-ads-diagnostico-2026-10-07.md) e as [propostas de 08/10](google-ads-propostas-2026-10-08.md).

## Em uma linha

A conta funciona (R$ 32 a 41 por contato, o mesmo de sempre), mas tem quatro problemas urgentes:
1. A agência ainda mexe nela.
2. Outubro gasta quase o dobro do normal.
3. Os textos, os destinos e as extensões são de antes do site novo.
4. A qualidade das palavras genéricas é baixa (nota 3 a 4 de 10).

## 1. Urgente

### 1.1 A agência continua mexendo na conta
Em **07/10/2026, às 21h26**, o usuário `dericdellatorre@triunfodig.com` (Triunfo Digital) incluiu, pela API, buscas
bloqueadas nas duas campanhas: "para que serve", "o que é", "como funciona", "benefícios", "laser", "ozonioterapia",
"oxigênio domiciliar". As escolhas são boas, mas dois gestores mexendo ao mesmo tempo é receita de um desfazer o outro.
**Decisão do Jorge:** avisar a agência da data em que para, e tirar o acesso dela nesse dia.

### 1.2 O gasto de outubro está acima do histórico
| | |
|---|---|
| Média dos últimos 12 meses (out/2025 a set/2026) | **R$ 3.641/mês** (de R$ 1.909 em agosto a R$ 5.322 em novembro de 2025) |
| Outubro até o dia 7 | R$ 1.610, **R$ 230/dia** |
| Projeção de outubro no ritmo atual | ~R$ 7.100 (o Google limita a ~R$ 6.200: 30,4 × R$ 205 de orçamento diário) |

Teto proposto: **R$ 3.600/mês**, o que dá R$ 118/dia. Divisão: LEADS R$ 86 e TRÁFEGO R$ 32, na mesma proporção de hoje.
Outubro fecha perto de R$ 4.400 mesmo assim, porque a primeira semana já gastou. Para fechar outubro em R$ 3.600, o
resto do mês teria que rodar a ~R$ 83/dia, com menos contatos durante o lançamento das páginas novas.
**Aguarda "pode" explícito** (o sistema bloqueia mudança de gasto sem ele).

## 2. Públicos: o que pode e o que não pode

**O Google não deixa clínica usar público montado pelo anunciante.** A política de anúncios personalizados põe saúde
entre as "categorias sensíveis": quem anuncia serviço de saúde não pode usar remarketing (quem visitou o site),
Customer Match (lista de pacientes), público semelhante nem expansão de público. Vale no Brasil.
([política](https://support.google.com/adspolicy/answer/143465))

Na conta hoje, as 6 listas de remarketing estão com **tamanho zero**. O Analytics está ligado ao Google Ads desde 2023,
mas só com os públicos automáticos. **Não vou criar público de remarketing:** a conta arriscaria anúncio reprovado ou
suspensão.

**O que pode, e vale a pena:**
1. **Públicos prontos do Google, só observando** (sem restringir quem vê): a TRÁFEGO já tem 10 interesses assim. Servem
   para ler quem converte melhor.
2. **Idade e gênero** (já medidos): 63% do gasto em mulheres, 44% entre 35 e 54 anos, e **o custo por contato é
   praticamente igual em todas as faixas** (R$ 26 a 38). Não há o que ajustar.
3. **Conversões do iGut (o "público" que importa):** enviar ao Google, com o telefone criptografado, quem foi
   **atendido**. Não é público: é medição. O Google aprende quem vira paciente e passa a buscar mais gente parecida
   **dentro das buscas**. É o que a Nexo faz. A política de privacidade da BMH já cobre isso (07/10/2026). Depende do
   iGut no n8n.
4. **Meta:** restrição parecida para saúde (eventos e públicos limitados). Conferir quando o token sair.

## 3. O que os números de 90 dias mostram

| Recorte | Achado | O que fazer |
|---|---|---|
| **Aparelho** | celular: 88% do gasto e 93% dos contatos, R$ 32 por contato; computador, R$ 54 | manter (a estratégia de lance já pondera) |
| **Hora** | 7h a 17h concentra; 19h é a pior hora (R$ 63 por contato); 20h a 22h, das melhores (R$ 19) | manter 5h às 23h; reavaliar com mais dados |
| **Dia** | terça e quinta, as melhores (R$ 26 a 27); sexta, a pior (R$ 46) | observar mais 4 semanas |
| **Região** | Taguatinga R$ 25 por contato; Asa Norte R$ 27; Asa Sul R$ 41; Ceilândia R$ 55; Vicente Pires R$ 79 | anúncio próprio para Taguatinga, levando à página nova da unidade |
| **Destino** | `/lp/` leva 75% do gasto (R$ 33 por contato pelo Google); página inicial, R$ 46; `/tratamento/`, R$ 204 (um link lateral, que agora redireciona) | teste `/lp/` × página do pós-operatório |
| **Taxa no site (28 dias, Analytics)** | página inicial 22,5% de contato por visita; `/lp/` 14,9% | o teste vai dizer qual ganha no anúncio |

## 4. Qualidade, textos e extensões

- **Nota de qualidade:** "câmara hiperbárica" 3; "oxigenoterapia hiperbárica" 4; "hiperbarica" 5. Na marca, 8 a 10. A
  "previsão de clique" está abaixo da média em quase todas as genéricas: **o texto não conversa com a busca**.
- **Concorrentes:** "Rinnovare" nota 1, "Oxi Hiperbárica" 3, "Centro Hiperbárico de Brasília" 3. O Google cobra mais
  caro por clique quando a nota é baixa.
- **Força dos anúncios:** média ou fraca em todos. Textos com promessa e superlativo ("líder", "rápida cicatrização").
- **Extensões da conta:**
  - os links laterais são "Agende sua consulta!", "Fisiologia do tratamento" (ia para `/tratamento/`, hoje redirecionada) e "Convênios médicos";
  - as frases de destaque são "Oxigênio, Inovação, Vida!" e "**Líder em OHB**" (superlativo, trava do CFM);
  - **não há** local (Perfil do Google ligado ao Ads).
- **Conversões:**
  - "WhatsApp" e "ligação pelo anúncio" contam certo: 1 por clique, janela de 90 e 30 dias, atribuição por dados;
  - outras 6 marcadas como principais são de campanha inteligente antiga e não registram nada.

## 5. Estrutura das campanhas

- **LEADS** (maximizar conversões, CPA alvo de R$ 42, presença na região): 3 grupos.
  - "BMH" vai para a página inicial.
  - "Institucional + Concorrentes" e "TESTE DE PALAVRAS" vão para a `/lp/`.
  - Os temas estão misturados no mesmo grupo: marca, concorrente e genérico.
- **TRÁFEGO** (parcela de impressões: 80% no topo da página, com teto de lance), **R$ 24 por contato**, a mais barata.
  Segmenta por **"presença ou interesse"**, ou seja, mostra o anúncio também para quem só pesquisa sobre Brasília de
  fora. Trocar para "presença".
- **"Avaliação 925" e "Avaliação 469":** testes encerrados que ainda dividem o orçamento com a LEADS. Arquivar.
- **Recomendações do Google ignoradas de propósito:** Performance Max (não serve para clínica com política de saúde e
  sem conversão de paciente) e aumento de orçamento.

## 6. Plano, em ordem (cada item com o seu "pode")

1. **Agência:** você define a data de saída e tira o acesso dela.
2. **Teto:** orçamento total de R$ 118/dia (R$ 86 + R$ 32), ou R$ 83/dia até 31/10 para fechar o mês no teto.
3. **Faxina:**
   - conversões principais só WhatsApp e ligação;
   - arquivar as "Avaliação";
   - TRÁFEGO por "presença".
4. **Textos novos** (já aprovados), ao lado dos antigos por 2 semanas.
5. **Extensões:**
   - links laterais para pós-operatório, Asa Sul, Taguatinga, perguntas e convênios;
   - frases de destaque com fatos ("Médico em todas as sessões", "Desde 2004", "50 convênios", "Aberto todos os dias");
   - ligar o Perfil do Google ao Ads.
6. **Concorrentes em campanha própria** (sua ideia, como na Nexo): R$ 10/dia, só os nomes dos concorrentes, que saem
   das outras campanhas. Em 4 semanas, o painel mostra o custo por contato dali.
7. **Grupos por tema**, cada um com a sua página:
   - pós-operatório → página nova;
   - Taguatinga e Asa Sul → páginas das unidades;
   - convênio e preço → perguntas;
   - marca → início.
8. **Teste `/lp/` × pós-operatório** (experimento do Google Ads, 50/50, 2 a 4 semanas).
9. **iGut no n8n → conversão "atendido" no Google:** o passo que mais muda o resultado no médio prazo.
