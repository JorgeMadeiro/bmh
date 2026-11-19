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
// Meta (03/11/2026): uma linha por anúncio e dia; contato = conversa iniciada. O teto do mês segue só o do Google (o da Meta não foi decidido)
let metaAds = []; try { metaAds = linhas('Meta (tabela)').filter(r => r.tipo === 'anuncio'); } catch (e) {}
const metaRow = r => ({ p: 'meta', d: r.dia, camp: r.campanha, grupo: r.conjunto, ad_id: 'm' + r.ad_id, ad: r.anuncio, link: '',
  gasto: num(r.gasto), impr: num(r.impressoes), cliques: num(r.cliques_link), contatos: num(r.conversas), ligacoes: 0, atend_plat: 0, plat_ag: 0, plat_cp: 0 });
const doPeriodo = (a, b) => [...ads.filter(r => entre(r.dia, a, b)).map(adRow), ...metaAds.filter(r => entre(r.dia, a, b)).map(metaRow)];
const anuncios = doPeriodo(P.inicio, P.fim), anuncios_ant = doPeriodo(P.ant.inicio, P.ant.fim);
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
// Perfil do Google chega com uns 3 dias de atraso: "dados até" e a comparação com os mesmos dias antes (como na Nexo)
const pg = org.filter(r => r.fonte === 'perfil_google').map(r => r.dia).sort(), pgAte = pg[pg.length - 1] || '';
const organico_tot = { atual: TA, anterior: TB, ate_fonte: pgAte ? { perfil_google: pgAte } : {}, seguidores: null, medido_desde: org.map(r => r.dia).sort()[0] || '', perfil_desde: pg[0] || '' };
if (pgAte && pgAte < P.fim) { const n = Math.round((Date.parse(pgAte) - Date.parse(P.inicio)) / 864e5); const fimAnt = new Date(Date.parse(P.ant.inicio) + n * 864e5).toISOString().slice(0, 10);
  const tb = tot(P.ant.inicio, fimAnt); for (const k of Object.keys(TB)) if (/^perfil_google/.test(k)) TB[k] = tb[k] || 0; }
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
// ---------- avaliações do período (19/11/2026, pedido do Jorge: "senti falta dos agendamentos das consultas") ----------
// BMH_operacao_dia, gravada toda noite pela diretoria: avaliações marcadas para o dia e as realizadas, por unidade (até ontem)
let operacao = []; try { operacao = linhas('Operação (tabela)'); } catch (e) {}
const avalEntre = (a, b) => { const r = { ag: 0, feitas: 0, unidades: {} }; for (const x of operacao) { if (!entre(x.dia, a, b)) continue; const u = (r.unidades[x.unidade] ||= { ag: 0, feitas: 0 });
  r.ag += num(x.avaliacoes_agendadas); r.feitas += num(x.avaliacoes_feitas); u.ag += num(x.avaliacoes_agendadas); u.feitas += num(x.avaliacoes_feitas); } return r; };
