# Site novo da BMH: o plano

> Escrito em 06/10/2026, na primeira sessão do projeto. É o plano, não o site: nada foi criado,
> enviado ou publicado, e nenhuma página do Elementor foi tocada.
>
> **Base:** o diagnóstico de hoje (`diagnostico-2026-10-06.md`), reconferido no ar no que este plano
> decide: as 10 páginas, o texto de cada uma, o contêiner público do Tag Manager, plugins, `robots.txt`,
> mapa do site, links de contato e o CNPJ. Achei **12 problemas que o diagnóstico não tinha** (seção 7).
> O método vem da Nexo (lido, nenhum texto copiado).
>
> **Como ler:** cada seção começa com a decisão em uma frase. As perguntas para você estão juntas
> numa lista só, na seção 8. Onde aparece `[F3]`, é o fato 3 da tabela da seção 1; `[P12]` é a pergunta 12 da seção 8.

---

## Resumo em dez linhas

1. **O que muda:** as 10 páginas do Elementor viram cerca de 20 páginas em bloco nativo do WordPress,
   escritas e versionadas aqui, enviadas pela API como **rascunho**, e só vão ao ar com a sua ordem.
2. **A tese do site:** a BMH atende em Brasília **desde novembro de 2004** (data de abertura do CNPJ,
   achada hoje). É fato que se confere, e é mais antigo que o "há 20 anos" do concorrente que mais
   disputa o título. "Pioneira" só entra se houver prova (pergunta P1).
3. **A página que mais importa** é a do pós-operatório de cirurgia plástica (~90% da demanda). Nenhum
   concorrente tem uma página assim feita com evidência.
4. **O segundo público** é o cirurgião que indica: ganha página própria, com o caminho da indicação.
5. **Duas unidades, duas de tudo:** página, perfil no Google, dados estruturados e mensagem de WhatsApp
   própria para Asa Sul e para Taguatinga.
6. **Medição:** o Tag Manager de hoje mede só o clique no WhatsApp para o Google Ads, e tem dois
   defeitos (seção 3). O novo mede WhatsApp, telefone, formulário e "como chegar", sabe a página e a
   unidade de cada conversa, e prepara o caminho até "agendou" e "fez a sessão".
7. **SEO e IAs:** título, descrição e H1 por página, dados estruturados de clínica e de médico,
   `llms.txt`, Bing, "revisado por" com CRM em todo texto de saúde.
8. **Fases:** acessos e medição primeiro (sem mudar nada que o público vê), depois visual, depois
   páginas, depois a troca, e **o Elementor só sai no fim**.
9. **Custo de ferramenta:** tudo o que o plano usa é gratuito (Search Console, GA4, Bing, Clarity,
   plugin de SEO na versão grátis). No fim, os plugins do Elementor saem (não há licença paga: conferido em 06/10/2026, o Elementor Pro não está instalado).
10. **O que destrava a fase 0:** a senha de aplicativo do WordPress no `.env` (pelo terminal) e saber
    de quem são as contas do Google, da Meta e do Clarity (P18 a P23).

---

## 1. Posicionamento e prova

**Decisão:** o site não diz "referência" nem "a melhor". Ele mostra os fatos que fazem o leitor
chegar a essa conclusão sozinho, e cada fato tem de onde veio.

### Por que fatos e não adjetivos

- **Regra do CFM:** a publicidade médica (Resolução CFM 2.336/2023, conferir a redação vigente) não
  aceita autopromoção sem base, superlativo e "o melhor". "Referência em Brasília", que está hoje na
  landing page, é exatamente isso. `⚠️ trava do CFM: autoelogio`.
- **Busca e IAs:** o Google trata saúde como tema de "sua vida" (YMYL) e pesa confiança: quem assina,
  CRM, endereço, data. As IAs citam frase com número e fonte, e descartam adjetivo.
- **Concorrência:** a Infinita diz "há 20 anos". Quem disputa com adjetivo empata. Quem mostra "desde
  2004, CNPJ 07.091.027/0001-86" ganha a discussão sem precisar dela.

### Os fatos, um por um

| # | Fato | De onde vem | Situação | Onde aparece no site |
|---|---|---|---|---|
| F1 | **Em atividade desde novembro de 2004** | CNPJ 07.091.027/0001-86, "Brasília Medicina Hiperbárica Ltda", abertura 02 ou 03/11/2004 (os dois cadastros públicos que li divergem em um dia), ativa, matriz na SGAS 613 | **achado hoje; confirmar a data no cartão CNPJ** | home, /sobre, rodapé, dados estruturados (`foundingDate`), `llms.txt` |
| F2 | **"Primeira clínica particular de medicina hiperbárica de Brasília"** | **o Jorge, 06/10/2026** ("somos realmente a primeira clínica particular de OHB em Brasília"); a entrada de Taguatinga já diz "Pioneiros em Medicina Hiperbárica no Distrito Federal"; CNPJ de 2004 | **confirmado.** Usar sempre com a palavra "particular" (protege a frase se houve câmara em hospital militar ou público antes). Guardar qualquer documento que prove (alvará, matéria, ofício) para o caso de alguém contestar | topo da home, faixa de provas, /sobre, perfis do Google, `llms.txt`, dados estruturados |
| F3 | **Responsáveis técnicos** | o Jorge, 06/10/2026 | **confirmado:** Dr. Hélio Ivan é RT da Asa Sul e Dr. Alberto Jorge é RT de Taguatinga. Falta o CRM dos dois | rodapé de toda página (uma linha por unidade), página de cada unidade, perfis do Google |
| F4 | CRM e RQE de cada médico | o Jorge, 06/10/2026 | **confirmado:** Dr. Jorge Madeiro CRM-DF 31687, RQE 26863 · Dr. Hélio Ivan CRM-DF 8164, RQE 26705 · Dr. Alberto Jorge CRM-DF 7248, RQE 14575. Decisão do Jorge (06/10/2026): mostrar só o número do RQE, sem a especialidade | rodapé, /equipe-medica, "revisado por", dados estruturados |
| F5 | Sua formação | `_memoria/empresa.md` | **decidido pelo Jorge (06/10/2026): no site, não citar UHMS.** Redação: "pós-graduação em medicina hiperbárica no Brasil e no exterior". Falta saber se "Mayo Clinic" sai (recomendo sair) | /equipe-medica, /sobre, /para-cirurgioes |
| F6 | Seu cargo na diretoria da sociedade, chapa 2026/27 | `_memoria/empresa.md` ("Sociedade Brasileira de Medicina Marítima e Hiperbárica") | **o nome oficial diverge**: o site diz "Sociedade Brasileira de Medicina Hiperbárica" e as páginas dos médicos dizem "Associação Brasileira de Medicina Hiperbárica". Qual é o nome certo e qual o cargo? | idem F5 |
| F7 | Formação do Dr. Hélio Ivan | site: UnB 1992; Marinha 2004; DAN 2005; pós-graduação Unimat 2014; membro desde 2004 | o Jorge confirmou (06/10/2026) que **os três diretores têm pós-graduação em medicina hiperbárica no Brasil**; confirmar o resto e se ele concorda com a página | /equipe-medica |
| F8 | Formação do Dr. Alberto Jorge | site: UFAL 1989; Marinha 2004; USP 2004; DAN 2005; UHMS capítulo brasileiro 2007; Unimat 2014 | o Jorge confirmou (06/10/2026) que **os três diretores têm pós-graduação em medicina hiperbárica no Brasil**; confirmar o resto; ele continua na equipe? | /equipe-medica |
| F9 | A clínica é associada / credenciada à sociedade | site: "qualificadas e associadas" | **existe certificado ou lista pública?** Se houver link da sociedade listando a BMH, é a melhor prova que existe | /sobre, rodapé |
| F10 | Duas unidades: Asa Sul e Taguatinga | site + CNPJ (1 filial registrada) | **endereço completo de Taguatinga** (número, sala, CEP) e se a filial do CNPJ é ela | páginas de unidade, perfis do Google, dados estruturados |
| F11 | Horário: domingo a domingo, 7h às 19h | site | vale para **as duas** unidades? Feriado? Os horários dos médicos nas páginas (Hélio 13h às 19h, Alberto 8h às 12h, seg. a sex.) ainda valem? | rodapé, unidades, perfis do Google |
| F12 | Câmaras: monoplace e multiplace | página "tratamento" | **quantas e de que tipo em cada unidade?** Fabricante, ano, capacidade. Taguatinga tem multiplace? | /sobre, unidades, /oxigenoterapia-hiperbarica |
| F13 | "Câmaras certificadas pela Anvisa" | site | qual registro (número do registro do equipamento na Anvisa)? Sem número, a frase sai | /sobre |
| F14 | **Médico presente na unidade em todas as sessões de OHB** | o Jorge, 06/10/2026 ("o médico presente in loco sempre que tem sessão de OHB, o que não acontece em alguns concorrentes") | **confirmado.** Diferencial de segurança número 1. No site, dito como fato da BMH, **sem comparar com concorrente** (a regra de publicidade médica não aceita comparação nem desmerecer colega) | topo da home (faixa de provas), pós-operatório, mergulho, unidades, /para-cirurgioes, dados estruturados |
| F15 | Avaliação de mergulhadores e acidente de mergulho | o Jorge, 06/10/2026 | **confirmado: não existe plantão.** O atendimento de acidente é no horário da clínica (7h às 19h); o site nunca promete pronto atendimento | /mergulho, faixa de mergulho da home ("Ligue, das 7h às 19h") |
| F16 | **50 convênios** | os 50 logotipos da página atual, transcritos em 06/10/2026 para `_memoria/convenios.md`; o Jorge confirmou que é a lista atual | **confirmado.** Unimed **não** está na lista. Falta saber se todos valem nas duas unidades | faixa de provas do topo ("50 convênios atendidos"), busca de convênio, /convenios-e-reembolso |
| F17 | Número de pacientes ou de sessões feitas desde 2004 | não existe hoje | **opcional**: se o sistema da clínica der esse número, é a prova mais forte de experiência que um concorrente não tem como copiar | home, /sobre |
| F18 | Nota e número de avaliações no Google, por unidade | não vi daqui (o Google não mostra para busca feita fora do Brasil) | conferir no Perfil da Empresa | home, unidades (só com o seu ok, regra da `/revisar-texto`) |

