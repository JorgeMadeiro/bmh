// Mês do relatório: o anterior (no dia 1) ou ?mes=AAAA-MM na chamada manual. ?previa=1 manda só para o Telegram do Jorge.
// ?so=geral só preenche mono e multi da Asa Sul na aba Geral da planilha de plantões (sem mensagem).
let q = {}; try { q = $('Manual').first().json.query || {}; } catch (e) {}
const ref = /^\d{4}-\d{2}$/.test(q.mes || '') ? DateTime.fromISO(q.mes + '-01') : $now.setZone('America/Sao_Paulo').startOf('month').minus({ months: 1 });
const m = (d) => d.toFormat('yyyy-MM');
const dias = Array.from({ length: ref.daysInMonth }, (_, i) => ref.plus({ days: i }).toISODate());
let previa = !!q.previa; try { if ($('Manual').isExecuted && !q.grupo) previa = true; } catch (e) {}
return dias.map((dia) => ({ json: { dia, mes: m(ref), ini: ref.toISODate(), fim: ref.endOf('month').toISODate(),
  mes1: m(ref.minus({ months: 1 })), mes1ini: ref.minus({ months: 1 }).toISODate(), mes1fim: ref.minus({ months: 1 }).endOf('month').toISODate(),
  mes2: m(ref.minus({ months: 2 })), mes2ini: ref.minus({ months: 2 }).toISODate(), mes2fim: ref.minus({ months: 2 }).endOf('month').toISODate(),
  mesAnoPassado: m(ref.minus({ years: 1 })), previa, so: q.so || '',
  anteriores: Array.from({ length: 6 }, (_, i) => { const d = ref.minus({ months: i + 1 }); return { mes: m(d), ini: d.toISODate(), fim: d.endOf('month').toISODate() }; }) } }));
