# BMH no Kommo com coexistência: o motor antes da assinatura (22/10/2026)

**Pedido do Jorge (22/10/2026):** tirar a BMH do WhatsApp Web "sem filtro, sem rastreio" e montar a estrutura da Nexo:
- de onde o paciente vem;
- o que vira avaliação e tratamento;
- quanto custa cada paciente;
- como a equipe atende.

O Kommo entra **em coexistência** (a equipe continua podendo usar o app no celular). **Tudo o que não depende da conta
do Kommo fica pronto antes da assinatura.**

**De onde veio:**
- o método da Nexo (`Nexo_Claude_VSL/integracoes/`: kommo, conversoes, origem);
- o esboço do CRM próprio (`saidas/crm-proprio/estrutura.md`), cujas etapas, motivos de perda e regras de LGPD servem
  igual no Kommo;
- a pesquisa sobre coexistência de 22/10 (fontes da Meta e do Kommo no fim).

**O que muda nas decisões anteriores:**
- O CRM próprio (12/10) dá lugar ao Kommo.
- A observação pela Evolution (09/10) dá lugar ao recebedor oficial da Meta (seção 3C).
- O resto continua valendo: CAC até R$ 200 por paciente novo; sem preço em anúncio; LGPD antes de ligar.

## 1. Como fica

```
Paciente ──► WhatsApp da recepção (61) 3346-6005, app WhatsApp Business no celular
                 │  coexistência (API oficial da Meta)
                 ├──► Kommo da BMH (conta própria, separada da Nexo): a equipe atende por ali ou pelo celular
                 │        └─ webhook do Kommo ──► n8n BMH: lead, etapa, tempo de resposta
                 └──► app da BMH na Meta (segundo assinante, como na Nexo) ──► n8n BMH:
                          origem do anúncio (referral, ctwa_clid) e as mensagens para a leitura do atendimento
Site, bio, Google, QR do cirurgião ──► mensagem pronta por canal ──► fluxo de origem ──► campos do lead no Kommo
iGut (avaliação e sessões finalizadas) ──► conversões (agendou, avaliou, iniciou) ──► Meta e Google, sempre em hash
Tudo ──► painel da BMH: canal ► contato ► avaliação ► tratamento ► custo por paciente; e o mesmo por cirurgião
```

## 2. Kommo da BMH (o desenho, montado por script no primeiro dia)

**Conta própria da BMH.** A chave de uma empresa não vai para outra, então nada é compartilhado com a conta da Nexo.

**Plano Avançado.** Webhook, salesbot e transmissão só existem do Avançado para cima.

**Funil "Atendimento BMH"** (do esboço do CRM, seção 1):

| Etapa | Entra quando | Quem move |
|---|---|---|
| 1. Novo contato | primeira mensagem | o Kommo |
| 2. Em conversa | primeira resposta | a equipe ou o n8n (pelo tempo de resposta) |
| ~~3. Pedido e autorização~~ | fica como **tarefa** no lead (decisão de 22/10: funil simples primeiro) | a equipe |
| 4. Avaliação agendada | avaliação marcada no iGut | o n8n, pelo iGut |
| 5. Avaliou | avaliação finalizada no iGut | o n8n, pelo iGut |
| 6. Em tratamento | primeira sessão finalizada | o n8n, pelo iGut |
| 7. Concluiu (ganho) / Perdido | fim do protocolo, ou desistiu | o n8n e a equipe |

**Motivos de perda** (obrigatórios), como no esboço: convênio, preço, sem indicação, sumiu, agora não, outro lugar e
fora do perfil.

**A marca "não é oportunidade"** vale para paciente em tratamento remarcando, fornecedor, currículo e engano.

