#!/usr/bin/env node
/**
 * Aplica a reorganização de estrutura.js no Google Ads da BMH, num pedido só (tudo ou nada).
 *   node --env-file=.env marketing/campanhas/google-ads-reorganizacao-2026-10-08/aplicar.js --validar   (o Google confere; nada é criado)
 *   node --env-file=.env marketing/campanhas/google-ads-reorganizacao-2026-10-08/aplicar.js --aplicar   (só com o "pode" do Jorge)
 *   node --env-file=.env marketing/campanhas/google-ads-reorganizacao-2026-10-08/aplicar.js --pausar-antigos
 *     (depois que o Google aprovar os anúncios novos: só pausa os grupos antigos se todos os novos estiverem aprovados,
 *      para a BMH não ficar horas sem anúncio enquanto o Google revisa)
 * Plano B: os grupos antigos ficam pausados, não apagados (desfazer.js os religa e pausa os novos).
 */
const fs = require('fs'), path = require('path');
const E = require('./estrutura.js');
const { gaql } = require('../../../scripts/google-ads-ler.js');
const MODO = process.argv.includes('--aplicar') ? 'aplicar' : process.argv.includes('--validar') ? 'validar' : process.argv.includes('--pausar-antigos') ? 'pausar' : null;
if (!MODO) { console.error('use --validar, --aplicar ou --pausar-antigos'); process.exit(1); }
const C = E.conta, R = (t, id) => `customers/${C}/${t}/${id}`;

async function token() {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) });
  const j = await r.json(); if (!r.ok) throw new Error('autorização recusada'); return j.access_token;
}

