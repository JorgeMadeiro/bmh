// Monta os dados do painel da BMH no MESMO FORMATO do painel da Nexo (nó "Monta os dados" do fluxo bKst8atLrI4rB2DM), lendo
// as tabelas BMH_* gravadas às 6h10. Origens = cliques no WhatsApp do site (a recepção usa o WhatsApp no celular; não há
// agendou/atendido por canal). Sem nome, telefone ou dado de paciente. Cópia local: integracoes/painel/n8n/monta-os-dados.js
const P = $('Qual período').first().json;
const linhas = n => $(n).all().map(i => i.json).filter(r => r && r.chave);
const cfg = Object.fromEntries(linhas('Config').map(r => [r.chave, r.valor]));
const ads = linhas('Anúncios (tabela)'), parc = linhas('Parcela (tabela)'), site = linhas('Site · cliques (tabela)'), org = linhas('Orgânico (tabela)'), hor = linhas('Horas (tabela)'), igut = linhas('iGut (tabela)');
const entre = (d, a, b) => d >= a && d <= b, num = v => Number(v) || 0;
// ---------- anúncios ----------
const adRow = r => ({ p: 'google', d: r.dia, camp: r.campanha, grupo: r.grupo, ad_id: 'g' + r.ad_id, ad: r.grupo + ' · anúncio …' + String(r.ad_id).slice(-4), link: '',
  gasto: num(r.gasto), impr: num(r.impressoes), cliques: num(r.cliques), contatos: num(r.contatos), ligacoes: num(r.ligacoes), atend_plat: 0, plat_ag: 0, plat_cp: 0 });
const anuncios = ads.filter(r => entre(r.dia, P.inicio, P.fim)).map(adRow), anuncios_ant = ads.filter(r => entre(r.dia, P.ant.inicio, P.ant.fim)).map(adRow);
const ultimaGravacao = ads.map(r => r.atualizado_em || '').sort().pop() || '';
const mesGasto = ads.filter(r => entre(r.dia, P.mes_inicio, P.fim)).reduce((s, r) => s + num(r.gasto), 0);
// parcela do período: ponderada pelas buscas possíveis de cada dia (impressões ÷ parcela)
const pAgg = {};
for (const r of parc) { if (!entre(r.dia, P.inicio, P.fim)) continue; const s = num(r.parcela); if (!s) continue; const i = num(r.impressoes), el = i / s, a = (pAgg[r.campanha] ||= { impr: 0, el: 0, lo: 0, lp: 0 });
  a.impr += i; a.el += el; a.lo += el * num(r.perdida_orcamento); a.lp += el * num(r.perdida_posicao); }
const google_parcela = Object.entries(pAgg).map(([camp, a]) => ({ p: 'google', camp, parcela: a.impr / a.el, perdida_orcamento: a.lo / a.el, perdida_posicao: a.lp / a.el, impr: a.impr }));
// ---------- origens: um item por clique no WhatsApp do site ----------
const CANAL = { 'Organic Search': 'Google · busca orgânica', 'Organic Social': 'Instagram', 'AI Assistant': 'Buscas por IA e Bing' };
const PAGO = c => /Paid|Cross-network/.test(c);
const origens = [], origens_ant = [], rotas = { atual: 0, anterior: 0 };
for (const r of site) {
  const alvo = entre(r.dia, P.inicio, P.fim) ? 'atual' : entre(r.dia, P.ant.inicio, P.ant.fim) ? 'anterior' : null; if (!alvo) continue;
  if (r.tipo === 'rota') { rotas[alvo] += num(r.cliques); continue; }
  const camp = PAGO(r.canal) ? (r.campanha_ads && r.campanha_ads !== '(not set)' ? r.campanha_ads : 'Google Ads (campanha a confirmar)') : (CANAL[r.canal] || 'Site · direto e outros');
  const o = PAGO(r.canal) ? { p: 'google', camp, grupo: '', ad_id: '', ad: 'a confirmar' } : { p: 'organico', camp, grupo: '', ad_id: 'o' + camp, ad: camp };
  const l = alvo === 'atual' ? origens : origens_ant;
  for (let i = 0; i < num(r.cliques); i++) l.push({ ...o, d: r.dia, fonte: r.fonte, meio: r.meio, camp_utm: '', pag: r.pagina, clique: 1, conv: 1, prov: 0, ag: 0, cf: 0, cp: 0 });
}
// ---------- orgânico ----------
const orgLinhas = (ini, fi, ori) => { const m = {}; const k = (d, cn) => (m[d + '|' + cn] ||= { p: 'organico', d, camp: cn, grupo: '', ad_id: 'o' + cn, ad: cn, link: '', gasto: 0, impr: 0, cliques: 0, contatos: 0, ligacoes: 0, atend_plat: 0, plat_ag: 0, plat_cp: 0 });
  for (const r of org) { if (!entre(r.dia, ini, fi) || r.fonte !== 'google_busca') continue; if (r.metrica === 'impressoes') k(r.dia, 'Google · busca orgânica').impr += num(r.valor); if (r.metrica === 'cliques') k(r.dia, 'Google · busca orgânica').cliques += num(r.valor); }
  for (const o of ori) if (o.p === 'organico' && o.conv) k(o.d, o.camp).contatos += 1;
  return Object.values(m); };
