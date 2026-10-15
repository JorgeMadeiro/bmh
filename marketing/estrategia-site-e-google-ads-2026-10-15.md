# Estratégia do site e do Google Ads da BMH (15/10/2026)

Base: auditoria de SEO e GEO (`marketing/seo/auditoria-seo-geo-2026-10-15.md`), conta do Bruno
(`marketing/campanhas/conta-do-bruno-bmh-2026-10-15.md`), medição da reorganização (1ª semana) e leitura do Tag Manager,
do Analytics e do Google Ads feita hoje. Nada aqui foi aplicado, exceto o que está marcado como **feito**.

## 1. As regras que valem para tudo

1. **Medição antes de verba.** A verba não sobe enquanto a estratégia não estiver consolidada e o CRM não medir o
   agendamento (meta: novembro/2026).
2. **CAC de até R$ 200 por paciente novo** (decisão do Jorge). Hoje o contato custa R$ 19,50: o anúncio fecha a conta se
   1 em cada 10 contatos virar paciente novo.
3. **Nunca alarme falso.** Todo aviso compara com base recente e real e só alarma queda confirmada.
4. **Toda mudança de página passa pela conferência da seção 2** (Tag Manager, Analytics, Clarity, Google Ads, UTM, painel,
   Google e Bing) antes de ser dada como pronta.
5. **Até 05/11 não se mexe na estrutura da campanha medida** (grupos, palavras ativas, anúncios, lances). Pode o que não
   muda o tráfego medido: extensões, negativas óbvias e limpeza de palavra que não roda.
6. **Ordem:** Google e site 100% antes da Meta.

## 2. O que depende de cada página (mapa) e a conferência depois de mexer

### O que está ligado ao site hoje

| Peça | O que é | Do que depende na página | O que quebra se mudar sem cuidado |
|---|---|---|---|
| Tag Manager `GTM-PQZ32BC5` | único código no HTML; carrega todo o resto | o código no `<head>` das páginas | sem ele, nada é medido |
| Conversão do Google Ads "[Contato] Whatsapp link" | é o "contato" da campanha (33 dos 34 da 1ª semana) | todo link para `wa.me/` ou `api.whatsapp.com` | trocar o formato do link (botão de formulário, outro domínio) zera a conversão |
| Conversão "Calls from ads" | ligação pelo anúncio | extensão de chamada no Google | nada no site |
| Analytics da BMH `G-10HHN3PQP0` (propriedade 418169293) | eventos `clique_whatsapp`, `clique_telefone`, `clique_como_chegar` | links `wa.me`, `tel:` e de mapa | ver as 3 linhas abaixo |
| Variável "Caso do botão" | diz de qual caso veio o WhatsApp | **o texto da mensagem pronta** (`text=`): "pós-operatório", "ferida", "pedido médico", "mergulhador", "encaminhar um paciente", "unidade asa sul", "unidade taguatinga", "convênio", "dúvida" | mudar a mensagem pronta muda o caso (vira "geral") |
| Variável "Local do botão" | diz em que parte da página foi o clique | classes `bmh-fix`, `bmh-tri`, `bmh-head`, `bmh-hero`, `bmh-foot`, `bmh-final` e o `id` das seções | renomear classe ou id faz o clique virar "secao" ou "pagina-antiga" |
| Gatilho "Clique em como chegar" | conta pedido de rota | **qualquer link** com `google.com/maps`, `goo.gl/maps`, Waze, Uber | um link para o Maps que não seja rota vira rota falsa (aconteceu em 14/10, corrigido em 15/10) |
| Variável "Unidade (como chegar)" | separa a rota por unidade | "taguatinga" ou "-48.06" no link (Taguatinga); "sgas", "asa" ou "-47.9" (Asa Sul) | link de rota sem isso vira "indefinida" |
| Clarity da BMH `yv1gceupsa` | gravação e mapa de calor | todas as páginas (o projeto antigo da agência está pausado) | nada |
| Analytics da agência `G-97ZBVMVR1Y` | carregado **2 vezes** + um evento com o nome igual ao endereço da página (lixo) | todas as páginas | pesa na velocidade (0,5 s); sai com a Triunfo |
| Pixel da Meta `1526867428059043` | visita de página para a Meta | todas as páginas | fica para a fase da Meta |
| Google Ads, marcação automática (`gclid`) | liga o clique do anúncio ao contato | **o endereço chega intacto** | redirecionamento que apaga o `?gclid=` (achado de hoje, seção 3, item 0.2) |
| UTMs do Perfil do Google | separam quem veio de cada perfil | `/hiperbarica-asa-sul/` e `/hiperbarica-taguatinga/` respondendo 200, sem redirecionar | mudar o endereço da página da unidade |
| Painel da BMH e medição de quinta | leem Analytics (página de entrada, link clicado) e Search Console | endereço das páginas e os eventos acima | trocar endereço sem avisar o painel |
| Snippet "nota do Google" | nota e total na home | shortcode `[bmh_nota_google]` | apagar o shortcode volta ao valor fixo |
| `llms.txt`, dados estruturados, mapa do site, Bing | o que IA e buscador leem | endereço, nome, telefone e páginas | dado divergente entre site, perfil e diretórios |

