#!/usr/bin/env node
/**
 * Muda o orçamento diário de uma campanha da BMH no Google Ads (conta 506-679-8424). Só com o "pode" do Jorge.
 * Uso: node --env-file=.env scripts/google-ads-orcamento.js <id do orçamento> <reais por dia>
 * Mostra o valor antes e depois. Não mexe em mais nada.
 */
const { gaql } = require('./google-ads-ler.js');
const fs = require('fs');
const [idOrc, reais] = process.argv.slice(2);
(async () => {
  if (!idOrc || !(Number(reais) > 0)) throw new Error('uso: <id do orçamento> <reais por dia>');
  const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const ler = async () => (await gaql(`SELECT campaign_budget.name, campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.id = ${idOrc}`)).map((x) => `${x.campaignBudget.name}: R$ ${x.campaignBudget.amountMicros / 1e6}`).join(', ');
  console.log('antes: ', await ler());
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) cab['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/campaignBudgets:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: [{ update: { resourceName: `customers/${cid}/campaignBudgets/${idOrc}`, amountMicros: String(Math.round(Number(reais) * 1e6)) }, updateMask: 'amount_micros' }] }) });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 400));
  console.log('depois:', await ler());
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
