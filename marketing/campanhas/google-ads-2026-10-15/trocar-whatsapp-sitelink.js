#!/usr/bin/env node
// Troca o link de extensão "Agende sua consulta!" (WhatsApp 61 98345-2021, que não é o oficial) pelo WhatsApp oficial
// da BMH, (61) 3346-6005, com o mesmo texto. Pedido do Jorge em 15/10/2026 ("tire do anúncio e coloque o oficial").
// Cria o link novo na conta e tira o antigo (o antigo não é apagado: só deixa de estar ligado à conta).
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/trocar-whatsapp-sitelink.js [--valer]
const fs = require('fs');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
const ANTIGO = `customers/${cid}/customerAssets/112670364903~SITELINK`;
// sem acento: com acento codificado no endereço, o Google Ads devolve erro interno (500), testado em 15/10/2026
const URL = 'https://api.whatsapp.com/send/?phone=556133466005&text=Ola%21+Vim+pelo+anuncio+da+BMH+no+Google+e+gostaria+de+agendar+uma+avaliacao.';
(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  // em passos (o envio único devolveu erro interno do Google em 15/10): cria o link, liga à conta, tira o antigo
  const chama = async (servico, ops) => { const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/${servico}:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
    const j = await r.json(); if (!r.ok) throw new Error(servico + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 500)); return (j.results || []).map((x) => x.resourceName); };
  const [novo] = await chama('assets', [{ create: { finalUrls: [URL], sitelinkAsset: { linkText: 'Agende sua consulta!', description1: 'Descubra qual plano cobrimos', description2: 'Fale conosco' } } }]);
  console.log('link criado:', novo || '(simulação)');
  if (!VALER) return console.log('SIMULAÇÃO: nada mudou');
  console.log('ligado à conta:', await chama('customerAssets', [{ create: { asset: novo, fieldType: 'SITELINK' } }]));
  console.log('antigo tirado:', await chama('customerAssets', [{ remove: ANTIGO }]));
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
