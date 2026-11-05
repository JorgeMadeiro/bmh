#!/usr/bin/env node
/**
 * Muda o custo-alvo por conversão (CPA desejado do "maximizar conversões") de uma campanha da BMH no Google Ads
 * (conta 506-679-8424). Só com o "pode" do Jorge. Feito a partir de google-ads-orcamento.js (03/11/2026).
 * Uso: node --env-file=.env scripts/google-ads-lance.js <id da campanha> <reais por conversão>
 * Mostra o valor antes e depois. Não mexe em mais nada.
 */
const { gaql } = require('./google-ads-ler.js');
const fs = require('fs');
const [idCamp, reais] = process.argv.slice(2);
(async () => {
  if (!idCamp || !(Number(reais) > 0)) throw new Error('uso: <id da campanha> <reais por conversão>');
  const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const ler = async () => (await gaql(`SELECT campaign.name, campaign.bidding_strategy_type, campaign.maximize_conversions.target_cpa_micros FROM campaign WHERE campaign.id = ${idCamp}`)).map((x) => `${x.campaign.name} (${x.campaign.biddingStrategyType}): R$ ${Number(x.campaign.maximizeConversions?.targetCpaMicros || 0) / 1e6} por conversão`).join('; ');
  console.log('antes: ', await ler());
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) cab['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/campaigns:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: [{ update: { resourceName: `customers/${cid}/campaigns/${idCamp}`, maximizeConversions: { targetCpaMicros: String(Math.round(Number(reais) * 1e6)) } }, updateMask: 'maximize_conversions.target_cpa_micros' }] }) });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 400));
  console.log('depois:', await ler());
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
