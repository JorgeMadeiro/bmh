#!/usr/bin/env node
/**
 * Leitura do Google Ads da BMH (conta 506-679-8424), só leitura, pela autorização gravada por
 * scripts/google-ads-autorizar.py. Nunca imprime token nem segredo.
 *
 * Uso:
 *   node --env-file=.env scripts/google-ads-ler.js "<consulta GAQL>"
 *   require('./google-ads-ler').gaql(consulta)   dentro de outros scripts
 */
const fs = require('fs');

const VERSAO = 25;
let cache = null;

async function token() {
  if (cache && cache.expira > Date.now() + 60000) return cache.valor;
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8'));
  const cli = d.installed || d.web;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('autorização recusada: ' + (j.error_description || j.error));
  cache = { valor: j.access_token, expira: Date.now() + j.expires_in * 1000 };
  return cache.valor;
}

async function gaql(query) {
  const cab = { Authorization: 'Bearer ' + (await token()), 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) cab['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const url = `https://googleads.googleapis.com/v${VERSAO}/customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:searchStream`;
  const r = await fetch(url, { method: 'POST', headers: cab, body: JSON.stringify({ query }) });
  const j = await r.json();
  if (!r.ok) { const e = (j[0] || j).error || j.error || {}; throw new Error(`${r.status} ${e.message || JSON.stringify(j).slice(0, 300)}`); }
  return (Array.isArray(j) ? j : [j]).flatMap((x) => x.results || []);
}

module.exports = { gaql };

if (require.main === module && process.argv[2]) {
  gaql(process.argv[2]).then((linhas) => console.log(JSON.stringify(linhas, null, 1))).catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
}
