#!/usr/bin/env node
/**
 * Coleta os números do painel da BMH e devolve o JSON no MESMO FORMATO do painel da Nexo (Nexo_Claude_VSL/integracoes/
 * painel-anuncios/, nó "Monta os dados"), para a página ser a mesma. Fontes: Google Ads (API), Analytics (GA4 418169293),
 * Search Console. Hoje roda daqui (prévia); depois a lógica vai para o fluxo do n8n.
 *
 * Uso:  node --env-file=.env integracoes/painel/coleta.js [--inicio AAAA-MM-DD --fim AAAA-MM-DD] > dados.json
 * Sem datas: últimos 30 dias até ontem (como a Nexo). Período anterior: mês anterior quando começa no dia 1; senão, os
 * mesmos dias logo antes. Nada aqui tem nome, telefone ou dado de paciente.
 *
 * O que muda em relação à Nexo: a recepção da BMH usa o WhatsApp no celular, então "origens" são os CLIQUES no WhatsApp
 * do site (Analytics), sem agendou/atendido (mede_agendamento = false). Os atendimentos entram pelo iGut no n8n.
 */
const { gaql } = require('../../scripts/google-ads-ler.js');
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');

const GA4 = '418169293';
const SITE = 'https://hiperbaricabrasilia.com.br/';
// Teto mensal do Google Ads: média dos últimos 12 meses (out/2025 a set/2026: R$ 3.641), decisão do Jorge em 08/10/2026
const TETO_MES = 3600;
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf('--' + n); return i === -1 ? null : args[i + 1]; };

// ---------- período (mesma regra da Nexo) ----------
const iso = (d) => d.toISOString().slice(0, 10);
const dt = (s) => new Date(s + 'T12:00:00Z');
const mais = (s, n) => { const x = dt(s); x.setUTCDate(x.getUTCDate() + n); return iso(x); };
const hoje = iso(new Date(Date.now() - 3 * 3600e3)), ontem = mais(hoje, -1);
let fim = flag('fim') || ontem; if (fim > ontem) fim = ontem;
let inicio = flag('inicio') || mais(fim, -29);
const nDias = Math.round((dt(fim) - dt(inicio)) / 864e5) + 1;
let ant;
if (inicio.slice(8) === '01') {
  const mIni = new Date(Date.UTC(+inicio.slice(0, 4), +inicio.slice(5, 7) - 2, 1, 12)), mUlt = new Date(Date.UTC(+inicio.slice(0, 4), +inicio.slice(5, 7) - 1, 0, 12));
  const fimMesInteiro = fim === iso(new Date(Date.UTC(+fim.slice(0, 4), +fim.slice(5, 7), 0, 12)));
  const mFim = fimMesInteiro ? iso(mUlt) : [mais(iso(mIni), nDias - 1), iso(mUlt)].sort()[0];
  ant = { inicio: iso(mIni), fim: mFim, tipo: 'mes' };
} else ant = { inicio: mais(inicio, -nDias), fim: mais(inicio, -1), tipo: 'dias' };
const mesIni = fim.slice(0, 8) + '01', mesDias = new Date(Date.UTC(+fim.slice(0, 4), +fim.slice(5, 7), 0)).getUTCDate();
const janela = [inicio, ant.inicio, mesIni].sort()[0];

const ga = (corpo) => chamar(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4}:runReport`, { escopos: [ESCOPOS.gaLer], metodo: 'POST', corpo });
const gsc = (corpo) => chamar(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { escopos: [ESCOPOS.gsc], metodo: 'POST', corpo });
const linhas = (r) => (r.rows || []).map((x) => [...x.dimensionValues.map((d) => d.value), ...x.metricValues.map((m) => Number(m.value))]);
const dataGA = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`;
const WHATS = ['api.whatsapp.com', 'wa.me'];
const ROTA = ['maps.app.goo.gl', 'goo.gl', 'g.co', 'www.google.com', 'google.com', 'waze.com', 'ul.waze.com', 'm.uber.com'];

