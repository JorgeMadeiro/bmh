// Guarda em qual mensagem do Telegram está cada proposta (para editar depois e para aceitar o texto respondido).
const base = $('Confere a resposta').all().map((i) => i.json);
return $input.all().map((it, k) => { const m = it.json.result || it.json; const { texto, ...linha } = base[k]; return { json: { ...linha, message_id: String(m.message_id || ''), atualizado_em: $now.toISO() } }; });
