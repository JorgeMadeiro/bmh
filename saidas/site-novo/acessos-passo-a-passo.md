# Acessos para a fase 1: passo a passo para o Jorge

> **Use a lista única `liberar-tudo-de-uma-vez.md` (07/10/2026):** ela junta o que falta deste arquivo e do outro, já descontando o que está feito. Nomes do app passaram a ser `BMH Integrações`.

> **Situação em 07/10/2026:** blocos A, B, C e D **feitos**. Bloco E (Clarity): aguardando a agência dar acesso de administrador.

> Escrito em 06/10/2026. Faça na ordem; cada bloco leva de 2 a 15 minutos. **Nenhuma senha ou chave vai para o chat:**
> tudo que é segredo entra pelo terminal, com `bash scripts/guardar-chave.sh NOME`, e o valor não aparece na tela.
> Quando terminar um bloco, escreva só "feito o bloco X".

---

## Bloco A · Atualizar plugins e tema do WordPress (2 minutos)

A API não atualiza plugin; o painel faz isso em dois cliques. O backup da Hostinger já foi feito.

1. Entre em `hiperbaricabrasilia.com.br/wp-admin`.
2. Menu da esquerda: **Painel › Atualizações**.
3. Em "Plugins", marque **Selecionar todos** e clique em **Atualizar plugins**. Depois, em "Temas", faça o mesmo.
4. Me avise. Eu confiro as páginas no ar logo em seguida.

---

## Bloco B · Projeto da BMH no Google Cloud (15 minutos, uma vez só)

É o que deixa eu ler o Search Console e o Analytics e montar a versão nova do Tag Manager pela API. É um projeto
**só da BMH**, separado do da Nexo, para uma clínica nunca alcançar os dados da outra.

1. Abra `console.cloud.google.com` com o e-mail Google que você usa na BMH.
2. No topo, clique no seletor de projetos › **Novo projeto** › nome **`bmh-integracoes`** › Criar.
3. Com o projeto `bmh-integracoes` selecionado, menu **APIs e serviços › Biblioteca** e ative, uma por uma:
   **Tag Manager API**, **Google Analytics Admin API**, **Google Analytics Data API**, **Google Search Console API**.
4. Menu **IAM e administrador › Contas de serviço › Criar conta de serviço** › nome **`bmh-site`** › Criar e
   continuar › (não precisa dar papel) › Concluir.
5. Clique na conta criada › aba **Chaves › Adicionar chave › Criar nova chave › JSON**. Um arquivo `.json` baixa.
6. **Não deixe esse arquivo em Downloads nem no Drive/iCloud.** Mova para `~/.config/bmh/` (crie a pasta) e me
   diga só o nome do arquivo. Eu ligo o caminho no `.env` sem abrir o conteúdo no chat.
7. Copie o **e-mail da conta de serviço** (algo como `bmh-site@bmh-integracoes.iam.gserviceaccount.com`). Ele não
   é segredo: pode colar aqui.

## Bloco C · Dar acesso a esse e-mail (10 minutos)

Use o e-mail do passo B7 nos três lugares:

| Onde | Caminho | Permissão |
|---|---|---|
| **Tag Manager** (`tagmanager.google.com`, conta 6207699487, contêiner GTM-PQZ32BC5) | Administrador › Gerenciamento de usuários do contêiner › + › e-mail | **Publicar**. Eu só publico com o seu "pode", mas sem essa permissão não dá para testar a versão nova no site real |
| **Google Analytics** (`analytics.google.com`, propriedade do G-97ZBVMVR1Y) | Administrador › Gerenciamento de acesso à conta › + › e-mail | **Editor** |
| **Search Console** (`search.google.com/search-console`, propriedade `https://hiperbaricabrasilia.com.br/`) | Configurações › Usuários e permissões › Adicionar usuário | **Total** |

Se em algum deles você **não** aparecer como administrador, me diga qual: isso responde de quem é a conta.

---

## Bloco D · Bing Webmaster (5 minutos)

É o índice que o ChatGPT e o Copilot consultam.

1. Abra `bing.com/webmasters` e entre com a mesma conta Google.
2. Escolha **Importar do Google Search Console** e marque `hiperbaricabrasilia.com.br`.
3. Engrenagem (canto de cima) › **Acesso à API** › **Chave de API** › Gerar. Copie.
4. No terminal: `bash scripts/guardar-chave.sh BING_WEBMASTER_API_KEY` e cole.

---

## Bloco E · Clarity (5 minutos)

O site tem o Clarity `m9kxjnnvgm` instalado. Falta saber de quem é.

1. Abra `clarity.microsoft.com` e entre (Google ou Microsoft).
2. Se aparecer um projeto da BMH com o código `m9kxjnnvgm`: abra › **Settings › Masking** › escolha **Strict**
   (nada que o visitante digita é gravado) › depois **Settings › Data export** › **Generate new API token** ›
   no terminal: `bash scripts/guardar-chave.sh CLARITY_API_TOKEN`.
3. Se **não** aparecer: o projeto é de outra pessoa (agência). Me avise; eu crio um da BMH na versão nova do Tag
   Manager e o antigo é desligado.

---

## Depois dos blocos

Com os acessos, eu: leio 16 meses de Search Console (o que já traz visita), confiro o Analytics, monto a versão
nova do Tag Manager (WhatsApp por página e unidade, telefone, como chegar, evento quebrado fora, GA4 uma vez só),
testo com o envio bloqueado e te mostro o resultado antes de publicar.
