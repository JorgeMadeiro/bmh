// Período (mesma regra da Nexo): padrão últimos 30 dias até ontem; no máximo 180 dias. Anterior: mês anterior quando
// começa no dia 1; senão, os mesmos dias logo antes. O mês do teto é o mês em que o período termina.
const q = $('Painel').first().json.query || {};
const hoje = $now.setZone('America/Sao_Paulo').startOf('day'), ontem = hoje.minus({ days: 1 });
const val = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? DateTime.fromISO(s, { zone: 'America/Sao_Paulo' }) : null;
let fim = val(q.fim) || ontem; if (fim > ontem) fim = ontem;
let inicio = val(q.inicio) || fim.minus({ days: 29 });
if (inicio > fim) inicio = fim; if (fim.diff(inicio, 'days').days > 179) inicio = fim.minus({ days: 179 });
const dias = Math.round(fim.diff(inicio, 'days').days) + 1;
let ant;
if (inicio.day === 1) {
  const mIni = inicio.minus({ months: 1 }), mesInteiro = fim.toISODate() === fim.endOf('month').toISODate() && fim.month === inicio.month;
  const mFim = mesInteiro ? mIni.endOf('month').startOf('day') : DateTime.min(mIni.plus({ days: dias - 1 }), mIni.endOf('month').startOf('day'));
  ant = { inicio: mIni.toISODate(), fim: mFim.toISODate(), tipo: 'mes' };
} else ant = { inicio: inicio.minus({ days: dias }).toISODate(), fim: inicio.minus({ days: 1 }).toISODate(), tipo: 'dias' };
const mesInicio = fim.startOf('month');
return [{ json: { inicio: inicio.toISODate(), fim: fim.toISODate(), ant, hoje: hoje.toISODate(), ontem: ontem.toISODate(),
  mes_inicio: mesInicio.toISODate(), mes_dia: fim.day, mes_dias: fim.daysInMonth } }];
