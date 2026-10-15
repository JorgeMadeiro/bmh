# Auditoria de SEO e GEO da BMH (15/10/2026)

> Primeira auditoria, só de leitura. Nada foi alterado no site, no WordPress, no Google, no Bing nem no n8n.
> Fontes: o site no ar lido com `curl` (celular), Search Console pela conta de serviço (16/07 a 13/10/2026, 90 dias),
> Inspeção de URL do Search Console, Perfil da Empresa pela API (leitura), Bing Webmaster pela API (leitura), GA4
> (leitura), PageSpeed pela API, ChatGPT com busca pela API da OpenAI (25 perguntas) e buscas na web.
> Os dados do Search Console são posteriores ao erro de impressões do Google (13/05/2025 a 27/04/2026): valem.

## Resumo

1. O **Perfil do Google é o canal que mais traz paciente**: 478 toques em ligar, 571 pedidos de rota e 169 cliques no site em 90 dias, contra 662 cliques orgânicos no site inteiro; e a unidade Taguatinga tem endereço diferente no site e no perfil, perfil sem serviços e descrição antiga com nome errado da sociedade.
2. **A página `/hiperbarica-taguatinga/` não existe para o Google** ("O Google não reconhece o URL", 7 dias depois de publicada), e o **Bing nunca descobriu** `/hiperbarica-asa-sul/` nem `/pos-operatorio-cirurgia-plastica/`; o ChatGPT lê o índice do Bing.
3. **Convênio é a dúvida que mais perde paciente para concorrente**: a `/convenios/` ainda é a página antiga do Elementor, com os 50 planos só em logotipo (sem texto, sem descrição de imagem) e "Taguatinga (Em Breve)"; o ChatGPT não conseguiu confirmar a GEAP na BMH e indicou a Infinita primeiro.
4. **No ChatGPT a BMH já é citada em 19 de 25 perguntas (76%)**, 16 de 17 nas de "onde fazer", quase sempre em 1º ou 2º lugar; perde todas as 6 perguntas de explicação (quantas sessões, o que é, plano cobre), onde as fontes são SBMH, CFM e UHMS. Gemini, Perplexity e Google com IA: não medidos (sem chave).
5. As buscas locais já estão no topo (posição 1,7 a 2,8); as de volume alto ("câmara hiperbárica", "hiperbárica", 28 mil exibições) ficam na posição 10 a 11 com público do Brasil todo e quase nenhum clique: **não é ali que está o paciente**, e não vale correr atrás antes de resolver os itens 1 a 3.

---

## 1. Achados por prioridade (o que mais traz paciente primeiro)

Gravidade: crítico, alto, médio, baixo. Certeza: alta, média, baixa.

### A1. Perfil do Google: maior canal, com dados divergentes e incompletos (alto, certeza alta)

**Prova (API do Perfil, 14/07 a 11/10/2026):**

| | Asa Sul | Taguatinga | Total |
|---|---|---|---|
| Exibições (busca + mapa) | 6.141 | 5.795 | 11.936 |
| Toques em ligar | 198 | 280 | **478** |
| Pedidos de rota | 347 | 224 | **571** |
| Cliques no site | 70 | 99 | 169 |

Buscas que mostraram o perfil (jul a set): "câmara hiperbárica" (946 Asa Sul, 1.069 Taguatinga), "hiperbarica" (640, 739), "oxigenoterapia hiperbárica" (151, 138), "hiperbárica taguatinga" (139).

Problemas encontrados na leitura dos perfis:
- **Taguatinga, endereço diferente do site:** perfil = "Prédio Prime Excelência Médica, Torre D, **Loja 2 3 e 4**", **CEP 72115-700**; site, rodapé e dados estruturados = "Prédio Prime Excelência Médica, Torre D, Setor C Norte", **sem loja e sem CEP**. O CNES (5612454) diz "Área Especial Setor C Norte, Lote 1 a 12, Torre D, Loja 2 3 4, CEP 72115-700". Além disso, a 1ª linha de endereço do perfil repete cidade e CEP ("St. C Norte - Taguatinga, Brasília - DF, 72115-700").
- **Taguatinga sem nenhum serviço cadastrado** e sem categoria secundária (Asa Sul tem 4 serviços, dois deles palavra-chave solta: "Hiperbárica Brasília", "Hiperbárica").
- **Descrição igual nas duas, antiga e com erro:** não fala de pós-operatório de cirurgia plástica (90% da demanda); chama a sociedade de "Sociedade Brasileira de Medicina (SBMH)" (o nome oficial é Sociedade Brasileira de Medicina Marítima e Hiperbárica, conferido em sbmh.com.br); usa adjetivo ("altamente capacitados", "ótima localização") e "pioneira" e "primeira a oferecer os serviços privado na câmara monoplace", afirmações sem a prova combinada (a frase aprovada é "primeira clínica particular de medicina hiperbárica de Brasília").
- O que está certo: telefone (61) 3346-6005 igual em todo lugar, horário 7h às 19h todos os dias, categoria "Médico hiperbarista", site de cada perfil apontando para a página da unidade com UTM (desde 14/10), 262 avaliações todas respondidas.

**Impacto:** é de onde vem a maior parte das ligações. Endereço divergente é o tipo de erro que o Google e as IAs usam para desconfiar da entidade.
**Recomendação:** ver plano, itens 1 a 3.

### A2. Páginas novas fora do índice: Taguatinga no Google; Asa Sul e pós-operatório no Bing (crítico, certeza alta)

**Prova, Inspeção de URL do Search Console (15/10/2026):**

| Página | Google | Último rastreio |
|---|---|---|
| `/` | indexada | 15/10 |
| `/hiperbarica-asa-sul/` | indexada | 10/10 |
| `/hiperbarica-taguatinga/` | **"O Google não reconhece o URL"** | nunca |
| `/pos-operatorio-cirurgia-plastica/` | indexada | 09/10 |
| `/perguntas-frequentes/` | indexada | 13/10 |

