// Conversão "agendou" (17/11/2026, pedido do Jorge): a avaliação marcada no iGut, vista pela passagem a cada 30 min, com ou
// sem conversa no Kommo (pega também quem marcou por telefone). Uma por paciente por avaliação (chave agendou|paciente|dia da
// avaliação); só grava o que ainda não está em BMH_conversoes (regravar apagaria a marca de enviado). O dia do evento é o
// dia em que a passagem viu a avaliação pela primeira vez. Telefone e e-mail só em código. O envio à Meta e ao Google só
// manda os eventos da lista dele (envio-monta.js): o "agendou" entra lá quando existir a conversão secundária no Google.
const ja = new Set($('Conversões (tabela)').all().map((i) => i.json && i.json.chave).filter(Boolean));
const hoje = $now.setZone('America/Sao_Paulo').toISODate(), agora = $now.toISO();
return $('Avaliações novas').all().map((i) => i.json).map((a) => ({ chave: 'agendou|' + a.pid + '|' + a.dia, evento: 'agendou', dia: hoje, paciente_id: a.pid, unidade: a.unidade,
  telefone_hash: a.telefone_hash, telefone_hash_sem9: a.conv.telefone_hash_sem9, telefone_hash_google: a.conv.telefone_hash_google, email_hash: a.conv.email_hash,
  enviado_meta: '', enviado_google: '', modo: 'ensaio', criado_em: agora })).filter((r) => !ja.has(r.chave)).map((json) => ({ json }));
