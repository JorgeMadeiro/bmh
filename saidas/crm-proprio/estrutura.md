# CRM próprio da BMH: estrutura para aprovar

> Desenho de 12/10/2026, para o Jorge ir aprovando por partes. **Nada foi construído:** nenhum fluxo, tabela, site ou
> Kommo foi tocado. A construção só começa depois de 30 dias de mensagens observadas no WhatsApp "BMH Recepção"
> (decisão do Jorge em 12/10/2026). Contando da reconexão do número em 20/10, os 30 dias vão até cerca de 19/11; se a
> reconexão mudar de data, o prazo anda junto.
> O protótipo clicável, com dados fictícios, está em `prototipo.html`, nesta mesma pasta.

**Em uma frase:** um sistema simples, com login individual, onde a recepção acompanha cada pessoa que procurou a BMH
desde a primeira mensagem até o fim do tratamento, sabendo de onde ela veio, quanto custou trazê-la e quem mexeu em quê.

**O que ele não é:** não é a agenda nem o prontuário. Agenda, cadastro clínico e prontuário continuam no iGut. Se o CRM
cair um dia, a clínica continua funcionando pelo WhatsApp e pelo iGut; perde-se só o acompanhamento daquele dia.

---

## 1. Etapas do funil

Cada pessoa que procura a BMH vira uma **oportunidade** (um pedido de tratamento). A mesma pessoa pode ter mais de uma
ao longo dos anos (uma cirurgia em 2026, outra em 2028).

| Etapa | Entra quando | Sai quando | Quem cuida | Parado demais |
|---|---|---|---|---|
| 1. Novo contato | chega a primeira mensagem no WhatsApp, uma ligação ou um pedido do site | alguém (recepção ou atendente de IA) responde | atendente de IA ou recepção | 15 min no horário da clínica |
| 2. Em conversa | a primeira resposta foi dada | o caso está entendido: tipo de caso, unidade, convênio ou particular, como conheceu a BMH | recepção | 2 dias sem resposta da pessoa |
| 3. Pedido e autorização | falta o pedido médico ou a autorização do convênio | o pedido chegou e, se for convênio, a guia foi autorizada (ou negada) | recepção | 5 dias |
| 4. Avaliação agendada | a avaliação foi marcada no iGut | a pessoa veio ou faltou | recepção | até a data da avaliação |
| 5. Avaliou | a avaliação foi finalizada no iGut | a primeira sessão aconteceu, ou a pessoa desistiu | recepção | 7 dias sem sessão marcada |
| 6. Em tratamento | a primeira sessão foi finalizada no iGut | a última sessão do protocolo | recepção | 10 dias sem sessão |
| 7. Concluiu | o protocolo terminou | fica arquivada como ganha | recepção | não se aplica |
| Perdido | a pessoa não segue, em qualquer etapa | não sai; pode virar oportunidade nova no futuro | recepção | não se aplica |

**Por que essas etapas.**
- **1 e 2 separadas** porque a velocidade da primeira resposta é o que mais pesa em quem chega pelo anúncio; com as duas,
  o relatório mostra quanto tempo cada contato esperou.
- **3 existe porque na BMH quase todo caso depende de papel:** pedido do cirurgião ou do médico, e, no convênio, a
  autorização. É onde o paciente costuma se perder sem ninguém perceber. Se a autorização for rápida e rara de travar,
  a etapa 3 pode sumir (pergunta 1 no fim).
- **4 e 5 seguem o iGut:** "Avaliação sem Custo" e "Reserva de Horário Avaliação" já existem lá. O CRM não pede que a
  recepção mova a etapa à mão nessas duas: o iGut avisa e o CRM move sozinho.
- **6 e 7 servem ao retorno e ao cirurgião:** quem concluiu é quem pode deixar avaliação no Google e é o paciente cujo
  resultado volta para o cirurgião que indicou.

**Motivo de perda obrigatório**, de uma lista fixa (sem ele, o cartão não vai para "Perdido"):