const avaliacoes = operacao.length ? { atual: avalEntre(P.inicio, P.fim), anterior: avalEntre(P.ant.inicio, P.ant.fim), ate: operacao.map((x) => x.dia).sort().pop() } : null;
// ---------- funil comercial (19/11/2026, pedido do Jorge: "o painel do funil comercial, como na Nexo") ----------
// Uma linha por conversa nova no WhatsApp (BMH_origem_conversas, desde 17/11/2026, quando o recebedor oficial começou), com a
// origem do último clique (gclid do site = Google Ads; código do anúncio = Meta; frase pronta = site, Instagram, Perfil, QR do
// cirurgião; sem nada = sem origem marcada). As etapas vêm de BMH_conversoes pelo telefone em código (com e sem o 9), até 60
// dias depois da conversa: avaliação agendada (passagem do Kommo), avaliou e iniciou tratamento (iGut). Custo = gasto dos dias
// medidos (desde 17/11) ÷ etapa. Sem nome, telefone ou dado de paciente.
const FUNIL_DESDE = '2026-11-17', CORTE_AG = Date.parse('2026-11-17T19:15:00-03:00');   // as 31 avaliações de 17/11 às 19h13 foram marcadas antes
let conversas = [], eventos = [];
try { conversas = linhas('Conversas (tabela)'); } catch (e) {}
try { eventos = linhas('Conversões (tabela)'); } catch (e) {}
const diaSP = (iso) => { const t = DateTime.fromISO(String(iso || '')); return t.isValid ? t.setZone('America/Sao_Paulo').toISODate() : ''; };
const evDe = {};
for (const e of eventos) { if (!['agendou', 'avaliou', 'iniciou'].includes(e.evento)) continue; if (e.evento === 'agendou' && !(Date.parse(e.criado_em) > CORTE_AG)) continue;
  for (const h of new Set([e.telefone_hash, e.telefone_hash_sem9].filter(Boolean))) (evDe[h] ||= []).push(e); }
const canalDe = (c) => { const o = String(c.origem || ''); if (c.gclid || /an[uú]ncio google/i.test(o)) return ['google', 'Google Ads']; if (/meta/i.test(o) || c.ctwa_clid) return ['meta', 'Meta Ads'];
  if (!o) return ['sem', 'Sem origem marcada']; if (/cirurgi/i.test(o)) return ['organico', 'Indicação de cirurgião (QR)']; if (o === 'site') return ['organico', 'Site, sem anúncio']; return ['organico', o]; };
const ETAPAS = [['ag', 'agendou'], ['av', 'avaliou'], ['ini', 'iniciou']];
const funilDe = (a, b) => { const can = {}, uni = {}, tot = { conversas: 0, ag: 0, av: 0, ini: 0 }, grade = Array.from({ length: 7 }, () => Array(24).fill(0)), dias = {};
  for (const c of conversas) { const d0 = diaSP(c.primeira_msg_em); if (!d0 || d0 < FUNIL_DESDE || !entre(d0, a, b)) continue;
    const [p, nome] = canalDe(c), lim = DateTime.fromISO(d0).plus({ days: 60 }).toISODate(), ev = (evDe[c.telefone_hash] || []).filter((e) => e.dia >= d0 && e.dia <= lim);
    const L = (can[nome] ||= { p, canal: nome, conversas: 0, ag: 0, av: 0, ini: 0 }); L.conversas++; tot.conversas++; (dias[d0] ||= { d: d0, conversas: 0, ag: 0 }).conversas++;
    const t = DateTime.fromISO(String(c.primeira_msg_em)).setZone('America/Sao_Paulo'); if (t.isValid) grade[t.weekday - 1][t.hour]++;
    for (const [k, nomeEv] of ETAPAS) { const e = ev.find((x) => x.evento === nomeEv); if (!e) continue; L[k]++; tot[k]++; const u = e.unidade || 'sem unidade'; (uni[u] ||= { unidade: u, ag: 0, av: 0, ini: 0 })[k]++; if (k === 'ag') (dias[e.dia] ||= { d: e.dia, conversas: 0, ag: 0 }).ag++; } }
  const medidos = [...anuncios, ...anuncios_ant].filter((r) => r.d >= FUNIL_DESDE && entre(r.d, a, b));
  const gasto = { google: medidos.filter((r) => r.p === 'google').reduce((s, r) => s + r.gasto, 0), meta: medidos.filter((r) => r.p === 'meta').reduce((s, r) => s + r.gasto, 0) };
  return { canais: Object.values(can).sort((x, y) => y.conversas - x.conversas), unidades: Object.values(uni), tot, gasto, horas: { grade, total: tot.conversas }, dias: Object.values(dias).sort((x, y) => x.d.localeCompare(y.d)) }; };
