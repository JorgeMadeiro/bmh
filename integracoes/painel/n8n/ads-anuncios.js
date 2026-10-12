// Google Ads por anúncio e dia: investimento, exibições, cliques, contatos (WhatsApp do site) e ligações. Só números.
const P = $('Quais dias').first().json, tok = $('Google Ads · renova o acesso').first().json.access_token;
const CONTA = '5066798424';
const gaql = async (query) => { let out = [], pageToken; do { const r = await this.helpers.httpRequest({ method: 'POST', url: 'https://googleads.googleapis.com/v25/customers/' + CONTA + '/googleAds:search', headers: { Authorization: 'Bearer ' + tok }, body: { query, ...(pageToken ? { pageToken } : {}) }, json: true }); out = out.concat(r.results || []); pageToken = r.nextPageToken; } while (pageToken); return out; };
const entre = "segments.date BETWEEN '" + P.ini + "' AND '" + P.fim + "'";
const [base, conv] = await Promise.all([
  gaql('SELECT segments.date, campaign.name, ad_group.name, ad_group_ad.ad.id, metrics.cost_micros, metrics.impressions, metrics.clicks FROM ad_group_ad WHERE ' + entre + ' AND metrics.impressions > 0'),
  gaql('SELECT segments.date, ad_group_ad.ad.id, segments.conversion_action_category, metrics.conversions FROM ad_group_ad WHERE ' + entre + ' AND metrics.conversions > 0')]);
const c = {};
for (const x of conv) { const k = x.segments.date + '|' + x.adGroupAd.ad.id; c[k] ||= { contatos: 0, ligacoes: 0 };
  const cat = x.segments.conversionActionCategory, v = Number(x.metrics.conversions) || 0;
  if (/PHONE_CALL/.test(cat)) c[k].ligacoes += v; else if (cat === 'CONTACT') c[k].contatos += v; }
return base.map(x => { const id = String(x.adGroupAd.ad.id), k = x.segments.date + '|' + id, cc = c[k] || { contatos: 0, ligacoes: 0 };
  return { json: { chave: k, dia: x.segments.date, ad_id: id, campanha: x.campaign.name, grupo: x.adGroup.name, gasto: Number(x.metrics.costMicros || 0) / 1e6,
    impressoes: Number(x.metrics.impressions) || 0, cliques: Number(x.metrics.clicks) || 0, contatos: cc.contatos, ligacoes: cc.ligacoes, atualizado_em: P.agora } }; });
