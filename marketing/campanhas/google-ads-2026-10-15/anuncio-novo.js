#!/usr/bin/env node
// 15/10/2026, aprovado pelo Jorge ("pode fazer"): anúncio novo no grupo "Câmara hiperbárica · Brasília" (texto em
// anuncio-novo-grupo-principal.md), título 1 fixo igual à busca. Regra: pausar e criar (o atual fica pausado).
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/anuncio-novo.js [--valer]
const fs = require('fs');
const { gaql } = require('../../../scripts/google-ads-ler.js');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID;
const H = ['Câmara Hiperbárica em Brasília', 'Oxigenoterapia Hiperbárica', 'Hiperbárica em Brasília', 'Medicina Hiperbárica no DF', 'Médico em Toda Sessão', 'Asa Sul e Taguatinga',
  'Todos os Dias, 7h às 19h', '50 Convênios Atendidos', 'Agende pelo WhatsApp', 'Tire Suas Dúvidas no WhatsApp', 'Desde 2004 em Brasília', 'Mais de 260 Avaliações',
  'Indicada pelo Seu Cirurgião?', 'Pós-operatório e Feridas', 'Avaliação Médica Inicial'];
const D = ['Oxigenoterapia hiperbárica com médico presente em todas as sessões. Agende pelo WhatsApp.', 'Duas unidades, Asa Sul e Taguatinga, abertas todos os dias das 7h às 19h. Fale conosco.',
  'Atendemos 50 convênios e particular. A recepção confere o seu plano antes de agendar.', 'Primeira clínica particular de medicina hiperbárica de Brasília, desde 2004. Agende.'];
(async () => {
  for (const h of H) if (h.length > 30) throw new Error('título longo: ' + h); for (const d of D) if (d.length > 90) throw new Error('descrição longa: ' + d);
  const g = (await gaql("SELECT ad_group.resource_name, ad_group.name FROM ad_group WHERE campaign.id = 20776450309 AND ad_group.status = 'ENABLED'")).find((x) => x.adGroup.name.startsWith('Câmara hiperbárica'));
  const atuais = await gaql(`SELECT ad_group_ad.resource_name, ad_group_ad.ad.id FROM ad_group_ad WHERE ad_group.resource_name = '${g.adGroup.resourceName}' AND ad_group_ad.status = 'ENABLED'`);
  console.log('grupo:', g.adGroup.name, '| anúncios ativos hoje:', atuais.length);
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  const novo = (isencoes) => ({ create: { adGroup: g.adGroup.resourceName, status: 'ENABLED', ad: { finalUrls: ['https://hiperbaricabrasilia.com.br/'], responsiveSearchAd: {
    headlines: H.map((text, i) => (i === 0 ? { text, pinnedField: 'HEADLINE_1' } : { text })), descriptions: D.map((text) => ({ text })) } } }, ...(isencoes.length ? { policyValidationParameter: { exemptPolicyViolationKeys: isencoes } } : {}) });
  const envia = async (op, validar) => { const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/adGroupAds:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: [op], validateOnly: validar }) }); return [r, await r.json()]; };
  let isencoes = [];
  let [r, j] = await envia(novo(isencoes), true);
  if (!r.ok) { // pedido de exceção oficial das marcações de saúde (como na Nexo), só das que o Google diz serem isentáveis
    const erros = j.error?.details?.[0]?.errors || [];
    isencoes = erros.map((e) => e.details?.policyViolationDetails).filter((p) => p && p.isExemptible).map((p) => p.key);
    if (isencoes.length !== erros.length) throw new Error('recusa sem exceção possível: ' + JSON.stringify(erros.map((e) => e.message)).slice(0, 500));
    console.log('pedido de exceção para:', isencoes.map((k) => k.policyName + ' "' + k.violatingText + '"').join('; '));
    [r, j] = await envia(novo(isencoes), true); if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 600));
  }
  console.log('simulação ok');
  if (!VALER) return;
  [r, j] = await envia(novo(isencoes), false); if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 600));
  console.log('anúncio novo:', j.results[0].resourceName);
  const p = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/adGroupAds:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: atuais.map((a) => ({ update: { resourceName: a.adGroupAd.resourceName, status: 'PAUSED' }, updateMask: 'status' })) }) });
  console.log('anúncios antigos pausados:', p.status, atuais.length);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