**Como isso fica na página (exemplo de forma, não é o texto final):** uma faixa de provas logo abaixo
do título da home, com quatro números ou fatos curtos, cada um com a fonte por trás no `fontes.md`:
"Desde 2004 em Brasília" · "Duas unidades: Asa Sul e Taguatinga" · "Equipe médica com formação em
medicina hiperbárica [F5 a F8]" · "Todos os dias, 7h às 19h [F11]".

---

## 2. Arquitetura do site novo

**Decisão:** uma página para cada pergunta que o paciente ou o cirurgião faz ao Google. Página só nasce
quando tem conteúdo próprio (lição da Nexo: catorze páginas rasas brigam entre si e nenhuma aparece).

### Mapa de páginas

| Página (endereço proposto) | Substitui | Para quem | Objetivo | Busca que quer ganhar | Ação principal |
|---|---|---|---|---|---|
| `/` home | home (36) | paciente | dizer em 5 segundos o que é, onde fica e por que confiar; levar para a indicação ou para a unidade | "câmara hiperbárica brasília", "medicina hiperbárica brasília", "oxigenoterapia hiperbárica df", a marca | WhatsApp |
| `/pos-operatorio-cirurgia-plastica` **(a primeira a ser escrita)** | nada (hoje é uma palavra na landing page) | paciente operado e família | explicar quando a oxigenoterapia hiperbárica entra no pós-operatório (sofrimento de retalho, isquemia, infecção, deiscência), como é o encaminhamento, quantas sessões costumam ser avaliadas, o que **não** é | "câmara hiperbárica pós-operatório", "hiperbárica abdominoplastia", "hiperbárica mamoplastia / mastopexia necrose", "hiperbárica lipoaspiração brasília", "necrose pós cirurgia plástica tratamento" | WhatsApp |
| `/para-cirurgioes` | nada | cirurgião plástico (e vascular, ortopedista, dermatologista) | como indicar, quais casos a BMH recebe, o que o cirurgião recebe de volta (avaliação, relatório, contato direto com o médico), logística, unidades | "encaminhar paciente câmara hiperbárica brasília", "oxigenoterapia hiperbárica retalho comprometido", e a própria marca (o cirurgião pesquisa antes de indicar) | WhatsApp com mensagem de cirurgião (ou contato direto do médico, [P14]) |
| `/unidade-asa-sul` | parte de "contato" | paciente | endereço, como chegar, estacionamento, horário, mapa, fotos reais, câmaras da unidade | "câmara hiperbárica asa sul", "hiperbárica L2 sul", "hiperbárica plano piloto" | WhatsApp da unidade · como chegar |
| `/unidade-taguatinga` | parte de "contato" | paciente | idem | "câmara hiperbárica taguatinga", "hiperbárica águas claras / ceilândia / samambaia" | WhatsApp da unidade · como chegar |
| `/oxigenoterapia-hiperbarica` | tratamento (19) | paciente | a página pilar: o que é, mecanismo em linguagem simples, como é a sessão, segurança, contraindicações, quem indica | "o que é oxigenoterapia hiperbárica", "como funciona câmara hiperbárica", "sessão de câmara hiperbárica" | WhatsApp |
| `/feridas-de-dificil-cicatrizacao` | parte da landing page | paciente, família, cuidador | ferida que não fecha, pé diabético, lesão arterial; o papel da hiperbárica como complemento | "câmara hiperbárica pé diabético brasília", "ferida que não cicatriza tratamento brasília" | WhatsApp |
| `/mergulho` | "Pronto Socorro p/ Mergulho" | mergulhador, instrutor, escola de mergulho | acidente descompressivo (o que fazer, quando procurar) e avaliação de aptidão ao mergulho (consulta) | "doença descompressiva brasília", "avaliação médica para mergulho brasília", "atestado mergulho brasília" | telefone (urgência) · WhatsApp (consulta) |
| demais indicações aceitas, **uma por vez** | parte da landing page | paciente | lesão por radiação (radionecrose, cistite e proctite actínica), infecção grave de pele e músculo, osteomielite, queimadura, intoxicação por monóxido de carbono, surdez súbita | uma busca por indicação, sempre com "brasília" | WhatsApp |
| `/equipe-medica` (uma página só) | medicos (21), helio-ivan (281), alberto-jorge (291) | paciente e cirurgião | **como o cuidado médico funciona** (decisão de 06/10/2026): médico plantonista em todas as sessões, e a direção médica (Dr. Jorge, Dr. Hélio, Dr. Alberto) com CRM e formação, responsável pelos protocolos e pelo contato com o cirurgião. Sem galeria de retratos que sugira "você será atendido por eles" | "médico câmara hiperbárica brasília", nome de cada diretor + "hiperbárica" | WhatsApp |
| `/convenios-e-reembolso` | convenios (25) | paciente | lista **em texto** dos convênios, o que o convênio costuma pedir (pedido médico, relatório), como funciona o reembolso de quem é particular | "câmara hiperbárica convênio [nome do plano]", "câmara hiperbárica plano de saúde cobre", "reembolso câmara hiperbárica" | WhatsApp |
| `/perguntas-frequentes` | perguntas-frequentes (23) | paciente | as dúvidas reais, respondidas curtas, com link para a página que aprofunda | perguntas inteiras ("dói?", "tem claustrofobia?", "pode dirigir depois?") | WhatsApp |
| `/sobre` | institucional (17) | paciente e cirurgião | história desde 2004, estrutura, câmaras, segurança, equipe, sociedades | a marca, "clínica hiperbárica brasília" | WhatsApp |
| `/guia` (**Guia do paciente**, no lugar do blog; decisão de 06/10/2026) | não existe | paciente e cirurgião | respostas que não envelhecem às dúvidas reais, cada uma com "revisado por" e data; **sem calendário nem "último post"**, fora do menu principal, ligado de dentro das páginas de indicação e do rodapé | as perguntas longas (seção 5) | link para a página da indicação |
| `/contato` (curta) | contato (27) | quem já decidiu | telefone, WhatsApp, e-mail, as duas unidades | navegacional | WhatsApp |
| `/politica-de-privacidade` | não existe | todos | LGPD e o que a medição coleta (pré-requisito da medição) | nenhuma | nenhuma |
| `/lp/<campanha>` | lp (925) | quem clicou num anúncio | uma oferta, um botão, sem menu, **fora do Google** (`noindex`) | nenhuma (é do anúncio) | WhatsApp |