A página está no mapa do site (`page-sitemap1.xml`, baixado pelo Google em 14/10), responde 200, tem canonical próprio e `index, follow`. Só não foi descoberta ainda.

**Prova, Bing Webmaster (API):** `/hiperbarica-taguatinga/` descoberta em 11/10 e lida em 12/10; **`/hiperbarica-asa-sul/` e `/pos-operatorio-cirurgia-plastica/`: descoberta "nunca", leitura "nunca"**, apesar do envio registrado em 08/10. O Bing não tem nenhuma consulta registrada para o site e mostrou 10 exibições em 12/10.

**Impacto:** "hiperbárica taguatinga" (200 exibições, 17 cliques) e "câmara hiperbárica taguatinga" (66) ainda caem na home e em páginas antigas redirecionadas. No Bing (base do ChatGPT), a página do pós-operatório, que é a do público de 90%, não existe.
**Recomendação:** pedir indexação no Search Console (botão do Jorge) e reenviar as 3 URLs ao Bing pela API de envio, conferindo a resposta. Plano, item 4.

### A3. Convênios: a dúvida que decide o agendamento está numa página que ninguém lê (alto, certeza alta)

**Prova:**
- `/convenios/` (Elementor, no ar e indexada): sem H1, descrição gerada sozinha com "Taguatinga, Brasília - DF **(Em Breve)**" e "Funcionamento: Dom à Dom", "Copyright © 2024"; **104 palavras**; os 50 convênios são **53 imagens sem texto alternativo** (`AFEB.png`, `3.png`, `4.png`…). Nenhuma máquina lê a lista.
- Search Console: a `/convenios/` aparece em "camara hiperbarica brasilia" (260 exibições, posição 9,9), "hiperbarica brasilia" (239, posição 9,5) e "brasília medicina hiperbárica" (182), mostrando o texto antigo.
- ChatGPT, pergunta "Onde fazer câmara hiperbárica pelo plano de saúde no DF? Tenho GEAP": cita a **Infinita em 1º** ("o site lista GEAP") e a BMH em 2º, com a ressalva "não consegui confirmar textualmente que GEAP está ativo na lista". A GEAP é o item 39 da lista da BMH (`_memoria/convenios.md`).
- A `site/llms.txt` e o menu de todas as páginas novas mandam o leitor para essa página antiga.
- "câmara hiperbárica convênio" (4 exibições, posição 10,5) e "câmara hiperbárica unimed" (3) mostram que a busca existe, pequena.

**Impacto:** quem pergunta "meu plano cobre?" para uma IA ou cai na `/convenios/` não encontra o nome do plano. A Unimed, que a BMH não atende, é buscada: a página precisa dizer isso com clareza.
**Recomendação:** refazer a `/convenios/` no mesmo endereço, nativa, com os 50 nomes em texto e busca. Plano, item 5.

### A4. Páginas das unidades curtas e sem conteúdo local (alto, certeza média)

**Prova (texto do H1 ao rodapé):** home 957 palavras, perguntas frequentes 922, pós-operatório 682, **Asa Sul 362, Taguatinga 319**. Cada unidade tem 3 H2 ("A unidade…", "O que você encontra aqui", "Agende"). A régua aprendida na Nexo foi 900 palavras ou mais por página de serviço, com primeira frase citável e perguntas frequentes. Concorrentes: Infinita 1.598 palavras na home, CHB 1.194.
Taguatinga já cita os bairros perto (Ceilândia, Samambaia, Águas Claras, Vicente Pires): é o começo certo.

**Impacto:** a página da unidade é a que recebe o clique do Perfil do Google. Hoje ela não responde "como chego, onde estaciono, que câmara tem aqui, aceita meu plano, quanto tempo dura" na própria página.
**Recomendação:** plano, item 7. Passa no "teste da troca" (trocar o nome da unidade e o texto não pode continuar valendo).

### A5. Páginas antigas e a `/lp/` brigando com as novas (médio, certeza alta)

**Prova:**
- Redirecionamentos conferidos no ar, todos **301 direto, sem cadeia**: `/institucional/`, `/tratamento/`, `/contato/`, `/medicos/`, `/home/` → `/`; `/alberto-jorge/` → `/hiperbarica-taguatinga/`; `/helio-ivan/` → `/hiperbarica-asa-sul/`; `http://` e `www.` → `https://hiperbaricabrasilia.com.br/`. **Estão certos.** O Google só ainda não voltou a essas URLs (últimos rastreios entre 26/08 e 29/09), por isso elas continuam "indexadas" e aparecendo: `/tratamento/` 199 exibições em "hiperbárica taguatinga", `/contato/` 197, `/alberto-jorge/` 885 no total. Resolve sozinho com o rastreio; o pedido de indexação das páginas de destino acelera.
- **`/lp/` (Elementor, destino do anúncio) está indexável**, no mapa do site e **ligada de todas as páginas novas** por um menu escondido do tema Astra com o texto "Landing Page" (o tema imprime a lista de páginas no HTML, mesmo com o cabeçalho desligado). Na busca "camara hiperbarica brasilia" a home está na posição 2,3 (282 exibições, 16 cliques) e a `/lp/` na 3,2 (105, 11 cliques). A `/lp/` não tem H1 nem descrição, repete parágrafo e diz "excelência clínica e tecnologia avançada".
- Busca de marca espalhada por até 6 páginas ("brasília medicina hiperbárica | bmh taguatinga": `/institucional/`, `/tratamento/`, `/`, `/contato/`, `/convenios/`, `/lp/`); boa parte é efeito dos links extras do Google, mas reforça a limpeza.

**Impacto:** a `/lp/` é a página mais lenta do site e divide a busca principal com a home.
**Recomendação:** tirar a `/lp/` do índice (sem mexer no anúncio) e o menu escondido do tema. Decisão do Jorge (a `/lp/` traz 20 cliques orgânicos em 90 dias). Plano, item 6.

### A6. Diretórios: a BMH aparece pouco e com dados diferentes onde aparece (médio, certeza alta)

