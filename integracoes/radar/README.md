# Radar de concorrentes e notícias da BMH (15/10/2026)

B2 do bastão da Pessoal, aprovado pelo Jorge ("pode começar"). Fluxo **"BMH · Radar · concorrentes e notícias"**
(`mBwLYNgQIXDz2LYI`), todo dia às 6h41. Manual: `/webhook/bmh-radar?teste=1` (manda o aviso marcado TESTE).

**Traz:** páginas públicas dos concorrentes (Oxi Hiperbárica, com a de convênios; Infinita; CHB; HiperCure; Rinnovare;
Hospital Daher) e notícias do CFM e da SBMH (feeds), da ANVISA e da UHMS (páginas de notícias).
**Envia:** aviso no Telegram só quando há o que importa: mudança relevante num concorrente (preço, convênio, unidade,
serviço, horário, promoção), notícia do tema com resumo e, se valer, rascunho de post para aprovar; e site que não deu
para ler. Dia sem novidade não manda nada.
**Limites:**
- Leitura pela regra única (`~/.claude/skills/prospeccao/referencias/ritmo-e-robots.md`): robots.txt antes (com `*` e
  `$` lidos como o padrão manda), "MadeiroLeitor", 3 s entre pedidos, 429/503 com espera, 401/403/desafio = para e avisa.
- Texto limpo (sem HTML, script, menu) e enviado à IA como dado, com ordem de ignorar instrução de dentro do site.
- No máximo 6 leituras com IA por dia (teto de custo); o que sobrar fica para o dia seguinte. Modelo gpt-5.5, pela
  credencial "BMH · OpenAI · transcrição de áudio".
- Primeira leitura de uma página ou fonte só guarda. Mudança pequena (menos de 80 caracteres em frases de 25+) é ignorada.
- Nada é publicado; rascunho de post segue as regras da BMH (sem promessa, sem preço, indicações CFM/UHMS, número só
  com fonte, marcado [CONFIRMAR COM O JORGE]).
- Execução não guardada (texto grande). Na vigia de parados (26 h).

Tabelas: `BMH_radar_paginas` (`e6QpYasSwLVWh1MR`, texto de cada página) e `BMH_radar_itens` (`Z1036OyDW9TMMyQl`, notícias
já vistas). Código: `integracoes/radar/n8n/` (radar-le.js, radar-compara.js, radar-aviso.js), montado em
`integracoes/painel/n8n/montar.js` (fluxoRadar).

Primeira leitura em 15/10: 7 páginas de concorrentes e 81 notícias (CFM 1, SBMH 10, ANVISA 14, UHMS 56). Custo: medir
no painel de uso da OpenAI depois de um mês (estimativa: poucos reais por mês).
