#!/usr/bin/env node
// 15/10/2026, "ok imagem" do Jorge: imagens no anúncio (extensão de imagem da conta), só fotos sem paciente
// (ensaio de 2025, equipe autorizou; Taguatinga 30/06/2026). Recortes conferidos à vista: os quadrados que cortavam
// pessoas (equipe e painel da multiplace) ficaram de fora.
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/imagens.js [--valer]
const fs = require('fs'), path = require('path');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID, D = path.join(__dirname, 'imagens');
const USAR = ['medica-ajustando-camara-monoplace-horizontal', 'camara-multiplace-e-painel-horizontal', 'equipe-medica-camara-multiplace-horizontal', 'taguatinga-fachada-horizontal', 'taguatinga-recepcao-horizontal',
  'medica-ajustando-camara-monoplace-quadrada', 'taguatinga-fachada-quadrada', 'taguatinga-recepcao-quadrada'];
(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const chama = async (servico, ops) => { const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/${servico}:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
    const j = await r.json(); if (!r.ok) throw new Error(servico + ' ' + r.status + ' ' + JSON.stringify(j.error?.details?.[0]?.errors?.map((e) => [e.errorCode, e.message]) || j).slice(0, 900)); return (j.results || []).map((x) => x.resourceName); };
  const novos = await chama('assets', USAR.map((n) => ({ create: { name: 'BMH · ' + n + ' (15/10/2026)', type: 'IMAGE', imageAsset: { data: fs.readFileSync(path.join(D, n + '.jpg')).toString('base64') } } })));
  // imagem não liga na conta (UNSUPPORTED_FIELD_TYPE): liga em cada campanha (feito em 15/10 para as 3 ativas)
  if (VALER) for (const c of ['20776450309', '20833761565', '24333599216']) await chama('campaignAssets', novos.map((a) => ({ create: { campaign: `customers/${cid}/campaigns/${c}`, asset: a, fieldType: 'AD_IMAGE' } })));
  console.log(VALER ? 'APLICADO' : 'SIMULAÇÃO ok, nada mudou', USAR.length, 'imagens');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
