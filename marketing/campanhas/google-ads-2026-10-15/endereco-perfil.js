#!/usr/bin/env node
// 15/10/2026, "ok endereço" do Jorge: liga as fichas do Google (Asa Sul e Taguatinga) ao Google Ads, para o anúncio
// mostrar endereço, distância e nota. Só a conta da BMH no Perfil ("Brasília Medicina Hiperbárica",
// accounts/117754317451946679663): a mesma autorização enxerga Nexo e Cannlink, que ficam de fora.
// Antes disto, o "clique em ligar" deixou de contar como contato (aplicar-ajustes.js), e as ações de Maps já não contam.
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/endereco-perfil.js [--valer]
const fs = require('fs');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  // e-mail da conta que é dona das fichas (a mesma da autorização)
  const eu = await (await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + t.access_token)).json();
  const chama = async (servico, ops) => { const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/${servico}:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
    const j = await r.json(); if (!r.ok) throw new Error(servico + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 1200)); return (j.results || []).map((x) => x.resourceName); };
  // (15/10: a ligação antiga 7444486238, o grupo 8246069420 e a campanha inteligente pausada "Medicina Hiperbárica"
  // foram removidos antes, com o "pode" do Jorge; só pode haver uma ligação de fichas ativa por conta)
  const [conjunto] = await chama('assetSets', [{ create: { name: 'BMH · fichas do Google (Asa Sul e Taguatinga)', type: 'LOCATION_SYNC',
    locationSet: { locationOwnershipType: 'BUSINESS_OWNER', businessProfileLocationSet: { httpAuthorizationToken: t.access_token, emailAddress: eu.email || 'jorgemadeirotorres@gmail.com', businessAccountId: '117754317451946679663' } } } }]);
  console.log('conjunto de endereços:', conjunto || '(simulação)', '| conta dona:', eu.email ? 'ok' : 'sem e-mail');
  if (VALER) console.log('ligado à conta:', await chama('customerAssetSets', [{ create: { assetSet: conjunto } }]));
  console.log(VALER ? 'APLICADO' : 'SIMULAÇÃO ok, nada mudou');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
