// Medição da reorganização do Google Ads (aplicada em 08/10/2026; conta a partir de 09/10). Toda quinta às 8h20 (dia do Jorge
// em Taguatinga; terça e quinta são os dias dele na BMH), de 15/10 a 05/11: o período depois (09/10 até ontem) contra o mesmo número de dias antes (até 08/10), direto da API do Google Ads.
// 15/10 = régua da 1ª semana (custo por contato da Pacientes acima de R$ 50 → recomenda voltar); 05/11 = metas das 4 semanas,
// decisão do teste de concorrentes e do grupo de preço (acima de R$ 60 por contato → pausar/bloquear). Só recomenda: mudar
// a conta continua sendo com o "pode" do Jorge. Manual: /webhook/bmh-medicao-ads?teste=1 (mostra mesmo fora das datas).
const CONTA = '5066798424', PACIENTES = '20776450309', MARCA = '20833761565', INICIO = '2026-10-09', FIM_MEDICAO = '2026-11-05';
const META = { qs: 6, cpc: 6, perdaPosicao: 0.15, custoContato: 40, regua7: 50, reguaTeste: 60 };
const ANTES = { qs: '3 a 5', cpc: 9.40, perdaPosicao: 0.273, custoContato: 49 };   // retrato de 08/10 (plano.md)
let teste = false; try { teste = $('Manual').isExecuted && !!($('Manual').first().json.query || {}).teste; } catch (e) {}
const hoje = $now.setZone('America/Sao_Paulo').startOf('day'), ontem = hoje.minus({ days: 1 });
if (!teste && (hoje.toISODate() < '2026-10-15' || hoje.toISODate() > FIM_MEDICAO)) return [];
const ini = DateTime.fromISO(INICIO, { zone: 'America/Sao_Paulo' });
let dias = Math.min(28, Math.floor(ontem.diff(ini, 'days').days) + 1), dIni = INICIO, dFim = ontem.toISODate();
if (dias < 1) { dias = 7; dIni = ontem.minus({ days: 6 }).toISODate(); }   // teste antes de começar: últimos 7 dias, só para ver o formato
const token = $('Google · renova o acesso').first().json.access_token;
const busca = async (q) => { let out = [], pt; do { const r = await this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/googleAds:search`,
  headers: { Authorization: 'Bearer ' + token }, body: { query: q, ...(pt ? { pageToken: pt } : {}) }, json: true, timeout: 60000 }); out = out.concat(r.results || []); pt = r.nextPageToken; } while (pt); return out; };
// "antes" = os mesmos N dias COM anúncio, voltando a partir da véspera do início (a conta ficou parada de 22 a 29/09/2026
// e antes de 03/09; dia parado não entra na conta, senão a comparação fica torta)
const aFim = DateTime.fromISO(dIni).minus({ days: 1 }).toISODate();
const diasAtivos = (await busca(`SELECT segments.date, metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${DateTime.fromISO(aFim).minus({ days: 120 }).toISODate()}' AND '${aFim}'`))
  .filter((x) => Number(x.metrics.costMicros) / 1e6 >= 20).map((x) => x.segments.date).sort().reverse();
const aIni = diasAtivos[Math.min(dias, diasAtivos.length) - 1] || DateTime.fromISO(aFim).minus({ days: dias - 1 }).toISODate();
const parados = Math.floor(DateTime.fromISO(aFim).diff(DateTime.fromISO(aIni), 'days').days) + 1 - Math.min(dias, diasAtivos.length);
const n = (v) => Number(v) || 0, brl = (v) => 'R$ ' + n(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), pct = (v) => (100 * n(v)).toFixed(1).replace('.', ',') + '%';
const dm = (d) => d.slice(8, 10) + '/' + d.slice(5, 7);
const camp = async (a, b) => { const m = {}; for (const x of await busca(`SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions, metrics.search_rank_lost_impression_share, metrics.search_budget_lost_impression_share FROM campaign WHERE segments.date BETWEEN '${a}' AND '${b}' AND campaign.status != 'REMOVED'`)) {
  const k = x.campaign.id; const c = (m[k] ||= { nome: x.campaign.name, g: 0, cli: 0, imp: 0, ct: 0, rank: null, orc: null }); c.g += n(x.metrics.costMicros) / 1e6; c.cli += n(x.metrics.clicks); c.imp += n(x.metrics.impressions); c.ct += n(x.metrics.conversions);
  if (x.metrics.searchRankLostImpressionShare != null) c.rank = n(x.metrics.searchRankLostImpressionShare); if (x.metrics.searchBudgetLostImpressionShare != null) c.orc = n(x.metrics.searchBudgetLostImpressionShare); } return m; };
const [D, A] = [await camp(dIni, dFim), await camp(aIni, aFim)];
const soma = (m) => Object.values(m).reduce((s, c) => ({ g: s.g + c.g, cli: s.cli + c.cli, ct: s.ct + c.ct }), { g: 0, cli: 0, ct: 0 });
const P = D[PACIENTES] || { g: 0, cli: 0, imp: 0, ct: 0 }, PA = A[PACIENTES] || { g: 0, cli: 0, imp: 0, ct: 0 };
const conc = Object.values(D).find((c) => /Concorrentes/.test(c.nome)) || { g: 0, ct: 0, cli: 0 };
const TD = soma(D), TA = soma(A), cpc = P.cli ? P.g / P.cli : 0, cpcA = PA.cli ? PA.g / PA.cli : 0, cc = P.ct ? P.g / P.ct : null, ccA = PA.ct ? PA.g / PA.ct : null;
// nota de qualidade das palavras da Pacientes, ponderada pelas exibições do período
const kw = await busca(`SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.quality_info.quality_score, metrics.impressions FROM keyword_view WHERE segments.date BETWEEN '${dIni}' AND '${dFim}' AND campaign.id = ${PACIENTES} AND ad_group.status = 'ENABLED' AND ad_group_criterion.status = 'ENABLED'`);
const qk = {}; for (const x of kw) { const q = x.adGroupCriterion.qualityInfo?.qualityScore; if (!q) continue; const k = x.adGroupCriterion.keyword.text; (qk[k] ||= { q, imp: 0 }).imp += n(x.metrics.impressions); }
const qImp = Object.values(qk).reduce((s, x) => s + x.imp, 0), qs = qImp ? Object.values(qk).reduce((s, x) => s + x.q * x.imp, 0) / qImp : null;
const principais = Object.entries(qk).sort((a, b) => b[1].imp - a[1].imp).slice(0, 4).map(([k, x]) => `"${k}" ${x.q}`).join(' · ');
// grupos da Pacientes
const gr = {}; for (const x of await busca(`SELECT ad_group.name, metrics.cost_micros, metrics.clicks, metrics.conversions FROM ad_group WHERE segments.date BETWEEN '${dIni}' AND '${dFim}' AND campaign.id = ${PACIENTES} AND ad_group.status = 'ENABLED'`)) {
  const g = (gr[x.adGroup.name] ||= { g: 0, cli: 0, ct: 0 }); g.g += n(x.metrics.costMicros) / 1e6; g.cli += n(x.metrics.clicks); g.ct += n(x.metrics.conversions); }
const valor = gr['Valor e convênio'] || { g: 0, ct: 0 };
// ---------- orgânico: a página de perguntas foi trocada em 08/10/2026; vigiar posição e cliques ----------
// Linha de base corrigida em 15/10/2026 (pedido do Jorge: "não quero nunca alarme falso"): média das 3 semanas logo antes
// da troca (15/09 a 05/10, Search Console). A base antiga era a média de 90 dias, puxada por julho e agosto, e disparou
// alarme falso em 15/10 (exibições da página de perguntas "caíram" de 5.775, número que não existia nas semanas recentes).
// Exibição sozinha nunca alarma (varia com a semana e com a página que o Google escolhe mostrar). Só alarma queda real:
//  - posição de "hiperbárica" ou "câmara hiperbárica" 3 ou mais pontos pior que a base, nesta semana E na anterior; ou
//  - cliques do site inteiro abaixo de 70% da base, nesta semana E na anterior.
const BASE = { hiperbarica: 9.2, 'camara hiperbarica': 10.7, site: { c: 45.3, i: 4504 }, faq: { c: 15.7, i: 3803 }, home: { c: 21.3, i: 596 } };
const semAc = (x) => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fimG = hoje.minus({ days: 3 }), semana = (d) => (d > fimG.minus({ days: 7 }).toISODate() ? 'atual' : 'antes');
const org = { atual: {}, antes: {} };
for (const r of ($('Search Console · buscas').first().json || {}).rows || []) { const k = semAc(r.keys[1]); const a = (org[semana(r.keys[0])][k] ||= { c: 0, i: 0, p: 0 }); a.c += r.clicks; a.i += r.impressions; a.p += r.position * r.impressions; }
const pg = { atual: { site: { c: 0, i: 0 } }, antes: { site: { c: 0, i: 0 } } };
for (const r of ($('Search Console · páginas').first().json || {}).rows || []) { const u = r.keys[1].replace(/^https?:\/\/(www\.)?hiperbaricabrasilia\.com\.br/, '') || '/'; const s = semana(r.keys[0]);
  pg[s].site.c += r.clicks; pg[s].site.i += r.impressions;
  const k = u.startsWith('/perguntas-frequentes') ? 'faq' : u === '/' ? 'home' : null; if (!k) continue;
  const a = (pg[s][k] ||= { c: 0, i: 0 }); a.c += r.clicks; a.i += r.impressions; }
const pos = (s, k) => (org[s][k] && org[s][k].i ? org[s][k].p / org[s][k].i : null), num1 = (v) => (v == null ? '—' : v.toFixed(1).replace('.', ','));
const orgLinhas = [`🔎 Google orgânico (semana de ${dm(fimG.minus({ days: 6 }).toISODate())} a ${dm(fimG.toISODate())}; o Search Console atrasa 3 dias)`];
const motivos = [];
for (const [k, nome] of [['camara hiperbarica', 'câmara hiperbárica'], ['hiperbarica', 'hiperbárica']]) {
  const p = pos('atual', k), pa = pos('antes', k);
  if (p != null && pa != null && p >= BASE[k] + 3 && pa >= BASE[k] + 3) motivos.push(`"${nome}" caiu 3 ou mais posições há duas semanas`);
  orgLinhas.push(`• "${nome}": posição ${num1(p)} (semana antes ${num1(pa)}; base ${num1(BASE[k])}; menor é melhor) · ${Math.round(org.atual[k]?.c || 0)} ${Math.round(org.atual[k]?.c || 0) === 1 ? 'clique' : 'cliques'}`); }
const st = pg.atual.site, sa = pg.antes.site, fq = pg.atual.faq || { c: 0, i: 0 }, hm = pg.atual.home || { c: 0, i: 0 };
if (st.c < BASE.site.c * 0.7 && sa.c < BASE.site.c * 0.7) motivos.push('cliques do site abaixo de 70% da base há duas semanas');
orgLinhas.push(`• Site inteiro: ${st.c} cliques, ${st.i.toLocaleString('pt-BR')} exibições (base: ~${Math.round(BASE.site.c)} e ~${BASE.site.i.toLocaleString('pt-BR')} por semana)`);
orgLinhas.push(`• Perguntas frequentes: ${fq.c} cliques, ${fq.i.toLocaleString('pt-BR')} exibições (base: ~${Math.round(BASE.faq.c)} e ~${BASE.faq.i.toLocaleString('pt-BR')})`);
orgLinhas.push(`• Página inicial: ${hm.c} cliques, ${hm.i.toLocaleString('pt-BR')} exibições (base: ~${Math.round(BASE.home.c)} e ~${BASE.home.i})`);
orgLinhas.push(motivos.length ? '⚠️ Queda real no orgânico (' + motivos.join('; ') + '): vale olhar com o Claude.' : '✅ Orgânico dentro do normal (sem queda de posição nem de cliques do site).');

const ok = (b) => (b ? '✅' : '❌'), final = hoje.toISODate() >= FIM_MEDICAO, primeira = dias <= 8;
const t = [];
t.push((teste ? '🧪 TESTE (fora da data)\n' : '') + `📊 BMH · reorganização do Google Ads · ${dias} dias (${dm(dIni)} a ${dm(dFim)})`);
t.push(`Comparado com os ${dias} dias de anúncio antes (${dm(aIni)} a ${dm(aFim)}${parados > 0 ? ', sem contar ' + parados + (parados === 1 ? ' dia parado' : ' dias parados') : ''}).`, '');
t.push('Campanha Pacientes');
t.push(`• Custo por contato: ${cc != null ? brl(cc) : 'sem contato'} (antes ${ccA != null ? brl(ccA) : '—'}) · meta ${brl(META.custoContato)}`);
t.push(`• Preço do clique: ${brl(cpc)} (antes ${brl(cpcA)}) · meta ${brl(META.cpc)}`);
t.push(`• Perda por posição: ${P.rank != null ? pct(P.rank) : '—'} (antes ${PA.rank != null ? pct(PA.rank) : '—'}) · meta abaixo de ${pct(META.perdaPosicao)}`);
t.push(`• Nota de qualidade (média pelas exibições): ${qs ? qs.toFixed(1).replace('.', ',') : 'ainda sem nota'} (antes ${ANTES.qs}) · meta ${META.qs}+`);
if (principais) t.push(`  ${principais}`);
t.push(`• Contatos: ${Math.round(P.ct)} (antes ${Math.round(PA.ct)}) · gasto ${brl(P.g)} (antes ${brl(PA.g)})`, '');
t.push(`Conta toda: ${Math.round(TD.ct)} contatos, ${brl(TD.ct ? TD.g / TD.ct : 0)} cada (antes ${Math.round(TA.ct)}, ${brl(TA.ct ? TA.g / TA.ct : 0)} cada)`);
t.push(`Concorrentes (teste): ${brl(conc.g)}, ${Math.round(conc.ct)} contatos${conc.ct ? ', ' + brl(conc.g / conc.ct) + ' cada' : ''} · régua ${brl(META.reguaTeste)}`);
t.push(`Grupo de preço: ${brl(valor.g)}, ${Math.round(valor.ct)} contatos${valor.ct ? ', ' + brl(valor.g / valor.ct) + ' cada' : ''} · régua ${brl(META.reguaTeste)}`, '');
const linhasG = Object.entries(gr).sort((a, b) => b[1].g - a[1].g).map(([k, g]) => `  ${k}: ${brl(g.g)}, ${Math.round(g.ct)} ct${g.ct ? ' (' + brl(g.g / g.ct) + ')' : ''}`);
if (linhasG.length) t.push('Por grupo:', ...linhasG, '');
t.push(...orgLinhas, '');
if (primeira) {
  // régua (ajustada em 08/10/2026): só recomenda voltar se passar de R$ 50 E ficar pior que antes. Nas semanas antes da
  // mudança a Pacientes já estava em R$ 60 a 68 por contato: a régua fixa reprovaria a própria estrutura antiga.
  const pior = cc != null && ccA != null && cc > ccA;
  t.push(cc == null ? '⚠️ Nenhum contato na Pacientes na 1ª semana: vale olhar com o Claude antes de seguir.'
    : cc > META.regua7 && pior ? `⚠️ Régua da 1ª semana: custo por contato acima de ${brl(META.regua7)} e pior que antes. Recomendo voltar à estrutura antiga (plano B). Para voltar, abra o Claude na pasta da BMH e diga "volta a reorganização".`
    : cc > META.regua7 ? `🟡 Régua da 1ª semana: ainda acima de ${brl(META.regua7)}, mas melhor que antes (${brl(ccA)}). Segue; próxima medição na quinta.`
    : `✅ Régua da 1ª semana: dentro (abaixo de ${brl(META.regua7)}). Segue a reorganização; próxima medição na quinta.`);
} else if (final) {
  t.push('Resultado das 4 semanas:');
  t.push(`${ok(cc != null && cc <= META.custoContato)} custo por contato · ${ok(cpc && cpc <= META.cpc)} preço do clique · ${ok(P.rank != null && P.rank < META.perdaPosicao)} perda por posição · ${ok(qs && qs >= META.qs)} nota de qualidade`);
  t.push(conc.ct && conc.g / conc.ct <= META.reguaTeste ? '✅ Concorrentes: dentro da régua, pode manter.' : '⚠️ Concorrentes: acima da régua (ou sem contato). Recomendo pausar.');
  t.push(valor.ct && valor.g / valor.ct <= META.reguaTeste ? '✅ Grupo de preço: dentro da régua, pode manter.' : '⚠️ Grupo de preço: acima da régua (ou sem contato). Recomendo bloquear as buscas de preço.');
  t.push('Para decidir, abra o Claude na pasta da BMH e peça "fechamento da reorganização do Google Ads".');
} else t.push(cc != null && cc > META.regua7 && ccA != null && cc > ccA ? `⚠️ Custo por contato acima de ${brl(META.regua7)} e pior que antes: vale olhar com o Claude.` : '✅ Segue dentro da régua. Próxima medição na quinta.');
return [{ json: { texto: t.join('\n') } }];