| Lugar | A BMH aparece? | O que está lá | Situação |
|---|---|---|---|
| Site | sim | Asa Sul "SGAS 613, Conjunto E, Bloco A, 1º subsolo, Complexo Médico Hospitalar, L2 Sul, CEP 70200-730"; Taguatinga "Prime Excelência Médica, Torre D, Setor C Norte" | Taguatinga sem loja e sem CEP |
| Perfil do Google Asa Sul | sim | "SGAS 613 / Conjunto E, 1º Subsolo, Bloco A / L2 Complexo Médico Hospitalar", 70200-730 | ok |
| Perfil do Google Taguatinga | sim | "Torre D, Loja 2 3 e 4", 72115-700 | ver A1 |
| `/convenios/` (site antigo no ar) | sim | "Taguatinga (Em Breve)", "Dom à Dom" | **errado** |
| CNES Asa Sul (7880510) | sim | "SGA SUL 613 S/N, Bloco A, Asa Sul, 70200-730", (61) 3346-6005 | ok, outra grafia |
| CNES Taguatinga (5612454, via bula.com.br) | sim | "Área Especial Setor C Norte Lote 1 a 12, Torre D Loja 2 3 4, 72115-700"; turno "manhã e tarde" | confere com o perfil; o turno não confere com 7h às 19h |
| SBMH, clínicas associadas (sbmh.com.br, fonte de 10 das 25 respostas do ChatGPT) | **só Asa Sul** | "SGAS 613, BLOCO A CONJUNTO E, CENTRO MEDICO L2+, subsolo, sala A2…", campo de site com "14" | **Taguatinga ausente; site inválido** |
| Doctoralia | **não** | em "médico hiperbarista Brasília" aparecem só Dr. José Henrique Sandoval (108 opiniões) e Clínica Renovo (Sudoeste) | ausente (clínica e os 3 diretores) |
| BoaConsulta | não | zero resultado de medicina hiperbárica em Brasília | ausente (ninguém está) |
| OpenStreetMap | **não** | nenhuma clínica hiperbárica do DF cadastrada | ausente |
| hyperbaric.app (citado pelo ChatGPT) | sim | Asa Sul 4,9 com 185; Taguatinga 4,7 com 96 | **notas antigas** (Google hoje: 4,8 com 192; 4,9 com 70) |
| Reclame Aqui (citado pelo ChatGPT) | sim | página da empresa, "uma reclamação ativa antiga", sem reputação definida | a conferir pelo Jorge |
| Diário Oficial do DF (sinj.df.gov.br) | sim | credenciamento para o sistema de saúde do CBMDF | positivo, citado pelo ChatGPT |
| Facebook (facebook.com/hiperbaricabrasilia) | sim | não conferido por dentro (pede login) | não medido |
| Catálogo.med | Dr. Alberto Jorge Madeiro Leite listado como **ginecologista** (snippet de busca; a página deu 403) | não conferido |
| Bing Places, Apple Business Connect | não medido | precisam de login do Jorge | conferir |

**Diferença em relação à Nexo:** lá o Doctoralia foi fonte de 26 de 44 citações. **Na BMH, o ChatGPT não citou o Doctoralia nenhuma vez**: as fontes foram o próprio site da BMH (19 respostas), gov.br (12, quase sempre o HFA), sbmh.com.br (10) e CFM (5). O diretório que mais pesa aqui é o da **SBMH**, onde o Jorge é da diretoria. O Doctoralia continua útil para quem busca o médico pelo nome e porque a lista de hiperbaristas de Brasília lá tem só 2 nomes.

### A7. GEO: forte em "onde fazer", ausente em "como funciona" (médio, certeza alta)

Detalhe na seção 4. Prova: 0 de 6 perguntas de explicação citam a BMH; as fontes usadas são SBMH (diretriz 2016 a 2018 e página de indicações do CFM), UHMS e FDA. As páginas da BMH não mostram quem revisou, quando, nem as referências (o arquivo `fontes.md` existe na pasta, mas não aparece na página). A pergunta frequente diz "Respostas revisadas pela direção médica da BMH" sem nome, registro e data.

**Recomendação:** "revisado por" com nome, CRM e data, e uma lista curta de referências visível nas páginas de perguntas e do pós-operatório. Plano, item 8. O número "10 a 30 sessões" já está no site; qualquer número novo passa pelo Jorge e pela `evidencia-clinica`.

### A8. Velocidade: usuário real bem, laboratório mal por causa das tags (médio, certeza média)

**Prova (PageSpeed, celular, 15/10/2026):**

| Página | Nota | LCP (teste) | Bloqueio (TBT) | Peso |
|---|---|---|---|---|
| `/` | 69 | 8,6 s | 270 ms | 869 KB |
| `/pos-operatorio-cirurgia-plastica/` | 54 | 9,6 s | 760 ms | 860 KB |
| `/hiperbarica-asa-sul/` | 72 | 1,8 s | 1.830 ms | 1.046 KB |
| `/hiperbarica-taguatinga/` | 53 | 10,1 s | 810 ms | 1.052 KB |
| `/perguntas-frequentes/` | 55 | 9,6 s | 790 ms | 837 KB |
| `/convenios/` | 72 | 3,3 s | 810 ms | 1.411 KB |
| `/lp/` (anúncio) | **38** | **12,2 s** | 1.060 ms | 1.957 KB |

SEO 100 em todas; acessibilidade 88 a 100. **Dado de usuário real (CrUX, o site inteiro):** LCP 2,2 s (bom), CLS 0, primeira resposta do servidor 1,4 s (médio). A `/lp/` tem dado próprio: LCP 2,5 s (médio).
Resposta do servidor medida daqui: 0,15 s nas páginas novas; 1,2 s na `/convenios/` (Elementor).

**Leitura:** para o Google, que usa o dado real, o site passa. O teste de laboratório mostra o peso das tags (o Analytics da agência `G-97ZBVMVR1Y` sozinho bloqueava 0,5 s em 08/10). A `/lp/` é o destino do anúncio: lenta, custa clique pago.

