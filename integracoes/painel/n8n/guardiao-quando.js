// Datas do dia (Brasília). Chamada manual com ?teste=1 só mostra o que o guardião faria: não grava nem aplica.
const hoje = $now.setZone('America/Sao_Paulo').startOf('day');
let teste = false; try { teste = $('Manual').isExecuted && !!($('Manual').first().json.query || {}).teste; } catch (e) {}
return [{ json: { hoje: hoje.toISODate(), ontem: hoje.minus({ days: 1 }).toISODate(), d3: hoje.minus({ days: 3 }).toISODate(), d7: hoje.minus({ days: 7 }).toISODate(),
  mes_inicio: hoje.startOf('month').toISODate(), dia: hoje.day, dias_mes: hoje.daysInMonth, restantes: hoje.daysInMonth - hoje.day + 1, teste } }];
