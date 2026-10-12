// Cliques que saem do site para o WhatsApp e para mapas (Analytics, evento "click"), por dia, canal, campanha e página de entrada
const r = $('Analytics · cliques').first().json || {};
if (r.error) throw new Error('Analytics (cliques): ' + JSON.stringify(r.error).slice(0, 200));
const WHATS = ['api.whatsapp.com', 'wa.me'], ROTA = ['maps.app.goo.gl', 'goo.gl', 'g.co', 'www.google.com', 'google.com', 'waze.com', 'ul.waze.com', 'm.uber.com'];
const m = {};
for (const x of r.rows || []) {
  const [d8, canal, fonte, meio, camp, lp, dom] = x.dimensionValues.map(v => v.value), n = Number(x.metricValues[0].value) || 0;
  const tipo = WHATS.includes(dom) ? 'whatsapp' : ROTA.includes(dom) ? 'rota' : null; if (!tipo) continue;
  const dia = d8.slice(0, 4) + '-' + d8.slice(4, 6) + '-' + d8.slice(6), pagina = lp === '(not set)' ? 'fora do site' : (lp.split('?')[0] || '/');
  const chave = [dia, canal, fonte, meio, camp, pagina, tipo].join('|');
  (m[chave] ||= { chave, dia, canal, fonte, meio, campanha_ads: camp, pagina, tipo, cliques: 0 }).cliques += n;
}
return Object.values(m).map(json => ({ json }));