**Menu enxuto:** Pós-operatório · Tratamentos · Unidades · Para cirurgiões · Médicos · Convênios ·
botão "Agendar pelo WhatsApp". Guia do paciente, equipe médica, perguntas frequentes e sobre ficam no rodapé e no menu do celular
(na Nexo, menu com 7 itens derrubou o botão do WhatsApp para uma segunda linha).

**A landing page atual (`/lp`):** fica no ar, intocada, até sabermos se algum anúncio aponta para ela
[P24]. Na troca, vira `/lp/<campanha>` com `noindex`, ou recebe redirecionamento para a página da
indicação.

### O molde de cada página de indicação

É o que funcionou na Nexo, adaptado para clínica de hiperbárica:

1. A situação nas palavras do paciente (ou do cirurgião, na página dele)
2. Por que o oxigênio sob pressão ajuda nesse caso, em linguagem simples, **com fonte** (`/evidencia-clinica`)
3. Como é na BMH: avaliação médica, número de sessões **avaliado caso a caso**, duração, unidade
4. O que **não** é: não substitui o cirurgião nem o curativo, não é estético, não há garantia de resultado
5. Perguntas frequentes daquela indicação (4 a 6), visíveis na página (é a seção que as IAs citam)
6. "Revisado por Dr. [nome], CRM-DF [número], em [data]"
7. Um botão só: WhatsApp com a mensagem daquela página

### Endereços antigos → novos (redirecionamento permanente, 301)

| Antigo | Novo | Observação |
|---|---|---|
| `/` | `/` | a home troca por último |
| `/institucional/` | `/sobre/` | |
| `/tratamento/` | `/oxigenoterapia-hiperbarica/` | |
| `/medicos/` | `/equipe-medica/` | |
| `/helio-ivan/` | `/equipe-medica/` | |
| `/alberto-jorge/` | `/equipe-medica/` | |
| `/perguntas-frequentes/` | `/perguntas-frequentes/` | mesmo endereço |
| `/convenios/` | `/convenios-e-reembolso/` | |
| `/contato/` | `/contato/` | mesmo endereço |
| `/lp/` | decidir [P24] | |
| `/author/jorgemadeirotorres/`, `/author/ringlesias/` | sair do mapa do site | expõem o login de quem tem acesso ao painel (seção 7) |

**Custo e benefício de trocar endereço:** o site atual quase não tem visitas vindas de busca (nenhuma
página dele aparecia nas buscas testadas no diagnóstico), então quase não há o que perder. Antes de
fechar a tabela, confiro no Search Console quais endereços têm cliques; se algum tiver, ele fica igual.

### Como o site converte (pedido do Jorge, 06/10/2026: "tem que ser um site que converte")

**Decisão:** a régua de sucesso do site é **conversa iniciada no WhatsApp ou ligação, por visita**, e depois
**avaliação agendada**. Bonito e bem ranqueado só vale se virar isso. Cada mecanismo abaixo responde a um motivo
concreto para a pessoa não chamar.

| Motivo para não chamar | Mecanismo no site | Onde |
|---|---|---|
| "Não sei se é para o meu caso" | **Triagem de um toque** ("Qual é o seu caso?": pós-operatório, ferida, pedido médico, sou médico), cada botão abre o WhatsApp com a mensagem daquele caso | topo da home, na primeira tela do celular |
| "Será que o meu plano cobre?" | **Busca de convênio**: a pessoa digita o plano; achou → botão de agendar; não achou → "pergunte à recepção" (nunca um beco sem saída) | home e `/convenios-e-reembolso` |
| "O que acontece se eu chamar?" | **Os 4 passos depois do clique** (conta o caso, confere o convênio, marca a avaliação, começa) | home e páginas de indicação |
| "Não quero escrever agora" | **"Prefere que a BMH chame você?"**: nome e celular, a recepção chama. Na Nexo, a versão para quem volta do WhatsApp sem mandar mensagem foi ao ar em 29/09/2026 | home e no retorno do WhatsApp |
| "Prefiro falar" | botão de **ligar** ao lado do WhatsApp, inclusive na barra fixa do celular | barra fixa, topo |
| "É confiável?" | prova ao lado do botão: **médico presente em todas as sessões**, desde 2004, CRM, formação, foto real, duas unidades | topo, equipe, rodapé |
| "É longe?" | unidades com "agendar nesta unidade" e "como chegar" | home e páginas de unidade |
| Rolou a página e o botão sumiu | **barra fixa** no celular (WhatsApp + ligar) e botão repetido no fim de cada seção de decisão | todas |

**Regras de conversão em toda página:**
1. O botão principal aparece **na primeira tela do celular** (360 a 390 px), sem rolar.
2. Uma ação principal por página (WhatsApp); ligar é a alternativa, nunca um terceiro e quarto caminho.
3. O texto do botão diz o que acontece ("Agendar pelo WhatsApp", "Falar sobre o meu pós-operatório"), nunca "Saiba mais".
4. Abaixo do botão, uma linha que tira o medo do clique (quem responde e quando).
5. Toda página passa pela nota de página (`site/referencias/nota-de-pagina-e-formulario.md`) e só vai ao ar com **85 ou mais**.
6. **Velocidade é conversão:** a meta de 2,5 s no celular (seção 4) é parte disto, não detalhe técnico.

**O que fica de fora, por regra do CFM (decisão sua, com aviso):** "avaliação gratuita" como chamariz (a Infinita
usa), preço no site, depoimento de paciente e antes e depois. Se quiser algum deles, eu entrego a versão com e sem.

**Como saber se está convertendo:** taxa de conversão por página (cliques no WhatsApp e no telefone ÷ visitas, no
GA4), por botão (qual da triagem é mais tocado) e, com a etiqueta da recepção, **avaliações agendadas por origem**.
O volume da BMH é baixo para teste A/B: a regra é mudar, medir duas semanas antes e duas depois, e comparar.

**Mensagens da triagem** (entram na tabela de mensagens da seção 3; rascunho, passam pela `/revisar-texto`):
"Olá! Estou no pós-operatório de cirurgia plástica e quero saber sobre a câmara hiperbárica." ·
"Olá! Tenho uma ferida que não cicatriza e quero agendar uma avaliação." ·
"Olá! Tenho um pedido médico de oxigenoterapia hiperbárica e quero agendar." ·
"Olá! Sou mergulhador e quero agendar uma avaliação." ·
"Olá! Sou médico(a) e quero encaminhar um paciente para a BMH."

---

## 3. Medição de ponta a ponta

**Decisão:** consertar e completar o Tag Manager que já existe (`GTM-PQZ32BC5`), no lugar de começar
outro. Toda mudança nele vira versão nova, testada antes e depois com o envio bloqueado (sem gerar
conversão falsa), e só é publicada com o seu "pode".

### O que existe hoje (li o contêiner público agora: versão 3)

| Peça | O que faz | Problema |
|---|---|---|
| Google Ads, conversão `AW-958567409` | conta 1 conversão quando alguém clica num link com `api.whatsapp.com` ou `wa.me/` | funciona, mas o Google Ads só sabe do clique, não de quem agendou. **De quem é essa conta?** [P18] |
| Vinculador de conversões do Google Ads | guarda o clique do anúncio | ok |
| Tag Google `GT-57SF42Z` | base do Google (provavelmente criada pelo Site Kit) | conferir de onde veio |
| GA4 `G-97ZBVMVR1Y` | Analytics | **configurado duas vezes** no mesmo carregamento: risco de contar cada visita em dobro. Conferir no relatório e deixar um |
| Evento do GA4 | dispara em toda página | **o nome do evento é o endereço da página** (`https://…`). O GA4 recusa nome com esses caracteres: é um evento quebrado, que não mede nada |
| Pixel da Meta `1526867428059043` | PageView em toda página | não mede o clique no WhatsApp. **De quem é?** [P20] |
| Microsoft Clarity, projeto `m9kxjnnvgm` | grava sessões e mapa de calor | **o diagnóstico não tinha visto.** De quem é o projeto? [P20] |
| Site Kit do Google (plugin) | liga o WordPress ao Search Console e ao Analytics | **com qual conta Google foi conectado?** É provável que o Search Console da BMH já exista por ele [P19] |

**O que não existe:** evento do GA4 para o clique no WhatsApp (o Analytics não sabe que alguém quis
agendar), clique no telefone, formulário (o MetForm está instalado, mas **nenhuma página tem formulário**),
clique em "como chegar" (Maps, Waze, Uber), mensagem pronta no WhatsApp, UTMs, e qualquer ligação entre
o clique e o agendamento.

### O que entra

**Eventos (mesmo nome no GA4, no Clarity e onde mais for):**

