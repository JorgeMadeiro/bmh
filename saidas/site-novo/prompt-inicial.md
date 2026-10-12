Vamos refazer o site da BMH (hiperbaricabrasilia.com.br) do jeito que foi feito no site da Nexo: sair do Elementor para páginas em bloco nativo do WordPress, mantidas daqui pela API, com medição de ponta a ponta. A BMH é pioneira em medicina hiperbárica em Brasília e o site dela tem que ser o melhor de todos os concorrentes, em conteúdo, em SEO, em aparecer nas IAs (GEO) e em análise de dados. É a marca de referência da hiperbárica em Brasília, e o site precisa mostrar isso com fatos, não com adjetivos.

**Antes de propor qualquer coisa, leia:**
1. `saidas/site-novo/diagnostico-2026-10-06.md`: o retrato do site atual, do Tag Manager e dos 5 concorrentes (Rinnovare, Infinita, CHB, Oxi Hiperbárica, HiperCure), já levantado. Reconfira só o que for decidir em cima.
2. `CLAUDE.md`, `_memoria/empresa.md`, `_memoria/estrategia.md`, `_memoria/preferencias.md` e `identidade/design-guide.md` (a identidade visual ainda não está definida, só o logo).
3. As skills: `site` (e o `licoes.md` dela), `seo` (e as `referencias/`), `revisar-texto`, `evidencia-clinica`, `seguranca-credenciais`, `anuncio-google` e `relatorio-ads`.
4. O método que deu certo na Nexo, só para **ler** (nunca copiar texto de lá; a voz e os fatos da BMH são outros): em `/Users/jorgemadeiro/Downloads/Nexo_Claude_VSL/`, os arquivos `site/plano-site.md`, `site/header.html`, `site/footer.html`, `site/css-identidade.css`, as pastas `integracoes/tag-manager/`, `integracoes/google-analytics/`, `integracoes/conversoes/`, `integracoes/bing/` e `integracoes/clarity/`, e os scripts `scripts/testa-celular.js` e `scripts/testa-tags.js`.

**O que eu quero desta primeira sessão: o plano, não o site pronto.** Entregue em `saidas/site-novo/plano-site.md`:

1. **Posicionamento e prova.** Como o site mostra que a BMH é a pioneira e a referência, só com fatos verificáveis: ano de fundação, formação e cargos dos médicos, duas unidades, horário, estrutura, sociedades. Liste cada fato que precisa da minha confirmação.
2. **Arquitetura do site novo.** As páginas, com o objetivo de cada uma e a busca que ela quer ganhar. No mínimo:
   - home;
   - uma página por indicação aceita (começando por pós-operatório de cirurgia plástica, que é ~90% da demanda);
   - uma página por unidade (Asa Sul e Taguatinga);
   - uma página para o cirurgião que indica;
   - médicos, com CRM;
   - convênios e reembolso;
   - perguntas frequentes;
   - blog.
3. **Medição de ponta a ponta.** A partir do Tag Manager atual (`GTM-PQZ32BC5`):
   - os eventos (WhatsApp, telefone, formulário, como chegar), com mensagem pronta por página e por unidade para saber a origem;
   - o padrão de UTMs (Instagram, Google, anúncios, cirurgião parceiro, QR na recepção);
   - Search Console, GA4, Bing Webmaster e Clarity;
   - como chegar até "agendou" e "fez a sessão".
   Diga o que já existe, o que falta e de quem são as contas hoje.
4. **SEO técnico, on-page e local.** Título, descrição e H1 de cada página. Dados estruturados (`MedicalClinic` por unidade, `Physician`, `FAQPage`). Dois perfis da empresa no Google. Nome, endereço e telefone iguais em todo lugar. Velocidade no celular.
5. **GEO (aparecer nas IAs).** Conteúdo que responde à pergunta do jeito que a IA cita, `llms.txt`, Bing, fontes e "revisado por".
6. **Ordem de execução em fases.** Cada fase com o que eu preciso fazer (acessos, senhas no `.env`, decisões) e o que você faz. O Elementor só é desligado no fim, depois que todas as páginas tiverem sido trocadas.
7. **Os erros do site atual** listados no diagnóstico, com a correção de cada um.

**Regras:**
- Nada é publicado sem eu mandar. Tudo nasce como rascunho.
- Não mexa nas páginas do Elementor: elas ficam no ar até a página nova correspondente ser aprovada e trocada.
- Todo dado clínico passa por `/evidencia-clinica`, e na dúvida você me pergunta. Sem promessa, sem tom estético, só indicações aceitas.
- Todo texto público passa por `/revisar-texto`, na voz da BMH. Nada reaproveitado da Nexo.
- Credencial só no `.env`; nunca peça senha no chat.
- Investigue antes de perguntar. Quando perguntar, junte as perguntas numa lista só, já com o que você achou.
- Deixe rastro: mantenha `saidas/site-novo/andamento.md` com o que foi feito, o que falta e as decisões, para a próxima sessão continuar de onde parou.

Sou leigo em tecnologia: explique as escolhas em linguagem simples, com o custo e o benefício de cada opção.
