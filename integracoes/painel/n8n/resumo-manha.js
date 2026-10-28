// Resumo da manhã da BMH no Telegram (8h): ontem e o mês até ontem, com os mesmos números do painel (anúncios gravados às
// 6h10, iGut às 3h20, cliques no WhatsApp do Analytics). Só números, sem dado de paciente.
const linhas = n => $(n).all().map(i => i.json).filter(r => r && r.chave);
const cfg = Object.fromEntries(linhas('Config').map(r => [r.chave, r.valor]));
const ads = linhas('Anúncios (tabela)'), site = linhas('Site · cliques (tabela)'), igut = linhas('iGut (tabela)'), guard = linhas('Guardião (tabela)');
const num = v => Number(v) || 0, entre = (d, a, b) => d >= a && d <= b;
const brl = v => 'R$ ' + Math.round(num(v)).toLocaleString('pt-BR'), int = v => Math.round(num(v)).toLocaleString('pt-BR');
const pct = (a, b) => b ? (a >= b ? '+' : '') + Math.round((a / b - 1) * 100) + '%' : '';
const hoje = $now.setZone('America/Sao_Paulo').startOf('day'), ontem = hoje.minus({ days: 1 }).setLocale('pt-BR');
const O = ontem.toISODate(), M0 = ontem.startOf('month').toISODate();
const ant = ontem.minus({ months: 1 }), A0 = ant.startOf('month').toISODate(), A1 = ant.set({ day: Math.min(ontem.day, ant.daysInMonth) }).toISODate();
const mesNome = d => d.setLocale('pt-BR').toFormat('LLLL');
// mesmo período do ano anterior (pedido do Jorge, 28/10/2026): a BMH tem sazonalidade, o mês anterior sozinho engana
const ano = ontem.minus({ years: 1 }), Y0 = ano.startOf('month').toISODate(), Y1 = ano.set({ day: Math.min(ontem.day, ano.daysInMonth) }).toISODate();
const soma = (rs, f) => rs.reduce((s, r) => s + num(r[f]), 0);
// anúncios
const adsO = ads.filter(r => r.dia === O), adsM = ads.filter(r => entre(r.dia, M0, O));
const gO = soma(adsO, 'gasto'), cO = soma(adsO, 'contatos') + soma(adsO, 'ligacoes'), gM = soma(adsM, 'gasto'), cM = soma(adsM, 'contatos') + soma(adsM, 'ligacoes');
// projeção igual à do guardião: gasto até ontem + orçamento diário de hoje × dias que faltam (com hoje)
const teto = num(cfg['teto_mes_' + M0.slice(0, 7)] || cfg.teto_mes), restantes = ontem.daysInMonth - ontem.day;
let B = null;
try {
  const tok = $('Google · renova o acesso').first().json.access_token;
  const r = await this.helpers.httpRequest({ method: 'POST', url: 'https://googleads.googleapis.com/v25/customers/5066798424/googleAds:search', headers: { Authorization: 'Bearer ' + tok },
    body: { query: "SELECT campaign_budget.resource_name, campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'ENABLED' AND campaign.experiment_type = 'BASE'" }, json: true, timeout: 60000 });
  const orc = {}; for (const x of r.results || []) orc[x.campaignBudget.resourceName] = Number(x.campaignBudget.amountMicros) / 1e6;
  B = Object.values(orc).reduce((s, v) => s + v, 0);
} catch (e) {}
const proj = B === null ? gM / ontem.day * ontem.daysInMonth : gM + B * (restantes || 0);
const cada = (g, c) => c >= 0.5 ? ` (${brl(g / c)} cada)` : '';
// WhatsApp pelo site
const wO = site.filter(r => r.dia === O && r.tipo === 'whatsapp'), PAGO = c => /Paid|Cross-network/.test(c || '');
const wTot = soma(wO, 'cliques'), wAds = soma(wO.filter(r => PAGO(r.canal)), 'cliques');
// iGut
const igO = igut.filter(r => r.dia === O), igM = igut.filter(r => entre(r.dia, M0, O)), igA = igut.filter(r => entre(r.dia, A0, A1)), igY = igut.filter(r => entre(r.dia, Y0, Y1));
const porUn = igO.map(r => r.unidade + ' ' + int(r.atendimentos)).join(' · ');
const sM = soma(igM, 'atendimentos'), vM = soma(igM, 'valor'), sA = soma(igA, 'atendimentos'), vA = soma(igA, 'valor'), sY = soma(igY, 'atendimentos'), vY = soma(igY, 'valor');
// guardião de hoje
const gHoje = guard.filter(r => r.data === hoje.toISODate());
const pendentes = gHoje.filter(r => r.acao !== 'avisar' && r.resultado === 'simulado').length;
// avisos de dado atrasado
const atraso = [];
const ultima = ads.map(r => r.atualizado_em || '').sort().pop() || '';
if (ultima.slice(0, 10) < hoje.toISODate()) atraso.push('⚠️ A gravação dos anúncios das 6h10 não rodou hoje: os números do Google Ads podem estar incompletos.');
if (!igO.length) atraso.push('⚠️ O iGut de ontem ainda não chegou (a busca é às 3h20).');
const t = [];
t.push('☀️ BMH · resumo de ontem, ' + ontem.toFormat('cccc, dd/LL'));
t.push('');
t.push('📣 Google Ads: ' + brl(gO) + ' · ' + (cO >= 0.5 ? int(cO) + (Math.round(cO) === 1 ? ' contato' : ' contatos') + cada(gO, cO) : 'nenhum contato'));
t.push('💬 WhatsApp pelo site: ' + int(wTot) + (wTot === 1 ? ' clique' : ' cliques') + (wTot ? ` (${int(wAds)} de anúncio, ${int(wTot - wAds)} de busca e outros)` : ''));
if (igO.length) t.push('🏥 iGut: ' + int(soma(igO, 'atendimentos')) + ' sessões (' + porUn + ') · ' + brl(soma(igO, 'valor')) + ' produzidos');
t.push('');
t.push('📅 ' + mesNome(ontem).replace(/^./, c => c.toUpperCase()) + ' até ontem (' + ontem.day + ' de ' + ontem.daysInMonth + ' dias)');
const ritmo = B === null ? ' · no ritmo, fecha em ' : ' · com ' + brl(B) + '/dia, fecha em ';
t.push('• Anúncios: ' + brl(gM) + (teto ? ' de ' + brl(teto) : '') + ritmo + brl(proj) + (teto && proj > teto * 1.02 ? ' ⚠️ acima do teto' : ''));
t.push('• Contatos do Google Ads: ' + int(cM) + cada(gM, cM));
if (igM.length) t.push('• iGut: ' + int(sM) + ' sessões · ' + brl(vM) + ' produzidos');
if (igA.length) t.push('• Mesmo período de ' + mesNome(ant) + ': ' + int(sA) + ' sessões (' + pct(sM, sA) + ') · ' + brl(vA) + ' (' + pct(vM, vA) + ')');
if (igY.length) t.push('• Mesmo período de ' + mesNome(ano) + ' de ' + ano.year + ': ' + int(sY) + ' sessões (' + pct(sM, sY) + ') · ' + brl(vY) + ' (' + pct(vM, vY) + ')');
t.push('');
t.push('🛡️ Guardião: ' + (pendentes ? pendentes + (pendentes === 1 ? ' proposta esperando' : ' propostas esperando') + ' o seu Aplicar ou Ignorar (mensagens acima).' : gHoje.length ? 'só avisos hoje (mensagem acima).' : 'nada a corrigir hoje.'));
if (atraso.length) { t.push(''); t.push(...atraso); }
t.push('');
t.push('Painel: __PAINEL__');
return [{ json: { texto: t.join('\n') } }];
