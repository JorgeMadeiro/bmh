// Uma linha por ação na BMH_guardiao_registro (o painel mostra as dos 3 últimos dias). A chamada de teste não grava.
return $input.all().filter(({ json: a }) => !a.teste).map(({ json: a }) => ({ json: { chave: [a.hoje, a.regra, a.alvo_id || a.alvo].join('|'), data: a.hoje, regra: a.regra, plataforma: a.plataforma, tipo: a.tipo || '',
  alvo_id: String(a.alvo_id || ''), alvo: a.alvo || '', acao: a.acao, valor_antes: String(a.valor_antes || ''), valor_novo: String(a.valor_novo || ''), modo: a.modo, resultado: a.resultado, detalhe: a.detalhe || '' } }));
