// Meses que a DRE refaz. Toda noite: o mês atual e os 3 anteriores (a glosa e o pagamento de convênio mudam meses depois).
// "Atualizar agora" da página (?rapido=1): só o mês atual e o anterior. Manual: ?mes=AAAA-MM refaz um mês (o histórico,
// desde jan/2024, foi carregado assim, um mês por vez).
let q = {}; try { q = $('Chamada manual').first().json.query || {}; } catch (e) {}
const hoje = $now.setZone('America/Sao_Paulo').startOf('month');
const lista = /^\d{4}-\d{2}$/.test(q.mes || '') ? [DateTime.fromISO(q.mes + '-01')] : Array.from({ length: q.rapido ? 2 : 4 }, (_, i) => hoje.minus({ months: i })).reverse();
return lista.filter((m) => m.toFormat('yyyy-MM') >= '2024-01').map((m) => ({ json: { mes: m.toFormat('yyyy-MM'), ini: m.toISODate(), fim: m.endOf('month').toISODate() } }));
