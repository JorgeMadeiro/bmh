# Google Tag Manager da BMH · GTM-PQZ32BC5

> Conta **6207699487** ("Site Brasília Medicina Hiperbárica"), contêiner **172366934**. A conta de serviço
> `bmh-site@bmh-integracoes.iam.gserviceaccount.com` tem permissão de **Publicar** (desde 07/10/2026). Mudança só com o
> "pode" do Jorge e com teste antes e depois (`scripts/testa-tags.js`, envios bloqueados, nunca gera conversão).
> Nome de versão descreve a mudança e a data, **sem citar "Claude"** (mesma regra da Nexo).

## O que existe (versão 3, publicada antes de 07/10/2026, montada pela agência)

| Tag | O que faz | Observação |
|---|---|---|
| 16 "Tag do Google" (`GT-57SF42Z`) | leva o **Analytics da BMH `G-10HHN3PQP0`** e o **Google Ads `AW-958567409`** | é o caminho certo; não mexer |
| 5 "[Contato] Whatsapp" (`awct`) | **conversão do Google Ads** `958567409/sySsCKHnuP8YEPGniskD` no clique em `api.whatsapp.com` ou `wa.me/` (acionadores 7 e 9) | a campanha aprende com ela; não mexer |
| 11 Vinculador de conversões | guarda o clique do anúncio | |
| 12 "Analises" e 15 "Tag Analytics" (`G-97ZBVMVR1Y`) | Analytics **de outra conta** (provavelmente da agência), configurado duas vezes | sair quando o Jorge liberar |
| 17 "Google Analytics evento do GA4" | evento com o endereço da página como nome, para o `G-97ZBVMVR1Y` | quebrado; sai junto |
| 14 Pixel da Meta `1526867428059043` | PageView | dono ainda não confirmado |
| 13 Clarity `m9kxjnnvgm` | gravações | projeto da agência; o Jorge pediu acesso |

## Versão 4 (07/10/2026): **publicada** com o "pode" do Jorge

"Eventos de clique: WhatsApp, telefone e como chegar (07/10/2026)". Só acrescenta (script:
`integracoes/tag-manager/versao-4-rascunho.js`):

- Variáveis prontas ligadas: Click Element, Click Classes, Click Text, Page Path.
- Variáveis 18 "BMH · Caso do botão (WhatsApp)" (lê a mensagem pronta do link: pos-operatorio, ferida, pedido-medico,
  mergulho, cirurgiao, unidade-asa-sul, unidade-taguatinga, convenio, duvida, geral, "sem mensagem" nas páginas antigas),
  19 "BMH · Local do botão" (barra-celular, triagem, cabecalho, topo, rodape, chamada-final, id da seção, pagina-antiga),
  20 "BMH · Unidade (como chegar)".
- Acionadores 21 WhatsApp, 22 telefone, 23 como chegar (clique em link).
- Tags 24 `clique_whatsapp` (caso, local_do_botao), 25 `clique_telefone` (local_do_botao), 26 `clique_como_chegar`
  (unidade, local_do_botao), todas para `G-10HHN3PQP0`.

**Teste de 07/10/2026 (ambiente Latest, envios bloqueados):** ao abrir, igual à versão 3. Cliques: triagem →
`clique_whatsapp` pos-operatorio/triagem + conversão do Ads; chamada final → geral/chamada-final + Ads; cirurgião →
cirurgiao/cirurgioes + Ads; `/lp/` → "sem mensagem"/pagina-antiga + Ads; telefone → `clique_telefone` topo; como chegar
→ `clique_como_chegar` taguatinga. "2×" e "(1p)" no teste são reenvio da ferramenta por causa do bloqueio.
Os casos do celular na home não abriram por causa da proteção da Hostinger (bloqueio do meu acesso), não da versão.

**Depois de publicar:** no GA4, marcar `clique_whatsapp` e `clique_telefone` como eventos principais e criar as dimensões
personalizadas `caso`, `local_do_botao` e `unidade`. **Voltar atrás:** publicar a versão 3.

**Publicada em 07/10/2026.** Conferido depois: `gtm.js` público com os três eventos; teste na versão publicada (triagem →
`clique_whatsapp` pos-operatorio/triagem + conversão do Ads; `/lp/` → "sem mensagem" + Ads). No GA4 (propriedade
418169293): `clique_whatsapp` e `clique_telefone` marcados como **eventos principais**; dimensões personalizadas
**Caso do botão** (`caso`), **Local do botão** (`local_do_botao`) e **Unidade** (`unidade`) criadas.

## Versão 7 (09/10/2026): **publicada** com o "pode" do Jorge

"Clarity: pausa o projeto antigo da agência, fica o da BMH (09/10/2026)" (script: `integracoes/tag-manager/versao-7-rascunho.js`).
A tag 28 "Microsoft Clarity - Official" (projeto **`yv1gceupsa`**, da conta do Jorge) entrou nas versões 5 e 6 pela
instalação automática do Clarity; as variáveis dela são nativas (Analytics Session ID e Client ID). A versão 7 só
**pausa a tag 13** (projeto `m9kxjnnvgm`, da agência, sem acesso para nós; o histórico dele fica com a agência).
**Teste:** antes, os dois Clarity carregavam juntos; depois de publicar, só o `yv1gceupsa`, com GA4, Ads e Meta iguais.
**Voltar atrás:** publicar a versão 6.

## Acessos (conferido em 09/10/2026)

- **Tag Manager:** jorgemadeirotorres@gmail.com é o único administrador. bmhiperbarica@gmail.com (muita gente usa) passou
  para Usuário na conta e **Leitura** no contêiner (só vê, não mexe). A conta de serviço tem Publicar, mas não mexe em usuários.
- **GA4** (conta 294905226, propriedade 418169293): foi para a lixeira em 09/10/2026 por volta de 00:12 e o Jorge
  restaurou no mesmo dia. No gerenciamento de acesso só tem gente da BMH. "Qual o Melhor Suplemento" (558222149) foi
  para a lixeira; "Grupo NEXO" (555910815) ficou lá e some em 13/11/2026.
- **Google Ads:** a agência entra pela conta de administração "MCC - Triunfo Dig." (969-748-3650, desde 04/08/2025,
  não é dona da conta). Fica enquanto ela cuidar das campanhas.
