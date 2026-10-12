// Botão "Pronto, gerar os e-mails" do relatório de plantões (pl:AAAA-MM:ok). Só o chat do Jorge.
const cq = $input.first().json.callback_query || {};
const m = String(cq.data || '').match(/^pl:(\d{4}-\d{2}):ok$/); if (!m) return [];
if (String(cq.message?.chat?.id || '') !== '8708228589' || String(cq.from?.id || '') !== '8708228589') return [];
return [{ json: { mes: m[1], query_id: cq.id, chat_id: String(cq.message.chat.id), message_id: cq.message.message_id, texto: (cq.message.text || '') + '\n\n⏳ Gerando os rascunhos dos e-mails…' } }];