### A9. Dados estruturados e detalhes de página (baixo, certeza alta)

- Home: `MedicalOrganization` + 2 `MedicalClinic` + `Physician` + `FAQPage` (sem destaque no Google desde 07/05/2026, pode ficar). Unidades: `MedicalClinic` + `BreadcrumbList`. Válidos.
- Faltam: `geo` (latitude e longitude; o perfil tem: Asa Sul −15,83452 / −47,91220; Taguatinga −15,82222 / −48,06614), **CEP de Taguatinga**, `sameAs` além do Instagram (os dois perfis do Google, Facebook, SBMH).
- Na home, a `MedicalClinic` da Asa Sul tem `url` = `/`; na página da unidade, `/hiperbarica-asa-sul/` (mesmo `@id`, endereço diferente).
- Nome da unidade nos dados estruturados "BMH Brasília Medicina Hiperbárica · Asa Sul"; no perfil, "Brasília Medicina Hiperbárica | BMH Asa Sul". Igualar ao perfil.
- Home: 3 fotos dos diretores sem texto alternativo (`bmh-dr-jorge-madeiro.jpg`, `bmh-dr-helio-ivan.jpg`, `bmh-dr-alberto-jorge.jpg`).
- `WebSite` com `description` vazio (SEOPress).
- Títulos de 59 a 73 caracteres (três passam de 60 e podem ser cortados no celular); descrições de 148 a 160: ok.
- `robots.txt` libera todos os robôs (só bloqueia `/wp-admin/`); mapa `sitemaps.xml` sem erro no Google; `llms.txt` responde 200 (peso zero, mas aponta para a `/convenios/` antiga).
- Todas as páginas legíveis sem JavaScript (texto no HTML). `lang="pt-BR"`. Um H1 por página nova.

### A10. Buscas de volume alto e nacional: não é prioridade (baixo, certeza média)

"câmara hiperbárica" (11.355 exibições, posição 11,0, 2 cliques), "hiperbarica" (10.818, 10,1, 10 cliques), "hiperbárica" (3.647), "camara hiperbarica" (1.284), "camera hiperbarica" (812): somam 28 mil das 82 mil exibições e quase todas caem na `/perguntas-frequentes/`. Quando a mesma busca cai na home, a posição é 2,8 a 5,1 (hipótese: é o Google mostrando a home para quem está no DF e a pergunta frequente para o resto do país). As visitas orgânicas na `/perguntas-frequentes/` desde 08/10: 21 sessões, **0 clique no WhatsApp** (GA4). Conclusão: manter a página boa, sem esforço extra por posição nacional.

---

## 2. Search Console: as 50 buscas com mais exibições (16/07 a 13/10/2026)

Total: **662 cliques, 82.096 exibições, CTR 0,8%, posição média 7,9**. Celular: 483 cliques (73%).

| # | Busca | Exib. | Cliques | Posição | Página que aparece (exibições, posição) |
|---|---|---|---|---|---|
| 1 | câmara hiperbárica | 11.355 | 2 | 11,0 | perguntas-frequentes (11.325, 11,0); / (108, 2,8) |
| 2 | hiperbarica | 10.818 | 10 | 10,1 | perguntas-frequentes (10.031, 10,6); / (821, 4,2) |
| 3 | hiperbárica | 3.647 | 7 | 10,4 | perguntas-frequentes (3.605, 10,5) |
| 4 | camara hiperbarica | 1.284 | 2 | 10,4 | perguntas-frequentes (1.247, 10,6) |
| 5 | camera hiperbarica | 812 | 0 | 11,0 | perguntas-frequentes |
| 6 | câmara hiperbarica | 438 | 2 | 11,1 | perguntas-frequentes |
| 7 | câmara hiperbárica como funciona | 324 | 2 | 8,7 | perguntas-frequentes |
| 8 | câmera hiperbárica | 298 | 0 | 11,4 | perguntas-frequentes |
| 9 | hiperbarica brasilia | 293 | 3 | 2,7 | / (293, 2,7); convenios (239, 9,5); tratamento (49, 8,2) |
| 10 | camara hiperbarica brasilia | 284 | 28 | 1,8 | / (282, 2,3); convenios (260, 9,9); lp (105, 3,2) |
| 11 | hiperbarica o q é | 283 | 1 | 10,0 | perguntas-frequentes |
| 12 | centro hiperbárico de brasília | 219 | 0 | 5,7 | / (nome do concorrente CHB) |
| 13 | alberto jorge | 208 | 0 | 6,0 | alberto-jorge (redirecionada) |
| 14 | hiperbárica taguatinga | 200 | 17 | 2,4 | / (200, 2,4); tratamento (199, 6,4); contato (197, 10,9) |
| 15 | brasília medicina hiperbárica | 188 | 22 | 1,8 | / ; convenios ; lp ; contato |
| 16 | câmara hiperbárica quantas sessões | 173 | 2 | 2,5 | perguntas-frequentes |
| 17 | quantas sessões de hiperbárica são necessárias | 140 | 1 | 1,5 | perguntas-frequentes |
| 18 | camara bariatrica | 139 | 0 | 10,0 | perguntas-frequentes |
| 19 | câmara hiperbárica antes e depois | 133 | 2 | 7,3 | perguntas-frequentes |
| 20 | camara hiperbarica funciona | 130 | 0 | 7,4 | perguntas-frequentes |
| 21 | sessões de hiperbárica | 129 | 1 | 4,6 | perguntas-frequentes |
| 22 | dr alberto jorge | 129 | 0 | 8,8 | alberto-jorge |
| 23 | oxigenoterapia hiperbárica | 125 | 1 | 4,7 | perguntas-frequentes (105, 5,4); / (21, 2,7) |
| 24 | cama hiperbarica | 120 | 0 | 11,1 | perguntas-frequentes |
| 25 | camera hiperbárica | 119 | 0 | 10,8 | perguntas-frequentes |
| 26 | hiper barica | 105 | 0 | 10,3 | perguntas-frequentes |
| 27 | câmara hiperbárica valor sessão | 98 | 0 | 8,1 | perguntas-frequentes (50, 6,4); / (48, 9,8) |
| 28 | hiperbarica o que é | 97 | 0 | 9,7 | perguntas-frequentes |
| 29 | cama hiperbárica | 93 | 0 | 11,0 | perguntas-frequentes |
| 30 | quanto tempo dura uma sessão de hiperbárica | 91 | 1 | 2,0 | perguntas-frequentes |
| 31 | sessões de câmara hiperbárica | 85 | 1 | 3,2 | perguntas-frequentes |
| 32 | centro hiperbarico de brasilia | 81 | 0 | 6,0 | / (concorrente) |
| 33 | câmara hiperbárica df | 79 | 1 | 2,7 | / ; institucional |
| 34 | terapia hiperbarica | 77 | 1 | 10,1 | perguntas-frequentes |
| 35 | bmh asa sul | 74 | 2 | 1,9 | / ; lp ; convenios ; institucional |
| 36 | camara hiperbárica | 69 | 0 | 10,0 | perguntas-frequentes |
| 37 | câmara hiperbárica taguatinga | 66 | 5 | 2,5 | / ; tratamento ; institucional |
| 38 | brasília medicina hiperbárica \| bmh taguatinga | 59 | 2 | 2,1 | 6 páginas |
| 39 | como funciona a hiperbárica | 57 | 0 | 9,5 | perguntas-frequentes |
| 40 | bmh hiperbarica | 56 | 8 | 1,7 | / ; lp ; convenios |
| 41 | hiperbarica em brasilia | 56 | 3 | 2,8 | / ; convenios |
| 42 | hiperbarico | 56 | 0 | 8,8 | perguntas-frequentes |
| 43 | bmh taguatinga | 51 | 4 | 2,0 | / ; institucional ; lp |
| 44 | clinica hiperbarica | 49 | 1 | 4,3 | / ; tratamento |
| 45 | chb centro hiperbarico de brasilia | 48 | 0 | 6,5 | / (concorrente) |
| 46 | câmara hiperbárica brasilia | 47 | 7 | 1,7 | / ; convenios ; lp |
| 47 | dr jorge alberto | 47 | 0 | 4,9 | alberto-jorge |
| 48 | exame hiperbárica | 45 | 0 | 9,7 | perguntas-frequentes |
| 49 | hiperbariatrica o que é | 45 | 0 | 7,1 | perguntas-frequentes |
| 50 | camera iperbarica | 43 | 0 | 11,1 | perguntas-frequentes |

