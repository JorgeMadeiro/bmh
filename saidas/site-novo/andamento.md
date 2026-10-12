# Site novo da BMH: andamento

> Ler primeiro na próxima sessão. O plano completo está em `plano-site.md`; o retrato de partida, em
> `diagnostico-2026-10-06.md`. Atualizar este arquivo ao fim de toda sessão.

## Onde estamos

**Fase:** plano entregue, esperando as respostas do Jorge (seção 8 do plano) e a senha do WordPress no `.env`.
Nada foi criado, enviado ou publicado no site. Nenhuma página do Elementor foi tocada. O Tag Manager não foi alterado.

## Feito

### 06/10/2026 · sessão 1 (plano)

- Lidos: diagnóstico, `CLAUDE.md`, memória (empresa, estratégia, preferências), design-guide, skills `site`
  (e `licoes.md`), `seo` (e referências), `revisar-texto`, `evidencia-clinica`, `seguranca-credenciais`,
  `anuncio-google`, `relatorio-ads`; o método da Nexo (plano, cabeçalho, rodapé, CSS, integrações de Tag
  Manager, GA4, conversões, Bing, Clarity, perfil do Google, testes de celular e de tags). Nenhum texto da Nexo copiado.
- Reconferido no ar: as 10 páginas (todas Elementor, sem mudança desde 19/06/2025), o texto de cada uma,
  plugins, `robots.txt`, mapa do site, links de contato, contêiner público do Tag Manager (versão 3).
- **Achados novos** (detalhe na seção 7 do plano):
  - CNPJ **07.091.027/0001-86**, abertura **02 ou 03/11/2004**, matriz SGAS 613 Bloco A Conj. E subsolo 1
    sala 2A, CEP 70200-730, 1 filial. Base do "desde 2004".
  - Home mostra ao público o erro do widget do Instagram ("access token could not be decrypted").
  - `lang="en-US"`; nome do site sem acento.
  - Tag Manager: GA4 `G-97ZBVMVR1Y` configurado 2 vezes; evento do GA4 com o endereço da página como nome
    (inválido); **Clarity `m9kxjnnvgm`** (o diagnóstico não tinha visto); Pixel `1526867428059043` só PageView;
    conversão Google Ads `AW-958567409` (rótulo `sySsCKHnuP8YEPGniskD`) no clique em `api.whatsapp.com` ou `wa.me/`.
  - O WhatsApp do site é `api.whatsapp.com/send/?phone=556133466005` (o diagnóstico dizia `wa.me`), sem mensagem.
  - Nenhum formulário em nenhuma página (MetForm instalado e parado).
  - Uber da unidade Taguatinga aponta para coordenada no Plano Piloto (−15,8268; −47,8645).
  - API pública lista 3 usuários do painel (logins `jorgemadeirotorres`, `ringlesias` e um que é e-mail).
  - Plugins vistos no HTML: Elementor 3.29.2 (+ Pro), ElementsKit Lite, Essential Addons, GUM Elementor Addon,
    Stratum, MetForm, Envato Elements, Site Kit 1.155.0, LiteSpeed Cache. WordPress 7.1.2, PHP 8.2.
  - PageSpeed do Google recusou por cota: linha de base de velocidade fica para a fase 0.
- Cópia do HTML das 10 páginas, do `gtm.js` e o extrator de texto ficaram só no scratchpad desta sessão
  (temporário); a fase 0 refaz a cópia de segurança dentro do projeto.

### 06/10/2026 · sessão 1, continuação

- Jorge perguntou se WordPress é a melhor escolha. Resposta: sim, para a BMH (comparação com Next.js/Vercel,
  Wix/Squarespace e site estático na conversa); fica WordPress em bloco nativo, a decisão é dele.
- **Prévia visual** publicada (privada): https://claude.ai/artifact/6Kv4c8rvAjqxCnPZ65FfuJ, com a home no
  computador, a primeira tela no celular, o celular rolando com a barra fixa do WhatsApp e a proposta de cores e
  letras. Cores tiradas do logo: marinho `#002375`, azul-oxigênio `#34A9CF`, azul de texto `#1A6E93`.
  Letras: Archivo (títulos) e Source Sans 3 (texto). Textos são de forma, não finais; colchetes = a confirmar.
  Ainda não aprovada; quando for, levar para `identidade/design-guide.md` (com o ok do Jorge).

- **Jorge reprovou a versão 1 da prévia** ("concorrentes melhores; somos a referência, o site tem que acompanhar").
  Causa: era um esqueleto (caixas tracejadas, colchetes, sem foto). Feito: fotos de tela dos concorrentes (Infinita é a
  régua visual: foto real em tela cheia, títulos em serifa, números de prova, médico com foto, avaliações; Oxi e
  HiperCure com foto real da câmara). `clinicarinnovare.com.br` é clínica de estética, provavelmente não é a Rinnovare
  do diagnóstico; CHB não achada.
- **Versão 2 publicada** no mesmo link: fotos reais tiradas do site atual (sala com câmara monoplace, fachada da L2 Sul,
  retratos dos três médicos), logo da BMH sem fundo, títulos em Source Serif 4 (tom de instituição), frase de
  abertura "A medicina hiperbárica de Brasília, desde 2004.", faixa de formação da equipe, faixa do cirurgião,
  equipe com foto e CRM, convênios em texto (nomes dos logotipos do site atual).
- Achado: `wp-content/uploads/2024/10/logo_Asset-1.png` é o logo da agência **Allon**, não da BMH. Perguntar se a Allon
  fez o site atual e se ainda tem acesso.
- Pendências da prévia: seu CRM-DF 31687 foi usado como fato (vem do site da Nexo; confirmar); foto de Taguatinga;
  fotos novas em alta resolução; decidir se mostra avaliações do Google (aviso CFM).

- **Jorge: "tem que ser um site que converte!"** Versão 3 da prévia (mesmo link): triagem "Qual é o seu caso?" no
  topo (4 botões que abrem o WhatsApp com mensagem do caso), botão de ligar ao lado do WhatsApp (também na barra fixa
  do celular), "o que acontece depois que você chama" em 4 passos, busca de convênio que funciona na prévia, "prefere
  que a BMH chame você?", botões repetidos no pós-operatório e nas perguntas frequentes. Plano ganhou a subseção
  "Como o site converte" (seção 2) com as regras de conversão de toda página e a régua de medição.
- A confirmar com o Jorge (estão na prévia): a recepção recebe foto do curativo pelo WhatsApp? O cirurgião é
  informado da evolução? A lista de convênios da busca vem dos logotipos do site atual.

- **Jorge confirmou dois diferenciais (06/10/2026):** médico presente na unidade em **todas** as sessões de OHB, e
  avaliação de mergulhadores. Entraram na prévia v4 (faixa de provas "100% das sessões com médico presente", quadro
  do pós-operatório, nova seção "Medicina do mergulho", botão "Sou mergulhador" na triagem) e no plano (F14, F15).
  Regra: dizer como fato da BMH, sem comparar com concorrente.
- **Rodapé cortado na prévia:** o quadro tinha 6.500 px e a página 8.732 px. A primeira correção (8.800) não valeu:
  **o quadro aceita no máximo 8.000 px por tela** e o editor cortou para 8.000 sozinho. Correção que valeu: espaços
  entre seções e fotos mais compactos (página com 7.562 px medidos no navegador), quadro em 7.900, conferido depois de
  publicar. Lição: medir a altura antes de publicar, ficar abaixo de 8.000, e reler o quadro depois para confirmar.

