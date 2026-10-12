# UTMs da BMH: links prontos

> Criado em 12/10/2026 a partir da tabela de UTMs do `plano-site.md` (seção "Padrão de UTMs"), com os endereços que
> estão no ar hoje (o plano ainda cita `/unidade-asa-sul` e `/unidade-taguatinga`; no ar são `/hiperbarica-asa-sul/` e
> `/hiperbarica-taguatinga/`). Formato em tabela simples para levar depois a um CRM.
> **Regra:** tudo minúsculo, sem acento, palavras com hífen; sempre `utm_source`, `utm_medium` e `utm_campaign` (quando
> houver ação). Etiqueta nova entra primeiro aqui, nunca inventada na hora.

| origem | utm_source | utm_medium | utm_campaign | página de destino | link pronto | observação |
|---|---|---|---|---|---|---|
| Bio do Instagram | instagram | bio | (vazio) | home | `https://hiperbaricabrasilia.com.br/?utm_source=instagram&utm_medium=bio` | se a bio apontar direto para o WhatsApp, usar mensagem própria ("Oi, BMH! ...") no lugar da UTM |
| Stories ou post com link | instagram | stories | `<tema>` | página do tema | `https://hiperbaricabrasilia.com.br/<pagina>/?utm_source=instagram&utm_medium=stories&utm_campaign=<tema>` | trocar `<tema>` por uma palavra, ex.: `pos-operatorio` |
| Perfil do Google, Asa Sul | google | perfil | asa-sul | /hiperbarica-asa-sul/ | `https://hiperbaricabrasilia.com.br/hiperbarica-asa-sul/?utm_source=google&utm_medium=perfil&utm_campaign=asa-sul` | campo "site" do perfil da unidade |
| Perfil do Google, Taguatinga | google | perfil | taguatinga | /hiperbarica-taguatinga/ | `https://hiperbaricabrasilia.com.br/hiperbarica-taguatinga/?utm_source=google&utm_medium=perfil&utm_campaign=taguatinga` | campo "site" do perfil da unidade |
| Google Ads | google | cpc | `{campaignid}` | a do anúncio | modelo de rastreamento: `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}` | com a marcação automática (`gclid`) ligada na conta |
| Anúncios da Meta | meta | anuncio | `{{campaign.name}}` | a do anúncio | parâmetros de URL: `utm_source=meta&utm_medium=anuncio&utm_campaign={{campaign.name}}&utm_content={{ad.id}}` | anúncio que abre o WhatsApp direto leva mensagem própria ("Olá, BMH! ...") |
| Cirurgião parceiro | cirurgiao | indicacao | `<codigo-do-cirurgiao>` | /pos-operatorio-cirurgia-plastica/ | `https://hiperbaricabrasilia.com.br/pos-operatorio-cirurgia-plastica/?utm_source=cirurgiao&utm_medium=indicacao&utm_campaign=<codigo>` | código é sigla combinada (ex.: `dr-abc`), nunca nome de paciente; vai no cartão com QR |
| QR na recepção, Asa Sul | qr | impresso | recepcao-asa-sul | avaliação no Google ou guia do paciente | `<endereco>?utm_source=qr&utm_medium=impresso&utm_campaign=recepcao-asa-sul` | não é para agendar (quem está na recepção já agendou) |
| QR na recepção, Taguatinga | qr | impresso | recepcao-taguatinga | avaliação no Google ou guia do paciente | `<endereco>?utm_source=qr&utm_medium=impresso&utm_campaign=recepcao-taguatinga` | idem |
| Bing Places | bing | perfil | (vazio) | home ou página da unidade | `https://hiperbaricabrasilia.com.br/?utm_source=bing&utm_medium=perfil` | |
| Doctoralia e diretórios | `<diretorio>` | perfil | (vazio) | home ou página da unidade | `https://hiperbaricabrasilia.com.br/?utm_source=<diretorio>&utm_medium=perfil` | ex.: `doctoralia` |

## Códigos de cirurgião em uso

| código | quando foi criado | onde foi entregue (cartão, mensagem) |
|---|---|---|
| (nenhum ainda) | | |