**Oportunidades (exibição alta, posição 5 a 20), já filtradas pelas regras da BMH:**

| Busca | Exib. | Posição | Vale? |
|---|---|---|---|
| câmara hiperbárica, hiperbarica e variações | ~28.000 | 10 a 11 | baixo: nacional, sem clique, sem WhatsApp (A10) |
| câmara hiperbárica como funciona / funciona | 454 | 7,4 a 8,7 | médio: resposta citável no topo da pergunta frequente |
| hiperbarica o q é / o que é | 380 | 9,7 a 10 | médio: idem (definição curta com fonte) |
| alberto jorge / dr alberto jorge / dr jorge alberto | 384 | 4,9 a 8,8 | médio: página da equipe médica (planejada); atenção, o nome também é procurado como ginecologista |
| oxigenoterapia hiperbárica | 125 | 4,7 | médio |
| câmara hiperbárica valor sessão (e "valor", "preço") | ~200 | 2,3 a 15,5 | sem preço (regra): responder "o que define o custo, o convênio cobre, a recepção informa" |
| centro hiperbárico de brasília / chb | 348 | 5,7 a 6,5 | **não**: é o nome de concorrente |
| câmara hiperbárica antes e depois | 133 | 7,3 | **não**: "antes e depois" está vetado |

**Páginas competindo pela mesma busca** (com 20 ou mais exibições cada): "camara hiperbarica brasilia" (home 2,3 × `/lp/` 3,2 × `/convenios/` 9,9); "hiperbárica taguatinga" (home × `/tratamento/` × `/contato/`, enquanto a página certa não está no índice); "hiperbarica asa sul" (`/convenios/` 3,9 × home 2,3 × `/lp/` 2,6, a `/hiperbarica-asa-sul/` não aparece); "medicina hiperbárica" (home × perguntas frequentes × `/lp/`). As páginas antigas saem quando o Google rastrear os 301; a `/lp/` só sai com decisão (A5).

Páginas novas desde 08/10: `/pos-operatorio-cirurgia-plastica/` 141 exibições, posição 6,3, 0 clique ("hiperbarica pos cirurgia plastica", "câmara hiperbárica após cirurgia plástica"): a busca do pós-operatório existe, mas é pequena; esse público chega pelo cirurgião e pelo perfil do Google.

---

## 3. Concorrentes em Brasília (quem aparece e com que página)

Fontes: respostas do ChatGPT (25 perguntas), Search Console, sites lidos com `curl` em 15/10/2026. Posição no mapa do Google por ponto da cidade: **não medida** (sem ferramenta paga; varia com o lugar de onde se busca).