| Código | Motivo | O que fazer depois |
|---|---|---|
| CONVENIO | convênio não cobre ou negou | arquivar; contar por convênio no relatório |
| PRECO | particular achou caro | arquivar; nunca desconto automático |
| SEM_INDICACAO | o médico não indicou, ou há contraindicação | arquivar; nunca entra em campanha |
| SUMIU | parou de responder depois de 3 tentativas | arquivar |
| TEMPO | agora não dá (viagem, cirurgia adiada) | tarefa com a data que a própria pessoa deu |
| OUTRO_LUGAR | foi para outro serviço | arquivar; anotar qual, se ela disse |
| FORA | não é caso da BMH (estética, bem-estar, urgência fora do horário) | arquivar |

**Conversa que não é oportunidade** (paciente em tratamento remarcando, fornecedor, currículo, engano) recebe a marca
"não é oportunidade" e não entra no funil, para não sujar os números.

---

## 2. Tabelas e campos

O banco tem poucas tabelas e poucos campos de propósito: cada campo existe porque um relatório ou uma tarefa precisa
dele (regra 1 da LGPD: coletar menos).

### contatos (a pessoa)

| Campo | Para quê | Observação |
|---|---|---|
| id | identificar | automático |
| nome | chamar a pessoa pelo nome | como ela se apresenta |
| telefone | ligar a pessoa à conversa do WhatsApp | formato +55 61 9xxxx-xxxx |
| telefone_hash | mandar a conversão ao Google sem mandar o número | automático |
| numero_oculto | quando o WhatsApp esconde o número (código @lid) | automático |
| igut_paciente_id | ligar ao cadastro do iGut | preenchido quando a recepção cadastra no iGut |
| nao_contatar | pediu para não receber mensagem | trava qualquer envio futuro |
| criado_por, criado_em, alterado_por, alterado_em | saber quem criou e quem mexeu por último | automático; o detalhe fica no histórico |
| apagar_em | data em que os dados pessoais saem | recalculada a cada movimento (ver LGPD) |

**Não entram:** CPF, data de nascimento, endereço, e-mail (só se a pessoa pedir contato por e-mail), diagnóstico, nome da
cirurgia, foto, exame, pedido médico em arquivo. Tudo isso já mora no iGut.

### oportunidades (o pedido de tratamento)

| Campo | Para quê |
|---|---|
| id, contato_id | ligar à pessoa |
| etapa | onde está no funil |
| unidade | Asa Sul ou Taguatinga |
| tipo_caso | lista fixa: pós-operatório de cirurgia plástica, ferida de difícil cicatrização, aptidão para mergulho, acidente de mergulho, outro |
| pagamento | convênio ou particular |
| convenio | um dos 50 da lista (`_memoria/convenios.md`) |
| cirurgiao_indicador_id | quem indicou, se foi um cirurgião ou outro médico |
| como_conheceu | lista: cirurgião ou médico, paciente ou conhecido, Google (anúncio), Google (busca), Instagram, site, outro. **Obrigatório para sair de "Em conversa"** |
| responsavel_id | quem da recepção cuida |
| motivo_perda, nao_e_oportunidade | ver etapas |
| origem: utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, gbraid, wbraid, fbclid, pagina_entrada, caso_do_botao, local_do_botao, referrer | de onde veio, preenchido sozinho pelo site e pelo anúncio |
| origem_resumo | uma linha legível: "Google Ads / pós-operatório", "Instagram / bio", "Indicação / Dr. X" |
| datas: primeira_mensagem_em, primeira_resposta_em, agendou_em, avaliou_em, primeira_sessao_em, concluiu_em, perdeu_em | medir tempo em cada etapa e montar o relatório |
| igut_agendamento_id | ligar ao agendamento da avaliação |
| enviado_google_agendou, enviado_google_compareceu | não mandar a mesma conversão duas vezes ao Google Ads |
| criado_por | uma pessoa da recepção, "atendente de IA" ou "sistema" |

