// Cliques no WhatsApp do site por dia, dia da semana (1 = segunda) e hora: o mapa "Quando os contatos chegam"
const r = $('Analytics · horas').first().json || {};
if (r.error) throw new Error('Analytics (horas): ' + JSON.stringify(r.error).slice(0, 200));
const m = {};
for (const x of r.rows || []) { const [d8, dw, hr, dom] = x.dimensionValues.map(v => v.value); if (!['api.whatsapp.com', 'wa.me'].includes(dom)) continue;
  const dia = d8.slice(0, 4) + '-' + d8.slice(4, 6) + '-' + d8.slice(6), ds = (Number(dw) + 6) % 7 + 1, h = Number(hr), chave = dia + '|' + ds + '|' + h;
  (m[chave] ||= { chave, dia, dia_semana: ds, hora: h, cliques: 0 }).cliques += Number(x.metricValues[0].value) || 0; }
return Object.values(m).map(json => ({ json }));
