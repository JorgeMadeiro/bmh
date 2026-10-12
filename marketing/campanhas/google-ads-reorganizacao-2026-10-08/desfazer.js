#!/usr/bin/env node
/**
 * Plano B da reorganização: religa os grupos antigos, pausa os grupos novos e a campanha de concorrentes, e volta os
 * orçamentos (LEADS R$ 86, TRÁFEGO R$ 32). As extensões novas ficam (não dependem da estrutura).
 *   node --env-file=.env marketing/campanhas/google-ads-reorganizacao-2026-10-08/desfazer.js --validar | --aplicar
 */
const fs = require('fs');
const E = require('./estrutura.js');
const { gaql } = require('../../../scripts/google-ads-ler.js');
const MODO = process.argv.includes('--aplicar') ? 'aplicar' : process.argv.includes('--validar') ? 'validar' : null;
if (!MODO) { console.error('use --validar ou --aplicar'); process.exit(1); }
const C = E.conta, R = (t, id) => `customers/${C}/${t}/${id}`;

(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const ops = [];
  const nomesNovos = [...E.pacientes.grupos, ...E.marca.grupos].map((g) => g.nome);
  const grupos = await gaql(`SELECT ad_group.resource_name, ad_group.name, campaign.resource_name FROM ad_group WHERE campaign.resource_name IN ('${E.pacientes.campanha}', '${E.marca.campanha}') AND ad_group.status != 'REMOVED'`);
  for (const g of grupos) if (nomesNovos.includes(g.adGroup.name)) ops.push({ adGroupOperation: { update: { resourceName: g.adGroup.resourceName, status: 'PAUSED' }, updateMask: 'status' } });
  for (const id of [...E.pacientes.pausar, ...E.marca.pausar]) ops.push({ adGroupOperation: { update: { resourceName: R('adGroups', id), status: 'ENABLED' }, updateMask: 'status' } });
  const conc = await gaql(`SELECT campaign.resource_name FROM campaign WHERE campaign.name = '${E.concorrentes.nome}' AND campaign.status = 'ENABLED'`);
  for (const c of conc) ops.push({ campaignOperation: { update: { resourceName: c.campaign.resourceName, status: 'PAUSED' }, updateMask: 'status' } });
  // região de antes: tira o DF e o entorno, volta os dois raios e o "só presença"
  const df = (await gaql(`SELECT campaign_criterion.resource_name, campaign_criterion.location.geo_target_constant FROM campaign_criterion WHERE campaign.resource_name = '${E.pacientes.campanha}' AND campaign_criterion.type = 'LOCATION' AND campaign_criterion.negative = FALSE`))
    .filter((x) => E.regioes[x.campaignCriterion.location.geoTargetConstant]);
  if (df.length) {
    ops.push({ campaignOperation: { update: { resourceName: E.pacientes.campanha, geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE' } }, updateMask: 'geo_target_type_setting.positive_geo_target_type' } });
    for (const x of df) ops.push({ campaignCriterionOperation: { remove: x.campaignCriterion.resourceName } });
    for (const r of E.pacientes.raiosAntes) ops.push({ campaignCriterionOperation: { create: { campaign: E.pacientes.campanha, proximity: { radius: r.km, radiusUnits: 'KILOMETERS', geoPoint: { latitudeInMicroDegrees: r.lat, longitudeInMicroDegrees: r.lon } } } } });
  }
  for (const o of [E.pacientes.orcamento, E.marca.orcamento]) ops.push({ campaignBudgetOperation: { update: { resourceName: o.recurso, amountMicros: String(o.antes * 1e6) }, updateMask: 'amount_micros' } });
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${C}/googleAds:mutate`, { method: 'POST', headers: { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutateOperations: ops, validateOnly: MODO === 'validar' }) });
  const j = await r.json();
  console.log(MODO, '·', ops.length, 'operações ·', r.ok ? 'OK' : 'RECUSADO ' + JSON.stringify(j.error?.details?.[0]?.errors?.slice(0, 3) || j).slice(0, 600));
  if (!r.ok) process.exit(1);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