const tot = (ini, fi) => { const t = {}; for (const r of org) { if (!entre(r.dia, ini, fi)) continue; const kk = r.fonte + '.' + r.metrica; t[kk] = (t[kk] || 0) + num(r.valor); } return t; };
const visitas = t => Object.entries(t).filter(([k]) => /^site_.*\.sessoes$/.test(k)).reduce((s, [, v]) => s + v, 0);
const TA = tot(P.inicio, P.fim), TB = tot(P.ant.inicio, P.ant.fim);
const organico_tot = { atual: TA, anterior: TB, ate_fonte: {}, seguidores: null, medido_desde: org.map(r => r.dia).sort()[0] || '', perfil_desde: '' };
// ---------- horas, contatos sem anúncio por dia, iGut ----------
const grade = Array.from({ length: 7 }, () => Array(24).fill(0)); let totalH = 0;
for (const r of hor) { if (!entre(r.dia, P.inicio, P.fim)) continue; const ds = num(r.dia_semana) - 1, h = num(r.hora); if (ds < 0 || ds > 6 || h < 0 || h > 23) continue; grade[ds][h] += num(r.cliques); totalH += num(r.cliques); }
const porDiaOrg = {}; for (const o of origens) if (o.p === 'organico') porDiaOrg[o.d] = (porDiaOrg[o.d] || 0) + 1;
const igutEntre = (a, b) => igut.length ? igut.filter(r => entre(r.dia, a, b)).reduce((s, r) => s + num(r.atendimentos), 0) : null;
const produzidoEntre = (a, b) => igut.length ? igut.filter(r => entre(r.dia, a, b)).reduce((s, r) => s + num(r.valor), 0) : null;
const teto = num(cfg['teto_mes_' + P.mes_inicio.slice(0, 7)] || cfg.teto_mes);   // exceção por mês (ex.: teto_mes_2026-10)
// guardião: os 3 últimos dias do período (até hoje, quando o período termina ontem), como na Nexo
const gFim = P.fim >= P.ontem ? P.hoje : P.fim, desde3 = DateTime.fromISO(gFim).minus({ days: 2 }).toISODate();
const avisos = [];
if (ultimaGravacao && ultimaGravacao.slice(0, 10) < P.hoje && P.fim >= P.ontem) avisos.push('Os números foram gravados pela última vez em ' + ultimaGravacao.slice(8, 10) + '/' + ultimaGravacao.slice(5, 7) + ': a gravação das 6h10 não rodou hoje. Ontem pode estar incompleto.');
return [{ json: {
  ok: true, gerado_em: $now.toISO(), inicio: P.inicio, fim: P.fim, conta: { id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }, contas: [{ id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }],
  anuncios, anuncios_ant, origens, origens_ant, atendidos_total: igutEntre(P.inicio, P.fim), atendidos_total_ant: igutEntre(P.ant.inicio, P.ant.fim), produzido_total: produzidoEntre(P.inicio, P.fim), produzido_total_ant: produzidoEntre(P.ant.inicio, P.ant.fim), geral: null,
  cobertura: { origem: '2023-12-01', organico: organico_tot.medido_desde }, kommo: { dias: Object.entries(porDiaOrg).map(([d, n]) => ({ d, entraram: n, agendados: 0 })), entraram: 0, agendados: 0 }, kommo_ant: null,
  medicao: '', medido_desde: '2099-01-01', receita_desde: null, carimbo: null, sem_medicao: null, anterior: P.ant, ticket_medio: null,
  mes: { inicio: P.mes_inicio, gasto: mesGasto, teto, dia: P.mes_dia, dias: P.mes_dias, fim: P.fim, hoje: P.fim >= P.ontem, projecao: mesGasto / P.mes_dia * P.mes_dias, plataformas: [] },
  guardiao: { modo: cfg.guardiao_modo_teto === 'real' || cfg.guardiao_modo_pausa === 'real' ? 'real' : 'simulacao', acoes: linhas('Guardião (tabela)').filter(r => r.data >= desde3 && r.data <= gFim).sort((a, b) => b.data.localeCompare(a.data))
    .map(r => ({ data: r.data, regra: r.regra, plataforma: r.plataforma, alvo: r.alvo, acao: r.acao, valor_antes: r.valor_antes, valor_novo: r.valor_novo, modo: r.modo, resultado: r.resultado, detalhe: r.detalhe })) }, horas: { grade, total: totalH }, organico: orgLinhas(P.inicio, P.fim, origens), organico_ant: orgLinhas(P.ant.inicio, P.ant.fim, origens_ant), organico_tot,
  meta_alcance: [], google_parcela, avisos, anuncios_atualizado: ultimaGravacao,
  bmh: true, mede_agendamento: cfg.mede_agendamento === 'sim', mede_atendimento: cfg.mede_atendimento === 'sim',
  site: { visitas: visitas(TA), visitas_ant: visitas(TB), rotas: rotas.atual, rotas_ant: rotas.anterior },
  avisos_fontes: [
    'Botões por caso e por lugar (evento clique_whatsapp) medidos desde 08/10/2026; o painel conta o clique do Analytics, que tem histórico.',
    'Telefone pelo site medido desde 08/10/2026; antes, só as ligações feitas pelo anúncio.',
    'Teto: média do investimento mensal dos últimos 12 meses (out/2025 a set/2026, R$ 3.641), arredondada para R$ ' + teto.toLocaleString('pt-BR') + '.',
    'Atendidos e receita entram com o iGut. Meta e Instagram, quando o token sair. Perfil do Google, quando o Google aprovar o acesso.',
    'Números gravados todo dia às 6h10 (BMH · Painel · grava o dia); a página só lê.',
  ],
} }];
