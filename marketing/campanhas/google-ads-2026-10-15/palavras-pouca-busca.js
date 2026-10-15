#!/usr/bin/env node
// 15/10/2026, "pode" do Jorge: tira as palavras que o Google marca como "pouca busca" (RARELY_SERVED, nunca rodaram desde
// 08/10; as buscas delas já são pegas por palavras mais amplas da conta) e põe duas com busca real no DF (Planejador):
// "câmara hiperbárica em brasília df" (grupo principal) e "câmara hiperbárica tratamento feridas" (grupo Feridas).
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/palavras-pouca-busca.js [--valer]
const fs = require('fs'), path = require('path');
const { gaql } = require('../../../scripts/google-ads-ler.js');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
(async () => {
  const pouca = await gaql(`SELECT ad_group_criterion.resource_name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group.name FROM ad_group_criterion WHERE campaign.id = 20776450309 AND ad_group.status = 'ENABLED' AND ad_group_criterion.status = 'ENABLED' AND ad_group_criterion.negative = FALSE AND ad_group_criterion.system_serving_status = 'RARELY_SERVED'`);
  const grupos = Object.fromEntries((await gaql(`SELECT ad_group.resource_name, ad_group.name FROM ad_group WHERE campaign.id = 20776450309 AND ad_group.status = 'ENABLED'`)).map((x) => [x.adGroup.name, x.adGroup.resourceName]));
  const principal = Object.keys(grupos).find((n) => n.startsWith('Câmara hiperbárica')), feridas = grupos['Feridas'];
  console.log('saem:', pouca.length); for (const x of pouca) console.log('  -', x.adGroup.name, '|', x.adGroupCriterion.keyword.text, x.adGroupCriterion.keyword.matchType);
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const ops = [...pouca.map((x) => ({ remove: x.adGroupCriterion.resourceName })),
    { create: { adGroup: grupos[principal], status: 'ENABLED', keyword: { text: 'câmara hiperbárica em brasília df', matchType: 'PHRASE' } } },
    // pedido de exceção oficial da política de saúde em anúncio personalizado (o Google marca o termo, como na Nexo)
    { create: { adGroup: feridas, status: 'ENABLED', keyword: { text: 'câmara hiperbárica tratamento feridas', matchType: 'PHRASE' } },
      exemptPolicyViolationKeys: [{ policyName: 'HEALTH_IN_PERSONALIZED_ADS', violatingText: 'câmara hiperbárica tratamento feridas' }] }];
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/adGroupCriteria:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
  const j = await r.json(); if (!r.ok) throw new Error(r.status + ' ' + JSON.stringify(j).slice(0, 2500));
  if (VALER) fs.writeFileSync(path.join(__dirname, 'palavras-pouca-busca-aplicado.json'), JSON.stringify({ quando: new Date().toISOString(), sairam: pouca.map((x) => ({ grupo: x.adGroup.name, texto: x.adGroupCriterion.keyword.text, tipo: x.adGroupCriterion.keyword.matchType })) }, null, 1));
  console.log(VALER ? 'APLICADO' : 'SIMULAÇÃO ok, nada mudou');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
