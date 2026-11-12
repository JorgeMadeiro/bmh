# Meta da BMH: campanha de mensagem no WhatsApp (12/11/2026)

Decisão do Jorge de 12/11/2026 (livro de decisões da Central, commit 466d080): campanha nova na conta `act_327952129944258`,
objetivo de mensagem no WhatsApp, medida por conversas iniciadas. **Nasce pausada; só liga com o "ativa" do Jorge pelo porteiro.**
As 5 campanhas antigas (engajamento e seguidores) continuam pausadas.

## Situação da conta (lida pela API em 12/11)

- Saldo pré-pago R$ 700,71; limite de gastos R$ 12.435,52, com **R$ 615,57 para gastar**.
- Medição pronta: os números do dia (`0FskpyELgh7nBqF0`), o guardião do Meta (`K4UckCbHkrqr8sc6`) e a revisão semanal leem a
  conversa iniciada pelo indicador `onsite_conversion.messaging_conversation_started_7d`. A conta já registrou 35 conversas assim
  (anúncios com botão de WhatsApp de 2024 e 2025), então o indicador é o certo para esta conta.
- O recebedor oficial da Meta já marca a origem "anúncio Meta" pelo código do clique (`ctwa_clid`), em `integracoes/origem/liga-conversas.js`.

## A campanha

| Item | Proposta |
|---|---|
| Nome | `BMH · Mensagens WhatsApp · nov/2026` |
| Objetivo | Engajamento, com o conjunto otimizado para conversas no WhatsApp (`CONVERSATIONS`, destino `WHATSAPP`) |
| Orçamento | **R$ 20 por dia** no conjunto (cerca de 30 dias com o que sobra no limite). Subir só com o "pode", no máximo 20% por dia |
| Público | DF. **O maior perfil de paciente da BMH vem de cirurgia plástica, capilar e parecidos** (Jorge, 12/11): chega-se a ele pelo criativo, pela idade, pelo gênero e pela região, nunca por interesse de estética ou de condição de saúde (as campanhas antigas da Triunfo usavam "estética", "autoestima" e "saúde e beleza"; a regra da casa e a da Meta não deixam). Idade e gênero: o Jorge confirma (no script, `IDADE_MIN`, `IDADE_MAX` e `GENEROS`; hoje 25 a 65, todos os gêneros, porque o capilar traz homens). Fixando idade ou gênero, o público automático da Meta é desligado para o limite valer |
| Posicionamentos | automáticos (Facebook e Instagram) |
| Criativo | **Padrão, sem verba a mais (regra de 12/11):** 1 conjunto de R$ 20 com o post "Presença médica" (instagram.com/p/DRhc0iyjVk3, 26/11/2025, nota 4,92, o mais forte do perfil em 12 meses, sem trava). Reservas, que entram como 2º anúncio no mesmo conjunto quando ele cansar: "Feridas e isquemia" (reel/DRRr6JnikZm, nota 2,7; tirar as hashtags da legenda antes), "Pós-operatório" (reel/DXPfXQ2EQ_4, nota 2,86; aviso de indicação, o Jorge decide), "Sair da câmara" (reel/DagxUivRtyb, nota 1,93) e "Avião sem piloto" (reel/DaDb5xxxW1e, nota 1,64; aviso do CFM por "eficaz"). Ranking completo em `saidas/estoque-criativos-2026-11.md`. **Como o perfil principal é o pós-operatório, o reel "Pós-operatório" pode ir ao ar no lugar do "Presença médica"**, se o Jorge aceitar o aviso de indicação; é a escolha do pedido 182. Com o "pode" do Jorge, `cria teste` faz o teste de 3 (R$ 120 em 2 dias) |
| Botão | Enviar mensagem pelo WhatsApp, para o número da recepção (o mesmo em coexistência com o Kommo) |

**Travas conferidas na legenda do "Presença médica":** sem preço, sem antes e depois, sem depoimento, sem estética, sem promessa;
cita as resoluções do CFM sobre médico presente na sessão. **Falta ver na foto:** se aparece paciente (só com autorização por escrito).

Ficaram de fora: depoimento, caso de paciente, influenciadora, evento ou data, "acelerar a recuperação" (promessa e indicação fora
da lista) e mergulho ("recuperação do mergulhador" não é indicação da lista). Os 2 reels da primeira versão deste plano ("Avião sem
piloto" e "Indicação correta") foram trocados pelo ranking: "Indicação correta" está abaixo do normal do perfil (nota 0,97).

## Antes do "ativa"

1. **Página ligada ao WhatsApp da recepção** (Business Suite, Configurações, Contas vinculadas, WhatsApp). Pela rota de leitura
   da VPS a página não mostra número (12/11); pode ser só permissão da rota. O script confere com o token do Mac, e a validação
   da Meta antes de criar o conjunto diz se dá.
2. **Teto do Meta na `BMH_config`, pela tela do n8n** (a API só insere): hoje `meta_teto_mes_2026-11` = 60 faria o guardião propor
   pausa no primeiro dia. Proposta: `meta_teto_mes_2026-11` = **420** (o gasto até aqui mais R$ 20 por dia até 30/11) e
   `meta_teto_mes` = **620** (dezembro, até o novo Pix). O Jorge confirma os valores.
3. Criar pausada pelo Mac (abaixo) e conferir pela API.
4. Pedido "ativa" no porteiro, com botões.

## Pelo Mac

`scripts/meta-campanha-mensagens.py` (lê `META_ADS_TOKEN` do `.env`):
- sem argumento: confere (conta, página com WhatsApp, os 2 posts, a região do DF);
- `valida`: manda tudo à Meta com `validate_only`, sem criar nada;
- `cria`: cria campanha **pausada**, conjunto e 2 anúncios; lê de volta e grava os ids em `dados/meta/campanha-mensagens-ids.json`;
- `ativa`: só depois do Aprovar do Jorge no porteiro; liga a campanha e lê de volta.

## Como acompanhar (método de escala)

- Decidir pela média de 7 dias, não pelo dia ruim. O guardião só propõe pausa com R$ 40 em 3 dias sem conversa.
- Troca de criativo pelo custo por conversa (até o CRM medir agendamento), não pela frequência: a revisão de segunda marca
  "criativo cansado" e aponta a reserva (`marketing/estoque-criativos/README.md`). Frequência a partir de 2,5 em 7 dias só acende a
  atenção; o guardião avisa em 4.
- Verba: sobe no máximo 20% por dia, sempre com o "pode".
- **Resposta no WhatsApp:** conversa que espera não vira paciente. Hoje ninguém mede o tempo de resposta da recepção (entra com o
  Kommo). Na primeira semana, o Jorge olha por amostra.

## Riscos

- A Meta pode reprovar anúncio de saúde. O guardião avisa anúncio reprovado.
- Sem frase própria, a mensagem pronta é a padrão da Meta. A origem sai certa no recebedor (pelo código do clique), mas o leitor
  de origem do Kommo, que lê só a frase, vai marcar essas conversas sem origem.
- Pausar a qualquer hora: no Gerenciador, ou o Jorge pede e a pausa entra pelo Mac.
