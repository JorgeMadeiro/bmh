#!/usr/bin/env node
// Duas conversões SECUNDÁRIAS no Google Ads da BMH (22/10/2026, "pode" do Jorge: "já pode criar inclusive o envio à Meta e
// ao Google"): "BMH · Avaliou (iGut)" e "BMH · Iniciou tratamento (iGut)", alimentadas pelo fluxo "BMH · Conversões · envio"
// (Data Manager API). Secundárias = medem e aparecem nos relatórios, mas NÃO mudam o lance das campanhas (o lance segue
// pelo "[Contato] Whatsapp link"), como as três da Nexo. Não duplica: se o nome já existe, só mostra o id.
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-22/conversoes-igut.js [--valer]   (sem --valer: simulação)
const fs = require('fs'), path = require('path');
const VALER = process.argv.includes('--valer'), cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
const ACOES = [{ name: 'BMH · Avaliou (iGut)', category: 'QUALIFIED_LEAD' }, { name: 'BMH · Iniciou tratamento (iGut)', category: 'CONVERTED_LEAD' }];
(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')), cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json', ...(process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? { 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN } : {}) };
  const q = await (await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/googleAds:searchStream`, { method: 'POST', headers: cab, body: JSON.stringify({ query: "SELECT conversion_action.id, conversion_action.name FROM conversion_action WHERE conversion_action.name LIKE 'BMH · %'" }) })).json();
  const existe = Object.fromEntries((q[0]?.results || []).map((r) => [r.conversionAction.name, r.conversionAction.id]));
  const criar = ACOES.filter((a) => !existe[a.name]);
  for (const a of ACOES) if (existe[a.name]) console.log('já existe:', a.name, existe[a.name]);
  if (!criar.length) return;
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/conversionActions:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ validateOnly: !VALER, operations: criar.map((a) => ({ create: {
    name: a.name, type: 'UPLOAD_CLICKS', category: a.category, status: 'ENABLED', primaryForGoal: false, countingType: 'ONE_PER_CLICK',
    clickThroughLookbackWindowDays: 90, valueSettings: { defaultValue: 0, alwaysUseDefaultValue: true } } })) }) });
  const j = await r.json(); if (!r.ok) throw new Error(r.status + ' ' + JSON.stringify(j).slice(0, 800));
  console.log(VALER ? 'criadas:' : 'simulação ok (nada criado):', (j.results || []).map((x) => x.resourceName).join(', ') || criar.map((a) => a.name).join(', '));
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