// ---------- "Todas as origens" e "Dia a dia" no formato da Nexo (19/11/2026, Jorge: "o painel não está como o da Nexo") ----------
// Pessoas que procuraram = conversas novas; agendaram = avaliação marcada (agendou); de onde vieram = origem da última conversa até
// 60 dias antes do agendamento (sem conversa com origem = sem origem marcada); por dia; mapa de horas das conversas. Desde 17/11.
const PLAT = (c) => { const [p] = canalDe(c); return p === 'google' || p === 'meta' ? p : p === 'organico' ? 'organico' : 'sem'; };
const convPorHash = {}; for (const c of conversas) { const d0 = diaSP(c.primeira_msg_em); if (d0 && d0 >= FUNIL_DESDE) (convPorHash[c.telefone_hash] ||= []).push({ d0, c }); }
const origemDoEvento = (e) => { let melhor = null; for (const h of [e.telefone_hash, e.telefone_hash_sem9]) for (const x of convPorHash[h] || []) {
  if (x.d0 <= e.dia && DateTime.fromISO(x.d0).plus({ days: 60 }).toISODate() >= e.dia && (!melhor || x.d0 > melhor.d0)) melhor = x; } return melhor ? PLAT(melhor.c) : 'sem'; };
const eventosDe = (tipo, a, b) => { const vistos = new Set(), r = []; for (const e of eventos) { if (e.evento !== tipo || !entre(e.dia, a, b) || e.dia < FUNIL_DESDE) continue;
  if (tipo === 'agendou' && !(Date.parse(e.criado_em) > CORTE_AG)) continue; const k = e.paciente_id + '|' + e.dia; if (vistos.has(k)) continue; vistos.add(k); r.push(e); } return r; };
const geralDe = (a, b) => { const z = () => ({ google: 0, meta: 0, organico: 0, sem: 0 }), ag = z(), cp = z(); for (const e of eventosDe('agendou', a, b)) ag[origemDoEvento(e)]++; for (const e of eventosDe('iniciou', a, b)) cp[origemDoEvento(e)]++; return { agendou: ag, compareceu: cp }; };
const kommoDe = (a, b) => { const dias = {}; let entraram = 0; for (const c of conversas) { const d0 = diaSP(c.primeira_msg_em); if (!d0 || d0 < FUNIL_DESDE || !entre(d0, a, b)) continue; entraram++; (dias[d0] ||= { d: d0, entraram: 0, agendados: 0 }).entraram++; }
  const ag = eventosDe('agendou', a, b); for (const e of ag) (dias[e.dia] ||= { d: e.dia, entraram: 0, agendados: 0 }).agendados++;
  return { dias: Object.values(dias).sort((x, y) => x.d.localeCompare(y.d)), entraram, agendados: ag.length, pessoas: { pessoas: entraram, novas: entraram, agendaram: new Set(ag.map((e) => e.paciente_id)).size } }; };
const comFunil = conversas.length > 0;
const gradeConversas = (a, b) => { const g = Array.from({ length: 7 }, () => Array(24).fill(0)); let t = 0; for (const c of conversas) { const d0 = diaSP(c.primeira_msg_em); if (!d0 || d0 < FUNIL_DESDE || !entre(d0, a, b)) continue;
  const x = DateTime.fromISO(String(c.primeira_msg_em)).setZone('America/Sao_Paulo'); if (x.isValid) { g[x.weekday - 1][x.hour]++; t++; } } return { grade: g, total: t }; };