### A conferência depois de cada mudança (checklist)

Proposta: virar um script (`scripts/conferir-pagina.js`) que abre a página como um visitante de celular, clica em cada
botão e lê o que sai para o Google, o Analytics e o Clarity. Até lá, manual:

1. Página responde 200, sem redirecionar; título, descrição, H1, canonical e "indexável" certos.
2. No celular (390 px): sem rolagem lateral, título e WhatsApp na primeira tela, foto sem paciente.
3. Cada botão de WhatsApp: abre `wa.me/556133466005` com a mensagem pronta do caso certo; dispara `clique_whatsapp` com
   `caso` e `local_do_botao` certos; dispara a conversão do Google Ads.
4. Telefone (`tel:`) dispara `clique_telefone`; "Como chegar" dispara `clique_como_chegar` com a unidade certa; **nenhum
   outro link** dispara rota.
5. Entrar com `?gclid=TESTE&utm_source=teste`: o endereço chega intacto e o cookie do Google Ads é gravado.
6. Clarity e Analytics registram a visita.
7. Dados estruturados válidos; mapa do site atualizado; página nova enviada ao Bing e pedida no Search Console.
8. Links internos e extensões do anúncio que apontam para ela continuam certos.
9. No dia seguinte: o painel mostra a página e os cliques.

## 3. Site: plano em fases

### Fase 0: medição confiável (esta semana)

| # | O quê | Por quê | Situação |
|---|---|---|---|
| 0.1 | Link da nota do Google nos cartões das unidades deixou de apontar para o Maps (agora vai para as avaliações) | contava como rota falsa | **feito em 15/10**; o Jorge confere tocando no link no celular |
| 0.2 | **Redirecionamentos guardarem o `?gclid` e as UTMs** (código "BMH · proteção e redirecionamentos") | hoje `/tratamento/?gclid=…` vira `/` sem o código: o Google perde o contato vindo do link "Fisiologia do tratamento" | precisa do "pode" |
| 0.3 | Conversões antigas de campanha inteligente ("Local actions", "Store visits", "map directions") passarem a **secundárias** antes de ligar o endereço no anúncio | senão, ao vincular o Perfil, elas entram como "contato" e inflam o número | precisa do "pode" |
| 0.4 | Script de conferência da seção 2 | toda mudança conferida do mesmo jeito | posso fazer (não muda nada no ar) |
| 0.5 | Tirar o Analytics da agência e o evento-lixo do Tag Manager | 0,5 s de velocidade e dados duplicados | quando a Triunfo sair (o "ainda não" de 07/10 vale até lá) |

### Fase 1: o que já traz ligação (semanas 1 e 2)

1. **Endereço de Taguatinga igual em todo lugar** (site, rodapé, dados estruturados, `llms.txt`): "Prédio Prime Excelência
   Médica, Torre D, Loja 2, 3 e 4, Setor C Norte, Taguatinga, CEP 72115-700". Depende da confirmação do Jorge.
2. **Perfis do Google:** descrição nova nas duas unidades (pós-operatório, feridas, mergulho, médico em todas as sessões,
   nome certo da SBMH), serviços cadastrados em Taguatinga dentro da lista do CFM, serviços reais na Asa Sul. Texto pela
   `revisar-texto`; envio só com "pode".
