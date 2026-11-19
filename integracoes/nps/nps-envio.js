// Resultado do envio do NPS (19/11/2026): "enviada" (ou "espelho: enviada ao teste") com o id da mensagem, que a resposta do
// paciente cita, ou "falhou" com o motivo. Falha não reenvia sozinha.
const enviados = $('Manda o NPS').all(), itens = $('Só para enviar').all();
return itens.map((i, k) => { const r = enviados[k]?.json || {}, wamid = r.messages?.[0]?.id || ''; const { envio, ...linha } = i.json;
  return { json: { ...linha, wamid, status: wamid ? (linha.modo === 'espelho' ? 'espelho: enviada ao teste' : 'enviada') : 'falhou: ' + JSON.stringify(r.error?.message || r.error || r).slice(0, 120) } }; });
