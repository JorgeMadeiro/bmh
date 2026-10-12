# Site da BMH: diagnóstico de partida (06/10/2026)

> Levantado numa sessão do workspace da Nexo, a pedido do Jorge, para servir de ponto de
> partida ao projeto do site novo da BMH. Fontes: API pública do WordPress, HTML das páginas,
> contêineres públicos do Tag Manager, mapas do site, robots.txt e Bing. Tudo lido em
> 06/10/2026, do lado de fora (sem login). Reconferir antes de decidir.

## 1. O site da BMH hoje

- **Endereço:** https://hiperbaricabrasilia.com.br · WordPress, tema Astra, **Elementor Pro**
  (+ ElementsKit, Stratum, Envato Elements), formulário **MetForm**, **Site Kit** do Google.
  Hospedagem Hostinger (CDN `hcdn`) com LiteSpeed Cache. Resposta rápida (0,34 s).
- **10 páginas, todas do Elementor** (`elementor_canvas`): home (36), institucional (17),
  tratamento (19), medicos (21), perguntas-frequentes (23), convenios (25), contato (27),
  helio-ivan (281), alberto-jorge (291), lp (925). Última edição: 19/06/2025. **Nenhum post.**
- **SEO:** título da home "Brasilia Medicina Hiperbarica" (sem acento, sem o que é nem onde);
  **sem descrição**, **sem H1** na home, sem tags de compartilhamento (og), **sem dados
  estruturados**, sem plugin de SEO, 3 de 4 imagens da home sem texto alternativo. Mapa do site
  nativo (`/wp-sitemap.xml`, 12 endereços, inclui 2 páginas de autor). Sem `llms.txt`.
- **Bing:** não apareceu contagem de páginas indexadas para a BMH (os concorrentes mostram de
  50 a 2.200). Conferir no Bing Webmaster: é o índice que o ChatGPT consulta.
- **WhatsApp:** link `wa.me/556133466005` **sem mensagem pronta** (não dá para saber de onde veio
  a conversa). Telefone único (61) 3346-6005 para as duas unidades. E-mail contato@.
- **Horário divulgado:** domingo a domingo, 7h às 19h.
- **Endereços:** Asa Sul: SGAS 613, Conjunto E, L2, Complexo Médico Hospitalar, Bloco A,
  1º subsolo. Taguatinga: Prédio Prime Excelência Médica, Torre D, St. C Norte.

### Problemas de conteúdo encontrados (para corrigir no site novo)

1. **Abertura da home errada:** "Cuide da sua saúde! Nós te ajudamos a manter os exames em dia"
   (texto de modelo, nada a ver com hiperbárica).
2. **Tempo de casa divergente:** home "18 anos", institucional "mais de 20 anos"; a página do
   Dr. Hélio Ivan diz diretor técnico desde 2004. **Confirmar o ano de fundação com o Jorge.**
3. **Pós-operatório de plástica (~90% da demanda) não aparece na home.** Só a landing page cita
   "pós cirúrgico", junto de pé diabético, feridas, infecções, queimaduras e radiação.
4. **Taguatinga "Em breve"** ainda aparece na página de convênios e na do Dr. Hélio Ivan.
5. **"Mais de 50 convênios"** sem lista legível (provavelmente logos em imagem).
6. **Dr. Jorge Madeiro** aparece como "pós-graduando" e com "experiência clínica internacional
   na Mayo Clinic": confirmar a redação atual (a memória diz formação pela Santa Casa e UHMS
   PATH, e diretoria da Sociedade Brasileira de Medicina Marítima e Hiperbárica, chapa 2026/27).
7. **Sem CRM visível** dos médicos nem do diretor técnico (publicidade médica pede nome e CRM
   do diretor técnico; conferir a regra vigente do CFM).
8. **Afirmações clínicas a conferir** com `/evidencia-clinica` e com o Jorge: "aumento de 20
   vezes" do oxigênio no sangue (FAQ), o parágrafo "20% do ar é oxigênio… sobrando 21%"
   (contraditório, página tratamento), "sessões de 90 minutos, pressão de mergulho de 15
   metros", "Pronto Socorro p/ Mergulho", "câmaras de última geração certificadas pela Anvisa".
9. Páginas de médico com slug sem acento e título técnico ("helio-ivan – …").

## 2. Tag Manager da BMH (`GTM-PQZ32BC5`, contêiner público)

