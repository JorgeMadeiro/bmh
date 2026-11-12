// Monta a DRE do ano a partir da BMH_dre_mensal (iGut desde jan/2024). Mesmas contas da DRE da Nexo:
// receita líquida = bruta − impostos e glosas; margem = líquida − variáveis; EBITDA = margem − fixo;
// resultado = EBITDA − despesas não operacionais − investimentos + receitas não operacionais − a classificar.
const q = $('DRE').first().json.query || {};
const hoje = $now.setZone('America/Sao_Paulo');
const rows = $('Lê a tabela').all().map((i) => i.json).filter((r) => r.mes);
const anos = [...new Set(rows.map((r) => r.mes.slice(0, 4)))].sort();
const ANO = anos.includes(q.ano) ? q.ano : (anos.includes(String(hoje.year)) ? String(hoje.year) : anos[anos.length - 1]);
const MESES = Array.from({ length: 12 }, (_, i) => ANO + '-' + String(i + 1).padStart(2, '0'));
const R = rows.filter((r) => r.mes.startsWith(ANO));
const comDado = MESES.filter((m) => R.some((r) => r.mes === m && r.grupo !== 'controle' && r.grupo !== 'dfc' && Number(r.valor)));
const GRUPOS = [['receita', 'Receita bruta'], ['impostos', 'Impostos e glosas'], ['variavel', 'Custos variáveis'], ['fixo', 'Custo fixo'], ['nao_op_desp', 'Despesas não operacionais'], ['investimento', 'Investimentos'], ['nao_op_rec', 'Receitas não operacionais'], ['a_classificar', 'A classificar']];
const linhas = {};   // grupo -> linha -> {ordem, m: {mes: valor}}
for (const r of R) { if (r.grupo === 'controle' || r.grupo === 'dfc') continue; const g = (linhas[r.grupo] ||= {}); const l = (g[r.linha] ||= { ordem: Number(r.ordem) || 0, m: {} }); l.m[r.mes] = (l.m[r.mes] || 0) + Number(r.valor || 0); }
const soma = (g, m) => Object.values(linhas[g] || {}).reduce((s, l) => s + (l.m[m] || 0), 0);
const tot = {};
for (const m of MESES) { const rb = soma('receita', m), li = rb - soma('impostos', m), mc = li - soma('variavel', m), eb = mc - soma('fixo', m);
  tot[m] = { rb, li, mc, eb, res: eb - soma('nao_op_desp', m) - soma('investimento', m) + soma('nao_op_rec', m) - soma('a_classificar', m) }; }