// Canal do Analytics → canal orgânico da Nexo (mesmos nomes)
const CANAL = { 'Organic Search': 'Google · busca orgânica', 'Organic Social': 'Instagram', 'AI Assistant': 'Buscas por IA e Bing', 'Referral': 'Site · direto e outros', 'Direct': 'Site · direto e outros', 'Unassigned': 'Site · direto e outros', 'Organic Video': 'Site · direto e outros', 'Email': 'Site · direto e outros' };
const PAGO = (c) => /Paid|Cross-network/.test(c);
// Família do canal para o "Site" da visão Orgânico (organico_tot)
const FAMILIA = { 'Organic Search': 'site_busca', 'Organic Social': 'site_social', 'AI Assistant': 'site_ia', 'Referral': 'site_referencia', 'Direct': 'site_direto', 'Unassigned': 'site_direto' };

(async () => {
  // ---------- Google Ads: por anúncio e dia ----------
  const adsBase = await gaql(`SELECT segments.date, campaign.name, ad_group.name, ad_group_ad.ad.id, metrics.cost_micros, metrics.impressions, metrics.clicks FROM ad_group_ad WHERE segments.date BETWEEN '${janela}' AND '${fim}' AND metrics.impressions > 0`);
  const adsConv = await gaql(`SELECT segments.date, ad_group_ad.ad.id, segments.conversion_action_category, metrics.conversions FROM ad_group_ad WHERE segments.date BETWEEN '${janela}' AND '${fim}' AND metrics.conversions > 0`);
  const conv = {}; for (const x of adsConv) { const k = x.segments.date + '|' + x.adGroupAd.ad.id; conv[k] = conv[k] || { contatos: 0, ligacoes: 0 }; if (/PHONE_CALL/.test(x.segments.conversionActionCategory)) conv[k].ligacoes += +x.metrics.conversions; else if (x.segments.conversionActionCategory === 'CONTACT') conv[k].contatos += +x.metrics.conversions; }
  const todosAds = adsBase.map((x) => { const id = x.adGroupAd.ad.id, k = x.segments.date + '|' + id, c = conv[k] || { contatos: 0, ligacoes: 0 };
    return { p: 'google', d: x.segments.date, camp: x.campaign.name, grupo: x.adGroup.name, ad_id: 'g' + id, ad: x.adGroup.name + ' · anúncio …' + String(id).slice(-4), link: '',
      gasto: x.metrics.costMicros / 1e6, impr: +x.metrics.impressions, cliques: +x.metrics.clicks, contatos: c.contatos, ligacoes: c.ligacoes, atend_plat: 0, plat_ag: 0, plat_cp: 0 }; });
  // ligações e contatos de anúncio que o Google não liga a um anúncio específico (ex.: ligação pela extensão) entram no dia
  const entre = (l, a, b) => l.filter((x) => x.d >= a && x.d <= b);
  const anuncios = entre(todosAds, inicio, fim), anuncios_ant = entre(todosAds, ant.inicio, ant.fim);
  const mesGasto = entre(todosAds, mesIni, fim).reduce((s, x) => s + x.gasto, 0);
  const ps = await gaql(`SELECT campaign.name, metrics.impressions, metrics.search_impression_share, metrics.search_budget_lost_impression_share, metrics.search_rank_lost_impression_share FROM campaign WHERE segments.date BETWEEN '${inicio}' AND '${fim}' AND metrics.impressions > 0`);
  const google_parcela = ps.map((x) => ({ p: 'google', camp: x.campaign.name, parcela: x.metrics.searchImpressionShare || 0, perdida_orcamento: x.metrics.searchBudgetLostImpressionShare || 0, perdida_posicao: x.metrics.searchRankLostImpressionShare || 0, impr: +x.metrics.impressions }));

  // ---------- Analytics: cliques no WhatsApp viram "origens" (um por clique) ----------
  const cli = linhas(await ga({ dateRanges: [{ startDate: ant.inicio < inicio ? ant.inicio : inicio, endDate: fim }], dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }, { name: 'sessionSource' }, { name: 'sessionMedium' }, { name: 'sessionGoogleAdsCampaignName' }, { name: 'landingPage' }, { name: 'linkDomain' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'click' } } }, limit: 50000 }));
  const origens = [], origens_ant = [], rotas = { atual: 0, anterior: 0 };
  for (const [d8, canal, fonte, meio, campAds, lp, dominio, n] of cli) {
    const d = dataGA(d8), alvo = d >= inicio ? origens : d >= ant.inicio && d <= ant.fim ? origens_ant : null; if (!alvo) continue;
    if (ROTA.includes(dominio)) { rotas[alvo === origens ? 'atual' : 'anterior'] += n; continue; }
    if (!WHATS.includes(dominio)) continue;
    const pag = lp === '(not set)' ? 'fora do site' : (lp.split('?')[0] || '/');
    const o = PAGO(canal)
      ? { p: 'google', camp: campAds && campAds !== '(not set)' ? campAds : 'Google Ads (campanha a confirmar)', grupo: '', ad_id: '', ad: 'a confirmar' }
      : { p: 'organico', camp: CANAL[canal] || 'Site · direto e outros', grupo: '', ad_id: 'o' + (CANAL[canal] || 'Site · direto e outros'), ad: CANAL[canal] || 'Site · direto e outros' };
    for (let i = 0; i < n; i++) alvo.push({ ...o, d, fonte, meio, camp_utm: '', pag, clique: 1, conv: 1, prov: 0, ag: 0, cf: 0, cp: 0 });
  }

  // ---------- Analytics: visitas por canal e por dia (orgânico) e mapa de horas ----------
  const ses = linhas(await ga({ dateRanges: [{ startDate: ant.inicio < inicio ? ant.inicio : inicio, endDate: fim }], dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 10000 }));
  const horasR = linhas(await ga({ dateRanges: [{ startDate: inicio, endDate: fim }], dimensions: [{ name: 'dayOfWeek' }, { name: 'hour' }, { name: 'linkDomain' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'click' } } }, limit: 5000 }));
  const grade = Array.from({ length: 7 }, () => Array(24).fill(0)); let totalH = 0;
  for (const [dw, hr, dominio, n] of horasR) if (WHATS.includes(dominio)) { grade[(Number(dw) + 6) % 7][Number(hr)] += n; totalH += n; }   // GA4: 0 = domingo; aqui 0 = segunda

  // ---------- Search Console por dia ----------
  const gscDias = (await gsc({ startDate: ant.inicio < inicio ? ant.inicio : inicio, endDate: fim, dimensions: ['date'], rowLimit: 500 })).rows || [];

  // ---------- orgânico: linhas por canal e dia, e totais por fonte ----------
  const orgLinhas = (ini, fi, ori) => { const m = {}; const k = (d, cn) => (m[d + '|' + cn] ||= { p: 'organico', d, camp: cn, grupo: '', ad_id: 'o' + cn, ad: cn, link: '', gasto: 0, impr: 0, cliques: 0, contatos: 0, ligacoes: 0, atend_plat: 0, plat_ag: 0, plat_cp: 0 });
    for (const r of gscDias) { const d = r.keys[0]; if (d < ini || d > fi) continue; k(d, 'Google · busca orgânica').impr += r.impressions; k(d, 'Google · busca orgânica').cliques += r.clicks; }
    for (const o of ori) if (o.p === 'organico' && o.conv) k(o.d, o.camp).contatos += 1;
    return Object.values(m); };
  const organico = orgLinhas(inicio, fim, origens), organico_ant = orgLinhas(ant.inicio, ant.fim, origens_ant);
  const tot = (ini, fi, ori) => { const t = {};
    const add = (k, v) => { t[k] = (t[k] || 0) + v; };
    for (const r of gscDias) { const d = r.keys[0]; if (d < ini || d > fi) continue; add('google_busca.impressoes', r.impressions); add('google_busca.cliques', r.clicks); add('google_busca.posicao_x_impressoes', r.position * r.impressions); }
    for (const [d8, canal, n] of ses) { const d = dataGA(d8); if (d < ini || d > fi || !FAMILIA[canal]) continue; add(FAMILIA[canal] + '.sessoes', n); }
    for (const [d8, canal, , , , , dominio, n] of cli) { const d = dataGA(d8); if (d < ini || d > fi || !FAMILIA[canal] || !WHATS.includes(dominio)) continue; add(FAMILIA[canal] + '.cliques_whatsapp', n); }
    return t; };
  const organico_tot = { atual: tot(inicio, fim), anterior: tot(ant.inicio, ant.fim), ate_fonte: {}, seguidores: null, medido_desde: '2023-12-01', perfil_desde: '' };
  // "Todos os leads" da Nexo: aqui, cliques no WhatsApp do site sem anúncio, por dia (gráfico "Dia a dia")
  const porDiaOrg = {}; for (const o of origens) if (o.p === 'organico') porDiaOrg[o.d] = (porDiaOrg[o.d] || 0) + 1;
  const visitas = (ini, fi) => ses.filter(([d8]) => { const d = dataGA(d8); return d >= ini && d <= fi; }).reduce((s, r) => s + r[2], 0);

  const dados = {
    ok: true, gerado_em: new Date().toISOString(), inicio, fim, conta: { id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }, contas: [{ id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }],
    anuncios: anuncios.concat([]), anuncios_ant, origens, origens_ant,
    atendidos_total: null, atendidos_total_ant: null, geral: null, cobertura: { origem: '2023-12-01', organico: '2023-12-01' },
    kommo: { dias: Object.entries(porDiaOrg).map(([d, n]) => ({ d, entraram: n, agendados: 0 })), entraram: 0, agendados: 0 }, kommo_ant: null,
    medicao: '', medido_desde: '2099-01-01', receita_desde: null, carimbo: null, sem_medicao: null, anterior: ant,
    ticket_medio: null, mes: { inicio: mesIni, gasto: mesGasto, teto: TETO_MES, dia: +fim.slice(8, 10), dias: mesDias, fim, hoje: fim >= ontem, projecao: mesGasto / +fim.slice(8, 10) * mesDias, plataformas: [] },
    guardiao: { modo: 'simulacao', acoes: [] }, horas: { grade, total: totalH }, organico, organico_ant, organico_tot, meta_alcance: [], google_parcela,
    avisos: [], anuncios_atualizado: new Date().toISOString(),
    // específicos da BMH (a página lê estes para não falar de Kommo, Tintim e agendamento que a BMH ainda não mede)
    bmh: true, mede_agendamento: false, mede_atendimento: false,
    site: { visitas: visitas(inicio, fim), visitas_ant: visitas(ant.inicio, ant.fim), rotas: rotas.atual, rotas_ant: rotas.anterior },
    avisos_fontes: [
      'Botões por caso e por lugar (evento clique_whatsapp) medidos desde 08/10/2026; o painel conta o clique do Analytics, que tem histórico.',
      'Telefone pelo site medido desde 08/10/2026; antes, só as ligações feitas pelo anúncio.',
      `Teto: média do investimento mensal dos últimos 12 meses (out/2025 a set/2026, R$ 3.641), arredondada para R$ ${TETO_MES.toLocaleString('pt-BR')}.`,
      'Atendidos e receita entram com o iGut (fluxo do n8n). Meta e Instagram, quando o token sair. Perfil do Google, quando o Google aprovar o acesso.',
    ],
  };
  process.stdout.write(JSON.stringify(dados));
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
