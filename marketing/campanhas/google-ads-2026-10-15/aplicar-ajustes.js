#!/usr/bin/env node
// Ajustes do Google Ads da BMH aprovados pelo Jorge em 15/10/2026 (marketing/estrategia-site-e-google-ads-2026-10-15.md):
//  1. o "clique em ligar" do anúncio deixa de contar como contato (as outras conversões antigas já não contam);
//  2. lista de negativas da conta, ligada às 3 campanhas ativas;
//  3. links do anúncio novos, direto nas páginas (sem redirecionar); saem "Fisiologia do tratamento" (/tratamento/
//     redireciona e perde o gclid) e "Convênios médicos" (texto antigo, "mais de 40");
//  4. telefone (61) 3346-6005;
//  5. lista de serviços só com indicações do CFM, no lugar da antiga.
// Uso: node --env-file=.env marketing/campanhas/google-ads-2026-10-15/aplicar-ajustes.js [--valer]
// Sem --valer é simulação (validateOnly): o Google confere tudo e nada muda. Grava o que fez em aplicado-ajustes.json.
const fs = require('fs'), path = require('path');
const VALER = process.argv.includes('--valer');
const cid = process.env.GOOGLE_ADS_CUSTOMER_ID, C = (x) => `customers/${cid}/${x}`;
const CAMPANHAS = ['20776450309', '20833761565', '24333599216'];   // Pacientes, Tráfego (marca), Concorrentes
const NEGATIVAS = [
  // outras cidades (a região já é o DF, mas quem busca "câmara hiperbárica bh" de dentro do DF não é paciente daqui)
  'bh', 'belo horizonte', 'são paulo', 'rio de janeiro', 'goiânia', 'goiania', 'salvador', 'recife', 'fortaleza', 'curitiba', 'porto alegre', 'manaus',
  // estética fora da indicação
  'rejuvenesce', 'rejuvenescimento',
  // trabalho e estudo
  'curso', 'enfermagem', 'emprego', 'concurso', 'salário', 'salario',
  // oxigênio em casa ("oxigenoterapia" sozinha atrai essa busca)
  'domiciliar', 'concentrador', 'cateter', 'cânula', 'canula', 'cilindro',
  // fora da lista de indicações do CFM
  'autismo', 'veterinária', 'veterinario', 'cavalo',
];
const SITELINKS = [
  { linkText: 'Pós-operatório', description1: 'Indicado pelo seu cirurgião', description2: 'Médico em toda sessão', url: 'https://hiperbaricabrasilia.com.br/pos-operatorio-cirurgia-plastica/' },
  { linkText: '50 convênios atendidos', description1: 'A recepção confere o seu plano', description2: 'Asa Sul e Taguatinga', url: 'https://hiperbaricabrasilia.com.br/convenios/' },
  { linkText: 'Unidade Asa Sul', description1: 'SGAS 613, L2 Sul', description2: 'Todos os dias, 7h às 19h', url: 'https://hiperbaricabrasilia.com.br/hiperbarica-asa-sul/' },
  { linkText: 'Unidade Taguatinga', description1: 'Prédio Prime Excelência Médica', description2: 'Todos os dias, 7h às 19h', url: 'https://hiperbaricabrasilia.com.br/hiperbarica-taguatinga/' },
  { linkText: 'Perguntas frequentes', description1: 'Sessões, duração e preparo', description2: 'Respostas da equipe médica', url: 'https://hiperbaricabrasilia.com.br/perguntas-frequentes/' },
];
const SAEM = [C('customerAssets/114991216183~SITELINK'), C('customerAssets/115015809936~SITELINK'), C('customerAssets/114984686606~STRUCTURED_SNIPPET')];
const SNIPPET = { header: 'Serviços', values: ['Pós-operatório plástica', 'Feridas crônicas', 'Pé diabético', 'Lesão por radioterapia', 'Avaliação para mergulho'] };