| Evento | Quando | O que leva junto | Conversão no Google Ads? |
|---|---|---|---|
| `clique_whatsapp` | toque em qualquer botão de WhatsApp | página, unidade (quando houver), local do botão (topo, meio, fim, barra fixa, cabeçalho, rodapé) | **sim, a principal** |
| `clique_telefone` | toque em `tel:` | página, unidade | sim (secundária no começo) |
| `envio_formulario` | só se um formulário existir [P15] | página, tipo (paciente ou cirurgião) | sim, se existir |
| `clique_como_chegar` | toque em Maps, Waze ou Uber | unidade, aplicativo | não (só Analytics: mostra intenção de ir) |
| `clique_email` | toque em `mailto:` | página | não |

Regra que veio cara na Nexo: **todo link de WhatsApp leva a mesma marca (classe)**, e o Tag Manager
reconhece o clique por ela. Antes de trocar cada página, um teste clica no botão no site real e confere
que sai exatamente 1 de cada (1 conversão do Google Ads, 1 evento do GA4), com o envio bloqueado.

**Mensagem pronta por página e por unidade** (é ela que conta, dentro do WhatsApp, de onde a pessoa veio):

| Onde a pessoa clicou | Mensagem que já vem escrita (rascunho; passa pela `/revisar-texto`) |
|---|---|
| home, sobre, contato, perguntas frequentes | "Olá! Vim pelo site da BMH e gostaria de agendar uma avaliação." |
| pós-operatório | "Olá! Vim pela página de pós-operatório do site da BMH e gostaria de agendar uma avaliação." |
| cada indicação | "Olá! Vim pela página de [feridas / mergulho / …] do site da BMH e gostaria de agendar uma avaliação." |
| unidade Asa Sul | "Olá! Vim pela página da unidade Asa Sul e gostaria de agendar." |
| unidade Taguatinga | "Olá! Vim pela página da unidade Taguatinga e gostaria de agendar." |
| para cirurgiões | "Olá! Sou cirurgião(ã) e gostaria de encaminhar um paciente para a BMH." |
| convênios | "Olá! Vim pela página de convênios do site da BMH e queria saber sobre o meu plano." |
| guia do paciente | "Olá! Vim pelo guia do paciente da BMH e gostaria de agendar uma avaliação." |

Como na Nexo, quem põe a mensagem é uma tag do Tag Manager, não a página: assim dá para mudar o texto
sem reenviar o site, e a mesma tag guarda as UTMs e o clique do anúncio da página de entrada. O botão
continua funcionando se o Tag Manager falhar (só sem a mensagem). **Se a pessoa apagar a mensagem, a
origem se perde:** é o limite do método e vale saber disso de saída.

**Um número, duas unidades.** Hoje o (61) 3346-6005 é o mesmo para telefone e WhatsApp nas duas
unidades. Com a mensagem pronta, a recepção sabe a unidade sem perguntar. Se Taguatinga tiver número
próprio [P12], cada unidade usa o seu e a medição fica ainda mais limpa.

### Padrão de UTMs (a etiqueta que diz de onde veio a visita)

Regra: tudo minúsculo, sem acento, palavras com hífen. Três campos sempre: `utm_source` (quem mandou),
`utm_medium` (por qual meio), `utm_campaign` (qual ação).

| Origem | Link | Observação |
|---|---|---|
| Bio do Instagram | `?utm_source=instagram&utm_medium=bio` | se a bio apontar direto para o WhatsApp, usar uma mensagem própria ("Oi, BMH! …") no lugar da UTM |
| Stories / post com link | `?utm_source=instagram&utm_medium=stories&utm_campaign=<tema>` | |
| Perfil do Google, Asa Sul | `?utm_source=google&utm_medium=perfil&utm_campaign=asa-sul` | apontando para `/unidade-asa-sul` |
| Perfil do Google, Taguatinga | `?utm_source=google&utm_medium=perfil&utm_campaign=taguatinga` | apontando para `/unidade-taguatinga` |
| Google Ads | marcação automática (`gclid`) ligada na conta, mais `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}` no modelo de rastreamento | |
| Anúncios da Meta | `utm_source=meta&utm_medium=anuncio&utm_campaign={{campaign.name}}&utm_content={{ad.id}}` | anúncio que abre o WhatsApp direto leva mensagem própria ("Olá, BMH! …") |
| Cirurgião parceiro | `?utm_source=cirurgiao&utm_medium=indicacao&utm_campaign=<codigo-do-cirurgiao>` | o código é uma sigla combinada (ex.: `dr-abc`), nunca o nome do paciente. Vai num cartão com QR que o cirurgião entrega, apontando para `/pos-operatorio-cirurgia-plastica` |
| QR na recepção | `?utm_source=qr&utm_medium=impresso&utm_campaign=recepcao-asa-sul` (ou `-taguatinga`) | para avaliação no Google e para o Guia do paciente, não para agendar (quem está na recepção já agendou) |
| Bing Places | `?utm_source=bing&utm_medium=perfil` | |
| Doctoralia e diretórios | `?utm_source=<diretorio>&utm_medium=perfil` | |

Os links prontos ficam numa planilha em `saidas/site-novo/utms.md`, para ninguém inventar etiqueta nova.

### Search Console, GA4, Bing Webmaster e Clarity

| Ferramenta | Hoje | O que fazer | Custo |
|---|---|---|---|
| **Search Console** | provável que exista pelo Site Kit; não sei de quem | você confirma a conta; eu passo a ler pela API (como na Nexo); cadastro o mapa do site novo na troca | grátis |
| **GA4** `G-97ZBVMVR1Y` | instalado (duas vezes) | um só; retenção de dados de 2 para **14 meses**; `clique_whatsapp` e `clique_telefone` como eventos principais; ligar ao Google Ads e ao Search Console | grátis |
| **Bing Webmaster** | não sei se existe; o Bing não mostrou nenhuma página da BMH | importar do Search Console, mandar o mapa do site, pedir leitura das páginas novas pela API. **É o índice que o ChatGPT e o Copilot consultam** | grátis |
| **Clarity** `m9kxjnnvgm` | instalado | descobrir o dono; se for da BMH, manter; se for de agência, criar um da BMH. **Mascaramento no modo estrito** (nada do que a pessoa digita é gravado, porque é clínica) | grátis |
| **Perfis do Google** | não conferi daqui | um por unidade (seção 4) | grátis |

### Até "agendou" e "fez a sessão"

O site sozinho só enxerga o clique. Daí em diante, a informação está no WhatsApp e na agenda da clínica.
O caminho tem quatro degraus:

1. **Clicou** (o site mede: evento, página, unidade, UTM, clique do anúncio).
2. **Conversou** (a mensagem pronta chega no WhatsApp e diz a página e a unidade).
3. **Agendou a avaliação** (está na agenda da clínica).
4. **Fez a sessão** (está no sistema de atendimento ou no faturamento).

As opções para ligar o degrau 2 aos degraus 3 e 4:

| Opção | Como funciona | Custo | Benefício | Limite |
|---|---|---|---|---|
| **A. Etiqueta na recepção** | a recepção marca a conversa com a origem (as etiquetas do WhatsApp Business) e, ao agendar, anota a origem num campo da agenda ou numa planilha | zero em dinheiro; 10 segundos por paciente | começa já; dá o número que importa ("quantos pacientes vieram do site, do Google, do cirurgião") | depende de disciplina; erra quando a recepção esquece |
| **B. Ligação automática** | um fluxo no n8n lê o WhatsApp (ou o CRM) e a agenda e cruza pelo telefone, como na Nexo | horas de montagem e um CRM ou acesso à API do WhatsApp; depende de qual agenda a BMH usa [P13] | sem esforço da equipe; custo por paciente atendido por canal | só depois que A mostrar que há volume para justificar |
| **C. Devolver ao Google e à Meta** | o "agendou" e o "fez a sessão" voltam para os anúncios (telefone criptografado), e o anúncio aprende a buscar quem vira paciente | precisa de B | anúncio mais barato por paciente | só faz sentido com tráfego pago no ar, e tem a regra da Meta sobre dado de saúde (abaixo) |

**Recomendação:** começar pela A na fase 1 (custa nada e já responde "o site traz paciente?") e só
montar a B quando houver anúncio no ar ou volume que justifique. O fluxo "Produção Diaria e Mensal BMH"
que já roda no n8n mostra que existe uma fonte de produção: me diga de que sistema ele lê [P13], porque
pode ser a ponte para o degrau 4.

