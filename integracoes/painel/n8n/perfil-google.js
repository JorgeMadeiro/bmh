// Perfil da Empresa no Google (API aprovada em 14/10/2026), mesmo formato do NEXO_organico_diario: por dia, a soma das duas
// unidades em fonte "perfil_google" (é o que o painel mostra) e cada unidade em "perfil_google_asa_sul" /
// "perfil_google_taguatinga". Toque em ligar não é ligação atendida. A API chega com uns 3 dias de atraso: só grava até o
// último dia que já tem número (antes disso, dia sem valor é zero de verdade). Só números, sem avaliação nem nome.
const PERFIS = $('Perfis do Google').all().map((i) => i.json), resp = $('Perfil do Google · números').all().map((i) => i.json);
const MET = { CALL_CLICKS: 'ligacoes', BUSINESS_DIRECTION_REQUESTS: 'rotas', WEBSITE_CLICKS: 'cliques_site', BUSINESS_CONVERSATIONS: 'conversas',
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 'exibicoes_busca', BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 'exibicoes_busca', BUSINESS_IMPRESSIONS_MOBILE_MAPS: 'exibicoes_mapa', BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 'exibicoes_mapa' };
const dia = (d) => d.year + '-' + String(d.month).padStart(2, '0') + '-' + String(d.day).padStart(2, '0');
const v = {}; let ultimo = '';
PERFIS.forEach((p, k) => {
  const r = resp[k] || {}; if (r.error || !r.multiDailyMetricTimeSeries) throw new Error('Perfil do Google (' + p.unidade + '): ' + JSON.stringify(r.error || r).slice(0, 200));
  for (const g of r.multiDailyMetricTimeSeries) for (const ts of g.dailyMetricTimeSeries || []) for (const x of ts.timeSeries?.datedValues || []) {
    const d = dia(x.date), m = MET[ts.dailyMetric]; if (!m) continue;
    if (x.value != null && d > ultimo) ultimo = d;
    for (const fonte of ['perfil_google', p.fonte]) { const c = d + '|' + fonte + '|' + m; v[c] = (v[c] || 0) + (Number(x.value) || 0); }
  }
});
return Object.entries(v).filter(([c]) => c.slice(0, 10) <= ultimo).map(([chave, valor]) => { const [d, fonte, metrica] = chave.split('|'); return { json: { chave, dia: d, fonte, metrica, valor } }; });
