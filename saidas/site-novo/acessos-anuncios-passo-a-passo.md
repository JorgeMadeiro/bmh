# Anúncios da BMH (Google e Meta): passo a passo para o Claude assumir a gestão

> **Use a lista única `liberar-tudo-de-uma-vez.md` (07/10/2026):** ela junta o que falta deste arquivo e do outro, já descontando o que está feito. Nomes do app passaram a ser `BMH Integrações`.

> Escrito em 07/10/2026. Decisão do Jorge: a agência sai e a gestão do Google Ads e do Meta Ads passa para o
> Claude, do mesmo jeito que foi feito na Nexo. Mesmas regras do outro passo a passo: **nenhuma senha ou chave
> no chat**; tudo que é segredo entra pelo terminal (`bash scripts/guardar-chave.sh NOME`) ou fica em
> `~/.config/bmh/`. Quando terminar um bloco, escreva "feito o bloco F" (ou G, H).

**O que já sabemos (pelos dados de 07/10/2026):** há anúncio do Google rodando na conta **506-679-8424**, levando à
`/lp/` (1.217 visitas pagas em 90 dias, 212 cliques no WhatsApp). A conversão que ele conta é o clique no WhatsApp
(tag `AW-958567409`, dentro da tag Google `GT-57SF42Z`). Sobre o Meta, ainda não sabemos nada: o site tem o pixel
`1526867428059043`, que pode ser da BMH ou da agência.

---

## Antes de tudo: o acesso de administrador nas duas contas

Peça à agência, **antes de ela sair**:

1. **Google Ads 506-679-8424:** que o seu e-mail Google seja **Administrador** da conta (Administrador ›
   Acesso e segurança). Se a conta estiver "dentro" da conta de administrador da agência, tudo bem: o que importa é
   o seu acesso direto como administrador. Peça também que **nada seja pausado ou apagado** na saída.
2. **Meta:** que a conta de anúncios, a página do Facebook, o Instagram @hiperbaricabrasilia e o pixel
   `1526867428059043` estejam no **portfólio empresarial da BMH** (business.facebook.com), com você como
   administrador. Se o pixel for da agência, ela pode compartilhar ou a BMH cria um novo (eu troco no Tag Manager).
3. Que a agência mantenha o que está rodando até você me avisar que o acesso está feito, para não haver dia sem anúncio.

---

## Bloco F · Google Ads (15 minutos)

1. Confira o acesso: em `ads.google.com`, a conta **506-679-8424** precisa aparecer com você como **Administrador**.
2. No Google Cloud, projeto **bmh-integracoes** (o mesmo dos blocos B e C):
   - **APIs e serviços › Biblioteca** › ative **Google Ads API** (e, se aparecer, **Data Manager API**).
   - Abra `console.cloud.google.com/apis/api/googleads.googleapis.com/overview?project=bmh-integracoes` e, em
     **nível de acesso**, peça o **Explorer** (o projeto nasce só para contas de teste).
3. **Google Auth Platform** (`console.cloud.google.com/auth/overview?project=bmh-integracoes`):
   - Tipo **Externo**, nome do app `BMH Ads`, seu e-mail.
   - Em **Público-alvo › Status da publicação**, clique em **Publicar app** (em "teste", a autorização vence em 7 dias).
4. **Clientes › Criar cliente**, tipo **App para computador**, nome `BMH Ads`. Baixe o JSON e mova para
   `~/.config/bmh/` (como fez no bloco B). Me diga só o nome do arquivo.
5. Eu rodo `python3 scripts/google-ads-autorizar.py`: abre o navegador, você entra com a conta do Google Ads **uma
   vez** e clica em **Permitir**. A autorização vai direto para o `.env`. Você não copia nada.

## Bloco G · Meta Ads (15 minutos)

1. `business.facebook.com` › **Configurações › Usuários › Usuários do sistema › Adicionar**: nome `Claude BMH`,
   função **Administrador do sistema**.
2. Em `Claude BMH` › **Atribuir ativos**: a **conta de anúncios** da BMH (controle total), **pixels/conjuntos de
   dados** (controle total), a **página** da BMH (criar anúncios) e o **Instagram** @hiperbaricabrasilia.
3. `developers.facebook.com` › **Criar app** › tipo **Empresa**, nome `BMH Ads`, ligado ao portfólio da BMH ›
   adicionar o produto **API de Marketing**.
4. De volta em **Usuários do sistema › Claude BMH › Gerar novo token**: app `BMH Ads`, validade **Nunca**, permissões
   `ads_management`, `ads_read`, `business_management`, `pages_show_list`, `pages_read_engagement` (e `pages_manage_ads`,
   se aparecer). Copie (começa com "EAA"; aparece uma vez só).
5. No terminal: `bash scripts/guardar-chave.sh META_ADS_TOKEN` e cole.
6. Me passe (não são segredo): o **ID da conta de anúncios** (`act_...`) e o **ID do portfólio** (Configurações ›
   Informações do negócio).

## Bloco H · As regras da gestão (decisão sua, 5 minutos)

Gestão de anúncio gasta dinheiro. Proponho as mesmas regras da Nexo; preencha os números:

| | Proposta | Seu número |
|---|---|---|
| **Teto de gasto por mês** (Google + Meta) | eu nunca passo dele | R$ ____ |
| Pausar anúncio ou palavra que gastou sem nenhum clique no WhatsApp | depois de R$ ____ em ____ dias | |
| Ajuste de lance sem pedir | até ±____% | |
| Mover verba entre campanhas sem mudar o total do dia | sim / não | |

**Só com o seu "pode":** aumentar o orçamento total, criar campanha, mudar região ou público, **publicar anúncio novo**
(texto de anúncio é publicidade médica: sem preço, sem promessa, sem antes e depois, sem depoimento; passa por você).

**Nunca:** passar do teto, segmentar por condição de saúde (o Meta proíbe e bloqueia conta), mexer no Tag Manager sem
você pedir.

**Registro:** toda mudança fica anotada (o quê, quando, por quê, antes e depois) em `marketing/campanhas/`.

---

## Depois dos blocos

Eu leio as campanhas como estão (o que a agência deixou), o histórico de gasto e de conversão, e te mostro um
diagnóstico antes de mudar qualquer coisa. Primeiro passo provável: a conversão principal passar a ser o clique no
WhatsApp **por página e por botão** (versão nova do Tag Manager), e o anúncio levar para a página certa.
