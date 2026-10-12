# Liberar tudo de uma vez: a lista única

> Feita em 07/10/2026, depois de conferir pela API o que já funciona. Substitui as partes que faltam dos dois passos a
> passo anteriores. Tempo total: uns **45 minutos**, mais o prazo do Google para o Perfil da Empresa (de 7 a 10 dias
> úteis, por isso ele entra já). **Nenhuma senha ou chave no chat:** chave vai pelo terminal
> (`bash scripts/guardar-chave.sh NOME`); arquivo baixado vai para `~/.config/bmh/`.

## Já feito (não precisa mexer)

✅ WordPress (senha de aplicativo) · ✅ projeto `bmh-integracoes` e conta de serviço `bmh-site` · ✅ Tag Manager
(Publicar) · ✅ Analytics (Editor) · ✅ Search Console (Total) · ✅ Bing Webmaster · ✅ plugins atualizados

---

## 1. Peça à agência, hoje (mensagem pronta no fim)

- [ ] **Google Ads 506-679-8424:** você como **Administrador**.
- [ ] **Meta:** conta de anúncios, página do Facebook, Instagram @hiperbaricabrasilia e o pixel `1526867428059043`
      dentro do **portfólio empresarial da BMH**, com você como administrador (ou compartilhados com ele).
- [ ] **Clarity** (projeto `m9kxjnnvgm`): você como **administrador** (já pedido).
- [ ] **Perfis do Google** das duas unidades: você como **proprietário principal** (se a agência for a dona).
- [ ] Que **nada seja pausado** até você avisar.

## 2. Google Cloud, projeto `bmh-integracoes` (15 minutos)

Abra `console.cloud.google.com`, selecione **bmh-integracoes**.

- [ ] **APIs e serviços › Biblioteca**, ative (botão **Ativar** em cada uma):
      **Google Ads API** · **Data Manager API** · **My Business Account Management API** ·
      **My Business Business Information API** · **Business Profile Performance API** · **Google My Business API** ·
      **PageSpeed Insights API**.
- [ ] **Google Ads API › Visão geral** (`console.cloud.google.com/apis/api/googleads.googleapis.com/overview?project=bmh-integracoes`):
      em nível de acesso, **Solicitar Explorer**.
- [ ] **Google Auth Platform** (`console.cloud.google.com/auth/overview?project=bmh-integracoes`): tipo **Externo**,
      nome do app **`BMH Integrações`**, seu e-mail. Depois **Público-alvo › Status da publicação › Publicar app**
      (em "teste", a autorização vence em 7 dias).
- [ ] **Clientes › Criar cliente** › tipo **App para computador** › nome `BMH Integrações` › baixe o JSON e mova para
      `~/.config/bmh/`.
- [ ] **APIs e serviços › Credenciais › Criar credenciais › Chave de API** › em "Restringir chave", marque só
      **PageSpeed Insights API** › copie › no terminal: `bash scripts/guardar-chave.sh PAGESPEED_API_KEY`.

## 3. Perfil da Empresa no Google (5 minutos agora; o Google leva de 7 a 10 dias úteis)

- [ ] Em `business.google.com`, confira que aparecem **os dois perfis** (Asa Sul e Taguatinga) e que você é
      **proprietário**. Se só aparecer um, ou nenhum, me avise: isso muda o plano.
- [ ] Peça o acesso à API em `support.google.com/business/contact/api_default`: tipo **Basic API Access**, uso
      **próprio** (não agência), número do projeto **136521083780**, site `https://hiperbaricabrasilia.com.br`, com o
      e-mail dono dos perfis. A resposta chega por e-mail.

## 4. Meta (20 minutos)

Em `business.facebook.com`, no **portfólio da BMH**:

- [ ] **Configurações › Usuários › Usuários do sistema › Adicionar:** `Claude BMH`, **Administrador do sistema**.
- [ ] **Atribuir ativos** ao `Claude BMH`: conta de anúncios (**controle total**), pixels/conjuntos de dados
      (**controle total**), página (**controle total**) e Instagram @hiperbaricabrasilia.
- [ ] Em `developers.facebook.com`: **Criar app** › tipo **Empresa** › nome `BMH Integrações` › ligado ao portfólio da
      BMH › **Adicionar produto: API de Marketing**.
- [ ] De volta em **Usuários do sistema › Claude BMH › Gerar novo token**: app `BMH Integrações`, validade **Nunca**,
      e marque tudo que aparecer desta lista (vale para anúncios **e** para postar no Instagram depois, sem gerar outro
      token): `ads_management` · `ads_read` · `business_management` · `pages_show_list` · `pages_read_engagement` ·
      `pages_manage_ads` · `pages_manage_posts` · `instagram_basic` · `instagram_content_publish` ·
      `instagram_manage_insights`. No terminal: `bash scripts/guardar-chave.sh META_ADS_TOKEN`.

## 5. Clarity (5 minutos, depois que a agência der o acesso)

- [ ] Projeto `m9kxjnnvgm` › **Settings › Masking › Strict** › **Settings › Data export › Generate new API token** ›
      no terminal: `bash scripts/guardar-chave.sh CLARITY_API_TOKEN`.

## 6. Decisões (escreva os números aqui ou me responda)

- [ ] **Teto de gasto por mês**, Google + Meta: R$ ______
- [ ] Pausar anúncio ou palavra que gastou R$ ____ em ____ dias sem nenhum clique no WhatsApp: sim / não
- [ ] O WhatsApp (61) 3346-6005 é o **aplicativo WhatsApp Business** no celular, ou está ligado a algum sistema (CRM,
      atendimento automático)? Isso decide como medimos "agendou".
- [ ] Posso tirar do Tag Manager as tags do `G-97ZBVMVR1Y` (o Analytics da agência)? sim / não

---

## O que me mandar quando terminar

Só isto (nada é segredo): **"feito"**, o **nome do arquivo JSON** que você moveu para `~/.config/bmh/`, o **ID da conta de
anúncios do Meta** (`act_...`), o **ID do portfólio** (Configurações › Informações do negócio) e as decisões do item 6.
Aí eu rodo a autorização do Google (você clica em **Permitir** uma vez) e confiro tudo.

---

## Mensagem pronta para a agência

> Olá! A BMH vai passar a gestão do site e dos anúncios para a equipe interna. Para a transição, preciso de:
> 1) meu e-mail como **Administrador** na conta do Google Ads 506-679-8424;
> 2) a conta de anúncios do Meta, a página, o Instagram @hiperbaricabrasilia e o pixel 1526867428059043 no portfólio
> empresarial da BMH, comigo como administrador;
> 3) meu acesso de administrador no Clarity (projeto m9kxjnnvgm);
> 4) se algum perfil do Google da BMH estiver em nome de vocês, a transferência da propriedade para mim.
> Por favor, mantenham as campanhas como estão até eu confirmar que o acesso está feito. Obrigado!