| Concorrente | Onde | Citado no ChatGPT | Tipo de página | O que se vê |
|---|---|---|---|---|
| HFA, Hospital das Forças Armadas | Sudoeste/Cruzeiro (público) | 9 de 25 | página de serviço no gov.br | ganha "acidente de mergulho" e "SUS"; exige encaminhamento |
| Hospital Daher | SHIS QI 7, Lago Sul | 7 | site de hospital com página de OHB | indicações listadas, inclusive complicação pós-operatória |
| Oxi Hiperbárica | 915 Norte, Asa Norte | 7 | site de clínica, título com 123 caracteres, sem H1, sem dados estruturados | "todos os dias 7h às 19h", câmara individual com TV |
| Infinita Recuperação | SCLN 316, Asa Norte | 7 | site moderno, 1.598 palavras, convênios em texto (GEAP) | mistura OHB com nutrologia e estética, "resultado de verdade" |
| CHB, Centro Hiperbárico de Brasília | QND 2, Taguatinga Norte, e Lago Norte | 7 | site de clínica sem descrição e sem dados estruturados | associado à SBMH, credenciado do SIS Senado; o nome dele traz 348 exibições à BMH |
| HiperCure | Albany Medical Center, Águas Claras | 4 | site fora do ar no teste (erro 500) | aparece pelo centro médico |
| Rinnovare Brasília | Brasília | 3 | site de clínica com dados estruturados genéricos | "maior centro…", "resultados reais", estética |
| Clínica Renovo, Dr. José Henrique Sandoval | Sudoeste; SRTVN | 0 | Doctoralia | os únicos em "médico hiperbarista Brasília" no Doctoralia |

**Leitura:** tecnicamente a BMH já está à frente (é a única com dados estruturados de clínica por unidade, CRM e RQE visíveis e página por unidade). Os concorrentes ganham onde a BMH não tem texto: convênio por nome (Infinita), presença em diretório (CHB na SBMH em Taguatinga; Renovo no Doctoralia) e autoridade pública (HFA). Vários usam tom de estética e promessa; a BMH não deve seguir esse caminho.

---

## 4. GEO: linha de base (repetir a cada 14 dias)

### Placar de fundações (Passo 1 da `geo-citacao`)

| Bloco | Item | Situação | Prova |
|---|---|---|---|
| Achar | robots.txt não bloqueia os robôs de busca das IAs | ✅ | só `Disallow: /wp-admin/` |
| Achar | mapa do site enviado ao Google e ao Bing | ⚠️ | Google sem erro (14/10); Bing não descobriu 2 páginas novas |
| Achar | `llms.txt` publicado | ✅ | 200; aponta para a `/convenios/` antiga (peso zero na nota) |
| Achar | página nova avisada ao Bing | ⚠️ | Asa Sul e pós-operatório: "nunca descobertas" |
| Ler | legível sem JavaScript | ✅ | texto completo no HTML |
| Ler | um H1, títulos em ordem | ⚠️ | páginas novas ok; `/convenios/` e `/lp/` sem H1 |
| Ler | resposta no começo | ✅ | home começa com "A BMH faz oxigenoterapia hiperbárica para…" |
| Ler | dados estruturados da organização com `sameAs` | ⚠️ | `sameAs` só Instagram; sem `geo`; Taguatinga sem CEP |
| Confiar | quem assina, registro, NAP igual | ⚠️ | CRM e RQE ok; Taguatinga diverge; sem "revisado por" com data |
| Confiar | presença onde as IAs consultam | ⚠️ | Google ok; SBMH só Asa Sul; Doctoralia e OpenStreetMap ausentes; Bing Places e Apple não medidos |

**Nota: 4 de 10 (40%).** Meta de 30 dias: 75%.

### Auditoria de citação (Passo 2)

- **Data:** 15/10/2026.
- **IA medida:** ChatGPT (modelo gpt-5.5 com busca na web, pela API da OpenAI, local aproximado Brasília/DF, sem histórico). 25 perguntas.
- **Complemento:** ferramenta de busca do Claude deste ambiente (6 perguntas; é o resultado da busca, não o Claude.ai do consumidor).
- **Não medidos, e o que falta:** Gemini (falta `GEMINI_API_KEY` no `.env`), Perplexity (falta `PERPLEXITY_API_KEY`), Google com IA e Copilot (precisam de navegador; sem API). Nada foi inventado para esses.
- **Arquivos:** `marketing/seo/geo/20261015-perguntas.csv` (planilha da skill), `20261015-perguntas.json` (as perguntas), `20261015-chatgpt-respostas.json` (respostas completas com fontes) e `rodar-chatgpt.js` (recheque com as mesmas perguntas: `node --env-file=.env marketing/seo/geo/rodar-chatgpt.js`, 25 chamadas cobradas pela OpenAI).

**Placar:**

| IA | Perguntas | BMH citada | Melhor concorrente | Taxa da BMH |
|---|---|---|---|---|
| ChatGPT com busca | 25 | 19 | HFA (9) | **76%** |
| Busca do Claude (ambiente) | 6 | 2 (via CNES em bula.com.br, nunca pelo site) | CHB (2) | 33% |
| Gemini, Perplexity, Google com IA | | não medido | | |

Por tipo de pergunta (ChatGPT): recomendação 16 de 17; marca 1 de 1; comparação 1 de 1; como fazer 1 de 4; definição 0 de 2.

