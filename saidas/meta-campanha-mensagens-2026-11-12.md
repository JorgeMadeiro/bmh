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
| Público | Distrito Federal, 25 a 65+ anos, todos os gêneros, sem interesse de saúde (a Meta restringe e o público amplo aprende melhor) |
| Posicionamentos | automáticos (Facebook e Instagram) |
| Criativos | 2 reels que já estão no Instagram da BMH, sem hashtag na legenda, os mesmos que a Triunfo usou como anúncio: "Avião sem piloto" (`18089634056567776`, 26/06/2026, instagram.com/reel/DaDb5xxxW1e, segurança e acompanhamento médico) e "Indicação correta" (`18150290680494142`, 02/06/2026, instagram.com/reel/DZF0hR6xPNY, avaliação antes de indicar) |
| Botão | Enviar mensagem pelo WhatsApp, para o número da recepção (o mesmo em coexistência com o Kommo) |

**Travas conferidas nas legendas:** sem preço, sem antes e depois, sem depoimento, sem estética. Aviso do CFM: a legenda do
"Avião sem piloto" diz "tratamento seguro, eficaz e personalizado"; "eficaz" é afirmação de resultado, de leve. Fica com o Jorge.
**Falta ver nos vídeos:** se aparece paciente na câmara. Só entra com autorização por escrito (regra da pasta).

Ficaram de fora: depoimento ("REELS 21 PACIENTE"), influenciadora ("REELS 10"), os de "acelerar a recuperação" (promessa e
indicação fora da lista) e os com hashtag ("AD 03", "AD 04").

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
- Frequência: o guardião já avisa quando passa do limite (`meta_frequencia`). Ter o próximo criativo pronto antes de cansar.
- Verba: sobe no máximo 20% por dia, sempre com o "pode".
- **Resposta no WhatsApp:** conversa que espera não vira paciente. Hoje ninguém mede o tempo de resposta da recepção (entra com o
  Kommo). Na primeira semana, o Jorge olha por amostra.

## Riscos

- A Meta pode reprovar anúncio de saúde. O guardião avisa anúncio reprovado.
- Sem frase própria, a mensagem pronta é a padrão da Meta. A origem sai certa no recebedor (pelo código do clique), mas o leitor
  de origem do Kommo, que lê só a frase, vai marcar essas conversas sem origem.
- Pausar a qualquer hora: no Gerenciador, ou o Jorge pede e a pausa entra pelo Mac.