(async () => {
  for (const s of SITELINKS) for (const [k, max] of [['linkText', 25], ['description1', 35], ['description2', 35]]) if (s[k].length > max) throw new Error(`${k} longo demais: ${s[k]}`);
  for (const v of SNIPPET.values) if (v.length > 25) throw new Error('serviço longo demais: ' + v);
  const d = JSON.parse(fs.readFileSync(process.env.GOOGLE_ADS_OAUTH_CLIENTE, 'utf8')); const cli = d.installed || d.web;
  const t = await (await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: cli.client_id, client_secret: cli.client_secret, refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }) })).json();
  const cab = { Authorization: 'Bearer ' + t.access_token, 'Content-Type': 'application/json' };
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) cab['developer-token'] = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const feito = { quando: new Date().toISOString(), valer: VALER, passos: [] };
  const chama = async (servico, ops) => {
    const r = await fetch(`https://googleads.googleapis.com/v25/customers/${cid}/${servico}:mutate`, { method: 'POST', headers: cab, body: JSON.stringify({ operations: ops, validateOnly: !VALER }) });
    const j = await r.json(); if (!r.ok) throw new Error(servico + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 700));
    const res = (j.results || []).map((x) => x.resourceName); feito.passos.push({ servico, n: ops.length, res }); return res;
  };
  // 1. metas de conversão da conta: as de Maps, visita à loja e campanha inteligente (origem GOOGLE_HOSTED e STORE) já não
  // contam (conferido em 15/10). Falta uma: "clique em ligar" do anúncio (CONTACT, origem CALL_FROM_ADS), que contaria
  // cada toque no telefone como contato, mesmo sem ligação. A ligação de verdade (PHONE_CALL_LEAD) segue contando.
  await chama('customerConversionGoals', [{ update: { resourceName: C('customerConversionGoals/CONTACT~CALL_FROM_ADS'), biddable: false }, updateMask: 'biddable' }]);
  console.log('1. "clique em ligar" deixa de contar como contato');
  // 2. lista de negativas
  const [lista] = await chama('sharedSets', [{ create: { name: 'BMH · negativas gerais (15/10/2026)', type: 'NEGATIVE_KEYWORDS' } }]);
  if (VALER) {
    await chama('sharedCriteria', NEGATIVAS.map((k) => ({ create: { sharedSet: lista, keyword: { text: k, matchType: 'PHRASE' } } })));
    await chama('campaignSharedSets', CAMPANHAS.map((c) => ({ create: { campaign: C('campaigns/' + c), sharedSet: lista } })));
  }
  console.log('2. negativas:', NEGATIVAS.length, 'nas', CAMPANHAS.length, 'campanhas', VALER ? '' : '(simulação da lista)');
  // 3 a 5. links, telefone e serviços (cria os novos, liga à conta, tira os antigos)
  const novos = await chama('assets', [
    ...SITELINKS.map((s) => ({ create: { finalUrls: [s.url], sitelinkAsset: { linkText: s.linkText, description1: s.description1, description2: s.description2 } } })),
    { create: { callAsset: { countryCode: 'BR', phoneNumber: '(61) 3346-6005', callConversionReportingState: 'USE_ACCOUNT_LEVEL_CALL_CONVERSION_ACTION' } } },
    { create: { structuredSnippetAsset: SNIPPET } },
  ]);
  if (VALER) {
    const tipos = [...SITELINKS.map(() => 'SITELINK'), 'CALL', 'STRUCTURED_SNIPPET'];
    await chama('customerAssets', novos.map((a, i) => ({ create: { asset: a, fieldType: tipos[i] } })));
    await chama('customerAssets', SAEM.map((r) => ({ remove: r })));
  }
  console.log('3 a 5. links, telefone e serviços:', VALER ? 'aplicados' : 'simulação ok');
  if (VALER) fs.writeFileSync(path.join(__dirname, 'aplicado-ajustes.json'), JSON.stringify(feito, null, 1));
  console.log(VALER ? 'APLICADO' : 'SIMULAÇÃO: nada mudou');
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
