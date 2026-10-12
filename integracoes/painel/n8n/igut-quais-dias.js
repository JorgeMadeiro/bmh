// Janela do iGut. Todo dia às 3h20: os últimos 7 dias até ontem (atendimento lançado com atraso entra no dia certo).
// Manual: /webhook/bmh-igut-dia?dias=N ou ?desde=AAAA-MM-DD&ate=AAAA-MM-DD (histórico em blocos de até 90 dias).
const hoje = $now.setZone('America/Sao_Paulo').startOf('day'), ontem = hoje.minus({ days: 1 });
const ok = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
let q = {}; try { q = $('Manual').first().json.query || {}; } catch (e) {}
const fim = ok(q.ate) ? q.ate : ontem.toISODate();
const ini = ok(q.desde) ? q.desde : DateTime.fromISO(fim).minus({ days: Math.min(120, Math.max(1, Number(q.dias) || 7)) - 1 }).toISODate();
if (ini > fim) throw new Error('desde depois de ate');
return [{ json: { ini, fim } }];
