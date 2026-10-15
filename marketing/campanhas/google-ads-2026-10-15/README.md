# Google Ads da BMH · ajustes de 15/10/2026

Tudo com o "pode" do Jorge, pela API, com simulação antes (validateOnly). Estratégia em
`marketing/estrategia-site-e-google-ads-2026-10-15.md`.

| O quê | Script | Resultado |
|---|---|---|
| WhatsApp do link "Agende sua consulta!" trocado pelo oficial (61) 3346-6005 (saiu o 98345-2021) | `trocar-whatsapp-sitelink.js` | aprovado. Endereço com acento codificado dá erro 500 no Google Ads: mensagem sem acento |
| "Clique em ligar" do anúncio deixou de contar como contato (meta CONTACT/CALL_FROM_ADS); conversões antigas de Maps e campanha inteligente já não contavam | `aplicar-ajustes.js` | contato = WhatsApp do site + ligação de verdade |
| Lista de negativas "BMH · negativas gerais (15/10/2026)", 30 palavras, nas 3 campanhas | `aplicar-ajustes.js` | |
| Links do anúncio novos, direto nas páginas (Pós-operatório, 50 convênios, Asa Sul, Taguatinga, Perguntas); saíram "Fisiologia do tratamento" e "Convênios médicos" | `aplicar-ajustes.js` | |
| Telefone (61) 3346-6005 e lista de serviços só com indicações do CFM | `aplicar-ajustes.js` | |
| Frases de destaque com fatos (saíram "Oxigênio, Inovação, Vida!" e "Líder em OHB") e HiperCure na campanha de concorrentes | `frases-e-concorrentes.js` | |
| Saíram as 15 palavras "pouca busca" (RARELY_SERVED); as 2 sugeridas pelo Planejador (~10 buscas/mês) também caíram como pouca busca e saíram | `palavras-pouca-busca.js` | conta só com palavras que rodam |
| 8 imagens sem paciente (5 horizontais, 3 quadradas) nas 3 campanhas (imagem não liga na conta: UNSUPPORTED_FIELD_TYPE) | `imagens.js` | recortes conferidos à vista em `imagens/` |
| Endereço das unidades pelas fichas do Google: removida a campanha inteligente pausada "Medicina Hiperbárica" (Triunfo, R$ 0 em 30 dias) e a ligação antiga vazia; criada "BMH · fichas do Google (Asa Sul e Taguatinga)" | `endereco-perfil.js` | entraram só as 2 fichas da BMH (place ids conferidos) |
| Anúncio novo no grupo "Câmara hiperbárica · Brasília", título 1 fixo "Câmara Hiperbárica em Brasília" | `anuncio-novo.js` | em revisão; o antigo fica ativo até a aprovação e depois é pausado (vigia em segundo plano) |

Guardião: o teste de concorrentes (campanha 24333599216) não recebe proposta de pausa até 05/11 (`EM_TESTE` em
`integracoes/painel/n8n/guardiao-decide.js`).