**Campos do lead:**
- **Origem:**
  - `origem`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`;
  - `gclid`, `fbclid`, `ctwa_clid` e `id_anuncio`;
  - `cirurgiao_indicou` (lista fixa, preenchida pelo QR ou pela equipe).
- **Caso:**
  - `unidade` (Asa Sul ou Taguatinga);
  - `particular_ou_convenio` e `convenio` (lista dos 50);
  - `tipo_de_caso`: pós-operatório, ferida, mergulho ou outro. É uma categoria larga, nunca o diagnóstico. Pela regra da
    BMH, não serve para marketing nem disparo.
- **Ligação:** `id_igut`.

Sem CPF, sem diagnóstico e sem foto no Kommo (LGPD do esboço). O elo com o iGut é o id. **Mudou em 18/11/2026 (decisão do
Jorge, "igual à Nexo, com CPF"):** o contato leva nome completo, código do iGut, CPF, nascimento e e-mail; diagnóstico e foto
continuam fora.

**Etiquetas:** `anúncio meta`, `google`, `site`, `cirurgião`, `instagram dr jorge`, `fora do horário`, `não é
oportunidade`.

**Robôs do Kommo:**
- **Horário:** fora das 7h às 19h, responde que a equipe retorna a partir das 7h. A BMH não tem pronto atendimento.
- **Passagem:** se o lead fica 15 min sem resposta no horário, cria a tarefa e avisa.

**Como entra:** `scripts/kommo/montar.js`, que cria funil, etapas, campos, motivos, etiquetas e webhooks pela API e
pode rodar de novo sem duplicar. Escrito antes; roda no primeiro dia do teste grátis de 14 dias. É por isso que o teste
grátis só abre quando o motor estiver pronto: os 14 dias contam do primeiro clique.

## 3. O motor, peça por peça

| Peça | O que faz | Dá para montar e testar antes da assinatura? |
|---|---|---|
| **A. Kommo como código** | o script da seção 2 | escrever, sim; rodar, só no teste grátis |
| **B. Origem por canal** | uma lista única de frases em `BMH_config` (lição da Skyfit: duas listas, uma esquecida); mensagem pronta por canal (site, que já tem; bio; Perfil da Empresa; anúncio de clique para WhatsApp); **um QR ou link por cirurgião parceiro** ("Vim pela indicação do Dr. X"); e o webhook de cliques do site com `gclid` e UTM, que resolve a pendência do `gclid` perdido no redirecionamento | **sim**: site, Tag Manager, n8n e tabela já existem; os QR dos cirurgiões saem prontos para imprimir |
| **C. Recebedor oficial da Meta** | app da BMH na Meta, no portfólio da BMH, assinando o WhatsApp da BMH, como a Nexo fez em 05/10. Grava o `referral` e o `ctwa_clid` do anúncio e as mensagens (as recebidas e as que a equipe manda pelo celular), com CPF, telefone e e-mail mascarados e apagamento em 6 meses. **Substitui a Evolution:** a coexistência derruba todo aparelho conectado, e manter a Evolution no mesmo número é risco de falha e de bloqueio | o fluxo e a tabela, sim, testados com mensagens simuladas no formato da Meta; o app da Meta pode ser criado já; a assinatura do número só depois da coexistência |
| **D. Ligação origem ► lead** | o fluxo de origem da Nexo adaptado: casa a conversa com o clique ou a frase e preenche os campos do lead. Já nasce com as lições (olhar `entity_type`, no máximo 5 chamadas por segundo, mensagem apagada pela pessoa vira "origem provável pelo tempo") | sim, com o Kommo simulado; o teste real é no teste grátis |
| **E. Conversões** | agendou (avaliação no iGut), avaliou e iniciou o tratamento (sessão finalizada no iGut), em hash, para a Meta (pixel `1526867428059043`, que hoje só manda visita de página, e o conjunto de dados do WhatsApp com o `ctwa_clid`) e para o Google Ads (`AW-958567409`) | a leitura do iGut, sim (a API da BMH já responde); o envio, em modo de ensaio, sem mandar evento |
| **F. Leitura do atendimento** | **o que você pediu: ver como a equipe atende.** Números sem texto pelo Kommo (tempo até a primeira resposta, conversa sem resposta, etapa parada, motivo de perda) e o texto pelo recebedor oficial (C). Análise semanal: o que perguntaram, o que demorou, onde o paciente sumiu, a equipe perguntou "como conheceu?". Relatório sem nome nem dado que identifique | sim, com a tabela de mensagens da Evolution que já existe (se a recepção foi reconectada em 20/10) ou com simulação |
| **G. Painel** | o painel da BMH ganha o funil por canal e por cirurgião, o custo por paciente novo (meta de R$ 200) e o tempo de resposta por turno | sim, com dados de ensaio; números reais desde o primeiro dia de Kommo |
| **H. LGPD antes de ligar** | mapa dos dados, política de privacidade do site e relatório de impacto (regra da BMH) | **sim**, pela skill `lgpd` |
| **I. Dia da virada** | o roteiro abaixo | escrito antes |

**O que a Nexo não tem e a BMH vai ter:** a leitura do atendimento humano pelo texto. Na Nexo, o Kommo não entrega o
texto das conversas (403 em 22 e 29/09), e só a Nexa é lida. Na BMH, o texto vem pelo recebedor oficial (C), que é da
própria BMH, sem depender do Kommo.

## 4. O dia da virada (roteiro)

1. Conferir que o (61) 3346-6005 está no **app WhatsApp Business** (não no WhatsApp comum), na versão 2.24.17 ou maior,
   e em uso há bastante tempo. Número novo pode não ser aceito.
2. Antes de ligar, **desligar a observação pela Evolution** ("BMH Recepção"). A tabela antiga segue a regra de apagar
   em 6 meses.
3. Abrir o teste grátis do Kommo e rodar o `montar.js`. Conferir funil, campos e robôs lendo de volta.
4. Ligar a coexistência pelo Kommo: login no Facebook, número, QR no celular e "compartilhar histórico". O Kommo traz
   as conversas dos últimos 30 dias.
5. Reconectar o WhatsApp Web de quem precisar (até 4 aparelhos; **o app de Windows não funciona**).
6. Assinar o WhatsApp com o app da BMH (C) e ligar origem, conversões e painel.
7. Uma mensagem real de teste por canal (site, QR de cirurgião, bio, anúncio), conferida no lead.
8. Treino da equipe: atender pelo Kommo e perguntar "como conheceu a BMH?" a todo contato novo sem origem.

**Fazer fora do horário de atendimento** (lição da Nexo: mexer no Kommo só depois das 19h ou antes das 7h).

**Regra que passa a valer:** o celular da recepção precisa ser aberto pelo menos a cada 14 dias, senão a Meta desliga
a coexistência.

## 5. O que você decide

1. **O número:** o (61) 3346-6005 está no app WhatsApp Business ou no comum? Quem tem o celular?
2. **A Evolution sai do número da recepção no dia da virada**, trocada pelo recebedor oficial. Pode?
3. **Quantos usuários no Kommo** (recepção das duas unidades, gerência, diretoria)? A recepção de uma unidade vê os
   contatos da outra?
4. **A leitura do atendimento:** guardar o texto das conversas da recepção (mascarado, 6 meses, só para analisar o
   atendimento) e abrir para a Central uma rota no cofre como a da Nexa (CPF, telefone e e-mail trocados por
   `[removido]`). O seu pedido indica que sim, mas pela regra fica escrito com o seu ok.
5. **Etapa "Pedido e autorização":** etapa própria ou só tarefa? (pergunta 1 do esboço)
6. **QR por cirurgião parceiro:** montar a lista dos cirurgiões que mais indicam, para o cartão com QR.
7. **Quem constrói:** o Gerente BMH na VPS ou esta janela do Mac. As duas têm acesso; o que exige o Mac (app da Meta,
   credenciais do n8n) fica aqui de qualquer jeito.

**Respostas do Jorge (22/10/2026):**
- 2: a Evolution não entra de jeito nenhum. O número já tem 4 aparelhos conectados, o máximo, e por isso a observação de
  09/10 nunca começou.
- 3: dois usuários por enquanto.
- 4: guardar o texto por **1 mês** no início (no lugar de 6), com a leitura pela Central.
- 6: lista de cirurgiões ainda não; o QR nasce pronto para receber nomes.
- 7: construir pela janela do Mac, com o Gerente BMH na VPS acompanhando pelo git e assumindo a operação depois da
  virada.

- 1 (22/10): o número está no **WhatsApp Business**, num celular que fica na Asa Sul, mas a equipe **não usa o celular**:
  atende pelo WhatsApp Web nos computadores. Consequência: alguém precisa **abrir o app nesse celular pelo menos a cada 14
  dias** (senão a Meta desliga a coexistência) e conferir a versão (2.24.17 ou maior) antes da virada. Vira lembrete
  automático no Telegram depois da virada.
- 5 (22/10): **primeiro implantar o Kommo com um funil simples e resolutivo, nos moldes da Nexo**; "pedido e autorização"
  fica como tarefa, não como etapa. Depois de **1 a 2 meses de mensagens** no Kommo, pensar no SDR (atendente de IA) com
  base nas conversas reais.

## 5B. Decisões do documento de aprovação (22/10/2026)

O Jorge pediu tudo num documento para aprovar: **"BMH no Kommo: plano para aprovação"**
(https://claude.ai/artifact/U8SVWZABXmzn1xEyWPwa7P, exporta para PDF). Ali estão o funil, os campos, as cinco mensagens, a
origem por canal, o motor, a virada, os custos, os riscos e a lista para marcar. O que muda aqui:
- Funil de 7 etapas com **"Aguardando convênio"** (tarefa de cobrança em 3 dias úteis); o automático do iGut só move para
  frente. "Só dúvida" vai para Perdido com tarefa de retomar em 7 dias; quem não é paciente, etiqueta "não é oportunidade".
- **Confirmação de agenda pronta no dia da virada** (pedido do Jorge): véspera às 18h, modelo de utilidade aprovado pela
  Meta com "Confirmo" e "Preciso remarcar", uma por paciente por dia; o aparelho que confirma hoje fica ligado até a nova
  rodar uma semana sem falha.
- Pedido de avaliação no Google na fase 2, em "Concluiu", para todos os que concluíram.
- Frases novas: Instagram da BMH e Perfil do Google; página /indicacao/ com QR por cirurgião.

## 5C. O motor pronto, só aguardando o Kommo (22/10/2026, fim do dia)

Pedido do Jorge: "deixe tudo pronto só aguardando o Kommo". Tudo em ensaio, testado, sem mandar nada a paciente, ao
Kommo, à Meta ou ao Google.

| Peça | Onde está | Situação | Teste |
|---|---|---|---|
| Confirmação da véspera | fluxo "BMH · Agenda · confirmação da véspera" (18h03), `integracoes/agenda/confirmacao-monta.js`, tabela `BMH_confirmacoes` | ligado em ensaio; falta o envio pelo Kommo (modelo de utilidade aprovado pela Meta, botões) | 23/10: 65 confirmações (45 Asa Sul, 20 Taguatinga) |
| Lista única de frases | `integracoes/origem/frases.json` | os botões do site, o leitor do Kommo e o recebedor da Meta leem dela | `testa-origem.js` 26 de 26 |
| Origem no lead | fluxo "BMH · Kommo · origem do lead", `integracoes/origem/origem-kommo.js`, tabela `BMH_origem_leads` | ligado em ensaio; na virada: webhook de conta do Kommo + PATCH no lead (5/s) | mensagem simulada gravada certa |
| Kommo por código | `scripts/kommo/montar.js` (ensaio sem `--real`) | pronto; roda no 1º dia do teste grátis e grava `kommo_campos` | ensaio lista funil, 16 campos, 9 etiquetas, 7 motivos |
| Páginas /instagram/ e /indicacao/ | WordPress 1423 e 1421, rascunho, noindex | publicar na virada (com o "pode") | iPhone simulado: frase certa, origem reconhecida |
| Cartão com QR por cirurgião | `scripts/qr-cirurgiao.py` → `marketing/qr-cirurgioes/` | exemplo gerado; nomes só com o ok de cada cirurgião | renderizado |
| Recebedor oficial da Meta | fluxo "BMH · WhatsApp · recebedor oficial (Meta)", `whatsapp/monta-meta.js`, tabela `BMH_whatsapp_meta` | ligado; recebe depois da assinatura do número pelo app da BMH | `testa-monta-meta.js` 7 de 7; verificação e mensagem simulada no ar |
| Limpeza | "BMH · WhatsApp · apaga conversas vencidas" (4h37) | inclui `BMH_whatsapp_meta` (1 mês) | linha de teste apagada |
| Conversões | fluxo "BMH · Conversões · eventos do iGut" (7h23), `conversoes/eventos-igut.js`, tabela `BMH_conversoes` | ligado em ensaio (avaliou e iniciou; agendou vem do Kommo); envio à Meta e ao Google depois, primeiro em teste | 21/10: 5 avaliou, 4 iniciou |
| Clique do site | fluxo "BMH · Site · clique no WhatsApp", `origem/clique-recebe.js`, tabela `BMH_cliques_site`; tag na **versão 8 do Tag Manager, não publicada** | publicar a versão 8 com o "pode" e o `scripts/testa-tags.js` | navegador: gclid e UTM da chegada levados à 2ª página |
| LGPD | política de privacidade (página 1336) | já tem o parágrafo de medição dos anúncios (07/10) | lido em 22/10 |

**Ligado de verdade em 22/10/2026, com o "pode" do Jorge ("deixar somente o Kommo"):**
- Tag Manager **versão 8 publicada** (teste antes e depois igual, só acrescenta a tag do clique; conferido no site no ar:
  o clique manda página, botão, mensagem, gclid e UTM ao n8n).
- Páginas **/instagram/ e /indicacao/ publicadas** (noindex, fora do mapa do site, GTM, GA4 e Clarity carregando, frase
  certa no iPhone simulado).
- **Conversões em modo real** (`conversoes_envio_modo = real`, fluxo "BMH · Conversões · envio (Meta e Google)", 8h17):
  Meta, API de Conversões no pixel 1526867428059043, 24 eventos aceitos (20 e 21/10); Google Ads, Data Manager, duas
  conversões **secundárias** novas ("BMH · Avaliou (iGut)" 7864686655 e "BMH · Iniciou tratamento (iGut)" 7864686658,
  fora do lance), 24 aceitos depois de umas horas de propagação. Cada evento vai uma vez (chave), marcado na tabela.

**Achado de 22/10/2026 (fim do dia): a conta oficial do WhatsApp já existe.** No portfólio da BMH há a conta de WhatsApp
198826156641686 ("Brasília Medicina Hiperbárica", aprovada, verificada) com o número +55 61 3346-6005 (id 181090498424438)
em **CLOUD_API e no aplicativo ao mesmo tempo** (coexistência já ligada), sem modelos e sem nenhum app assinado; o usuário
do sistema "BMH Integrações" tem acesso de gestão. Consequências:
- o recebedor oficial pode ligar **já**, sem o Kommo: falta só `META_APP_SECRET` no .env (o Jorge grava) e rodar
  `scripts/meta-whatsapp-assinar.js assinar` (o `WHATSAPP_WEBHOOK_VERIFY` já foi gerado);
- a confirmação da véspera também não depende do Kommo: modelo `confirmacao_sessao_v1` (utilidade) enviado à Meta em
  22/10 (pendente de aprovação); envio pela API oficial e resposta "Confirmo" → iGut (`statusatendimento` 1) montados em
  ensaio; ligar com `confirmacao_modo = real` quando o aparelho que confirma hoje for desligado (senão o paciente recebe duas);
- no dia do Kommo, conectar o Kommo a ESSA conta (ver com o suporte do Kommo como ele assume uma conta que já está na API
  oficial; não criar outra).
- Montado também: origem das conversas a cada 10 min (`BMH_origem_conversas`: frase, clique com gclid, "provável pelo
  tempo", código do anúncio; `origem/testa-liga-conversas.js` 9 de 9) e o lembrete do celular da Asa Sul (dias 1, 11 e 21).

**Na virada, nesta ordem:** `scripts/kommo/montar.js --real`; renomear o ganho para "Concluiu" e criar na tela o robô de horário e as tarefas; ligar a
coexistência; registrar o webhook de conta no fluxo de origem e acrescentar o PATCH; assinar o número com o app da BMH
apontando para o recebedor; modelo de confirmação aprovado na Meta e envio ligado (`confirmacao_modo = real`); depois de
uma semana sem falha, desligar o aparelho que confirma hoje.

## 6. Custos

- **Kommo:** a partir de 01/09/2026, o Avançado custa US$ 30 por usuário por mês para cliente novo. Com 4 usuários, uns
  US$ 120 por mês. Preço em reais, mínimo de usuários e se o plano anual é obrigatório: a confirmar na assinatura. O
  teste grátis é de 14 dias.
- **Meta:**
  - mensagem mandada pelo app do celular continua grátis;
  - mensagem pela API (Kommo) segue a tabela da Meta. Desde 01/10/2026, as de serviço passam a ser cobradas depois
    das 1.000 grátis por mês por número;
  - conversa que começa por anúncio de clique para WhatsApp tem janela grátis (a página da Meta diz até 7 dias).

  O valor exato no Brasil, em reais: a confirmar.
- **O resto** (n8n, painel, recebedor oficial) roda no que já existe, sem custo novo.

## 7. Riscos

- **Adoção da equipe:** é o maior risco, já apontado no esboço. Sem a pergunta "como conheceu", a indicação do
  cirurgião, que é cerca de 90% dos casos, fica sem origem. O QR ajuda, mas não cobre tudo.
- **Coexistência:** o Brasil não aparece como excluído, mas nenhuma página da Meta o cita por nome. O teste grátis é a
  prova.
- **`ctwa_clid` no Kommo:** não está confirmado que o Kommo entregue. Por isso o recebedor oficial (C) existe, como na
  Nexo.
- **Mensagens mandadas pelo Kommo chegam ao recebedor oficial?** As recebidas e as mandadas pelo celular chegam, pela
  documentação da coexistência. As mandadas pelo Kommo, a confirmar no teste grátis. Se não chegarem, a leitura do
  atendimento usa os números do Kommo para essa parte.
- **A Meta desliga a coexistência** se o celular ficar 14 dias sem abrir.

## 8. Fontes da pesquisa (22/10/2026)

- Meta, coexistência: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
- Kommo, coexistência: https://support.kommo.com/docs/manage-whatsapp-chats-in-both-kommo-and-the-app e
  https://www.kommo.com/br/blog/whatsapp-coexistence/
- Kommo, planos: https://support.kommo.com/docs/kommo-subscription-plans-overview e preços:
  https://www.kommo.com/br/blog/atualizacao-precos-kommo/
- Kommo, anúncio com UTM: https://support.kommo.com/docs/track-whatsapp-ad-campaigns-with-utms
- Meta, preços: https://developers.facebook.com/docs/whatsapp/pricing
- Meta, conversões de mensagens: https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging

## 6. Montado em 17/11/2026 (conta bmh.kommo.com, id 37193891)

- **Token:** integração privada "BMH · n8n e Claude", token de longa duração até 17/11/2031, no `.env` (`KOMMO_BMH_TOKEN`,
  1.150 caracteres: o `read` comum do Terminal trava acima de ~1.000; gravar com `stty -icanon`).
- **Três funis** (decisão do Jorge, 17/11/2026), montados por `scripts/kommo/montar.js --real --limpar`, ids em `ids.json`:
  - **Triagem e conversão** (principal, recebe todo contato do número único): Em qualificação › Orçamento
    enviado (só particular) › Follow-up (recebeu orçamento ou informação e não agendou). Ganho = avaliação agendada.
  - **Asa Sul** e **Taguatinga**: Avaliação agendada › Avaliou · pedido a enviar (o médico finaliza e entrega o relatório;
    a recepção pede ao convênio) › Aguardando convênio (tarefa de cobrança em 3 dias úteis) › Em tratamento. Ganho =
    concluiu. O particular vai de "Avaliou" direto para "Em tratamento". A avaliação é gratuita.
  - **Passagem:** ganho na triagem e lead novo no funil da unidade, mesmo contato, levando origem e cirurgião.
  - Retorno de paciente antigo entra pela triagem (etiqueta "retorno"); troca de unidade no meio é rara: a recepção move.
  - Nomes de ganho e perda (etapas de sistema) só pela tela.
- **Modelo do Kommo apagado** (funil, 12 campos e 4 motivos de exemplo), com o ok do Jorge.
- **Webhook "Mensagem recebida"** cadastrado na tela (fica na conta, não na integração) para o fluxo "BMH · Kommo ·
  origem do lead", ainda em ensaio.
- **Salesbot "Envia mensagem"** (id 15128): manda o texto do campo "Mensagem para enviar" (627592), como o "Envia Mensagem
  IA" da Nexa.
- **App da BMH assinado** na conta de WhatsApp (coexistência já ligada): o recebedor oficial grava mensagens do paciente e
  da equipe pelo celular desde 17/11/2026, 10h30.
- **Um usuário** nos 13 dias restantes do teste; depois decide.
- **Reavaliação** (5 a 10 sessões, depois reavalia): se precisar de mais e for convênio, a recepção volta o lead para
  "Avaliou · pedido a enviar" › Aguardando convênio › Em tratamento; só a alta é ganho (Concluiu). Manual: no iGut a
  reavaliação aparece quase sempre como retorno, que também acontece por intercorrência no meio do tratamento.
- **Motivo de perda novo:** "Interrompeu o tratamento" (criado pelo Jorge na tela, 17/11/2026).

## 7. WhatsApp conectado no Kommo (17/11/2026, 18h20)

- **O que travava:** na conexão, a Meta mostrava o número como "Não qualificado: este número não pode ser compartilhado
  com este app", nas opções "Aplicativo WhatsApp Business" e "WhatsApp". A causa real só apareceu ao digitar o número:
  **"Seu número está vinculado aos eventos automáticos"** (erro 3441106). As **listas automáticas** do app
  (Ferramentas comerciais › Listas) tinham feito a Meta criar sozinha a conta de mensagens 198826156641686, tipo
  "Aplicativo WhatsApp Business", no portfólio da BMH, sem parceiro nenhum. Por isso o número já estava na API em
  22/10 sem app assinado.
- **O que resolveu:** desligar as listas automáticas no celular da Asa Sul e conectar de novo pela opção do app no Kommo.
  Mensagem de saudação, ausência e respostas rápidas não têm nada a ver com isso.
- **Conferido pela API às 18h26:** o número ficou na **mesma** conta (198826156641686), em coexistência; dois apps
  assinados (Kommo 1022173854571346 e BMH 1104609048722893); modelo `confirmacao_sessao_v1` aprovado; o recebedor
  oficial seguiu gravando (teste do Jorge às 18h27).
- **Cuidado:** a tela de conexão que pede SMS ou ligação é o cadastro só na API e pode tirar o número do app do celular.
  O caminho da coexistência pede QR ou confirmação no celular.
- **No Kommo:** fonte "Brasília Medicina Hiperbárica" no funil Triagem e conversão; "Importar contatos" desligado (o
  contato nasce quando conversa). A configuração do Kommo leva alguns minutos depois de conectar.
- **Fluxo de origem:** ganhou o PATCH no lead (credencial n8n "BMH · Kommo (token)", `xpwKz2vMUxgqhNBo`, lote de 5 por
  segundo), ainda em ensaio até a primeira mensagem real cair certa.
- **Passagem da triagem para a unidade** (17/11/2026): fluxo "BMH · Kommo · passagem para a unidade" (`YSJaUQMQffVcfmra`,
  a cada 30 min das 7h às 19h; código em `integracoes/kommo/passagem-avaliacoes.js` e `passagem-decide.js`; tabela
  `BMH_passagens`, sem nome nem celular). Avaliação marcada no iGut (agendas 113 e 120, próximos 14 dias) → contato do Kommo
  pelo celular (DDD + 8 últimos dígitos) → no modo real cria o lead na unidade ("Avaliação agendada", copiando origem,
  UTMs, cirurgião, pagamento, convênio, tipo de caso e etiquetas) e depois marca o da triagem como ganho. Retorno, troca de
  unidade e quem marcou sem conversar no WhatsApp ficam só registrados. Modo `passagem_modo` (ensaio | real). Ensaio de
  17/11, 18h50: 31 avaliações até 28/11, todas "sem contato no Kommo" (o Kommo ainda vazio).
- **Particular, convênio e retorno** (17/11/2026, na passagem): convênio pela agenda do iGut ("PARTICULAR" = Particular;
  cortesia e voucher em branco; o resto = Convênio, com o nome no campo "Convênio"); retorno = já teve sessão com valor antes
  do mês (BMH_financeiro_paciente, desde nov/2024); etiquetas "particular", "convênio" e "retorno" no lead da unidade.
  Ensaio de 17/11: 21 convênio, 3 convênio com retorno, 5 particular, 2 em branco.
- **Conversão "agendou"** (17/11/2026): a passagem grava em `BMH_conversoes` a avaliação marcada na primeira vez que a vê
  (chave `agendou|paciente|dia da avaliação`, só as novas, telefone e e-mail em código; código em
  `integracoes/kommo/passagem-agendou.js`). **Ainda não é enviada:** o `envio-monta.js` só manda avaliou e iniciou. Para
  ligar: criar no Google Ads a conversão secundária "BMH · Agendou avaliação (iGut)" e pôr `agendou` em ACOES e META
  (na Meta, o evento padrão `Schedule`), com o ok do Jorge. As 31 da primeira rodada (17/11) foram marcadas antes e estão
  com o dia 17/11: não enviar essas.
- **BMH_config:** `kommo_campos` com `mensagem_enviar` (627592) e `kommo_bot_envia_mensagem` = 15128 (17/11/2026, por fluxo
  temporário, porque a API pública do n8n não altera linha).
- **Envio do "agendou" ligado** (17/11/2026, 19h30, ok do Jorge): conversão secundária no Google Ads "BMH · Agendou
  avaliação (iGut)" `7907222094` (UPLOAD_CLICKS, BOOK_APPOINTMENT, fora do lance e da coluna Conversões) e evento `Schedule`
  na Meta, no `envio-monta.js` (fluxo de envio das 8h17, modo real). As 31 da primeira rodada ficam de fora (gravadas antes
  das 19h15 de 17/11). Teste com `?modo=teste&antigos=1`: o Google respondeu "Resource not found" no destino novo, a mesma
  demora de propagação de outubro (umas horas). O que não vai fica para o dia seguinte (até 55 dias), sem perder evento.
- **Confirmação da sessão de amanhã, regras novas** (17/11/2026, pedido do Jorge; não existe outra confirmação automática):
  fluxo "BMH · Agenda · confirmação da véspera" (`j9fKHps4n9xGDGL8`) a cada 15 min, das 7h às 21h, só para quem está
  "Nao Confirmado" no iGut: sessão amanhã de quem teve sessão hoje → 2 h depois do início da sessão de hoje; sem sessão hoje
  (primeira, faltou ou pulou) → 24 h antes; avaliação marcada antes de hoje → 24 h antes; avaliação marcada hoje para amanhã
  → não manda (o dia em que foi marcada = primeira vez que a passagem a viu, `agendou` em BMH_conversoes). Envio entre 7h e
  21h; quem a recepção confirma sai da fila. Teste com `?agora=AAAA-MM-DDTHH:MM`. Ensaio de 17/11, 19h35, para 18/11:
  38 já confirmadas pela recepção, 15 receberiam, 8 avaliações marcadas hoje (não recebem). **Em ensaio** até o Jorge
  mandar ligar (`confirmacao_modo = real`). O modelo diz "Sua sessão": para avaliação, um modelo próprio precisa de nova
  aprovação da Meta.
- **Guarda das conversas (17/11/2026, decisão do Jorge):** as mensagens do recebedor oficial (`BMH_whatsapp_meta`, texto
  mascarado) ficam guardadas até analisarmos e implantarmos 100% o SDR, no lugar de 1 mês. Passo "Apaga as vencidas
  (Meta)" do fluxo de limpeza desligado; religar quando o SDR estiver pronto.
- **18/11/2026, WhatsApp chegando no Kommo:** o Kommo importou o histórico e criou **758 leads** (conversas de 19/10 a 17/11),
  todos no Triagem › Em qualificação, mais 45 na entrada não triada. **Defeito achado e corrigido na passagem:** o Kommo
  responde `application/hal+json`, que o n8n não lê sozinho como JSON (vinha como texto em `data`); forçar JSON quebra na
  página vazia (204). Solução: leitura como texto e conversão no código (`corpo()`), JSON só na criação e no ganho. Depois
  da correção, ensaio de 18/11, 22h: 36 avaliações, **22 passariam** (17 Asa Sul, 5 Taguatinga) e 14 sem conversa no Kommo.
  **Lição para todo nó HTTP que lê o Kommo no n8n.**
- **Importados em tratamento** (18/11/2026, 22h20, ok do Jorge): 52 leads importados de quem tem sessão marcada no iGut de
  19 a 25/11 foram movidos para "Em tratamento" (40 Asa Sul, 12 Taguatinga), com unidade, código do iGut, particular ou
  convênio e as etiquetas "importado" e "particular"/"convênio" (`scripts/kommo/mover-tratamento.js`; conferido lendo de
  volta). O resto dos importados (706) segue em Em qualificação até decisão.
- **Teste do "Envia mensagem"** (18/11/2026, 22h11): mensagem disparada no lead do Jorge (4152970); o Kommo registrou o envio
  (`outgoing_chat_message`). No recebedor oficial, a mensagem mandada pelo Kommo chega só como status "enviada", **sem
  texto** (a Meta não repassa o texto a outro app). Para a leitura do atendimento/SDR, ver se o webhook do Kommo entrega o
  texto das mensagens enviadas.
- **Passagem e origem em modo real** (18/11/2026, 22h15, ok do Jorge; `passagem_modo` e `origem_modo` = real). Primeira
  rodada real: 16 avaliações passaram (13 Asa Sul, 3 Taguatinga; 16 ganhos na triagem), conferido no Kommo. Defeito: a
  gravação da decisão rodava depois da do resultado e escrevia "a fazer" por cima de "feito" (sem duplicar no Kommo, porque a
  rodada seguinte vê o lead na unidade); corrigido com o passo "Decisões sem envio".
- **Nome completo e código do iGut no contato** (18/11/2026, pedido do Jorge, como o "NEXO · iGut → Kommo · cadastro do
  paciente"): campo do contato "Código do iGut" (662778); contato e lead com o nome completo do iGut, e-mail só se vazio,
  **sem CPF** (regra de LGPD do Kommo da BMH). Feito nos 68 leads das unidades (`scripts/kommo/nome-do-igut.js`, conferido:
  68 com código, 64 com e-mail, nenhum "Lead #") e ligado na passagem (passo "Atualiza o contato", nunca em contato com
  outro código do iGut).
- **CPF e nascimento no contato** (18/11/2026, decisão do Jorge: "igual à Nexo, com CPF", trocando a regra de 22/10): campos
  do contato "CPF" (663106) e "Data de nascimento" (663108, tipo aniversário), preenchidos só se vazios. Feito nos 68 contatos
  das unidades (conferido: 68 com CPF de 11 dígitos, 68 com nascimento) e ligado na passagem.
- **Testes de 19/11/2026 (pedido do Jorge, "teste os não testados"):**
  1. Nascimento e CPF dos 68 contatos iguais aos do iGut (68 de 68; a conta do Kommo está em America/Sao_Paulo).
  2. Os nós "Contatos a atualizar" e "Atualiza o contato" da passagem, copiados para um fluxo temporário, atualizaram o
     contato do Jorge pelo Kommo (resposta 200, contato devolvido); fluxo apagado.
  3. Origem em modo real: mensagem simulada "Vim pelo site da BMH" no lead do Jorge gravou Origem = site, utm_source,
     utm_medium, utm_content e a etiqueta "site"; desfeito depois (fica uma linha de teste em BMH_origem_leads, conversa
     "teste", que nenhum painel lê).
  4. Mensagem enviada pelo Kommo (salesbot no lead do Jorge, 06h26): o webhook de conta (`add_message`) **não disparou** em
     20 s, e o recebedor oficial só grava "enviada" sem texto. Conclusão: o texto das respostas mandadas pelo Kommo não chega
     a nenhum dos dois caminhos. Para a leitura do atendimento e o SDR, a recepção responde pelo WhatsApp Web ou pelo celular
     (o texto chega pelo eco da coexistência).
- **Início do uso do Kommo pela equipe: 24/11/2026** (Jorge, 19/11/2026). Até lá a equipe termina as configurações; a forma de
  responder (Kommo ou WhatsApp Web, por causa do texto para o SDR) se decide antes dessa data.
- **Envio pelo Kommo confirmado no celular** (19/11/2026, 06h34): a mensagem do Jorge pelo Kommo e o "Teste 2" do salesbot
  chegaram ao celular dele. Envio pelo Kommo funcionando de ponta a ponta.
- **Importados em Perdido** (19/11/2026, ok do Jorge): os 690 importados que sobraram em Em qualificação foram para Perdido com
  o motivo "Só dúvida / agora não" e a etiqueta "importado" (`scripts/kommo/importados-perdido.js`; conferido: 690 de 690).
  Lição da API: `tags_to_add` é ignorado no PATCH de lead; mandar a lista inteira de etiquetas (as que já tinha + a nova).
- **Leitura semanal do atendimento na VPS** (19/11/2026, "VPS como Nexa"): rota `n8n-bmh-conversas` no cofre (mascarada) e
  rotinas `bmh-atendimento-*` toda segunda às 9h, de 23/11 a 11/01, que atualizam `marketing/atendimento/como-a-recepcao-atende.md`
  e mandam o resumo no Telegram. A rota vale depois do `subir-na-vps.sh`.
- **"Preciso remarcar" com etapa "Remarcar"** (19/11/2026, decisão do Jorge: "pode marcar sozinho" e "adicionar uma etapa no
  funil com essas pendências"): etapa "Remarcar" no começo dos funis Asa Sul (114327279) e Taguatinga (114327283). No modo
  real da confirmação, a resposta "Preciso remarcar" desmarca no iGut (status 3) os agendamentos do dia, leva o lead (achado
  pelo código do iGut) para "Remarcar" e deixa nota; quando o novo horário entra no iGut, a passagem devolve o lead para
  "Avaliação agendada" ou "Em tratamento", com nota. Código: `integracoes/agenda/confirmacao-resposta.js`,
  `integracoes/agenda/remarcar-lead.js` e o fim de `integracoes/kommo/passagem-decide.js`. **Testado** no lead do Jorge com
  nós copiados e entradas simuladas (ida para Remarcar e volta para Em tratamento, com as notas); o desmarcar no iGut não
  foi testado (mexeria em agenda real). Liga junto com a confirmação (`confirmacao_modo = real`).
- **Desmarcar no iGut testado** (19/11/2026, pedido do Jorge): agendamento de teste 608274 (paciente de teste 4770 "TESTE
  FATURA", hoje 18h, multiplace Asa Sul, particular) criado por `callcenters/agendar`; os nós "Um por agendamento
  (desmarca)" e "iGut · desmarca", copiados do recebedor, mudaram de "Nao Confirmado" para "Desmarcado" (conferido pela busca).
  O agendamento de teste fica na agenda como desmarcado.
- **Volta de "Remarcar" é manual** (19/11/2026, decisão do Jorge: "melhor deixar manual"). Os pacientes fazem 5 a 10 sessões
  em sequência e já têm os próximos horários marcados; o "remarcar" muitas vezes é só pular o dia. A volta automática (que
  devolveria o lead na hora, pela sessão seguinte já marcada) foi tirada da passagem; a nota do lead pede para a recepção
  mover o lead de volta depois de remarcar. O resto do "Preciso remarcar" segue: desmarca no iGut e leva para "Remarcar".
- **Modelos novos enviados à Meta** (19/11/2026, "pode" do Jorge): `confirmacao_sessao_v2` ("Sua sessão de oxigenoterapia
  hiperbárica na câmara {monoplace|multiplace} da BMH {unidade}...", 5 variáveis) e `confirmacao_avaliacao_v1` ("Sua
  avaliação na BMH {unidade}..."), utilidade, botões Confirmo e Preciso remarcar; em análise. A confirmação já monta o
  envio com eles (câmara: 111 monoplace e 112 multiplace na Asa Sul, 121 monoplace em Taguatinga). Ligar só depois de
  aprovados.
- **Cirurgião que indicou** (19/11/2026): o "profissional solicitante" do iGut é o médico da BMH que prescreve as sessões
  (levantamento de set a nov: Alberto Jorge Madeiro Leite, Lee Marvin, Alexia Hannesch, Igor Gifoni, Guilherme Ramos, o
  Jorge e outros; 1 em 4 vazio ou com o nome da câmara), não o cirurgião. Cadastro do paciente, BI da produção e agenda
  conferidos: o iGut não tem o médico que encaminhou (observação da agenda em 10 de 1.323, nenhuma citando indicação).
  Decisão do Jorge: pelo Kommo. Campos do lead novos: "CRM do cirurgião" (667908, número) e "UF do CRM" (667910, lista
  com as 27 UFs), ao lado de "Cirurgião que indicou" (nome). O painel vai agrupar por CRM + UF.
- **Confirmação em modo espelho** (19/11/2026, 09h47, "pode ligar o espelho"): `confirmacao_modo = espelho`. Roda como o
  real (quem, quando, modelo `confirmacao_sessao_v2`), mas toda mensagem vai só ao telefone de teste
  (`confirmacao_telefone_teste` em BMH_config, o número do Jorge); a resposta registra "espelho: confirmaria no iGut" ou
  "espelho: desmarcaria e levaria para Remarcar", sem mexer no iGut nem no Kommo. A linha "espelho: enviada ao teste"
  continua livre para o modo real (o paciente recebe a dele quando ligar). Avaliações ficam de fora até
  `confirmacao_avaliacao = ligada` (depois da aprovação do modelo). Primeira rodada: 3 mensagens, todas para o número de
  teste (conferido pelo destino do id da mensagem).
- **Respostas no espelho testadas** (19/11/2026, 09h49): o Jorge tocou "Confirmo" e "Preciso remarcar" em duas mensagens do
  espelho. As duas chegaram ao recebedor citando a mensagem e foram ligadas ao paciente certo pela citação (status "espelho:
  confirmaria no iGut" e "espelho: desmarcaria e levaria para Remarcar"). Conferido depois: os dois agendamentos seguem "Nao
  Confirmado / Agendado" no iGut e a coluna Remarcar do Kommo está vazia. Nenhuma falha no n8n.
- **NPS da 5ª sessão** (19/11/2026, decisões do Jorge; objetivo: avaliações no Google): fluxo "BMH · Pós-sessão · NPS da 5ª
  sessão" (`GtbHC35MgQHi7ZO6`, a cada 30 min das 9h às 20h; código em `integracoes/nps/`; tabela `BMH_nps`, sem nome nem
  celular). Quem completou a 5ª sessão da sequência de uma unidade (pausa de até 10 dias zera; levantamento de 3.849
  tratamentos: 1 sessão por dia, 85% dos intervalos de 1 dia, picos em 5 e 10 sessões), cerca de 1 h depois da sessão;
  uma vez por paciente por unidade, para sempre. **Opção A:** no primeiro dia vale para todos que já passaram da 5ª (ensaio de
  19/11: 36, sendo 4 exatamente na 5ª). Modelo `nps_sessoes_v1` (opção B: "Como estão sendo as suas sessões na BMH...?",
  botões Está ótima, Está boa, Podia ser melhor), em análise na Meta. Resposta no recebedor: ótima ou boa → link de avaliação
  no Google da unidade; podia ser melhor → pede detalhes e, no real, tarefa no Kommo para a recepção (sem aviso no Telegram
  por enquanto); o link vai 18 a 23 h depois (o Google não aceita pedir só a quem gostou). Modo `nps_modo`: ensaio hoje;
  depois espelho (telefone de teste) e real, com o "pode" do Jorge.
- **NPS aprovado e em espelho** (19/11/2026): a Meta aprovou `nps_sessoes_v1` como utilidade às 10h50. Espelho ligado às 10h53
  com limite de 5 (`nps_espelho_limite`, "pode ligar o espelho com 5"): 5 mensagens ao número de teste (8ª, 23ª, 6ª, 5ª e 10ª
  sessão); o resto fica "espelho: fora do limite de teste", que não sai no espelho e continua livre para o real.
- **NPS: "Podia ser melhor" nunca recebe o link** (19/11/2026, decisão do Jorge, avisado de que o Google proíbe pedir avaliação
  só a quem gostou). O envio do link do dia seguinte foi tirado do fluxo (`nps-link.js` apagado). Espelho testado às 10h54 com
  os três botões: ótima e boa receberam o link da unidade certa em segundos; podia ser melhor recebeu o pedido de detalhes.
- **NPS ligado de verdade** (19/11/2026, 11h06, "pode ligar o NPS"; `nps_modo = real`). Primeira rodada (mutirão da opção A):
  26 mensagens para 26 pacientes diferentes, nenhuma para o número de teste; 9 aguardando o horário da sessão de hoje.
  Primeira resposta de paciente ("Está ótima") veio em minutos, com o link enviado.
- **Pacientes em tratamento sem lead** (19/11/2026, "pode criar, mas checar antes no Kommo"): dos 66 pacientes com sessão de 19
  a 26/11, 15 não tinham lead nas unidades. Conferido no Kommo (827 contatos, pelo código do iGut e pelo telefone com nome
  compatível): 4 já tinham contato (ganharam lead novo), 10 eram novos (contato com nome completo, telefone, código, CPF,
  nascimento e e-mail, e lead), todos em "Em tratamento" com a etiqueta "criado pelo iGut"
  (`scripts/kommo/em-tratamento-sem-lead.js`). 1 ficou de fora: o telefone dele está num contato com outro nome (parente ou
  apelido), para a recepção conferir. Depois: 66 em Em tratamento, todos com código do iGut e contato.
- **Avanço de etapa e fim de tratamento pelo iGut** (19/11/2026, "pode montar assim e vemos para frente"), na passagem, em modo
  real (`passagem_modo`), como reserva da recepção, só para a frente: avaliação finalizada (ontem ou hoje) → Avaliou · pedido a
  enviar; sessão finalizada → Em tratamento (de Avaliação agendada, Avaliou ou Aguardando convênio: o particular que espera o
  convênio volta sozinho); Em tratamento com mais de 10 dias sem sessão e nenhuma marcada → tarefa para a recepção (Concluiu ou
  Perdido · Interrompeu), com a pista pelo número de sessões (múltiplo de 5 = provável pacote completo), uma por fim de
  sequência (chave fim|lead|última sessão em BMH_passagens); Aguardando convênio não recebe tarefa. A agenda da passagem passou a
  começar ontem (as avaliações novas continuam contando de hoje). Primeiro giro (12h14): 3 leads da Asa Sul foram para
  Avaliou. Obs.: a trava de ensaio anunciada não entrou (o script de edição parou numa conferência) e o fluxo foi publicado já
  em real; mantido assim por estar dentro do que o Jorge autorizou.
- **Modelo da avaliação reenviado** (19/11/2026, 12h20, pedido do Jorge): `confirmacao_avaliacao_v1` ficou mais de 3 h em análise;
  foi apagado e reenviado como `confirmacao_avaliacao_v2`, mesmo texto. A confirmação já usa o nome novo.
- **Modelo da avaliação aprovado** (19/11/2026, 12h37, `confirmacao_avaliacao_v2`, utilidade). Avaliações ligadas no espelho da
  confirmação (`confirmacao_avaliacao = ligada`): 2 mensagens de avaliação ao número de teste na primeira rodada, 1 aguardando.
- **Confirmação para todos e recado depois do "Confirmo"** (19/11/2026, 18h55, decisão do Jorge a partir da recepção: "mesmo
  confirmando oral tem que mandar a confirmação ao paciente porque se não eles não vêm"): a confirmação passa a ir também para
  quem já está confirmado no iGut (a regra ganha " · já confirmado no iGut"). Depois do "Confirmo", o recebedor responde em texto
  livre (a janela de 24 h abre com o toque no botão): "Confirmado, obrigado! Chegue com 20 a 30 minutos de antecedência: o embarque na câmara é de 5 a 10 minutos antes do horário marcado. Como
  chegar à BMH {unidade}: {mapa do Perfil do Google}", uma vez só por confirmação, para quem tocou (no espelho, o número de
  teste; em ensaio, nada). A mensagem manual do iGut (com link) que a recepção manda às 18h30 continua até o robô estar provado
  no real (Jorge: "só quando você aprender"). Cópias antes: `dados/n8n-copias/{j9fKHps4n9xGDGL8,YES97ES0JdBQW4bt}-antes-recado-20261119.json`.
- **Confirmação no modo real** (20/11/2026, 06h10, "pode ligar a confirmação"): `confirmacao_modo = real`. Ligada de madrugada para
  não mandar de uma vez as 59 linhas do espelho de 20/11 (essas já são "hoje" e não saem mais); a primeira rodada de verdade é a
  das 7h04, com as sessões e avaliações de 21/11. O recado depois do "Confirmo" da avaliação ficou só com o mapa (sem "embarque
  na câmara") até o Jorge definir o horário de chegada da avaliação. Espelho de 19/11: 60 pacientes, 59 mensagens ao número de
  teste, 4 respostas do Jorge ligadas certo, iGut e Kommo intactos. Cópia do recebedor antes:
  `dados/n8n-copias/YES97ES0JdBQW4bt-antes-recado-avaliacao-20261120.json`.
- **Horário alterado depois do envio** (20/11/2026, 06h51, pedido do Jorge): se a recepção muda o horário de amanhã depois que a
  confirmação saiu, a rodada seguinte manda de novo com o horário novo (status "enviada (horário alterado)"), zerando a resposta,
  para o recado do "Confirmo" sair de novo; o "Confirmo" da mensagem antiga cai no telefone e confirma os agendamentos novos.
  Agendamento trocado no mesmo horário só atualiza a linha (guarda id da mensagem e resposta). Envio que falhou e modo ensaio não
  reenviam. Testado no Mac com agenda simulada nos três modos. Cópia antes: `dados/n8n-copias/j9fKHps4n9xGDGL8-antes-reenvio-20261120.json`.
- **Agendamento refeito de quem já confirmou** (21/11/2026, pedido do Jorge): se o paciente tocou "Confirmo" e a recepção refaz
  o agendamento no mesmo horário, o agendamento novo nascia "Não confirmado" no iGut (1 caso em 21/11). Agora a confirmação da
  véspera confirma no iGut só os agendamentos novos e ainda não confirmados desse paciente (modo real; espelho e ensaio não mexem).
  Vale até as 21h da véspera, como o reenvio. Testado no Mac com agenda simulada nos três modos. Cópia antes:
  `dados/n8n-copias/j9fKHps4n9xGDGL8-antes-refeito-20261121.json`.
- **Passagem e campo Convênio** (21/11/2026): os campos "Convênio" (626680) e "Tipo de caso" (626682) foram apagados no Kommo e a
  passagem falhou das 14h11 às 19h41 (o Kommo recusa o lead inteiro). A passagem não manda mais o campo; o nome do convênio fica
  no detalhe de BMH_passagens. Cópia antes: `dados/n8n-copias/YSJaUQMQffVcfmra-antes-campo-convenio-20261121.json`.
- **Texto do que saiu pelo Kommo** (22/11/2026, pedido do Jorge): o recebedor da Meta não recebe o que sai pelo Kommo (162
  mensagens do salesbot em 24 h, nenhuma na tabela); as linhas "sem texto" eram do robô do n8n (confirmação, recado do
  "Confirmo", NPS). Fluxo novo `BMH · WhatsApp · texto do que saiu pelo Kommo` (`V1kmaPiSLKtZKc05`, a cada 30 min das 7h às
  22h, últimas 3 h): grava em BMH_whatsapp_meta cada mensagem do Kommo com o texto mascarado (chave `kommo:<id>`, telefone em
  código pelo contato do Kommo) e põe uma descrição nas do robô. Primeira carga de 72 h: 447 linhas novas do Kommo, 7
  preenchidas e 305 do robô descritas; segunda rodada sem repetir. Só lê o Kommo.
- **Cirurgião por CRM na passagem e roteiro da recepção** (26/11/2026): o campo "Cirurgião que indicou" (626674) também foi
  apagado no Kommo; a passagem deixou de copiá-lo e passou a levar "CRM do cirurgião" (667908) e "UF do CRM" (667910) para o
  lead da unidade (antes não levava). Cópia antes: `dados/n8n-copias/YSJaUQMQffVcfmra-antes-crm-cirurgiao-20261126.json`.
  Roteiro da recepção com prints (nomes trocados e mensagens borradas): https://claude.ai/artifact/CFBdxzoKY8SNE4vianqFoa.
  Retrato do uso em 26/11: 170 conversas paradas na entrada sem aceitar, Orçamento enviado e Follow-up vazios, CRM vazio nos
  12 leads novos desde 24/11, 12 leads em Remarcar (até 5 dias), 1 usuário só na conta.
