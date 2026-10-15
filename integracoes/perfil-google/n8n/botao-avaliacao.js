// Avaliações do Google (fluxo "BMH · Perfil do Google · avaliações"): botão av:<código>:p|i, ou resposta escrita à
// mensagem da sugestão (o texto respondido é publicado no lugar). Só o chat do Jorge.
const u = $input.first().json, JORGE = '8708228589';
const cq = u.callback_query, msg = u.message;
if (cq) {
  const m = String(cq.data || '').match(/^av:([0-9a-z]{4,16}):(p|i)$/); if (!m) return [];
  if (String(cq.message?.chat?.id || '') !== JORGE || String(cq.from?.id || '') !== JORGE) return [];
  return [{ json: { codigo: m[1], decisao: m[2] === 'p' ? 'publicar' : 'ignorar', texto_novo: '', query_id: cq.id, chat_id: JORGE, message_id: String(cq.message?.message_id || ''),
    texto_msg: cq.message?.text || '', quem: cq.from?.first_name || 'Jorge' } }];
}
if (msg && msg.reply_to_message && String(msg.chat?.id || '') === JORGE && String(msg.from?.id || '') === JORGE && String(msg.text || '').trim()) {
  return [{ json: { codigo: '', decisao: 'publicar', texto_novo: String(msg.text).trim(), query_id: '', chat_id: JORGE, message_id: String(msg.reply_to_message.message_id || ''),
    texto_msg: msg.reply_to_message.text || '', quem: msg.from?.first_name || 'Jorge' } }];
}
return [];