**Cuidado com a Meta e dado de saúde:** a Meta restringe sites de saúde que mandam ao pixel informação
que revela condição (por exemplo, o endereço `/pos-operatorio-cirurgia-plastica` junto do evento). Para
a Meta, o plano manda só o genérico (visita e "Contact" no clique), sem nome de página ou indicação nos
parâmetros. Se a Meta classificar o domínio como saúde, algumas otimizações somem. Decisão sua [P25].

**Política de privacidade e LGPD:** a medição exige uma política publicada dizendo o que se coleta e
para quê. Ela entra na fase 1, antes de qualquer tag nova ir ao ar.

---

## 4. SEO técnico, on-page e local

**Decisão:** cada página com título, descrição e H1 próprios; um plugin de SEO que aceite esses campos
pela API (testar antes de instalar); dados estruturados escritos por nós, gerados a partir da própria
página; e nome, endereço e telefone escritos de um jeito só, em todo lugar.

### Título, descrição e H1 de cada página

Rascunho de trabalho: os textos finais passam pela `/revisar-texto` junto com a página. Título até
~60 caracteres; descrição até ~155; o H1 é o título que aparece na página.

| Página | Título (aba e Google) | Descrição | H1 |
|---|---|---|---|
| `/` | Câmara hiperbárica em Brasília · Asa Sul e Taguatinga · BMH | Oxigenoterapia hiperbárica com avaliação médica, em Brasília desde 2004 [F1]. Unidades na Asa Sul e em Taguatinga, todos os dias, das 7h às 19h [F11]. | Oxigenoterapia hiperbárica em Brasília, na Asa Sul e em Taguatinga |
| `/pos-operatorio-cirurgia-plastica` | Câmara hiperbárica no pós-operatório de cirurgia plástica · BMH | Quando a oxigenoterapia hiperbárica é indicada depois da cirurgia plástica, como é a avaliação e o encaminhamento. Asa Sul e Taguatinga. | Câmara hiperbárica no pós-operatório de cirurgia plástica |
| `/para-cirurgioes` | Para o cirurgião: como encaminhar à BMH · Brasília | Critérios de indicação, avaliação, relatório de evolução e contato direto com o médico. Unidades na Asa Sul e em Taguatinga. | Para o cirurgião que encaminha |
| `/unidade-asa-sul` | Câmara hiperbárica na Asa Sul (L2 Sul, SGAS 613) · BMH | Endereço, como chegar, estacionamento e horário da unidade Asa Sul. Agende pelo WhatsApp. | BMH Asa Sul |
| `/unidade-taguatinga` | Câmara hiperbárica em Taguatinga · BMH | Endereço, como chegar, estacionamento e horário da unidade Taguatinga. Agende pelo WhatsApp. | BMH Taguatinga |
| `/oxigenoterapia-hiperbarica` | Oxigenoterapia hiperbárica: o que é e como funciona · BMH | Como o oxigênio sob pressão age no corpo, como é uma sessão, quem pode fazer e o que precisa antes de começar. | Oxigenoterapia hiperbárica: o que é e como funciona a sessão |
| `/feridas-de-dificil-cicatrizacao` | Feridas que não cicatrizam e pé diabético: câmara hiperbárica · BMH | Quando a oxigenoterapia hiperbárica complementa o tratamento de feridas crônicas e do pé diabético. Avaliação em Brasília. | Feridas de difícil cicatrização e pé diabético |
| `/mergulho` | Medicina do mergulho em Brasília: acidente e avaliação · BMH | O que fazer diante de suspeita de doença descompressiva e como é a avaliação de aptidão para mergulho. | Medicina do mergulho: acidente descompressivo e aptidão |
| `/equipe-medica` | Equipe médica da BMH · médico em todas as sessões | Médico plantonista na unidade em todas as sessões e direção médica com CRM e formação em medicina hiperbárica. | Quem cuida de você |
| (sem páginas individuais de médico) | | | |
| `/convenios-e-reembolso` | Convênios e reembolso da câmara hiperbárica · BMH | Planos aceitos, o que o convênio costuma pedir e como funciona o reembolso para quem faz particular. | Convênios e reembolso |
| `/perguntas-frequentes` | Perguntas frequentes sobre câmara hiperbárica · BMH | Dói? Tem claustrofobia? Quantas sessões? Precisa de pedido médico? Respostas da equipe médica da BMH. | Perguntas frequentes |
| `/sobre` | Sobre a BMH · Brasília Medicina Hiperbárica, desde 2004 | Estrutura, câmaras, segurança e equipe das unidades Asa Sul e Taguatinga. | Brasília Medicina Hiperbárica |
| `/guia` | Guia do paciente · câmara hiperbárica explicada · BMH | Respostas da equipe médica da BMH às dúvidas reais sobre oxigenoterapia hiperbárica, com fonte e data de revisão. | Guia do paciente |

**Nome do site no WordPress:** hoje é "Brasilia Medicina Hiperbarica", sem acento, e é isso que aparece
na aba e no Google. Passa a "Brasília Medicina Hiperbárica (BMH)".

### Plugin de SEO

| Opção | Custo | Benefício | Risco |
|---|---|---|---|
| **SEOPress** (versão grátis) **(recomendado)** | grátis | aceita título e descrição pela API, junto com a página; foi o que ficou na Nexo depois de testado | nenhum relevante |
| Rank Math | grátis | conhecido | na Nexo não expôs os campos pela API: cada página teria de ser preenchida à mão |
| Yoast | grátis | conhecido | mesmo teste a fazer; mais pesado |

Antes de instalar, o teste da lição 1: os campos têm que aparecer em `/wp-json/wp/v2/pages/<id>?context=edit`.
**Dados estruturados não vêm do plugin**: são escritos por nós, mais completos.

### Dados estruturados (o "cartão de identidade" que o Google e as IAs leem)

| Tipo | Onde | O que leva |
|---|---|---|
| `MedicalOrganization` | todas as páginas (rodapé) | nome, logo, CNPJ, `foundingDate` 2004-11 [F1], site, telefone, redes (`sameAs`: Instagram, Facebook, perfis do Google), as duas unidades como `subOrganization` |
| `MedicalClinic` | uma por unidade (página da unidade e rodapé) | nome com a unidade, endereço completo com CEP, coordenada, telefone, horário, `medicalSpecialty`, `availableService` (as indicações tratadas), `hasMap`, `isAcceptingNewPatients` |
| `Physician` | `/equipe-medica` (a direção médica) | nome, CRM como `identifier`, formação (`alumniOf`), `memberOf` (sociedade [F6]), `worksFor`; os plantonistas só se forem nomeados [P29] |
| `MedicalWebPage` | páginas de indicação e o pilar | `about` (a condição), `reviewedBy` (o médico) e `lastReviewed` (a data) |
| `FAQPage` | toda página com perguntas | **gerado lendo as perguntas visíveis da própria página** (lição da Nexo: schema digitado à mão envelheceu e divergiu) |
| `BreadcrumbList` | todas | o caminho (Início › Tratamentos › Pós-operatório) |
| `Article` | respostas do Guia do paciente | autor, revisor (`reviewedBy`), data de revisão, fontes |

Tudo validado no Teste de Resultados Aprimorados do Google antes de publicar.

### Dois perfis da empresa no Google

- **Um perfil por unidade**, cada um com endereço, horário, fotos e link para a página da unidade (com
  UTM). Nunca um perfil só com os dois endereços.
- Categoria principal: conferir na hora as opções que o Google oferece em português (a mais próxima de
  medicina hiperbárica); secundárias só pelos serviços reais.
- Serviços preenchidos com as indicações aceitas; perguntas e respostas com as dúvidas reais; fotos
  reais de cada unidade (fachada, recepção, câmara, equipe com autorização). **Nunca paciente.**
- Avaliações: pedir é permitido (QR na recepção, mensagem depois da última sessão); responder todas com
  a `/responder-avaliacoes`.
- **Primeiro passo:** saber se os dois perfis existem, quem é o dono e se Taguatinga está verificada [P21].

### Nome, endereço e telefone: uma grafia só

Proposta (confirmar e então usar igual no site, nos perfis do Google, Bing Places, Apple, Instagram,
Facebook, Doctoralia e qualquer diretório):

