# API do Perfil da Empresa (Google Business Profile) · BMH

> **Pedido em análise desde 08/10/2026.** Caso de suporte do Google **0-3334000041584**. Prazo informado: 7 a 10 dias
> úteis (por volta de **17 a 22/10/2026**). A resposta chega por e-mail na conta dona dos perfis; se o Google pedir algo,
> responder no próprio caso.

## Histórico

- **08/10/2026, 1º pedido: recusado na hora** ("doesn't meet our criteria"). Causa provável: na pergunta "Does your
  organization currently have an active, allowlisted Google Cloud Project ID?" a resposta certa é **No** (o projeto
  aprovado é o da Nexo, outra empresa).
- **08/10/2026, 2º pedido:** pela conta dona dos perfis, empresa "BMH Asa Sul", perfil verificado há mais de 60 dias
  (Yes), projeto allowlisted (**No**). Foi para análise.

## Dados do pedido

| | |
|---|---|
| Projeto do Google Cloud | `bmh-integracoes` · **número 136521083780** |
| Perfis | Asa Sul e Taguatinga (o acesso vale para o projeto, não por unidade) |
| Site | `https://hiperbaricabrasilia.com.br` (cadastrado nos dois perfis) |
| Tipo | Basic API Access, uso próprio |

**Como saber se aprovou:** chamar `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` com o token do
projeto. Cota 0 (erro 429 com `quota_limit_value: "0"`) = não aprovado; 200 ou 403 de permissão = aprovado.

## Depois da aprovação

1. Ativar no projeto as APIs do Perfil da Empresa (Account Management, Business Information, Performance e a
   "Google My Business API" v4, das avaliações e postagens): clique do Jorge no console.
2. A autorização OAuth do Google Ads da BMH (`GOOGLE_ADS_REFRESH_TOKEN`) já inclui `business.manage`: testar com ela.
3. Usar: nota e avaliações na home ("O que dizem no Google"), números do perfil (ligações, rotas, cliques no site) no
   relatório, respostas às avaliações com aprovação humana.
4. Apontar o "site" de cada perfil para a página da própria unidade, com UTM:
   `/hiperbarica-asa-sul/?utm_source=google&utm_medium=organic&utm_campaign=perfil-asa-sul` e o mesmo para Taguatinga.
   Nunca usar o projeto ou a autorização da Nexo para os perfis da BMH.
