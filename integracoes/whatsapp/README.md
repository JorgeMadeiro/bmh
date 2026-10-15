# WhatsApp da BMH: observação das conversas (09/10/2026)

Um mês olhando como a recepção atende hoje (61 3346-6005) antes de desenhar o SDR da BMH, para depois cruzar com o iGut
(agendou, compareceu) e com a origem do contato (anúncio, site, cirurgião).

- **Instância** "BMH Recepção" na Evolution da clínica (`apiwp.cannlink.com.br`, v2.3.7), conectada como aparelho do
  WhatsApp, ao lado do celular e do WhatsApp Web da equipe. **Nunca envia mensagem.** Ajustes: não marca como lida, não
  fica online (senão o celular para de notificar), ignora grupos, traz histórico ao conectar. Webhook só `MESSAGES_UPSERT`.
- **Fluxo** "BMH · WhatsApp · observa conversas" (id em `integracoes/painel/n8n-ids.json`, `fluxos.whatsapp`): recebe →
  prepara (descarta grupo, status, reação e mensagem de sistema) → se for áudio, baixa na Evolution e transcreve
  (OpenAI `gpt-4o-transcribe`) → grava. Não guarda execução (tem conversa de paciente).
- **Tabela** `BMH_whatsapp_mensagens`: `chave` (id da mensagem), `momento`, `dia` (Brasília), `telefone`,
  `numero_oculto` (o WhatsApp escondeu o número: vem o código @lid), `direcao` (paciente ou equipe), `aparelho` (de onde a
  equipe respondeu), `tipo`, `texto` (CPF apagado), `transcrito`, `respondendo`, `apagar_em` (6 meses).
- **Montar ou atualizar:** `node --env-file=.env integracoes/whatsapp/montar.js` (só a Evolution: `... montar.js so-evolution`).
- **Teste:** com mensagem real do celular do próprio Jorge. Não inserir linha de teste na tabela (a API do n8n não apaga linha).
- **Limpeza (12/10/2026):** fluxo "BMH · WhatsApp · apaga conversas vencidas" (`fluxos.limpeza` no `n8n-ids.json`), todo dia
  às 4h37, apaga as linhas com `apagar_em` até hoje (Brasília) e grava só a contagem em `BMH_limpeza_registro`. Não guarda
  execução. Rodar à mão: o caminho do "Rodar agora" está na nota do fluxo. Linha de teste só com `apagar_em` vencido ou do
  dia seguinte (a limpeza tira).
- Regras de dado e credenciais: `~/.claude/skills/seguranca-credenciais/SKILL.md`.
- **Origem do contato (15/10/2026):** o "Monta a linha" reconhece o começo da mensagem pronta e o fluxo grava em
  `BMH_whatsapp_origens` (`chave`, `dia`, `momento`, `origem`; sem telefone nem texto). Origens: `instagram_dr_jorge`
  (link "Hiperbárica (BMH)" da bio do Dr. Jorge, página `/drjorge/`, id 1419), `anuncio_google` (link do anúncio) e
  `site` (botões do site). Tabela à parte porque a API do n8n não acrescenta coluna em tabela que já existe. Mudar uma
  mensagem pronta (em `scripts/wp-pagina-html.js` ou no anúncio) pede ajustar `ORIGENS` em `monta-linha.js`.
  Atualizar só o fluxo, sem mexer na Evolution: `node --env-file=.env integracoes/whatsapp/montar.js so-fluxo`.
  Em 15/10/2026 a instância "BMH Recepção" estava desconectada (`state: close`) e a tabela de mensagens vazia: a contagem
  pelo WhatsApp começa quando o aparelho for reconectado; até lá, quem conta é o Analytics (visitas a `/drjorge/` com
  `utm_source=instagram&utm_medium=bio&utm_campaign=dr-jorge`).