async function pausarAntigos() {
  const nomes = [...E.pacientes.grupos, ...E.marca.grupos].map((g) => g.nome);
  const ads = await gaql(`SELECT ad_group.name, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.review_status FROM ad_group_ad WHERE campaign.resource_name IN ('${E.pacientes.campanha}', '${E.marca.campanha}') AND ad_group_ad.status = 'ENABLED' AND ad_group.status = 'ENABLED'`);
  const novos = ads.filter((a) => nomes.includes(a.adGroup.name));
  for (const a of novos) console.log(' ', a.adGroup.name.padEnd(32), a.adGroupAd.policySummary.approvalStatus, a.adGroupAd.policySummary.reviewStatus);
  const ok = (s) => ['APPROVED', 'APPROVED_LIMITED'].includes(s);
  if (novos.length < nomes.length) { console.log('Ainda não achei todos os anúncios novos: nada pausado.'); return; }
  if (!novos.every((a) => ok(a.adGroupAd.policySummary.approvalStatus))) { console.log('Ainda há anúncio novo sem aprovação: nada pausado. Rodar de novo mais tarde.'); return; }
  const tok = await token();
  const ops = [...E.pacientes.pausar, ...E.marca.pausar].map((id) => ({ adGroupOperation: { update: { resourceName: R('adGroups', id), status: 'PAUSED' }, updateMask: 'status' } }));
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${C}/googleAds:mutate`, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ mutateOperations: ops }) });
  console.log(r.ok ? 'Grupos antigos pausados (plano B guardado): ' + ops.length : 'RECUSADO ' + JSON.stringify(await r.json()).slice(0, 400));
}

(async () => {
  if (process.env.GOOGLE_ADS_CUSTOMER_ID !== C) throw new Error('conta errada no .env');
  if (MODO === 'pausar') return pausarAntigos();
  const ops = []; let tmp = -1; const novo = () => tmp--;
  const saude = (texto) => [{ policyName: 'HEALTH_IN_PERSONALIZED_ADS', violatingText: texto }];
  const negCampanha = (camp, lista) => lista.forEach(([text, matchType]) => ops.push({ campaignCriterionOperation: { create: { campaign: camp, negative: true, keyword: { text, matchType } } } }));
  const grupos = (camp, lista, resumo) => {
    for (const g of lista) {
      const ag = R('adGroups', novo());
      ops.push({ adGroupOperation: { create: { resourceName: ag, campaign: camp, name: g.nome, status: 'ENABLED', type: 'SEARCH_STANDARD' } } });
      for (const [text, matchType] of g.palavras)
        ops.push({ adGroupCriterionOperation: { create: { adGroup: ag, status: 'ENABLED', keyword: { text, matchType } }, exemptPolicyViolationKeys: saude(text) } });
      for (const text of g.negativas) ops.push({ adGroupCriterionOperation: { create: { adGroup: ag, negative: true, keyword: { text, matchType: 'PHRASE' } } } });
      ops.push({ adGroupAdOperation: { create: { adGroup: ag, status: 'ENABLED', ad: { finalUrls: [g.url], responsiveSearchAd: {
        headlines: g.titulos.map((text) => ({ text })), descriptions: g.descricoes.map((text) => ({ text })), path1: g.caminho[0], ...(g.caminho[1] ? { path2: g.caminho[1] } : {}) } } } } });
      resumo.push(g.nome);
    }
  };
  const resumo = [];
  // 1. orçamentos (conferidos antes: só muda se ainda estiver no valor da proposta)
  for (const o of [E.pacientes.orcamento, E.marca.orcamento]) {
    const [r] = await gaql(`SELECT campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.resource_name = '${o.recurso}'`);
    const atual = Number(r.campaignBudget.amountMicros) / 1e6; if (Math.abs(atual - o.antes) > 0.01) throw new Error(`orçamento ${o.recurso} está em ${atual}, esperado ${o.antes}`);
    ops.push({ campaignBudgetOperation: { update: { resourceName: o.recurso, amountMicros: String(o.novo * 1e6) }, updateMask: 'amount_micros' } });
  }
  // 2. Pacientes (LEADS) e Marca (TRÁFEGO): grupos novos, antigos pausados, negativas da campanha
  grupos(E.pacientes.campanha, E.pacientes.grupos, resumo); negCampanha(E.pacientes.campanha, E.pacientes.negativas);
  // região da Pacientes: sai o raio (22 km + 10 km, só presença), entram o DF e o entorno, presença ou interesse
  const raios = await gaql(`SELECT campaign_criterion.resource_name FROM campaign_criterion WHERE campaign.resource_name = '${E.pacientes.campanha}' AND campaign_criterion.type = 'PROXIMITY' AND campaign_criterion.negative = FALSE`);
  for (const x of raios) ops.push({ campaignCriterionOperation: { remove: x.campaignCriterion.resourceName } });
  for (const geo of Object.keys(E.regioes)) ops.push({ campaignCriterionOperation: { create: { campaign: E.pacientes.campanha, location: { geoTargetConstant: geo } } } });
  ops.push({ campaignOperation: { update: { resourceName: E.pacientes.campanha, geoTargetTypeSetting: { positiveGeoTargetType: E.alcance } }, updateMask: 'geo_target_type_setting.positive_geo_target_type' } });
  grupos(E.marca.campanha, E.marca.grupos, resumo); negCampanha(E.marca.campanha, E.marca.negativas);
  // os grupos antigos só são pausados depois que o Google aprovar os novos (--pausar-antigos)
  // 3. Concorrentes (campanha nova): mesma região, idioma e horário da LEADS
  const orc = R('campaignBudgets', novo()), camp = R('campaigns', novo());
  ops.push({ campaignBudgetOperation: { create: { resourceName: orc, name: E.concorrentes.nome + ' · orçamento', amountMicros: String(E.concorrentes.orcamento * 1e6), deliveryMethod: 'STANDARD', explicitlyShared: false } } });
  ops.push({ campaignOperation: { create: { resourceName: camp, name: E.concorrentes.nome, status: 'ENABLED', advertisingChannelType: 'SEARCH', campaignBudget: orc, targetSpend: {},
    networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false, targetContentNetwork: false, targetPartnerSearchNetwork: false },
    geoTargetTypeSetting: { positiveGeoTargetType: E.alcance, negativeGeoTargetType: 'PRESENCE' }, containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING' } } });
  const crit = await gaql(`SELECT campaign_criterion.type, campaign_criterion.proximity.radius, campaign_criterion.proximity.radius_units, campaign_criterion.proximity.geo_point.latitude_in_micro_degrees, campaign_criterion.proximity.geo_point.longitude_in_micro_degrees, campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour, campaign_criterion.ad_schedule.end_hour, campaign_criterion.language.language_constant FROM campaign_criterion WHERE campaign.resource_name = '${E.concorrentes.copiarLocalDe}' AND campaign_criterion.type IN ('AD_SCHEDULE', 'LANGUAGE') AND campaign_criterion.negative = FALSE`);
  for (const geo of Object.keys(E.regioes)) ops.push({ campaignCriterionOperation: { create: { campaign: camp, location: { geoTargetConstant: geo } } } });
  for (const { campaignCriterion: k } of crit) {
    const c = { campaign: camp };
    if (k.type === 'AD_SCHEDULE') c.adSchedule = { dayOfWeek: k.adSchedule.dayOfWeek, startHour: k.adSchedule.startHour, endHour: k.adSchedule.endHour, startMinute: 'ZERO', endMinute: 'ZERO' };
    else c.language = { languageConstant: k.language.languageConstant };
    ops.push({ campaignCriterionOperation: { create: c } });
  }
  if (!crit.some((x) => x.campaignCriterion.type === 'LANGUAGE')) ops.push({ campaignCriterionOperation: { create: { campaign: camp, language: { languageConstant: 'languageConstants/1014' } } } });
  grupos(camp, E.concorrentes.grupos, resumo); negCampanha(camp, E.concorrentes.negativas);
  // 4. extensões novas nas três campanhas; as antigas saem da LEADS e da TRÁFEGO
  const X = E.extensoes, novas = [];
  for (const l of X.links) { const a = R('assets', novo()); novas.push([a, 'SITELINK']); ops.push({ assetOperation: { create: { resourceName: a, finalUrls: [l.url], sitelinkAsset: { linkText: l.texto, description1: l.d1, description2: l.d2 } } } }); }
  for (const t of X.frases) { const a = R('assets', novo()); novas.push([a, 'CALLOUT']); ops.push({ assetOperation: { create: { resourceName: a, calloutAsset: { calloutText: t } } } }); }
  { const a = R('assets', novo()); novas.push([a, 'STRUCTURED_SNIPPET']); ops.push({ assetOperation: { create: { resourceName: a, structuredSnippetAsset: { header: X.trecho.cabecalho, values: X.trecho.valores } } } }); }
  const ligadas = await gaql(`SELECT campaign.resource_name, campaign_asset.field_type, asset.id FROM campaign_asset WHERE campaign.resource_name IN ('${E.pacientes.campanha}', '${E.marca.campanha}') AND campaign_asset.status = 'ENABLED'`);
  for (const r of ligadas) if (X.tirar.includes(String(r.asset.id))) ops.push({ campaignAssetOperation: { remove: r.campaignAsset.resourceName } });
  for (const c of [E.pacientes.campanha, E.marca.campanha, camp]) for (const [a, campo] of novas) ops.push({ campaignAssetOperation: { create: { campaign: c, asset: a, fieldType: campo } } });
  // ligação, nome e logo na campanha nova (os mesmos da LEADS)
  for (const r of ligadas) if (r.campaign.resourceName === E.pacientes.campanha && ['CALL', 'BUSINESS_NAME', 'BUSINESS_LOGO'].includes(r.campaignAsset.fieldType))
    ops.push({ campaignAssetOperation: { create: { campaign: camp, asset: R('assets', r.asset.id), fieldType: r.campaignAsset.fieldType } } });
  // (conversões: as 6 da campanha inteligente antiga são do próprio Google e a API não deixa mudar; não registram nada)

  const tok = await token();
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${C}/googleAds:mutate`, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutateOperations: ops, validateOnly: MODO === 'validar', partialFailure: false }) });
  const j = await r.json();
  const conta = ops.reduce((m, o) => { const k = Object.keys(o)[0].replace('Operation', ''); m[k] = (m[k] || 0) + 1; return m; }, {});
  console.log(MODO, '·', ops.length, 'operações', JSON.stringify(conta));
  if (!r.ok) {
    const det = (((j.error || {}).details || [])[0] || {}).errors || [];
    console.log('RECUSADO:', (j.error || {}).message);
    for (const e of det.slice(0, 25)) { const i = (e.location?.fieldPathElements || []).find((p) => p.fieldName === 'mutate_operations')?.index; console.log(' -', JSON.stringify(e.errorCode), '|', e.message, '| op', i, i != null ? JSON.stringify(ops[i]).slice(0, 220) : '', e.details?.policyViolationDetails ? JSON.stringify(e.details.policyViolationDetails) : ''); }
    process.exit(1);
  }
  if (MODO === 'validar') { console.log('OK: o Google aceitou tudo (nada foi criado). Grupos:', resumo.join(' · ')); return; }
  const res = j.mutateOperationResponses || [];
  const criados = res.map((x) => Object.values(x)[0]?.resourceName).filter(Boolean);
  fs.writeFileSync(path.join(__dirname, 'aplicado.json'), JSON.stringify({ quando: new Date().toISOString(), operacoes: ops.length, criados }, null, 1));
  console.log('APLICADO:', criados.length, 'recursos. Lista em aplicado.json');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
