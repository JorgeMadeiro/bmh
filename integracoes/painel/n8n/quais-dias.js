// Janela a regravar. Todo dia às 6h10: os últimos 28 dias até ontem (o Google ainda ajusta conversões de dias anteriores).
// Manual: /webhook/bmh-painel-grava?dias=N ou ?desde=AAAA-MM-DD&ate=AAAA-MM-DD (histórico em blocos de até 90 dias).
const hoje = $now.setZone('America/Sao_Paulo').startOf('day'), ontem = hoje.minus({ days: 1 });
const ok = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
let q = {}; try { q = $('Manual').first().json.query || {}; } catch (e) {}
const fim = ok(q.ate) ? q.ate : ontem.toISODate();
const ini = ok(q.desde) ? q.desde : DateTime.fromISO(fim).minus({ days: Math.min(400, Math.max(1, Number(q.dias) || 28)) - 1 }).toISODate();
if (ini > fim) throw new Error('desde depois de ate');
return [{ json: { ini, fim, agora: $now.toISO() } }];
