# Fontes e revisão: página da equipe médica (rascunho, 15/10/2026)

Página: `site/paginas/fontes/equipe-medica.html` (montada em `site/paginas/equipe-medica.html`). Endereço sugerido
`/equipe-medica/`. Plano: item 13 da `marketing/seo/auditoria-seo-geo-2026-10-15.md`. Nada foi enviado ao WordPress.

## Briefing travado

- **Intenção:** autoridade. **Ação principal:** agendar pelo WhatsApp (mensagem `geral`). Secundária: médico que
  encaminha (mensagem `cirurgiao`, no topo e no bloco do molde).
- **Para quem:** quem procura os nomes dos médicos no Google (384 exibições de "alberto jorge" e variações em 90 dias)
  e o paciente que quer saber quem cuida dele antes de agendar.
- **SEO:** título "Equipe médica | BMH Brasília Medicina Hiperbárica" (49 caracteres); descrição "Direção médica da BMH:
  Dr. Jorge Madeiro, Dr. Hélio Ivan e Dr. Alberto Jorge. Médico em todas as sessões de câmara hiperbárica, na Asa Sul e
  em Taguatinga." (155 caracteres).

## De onde vem cada frase

| Frase | Fonte |
|---|---|
| médico em todas as sessões; avalia antes, acompanha, responde na hora | `_memoria/empresa.md` (Jorge, 06/10/2026); mesma frase das páginas das unidades |
| quem acompanha são médicos da equipe; direção responde pelos protocolos | `_memoria/empresa.md`, "Quem atende nas sessões" |
| três diretores com pós-graduação em medicina hiperbárica no Brasil; Dr. Jorge também no exterior | `_memoria/empresa.md`, "Formação da direção médica" |
| Dr. Jorge: pós no Brasil pela Santa Casa e *The UHMS Program for Advanced Training in Hyperbaric Medicine*, nos EUA | `_memoria/empresa.md`; formação UHMS concluída (Jorge, 15/10/2026). Só nesta página: na home e em peça para paciente, UHMS não aparece |
| Diretoria da Sociedade Brasileira de Medicina Marítima e Hiperbárica, chapa 2026/27 | `_memoria/empresa.md` |
| CRM e RQE (só número) | `_memoria/empresa.md`, decisão do Jorge de 06/10/2026 |
| (fora desta página) Dr. Hélio Ivan na BMH desde 2004 | tirado: só um dos três teria a informação (regra do padrão igual) |
| primeira clínica particular de OHB de Brasília, desde 2004 | `_memoria/empresa.md` |
| endereços, horário (todos os dias, 7h às 19h), 50 convênios, bairros perto de Taguatinga | `_memoria/empresa.md`, `site/dados/schema-home.json`, página de Taguatinga; endereço de Taguatinga como o Jorge mandou |
| recepção responde pelo WhatsApp e confere o convênio | página das unidades |
| responsável técnico responde pela unidade perante o CRM-DF | regra do CFM sobre diretor técnico (fato geral, sem número) |
| foto: 7 médicos na sala das monoplace, Asa Sul, 2025 | `identidade/fotos/README.md` (ensaio de 12/04/2025, equipe autorizou o uso) |

## Padrão igual para os três diretores (Jorge, 15/10/2026)

Os três cartões têm a mesma estrutura, o mesmo tamanho e a mesma ordem: nome, cargo (e unidade da responsabilidade
técnica, quando há), CRM e RQE, "Pós-graduação em medicina hiperbárica." e "Integra a direção médica, que responde
pelos protocolos da BMH.". Diferença só no que é fato de cada um (cargo, unidade, números). O que só o Dr. Jorge tem
(formação nos EUA, diretoria da sociedade) ficou numa nota comum, curta e neutra, abaixo dos cartões, sem destaque
visual. Os dados estruturados seguem o mesmo padrão nas três descrições.

## Revisão em sete passadas

1. **Clareza:** "intercorrência" virou "imprevisto" (duas vezes); CRM e RQE explicados numa nota curta.
2. **Voz:** "a BMH", "a equipe", "a direção médica"; nenhum "eu"; sem tom de spa.
3. **E daí?:** protocolos da direção viram "o mesmo padrão nas duas unidades, em qualquer dia e horário"; médico na
   unidade vira "se sentir desconforto, quem responde é um médico, ali mesmo".
4. **Prova:** só o que está na tabela acima. Tirado "sem precisar esperar alguém chegar" (comparação implícita com
   outra clínica).
5. **Específico:** nomes, cargos, números de registro, endereço completo, horário, número de convênios.
6. **Emoção:** segurança (médico presente) e transparência (como conferir o CRM no site do CFM).
7. **Zero atrito:** o que acontece depois do clique ("a recepção responde pelo WhatsApp, confere o seu convênio e marca
   a avaliação"); qual unidade fica mais perto; telefone com `tel:` no topo.

Conferências: três cartões no mesmo padrão; sem travessão; sem "plantonista", "plantão", "referência", "melhor", "garantido" ("Excelência" só no
nome do prédio de Taguatinga); nenhuma frase sugere que o paciente será atendido por um diretor (a pergunta é "Quem
acompanha a minha sessão?"); UHMS só na página da equipe (confirmada); sem preço; sem `&&`.

## Medição (seção 2 da estratégia)

WhatsApp só com `{{wa:geral}}` e `{{wa:cirurgiao}}`; classes `bmh-head`, `bmh-hero`, `bmh-final`, `bmh-foot`,
`bmh-fix` vêm do molde, sem mudança; seções com `id`: `equipe`, `direcao`, `clinica`, `perguntas`. Não há bloco
`bmh-tri` (triagem), como nas páginas das unidades. Nenhum link de mapa (não gera rota falsa). Telefone com `tel:`.

## Antes de publicar

- Nenhuma marca [CONFIRMAR COM O JORGE] pendente no texto.
- Enviar as fotos novas (`bmh-equipe-medica-sala-monoplace-800.webp` e `-1200.webp`) junto com a página.
- Pôr a página no menu ou no rodapé (o molde ainda não tem link para ela) e ligar o redirecionamento antigo
  `/alberto-jorge/` para `/equipe-medica/` (decisão do Jorge).
- Conferência da seção 2 da estratégia depois de publicada.