- Google Analytics 4 **`G-97ZBVMVR1Y`** (2 tags de configuração e 1 evento) e uma tag Google `GT-57SF42Z`.
- **Google Ads:** uma conversão (`awct`) que dispara no **clique de link para WhatsApp**
  (`wa.me/` e `api.whatsapp.com`), com o vinculador de conversões.
- **Pixel da Meta** em tag de HTML personalizado.
- **Falta:** saber de quem são as contas (agência? a BMH?), mensagem pronta por página para
  medir origem, evento de telefone, de formulário e de "como chegar", UTMs padronizadas,
  conversões que cheguem a agendamento e a paciente atendido.

## 3. Concorrentes (mesma régua)

| | BMH | Rinnovare | Infinita | CHB | Oxi Hiperbárica | HiperCure |
|---|---|---|---|---|---|---|
| Plataforma | WP + Elementor | WP + Elementor + Yoast | Next.js na Vercel | WP + Elementor + WP Rocket | WP + Elementor | WP + Elementor |
| Título da home | só o nome | só o nome | serviço + "Brasília" | nome + "Brasília" | serviço + feridas + Brasília | só o nome |
| Descrição | não | sim (genérica) | sim | não | sim (quebrada) | não |
| H1 | não | nome | slogan | feridas | não | não |
| Dados estruturados | não | sim (Yoast) | não | não | não | só FAQ |
| `llms.txt` | não | **sim** | não | não | não | não |
| Endereços no mapa | 12 | 8 | sem mapa | 4 | 27 | 11 |
| Blog | 0 posts | 1 ("Olá mundo") | não | 0 | ~10 posts parados (2023) | 4 posts (último 16/09/2025) |
| WhatsApp com texto | não | sim | sim | sim | só pela página /convert | não |
| Medição | GA4 + Ads + Pixel | 2 GTM, GA4, Ads, Pixel | GTM + Ads + Clarity | GTM + Ads | 7 conversões do Ads | nenhuma |
| Bing (resultados) | sem contagem | ~50 | ~50 | ~51 | ~2.200 | ~50 |
| Fala de pós-operatório de plástica | não (home) | não | não | sim | sim | sim (blog) |
| Diferencial que cita | pioneira, SBMH, 2 unidades | monoplace, protocolo RRI | "há 20 anos", nutrologia, mono e multiplace, depoimentos | feridas, SBMH, Lago Norte e Taguatinga | estomaterapia, câmaras de acrílico com TV, convênios e reembolso | Águas Claras, casos clínicos |

**Leitura:** nenhum concorrente tem página por indicação, página por unidade bem feita, página
para o cirurgião que indica, dados estruturados de clínica médica, conteúdo constante nem
medição até o agendamento. **A barra é baixa: o espaço de "melhor site de hiperbárica de
Brasília" está vago.** Quem mais se aproxima em SEO é a Oxi Hiperbárica (mais páginas
indexadas, título descritivo, blog, ainda que parado). A Infinita reivindica "há 20 anos" e
"referência": disputa direta com o "pioneira" da BMH, que precisa de prova (ano de fundação).

## 4. Buscas e IAs

- Numa busca de IA (feita dos EUA) e no Bing, para "câmara hiperbárica Brasília",
  "oxigenoterapia hiperbárica Brasília" e "hiperbárica pós-operatório cirurgia plástica
  Brasília", **nenhuma clínica de Brasília apareceu** nos primeiros resultados: só conteúdo
  genérico (Tua Saúde, SBMH, Wikipedia). É um indício, não uma medição do Google brasileiro.
  O Google local (mapa) precisa ser olhado no Search Console e no Perfil da Empresa.

## 5. O que já existe de método, no workspace da Nexo (ler, não copiar texto)

`/Users/jorgemadeiro/Downloads/Nexo_Claude_VSL/`:
- `.claude/skills/site/` (como o site foi refeito em bloco nativo, peças de layout, lições 1 a 49)
- `site/plano-site.md` e `site/` (peças `header.html`, `footer.html`, `css-identidade.css`)
- `integracoes/tag-manager/`, `integracoes/google-analytics/`, `integracoes/conversoes/`,
  `integracoes/bing/`, `integracoes/clarity/` (medição, UTMs, origem do clique no WhatsApp)
- `scripts/testa-celular.js`, `scripts/testa-tags.js` (testar visual e tags antes e depois)