3. **Índice:** o Jorge pede indexação das 5 páginas novas no Search Console (eu guio); reenvio ao Bing com conferência no
   dia seguinte.
4. **Convênios refeita no mesmo endereço** (`/convenios/`, nativa): os 50 nomes em texto com busca, "não atendemos Unimed",
   o que o plano costuma pedir, se vale nas duas unidades, WhatsApp com a mensagem de convênio (mantém o caso
   "convenio"). Endereço igual: o link do anúncio e o do `llms.txt` continuam valendo.
5. **`/lp/` fora do Google** (noindex) e fim do menu escondido do tema que liga "Landing Page" em todas as páginas. O
   endereço continua respondendo (ainda recebe visita do Instagram e do Facebook: 5 e 4 desde 15/09); não redirecionar
   até a fase da Meta.

### Fase 2: conteúdo que o paciente e a IA procuram (semanas 2 e 3)

6. **Páginas das unidades com 900+ palavras daquele lugar:** como chegar, estacionamento, que câmara tem ali, responsável
   técnico, bairros perto, perguntas da unidade, foto real sem paciente. Fatos vêm do Jorge.
7. **"Revisado por Dr. Jorge Madeiro, CRM-DF 31687, RQE 26863, em DD/MM/2026"** e referências visíveis (Resolução CFM
   1.457/1995, diretriz da SBMH, UHMS) nas perguntas frequentes e no pós-operatório. Nenhum número novo sem o Jorge.
8. **Página de feridas** (`/feridas-que-nao-cicatrizam/` ou parecido): indicação dentro da lista do CFM, evidência pela
   `evidencia-clinica`, WhatsApp com a mensagem de ferida. Serve ao grupo "Feridas" do anúncio, que hoje cai na home.
9. **Dados estruturados:** coordenadas das unidades, CEP de Taguatinga, `sameAs` (perfis do Google, Facebook, SBMH), nome
   igual ao do perfil, texto alternativo nas fotos dos diretores.
10. **Página da equipe médica** (recebe as buscas pelo nome dos diretores).

### Fase 3: presença fora do site (semanas 3 e 4)

11. Diretório da SBMH com Taguatinga e o endereço da Asa Sul certo (é a fonte de 10 das 25 respostas do ChatGPT).
12. Doctoralia (clínica e diretores, sem preço), Bing Places, Apple Business Connect, OpenStreetMap: mesmo nome, endereço
    e telefone.
13. Perfis do Google: fotos reais sem paciente e uma postagem por semana ligada às páginas.
14. **Pedido de avaliação no fim do tratamento**, pelo WhatsApp da recepção, com o link de cada unidade (hoje entram 7 por
    trimestre).
15. Recheque do GEO em 29/10 (mesmas 25 perguntas).

## 4. Google Ads

### Onde estamos (09 a 14/10, 1ª semana da reorganização)

- Custo por contato R$ 19,50 (antes R$ 42), clique R$ 6,09 (antes R$ 11,33), 34 contatos. Contato = toque no WhatsApp
  (33) ou ligação (1): **conferido, não há conversão-lixo somando.**
- Procura no DF pequena: ~1.500 buscas/mês no tema, concentradas em "hiperbárica" (720), "oxigenoterapia" (390, que
  mistura oxigênio domiciliar), "câmaras hiperbáricas" (320) e "oxigenoterapia hiperbárica" (140).
- Nota de qualidade baixa nas genéricas (3 a 5) por um motivo só: **CTR esperado abaixo da média**. Anúncio e página
  estão na média ou acima. Nas buscas de unidade e de Brasília, nota 7 a 10.
- Perde 18% das exibições por verba e 20% por posição. Gasto à toa pequeno: R$ 45 em 6 dias em termos sem contato.
- Extensões da conta: 3 links ("Agende sua consulta!" vai para **outro WhatsApp, 61 98345-2021**, que o site não usa e o
  Google não conta; "Fisiologia do tratamento" vai para `/tratamento/`, que redireciona e perde o código do anúncio;
  "Convênios médicos" vai para a `/convenios/` antiga), 2 frases ("Oxigênio, Inovação, Vida!", "Líder em OHB"), 1 lista e 1
  imagem. Sem ligação e sem endereço.

