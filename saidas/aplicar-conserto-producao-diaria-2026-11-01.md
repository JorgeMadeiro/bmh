# Aplicar o conserto da agenda diária (pedido 117, aprovado pelo Jorge em 01/11/2026, 14h14)

**Desde 07/11/2026, um comando só:** `python3 scripts/n8n/aplica-bmh-mac.py` confere e `... grava` aplica o 117, o 136 (com a
prévia), as chaves do Meta, o 132 e o 138, com as mesmas conferências deste roteiro. O reenvio do mensal ao grupo é `... reenvia`.
O passo a passo abaixo fica como referência.

Para a janela do Mac. Fluxo de produção "Produção Diaria e Mensal BMH" (`EkmBucG5LoEutBUa`), que a VPS não pode escrever.
Arquivo: `scripts/n8n/bmh-producao-diaria-conserto.json` (gerado pelo `monta-producao-conserto.py`, lido da produção às 13h do
dia 01/11).

## O que entra

Os 45 nós de hoje ficam iguais; entram 9:
- de cada um dos 5 envios, a saída de erro vai a "Avisa envio que falhou · <grupo>" → "Telegram · envio que falhou" (robô BMH
  alertas) → "Instância fora do ar? Para em erro";
- o par "Vigia" no "Todo dia às 17h" (chave `producao_diaria`, 26 h).

Não muda horário, grupos nem texto das mensagens.

## Passo a passo

1. **Conferir que a produção não mudou:** `updatedAt` do `EkmBucG5LoEutBUa` tem de ser `2026-10-09T15:51:32.683Z`, conferido pelo
   Gerente BMH às 13h40 de 01/11. Se for outro, **parar**: o JSON foi gerado de outra versão, e regravá-lo desfaria a mudança.
   Pedir ao Gerente BMH para remontar.
2. **Cópia antes:** baixar o fluxo inteiro (GET) para `dados/n8n-copias/EkmBucG5LoEutBUa-…-2026-11-01-antes.json` (fora do git:
   traz dados de nós).
3. **Não regravar durante a espera:** se houver execução em "waiting" (entre 17h e o fim das sessões), esperar ela terminar.
   Regravar no meio da espera pode perder a rodada do dia.
4. **PUT** com `name`, `nodes`, `connections` e `settings` do JSON (o `settings` é o de hoje: `errorWorkflow` `7u3CuyjESsHmCtMW`,
   sem guardar sucesso). O fluxo continua ligado.
5. **Ler de volta:** 54 nós; ligado; os 45 antigos iguais à cópia; as 5 saídas de erro ligadas aos "Avisa envio que falhou…";
   o "Todo dia às 17h" ligado a "Agenda de hoje (para o horário)" e a "Vigia · marca que rodou".
6. **Teste sem tocar nos grupos:** a Central liga o `vRz3ZLhBjasmqXqc` ("teste do aviso de envio"; os envios vão para uma
   instância que não existe), chama o Manual (`/webhook/bmh-producao-teste-aviso-3c8e17`) num dia com agenda e desliga. Esperado:
   1 aviso "🧪 TESTE … instância Madeiro do WhatsApp está fora do ar" no robô BMH alertas e 1 linha "TESTE: instância Madeiro
   fora do ar" na `BMH_falhas`. Hoje (domingo) só monta mensagem se houver agenda no iGut. O diagnóstico de 01/11 achou 53
   agendamentos, então deve montar.
7. **Prova no dia seguinte:** a `BMH_vigia` ganha a linha `producao_diaria` às 17h. O Gerente BMH confere.

## Voltar atrás

Regravar a cópia do passo 2.

## Relatório mensal da diretoria: servidor errado (achado em 02/11/2026; aplicar só com o toque do Jorge)

"BMH · Diretoria · produção do mês" (`fvEYln7d2wWi4N2S`) falhou em 01/11 às 8h01, no nó "WhatsApp · grupo da diretoria", com
"The resource you are requesting could not be found" (BMH_falhas, linha 7). O relatório de outubro **não saiu**.

**Causa:** o nó manda para `https://apiwp.cannlink.com.br/message/sendText/Madeiro`, com a credencial "BMH · WhatsApp Evolution
(envio aos grupos)" (`tqkGMMSnfbUWLIng`). A instância Madeiro só existe no servidor de afiliados (`apiwp-afiliados.cannlink.com.br`),
que é o de todos os outros fluxos que a usam.

1. **Conferir** que o `updatedAt` do `fvEYln7d2wWi4N2S` não mudou desde a leitura de 02/11 e fazer a **cópia antes** em
   `dados/n8n-copias/`.
2. **Gerar e regravar.** Rodar `python3 scripts/n8n/monta-mensal-conserto.py`; no Mac, com `N8N_URL` e `N8N_API_KEY` no ambiente,
   ele lê o fluxo direto. Ele grava `dados/n8n-copias/fvEYln7d2wWi4N2S-conserto-136-e-ano-anterior.json` **fora do git**, porque o
   nó "Monta" tem a senha do painel. Mudam só dois nós:
   - "WhatsApp · grupo da diretoria": `url` = `https://apiwp-afiliados.cannlink.com.br/message/sendText/Madeiro` e credencial
     "Evolution afiliados · instância Madeiro (Dr Jorge)" (`FaVy4E4519vzp2EO`), a mesma da agenda diária. Grupo
     (`120363205793119192@g.us`) e texto iguais;
   - "Monta": a linha **"vs outubro/2025: sessões · produzido"** logo abaixo da do mês anterior, pedido do Jorge em 04/11 ("faltou
     comparar com o ano anterior"). O número já era calculado pela `BMH_igut_dia`, com a mesma regra do mês anterior, e não era
     mostrado. Sem dado do ano anterior, a linha não aparece.
   PUT e leitura de volta.
3. **Prévia, sem mandar ao grupo:** chamar o Manual `/webhook/bmh-producao-mes?mes=2026-10`. Sem o parâmetro `grupo`, o próprio
   fluxo manda só ao Telegram do Jorge. Conferir o texto, agora com a linha do ano anterior.
4. **Reenvio ao grupo da diretoria (é mensagem ao grupo; só com o toque do Jorge):** `/webhook/bmh-producao-mes?mes=2026-10&grupo=1`.
   Conferir que a BMH_falhas não ganhou linha.
5. **Limpeza (sem apagar agora):** a credencial `tqkGMMSnfbUWLIng` só é usada por esse nó (conferido nos 308 fluxos em 02/11). Depois
   do passo 2 ela fica sem uso; entra na lista de limpeza.

Voltar atrás: regravar a cópia do passo 1.

## Também pelo Mac: chaves da BMH_config (decisão 116, 01/11/2026)

A VPS não escreve na `BMH_config` (`V4NRHS9mc1kvigix`). Pelo Mac, gravar e ler de volta:

| chave | valor | por quê |
|---|---|---|
| `meta_teto_mes_2026-11` | `60` | novembro: o que sobra até a conta do Meta parar, por volta de 05/11. Com teto 0 já agora, o guardião proporia pausar a C1 todo dia até lá |
| `meta_teto_mes` | `0` | de dezembro em diante: nada pode gastar no Meta até a campanha de mensagens (depois do Kommo). O guardião trata "0" como teto zero (corrigido em 01/11) |

Não mexer em `teto_mes` (Google): o guardião do Google já usou R$ 3.600 em 01/11 (decisão 113). Conferir só que não existe
`teto_mes_2026-11` com outro valor.
