// Totais por dia, fonte e métrica (mesmo formato do NEXO_organico_diario): busca do Google (Search Console) e visitas e
// cliques no WhatsApp por família de canal (Analytics)
const gsc = $('Search Console · por dia').first().json || {}, vis = $('Analytics · visitas por canal').first().json || {}, cli = $('Analytics · cliques').first().json || {};
for (const [n, r] of [['Search Console', gsc], ['Analytics (visitas)', vis]]) if (r.error) throw new Error(n + ': ' + JSON.stringify(r.error).slice(0, 200));
const FAMILIA = { 'Organic Search': 'site_busca', 'Organic Social': 'site_social', 'AI Assistant': 'site_ia', 'Referral': 'site_referencia', 'Direct': 'site_direto', 'Unassigned': 'site_direto',
  'Paid Search': 'site_pago', 'Cross-network': 'site_pago', 'Paid Social': 'site_pago', 'Paid Other': 'site_pago' };
const fam = c => FAMILIA[c] || 'site_outros', dGA = s => s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6);
const m = {}; const add = (dia, fonte, metrica, v) => { const chave = dia + '|' + fonte + '|' + metrica; (m[chave] ||= { chave, dia, fonte, metrica, valor: 0 }).valor += v; };
for (const r of gsc.rows || []) { const d = r.keys[0]; add(d, 'google_busca', 'impressoes', r.impressions); add(d, 'google_busca', 'cliques', r.clicks); add(d, 'google_busca', 'posicao_x_impressoes', r.position * r.impressions); }
for (const x of vis.rows || []) { const [d8, canal] = x.dimensionValues.map(v => v.value); add(dGA(d8), fam(canal), 'sessoes', Number(x.metricValues[0].value) || 0); }
for (const x of cli.rows || []) { const v = x.dimensionValues.map(y => y.value); if (!['api.whatsapp.com', 'wa.me'].includes(v[6])) continue; add(dGA(v[0]), fam(v[1]), 'cliques_whatsapp', Number(x.metricValues[0].value) || 0); }
return Object.values(m).map(json => ({ json }));