const fonte = {}; for (const r of R) if (r.grupo !== 'controle' && Number(r.valor)) fonte[r.mes] = r.fonte;
const avisos = [];
const MESN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'], nomeMes = (m) => MESN[+m.slice(5) - 1] + '/' + m.slice(0, 4);
const vinculo = (m, ln) => '?aba=lancamentos&mes=' + m + '&linha=' + encodeURIComponent(ln);
const porFavorecido = (m, fv) => '?aba=lancamentos&mes=' + m + '&busca=' + encodeURIComponent(fv);
// avisos guardados pelo fluxo de atualização (duplicidade, favorecidos, categoria a conferir, "Receita com serviços")
for (const r of R.filter((r) => r.grupo === 'controle' && String(r.linha).startsWith('conferir · '))) { const resto = r.linha.slice(11), ln = resto.split(' · ')[0], t = resto.slice(ln.length + 3);
  const fv = ((t.match(/^Categoria a conferir: (.+?) \d{2}\/\d{2} R\$/) || t.match(/despesa: (.+?) \d{2}\/\d{2} R\$/) || t.match(/ para (.+?) \(/) || t.match(/^(.+?): parcelas/) || [])[1] || '').trim();
  const rs = (t.match(/R\$ ([\d.]+,\d{2})/) || [])[1];
  avisos.push({ k: 'conferir|' + r.mes + '|' + ln + '|' + (fv || t.slice(0, 40)) + (rs ? '|' + rs : ''), t: nomeMes(r.mes) + ': ' + t, h: fv && fv !== 'sem favorecido' ? porFavorecido(r.mes, fv + (rs ? '|' + rs : '')) : vinculo(r.mes, ln) }); }
// linha de despesa muito acima da média dos meses anteriores do ano
const ehDesp = new Set(['impostos', 'variavel', 'fixo', 'nao_op_desp', 'investimento']);
for (const [g, ls] of Object.entries(linhas)) { if (!ehDesp.has(g)) continue;
  for (const [ln, l] of Object.entries(ls)) for (const m of comDado) {
    const ant = comDado.filter((x) => x < m).slice(-6).map((x) => l.m[x] || 0).filter(Boolean); if (ant.length < 3) continue;
    const media = ant.reduce((s, x) => s + x, 0) / ant.length, v = l.m[m] || 0;
    if (v > media * 1.4 && v - media > 1500) avisos.push({ k: 'acima|' + m + '|' + ln, t: `${nomeMes(m)}: ${ln} R$ ${Math.round(v).toLocaleString('pt-BR')}, ${Math.round((v / media - 1) * 100)}% acima da média dos meses anteriores (R$ ${Math.round(media).toLocaleString('pt-BR')})`, h: vinculo(m, ln) }); } }
// "A classificar" mês a mês, com cada categoria do iGut sem linha
for (const m of comDado) { const ac = Object.entries(linhas.a_classificar || {}).map(([k, l]) => [k, l.m[m] || 0]).filter(([, v]) => Math.abs(v) >= 0.01);
  if (ac.length) avisos.push({ k: 'classificar|' + m, t: `${nomeMes(m)}: lançamentos sem linha na DRE ("A classificar"): ` + ac.map(([k, v]) => `${k.replace(/^A classificar · /, '')} R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('; ') + '. Conferir a categoria no iGut ou pedir a inclusão no mapa.', h: vinculo(m, 'A classificar') }); }
// conferido: tocar no aviso marca; fica riscado e some às 23h59 do dia em que foi marcado (igual à Nexo)
const conf = Object.fromEntries($('Lê conferidos').all().map((i) => i.json).filter((j) => j && j.chave).map((j) => [j.chave, j.marcado_em]));
let escondidos = 0;
const avisosVis = avisos.filter((a) => { const em = conf[a.k]; if (!em) return true; const t = DateTime.fromISO(em).setZone('America/Sao_Paulo');
  if (hoje >= t.endOf('day')) { escondidos++; return false; } a.estado = 'riscado'; return true; });
const atualizado = R.map((r) => r.atualizado_em).filter(Boolean).sort().pop() || '';
const mesAtual = hoje.toFormat('yyyy-MM');
const aba = ['dfc', 'lancamentos'].includes(q.aba) ? q.aba : 'dre';
const dfc = {}; for (const r of rows.filter((r) => r.grupo === 'dfc')) (dfc[r.mes] ||= {})[r.linha] = Number(r.valor || 0);
const mesesIgut = Object.keys(dfc).sort();
// aba Lançamentos: um mês, ou "todos" = os meses do ano escolhido (lidos do iGut na hora)
const mesSel = q.mes === 'todos' ? 'todos' : (mesesIgut.includes(q.mes) ? q.mes : (mesesIgut.includes(mesAtual) ? mesAtual : mesesIgut[mesesIgut.length - 1]));
const anoLanc = mesSel === 'todos' ? ANO : String(mesSel || '').slice(0, 4);
const mesesLanc = mesSel === 'todos' ? mesesIgut.filter((m) => m.startsWith(ANO)) : [mesSel];
const linhaIni = String(q.linha || ''); const fechados = comDado.filter((m) => m < mesAtual);
return [{ json: { escondidos, buscaIni: String(q.busca || ''), aba, dfc, mesesIgut, mesSel, anoLanc, mesesLanc, linhaIni, ANO, anos, MESES, comDado, fechados, mesAtual, linhas, tot, fonte, avisos: avisosVis, atualizado, GRUPOS, formato: q.formato || 'html' } }];