const funil = conversas.length ? { desde: FUNIL_DESDE, atual: funilDe(P.inicio, P.fim), anterior: funilDe(P.ant.inicio, P.ant.fim), inicio_medido: P.inicio < FUNIL_DESDE } : null;
return [{ json: {
  ok: true, gerado_em: $now.toISO(), inicio: P.inicio, fim: P.fim, conta: { id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }, contas: [{ id: 'bmh', nome: 'BMH · Brasília Medicina Hiperbárica' }],
  anuncios, anuncios_ant, origens, origens_ant, atendidos_total: igutEntre(P.inicio, P.fim), atendidos_total_ant: igutEntre(P.ant.inicio, P.ant.fim), produzido_total: produzidoEntre(P.inicio, P.fim), produzido_total_ant: produzidoEntre(P.ant.inicio, P.ant.fim), geral: comFunil ? { atual: geralDe(P.inicio, P.fim), anterior: geralDe(P.ant.inicio, P.ant.fim) } : null,
  cobertura: { origem: '2023-12-01', organico: organico_tot.medido_desde, ...(comFunil ? { pessoas: FUNIL_DESDE, agendou: FUNIL_DESDE } : {}) },
  kommo: comFunil ? kommoDe(P.inicio, P.fim) : { dias: Object.entries(porDiaOrg).map(([d, n]) => ({ d, entraram: n, agendados: 0 })), entraram: 0, agendados: 0 }, kommo_ant: comFunil ? kommoDe(P.ant.inicio, P.ant.fim) : null,
  kommo_pessoas_ant: comFunil ? kommoDe(P.ant.inicio, P.ant.fim).pessoas : null,
  medicao: '', medido_desde: '2099-01-01', receita_desde: null, carimbo: null, sem_medicao: null, anterior: P.ant, ticket_medio: null,
  mes: { inicio: P.mes_inicio, gasto: mesGasto, teto, dia: P.mes_dia, dias: P.mes_dias, fim: P.fim, hoje: P.fim >= P.ontem, projecao: mesGasto / P.mes_dia * P.mes_dias, plataformas: [] },
  guardiao: { modo: cfg.guardiao_modo_teto === 'real' || cfg.guardiao_modo_pausa === 'real' ? 'real' : 'simulacao', acoes: linhas('Guardião (tabela)').filter(r => r.data >= desde3 && r.data <= gFim).sort((a, b) => b.data.localeCompare(a.data))
    .map(r => ({ data: r.data, regra: r.regra, plataforma: r.plataforma, alvo: r.alvo, acao: r.acao, valor_antes: r.valor_antes, valor_novo: r.valor_novo, modo: r.modo, resultado: r.resultado, detalhe: r.detalhe })) }, horas: comFunil ? gradeConversas(P.inicio, P.fim) : { grade, total: totalH }, organico: orgLinhas(P.inicio, P.fim, origens), organico_ant: orgLinhas(P.ant.inicio, P.ant.fim, origens_ant), organico_tot,
  meta_alcance: [], google_parcela, avisos, anuncios_atualizado: ultimaGravacao,
  funil, avaliacoes, bmh: true, mede_agendamento: cfg.mede_agendamento === 'sim', mede_atendimento: cfg.mede_atendimento === 'sim',
  site: { visitas: visitas(TA), visitas_ant: visitas(TB), rotas: rotas.atual, rotas_ant: rotas.anterior },
  avisos_fontes: [
    'Botões por caso e por lugar (evento clique_whatsapp) medidos desde 08/10/2026; o painel conta o clique do Analytics, que tem histórico.',
    'Telefone pelo site medido desde 08/10/2026; antes, só as ligações feitas pelo anúncio.',
    'Teto: média do investimento mensal dos últimos 12 meses (out/2025 a set/2026, R$ 3.641), arredondada para R$ ' + teto.toLocaleString('pt-BR') + '.',
    'Atendidos e receita entram com o iGut. Meta Ads desde 01/10/2026 (antes disso a Meta aparece zerada; contato do Meta = conversa iniciada); Instagram orgânico ainda não. O teto do mês é só o do Google. Perfil do Google pela API do Perfil da Empresa desde 14/10/2026 (aprovação do Google), com o histórico que ela guarda.',
    'Números gravados todo dia às 6h10 (BMH · Painel · grava o dia); a página só lê.',
  ],
} }];