```
BMH Brasília Medicina Hiperbárica · Asa Sul
SGAS 613, Conjunto E, Bloco A, 1º subsolo, sala 2A · Complexo Médico Hospitalar, L2 Sul
Asa Sul, Brasília/DF · CEP 70200-730
(61) 3346-6005

BMH Brasília Medicina Hiperbárica · Taguatinga
Prédio Prime Excelência Médica, Torre D, [sala], Setor C Norte
Taguatinga, Brasília/DF · CEP [F10]
[telefone, P8]
```

A sala 2A e o CEP da Asa Sul vêm do cadastro do CNPJ; o site hoje não os mostra.

### Velocidade no celular

- **Hoje:** a home carrega 25 arquivos de script, o Elementor e seis complementos (ElementsKit, Essential
  Addons, GUM, Stratum, MetForm, Envato), mais um mapa do Google embutido (pesado) e um widget do Instagram
  quebrado. A medição do PageSpeed recusou por cota hoje: a linha de base sai na fase 0, com o teste de
  celular adaptado da Nexo e o Lighthouse.
- **No site novo:** bloco nativo, sem construtor; fontes servidas pelo próprio site; foto em WebP com o
  tamanho certo para cada tela; mapa que só carrega quando a pessoa toca nele; nada de carrossel no topo.
- **Meta:** no celular, o maior elemento aparece em até 2,5 s, a página não "pula" (CLS abaixo de 0,1), e
  título e botão do WhatsApp aparecem **na primeira tela** de um Android de 360 px (na Nexo, em nenhuma
  página o botão aparecia antes disso).
- Hospedagem Hostinger com LiteSpeed Cache: fica. Depois de cada troca, conferir no ar (o cache segura
  versão antiga).

### Outros acertos técnicos

`lang="pt-BR"` (hoje o site se declara em inglês), tags de compartilhamento (imagem e título quando o
link é colado no WhatsApp), ícone do site, `robots.txt` com o mapa novo, mapa do site sem páginas de autor,
canonical certo, texto alternativo em toda imagem, uma só H1 por página.

---

## 5. GEO: aparecer nas respostas das IAs

**Decisão:** escrever para ser citado. A IA cita a frase que responde a pergunta inteira, com número e
fonte, numa página que diz quem revisou e quando.

