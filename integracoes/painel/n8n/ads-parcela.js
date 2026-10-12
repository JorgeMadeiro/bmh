// Parcela de impressões por campanha e dia (quanto das buscas possíveis o anúncio apareceu; o resto, perdido por verba ou posição)
const P = $('Quais dias').first().json, tok = $('Google Ads · renova o acesso').first().json.access_token;
const CONTA = '5066798424';
const gaql = async (query) => { let out = [], pageToken; do { const r = await this.helpers.httpRequest({ method: 'POST', url: 'https://googleads.googleapis.com/v25/customers/' + CONTA + '/googleAds:search', headers: { Authorization: 'Bearer ' + tok }, body: { query, ...(pageToken ? { pageToken } : {}) }, json: true }); out = out.concat(r.results || []); pageToken = r.nextPageToken; } while (pageToken); return out; };
const r = await gaql("SELECT segments.date, campaign.name, metrics.impressions, metrics.search_impression_share, metrics.search_budget_lost_impression_share, metrics.search_rank_lost_impression_share FROM campaign WHERE segments.date BETWEEN '" + P.ini + "' AND '" + P.fim + "' AND metrics.impressions > 0");
return r.map(x => ({ json: { chave: x.segments.date + '|' + x.campaign.name, dia: x.segments.date, campanha: x.campaign.name, impressoes: Number(x.metrics.impressions) || 0,
  parcela: Number(x.metrics.searchImpressionShare) || 0, perdida_orcamento: Number(x.metrics.searchBudgetLostImpressionShare) || 0, perdida_posicao: Number(x.metrics.searchRankLostImpressionShare) || 0 } }));