| # | Pergunta | Público | BMH | Posição aprox. | Concorrentes citados |
|---|---|---|---|---|---|
| 1 | câmara hiperbárica em Brasília | paciente | sim | 1 | Oxi, Infinita, Rinnovare, HiperCure, Daher, HFA, Albany |
| 2 | Onde fazer oxigenoterapia hiperbárica no pós-operatório de cirurgia plástica em Brasília? | paciente | sim | 2 | Daher, Infinita, Oxi, HiperCure, Rinnovare |
| 3 | Clínica de medicina hiperbárica em Taguatinga | paciente | sim | 2 | CHB |
| 4 | Hiperbárica que aceita convênio em Brasília | paciente | sim | 2 | Oxi, Infinita, HiperCure |
| 5 | Qual a melhor clínica de câmara hiperbárica em Brasília? | paciente | sim | 1 | Infinita, Rinnovare, Daher |
| 6 | Câmara hiperbárica na Asa Sul | paciente | sim | 1 | |
| 7 | Câmara hiperbárica perto de Águas Claras ou Ceilândia | paciente | sim | 3 | HiperCure, CHB |
| 8 | Onde fazer câmara hiperbárica pelo plano no DF? Tenho GEAP | paciente | sim | 2 (Infinita 1º) | Infinita |
| 9 | Câmara hiperbárica para pé diabético em Brasília | paciente | sim | 3 | Oxi, CHB, HFA |
| 10 | Onde tratar ferida que não cicatriza com OHB em Brasília? | paciente | sim | 2 | Oxi, Infinita, CHB, Daher, HFA |
| 11 | Avaliação de aptidão para mergulho com hiperbarista em Brasília | paciente | sim | 1 | |
| 12 | Acidente de mergulho: onde tem câmara em Brasília? | paciente | sim | 2 (HFA 1º; diz certo que a BMH é 7h às 19h) | HFA, CBMDF |
| 13 | Cirurgião: para onde encaminhar sofrimento de retalho pós-abdominoplastia? | cirurgião | sim | 1 | Daher, HFA |
| 14 | Clínica em Brasília com médico presente durante as sessões | cirurgião | sim | 1 | |
| 15 | Cirurgião: necrose de pele após mamoplastia, para onde encaminhar? | cirurgião | sim | 2 | Oxi, Infinita, CHB, Daher, HFA |
| 16 | Câmara em Brasília que atende Bradesco ou SulAmérica | paciente | sim | 1 | CHB, Daher |
| 17 | Brasília Medicina Hiperbárica é boa? | marca | sim | 1 | |
| 18 | Monoplace ou multiplace: diferença e onde tem em Brasília | paciente | sim | 4 | Oxi, CHB, HFA |
| 19 | Quantas sessões no pós-operatório de cirurgia plástica? | paciente | **não** | | fontes: SBMH, CFM |
| 20 | Câmara depois de lipoaspiração ou abdominoplastia: quando é indicada? | paciente | **não** | | SBMH, UHMS, NCBI |
| 21 | Quanto tempo dura uma sessão? | paciente | **não** | | sem fonte |
| 22 | O que é oxigenoterapia hiperbárica e para que serve? | paciente | **não** | | UHMS, CFM, FDA |
| 23 | Câmara hiperbárica pelo SUS em Brasília | paciente | **não** (correto: a BMH não é porta do SUS) | | HFA, SES-DF, MPDFT |
| 24 | O plano cobre câmara hiperbárica? Como pedir autorização? | paciente | **não** | | gov.br, ANS |
| 25 | Como escolher uma clínica de câmara em Brasília? | paciente | sim | final | HFA |

"Posição aproximada" é a ordem em que a BMH aparece no texto, contada por script: é guia, não medida exata.

**Fontes que o ChatGPT usou (nº de respostas):** hiperbaricabrasilia.com.br 19 (quase sempre a home; uma vez `/hiperbarica-taguatinga/`, uma vez a antiga `/medicos/`), gov.br 12, sbmh.com.br 10, oxihiperbarica 7, hospitaldaher 7, infinitahiperbarica 7, chbcentrohiperbarico 6, sistemas.cfm.org.br 5, uhms.org 3, cnes2.datasus.gov.br 2, sinj.df.gov.br 2, hyperbaric.app 1, reclameaqui 1. **Doctoralia: 0.**

**Perguntas perdidas e hipótese (a confirmar no recheque):**

| Pergunta | Quem ganhou | Por que ganha (hipótese) | Prioridade |
|---|---|---|---|
| 8 (GEAP) | Infinita | lista convênios em texto; a BMH só em imagem | P1 |
| 19, 20 (sessões; quando é indicada) | SBMH, UHMS | a BMH não mostra fonte nem quem revisou | P1 |
| 21, 22 (duração; o que é) | UHMS, CFM | idem; frase citável sem referência ao lado | P2 |
| 24 (plano cobre) | ANS, gov.br | a BMH não tem página de convênio legível | P1 (junto com A3) |
| 12 (acidente de mergulho) | HFA | correto: a BMH não tem plantão; não mexer | não fazer |

---

## 5. Plano de ação em ordem

Esforço: P (até 1 h), M (meio dia), G (1 dia ou mais). "Jorge" = depende de decisão, acesso ou botão dele.