- **Equipe médica e blog (Jorge concordou com a análise, 06/10/2026):** os três diretores quase nunca estão na
  unidade; quem atende são os plantonistas. Home v5: a galeria de retratos saiu e entrou "Quem cuida de você"
  (médico plantonista em todas as sessões + direção médica com CRM, fotos pequenas). As três páginas de médico viram
  uma só, `/equipe-medica`. O blog vira **Guia do paciente** (`/guia`): 6 a 8 respostas iniciais, sem calendário,
  fora do menu, ligado das páginas de indicação e do rodapé. Plano atualizado (seções 2, 3, 4, 6; perguntas 29 e 30).
  Memória: linha nova em `_memoria/empresa.md` sobre direção × plantonistas.

- **Home inteira no celular** na prévia (tela `Celular-home`, logo ao lado da do computador): mesmo conteúdo da v5,
  busca de convênio funcionando, barra fixa no fim. 7.614 px medidos no navegador; quadro em 7.900, conferido
  depois de publicar. A tela do computador foi redimensionada no editor (1.418 × 7.006) e foi mantida assim.

- **PDF para apresentação** (pedido do Jorge, antes dos cortes de tamanho): `saidas/site-novo/previa-site-bmh-2026-10-06.pdf`,
  14 slides 16:9 (capa, home no computador em 8 slides, celular em 4, cores e letras), gerado a partir do mesmo código
  da prévia v5. Os três cortes propostos (lista de convênios, faixa de formação, mergulho menor) **ainda não foram
  aplicados**: esperando o Jorge.

- **Cortes aplicados (Jorge: "pode fazer os cortes"), prévia v6 enxuta:** saíram a lista de convênios (a busca ganhou
  o link "ver a lista completa"), a faixa "Formação da direção médica" (o cargo na sociedade foi para a linha do
  Dr. Jorge em "Quem cuida de você") e a seção grande de mergulho (virou faixa curta com dois botões). Computador
  7.071 → 6.478 px; celular 7.614 → 6.814 px. Ajuste de tamanho da barra fixa feito no editor foi mantido.
  PDF novo: `saidas/site-novo/previa-site-bmh-2026-10-06-enxuta.pdf` (13 slides). O PDF anterior ficou como estava.

- **Ajustes do Jorge na prévia (06/10/2026):** UHMS saiu de todo lugar; formação passou a "pós-graduação em medicina
  hiperbárica" para os três diretores e "no Brasil e no exterior" para o Jorge; no topo, o número "UHMS" virou
  "3 diretores médicos com pós-graduação em medicina hiperbárica". Saiu a linha "Conteúdo revisado pelo…" da home
  (o "revisado por" continua previsto nas páginas de indicação e no Guia). Instagram entrou só no rodapé (recomendação,
  aguardando o ok). Taguatinga ganhou um painel da marca no lugar da caixa cinza, até chegar a foto real: não há foto da
  unidade no site atual, e as da internet são de imobiliárias (com dono). PDF não foi regerado depois destes ajustes.

- **Fotos de Taguatinga (Jorge colocou 9 na raiz, 06/10/2026):** organizadas em `identidade/fotos/` (taguatinga,
  asa-sul, equipe) com `README.md`. **3 das 9 mostram pacientes nas câmaras** e foram para
  `dados/fotos-com-paciente-nao-publicar/` (fora do GitHub, fora do site). Na prévia: fachada de Taguatinga no card da
  unidade, consultório no pós-operatório, entrada de Taguatinga no convite final. Fotos exportadas sem metadados. PDF
  `-enxuta` regerado com tudo de hoje (13 slides, 7,6 MB). Logo sem fundo salvo em `identidade/logo-bmh-sem-fundo.png`.
- Falta foto: sala das câmaras **vazia** (Taguatinga e Asa Sul) para o topo do site; Asa Sul em boa resolução.
- Achado: a entrada de Taguatinga já diz "Pioneiros em Medicina Hiperbárica no Distrito Federal" (a BMH já afirma
  isso em público). Para o site, continua valendo a pergunta 1: qual a prova?

- **Jorge confirmou: a BMH é a primeira clínica particular de OHB de Brasília** (pergunta 1 respondida). Na prévia:
  selo no topo ("Primeira clínica particular de medicina hiperbárica de Brasília", computador e celular) e na faixa de
  números ("2004 · fundação da BMH, a primeira clínica particular do gênero em Brasília"). PDF `-enxuta` regerado.
- Jorge perguntou se vale citar UHMS. Recomendação dada: fora da home e da linguagem do paciente; **dentro** da página
  da equipe médica e da página do cirurgião, por extenso, só se a formação estiver concluída. Aguardando decisão.

- **Respostas do Jorge (06/10/2026):** o Claude mexe no site inteiro (inclusive no erro do Instagram da home atual);
  ele acha que tem acesso a todas as contas; RT Asa Sul = Dr. Hélio Ivan, RT Taguatinga = Dr. Alberto Jorge; lista de
  convênios = a do site atual (transcrita: 50, sem Unimed, em `_memoria/convenios.md`); não existe plantão para
  acidente de mergulho; não sabe o tempo de resposta da recepção. Memória atualizada (`_memoria/empresa.md`,
  `_memoria/convenios.md`, `CLAUDE.md`).
- **Prévia:** busca de convênio com a lista certa (e tolerante a espaço e acento: "sul america", "exercito"),
  "50 convênios atendidos" na faixa do topo no lugar de "2 unidades", RTs por unidade no rodapé, "Ligue, das 7h às
  19h" no acidente de mergulho. PDF `-enxuta` regerado.
- **Criado `scripts/guardar-chave.sh`** (testado com arquivo de mentira: grava a senha com os espaços e o
  `node --env-file` lê certo). Próximo passo do Jorge: gerar a senha de aplicativo e rodar o script.
- **Erro do Instagram na home atual:** o conteúdo do Elementor não se edita pela API. Caminho: com o Jorge logado no
  painel, o Claude remove o widget pelo navegador, com o "pode" dele na hora (mudança em página no ar).

- **Senha do WordPress gravada pelo Jorge e conexão testada (06/10/2026).** Conta `jorgemadeirotorres` é
  administradora. Achados: **Elementor Pro não está instalado** (não há licença a cancelar; plano corrigido);
  9 plugins ativos, desatualizados (Elementor 3.29.2, tema Astra 4.6.10); **3 administradores** (o Jorge,
  `ringlesias`, `thiagomoreirasouza31gmail-com`); idioma `en_US`; 11ª página: "Política de privacidade" em rascunho
  (id 3, de 2023). Registro feito em `seguranca-credenciais`.
- **Fase 0 começou:** cópia do site antigo em `saidas/site-novo/copia-site-antigo-2026-10-06/` (dados das 11 páginas,
  HTML das 10 publicadas, 20 fotos de tela, ajustes, plugins, lista de mídia). Varredura de segredos: limpa.
- **Prévia:** "médico plantonista" virou "médico em todas as sessões" (pedido do Jorge; memória atualizada); CRM e RQE
  dos três no lugar dos colchetes. Falta: especialidade de cada RQE.
- **Falta na fase 0:** medir velocidade, teste das tags com envio bloqueado, Search Console, Bing; e o widget do
  Instagram da home (testar se a API do próprio Elementor permite tirar; senão, pelo navegador com o Jorge logado).

- **Jorge (06/10/2026):** RQE só com o número; removeu os outros dois administradores (conferido: só a conta dele);
  fez o backup completo na Hostinger; **"Não vamos utilizar Elementor. Pode fazer! Essa home vai ser substituída."**
