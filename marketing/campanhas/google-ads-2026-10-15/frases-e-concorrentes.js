#!/usr/bin/env node
// 15/10/2026, "pode" do Jorge: (1) frases de destaque com fatos no lugar de "Oxigênio, Inovação, Vida!" e "Líder em OHB"
// (slogan e superlativo sem prova); (2) HiperCure (Águas Claras, ~40 buscas/mês no DF) na campanha de concorrentes.
// "Pioneira em Brasília" ficou de fora: o fato confirmado é "primeira clínica particular", sempre com "particular".
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/frases-e-concorrentes.js [--valer]
const fs = require('fs');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID, C = (x) => `customers/${cid}/${x}`;
const FRASES = ['Médico em toda sessão', 'Desde 2004', 'Asa Sul e Taguatinga', '50 convênios', 'Aberto todos os dias', 'Das 7h às 19h'];
const SAEM = [C('customerAssets/115016534805~CALLOUT'), C('customerAssets/115016534808~CALLOUT')];
const GRUPO = process.argv.find((a) => a.startsWith('--grupo='))?.slice(8);
(async () => {
  for (const f of FRASES) if (f.length > 25) throw new Error('frase longa demais: ' + f);
  if (!GRUPO) throw new Error('falta --grupo=<resource name do grupo de concorrentes>');
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const chama = async (servico, ops) => { const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/${servico}:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
    const j = await r.json(); if (!r.ok) throw new Error(servico + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 600)); return (j.results || []).map((x) => x.resourceName); };
  const novos = await chama('assets', FRASES.map((f) => ({ create: { calloutAsset: { calloutText: f } } })));
  if (VALER) { await chama('customerAssets', novos.map((a) => ({ create: { asset: a, fieldType: 'CALLOUT' } }))); await chama('customerAssets', SAEM.map((r) => ({ remove: r }))); }
  await chama('adGroupCriteria', ['hipercure', 'hiper cure'].map((k) => ({ create: { adGroup: GRUPO, status: 'ENABLED', keyword: { text: k, matchType: 'PHRASE' } } })));
  console.log(VALER ? 'APLICADO' : 'SIMULAÇÃO ok, nada mudou');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
