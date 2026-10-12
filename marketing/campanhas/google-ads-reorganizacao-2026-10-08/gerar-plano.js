// Gera plano.md a partir de estrutura.js (o mesmo arquivo que o Google validou): nada é copiado à mão.
const E = require('./estrutura.js'), fs = require('fs'), L = [];
const pal = (g) => g.palavras.map(([t, m]) => (m === 'EXACT' ? '[' + t + ']' : '"' + t + '"')).join(' · ');
const grupo = (g) => { L.push('### ' + g.nome + '\n', '- **Página:** ' + g.url.replace('https://hiperbaricabrasilia.com.br', ''), '- **Buscas** ("frase", [exata]): ' + pal(g));
  if (g.negativas.length) L.push('- **Bloqueadas neste grupo** (vão para o grupo certo): ' + g.negativas.join(', '));
  L.push('- **Títulos:** ' + g.titulos.join(' · '), '- **Descrições:**', ...g.descricoes.map((d) => '  - ' + d), ''); };
L.push(`# Google Ads da BMH: reorganização para aprovar (08/10/2026)

> **Nada foi aplicado.** O Google conferiu tudo no modo "só validar" e aceitou as 335 mudanças. Para aplicar, basta o
> seu "pode aplicar". Modelo: o que deu certo na Nexo em 30/09 (tudo de uma vez, com plano B).

## O que muda, em 7 linhas

1. **Os grupos seguem o que as pessoas buscam.** Nos últimos 90 dias, "câmara hiperbárica" e "hiperbárica brasília" foram
   61% do gasto e 70 dos 114 contatos visíveis. Quase ninguém busca "hiperbárica pós-operatório" (R$ 17 em 90 dias).
2. **A busca ampla "hiperbarica" sai.** Entra por frase e exata. A frase "hiperbárica" continua pegando quase tudo que a
   ampla pegava; as grafias erradas que trouxeram contato ("hiberbarica", "câmara bariátrica", "câmara de oxigênio") entram.
3. **Região: DF inteiro e entorno**, também para quem está fora e busca Brasília (opção A do Jorge). Hoje: 22 km do
   centro e 10 km de Taguatinga, só quem está dentro.
4. **Cada grupo leva à sua página** (a \`/lp/\` antiga sai dos anúncios) e cada anúncio tem 15 títulos só com fatos.
5. **Orçamento igual no total (R$ 118/dia):** Pacientes R$ 100, Marca R$ 8, Concorrentes R$ 10.
6. **Extensões novas:** saem "Líder em OHB", "Oxigênio, Inovação, Vida!" e os links antigos.
7. **Plano B:** os grupos antigos ficam pausados, não apagados. Um comando desfaz tudo, inclusive a região.

## Como as buscas foram escolhidas e conferidas

- **Fonte:** os termos que as pessoas digitaram de fato na conta (10/07 a 07/10/2026, 715 buscas visíveis), com gasto e
  contato de cada um, mais o **Planejador de Palavras-chave do Google** (volume e preço do clique no DF; consultado com o
  acesso da Nexo, a pedido do Jorge, porque o projeto da BMH na API ainda tem só o acesso inicial).
- **Conflitos conferidos por programa:** nenhuma busca da proposta é bloqueada pelas negativas (as 43 de hoje e as novas);
  nenhuma das 715 buscas reais cai em dois grupos ao mesmo tempo.
- **Cobertura:** os grupos novos pegam as buscas que somaram R$ 3.301 e 105 dos 114 contatos visíveis. O resto (R$ 472,
  8,5 contatos) é o que já está bloqueado de propósito ("para que serve", "o que é", "rejuvenesce") ou sem relação.

## O mercado no DF (Planejador de Palavras-chave do Google, média de 12 meses)

- **Buscas genéricas:** "hiperbárica" ~720/mês, "câmaras hiperbáricas" ~320, "oxigenoterapia hiperbárica" ~140,
  "câmara hiperbárica valor" ~90, "hiperbárica taguatinga" ~50, "câmara hiperbárica df" ~40. Pós-operatório e feridas:
  ~10 cada variação (confirma os termos reais: quase ninguém busca assim). Asa Sul: abaixo de 10.
- **Concorrentes:** "centro hiperbárico de brasília" ~110/mês, "rinnovare" ~90, "oxi hiperbárica" ~70 + "oxihiperbarica" ~50.
- **Preço do clique para aparecer no topo:** R$ 2 a R$ 9 nas genéricas. **A BMH paga hoje R$ 9,40 por clique** (LEADS, 28
  dias), no teto da faixa: é o custo da nota de qualidade baixa.
- "ohb" sozinho ficou de fora: ~1.600 buscas/mês no DF, quase todas sem relação com a câmara.

## Como vamos medir (4 semanas depois contra as 4 antes, no painel)

| Métrica | Hoje | Meta |
|---|---|---|
| Nota de qualidade das buscas principais | 3 a 5 | 6 ou mais |
| Preço médio do clique (Pacientes) | R$ 9,40 | R$ 6 ou menos |
| Exibições perdidas por posição | 27,3% | abaixo de 15% |
| Custo por contato (Pacientes) | R$ 49 (LEADS, 28 dias) | R$ 40 ou menos; **acima de R$ 50 em 7 dias, volta tudo** |
| Concorrentes (teste) | R$ 33 por contato | até R$ 60, senão pausa |

## Público e região

- **Quem vê o anúncio:** quem busca no Google uma das palavras **estando no DF ou no entorno**, ou estando fora e
  mostrando interesse em Brasília ("presença ou interesse", como a TRÁFEGO faz hoje). Entorno: ` + Object.values(E.regioes).slice(1).join(', ') + `. Todos os dias, das 5h às 23h; celular, computador e tablet (88% do gasto é celular).
- **Sem lista de público:** anúncio de saúde não pode mirar remarketing, interesses ou listas de pacientes (regra do
  Google para saúde). Idade e gênero ficam só em observação (63% do gasto é em mulheres; 44% entre 35 e 54 anos).
- **Por que o DF inteiro:** nos 90 dias, Gama (R$ 13 por contato), Santa Maria (R$ 22), Recanto das Emas (R$ 28) e
  Planaltina (R$ 28), fora do raio da LEADS, chegaram pela TRÁFEGO (raio de 35 km). Como a TRÁFEGO vira só marca, sem
  essa troca esses lugares ficariam sem anúncio.
- **Entorno e quem está fora (opção A, Jorge, 08/10/2026):** em 12 meses, o entorno trouxe 58 contatos a R$ 18; outros
  lugares (Goiânia, outros estados), 53 a ~R$ 21, quase todos pela TRÁFEGO, que já usava "presença ou interesse".
- **Onde estão os contatos (90 dias):** Asa Sul 46 (R$ 42 cada), Plano Piloto 47, Asa Norte 28 (R$ 27), Taguatinga 18
  (R$ 25), Águas Claras 11, Ceilândia 5 (R$ 55), Samambaia 11, Guará 10, Sobradinho 3, Gama e Setor Leste 9.

## Como liga, para não ficar sem anúncio

1. Aplico: os grupos novos entram **ao lado** dos antigos (o Google revisa os anúncios novos, normalmente em horas).
2. Quando o Google aprovar todos, pauso os antigos.
3. **Regra dos 7 dias** (como na Nexo): se o custo por contato no painel passar de **R$ 50**, rodo o plano B e volta
   tudo como estava. O guardião segura o teto do mês o tempo todo.

## 1. Campanha Pacientes (a atual LEADS) · R$ 86 → R$ 100/dia

Nome mantido, para o painel comparar antes e depois. Lance continua "maximizar conversões" (WhatsApp e ligação).
Grupos antigos que serão pausados: BMH, Institucional + Concorrentes, TESTE DE PALAVRAS.
Bloqueadas na campanha: a marca (vai para a campanha Marca) e os concorrentes (vão para a campanha de teste).
`);
E.pacientes.grupos.forEach(grupo);
L.push(`## 2. Campanha Marca (a atual TRÁFEGO) · R$ 32 → R$ 8/dia

Grupo antigo pausado: BMH (misturava genéricas, marca e concorrentes, e disputava as buscas com a LEADS). Região e lance
("parcela de impressões": aparecer no topo quando buscam o nome) continuam como estão.
`);
E.marca.grupos.forEach(grupo);
L.push(`## 3. Campanha nova: Concorrentes (teste de 4 semanas) · R$ 10/dia

DF e entorno (presença ou interesse), mesmo idioma e horário da LEADS. Lance: maximizar cliques (como o teste da Nexo). **O anúncio não cita
nenhum concorrente** (regra da casa). Em 4 semanas, o painel mostra o custo por contato; acima de R$ 60, pausa.
`);
E.concorrentes.grupos.forEach(grupo);
const X = E.extensoes;
L.push(`## 4. Extensões (nas três campanhas)

- **Links:** ` + X.links.map((l) => l.texto + ' (' + l.d1 + '; ' + l.d2 + ')').join(' · ') + `
- **Frases de destaque:** ` + X.frases.join(' · ') + `
- **Trecho "${X.trecho.cabecalho}":** ` + X.trecho.valores.join(' · ') + `
- **Saem:** os links "Agende sua consulta!", "Fisiologia do tratamento" e "Convênios médicos"; as frases "Oxigênio,
  Inovação, Vida!" e "Líder em OHB"; o trecho antigo.
- **Continuam:** ligação, nome, logo e fotos.

## O que não muda

Horário (5h às 23h), lance, medição. As 6 conversões antigas da campanha inteligente são do próprio Google e a API não
deixa mexer; não registram nada (o lance já segue só WhatsApp e ligação).

## De onde vem cada fato dos textos

Todos estão nas páginas publicadas e aprovadas: médico em todas as sessões, desde 2004, Asa Sul e Taguatinga, todos os
dias das 7h às 19h, 50 convênios (home, perguntas frequentes); avaliação médica antes da 1ª sessão, curativo, cinta e
dreno, roupa de algodão (pós-operatório, perguntas frequentes); monoplace e multiplace, SGAS 613, L2 Sul (Asa Sul);
Setor C Norte e indicações reconhecidas pelo Conselho Federal de Medicina (Taguatinga). Sem preço, sem travessão, sem
superlativo, sem promessa de resultado.

## Arquivos

\`estrutura.js\` (tudo acima, em código) · \`aplicar.js\` (--validar, --aplicar, --pausar-antigos) · \`desfazer.js\` (plano B) ·
\`gerar-plano.js\` (gera este arquivo).
`);
fs.writeFileSync(__dirname + '/plano.md', L.join('\n'));
console.log('plano.md:', L.join('\n').split('\n').length, 'linhas');