- **Feito no site, no ar, com esse "pode" (06/10/2026):**
  1. Home atual: removida a seção "Confira nossas últimas postagens!" com o widget quebrado do Instagram
     (`stratum-instagram`, seção `e2944e9`), pela API (`_elementor_data` aparece na API com a conta de administrador).
     Antes de salvar, o script conferiu a data de modificação e a estrutura; cópia dos dados antes em
     `copia-site-antigo-2026-10-06/api/36-home-elementor-data-ANTES.json`. Cache do Elementor limpo; conferido no ar
     (sem a mensagem de erro) e com foto de tela no celular (resto da página igual).
  2. Nome do site: "Brasília Medicina Hiperbárica" (com acento). 3. Idioma: português (`lang="pt-BR"`). Conferidos no ar.
- **Para voltar a seção do Instagram** (se um dia precisar): reenviar o arquivo `-ANTES.json` no `meta._elementor_data`
  da página 36.

- **Fase 0, continuação (06/10/2026, noite):**
  - **Site Kit:** conectado pelo usuário 1 (o Jorge); Search Console = propriedade `https://hiperbaricabrasilia.com.br/`;
    Tag Manager = conta **6207699487**, contêiner GTM-PQZ32BC5. GA4 não está no Site Kit (vem pelo Tag Manager). A
    ligação do Site Kit com o Google está caída (`authenticated: false`): não serve para puxar dados.
  - **Velocidade (Lighthouse no celular, simulação 4G, sem os envios de rastreio):** `/convenios` desempenho 76, LCP
    4,5 s, 437 KB, 77 requisições · `/tratamento` 73, LCP 3,9 s, TBT 340 ms, 1,3 MB, 98 requisições · SEO 92,
    acessibilidade 90 nas duas. Meta do site novo: LCP abaixo de 2,5 s.
  - **Achado importante:** a **proteção da Hostinger** ("Checking your browser") devolve **403** para ferramenta de
    medição e, depois de algumas visitas seguidas, bloqueou meu acesso às páginas (a API continuou funcionando). A
    home e o `/contato` não puderam ser medidos. **Conferir se essa proteção barra Googlebot, Bingbot e os robôs das
    IAs** (item do GEO, seção 5 do plano) e, se barrar, ajustar no painel da Hostinger.
  - Teste das tags com envio bloqueado: **adiado** (as páginas estão me bloqueando agora).
- **Fase 1 começou (pedido do Jorge):**
  - **SEOPress 10.3 instalado e ativo** pela API. Passou na lição 1: `_seopress_titles_title`, `_seopress_titles_desc`,
    canonical, robots, campos de compartilhamento e redirecionamento por página aparecem e aceitam gravação.
  - Escrito `saidas/site-novo/acessos-passo-a-passo.md` (blocos A a E: atualizar plugins no painel, projeto
    `bmh-integracoes` no Google Cloud com conta de serviço, acessos no Tag Manager/GA4/Search Console, Bing, Clarity).
  - Falta na fase 1: esconder a lista de usuários da API e as páginas de autor do mapa do site; versão nova do Tag
    Manager (depende do bloco C); política de privacidade em rascunho.

- **Bloco A feito pelo Jorge (06/10/2026):** plugins atualizados (Elementor 3.29.2 → 4.3.4, Essential Addons 6.1.18 →
  6.8.5, LiteSpeed 7.6.2 → 7.9.1, MetForm 3.9.9 → 4.3.2, Site Kit 1.155 → 1.189, e os demais). **Sete plugins voltaram
  desativados** e a home ficou sem menu; reativados pela API na mesma hora, cache do Elementor limpo, e conferido: home
  igual à foto de antes (menos o Instagram, de propósito) e as outras 9 páginas com as mesmas palavras e os mesmos
  widgets da cópia. Lição 51 na skill `site`. O tema Astra continua na 4.6.10 (atualizar quando der; não é urgente).