**Por que "como conheceu" é obrigatório:** cerca de 90% dos pacientes vêm por indicação de cirurgião, e indicação não
deixa rastro automático. O anúncio e o site o sistema pega sozinho; a indicação só existe se a recepção perguntar. Sem
esse campo, o relatório mostraria que quase ninguém veio de lugar nenhum.

### historico (auditoria)

Uma linha para cada mudança, gravada pelo próprio banco (ninguém consegue mexer ou apagar, nem o Jorge).

| Campo | Exemplo |
|---|---|
| quando | 21/11/2026 10:42 |
| quem | Recepcionista A, atendente de IA, sistema (iGut) |
| o_que | criou, alterou, moveu de etapa, abriu a ficha, exportou, apagou a pedido do titular |
| tabela e registro | oportunidade 214 |
| campo, valor_antes, valor_depois | etapa: "Em conversa" para "Avaliação agendada" |
| aparelho | celular ou computador, e o endereço de internet |

**"Abriu a ficha" também fica registrado**, porque é dado de saúde: se um dia alguém perguntar quem viu o cadastro de uma
pessoa, a resposta existe.

### usuarios e permissões

| Campo | Para quê |
|---|---|
| nome, e-mail | entrar no sistema (cada pessoa com o seu) |
| perfil | recepção, diretoria ou administrador (ver seção 3) |
| unidade | Asa Sul, Taguatinga ou as duas |
| ativo | desligar no mesmo dia em que a pessoa sai da clínica |
| ultimo_acesso | ver quem usa |
| senha | guardada embaralhada (nem o Jorge vê); troca pelo "esqueci a senha" |
| verificacao_em_duas_etapas | código do celular, obrigatório para diretoria e administrador |

Além das pessoas, dois "usuários técnicos", sem tela: **atendente de IA** (o SDR) e **sistema** (as integrações do
n8n: iGut, site, Google Ads). Cada um com chave própria e só com as permissões que precisa.

### tarefas (retornos e pendências)

| Campo | Exemplo |
|---|---|
| oportunidade_id | a quem se refere |
| tipo | responder, cobrar pedido médico, conferir autorização, confirmar avaliação, retorno pós-tratamento, pedir avaliação no Google |
| prazo | data e hora |
| responsavel_id | quem faz |
| criada_por | pessoa, atendente de IA ou sistema |
| situacao, concluida_em, concluida_por, resultado | fechar o ciclo |

Algumas nascem sozinhas: contato novo sem resposta em 15 min, cartão parado além do tempo da etapa, a passagem do
atendente de IA para a recepção.

### notas

Texto curto preso à oportunidade (autor, data, fixada ou não). Na caixa de texto, um aviso fixo: **"não escreva
diagnóstico, exame, CPF ou detalhe clínico; isso vai no iGut".**

### Tabelas de apoio

- **mensagens:** a conversa do WhatsApp, a mesma que hoje vai para `BMH_whatsapp_mensagens` (texto, áudio transcrito, sem
  CPF, 6 meses). Na fase 2 ela passa a ser gravada no banco do CRM, para os dados de paciente ficarem num lugar só.
- **cliques_site:** cada clique no WhatsApp do site, com página, caso do botão, gclid e UTMs. **Sem dado pessoal.**
- **gasto_anuncios:** gasto por dia e por campanha, copiado da tabela que o painel já grava (`BMH_google_anuncios_dia`).
- **cirurgioes:** nome, CRM, código de indicação (o mesmo de `saidas/site-novo/utms.md`), ativo. Dado público de
  profissional.
- **listas:** etapas, motivos de perda, tipos de caso, convênios. Só o administrador muda.

---

## 3. Perfis de acesso