### Até 05/11 (não mexe no que está sendo medido)

1. **Extensões, o que mais sobe o CTR esperado:**
   - links novos e diretos (sem redirecionar): Pós-operatório, Convênios (depois da página nova), Asa Sul, Taguatinga,
     Perguntas frequentes; o link de WhatsApp sai (o anúncio já leva ao WhatsApp pela página, onde é medido);
   - frases de destaque com fatos: "Médico em todas as sessões", "Desde 2004", "Asa Sul e Taguatinga", "50 convênios",
     "Todos os dias, 7h às 19h";
   - ligação (61) 3346-6005;
   - endereço das duas unidades pelo Perfil do Google (mostra distância e nota no celular), **depois do item 0.3**;
   - imagens: fotos sem paciente.
2. **Negativas** para quem não é paciente: outras cidades ("bh", "belo horizonte" e capitais), estética ("rejuvenesce",
   "rejuvenescimento", "estética"), curso e trabalho ("curso", "enfermagem", "emprego"), oxigênio em casa ("domiciliar",
   "concentrador", "cateter", "cânula", "cilindro", "aluguel").
3. **Tirar 14 palavras que não rodam** ("pouca busca", zero exibição): câmara hiperbárica asa sul (2), l2 sul, plano
   piloto (2), clínica hiperbárica taguatinga, oxigenoterapia taguatinga, samambaia, ceilândia, águas claras,
   oxigenoterapia pós-operatório, lipoaspiração, mamoplastia, câmara hiperbárica pós cirurgia, úlcera.
4. **Concorrentes:** segue até ~30 cliques ou 05/11 (régua do Bruno; o guardião não propõe mais pausa antes disso).
5. Medição de quinta continua, com a régua do orgânico corrigida.

### Revisão de 05/11 (muda a estrutura; leitura 7 dias depois no Telegram)

6. **Feridas** passa a levar para a página de feridas; **Valor e convênio** separa: "convênio/plano" vai para a
   `/convenios/` nova, "valor/preço" fica nas perguntas frequentes.
7. **Anúncios novos para subir o CTR** (regra: pausar e criar): primeiro título igual à busca ("Câmara Hiperbárica em
   Brasília", "Hiperbárica em Taguatinga"), fatos nos outros títulos, sem preço e sem promessa.
8. **"oxigenoterapia" sozinha:** fica só com as negativas de oxigênio domiciliar; se o CTR seguir baixo, sai.
9. **Concorrentes:** decide pelo número (contatos; agendamento quando o CRM medir).
10. **Triunfo sai:** retirar o acesso dela à conta depois da revisão, guardando o histórico; os experimentos encerrados
    e as campanhas pausadas antigas ficam como estão (não gastam).

### Novembro (com o CRM)

11. **Agendamento como conversão** (do CRM para o Google), e a campanha passa a otimizar por agendamento.
12. **CAC por campanha e por grupo** contra a meta de R$ 200 por paciente novo.
13. **Verba:** só se o CAC fechar e a perda por verba seguir acima de 10%; subir no máximo 20% por dia.

## 5. Decisões do Jorge

| # | Decisão | Recomendação |
|---|---|---|
| 1 | Confirmar o endereço de Taguatinga (Loja 2, 3 e 4; CEP 72115-700) | confirmar |
| 2 | Os 50 convênios valem nas duas unidades? | informar |
| 3 | De quem é o WhatsApp 61 98345-2021 do link do anúncio? | tirar o link e usar o número do site |
| 4 | "Pode" para a fase 0 (itens 0.2 e 0.3) | sim: é medição |
| 5 | "Pode" para as extensões, negativas e limpeza do Google (itens 1 a 3 de "até 05/11") | sim: não mexe no que é medido |
| 6 | "Pode" para a fase 1 do site (itens 1, 4 e 5) e texto dos perfis (item 2) | sim, em ordem |
| 7 | Salvar no CLAUDE.md a regra "toda mudança de página passa pela conferência da seção 2" | sim |