1. **Resposta primeiro.** Cada página e cada artigo abre com 2 ou 3 frases que respondem a pergunta
   sozinhas ("A oxigenoterapia hiperbárica é…; na BMH, a sessão dura [X] e acontece na Asa Sul e em
   Taguatinga"). O detalhe vem depois.
2. **Pergunta como subtítulo.** "Quantas sessões são necessárias?", "Precisa de pedido médico?", "Dói?".
   As IAs recortam por subtítulo.
3. **Fato com fonte.** Toda frase de saúde tem linha no `fontes.md` da página (`/evidencia-clinica`), e as
   páginas citam a fonte quando ajuda ("segundo a lista de indicações da Undersea and Hyperbaric Medical
   Society…", "a Resolução CFM 1.457/1995 regulamenta…"). Fonte de verdade: diretriz (UHMS, ECHM, CFM),
   revisão sistemática, ensaio clínico. Blog de concorrente não é fonte.
4. **"Revisado por"** no fim das páginas de indicação e das respostas do Guia do paciente (na home, o Jorge pediu para tirar, 06/10/2026): nome, CRM e data. É sinal de confiança para o Google
   e para as IAs, e é exigência boa para clínica.
5. **`llms.txt`** na raiz do site: um resumo em texto simples do que é a BMH, as duas unidades com
   endereço e horário, as indicações tratadas, os médicos com CRM e os links das páginas principais. Hoje
   não existe (só a Rinnovare tem, entre os concorrentes). Custo: um arquivo, gerado daqui.
6. **Bing.** O ChatGPT e o Copilot buscam pelo índice do Bing. Na Nexo, o Bing **não tinha nenhuma página**
   até ser avisado. Aqui: Bing Webmaster, mapa do site, envio das páginas pela API a cada troca, e Bing
   Places importado do Google.
7. **Deixar os robôs das IAs lerem o site.** O `robots.txt` de hoje não bloqueia ninguém; manter assim e
   conferir que a proteção da Hostinger ("Checking your browser") não barra os robôs de busca das IAs
   (ela me barrou uma vez hoje). Decisão sua se algum robô fica de fora [P26].
8. **Menções fora do site:** perfis do Google completos, Doctoralia, a lista da sociedade de medicina
   hiperbárica [F9], Bing Places, Apple Business Connect. A IA confia mais no que vê repetido em fontes
   independentes.
9. **Medir todo mês:** as mesmas 10 perguntas no ChatGPT, Gemini, Perplexity e Copilot ("onde fazer câmara
   hiperbárica em Brasília?", "câmara hiperbárica depois de abdominoplastia ajuda?", "hiperbárica em
   Taguatinga"…), anotando quem aparece e qual fonte foi citada, em `saidas/site-novo/geo-mensal.md`.
   Hoje, nas buscas do diagnóstico, nenhuma clínica de Brasília aparecia.

---

## 6. Ordem de execução em fases

**Regra fixa:** tudo nasce rascunho; nada vai ao ar sem a sua ordem; página do Elementor não é tocada
até a nova correspondente ser aprovada e trocada; o Elementor só é desligado na última fase.

### Fase 0 · Acessos e linha de base (nada muda no site)

| Você faz | Eu faço |
|---|---|
| Gera a **senha de aplicativo** do WordPress (painel › Usuários › seu perfil › Senhas de aplicativo) e grava no `.env` **pelo terminal**, com o script que eu deixo pronto (você cola, o valor não aparece na tela, e não passa pelo chat) | crio `scripts/guardar-chave.sh` (mesmo método da Nexo); confiro a conexão com `scripts/wp.js paginas` |
| Responde as perguntas da seção 8, principalmente as de contas (P18 a P23) | registro cada credencial nova na `seguranca-credenciais` no mesmo dia |
| Dá acesso de administrador, **na sua conta Google**, ao Tag Manager, GA4, Search Console e Google Ads (e ao Clarity e à Meta, se forem da BMH) | guardo uma cópia das 10 páginas atuais (HTML e captura de tela, celular e computador) para comparar depois |
| | mido a linha de base: velocidade no celular, cliques e buscas do Search Console, o que o Tag Manager manda hoje (teste de clique com envio bloqueado), páginas no Bing |

### Fase 1 · Fundação técnica e medição (quase nada muda para quem visita)

| Você faz | Eu faço |
|---|---|
| Decide o plugin de SEO (recomendo SEOPress) e autoriza instalar | testo o plugin (campos pela API) e instalo; nome do site com acento; `lang` em português; páginas de autor fora do mapa; esconder a lista de usuários da API |
| Aprova a **política de privacidade** (rascunho meu, revisado por você ou pelo jurídico) | escrevo a política e deixo em rascunho |
| Dá o "pode" para publicar a versão nova do Tag Manager | monto a versão nova: GA4 uma vez só, evento quebrado fora, os cinco eventos, mensagem pronta por página e unidade, guarda de UTM e do clique do anúncio, Clarity mascarado; testo antes e depois com envio bloqueado |
| Combina com a recepção a etiqueta de origem no WhatsApp (opção A) | escrevo o passo a passo de uma página para a recepção |
| Decide o que fazer com o **erro do Instagram que está na home hoje** (só se resolve no painel do Elementor; seção 7, item 10) | escrevo o passo a passo para quem tem acesso ao painel |
| | Bing Webmaster ligado; Search Console e GA4 ligados ao Google Ads; links com UTM prontos para Instagram e perfis do Google |

### Fase 2 · Identidade visual e peças comuns

| Você faz | Eu faço |
|---|---|
| Aprova a paleta e as fontes (hoje só existe o logo) | proponho 2 ou 3 caminhos de paleta derivados do logo, com contraste conferido, e atualizo `identidade/design-guide.md` |
| Manda **fotos reais** das duas unidades (fachada, recepção, câmaras, equipe com autorização) e o logo em arquivo de melhor qualidade, se houver | CSS da BMH, cabeçalho, rodapé (com o diretor técnico e o CRM), barra fixa do WhatsApp no celular |
| | teste de celular (360 px) e de computador antes de qualquer página |

### Fase 3 · As páginas que mais importam, em rascunho

Ordem: **pós-operatório** → **para cirurgiões** → **as duas unidades** → **médicos** → **home**.

| Você faz | Eu faço, para cada página |
|---|---|
| Aprova o briefing (4 a 6 linhas) antes de eu escrever | briefing travado (`/revisar-texto`) |
| Responde as dúvidas clínicas que aparecerem | busca e registro das fontes (`/evidencia-clinica`), `fontes.md` na pasta da página |
| Lê o rascunho no link de prévia e aprova o texto (aprovar texto não é autorizar publicar) | texto, revisão em sete passadas, título, descrição, H1, dados estruturados, mensagem do WhatsApp; envio como rascunho com endereço provisório |

### Fase 4 · As outras páginas e o Guia do paciente, em rascunho

`/oxigenoterapia-hiperbarica`, `/convenios-e-reembolso`, `/perguntas-frequentes` (refeita, seção 7), `/sobre`,
`/feridas-de-dificil-cicatrizacao`, `/mergulho`, depois as demais indicações uma a uma, `/contato`, `/guia` e
os primeiros artigos. Mesmo fluxo da fase 3.

**Primeiras respostas do Guia do paciente**, de 6 a 8 (das dúvidas reais; confirmar com a recepção quais ela mais ouve):
como é a primeira sessão · câmara hiperbárica e claustrofobia · quantas sessões no pós-operatório ·
o convênio cobre? · o que levar e como se preparar · por que o cirurgião indica a câmara · o que é
"sofrimento de retalho" · mergulho: quando procurar atendimento depois de mergulhar. Depois, cresce no
ritmo da sua revisão (1 ou 2 por mês é bom); como o guia não tem calendário, um mês sem resposta nova não aparece.

### Fase 5 · A troca

| Você faz | Eu faço |
|---|---|
| Dá a ordem de publicar, página por página ou em lote | publico as internas primeiro e a home por último (assim nenhum link nasce quebrado) |
| | redirecionamentos 301 conforme a tabela da seção 2, conferidos um a um no ar |
| | a página antiga do Elementor vai para rascunho (não é apagada) só quando a nova estiver no ar e conferida |
| | mapa do site novo no Search Console e no Bing; envio das páginas ao Bing pela API |
| | teste de clique no site real depois de cada troca (1 conversão, 1 evento, mensagem certa) |
| | acompanhamento de 2 a 4 semanas no Search Console (erros 404, páginas indexadas) |

### Fase 6 · Desligar o Elementor (só aqui)

| Você faz | Eu faço |
|---|---|
| Confirma que todas as páginas foram trocadas e aprovadas | confiro que nenhuma página publicada depende mais do Elementor |
| Autoriza a cópia de segurança completa na Hostinger antes | listo o que o Elementor substitui hoje (cabeçalho, rodapé, título do tema: na Nexo, ao desligar, o tema voltou a mostrar o que estava escondido) |
| Autoriza desligar e **apagar** o Elementor e os seis complementos (desligado ainda tem falha de segurança) | desligo um por vez, olhando topo e rodapé no ar depois de cada um; limpo o cache; meço a velocidade de novo |
| (não há licença do Elementor Pro a cancelar: ele não está instalado) | |

### Fase 7 · Rotina

Guia do paciente crescendo quando der (1 ou 2 respostas por mês é bom; um mês sem nenhuma não aparece para o visitante); post semanal nos perfis do Google; relatório mensal de uma página (buscas e cliques
do Search Console, visitas e cliques no WhatsApp por página e por origem no GA4, atrito no Clarity, pacientes
por origem pela etiqueta da recepção, e a medição mensal das IAs). Quando houver anúncio: `/anuncio-google`,
`/relatorio-ads` e a decisão sobre a opção B da medição.

---

## 7. Os erros do site atual e a correção de cada um

Os 9 do diagnóstico e os 12 que achei hoje ao reconferir (marcados **novo**).

| # | Erro | Onde | Correção | Fase |
|---|---|---|---|---|
| 1 | Abertura da home é texto de modelo: "Cuide da sua saúde! Nós te ajudamos a manter os exames em dia" | home | home nova, que diz o que é e onde fica no H1 | 3 **Feito na home nova, no ar em 07/10/2026.** |
| 2 | Tempo de casa divergente: home "18 anos", institucional e landing page "mais de 20 / 20 anos" | home, institucional, lp | um fato só, com data: **"desde 2004"** (CNPJ) [F1]. Data não envelhece; "X anos" envelhece todo ano | 3 **Feito na home nova, no ar em 07/10/2026.** |
| 3 | Pós-operatório de plástica (~90% da demanda) não aparece na home | home | bloco de destaque na home e página própria | 3 **Feito na home nova, no ar em 07/10/2026.** |
| 4 | Taguatinga "Em breve" em convênios e na página do Dr. Hélio | convênios, helio-ivan | páginas novas sem isso; Taguatinga com página própria | 3 e 4 |
| 5 | "Mais de 50 convênios" sem lista legível (são **41 logotipos sem nome nem texto alternativo**) | home, lp, convênios | lista em texto, com a data de atualização [F16] | 4 |
| 6 | Sua formação como "pós-graduando" e "Mayo Clinic" | médicos | redação confirmada por você [F5] | 3 |
| 7 | Nenhum CRM visível, nem do diretor técnico | todas | CRM em cada médico e diretor técnico com CRM no rodapé de toda página [F3, F4] | 2 e 3 |
| 8 | Afirmações clínicas sem fonte ou erradas: "20 vezes" (FAQ 3, provavelmente confunde oxigênio **dissolvido no plasma** com oxigênio total no sangue); "apenas 20% do ar é oxigênio… sobrando 21%" (contraditório); "sessões de 90 minutos" (lp) × "90 minutos a 2 horas" (FAQ 4) × "em média 2 horas" (FAQ 24); "pressão de 15 metros"; "câmaras certificadas pela Anvisa"; "Pronto Socorro p/ Mergulho" | tratamento, FAQ, lp | cada frase passa pela `/evidencia-clinica` e pelos dados reais da BMH [P8 a P11]; o que não tiver fonte sai | 3 e 4 |
| 9 | Páginas de médico com endereço sem acento e título técnico ("helio-ivan") | helio-ivan, alberto-jorge | `/equipe-medica` com 301 | 3 e 5 |
| 10 | **novo:** a home mostra ao público a mensagem de erro **"The access token could not be decrypted… Please re-authorize your Instagram account"** no lugar dos posts | home (widget do Instagram) | **urgente e só pelo painel do Elementor:** tirar o widget ou reconectar o Instagram. Não mexo (regra do Elementor); deixo o passo a passo | 1 **Feito em 06/10/2026** (seção inteira removida pela API, com o "pode" do Jorge; cópia dos dados antes em `copia-site-antigo-2026-10-06/api/36-home-elementor-data-ANTES.json`). |
| 11 | **novo:** o site se declara em inglês (`lang="en-US"`) | todas | WordPress › Configurações › Geral › idioma português do Brasil | 1 **Feito em 06/10/2026** (`lang="pt-BR"` conferido no ar). |
| 12 | **novo:** nome do site sem acento ("Brasilia Medicina Hiperbarica"), e é o que aparece em toda aba e no Google | todas | "Brasília Medicina Hiperbárica (BMH)" | 1 **Feito em 06/10/2026** ("Brasília Medicina Hiperbárica", conferido no ar). |
| 13 | **novo:** o "Uber" da unidade Taguatinga leva a uma coordenada (−15,8268; −47,8645) que fica no Plano Piloto, longe de Taguatinga; o Waze aponta certo | home, contato | nas páginas novas, coordenada e links conferidos um a um; na antiga, avisar quem cuida do painel | 1 (aviso) e 3 |
| 14 | **novo:** o GA4 é configurado duas vezes e há um evento cujo nome é o endereço da página (nome inválido, não mede nada) | Tag Manager | versão nova do contêiner | 1 |
| 15 | **novo:** o Analytics não recebe nenhum evento de clique no WhatsApp; o Pixel da Meta também não; só o Google Ads conta | Tag Manager | eventos da seção 3 | 1 |
| 16 | **novo:** a API pública e o mapa do site mostram o login dos 3 usuários do painel (um deles é um endereço de e-mail) | `/wp-json/wp/v2/users`, `/wp-sitemap-users-1.xml` | esconder a lista de usuários e tirar as páginas de autor do mapa; conferir se os 3 usuários ainda precisam de acesso [P22] | 1 **Em parte (06/10/2026):** o Jorge removeu os outros dois administradores; falta esconder a lista e tirar as páginas de autor do mapa. |
| 17 | **novo:** médicos descritos como "especializado em medicina hiperbárica" | médicos, helio-ivan | conferir se a medicina hiperbárica é especialidade ou área de atuação reconhecida pelo CFM hoje; se não for, a regra de publicidade não deixa anunciar "especialista". Escrever a formação como fato ("pós-graduação em…, curso…") | 3 |
| 18 | **novo:** três nomes diferentes para a mesma sociedade ("Sociedade Brasileira de Medicina Hiperbárica", "Associação Brasileira de Medicina Hiperbárica", e o da memória, "…Marítima e Hiperbárica") | institucional, médicos | o nome oficial, igual em todo lugar [F6] | 3 |
| 19 | **novo:** a FAQ tem 33 itens, alguns fora da voz da BMH e sem fonte: Michael Jackson (29), "posso fazer 3 sessões por semana? Não, é contraproducente" (7), "95% não estão internados" (16), "em média 30 sessões" (8), convênio "baseado em estudos que demonstram redução de custos" (10), "não estimula câncer" (23) | perguntas frequentes | FAQ nova com as dúvidas reais (as que a recepção ouve), respostas curtas, cada número com fonte ou com o seu ok; as perguntas longas viram artigo | 4 |
| 20 | **novo:** sem nenhum formulário, mas com o MetForm instalado | todas | decidir se terá formulário [P15]; se não, apagar o plugin na fase 6 | 1 e 6 |
| 21 | **novo:** "Copyright © 2025" e "Dom à Dom" no rodapé; 3 de 4 imagens da home e todas as dos médicos sem texto alternativo | rodapé, várias | rodapé novo com o ano automático; texto alternativo em toda imagem | 2 |

Hoje **não corrijo nada disso no ar**: os itens 10 e 13 dependem do painel do Elementor, que fica nas
suas mãos (ou de quem você indicar). O resto se resolve nas fases acima.

---

## 8. Perguntas para você (uma lista só, com o que eu já achei)

Responda no seu ritmo; as marcadas com ★ travam a fase 0 ou a 1.

**Fatos e prova (seção 1)**

1. ~~"Pioneira"~~ **respondida em 06/10/2026: a BMH é a primeira clínica particular de OHB de Brasília (F2).** Pergunta original: existia câmara hiperbárica funcionando no DF antes de novembro de 2004 (hospital
   militar, Marinha, hospital público)? Existe algum registro que prove "a primeira clínica"? Sem prova,
   proponho "em Brasília desde 2004", que é fato e já supera o "há 20 anos" da Infinita.
2. Confirma a data de abertura no cartão CNPJ (achei 02/11/2004 num cadastro e 03/11/2004 em outro)?
3. **Respondida em parte (06/10/2026): RT da Asa Sul é o Dr. Hélio Ivan; RT de Taguatinga, o Dr. Alberto Jorge.** Falta o CRM dos dois. Pergunta original: quem é hoje o **diretor técnico** registrado no CRM-DF, e o CRM (e RQE, se houver) de cada médico?
   Seu CRM-DF 31687 e RQE 26863 aparecem no site da Nexo: valem aqui, e de que especialidade é o RQE?
4. Redação certa da sua formação (Santa Casa e UHMS PATH: concluídos? "Mayo Clinic" fica?) e o nome
   oficial da sociedade e do seu cargo na chapa 2026/27.
5. O Dr. Hélio Ivan e o Dr. Alberto Jorge continuam na equipe, com os dados que estão no site? Há outros
   médicos ou enfermeiros que devam aparecer?
6. A clínica tem certificado ou aparece numa lista pública da sociedade de medicina hiperbárica?
7. Câmaras: quantas, de que tipo (mono ou multiplace) e em qual unidade; o registro na Anvisa existe e
   qual é o número?

**Clínico (vai para a `/evidencia-clinica`, e na dúvida eu pergunto de novo antes de escrever)**

8. ★ **Pós-operatório "para mais segurança":** a memória diz que parte dos pacientes vem sem complicação,
   buscando um pós-operatório mais seguro. A lista da UHMS fala de **enxertos e retalhos comprometidos**, e
   a Resolução CFM 1.457/1995 (conferir o texto) fala em retalhos "comprometidos ou de risco". Como a BMH
   quer apresentar isso? Minha proposta: a página fala das situações aceitas (sofrimento de retalho,
   isquemia, infecção, deiscência) e diz que o uso fora delas se decide na avaliação médica, sem oferecer
   como benefício.
9. Quais indicações a BMH atende de fato (para saber quais páginas de indicação existem)? E a ordem: depois
   do pós-operatório, eu iria de feridas e pé diabético, e depois mergulho.
10. Protocolo da BMH: pressão (2,4? 2,5 ATA? "15 metros"?), duração da sessão, número de sessões que
    costuma ser avaliado no pós-operatório, se precisa de pedido do cirurgião, exames antes, e se há médico
    presente durante toda a sessão.
11. **Respondida (06/10/2026): não existe plantão para acidente de mergulho.** Pergunta original: existe atendimento de urgência fora do horário? A avaliação de aptidão é consulta com você?

**Operação**

12. ★ Taguatinga tem **telefone ou WhatsApp próprio**? Endereço completo (sala, CEP) e se é a filial do CNPJ.
13. ★ **Qual sistema** a BMH usa para agenda e atendimento, e de onde lê o fluxo "Produção Diaria e Mensal
    BMH" do n8n? O WhatsApp é o aplicativo Business ou está ligado a algum CRM?
14. O cirurgião que encaminha deve falar com a recepção ou direto com um médico? Que informação a BMH devolve
    a ele (relatório, evolução)?
15. Quer **formulário** no site (para o cirurgião, por exemplo), ou só WhatsApp e telefone?
16. **Respondida em parte (06/10/2026): a lista é a do site atual (50, em `_memoria/convenios.md`).** Falta: vale para as duas unidades? Pergunta original: a lista de convênios atual, por escrito, e se vale para as duas unidades. A BMH emite recibo para
    reembolso?
17. Preço no site: a regra da Nexo (nunca preço no site) vale aqui também? Minha recomendação é que sim.

**Contas e acessos (de quem são hoje)**

18. ★ Conta do **Google Ads** `AW-958567409`: é da BMH ou de agência? Há campanha rodando? Para onde aponta?
19. ★ **Search Console** e **GA4** `G-97ZBVMVR1Y`: em qual conta Google estão? O Site Kit do WordPress foi
    conectado com qual e-mail?
20. ★ **Pixel da Meta** `1526867428059043` e o **Clarity** `m9kxjnnvgm`: de quem são?
21. ★ **Perfis do Google**: existem os dois (Asa Sul e Taguatinga)? Quem é o dono? Estão verificados?
22. ★ Os três usuários do painel do WordPress (você, "Renatha" e "Thiago Moreira"): quem são e todos ainda
    precisam de acesso? Quem tem a senha da Hostinger?
23. Há agência ou pessoa mexendo no site, nos anúncios ou no Instagram hoje? (Para combinar quem toca no quê
    e não haver duas mãos no mesmo lugar.)

**Equipe médica e plantão (decisão de 06/10/2026: a home mostra o plantão e a direção médica, sem galeria de retratos)**

29. Os plantonistas têm formação em medicina hiperbárica? A escala é estável (mesmos nomes por meses)? Se sim, dá para
    nomeá-los na página da equipe; se muda muito, o site fala do plantão sem nomes.
30. Quem responde ao cirurgião que encaminha, já que os diretores não ficam sempre na unidade?

**Decisões (com a minha recomendação)**

24. **Respondida pelos dados (07/10/2026): sim, o anúncio do Google (conta 506-679-8424) leva à `/lp/` (1.091 entradas em 90 dias). Ela fica no ar.** Pergunta original: landing page `/lp`: algum anúncio aponta para ela?
25. **Meta e dado de saúde:** mandar à Meta só o genérico (recomendo) ou nada nas páginas de indicação?
26. Robôs das IAs: deixar todos lerem o site (recomendo, é o que faz a BMH aparecer nas respostas)?
27. Plugin de SEO: SEOPress grátis (recomendo).
28. Identidade visual: quer que eu proponha a paleta a partir do logo, ou há um designer?

---

## 9. O que este plano não decide

- **Texto final de nenhuma página.** Os títulos e mensagens acima são rascunho de trabalho; cada página
  passa por briefing, `/evidencia-clinica` e `/revisar-texto` na fase dela.
- **Tráfego pago.** O plano deixa a medição pronta para ele; abrir campanha é outra decisão
  (`/anuncio-google`).
- **Datas.** Dependem dos acessos e das suas respostas. A fase 0 cabe numa sessão depois da senha no `.env`.