| O que | Recepção | Diretoria | Jorge (administrador) |
|---|---|---|---|
| Ver e mexer em contatos e oportunidades | da sua unidade | das duas | das duas |
| Criar, mover etapa, escrever nota, criar tarefa | sim | sim | sim |
| Ver o histórico da ficha | sim | sim | sim |
| Relatório da própria unidade, sem custo | sim | sim | sim |
| Relatório com gasto do Google Ads e custo por paciente | não | sim | sim |
| Exportar (sempre só números, nunca lista com nome e telefone) | não | sim | sim |
| Mudar etapas, motivos, convênios | não | não | sim |
| Criar e desligar usuários | não | não | sim |
| Ver quem abriu cada ficha (registro de acesso) | não | não | sim |
| Apagar os dados de uma pessoa a pedido dela | não | não | sim, com confirmação dupla |
| Apagar qualquer outra coisa | ninguém | ninguém | ninguém (só o fluxo de limpeza, pelo prazo) |

Regras que valem para todos: **um login por pessoa, nunca compartilhado** (é o que torna o histórico verdadeiro);
a sessão expira depois de 12 horas; 5 senhas erradas bloqueiam por 15 minutos e avisam o Jorge no Telegram, sem nome.

---

## 4. Telas

1. **Entrar:** e-mail e senha, "esqueci a senha", código do celular para diretoria e Jorge.
2. **Funil:** colunas por etapa. Cada cartão mostra nome, tipo de caso, convênio ou particular, origem, há quanto tempo
   está parado (fica laranja e depois vermelho) e se tem tarefa vencida. Filtros: unidade, responsável, origem, tipo de
   caso. No celular, uma etapa por vez, escolhida numa fileira de botões.
3. **Ficha do contato:** dados mínimos, origem, oportunidade atual e anteriores, tarefas, notas, a conversa do WhatsApp
   só para ler, e a linha do tempo com o histórico (quem, quando, o que mudou).
4. **Minhas tarefas:** vencidas, de hoje e próximas, de quem está logado.
5. **Relatório:** ver seção 5.
6. **Administração (só Jorge):** usuários, listas, registro de acesso, pedidos de titular.
7. **Busca:** por nome ou pelos últimos dígitos do telefone, sempre visível no topo.

O protótipo mostra as telas 1, 2, 3 e 5.

---

## 5. Relatórios

Todos contam **pelo mês em que o contato chegou**: o gasto de novembro é comparado com quem chegou em novembro, mesmo que
tenha agendado em dezembro.

1. **Origem e custo (o principal).** Uma linha por origem e, no Google Ads, por campanha:

   | Origem | Gasto | Contatos | Agendaram | Vieram à avaliação | Iniciaram tratamento | Custo por contato | Custo por agendado | Custo por paciente |
   |---|---|---|---|---|---|---|---|---|

   O gasto vem da tabela que o painel já grava todo dia. "Vieram" e "iniciaram" vêm do iGut (atendimento finalizado),
   não da recepção, para ninguém precisar marcar à mão. Origem sem gasto (indicação, Instagram orgânico) aparece com
   contagem e sem custo.
2. **Funil do mês:** quantos entraram em cada etapa, quantos passaram, e o tempo médio parado em cada uma. A etapa onde
   a passagem cai é onde o processo falha, não a pessoa.
3. **Indicações:** pacientes por cirurgião que indicou, quantos vieram e quantos concluíram. Serve para cuidar da relação
   com o cirurgião, nunca para pagar por indicação (o CFM veda).
4. **Atendimento:** tempo até a primeira resposta, por faixa de horário e por pessoa; contatos que chegaram fora do
   horário.
5. **Perdas:** motivos por origem, por unidade e por convênio (mostra qual convênio mais nega).
6. **Tarefas vencidas** por responsável.

**De volta ao Google Ads:** quando a pessoa tem gclid, o sistema avisa ao Google que ela agendou e, depois, que veio.
Assim a campanha aprende a buscar gente que vira paciente, e não só gente que clica (é o que a Nexo já faz com o Kommo).

**Cuidado com conclusão cedo:** funil precisa de 2 a 3 meses de dados para dizer onde está o problema. Antes disso o
relatório mostra direção, e diz isso no topo.

---

## 6. Como o site, o anúncio e o atendente de IA se ligam

### Site e anúncio: a origem entra sozinha

O site da BMH **não tem formulário hoje**: todo contato é pelo botão de WhatsApp, que já abre com uma mensagem pronta do
caso (pós-operatório, ferida, mergulho, convênio...). O caminho proposto copia o que já funciona na Nexo:

1. Quando a pessoa entra no site, o Tag Manager guarda o gclid (clique do anúncio) e as UTMs da página de entrada.
2. No clique do WhatsApp, ele manda página, caso do botão, local do botão, gclid e UTMs para o n8n, que grava em
   `cliques_site` (sem nome nem telefone).
3. Quando a primeira mensagem chega no WhatsApp da recepção, o sistema liga a conversa ao clique mais recente do mesmo
   caso, feito até 3 horas antes, e preenche a origem da oportunidade.
4. Se a pessoa apagar a mensagem pronta, a ligação falha e a recepção preenche "como conheceu".

**Melhoria em relação à Nexo, para aprovar na fase 2:** acrescentar um código curto no fim da mensagem pronta ("Olá, BMH!
Vim pelo site. (ref. 4821)"). Com ele a ligação deixa de ser palpite e passa a ser exata. O custo é um número estranho
na mensagem do paciente.

**Se o site ganhar formulário** (por exemplo, uma faixa "a gente te chama", como a da Nexo, ou um formulário para
cirurgião), ele leva **campos escondidos** preenchidos pelo Tag Manager: utm_source, utm_medium, utm_campaign, utm_term,
utm_content, gclid, gbraid, wbraid, fbclid, pagina_entrada, pagina_do_formulario e referrer. A pessoa não vê nem
preenche nada disso.

**Links que a BMH controla** já têm UTM pronta em `saidas/site-novo/utms.md` (bio do Instagram, perfis do Google,
cartão do cirurgião com código, QR da recepção). Anúncio do Google leva gclid automático; anúncio da Meta que abre o
WhatsApp direto leva mensagem própria ("Olá, BMH! ...") que o sistema reconhece.

### O atendente de IA (SDR): lê e escreve nas mesmas tabelas

O atendente de IA é um fluxo do n8n (como a Nexa da Nexo), que usa o CRM como memória:

- **Lê:** o contato pelo telefone, a oportunidade aberta e a etapa, as últimas mensagens, a lista de convênios, se um
  humano já assumiu.
- **Escreve:** cria contato e oportunidade, preenche tipo de caso, unidade, convênio, como conheceu e um resumo curto
  **sem diagnóstico**; move só entre as etapas 1, 2 e 3; cria a tarefa "assumir conversa" para a recepção com prazo de
  15 minutos.
- **Nunca:** marca perdido, apaga, agenda no iGut sem humano, nem responde depois que um humano assumiu (o campo
  "humano assumiu" desliga o atendente naquela conversa).
- Tudo que ele faz aparece no histórico como "atendente de IA", igual a uma recepcionista.
- **Responder sozinho no WhatsApp** é decisão à parte: o número da recepção hoje só observa, e robô respondendo pela
  Evolution arrisca bloqueio do número. Para responder, o caminho seguro é a API oficial do WhatsApp com "coexistência"
  (a equipe continua usando o celular). Até lá, o atendente pode só **sugerir** a resposta para a recepção (pergunta 5).

### iGut: agendou, veio, iniciou

Um fluxo do n8n lê a agenda do iGut (dia a dia, porque o mês inteiro dá erro de tempo) e, pelo telefone ou pelo
`igut_paciente_id`, move a oportunidade para "Avaliação agendada", "Avaliou" e "Em tratamento". Quando houver dúvida
de quem é quem, cria tarefa para a recepção conferir, em vez de adivinhar.

---

## 7. LGPD

O CRM guarda dado de saúde (o tipo de caso já diz que a pessoa fez cirurgia plástica ou tem uma ferida). Por isso:

**Mínimo necessário.** Só os campos da seção 2. Nada de CPF, nascimento, endereço, diagnóstico, exame, foto ou arquivo:
isso fica no iGut, que é o prontuário. A nota tem aviso fixo. O Telegram de alerta nunca leva nome nem telefone (a
máscara do "BMH · Alerta de falha" já faz isso).

**Acesso.** Login individual, perfil por função e por unidade, verificação em duas etapas para quem vê tudo, registro
de quem abriu cada ficha, usuário desligado no dia da saída, nenhuma exportação com nome e telefone.

**Prazo de guarda (proposta, pergunta 3):**

| O quê | Prazo | Depois |
|---|---|---|
| Conversa do WhatsApp | 6 meses (já decidido em 09/10/2026) | apagada pelo fluxo que já existe |
| Quem não virou paciente (perdido ou sumiu) | 12 meses depois do último movimento | nome, telefone e notas apagados; ficam só números sem identificação (origem, etapa, datas, motivo) para o relatório |
| Quem virou paciente | 24 meses depois da última sessão (para retorno e para o cirurgião) | mesma anonimização |
| Histórico (auditoria) | enquanto o CRM existir | os valores pessoais viram "[apagado]"; fica quem fez o quê e quando |
| Prontuário e agenda | 20 anos, no iGut | não é afetado pelo CRM |

**Como apaga, coerente com o que já existe.** O fluxo "BMH · WhatsApp · apaga conversas vencidas" roda todo dia às 4h37,
apaga pelo campo `apagar_em` e grava só a contagem em `BMH_limpeza_registro`. O CRM segue o mesmo desenho: campo
`apagar_em` em cada contato, recalculado a cada movimento, e um fluxo **"BMH · CRM · apaga vencidos"** às 4h52 (depois da
limpeza das conversas), que anonimiza o que venceu e grava só a contagem na mesma tabela de registro. Esse fluxo entra
**antes** do primeiro dado real.

**Pedido do titular** ("apaguem meus dados"). Botão só do Jorge, com confirmação dupla. Apaga em todo lugar de uma vez:
contato, oportunidades, notas, tarefas, conversas (no CRM e em `BMH_whatsapp_mensagens`, pelo telefone) e anonimiza o
histórico. Registra o pedido (data, sem o dado). Resposta em até 15 dias. O que não se apaga, e se diz por quê: o
prontuário no iGut (guarda legal) e a conversão já enviada ao Google (foi só o número embaralhado, sem nome).

**Cópias de segurança.** O banco faz cópia diária guardada por 7 dias. O que foi apagado some das cópias em até 7 dias;
isso entra na política de privacidade.

**Antes de ligar** (regra da skill `lgpd`): linha nova no mapa da BMH (`~/.claude/skills/lgpd/referencias/mapa-por-pasta.md`)
com onde mora, quem trata, base legal, prazo e como apaga; tabela de operadores (o serviço do banco, a Hostinger, a VPS do
n8n, a Evolution, a OpenAI); política de privacidade do site atualizada. Para o atendente de IA, que é uso novo (IA
lendo conversa de paciente), o **relatório de impacto de uma página**, mostrado ao Jorge antes da fase 5.

**Base legal, a confirmar com o advogado:** contato e agendamento a pedido da própria pessoa (art. 7º, V); o tipo de caso,
que é dado de saúde, na tutela da saúde por serviço de saúde (art. 11, II, f). Nenhuma das duas cobre marketing: o CRM
não serve para disparo de campanha com dado de saúde.

---

## 8. Onde pode rodar

Login de verdade exige um **servidor com senha**: algo que confere quem entrou, guarda as senhas embaralhadas, manda o
e-mail de "esqueci a senha", bloqueia tentativa repetida e registra o acesso. Uma página solta (como o protótipo) não faz
isso. Quem cuida desse servidor também precisa: aplicar atualização de segurança, conferir as cópias, renovar o
certificado do endereço, desligar usuário que saiu e olhar o alerta quando algo falhar. A diferença entre as opções é
**quem faz essa parte**.

| | A. Dentro do n8n (como o painel) | B. Banco gerenciado no Brasil (Supabase, São Paulo) + página na Hostinger | C. Servidor próprio (a VPS do n8n ou uma nova) |
|---|---|---|---|
| Como seria | tabelas do n8n e páginas servidas pelo próprio n8n | banco de dados com login pronto, regras de acesso por perfil e cópias diárias; a página fica num endereço como `crm.hiperbaricabrasilia.com.br` | banco e programa de login montados por nós, no servidor |
| Login individual | não de verdade: o painel hoje usa um login só para todos | sim, pronto: senha, "esqueci a senha", código no celular | sim, mas feito por nós |
| Histórico à prova de mexida | não (a API do n8n nem altera nem apaga linha de tabela, e não tem gatilho de auditoria) | sim, gravado pelo próprio banco | sim, feito por nós |
| Onde ficam os dados | VPS do n8n | Brasil (São Paulo) | VPS |
| Quem atualiza a segurança do servidor | nós | o fornecedor | nós |
| Se cair | cai junto com todas as automações | cai só o CRM; n8n segue | se for a mesma VPS, cai tudo junto |
| Custo novo por mês | zero | cerca de US$ 25 (plano pago, que não pausa e tem cópia diária; conferir o preço e o dólar na contratação). A Hostinger já é paga | zero na mesma VPS; uma VPS separada custa algo como R$ 50 a 100 (conferir) |
| Manutenção para o Jorge | baixa no começo, alta quando quebrar | baixa: o fornecedor cuida do servidor; o Claude cuida só da página e dos fluxos | alta: atualização mensal, cópia, certificado, invasão, tudo conosco |

**Recomendação: B.** É a única em que o login, o histórico gravado pelo banco e as cópias vêm prontos, com os dados no
Brasil, sem o Jorge virar dono de servidor. O n8n continua fazendo o que já faz bem (WhatsApp, iGut, Google Ads) e passa
a escrever no banco do CRM. A opção A serve de protótipo de relatório, não de CRM. A opção C só vale se o Jorge fizer
questão de não ter mais um fornecedor, sabendo que a manutenção vira rotina mensal.

**O que a manutenção da B implica, na prática:** criar e desligar usuário (tela do Jorge), conferir uma vez por mês o
registro de acesso e as cópias, e ajustar a página quando um campo mudar (sessão com o Claude). Plano B manual: se o CRM
sair do ar, a recepção segue no WhatsApp e no iGut e lança depois.

**Contratar o Kommo para a BMH** é a alternativa de não construir nada. Ele cobra por usuário por mês (a Nexo já paga:
conferir o valor na fatura). A comparação honesta está abaixo.

---

## 9. Kommo × nosso

| Funcionalidade | Kommo (como na Nexo) | Nosso | Saldo |
|---|---|---|---|
| Funil em colunas, arrastar cartão | sim | sim | igual |
| Tarefas com prazo e responsável | sim | sim | igual |
| Notas, fixar nota | sim | sim | igual |
| Usuários e perfis | sim | sim, mais finos (por unidade, sem exportação) | igual ou melhor |
| Histórico de quem mudou o quê | sim, por eventos | sim, com valor antes e depois de cada campo e quem abriu a ficha | **melhor** |
| Origem automática (gclid, UTM, clique do site) | só com os nossos fluxos do n8n preenchendo campos | nativo, nos campos certos | **melhor** |
| Ligação com o iGut (agendou, veio) | pelo n8n | pelo n8n | igual |
| Relatório com gasto do Google Ads e custo por paciente | não; a Nexo faz no painel à parte | dentro do CRM | **melhor** |
| Regras da BMH (motivo de perda obrigatório, "como conheceu", aviso na nota, apagar no prazo) | parte dá para configurar, parte não | do jeito da BMH | **melhor** |
| Dados no Brasil e prazo de apagar automático | não | sim | **melhor** |
| Custo | por usuário, cresce com a equipe | fixo, não muda com o número de pessoas | **melhor** a partir de poucos usuários |
| **Caixa de entrada do WhatsApp dentro do CRM (responder dali)** | sim | **não**: a conversa aparece só para ler; a recepção responde no celular ou no WhatsApp Web, como hoje | **pior** |
| Robô montado pela própria equipe (salesbot) | sim, arrastando blocos | não; automação nova é pedido ao Claude no n8n | **pior** |
| Mensagem em massa e modelos aprovados do WhatsApp | sim, com o número oficial | **não teremos** (e pela Evolution não se faz) | **pior** |
| Aplicativo de celular com notificação | sim | página que abre no celular e vira ícone na tela, sem notificação; aviso urgente pelo Telegram | **pior** |
| Ligação telefônica pelo sistema | sim, com integração | não teremos | **pior** |
| Suporte de uma empresa | sim | o Claude, em sessão com o Jorge | **pior** |
| Tempo até usar | dias | semanas, em fases | **pior** |
| Campo novo | a equipe cria na hora | ajuste de código | **pior** |

**Resumo honesto:** o nosso ganha em medição (origem, custo, iGut), em regra própria e em LGPD; perde em conforto do dia a
dia da recepção, principalmente por não responder o WhatsApp de dentro do CRM. Se a recepção não lançar "como conheceu"
e não mover os cartões, o CRM vira um relatório incompleto: a adoção é o maior risco, não a tecnologia.

---

## 10. Fases de construção

| Fase | O que se faz | O que o Jorge aprova antes de seguir |
|---|---|---|
| 0. Observação (até cerca de 19/11/2026) | só as conversas são gravadas (já acontece); no fim, análise de 30 dias: tipos de caso, perguntas mais comuns, tempo de resposta, quantas viram avaliação | etapas, motivos de perda e campos finais; onde rodar; quem recebe login |
| 1. Base com login | banco, usuários, perfis, histórico, fluxo de limpeza, telas de entrar, funil e ficha, **só com dados fictícios** | entra com o próprio login, cria uma recepcionista de teste, confere o histórico |
| 2. Entrada automática | conversa nova do WhatsApp vira oportunidade; origem do site e do anúncio; conversas passam a ser gravadas no banco do CRM; mapa LGPD e política atualizados; recepção usa em paralelo por 2 semanas | a recepção consegue usar no celular; quantos contatos novos saem com origem preenchida |
| 3. iGut e relatório | agendou, avaliou e iniciou vindos do iGut; relatório com gasto do Google Ads; conversões devolvidas ao Google Ads | os números batem com o painel e com o iGut no mesmo período; ok para mandar conversões ao Google |
| 4. Uso pleno | recepção passa a usar só o CRM para acompanhar; tarefas automáticas; tela de administração | primeiro relatório do mês completo |
| 5. Atendente de IA | relatório de impacto LGPD; roteiro; teste com conversas fictícias; começa só sugerindo resposta | roteiro, teste e o modo (sugere ou responde) |
| 6. Cirurgiões (opcional) | funil de relacionamento com os cirurgiões que indicam | se vale a pena |

Cada fase termina com prova: o que foi testado, como, e o que ficou pendente. Nenhuma passa para dado real sem o ok
do Jorge.

---

## 11. Perguntas que só o Jorge responde

1. **Etapas:** a autorização do convênio costuma travar o paciente a ponto de merecer etapa própria ("Pedido e
   autorização"), ou é rápida e pode ficar só como tarefa?
2. **Logins:** quantas pessoas da recepção, em cada unidade, e quem mais da diretoria (Dr. Alberto, Dr. Hélio, gerência,
   financeiro)? A recepção de uma unidade pode ver os contatos da outra?
3. **Prazo de guarda:** aceita 12 meses para quem não virou paciente e 24 meses depois da última sessão para quem virou
   (antes de passar ao advogado)?
4. **Onde rodar:** aprova a opção B (banco gerenciado no Brasil, cerca de US$ 25 por mês), ou prefere a C (sem custo
   novo, mas com manutenção mensal de servidor)?
5. **Atendente de IA:** quando chegar a fase 5, ele só sugere a resposta para a recepção mandar, ou deve responder sozinho
   fora do horário (o que pede a API oficial do WhatsApp e tem custo por conversa)?
6. **Adoção:** quem na clínica fica responsável por a recepção usar o CRM, e o campo "como conheceu a BMH" pode ser
   obrigatório desde o primeiro dia?
