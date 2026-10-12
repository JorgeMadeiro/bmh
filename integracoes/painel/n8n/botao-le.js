// Lê o toque no botão do Telegram (robô BMH alertas). Só aceita o chat do Jorge e o formato gd:<código>:a|i (guardião).
const cq = $input.first().json.callback_query || {};
const m = String(cq.data || '').match(/^gd:([0-9a-z]{1,13}):(a|i)$/); if (!m) return [];
const chat = String(cq.message?.chat?.id || ''); if (chat !== '8708228589' || String(cq.from?.id || '') !== '8708228589') return [];
return [{ json: { id: m[1], decisao: m[2] === 'a' ? 'aplicar' : 'ignorar', query_id: cq.id, chat_id: chat, message_id: cq.message?.message_id, texto: cq.message?.text || '',
  quem: [cq.from?.first_name, cq.from?.last_name].filter(Boolean).join(' ') || 'alguém' } }];
