# Kommo em coexistência: riscos para a operação que já roda (22/10/2026)

Leitura do Gerente BMH, a pedido da Central. Lidos `integracoes/kommo/plano-coexistencia.md`,
`integracoes/whatsapp/prepara-meta.js`, `testa-prepara-meta.js` e `monta-linha.js` (commits 15ac9cf e 16765e2), contra o que a
VPS opera hoje:
- o guardião do Meta (`K4UckCbHkrqr8sc6`);
- os números do dia (`0FskpyELgh7nBqF0`);
- o resumo das 8h (`QGDceUjADbnNINb3`) e a cópia dele (`UUYRg6GlEOlupbnW`);
- a fila do Instagram (`r6Rib8PXJ0zlSo4z`);
- a vigia (`BMH_vigia`).

Não mexi em nada.

## Alto

**1. O app e o token da Meta são os mesmos de tudo o que já roda.**
- Guardião, números, fila do Instagram e a rota `meta-bmh` do cofre usam o token do usuário do sistema "Claude BMH" do app
  `1104609048722893`.
- O recebedor oficial (3C) vai assinar o WhatsApp com o mesmo app.
- Mexer no app pode derrubar tudo de uma vez, como a credencial errada derrubou o guardião em 20/10: modo, produto WhatsApp,
  webhook, token novo, "Anular tokens".
- O que proponho:
  - nunca "Anular tokens";
  - o token atual já tem `whatsapp_business_management` e `whatsapp_business_messaging`, então não deve precisar de token novo;
  - se precisar mesmo, trocar no mesmo dia a credencial `HXdesRATFOJkYxhK` e o segredo `meta_bmh_leitura` e rodar
    `testa-guardiao-meta.js`, `testa-numeros-meta.js` e o guardião com `?teste=1`;
  - o app precisa estar "Ao vivo" para receber webhook de verdade, e isso pede a política de privacidade (item H do plano) antes.

**2. Origem: anúncio da Meta pode cair como "anuncio_google".**
- No `monta-linha.js`, toda mensagem que começa com "Olá! Vim pelo anúncio" vira `anuncio_google`.
- O ensaio do recebedor usa justamente "Olá! Vim pelo anúncio e quero saber da câmara" para um anúncio de clique para WhatsApp
  da Meta.
- O que proponho:
  - a mensagem pronta dos anúncios da Meta com frase própria;
  - o `referral` (anúncio e `ctwa_clid`) ganhando da frase quando vier;
  - um caso no ensaio para isso.
- A lista de frases ainda mora no código, e não na `BMH_config` (item B). Até migrar, são dois lugares a manter (a lição da
  Skyfit).

**3. Recebedor: o "sent" pode apagar o texto do eco.**
- A linha é gravada com `chave = msg_id`, e a mensagem que a equipe manda pelo celular chega como eco com o id da Meta.
- Se a Meta mandar também o status "sent" dessa mesma mensagem (a confirmar no teste grátis), a linha do status cai em cima do
  eco: fica sem texto e com aparelho "kommo".
- O ensaio testa eco e "sent" com ids diferentes, e não cobre esse caso.
- O que proponho: chave própria para o status (`status|<id>`), ou só gravar o status quando não houver eco, mais um caso no
  ensaio.

## Médio

**4. O robô do Kommo vai parecer resposta da equipe.**
- As respostas automáticas ("fora do horário", "passagem") saem pela API, então chegam como "sent" e viram `equipe / kommo`.
- Isso derruba o tempo de resposta, que é justamente o que o Jorge quer ver: resposta em segundos às 23h.
- O que proponho: marcar a mensagem do robô pelo webhook do Kommo e tirá-la do cálculo, ou medir o tempo de resposta pelos
  números do próprio Kommo.

**5. O resumo das 8h vai ter duas mudanças no mesmo nó.**
- A primeira é o bloco do Meta, pronto e esperando o "pode trocar o resumo da BMH". A segunda vem com o CRM (leads, tempo de
  resposta). As duas mexem em "Monta o resumo".
- O meu montador lê o resumo de produção na hora e para se ele tiver mudado. O contrário não está protegido: uma edição feita a
  partir de uma cópia antiga apaga o bloco do Meta.
- O que proponho: uma mudança por vez, sempre a partir do que está em produção, lido de volta, com aviso no git.

**6. A vigia não acompanha os fluxos novos do Meta.**
- A `BMH_vigia` não tem o guardião do Meta nem os números do dia.
- Se pararem (como a credencial em 20/10), só o aviso de atraso do resumo mostra, e o resumo de produção ainda não tem o bloco
  do Meta.
- O que proponho: o mesmo par de nós "Vigia" dos outros fluxos nos dois. Eu monto o JSON.

**7. A coexistência pode cair em silêncio.**
- A Meta desliga a coexistência se o celular da recepção ficar 14 dias sem abrir.
- O que proponho: uma vigia que avisa se não chegar nenhum eco do celular em 10 dias, testada com os dados de hoje antes de
  ligar (regra do alarme falso).

**8. Campanha de mensagens (P2): ligar só junto com três coisas.**
- A P2 está pausada e espera o CRM.
- Quando ligar, sobe o ritmo de gasto e a verba acaba antes; o guardião avisa, mas o limite e o Pix são só do Jorge.
- Ligar junto com:
  - o teto `meta_teto_mes` decidido (hoje não existe, então não há trava de teto);
  - a medição da conversa conferida antes da regra "R$ 40 em 3 dias sem conversa" (método da Nexo);
  - o número do anúncio igual ao número em coexistência.
- Se a casa ou o Kommo mexerem na conta pela primeira vez, o guardião avisa "alteração de terceiros" todo dia. Os nomes da casa
  entram em `meta_alteracoes_da_casa` antes.

## Baixo

**9. Fila do Instagram.**
- A coexistência não mexe no Instagram. O que a fila arrisca é o mesmo do item 1 (o app e o token).
- O botão de mensagem do perfil e da página precisa continuar apontando para o número da recepção.

**10. Fluxos da Evolution.**
- "BMH · WhatsApp · observa conversas" (`qDgmqqtt6zn1gARw`) está ligado, mas nunca observou nada (4 aparelhos).
- No dia da virada: desligar esse e manter "apaga conversas vencidas" (`sm7uaiRPM5G5gAhO`), que é quem apaga as linhas de 1 mês
  pelo `apagar_em`.
- Nenhum dos dois está na vigia, então desligar não dá alarme falso.

## Problemas

- desconhecido: se a Meta manda "sent" para mensagem mandada pelo celular em coexistência (item 3), e se o Kommo entrega o
  `ctwa_clid`; os dois só se confirmam no teste grátis.
- não feito: os ajustes propostos (casos novos no ensaio, chave do status, vigia dos fluxos do Meta e da coexistência). A
  construção é da janela do Mac; a vigia dos fluxos do Meta eu monto se a Central pedir.
