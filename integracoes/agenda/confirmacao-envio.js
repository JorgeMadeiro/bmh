// Resultado do envio da confirmação pela API oficial (22/10/2026): marca "enviada" com o id da mensagem (wamid, que a
// resposta do paciente cita) ou "falhou" com o motivo. Falha não reenvia sozinha: a recepção confirma pelo jeito de hoje.
const enviados = $('Manda a confirmação').all(), itens = $('Só no modo real').all();
return itens.map((i, k) => { const r = enviados[k]?.json || {}, wamid = r.messages?.[0]?.id || '';
  return { json: { ...i.json, wamid, status: wamid ? 'enviada' : 'falhou: ' + JSON.stringify(r.error?.message || r.error || r).slice(0, 120) } }; });