- **Home nova em RASCUNHO no WordPress (06/10/2026, pedido do Jorge: "colocar em rascunho a nova página e depois
  irmos seguindo os blocos").** Página **id 1333**, slug `inicio-nova`, prévia (logado):
  `https://hiperbaricabrasilia.com.br/?page_id=1333&preview=true`. Fonte: `site/paginas/home.html` (bloco HTML nativo,
  celular primeiro), dados em `site/dados/` (convênios, schema), imagens em `site/imagens/` (10 enviadas à
  biblioteca, ids 1323 a 1332, todas respondendo 200). Envio por `scripts/wp-pagina-html.js` (novo; travas: nunca
  mexe em Elementor, nunca altera página publicada sem `--publicada`, nunca publica).
  - Testado antes do envio (390, 860 a 1920 px): sem rolagem lateral, triagem na primeira tela do celular, barra fixa
    só no celular, busca de convênio funcionando, zero erro de JavaScript. Cabeçalho: menu de celular abaixo de
    1.100 px, menu reduzido até 1.440 px.
  - Conferido depois do envio, na versão filtrada pelo WordPress: conteúdo salvo igual ao enviado, JavaScript
    compila, dados estruturados válidos, 17 links de WhatsApp com mensagem, cabeçalho/rodapé/título do Astra
    desligados, SEO do SEOPress preenchido.
  - **Diferenças da prévia para o rascunho, de propósito:** sem perguntas frequentes (respostas pendentes), sem links
    para páginas que ainda não existem (Guia, equipe, indicações), "Prefere que a BMH chame você?" virou "Prefere
    ligar?" (não há sistema que receba o pedido), sem "relatório de evolução ao cirurgião" e sem "foto do curativo"
    (não confirmados), rótulos do pós-operatório alinhados à Resolução CFM 1.457/1995, osteomielite na lista de
    indicações. Faltam: `/revisar-texto` formal e `fontes.md` da página.
  - **Não verificado:** a página dentro do tema (só o Jorge, logado, vê o rascunho). Pontos a olhar: fontes, cores dos
    títulos, sublinhado em botões.
  - **Para pôr no ar (quando o Jorge mandar):** publicar a 1333, trocar a página inicial em Ajustes › Leitura
    (`page_on_front` 36 → 1333), conferir no ar e com o teste de clique, passar a 36 para rascunho.

- **HOME NOVA NO AR (07/10/2026, ordem do Jorge: "Pode por no ar").** Antes: sublinhado removido de todos os links
  (pedido do Jorge). Feito: página 1333 publicada; página inicial trocada (`page_on_front` 36 → 1333; ajustes de antes
  guardados em `saidas/site-novo/ajustes-antes-da-troca-da-home.json`); home antiga (36, Elementor) passada para
  rascunho. Corrigido no ar: o tema pintava os títulos de cinza (#1E293B); agora azul-marinho com `!important`.
  - Conferido no ar (celular e computador): página nova no endereço principal, título e descrição do SEOPress,
    Tag Manager carregando, zero sublinhado, sem rolagem lateral, cabeçalho do tema escondido, fonte certa, triagem na
    primeira tela do celular. Clique no WhatsApp (envios bloqueados): abre com a mensagem do caso e **a conversão do
    Google Ads (958567409) dispara**, como antes. O GA4 continua sem evento de clique (vem na versão nova do Tag Manager).
  - `/` 200 · `/inicio-nova/` 301 para `/` · `/home/` 404 (endereço antigo; pôr 301 para `/` na fase de redirecionamentos).
  - Erro de JavaScript que não é nosso: `elementorFrontendConfig is not defined` (scripts do Elementor carregando numa
    página que não é do Elementor). Não quebra nada visível; tirar quando o Elementor sair, ou desligar os scripts dele
    nesta página.
  - **Para voltar atrás em 1 minuto:** `page_on_front` = 36 e página 36 de volta para `publish`.
  - Próximo na home: medir a velocidade nova (Lighthouse, quando a Hostinger deixar), perguntas frequentes com respostas
    confirmadas, "a gente te chama" quando houver sistema, versão nova do Tag Manager.

- **Blocos B, C e D feitos pelo Jorge (07/10/2026).** Conta de serviço `bmh-site@bmh-integracoes.iam.gserviceaccount.com`:
  o JSON estava na raiz do projeto; movido para `~/.config/bmh/bmh-site.json` (700/600), caminho no `.env`
  (`GOOGLE_SA_JSON`); sem cópias sobrando; varredura de segredos limpa. Novo `scripts/google-api.js` (token pela conta de
  serviço, nunca imprime a chave). Acessos conferidos: Tag Manager (conta "Site Brasília Medicina Hiperbárica",
  GTM-PQZ32BC5), Analytics (conta 294905226, propriedade 418169293, fluxo **G-10HHN3PQP0**), Search Console (Total).
  Bing: chave gravada como `BING_WEBMASTER_API_KE` (faltou o Y), renomeada para `BING_WEBMASTER_API_KEY`.
  Credenciais registradas em `seguranca-credenciais`.
- **Linha de base dos números em `saidas/site-novo/dados-google-2026-10-07.md`.** Os três achados que mudam o plano:
  **anúncio do Google rodando** (conta 506-679-8424, 1.217 visitas pagas em 90 dias, quase todas na `/lp/`: a `/lp/`
  fica no ar); **`/perguntas-frequentes/` é a página que mais aparece no Google** (74 mil impressões em 90 dias:
  refazer no mesmo endereço, com cuidado); **dois códigos de Analytics** (`G-97ZBVMVR1Y` no Tag Manager × `G-10HHN3PQP0`
  na propriedade da BMH). Já há **430 cliques no WhatsApp em 90 dias** medidos pelo próprio Analytics.
- **Feito pela API (07/10/2026):** Analytics com retenção de **14 meses**; mapa do site `wp-sitemap.xml` cadastrado no
  **Search Console** e no **Bing** (nenhum dos dois tinha); 8 páginas enviadas ao Bing; leitura pedida ao Bingbot: a home
  nova veio inteira, sem bloqueio.
- **Proteção da Hostinger:** depois de muitos testes seguidos, ela passou a bloquear **só o meu acesso** (504/307 em
  0,07 s, até no navegador). O site está no ar para os outros (conferido de fora) e o Bingbot lê normalmente. Regra:
  espaçar os testes nas páginas; usar as APIs sempre que der.
- **Clarity (bloco E):** o Jorge pediu à agência para ser administrador. Aguardando.
- **Perguntas novas para o Jorge:** quem cuida do anúncio do Google (conta 506-679-8424)? Quanto investe por mês? O
  `G-97ZBVMVR1Y` é de quem (agência)?

- **Decisão do Jorge (07/10/2026): a agência sai; o Claude assume a gestão do Google Ads e do Meta Ads, como na Nexo.**
  Escrito `saidas/site-novo/acessos-anuncios-passo-a-passo.md` (antes: acesso de administrador nas duas contas, pedido
  à agência; bloco F Google Ads no projeto `bmh-integracoes`; bloco G Meta com usuário do sistema "Claude BMH"; bloco H
  regras e teto). `scripts/google-ads-autorizar.py` adaptado da Nexo (conta 5066798424, `login-customer-id` opcional,
  `.env` com permissão 600).
- **Os dois Analytics, descoberto (07/10/2026), pela configuração pública das tags:** a tag Google **`GT-57SF42Z`**
  leva o Analytics da BMH (**`G-10HHN3PQP0`**) e o Google Ads (**`AW-958567409`**). O **`G-97ZBVMVR1Y`** é uma tag
  separada, de uma propriedade fora da conta da BMH (provavelmente da agência): é para ela que vão as duas configurações
  repetidas e o evento quebrado. Os números da BMH estão limpos.
- **Plano para a versão nova do Tag Manager (sem perder métrica):** a `GT-57SF42Z`, a conversão do Ads
  (`958567409`/`sySsCKHnuP8YEPGniskD`), o vinculador, o Pixel e o Clarity ficam **como estão**; entram os eventos novos
  (WhatsApp por página/botão/unidade, telefone, como chegar) e a mensagem/UTM; as tags do `G-97ZBVMVR1Y` saem (só
  depois de confirmar com o Jorge que essa propriedade não é da BMH). Testar em ambiente de pré-visualização, comparar
  os envios antes e depois, e publicar só com o "pode". Volta atrás: publicar a versão 3.

- **Lista única de liberações:** `saidas/site-novo/liberar-tudo-de-uma-vez.md` (07/10/2026), a pedido do Jorge. Conferido
  pela API antes: Tag Manager editar OK; desligadas no projeto: Perfil da Empresa (3 APIs + pedido de acesso, projeto
  **136521083780**), Data Manager, Google Ads API, PageSpeed (falta chave própria). `google-ads-autorizar.py` agora
  pede também `business.manage` (um "Permitir" só para Ads, conversões offline e Perfil da Empresa). Token do Meta já
  com permissões de Instagram, para não gerar outro depois. Mensagem pronta para a agência no fim do arquivo.

- **Velocidade da home nova (07/10/2026), medida pelo PageSpeed com a chave da BMH:** antes da limpeza, desempenho
  **46**, LCP 11,5 s, 1,3 MB (SEO **100**). O peso vinha de: Analytics da agência `G-97ZBVMVR1Y` (179 KB), MetForm
  (134 KB + React, sem nenhum formulário no site), Elementor e complementos carregando numa página que não é do Elementor.
- **Feito com o "pode" do Jorge (itens 2 e 3; o item 1, tirar o Analytics da agência, "ainda não"):**
  - **MetForm desativado** (lista de plugins antes em `saidas/site-novo/plugins-antes-2026-10-07.json`).
  - **Plugin Code Snippets 3.10.2 instalado** e snippet **id 5** "BMH · carregamento enxuto nas páginas nativas" ativo
    (cópia em `site/codigo/carregamento-enxuto.php`): nas páginas que não são do Elementor, não carrega Elementor nem
    complementos; na página inicial, tira também o CSS de blocos. Para desfazer: desativar o snippet 5.
  - Conferido: home com **zero** arquivo do Elementor; as 9 páginas antigas com o mesmo texto da cópia (contagem de
    widgets +20 em todas, igual, por causa do CSS regerado do Elementor 4.3) e com foto de tela igual (`/lp/` e
    `/convenios/`), sem erro de JavaScript.
  - **Depois:** desempenho **66**, 910 KB, 33 arquivos, FCP 2,9 s, LCP entre 3,8 e 9,6 s (varia), TBT 210 a 690 ms.
  - Próximo para velocidade: tirar o Analytics da agência (quando o Jorge liberar), fontes sem bloquear a primeira
    pintura, imagem do topo menor no celular e pré-carregada.
- **Arquivo de login do Google (cliente OAuth) estava na raiz:** movido para `~/.config/bmh/google-oauth-cliente.json`
  (600); `.env` com `GOOGLE_ADS_OAUTH_CLIENTE` e `GOOGLE_ADS_CUSTOMER_ID=5066798424`. Autorização
  (`scripts/google-ads-autorizar.py`) aberta no navegador do Jorge, esperando o "Permitir".
- **Perfil da Empresa:** o formulário de acesso pede para escolher um perfil; escolher **BMH Asa Sul** (o pedido vale para
  o projeto e cobre os dois). A lista mostra também um perfil da Nexo ("St. Tradicional Q 51"): **não** escolher esse.

- **Meta (07/10/2026):** o Jorge fez quase todo o bloco 4; **o token só será confirmado na semana que vem.** Quando vier:
  `bash scripts/guardar-chave.sh META_ADS_TOKEN`, mais o ID da conta de anúncios (`act_...`) e o ID do portfólio.
- **Autorização do Google (Ads + Data Manager + Perfil da Empresa):** a tela foi aberta, mas o "Permitir" ainda não
  chegou (sem `GOOGLE_ADS_REFRESH_TOKEN` no `.env`). Reabrir com `python3 scripts/google-ads-autorizar.py` quando o
  Jorge estiver no computador.

- **Google Auth Platform (07/10/2026):** a autorização foi bloqueada ("app em fase de testes", erro 403 access_denied).
  Para publicar o app, o Google pede página inicial e **política de privacidade**. Feito: política escrita com base na
  da Nexo (autorizado pelo Jorge), adaptada à BMH, com o parágrafo de medição dos anúncios com telefone e e-mail
  criptografados (para as conversões offline). Rascunho antigo do WordPress (id 3, texto-modelo de 2023) na lixeira;
  **política em rascunho, id 1336**, slug `politica-de-privacidade`. Fonte: `site/paginas/politica-de-privacidade.html`.
  Falta: o "pode publicar" do Jorge, o link da política no rodapé da home, e o Jorge preencher o Branding e publicar o app.
- **Diretriz do Jorge (07/10/2026): "o que estamos fazendo lá [na Nexo] é o que quero fazer na BMH"** (medição até
  agendou e atendido, origem do lead, conversões devolvidas ao Google e à Meta, relatório de anúncios, gestão das
  campanhas).

- **Google Ads conectado (07/10/2026):** o Jorge publicou o app "BMH Integrações" e autorizou; teste OK (API v25,
  conta "Brasília Medicina Hiperbárica" 5066798424). Novo `scripts/google-ads-ler.js` (só leitura). **Diagnóstico de
  entrada em `marketing/campanhas/google-ads-diagnostico-2026-10-07.md`:** ~R$ 3.300 a 3.800/mês, R$ 4.111 em 30 dias,
  690 cliques, 111 conversões (93 WhatsApp + 18 ligações), R$ 37 por contato; 2 campanhas gastando
  ([LEADS] maximizar conversões R$ 150/dia; [TRAFEGO] R$ 55/dia) e 2 "Avaliação" ativas sem impressão; 60% do gasto
  na palavra ampla "hiperbarica"; anúncio leva à `/lp/` (626 cliques) e à home (64). **Nada alterado.**

- **Política de privacidade NO AR (07/10/2026, "pode publicar"):** página 1336, `/politica-de-privacidade/` (200,
  conferida), link no rodapé da home (home 1333 reenviada).
- **A BMH usa o iGut (agenda/atendimento), ainda sem CRM** (Jorge, 07/10/2026). Caminho para "agendou" e "foi atendido"
  igual ao da Nexo: ler o iGut da BMH pela API (pedir credencial ao iGut) e, quando houver CRM, ligar a origem da
  conversa. Responde em parte a pergunta 13.
- **Letra:** o Jorge achou a fonte atual (Source Serif + Source Sans) "muito IA". Comparação de 4 opções em
  `saidas/site-novo/opcoes-de-letra.png` (A Libre Franklin, B Red Hat, C Lato, D Barlow). Aguardando a escolha.

- **Letra trocada para Libre Franklin (07/10/2026, escolha do Jorge, opção A):** títulos e números em 800, texto em 400,
  na home (1333) e na política (1336). Ajustes por causa da letra mais larga: menu do computador a partir de 1.180 px
  (reduzido até 1.519 px), itens do menu 15 px, título do topo 58 px no computador, botões da triagem 15 px.
  Conferido no ar: fonte carregada, peso 800 nos títulos, sem rolagem lateral (11 larguras), zero sublinhado.
  A prévia do quadro (artifact) continua com a letra antiga: o site no ar passou a ser a referência.

- **Espaçamentos corrigidos (07/10/2026, queixa do Jorge depois da troca de letra):** a causa era a regra `.bmh p{margin:0}`
  vencendo as margens de `.bmh-lead`, `.bmh-hero__sub` e `.bmh-chip` (mesma especificidade, vinha antes no arquivo mas
  ganhava pela classe do elemento). Regras de ritmo vertical com `.bmh .classe` (bloco "ritmo vertical" no CSS), botão do
  cirurgião sem quebra no computador. Conferido no ar: letra certa, sem rolagem lateral, zero sublinhado.
- **Memória atualizada com o "pode" do Jorge:** `identidade/design-guide.md` preenchido (cores, Libre Franklin, regras),
  `_memoria/empresa.md` (iGut, sem CRM), `_memoria/estrategia.md` (site novo, agência saindo, modelo da Nexo).

- **Conversão por página de entrada (GA4, 90 dias até 06/10/2026, cliques no WhatsApp ÷ visitas):** `/lp/` pago **17,7%**
  (895 visitas, 158 cliques); home antiga pago 15,7%, orgânico 28,6%; `/convenios/` pago 22,4%; `/lp/` orgânico 34,4%;
  **`/perguntas-frequentes/` orgânico 0,0% (270 visitas, nenhum clique)**: a página que mais aparece no Google não
  converte nada. Régua para a página de pós-operatório: superar os 17,7% da `/lp/` no tráfego pago, medido em experimento
  do Google Ads (metade para cada página).
- **iGut da BMH:** o Jorge disse que a chave já está no n8n (fluxo "Produção Diaria e Mensal BMH"). Falta definir como
  esta pasta acessa o n8n sem alcançar as credenciais das outras empresas.
- **Perfil da Empresa:** o Jorge não viu qual perfil escolher no formulário. Resposta: o primeiro, "Brasília Medicina
  Hiperbárica | BMH A..." (SGAS 613, Asa Sul).

- **Tag Manager versão 4 criada e testada, NÃO publicada (07/10/2026):** eventos `clique_whatsapp` (caso pela mensagem
  pronta + local do botão), `clique_telefone`, `clique_como_chegar` (unidade) para o Analytics da BMH. Nenhuma tag antiga
  mexida; ao abrir a página, envios iguais aos da versão 3; conversão do Ads intacta. Detalhes em
  `integracoes/tag-manager/README.md`. Aguardando o "pode" para publicar.
- **Para o Jorge (07/10/2026):** `saidas/site-novo/perguntas-frequentes-para-o-jorge.md` (13 perguntas, das buscas que
  levam à página) e `saidas/site-novo/briefing-pos-operatorio.md` (aprovar antes de escrever).

- **Tag Manager versão 4 PUBLICADA (07/10/2026, "PODE" do Jorge)** e conferida na versão publicada. GA4: eventos principais
  `clique_whatsapp` e `clique_telefone`; dimensões `caso`, `local_do_botao`, `unidade`. Volta atrás: publicar a versão 3.

- **Drive de marketing da BMH (08/10/2026):** pasta pública (`drive.google.com/.../1dtrI-wbrXkD7x81QqKTKmFx_8qPZNQsj`),
  445 arquivos mapeados. Aproveitado: ensaio profissional de 14/04/2025 → `identidade/fotos/ensaio-2025/` (12 fotos
  sem paciente) e `dados/fotos-com-paciente-nao-publicar/ensaio-2025/` (6 com pessoa deitada na câmara); logo em vetor
  → `identidade/logo-original/`. **Alerta:** o certificado digital e-CNPJ (`.pfx`) está em `Backup/Primeira IDV`
  (não baixado). Avisado ao Jorge.
- **Perguntas frequentes (08/10/2026):** respostas sugeridas no próprio arquivo, com fontes conferidas no PubMed em
  `marketing/conteudo/bmh-pagina-perguntas-frequentes-2026-10-08/fontes.md`. Aguardando o Jorge aprovar ou corrigir.
- **Google Ads (08/10/2026):** propostas em `marketing/campanhas/google-ads-propostas-2026-10-08.md`. As "Avaliação"
  são testes encerrados da agência. Os textos atuais prometem ("líder", "rápida cicatrização") e há lance em nomes de
  concorrentes. Nada alterado.
- **Preparado, NÃO no ar (08/10/2026):** home com letra declarada na própria página (tira 0,8 s de bloqueio) e foto do
  topo em WebP (132 KB → ~40 KB no celular), em `site/paginas/home.html`; `site/codigo/protecao-e-redirecionamentos.php`
  (`/home/` e autor → página inicial; lista de usuários da API só para logado). Mapa do site já não lista autor.
  Medição de hoje: nota 59, bloqueio de 1,6 s, quase todo das tags (a da agência sozinha: 0,5 s).
- **Jorge (08/10/2026):** "antes de ADS temos que deixar 100% a página": home com muita informação junta, sem clareza.
  Análise crítica e nova ordem em `saidas/site-novo/analise-critica-home-2026-10-08.md` (comparada com a home da Nexo no
  ar). Propostas do Google Ads aprovadas ("ok"), mas ficam para depois da home. Perguntas frequentes: faixa de sessões,
  1h30 e pressão (≥10 m de mergulho) respondidas; faltam roupa e curativo/dreno/cinta.
- **Logo oficial (08/10/2026):** "BMH" azul-marinho chapado (pasta LOGO NOVA, cartão de 2025). Exportado do vetor para
  `identidade/logo-original/bmh-logo-oficial*.png`, incluindo branco transparente para o rodapé. O degradê claro é antigo.
- **Ensaio de 2025 é todo na Asa Sul** (monoplace, multiplace e fachada da L2 Sul em menos de uma hora). As 6 fotos com
  pessoa deitada continuam fora do site até o Jorge confirmar, por escrito, quem é a pessoa.

- **Home versão 2 em RASCUNHO (08/10/2026, "Aprovo as mudanças no site"):** página **1352**, slug `inicio-v2`, arquivo
  `site/paginas/home-v2.html`. Nova ordem da análise crítica, fundo claro, fotos do ensaio de 2025 (ids 1342 a 1351),
  letra sem travar a tela, barra fixa só depois de rolar, 6 perguntas frequentes (com FAQPage nos dados estruturados).
  Conferida no celular e no computador: sem nada passando da largura, sem erro, busca de convênio funcionando. Passou
  pela `/revisar-texto`. A home no ar (1333) não foi tocada. Fotos de tela: `home-v2-celular-2026-10-08.jpg` e
  `home-v2-computador-2026-10-08.jpg`. Falta: o "pode" para trocar a página inicial.
- **Perfil da Empresa: pedido da BMH RECUSADO na hora (08/10/2026)**, "doesn't meet our criteria". Critérios do Google:
  perfil verificado há 60+ dias, site no perfil, pedido feito pelo e-mail dono/gerente do perfil. A Nexo foi aprovada
  em 06/10 (projeto 733610362322) e a autorização de lá enxerga os perfis da BMH, mas usar isso mistura as empresas:
  decisão do Jorge.
- **Respostas do Jorge (08/10/2026):** a BMH fornece roupa de algodão; não precisa trocar o curativo antes da sessão;
  cinta e dreno podem ficar. Logo oficial = "A" (o do site). As 6 fotos com pessoa deitada: Jorge disse que há
  autorização, mas o sistema bloqueou a mudança de pasta; ele mesmo move de `dados/fotos-com-paciente-nao-publicar/`.

- **Home versão 2, ajustes de SEO e GEO (08/10/2026):** fotos do topo e do pós-operatório trocadas (Dr. Alberto ao
  interfone; médica ao lado da câmara), a pedido do Jorge. Título principal com "em Brasília" (a busca nº 1 do site,
  "câmara hiperbárica brasília", e a home está na posição 2,6). Frase de entidade no topo ("A BMH faz..."), serviço e
  especialidade nos dados estruturados, imagem de compartilhamento (`bmh-compartilhar.jpg`, id 1358) e descrição de
  busca nova. Preparados, não no ar: `site/llms.txt` e `site/codigo/llms-txt.php`. As 6 fotos com pessoa deitada foram
  movidas para `identidade/fotos/ensaio-2025/` (autorização confirmada pelo Jorge em 08/10/2026).

- **Pronto para publicar, tudo em RASCUNHO (08/10/2026):** home 1352 (foto do pós-operatório trocada pela do
  profissional de verde; menu e links levando às páginas novas), pós-operatório 1359 (`/pos-operatorio-cirurgia-plastica/`),
  perguntas frequentes 1360 (17 perguntas; vai para `/perguntas-frequentes/` quando a antiga, 23, virar rascunho),
  Taguatinga 1365 (`/hiperbarica-taguatinga/`) e Asa Sul 1369 (`/hiperbarica-asa-sul/`). Molde comum em
  `site/paginas/_molde/`, montado por `scripts/montar-pagina.js` a partir de `site/paginas/fontes/`. Conferidas no
  celular e no computador (nada passando da largura, sem erro, dados estruturados válidos). Backup do estado do site
  antes da troca: `saidas/site-novo/antes-da-troca-2026-10-08.json` (página inicial era a 1333).
  **A publicação foi bloqueada pelo sistema de permissões** (pede ordem explícita do Jorge). Roteiro da troca:
  publicar 1359/1365/1369; 23 → rascunho com slug `perguntas-frequentes-elementor`; 1360 → slug `perguntas-frequentes`
  e publicar; 1352 → slug `inicio`, publicar e virar página inicial; 1333 → rascunho; instalar
  `protecao-e-redirecionamentos.php` e `llms-txt.php` no Code Snippets; conferir no ar; reenviar mapa do site ao
  Google e as URLs ao Bing.

- **Ajustes do Jorge (08/10/2026), ainda em rascunho:** página do pós-operatório com imagem gerada pela OpenAI
  (`identidade/fotos/geradas-ia/pos-operatorio-cama.png`, legenda "Imagem ilustrativa") e sem o item "infecção grave".
  Molde corrigido: os blocos de texto ficavam centralizados no computador, desalinhados das outras partes. Script de
  envio corrigido: reenviar sem `--titulo` trocava o título para "Página nova" (os quatro foram devolvidos).

- **PUBLICADO (08/10/2026, "pode publicar a home nova e as 4 páginas"):** home 1352 como página inicial, pós-operatório
  1359, perguntas frequentes 1360 (no mesmo endereço), Taguatinga 1365, Asa Sul 1369; 23 e 1333 em rascunho; códigos 6
  (proteção) e 7 (llms.txt) ativos. **Conferido no ar:** as 5 páginas respondem 200 com o título certo e dados
  estruturados; `/home/`, `/author/...` e `/?author=1` levam ao início (301); `/wp-json/wp/v2/users` dá 401; mapa do
  site com as 4 novas e sem as antigas. `/llms.txt` responde certo pulando o cache (o 404 antigo guardado pelo
  LiteSpeed expira sozinho). Cliques testados no ar com envio bloqueado (celular e computador): WhatsApp com conversão
  do Ads e `clique_whatsapp` (caso e local), telefone e "como chegar" com unidade. Mapa do site reenviado ao Google;
  5 URLs enviadas ao Bing. Velocidade no celular: home 70 (antes 59 a 66), SEO 100, acessibilidade 100;
  pós-operatório 81. Imagem de compartilhamento em todas.

- **Páginas antigas redirecionadas (08/10/2026, "pode" do Jorge):** `/tratamento/`, `/contato/`, `/institucional/` e
  `/medicos/` → início; `/alberto-jorge/` → `/hiperbarica-taguatinga/`; `/helio-ivan/` → `/hiperbarica-asa-sul/` (301,
  no código 6). As seis viraram rascunho (saíram do mapa do site; conteúdo guardado). Destinos escolhidos pelas buscas
  de cada uma no Search Console (ex.: "dr alberto jorge", 995 impressões). Conferido no ar; `/lp/` e `/convenios/`
  seguem no ar. Mapa reenviado ao Google; as 6 URLs antigas enviadas ao Bing.

- **Perfil da Empresa, 2º pedido EM ANÁLISE (08/10/2026):** caso **0-3334000041584**, prazo de 7 a 10 dias úteis
  (17 a 22/10/2026). O 1º foi recusado na hora; a pergunta "allowlisted project" deve ser respondida **No**. Detalhes e
  passos depois da aprovação em `integracoes/perfil-google/README.md`.

- **Painel da BMH, prévia pronta (08/10/2026):** pedido do Jorge antes de mexer no anúncio. Decisões: no n8n como o da
  Nexo, com usuário próprio da BMH; WhatsApp no celular (mede até o clique); iGut pela chave do n8n. Prévia com dados
  reais em `saidas/painel/painel-previa.html` (`integracoes/painel/`). **Achado:** outubro gastando ~R$ 230/dia
  (R$ 1.610 de 1 a 7/10), ritmo de ~R$ 7 mil no mês contra média de R$ 3,3 a 3,8 mil; teto mensal ainda não definido.
  Mudanças no Google Ads (faxina, textos, concorrentes em campanha separada para teste) **em espera** até o painel.

- **Painel versão 2 (08/10/2026):** mesmos blocos do da Nexo (resultado dos anúncios, jornada do lead, métricas de
  tráfego, todas as origens, mês contra o teto, dia a dia, quando os contatos chegam, campanhas com orgânico como linhas,
  anúncios, de onde vieram, termos de busca, orgânico, leitura automática), visões Todas/Anúncios/Orgânico.
  Teto no painel: **R$ 3.600/mês** (média de 12 meses, R$ 3.641). Prévia: `saidas/painel/painel-previa.html`.
- **Análise completa do Google Ads (08/10/2026):** `marketing/campanhas/google-ads-analise-completa-2026-10-08.md`.
  Achados: agência (Triunfo Digital) ainda mexendo (07/10, 21h26); outubro a R$ 230/dia; saúde não pode usar público
  montado pelo anunciante (remarketing, Customer Match, semelhantes), então o caminho é conversão "atendido" do iGut;
  notas de qualidade 3 a 4 nas genéricas; TRÁFEGO segmenta "presença ou interesse". **Mudança de orçamento bloqueada
  pelo sistema** até ordem explícita do Jorge.

- **08/10/2026, "Pode A":** orçamento do Google Ads reduzido e conferido: LEADS R$ 150 → **R$ 86/dia**, TRÁFEGO R$ 55 →
  **R$ 32/dia** (teto R$ 3.600/mês). Script: `scripts/google-ads-orcamento.js`. Outubro deve fechar perto de R$ 4.400.
- **Painel versão 3 (08/10/2026):** a página é a da Nexo (mesmo formato), com os dados da BMH no formato dela.
  Prévia `saidas/painel/painel-previa.html`. n8n: chave copiada para o `.env` da BMH por decisão do Jorge ("pode usar o
  mesmo"). Próximo: fluxos no n8n (grava o dia + página com login + iGut).

- **Painel versão 4 (08/10/2026):** "está como uma versão anterior": a cópia da pasta da Nexo era de 30/09; a página no
  ar (n8n, 07/10) é outra. Agora a fonte é a página viva (`integracoes/painel/nexo-pagina-referencia.html`) e
  `integracoes/painel/adaptar-pagina-nexo.py` refaz a da BMH sempre que a Nexo mudar. Proposta de estrutura do anúncio em
  `marketing/campanhas/google-ads-estrutura-proposta-2026-10-08.md` (3 campanhas, 6 temas, cada um com a sua página).
  Gráfico mostra o anúncio sem gasto de 23 a 28/09 (a confirmar com o Jorge).

- **Painel no ar no n8n (08/10/2026):** `automacao.cannlink.com.br/webhook/bmh-painel` com login; três fluxos (grava o dia
  6h10, página, iGut 3h20), sete tabelas BMH_*, quatro credenciais BMH. Histórico: anúncios, Analytics e busca desde
  01/09/2025; iGut desde set/2023 ("dá para pegar o histórico do iGut desde 2023?": sim, o iGut começa em set/2023).
  Sessões: ~1.100/mês em 2024, ~1.700 a 1.900/mês em 2026. Valor do iGut ainda não somado (confirmar regra). Detalhes em
  `integracoes/painel/README.md`.

- **08/10/2026, tarde:** valor do iGut = "o produzido" (histórico recarregado); fluxo antigo do iGut sem nenhum segredo
  escrito (17 passos no cofre, "pode usar o cofre"); **guardião montado e ativo em simulação** (7h30). No teste de hoje
  ele cortaria LEADS R$ 86 → R$ 60 e TRÁFEGO R$ 32 → R$ 22 (outubro fecharia em R$ 4.442 com R$ 118/dia) e avisou que a
  agência fez 14 alterações ontem. Decisão pendente do Jorge: ligar o guardião em modo real (teto e pausa) e o teto de
  outubro (manter R$ 3.600 ou aceitar ~R$ 4.400, como na opção A).

- **08/10/2026, "manter teto de 4400":** outubro com teto de **R$ 4.400** (BMH_config `teto_mes_2026-10`); de novembro em
  diante, R$ 3.600 (`teto_mes`). Guardião testado: não corta nada em outubro. Alterações da agência no Google Ads:
  07/10 21h26, 7 buscas bloqueadas (frase) em LEADS e TRÁFEGO (para que serve, o que é, como funciona, benefícios, laser,
  ozonioterapia, oxigênio domiciliar); 08/10 00h32, títulos do anúncio da TRÁFEGO regravados (mesmos textos).
- **08/10/2026, Telegram ligado ("aberto", "mandei o oi"):** robô @Bmh_alertas_bot no chat do Jorge. Guardião manda
  avisos e propostas com Aplicar/Ignorar (fluxo de botões com travas); resumo da manhã às 8h; alerta de falha em todos os
  fluxos BMH (inclusive o antigo de produção). Detalhes em `integracoes/painel/README.md`. iGut: valor produzido completo
  desde set/2023.
- **08/10/2026, decisões do Jorge:** "pode ligar o guardião do teto" → `guardiao_modo_teto = real` (corta orçamento ou
  pausa sozinho se o mês passar do teto); a regra de pausa segue em simulação, com Aplicar/Ignorar no Telegram, por 2
  semanas (rever em 22/10). Agência: **manter o acesso por enquanto**.
- **08/10/2026, reorganização do Google Ads pronta para aprovar** (modelo da Nexo, "sim" do Jorge para montar):
  `marketing/campanhas/google-ads-reorganizacao-2026-10-08/plano.md`. Grupos pelo que as pessoas buscam (termos de 90
  dias: genéricas = 61% do gasto; pós-operatório quase não é buscado). Validado no Google (303 mudanças, nada criado).
  Liga em 2 passos (novos ao lado → pausa os antigos quando aprovados); plano B em `desfazer.js`; régua de 7 dias: R$ 50
  por contato. **Nada aplicado ainda.**
- **08/10/2026 16h20, "pode aplicar a reorganização no Google Ads agora":** região A (DF + entorno, presença ou interesse);
  grupo de preço sem "valor/preço da sessão" (R$ 86 por contato em 3 anos). **Não aplicou:** o projeto `bmh-integracoes`
  (acesso Explorer da API) estourou o limite diário de operações com as validações do dia (`RESOURCE_EXHAUSTED`); volta
  09/10 às 4h. Aplicar depois disso: `aplicar.js --validar` e `--aplicar`. Leitura continua funcionando (painel e guardião ok).
  Para não repetir: pedir o nível Básico da API para o `bmh-integracoes` (15.000 operações/dia).
- **08/10/2026, nível Básico aprovado e reorganização APLICADA** (348 mudanças, lista em
  `marketing/campanhas/google-ads-reorganizacao-2026-10-08/aplicado.json`): Pacientes (LEADS) R$ 100 com 6 grupos novos,
  DF + entorno, presença ou interesse; Marca (TRÁFEGO) R$ 8; Concorrentes (teste 4 semanas) R$ 10; extensões novas.
  Anúncios em revisão do Google; grupos antigos seguem ligados até a aprovação; um vigia pausa os antigos quando todos
  estiverem aprovados e avisa no Telegram. **Medição:** 4 semanas a partir de 09/10 contra as 4 anteriores (metas no
  plano.md). **Régua:** custo por contato acima de R$ 50 em 7 dias → `desfazer.js --aplicar`. Rever ~16/10 e ~06/11.
- **08/10/2026, "pode medir e me avisar no Telegram":** fluxo "BMH · Anúncios · medição da reorganização" (quinta 8h20,
  15/10 a 05/11, dia do Jorge na BMH). Régua da 1ª semana ajustada: voltar só se passar de R$ 50 **e** ficar pior que antes (a Pacientes já estava
  em R$ 60 a 68 por contato nas duas semanas antes da mudança). Comparação conta só dias com anúncio (parada de 22 a 29/09).
- **08/10/2026 17h38:** os 8 anúncios novos foram aprovados pelo Google; os 4 grupos antigos (BMH, Institucional +
  Concorrentes, TESTE DE PALAVRAS na LEADS; BMH na TRÁFEGO) foram pausados e ficam como plano B. Aviso enviado no Telegram.

## Decisões tomadas

| Data | Decisão | Quem |
|---|---|---|
| 06/10/2026 | Refazer o site em bloco nativo, mantido pela API, com medição de ponta a ponta; Elementor só desligado no fim | Jorge (pedido) |
| 06/10/2026 | Tudo nasce rascunho; nada publicado sem ordem; Elementor intocado até a troca | Jorge (pedido) |
| 06/10/2026 | Proposta: tese "desde 2004" (fato do CNPJ); "pioneira" só com prova | Claude (aguarda Jorge, pergunta 1) |
| 06/10/2026 | Proposta: consertar o Tag Manager atual em vez de criar outro | Claude (aguarda Jorge) |

## Falta (próximos passos, em ordem)

1. **Jorge:** responder a seção 8 do plano (as ★ primeiro: 1, 3, 8, 12, 13, 18 a 22).
2. **Jorge:** gerar a senha de aplicativo do WordPress. **Claude:** criar `scripts/guardar-chave.sh` para ela
   entrar no `.env` pelo terminal (`WP_URL`, `WP_USUARIO`, `WP_SENHA_APP`); registrar na `seguranca-credenciais`.
3. **Jorge:** dar acesso de administrador, na conta Google dele, a Tag Manager, GA4, Search Console e Google Ads.
4. **Jorge:** decidir o que fazer com o erro do Instagram na home (só pelo painel do Elementor).
5. **Claude, fase 0:** `wp.js paginas`; cópia de segurança das 10 páginas (HTML + captura celular e computador);
   linha de base de velocidade; teste de tags com envio bloqueado (adaptar `testa-tags.js` da Nexo para a BMH:
   classe do link, ids de conversão); Search Console e Bing.

## Perguntas em aberto

Todas na seção 8 do `plano-site.md` (28 perguntas). Quando o Jorge responder, anotar aqui a resposta e a data,
e levar os fatos de valor duradouro para `_memoria/empresa.md` (com o ok dele).
- **09/10/2026, mensagens dos grupos da BMH (fluxo "Produção Diaria e Mensal BMH"):** tirado "MENSAGEM AUTOMATICA DE
  TESTE" das 4 mensagens das unidades; faltas das agendas com a mesma regra do relatório da diretoria (Faltou, Desmarcado,
  Desistiu). Backup antes: `~/.config/bmh/backup-fluxo-producao-bmh-2026-10-09-antes-ajuste.json`. Diagnóstico do iGut em
  `integracoes/igut/README.md`: o relatório mensal quebrava porque pede o mês inteiro à agenda (504); o certo é dia a dia.
  Em desenho (aguarda respostas do Jorge): mensal com produzido/faturado/a faturar/recebido e faltas (cobradas); diário da
  diretoria com ocupação, % de faltas, avaliações e comparação; mensagem de avaliações de amanhã nos grupos ADM.
- **09/10/2026, grupos (continuação):** regras do Jorge (falta = regra B; financeiro = produção do mês, como DRE; "a
  faturar" só o usado). Envio passou de 19h05 para o fim estimado das sessões (começa às 17h e espera). Prévias no
  Telegram: diário novo da diretoria (08/10) e mensal (setembro: 1.730 sessões, igual ao e-mail). Detalhes em
  `integracoes/grupos/README.md`. Avaliações: aguardando o suporte do iGut liberar a observação do cadastro na API.
- **09/10/2026, grupos no ar:** diário novo da diretoria no fluxo de produção (sai hoje no fim das sessões); mensal de
  setembro enviado ao grupo da diretoria (teste autorizado); recebido = particular (D+1) + convênio pago; mensal antigo
  desligado; histórico de execuções com dado de paciente desligado. Backups em `~/.config/bmh/`.
- **09/10/2026, painel da diretoria no ar** (`/webhook/bmh-diretoria`, login próprio que vai na mensagem mensal), histórico
  desde set/2023, corte de confiança nov/2024 para faturamento e faltas. Mensal agora curto, com link. Ver `integracoes/grupos/README.md`.
- **09/10/2026, painel da diretoria liberado:** mensagem curta de setembro com link e login enviada ao grupo da diretoria
  (autorizado pelo Jorge, depois dos testes). Próximo envio automático: 01/11 às 8h.