| # | O que fazer | Mira | Esforço | Depende do Jorge |
|---|---|---|---|---|
| 1 | **Igualar o endereço de Taguatinga** em todo lugar, no formato do perfil e do CNES: "Prédio Prime Excelência Médica, Torre D, Loja 2, 3 e 4, Setor C Norte, Taguatinga, Brasília/DF, CEP 72115-700" (site, rodapé, dados estruturados, `llms.txt`). Não mexer no endereço do perfil (risco de nova verificação), só pedir para o Jorge confirmar que "Loja 2, 3 e 4" e o CEP estão certos | A1, A6 | P | sim: confirmar o endereço e dar o "pode" de mudar a página no ar |
| 2 | **Reescrever a descrição dos dois perfis do Google** (sem link, sem adjetivo, com pós-operatório de cirurgia plástica, feridas, mergulho, "médico em todas as sessões", nome certo da SBMH ou sem ele) e **cadastrar serviços em Taguatinga** dentro da lista do CFM (pós-operatório com retalho ou enxerto comprometido; feridas que não cicatrizam e pé diabético; lesões por radioterapia; avaliação de aptidão para mergulho); trocar os serviços "Hiperbárica Brasília" e "Hiperbárica" da Asa Sul por serviços reais; categoria secundária igual nas duas. Texto passa pela `revisar-texto` | A1 | M | sim: aprovar o texto e o envio pela API |
| 3 | Fotos reais e recentes nos perfis (fachada, recepção, sala das câmaras **vazia**), sem paciente; post semanal ligado às páginas | A1 | M por mês | sim: fotos sem paciente; aprovar |
| 4 | **Pedir indexação** de `/hiperbarica-taguatinga/` (e das outras 4 novas) no Search Console e **reenviar ao Bing** `/hiperbarica-asa-sul/`, `/pos-operatorio-cirurgia-plastica/` e `/hiperbarica-taguatinga/`, conferindo a resposta da API e a "descoberta" no dia seguinte (lição da Nexo: enviar ao Bing no mesmo dia de cada página nova) | A2 | P | sim: o botão "Solicitar indexação" é do Jorge; o envio ao Bing precisa do "pode" |
| 5 | **Refazer `/convenios/` no mesmo endereço**, nativa: os 50 nomes em texto (de `_memoria/convenios.md`), busca, "não atendemos Unimed", o que o plano costuma pedir (pedido médico, relatório, autorização), se vale para as duas unidades, H1 "Convênios atendidos pela BMH em Brasília", celular primeiro (360 a 390 px), WhatsApp na primeira tela. Atualizar o link do `llms.txt` | A3, perguntas 4, 8, 16, 24 | M | sim: confirmar se a lista vale nas duas unidades; "pode publicar" |
| 6 | **`/lp/` fora do índice** (noindex no SEOPress, sai do mapa do site; o anúncio continua igual) e **tirar o menu escondido do tema** que liga "Landing Page" em todas as páginas; depois, trocar o destino do anúncio pela página de cada tema (já planejado na reorganização do Google Ads, depois de 05/11) | A5 | P | sim: decisão (a `/lp/` tem 20 cliques orgânicos em 90 dias) |
| 7 | **Páginas das unidades com 900 palavras ou mais de conteúdo daquele lugar:** como chegar (referência, estacionamento, ônibus/metrô), que câmara tem ali, quem é o responsável técnico, bairros mais perto, perguntas frequentes da unidade (convênio, duração, roupa, curativo), primeira frase citável ("A unidade Taguatinga da BMH faz oxigenoterapia hiperbárica no Prime Excelência Médica…"), foto real. Passa no teste da troca | A4, perguntas 3, 6, 7 | G | sim: fatos (estacionamento, câmaras de Taguatinga) e "pode publicar" |
| 8 | **"Revisado por Dr. Jorge Madeiro, CRM-DF 31687, RQE 26863, em DD/MM/2026"** e **referências visíveis** (Resolução CFM 1.457/1995, diretriz da SBMH, UHMS) nas perguntas frequentes e no pós-operatório; definição curta com a fonte ao lado no topo de cada resposta. Nenhum número novo sem o Jorge (`evidencia-clinica`) | A7, perguntas 19 a 22 | M | sim: aprovar quem assina, as referências e cada número |
| 9 | **Diretório da SBMH:** cadastrar a unidade Taguatinga e corrigir o endereço e o site da Asa Sul (o Jorge é da diretoria) | A6 | P | sim: pedido à secretaria da SBMH |
| 10 | **Dados estruturados:** `geo` das duas unidades (coordenadas do perfil), CEP de Taguatinga, `sameAs` com os dois perfis do Google, Facebook e SBMH, nome da unidade igual ao do perfil, `url` da Asa Sul igual na home e na unidade, texto alternativo nas 3 fotos dos diretores, descrição do `WebSite` | A9 | P | sim: "pode" para mudar páginas no ar |
| 11 | **Doctoralia:** perfil da clínica e dos três diretores, com o mesmo endereço, sem preço (pacote como o da Nexo, sem copiar texto) | A6 | M | sim: cadastro é do Jorge (conta e confirmação de CRM); decidir se vale |
| 12 | Conferir e completar **Bing Places** e **Apple Business Connect** (o ChatGPT lê o Bing); criar o lugar no **OpenStreetMap** com o endereço igual | A6 | M | sim: login nas contas da BMH |
| 13 | **Página da equipe médica** (`/equipe-medica`, já planejada): os três diretores com CRM e RQE, formação, "médico em todas as sessões" (sem "plantonista"), UHMS por extenso só se a formação estiver concluída. Recebe as 384 exibições de "alberto jorge" | Search Console | M | sim: texto e fotos |
| 14 | Tirar o Analytics da agência (`G-97ZBVMVR1Y`) e deixar a imagem do topo menor no celular; medir de novo a `/lp/` e as páginas das unidades | A8 | P | sim: o "ainda não" de 07/10 continua valendo |
| 15 | Conferir a página do Reclame Aqui e o perfil do hyperbaric.app (pedir atualização das notas) e o cadastro do Dr. Alberto Jorge no Catálogo.med (aparece como ginecologista) | A6 | P | sim: o Jorge diz se responde e se a especialidade está certa |
| 16 | **Recheque de GEO em 29/10/2026** (14 dias) com as mesmas 25 perguntas; somar Gemini e Perplexity se o Jorge criar as chaves | seção 4 | P | sim: chaves novas, se quiser |

**O que não fazer:** página para "centro hiperbárico de brasília" (nome de concorrente); conteúdo de "antes e depois"; preço da sessão; anunciar atendimento de acidente de mergulho fora do horário; correr atrás da posição nacional de "câmara hiperbárica".

**Ordem de impacto esperada:** 1 a 4 mexem no que já traz ligação (perfil e página da unidade) e destravam o índice; 5 e 8 fecham as perguntas que o ChatGPT perde; 6, 7, 9 a 13 consolidam a entidade.

---

## 6. O que não foi medido nesta auditoria

- Posição no pacote do mapa por ponto da cidade e top 10 real do Google para cada busca (sem ferramenta paga; o Search Console deu a posição média).
- Gemini, Perplexity, Google com IA, Copilot (sem chave ou sem API).
- Bing Places, Apple Business Connect, Facebook e Instagram por dentro (precisam de login).
- Volume mensal de busca por palavra (o Planejador de palavras-chave não foi usado nesta auditoria).
- Links de outros sites para o site da BMH.

## 7. Dados de apoio

- GA4 (90 dias até 14/10): busca orgânica 882 sessões; assistente de IA 17 (chatgpt.com 18 como origem); Bing 25. Os cliques no WhatsApp viraram evento principal só em 07/10, então a conversão de 90 dias não é comparável.
- Desde 08/10, entradas pelo orgânico: home 22 sessões (9 eventos principais), perguntas frequentes 21 (0), pós-operatório 6 (0), Asa Sul 5 (0).
- Arquivos brutos desta auditoria (temporários, fora do projeto): scratchpad da sessão. A linha de base que fica é a de `marketing/seo/geo/`.
