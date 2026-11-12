// DRE da BMH (12/11/2026, no molde da DRE da Nexo). Lê o caixa e a produção do iGut de cada mês e grava as linhas na
// BMH_dre_mensal (chave = mes|linha). As regras (linhas, receita e despesa) vêm de regras.js, colado antes deste código.
// DRE por COMPETÊNCIA, como na Nexo: receita = atendimentos do mês pela data do atendimento, pagos ou não (sem voucher e
// cortesia), pelo valor produzido, o mesmo da diretoria; glosas de convênio do mês entram como dedução; despesas = lançamentos
// do mês no iGut, pagos ou não, pela data do lançamento. O fluxo de caixa conta só o pago e o recebido.
// O que não casar com nenhuma linha vai para "A classificar · …" (nada some). Nenhum dado de paciente é gravado.
const meses = $('Meses').all().map((i) => i.json), caixa = $('Caixa do mês').all().map((i) => i.json), prod = $('Produção').all().map((i) => i.json);
const agora = $now.setZone('America/Sao_Paulo').toISO(), hojeISO = $now.setZone('America/Sao_Paulo').toISODate(), out = [];
const UNI = (s) => /taguatinga|l2 sul|asa sul/i.test(s || '');
const DFC_G = { impostos: 'Saídas · impostos', variavel: 'Saídas · custos variáveis', fixo: 'Saídas · custo fixo', investimento: 'Investimentos', nao_op_desp: 'Não operacionais · saídas' };
const PESSOAL = new Set([L.salarios, L.beneficios, L.estagio, L.plantao, L.encargos, L.retirada]);
// costume de cada favorecido nos meses lidos: em qual linha ele costuma cair (para avisar quando aparece em outra)
const costume = {};
caixa.forEach((cx) => { for (const l of (cx?.data?.Lancamento || [])) { if (num(l.valor) >= 0) continue; const ln = despesa(l), fv = norm(l.favoredico_nome); if (!ln || !fv) continue; const h = (costume[fv] ||= {}); h[ln] = (h[ln] || 0) + 1; } });
const vazio = (j) => j && j.status === 'failed' && /no matching data/i.test(j.message || '');
meses.forEach((M, i) => {
  // iGut falhou neste mês (tempo esgotado, fora do ar): não grava nada, para não zerar o que já estava certo
  if (!Array.isArray(caixa[i]?.data?.Lancamento) || !(Array.isArray(prod[i]?.data?.Produzido) || vazio(prod[i]))) return;
  const v = {}; CANON.forEach((c) => { v[c.linha] = 0; });
  const classificar = {}, desp = [], pend = [];
  let caixaReceita = 0, prodPago = 0, prodAtendida = 0;
  const dfc = { 'Recebimentos · convênios': 0, 'Recebimentos · particular': 0, 'Recebimentos · outros': 0, 'Saídas · impostos': 0, 'Saídas · custos variáveis': 0, 'Saídas · custo fixo': 0, 'Saídas · a classificar': 0,
    'Investimentos': 0, 'Não operacionais · saídas': 0, 'Entradas não operacionais': 0, 'Recebimentos lançados à mão (fora da soma)': 0, 'A pagar (lançado, não pago)': 0, 'A receber (lançado, não recebido)': 0 };
  // ---- receita por competência (produção do iGut) ----
  const lista = prod[i]?.data?.Produzido;
  for (const p of (Array.isArray(lista) ? lista : [])) {
    if (p.e_fatura_sessao || !UNI(p.nome)) continue;
    if (num(p.totalpago) && String(p.data_pagamento || '').slice(0, 7) === M.mes) prodPago += num(p.totalpago);
    const dia = String(p.data || '').slice(0, 10), st = norm(p.status_descricao || p.status);
    if (dia.slice(0, 7) !== M.mes || dia > hojeISO || /desmarc|falt|cancel/.test(st)) continue;
    const linha = receitaDe(p), valor = num(p.totalproduzido); if (!linha || !valor) continue;
    v[linha] += valor; prodAtendida += valor;
    if (linha !== L.part && !/particular/i.test(p.convenio || '')) v[L.glosa] += num(p.total_glosa);
  }
  // ---- despesas e fluxo de caixa (caixa do iGut) ----
  for (const l of (caixa[i]?.data?.Lancamento || [])) {
    const valor = num(l.valor), rec = /^receita/.test(norm(l.lancamento_tipo)), semCat = !l.categoria_nome, lin = despesa(l), g = lin ? GRUPO[lin] : null;
    if (RECEITA_MAO(l)) { if (l.lancamento_pago) dfc['Recebimentos lançados à mão (fora da soma)'] += valor; continue; }   // nem DRE nem soma do caixa
    if (!l.lancamento_pago) { if (valor > 0) dfc['A receber (lançado, não recebido)'] += valor; else dfc['A pagar (lançado, não pago)'] += Math.abs(valor); }
    else if (rec && semCat) dfc[String(l.lancamento_forma || '').trim() ? 'Recebimentos · particular' : 'Recebimentos · convênios'] += valor;   // sem forma = baixa de lote de convênio
    else if (rec && g === 'nao_op_rec') dfc['Entradas não operacionais'] += valor;
    else if (rec && g && DFC_G[g]) dfc[DFC_G[g]] -= valor;   // devolução de uma despesa: diminui a saída
    else if (rec) dfc['Recebimentos · outros'] += valor;
    else dfc[g && DFC_G[g] ? DFC_G[g] : 'Saídas · a classificar'] += Math.abs(valor);
    if (rec && semCat) { if (l.lancamento_pago) caixaReceita += valor; continue; }   // na DRE a receita vem da produção
    if (rec && valor > 0 && !l.lancamento_pago) continue;   // a receber: só no fluxo de caixa
    const item = { ln: lin || 'A classificar', fv: norm(l.favoredico_nome), fvt: l.favoredico_nome || '', v: Math.abs(valor), ds: String(l.lancamento_origem || '').replace(/\s+/g, ' ').trim(), d: String(l.lancamento_data || '').slice(0, 10), s: norm(l.subcategoria_nome), c: String(l.categoria_nome || ''), sc: String(l.subcategoria_nome || '') };
    if (lin) { v[lin] += rec && g !== 'nao_op_rec' ? -Math.abs(valor) : Math.abs(valor); if (!rec) desp.push(item); }
    else { const k = 'A classificar · ' + [l.lancamento_tipo, l.categoria_nome || 'sem categoria', l.subcategoria_nome].filter(Boolean).join(' · '); classificar[k] = (classificar[k] || 0) + Math.abs(valor);
      if (PENDENTE(l)) pend.push(item); }
  }
  const fonte = 'igut';
  for (const c of CANON) out.push({ chave: M.mes + '|' + c.linha, mes: M.mes, grupo: c.grupo, linha: c.linha, ordem: c.ordem, valor: r2(v[c.linha]), fonte, atualizado_em: agora });
  // linha de "A classificar" que deixou de existir (lançamento reclassificado) volta a zero: a tabela não apaga linha
  for (const r of $('A classificar já gravado').all().map((x) => x.json)) if (r.grupo === 'a_classificar' && r.mes === M.mes && r.chave && !(r.linha in classificar) && Number(r.valor)) out.push({ chave: r.chave, mes: M.mes, grupo: 'a_classificar', linha: r.linha, ordem: 999, valor: 0, fonte, atualizado_em: agora });
  for (const [k, x] of Object.entries(classificar)) out.push({ chave: M.mes + '|' + k, mes: M.mes, grupo: 'a_classificar', linha: k, ordem: 999, valor: r2(x), fonte, atualizado_em: agora });
  // ---- Para conferir ----
  const conf = [], vistos = {}, reais = (x) => x.v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dtb = (s) => s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '?', parc = (s) => { const m = String(s || '').match(/(\d+)\s*de\s*(\d+)/i); return m ? [+m[1], +m[2]] : null; };
  // "Receita com serviços › Particular" lançada como despesa (Jorge, 12/11/2026: "detalhar melhor, vejo no painel como pendência")
  for (const x of pend) conf.push({ ln: 'A classificar', t: `A definir: "Receita com serviços${x.sc ? ' › ' + x.sc : ''}" lançada como despesa: ${x.fvt || 'sem favorecido'} ${dtb(x.d)} R$ ${reais(x)}${x.ds ? ' ("' + x.ds + '")' : ''}. Dizer qual é a linha (taxa de cartão, repasse, devolução a paciente ou outra)`, v: x.v });
  if (dfc['Recebimentos lançados à mão (fora da soma)']) conf.push({ ln: 'Fluxo de caixa', t: `Recebimentos lançados à mão como "Receita com serviços": R$ ${dfc['Recebimentos lançados à mão (fora da soma)'].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Repetem as baixas automáticas por sessão dos mesmos dias, então ficam fora da DRE e da soma do fluxo de caixa. Conferir com o financeiro se algum deles é dinheiro que não tem baixa automática`, v: dfc['Recebimentos lançados à mão (fora da soma)'] });
  // mesmo favorecido, mesmo valor e mesma descrição no mês (fora pessoas: plantão, salário e benefício repetem de propósito;
  // descrição diferente, como dois cilindros com número de série diferente, não é duplicidade: 12/11/2026)
  for (const x of desp) { const k = x.fv + '|' + x.v.toFixed(2) + '|' + norm(x.ds).replace(/\s*\d+\s*de\s*\d+\s*/, ' '); (vistos[k] ||= []).push(x); }
  for (const gr of Object.values(vistos)) if (gr.length > 1 && gr[0].fv && gr[0].v >= 300 && !PESSOAL.has(gr[0].ln)) {
    const ps = gr.map((x) => parc(x.ds)), valor = reais(gr[0]), quais = gr.map((x) => `${dtb(x.d)} "${x.ds}"`).join(' e ');
    if (ps.every(Boolean) && new Set(ps.map((p) => p[1])).size === 1 && new Set(ps.map((p) => p[0])).size === gr.length)
      conf.push({ ln: gr[0].ln, t: `${gr[0].fvt}: parcelas ${ps.map((p) => p[0]).sort((a, b) => a - b).join(' e ')} de ${ps[0][1]} da mesma conta no mesmo mês (${quais}), R$ ${valor} cada: uma delas é de outro mês; corrigir a data no iGut`, v: gr[0].v * (gr.length - 1) });
    else conf.push({ ln: gr[0].ln, t: `${gr.length} lançamentos de R$ ${valor} para ${gr[0].fvt} (${quais}): possível duplicidade`, v: gr[0].v * (gr.length - 1) }); }
  // (a regra da Nexo de "2 favorecidos em aluguel, luz, telefone" não vale aqui: a BMH tem duas unidades e vários contratos)
  // categoria a conferir: a descrição ou o favorecido não combina com a linha
  const SUG = [[/caesb|neoenergia|\bceb\b/, 'fv', L.luz], [/claro|vivo|\btim\b|telefon|telecom|opentel/, 'fv', L.telefonia], [/contabil|contador/, 'fv', L.honor],
    [/white martins|air liquide|linde|oxigen/, 'tudo', L.oxigenio], [/lavanderia/, 'tudo', L.lavanderia]];
  const ja = new Set();
  for (const x of desp) { const fvn = norm(x.fvt), dsn = norm(x.ds);
    for (const [re, onde, sug] of SUG) { const txt = onde === 'fv' ? fvn : fvn + ' ' + dsn;
      if (re.test(txt) && x.ln !== sug) { ja.add(x); conf.push({ ln: x.ln, t: `Categoria a conferir: ${x.fvt || 'sem favorecido'} ${dtb(x.d)} R$ ${reais(x)} ("${x.ds}") está em ${x.ln}; pela descrição, o lugar parece ser ${sug}`, v: x.v }); break; } } }
  for (const x of desp) { if (ja.has(x) || PESSOAL.has(x.ln)) continue; const h = costume[x.fv]; if (!h) continue;
    const tot = Object.values(h).reduce((a, b) => a + b, 0), [top, n] = Object.entries(h).sort((a, b) => b[1] - a[1])[0];
    if (!PESSOAL.has(top) && top !== x.ln && n >= 2 && n / tot >= 0.6) conf.push({ ln: x.ln, t: `Categoria a conferir: ${x.fvt} ${dtb(x.d)} R$ ${reais(x)} ("${x.ds}") está em ${x.ln}; esse favorecido costuma ir para ${top} (${n} de ${tot} lançamentos)`, v: x.v }); }
  const dataConf = (x) => { const m = String(x.t || '').match(/\b(\d{2})\/(\d{2})\b/); return m ? m[2] + m[1] : '9999'; };
  conf.sort((a, b) => dataConf(a).localeCompare(dataConf(b)));
  conf.slice(0, 30).forEach((x, j) => out.push({ chave: M.mes + '|conferir · ' + j, mes: M.mes, grupo: 'controle', linha: 'conferir · ' + x.ln + ' · ' + x.t, ordem: 1200 + j, valor: r2(x.v), fonte, atualizado_em: agora }));
  for (let j = Math.min(conf.length, 30); j < 30; j++) out.push({ chave: M.mes + '|conferir · ' + j, mes: M.mes, grupo: 'controle', linha: '', ordem: 1200 + j, valor: 0, fonte, atualizado_em: agora });
  Object.entries(dfc).forEach(([k, x], j) => out.push({ chave: M.mes + '|dfc · ' + k, mes: M.mes, grupo: 'dfc', linha: k, ordem: 1100 + j, valor: r2(x), fonte, atualizado_em: agora }));
  out.push({ chave: M.mes + '|controle · receita do caixa', mes: M.mes, grupo: 'controle', linha: 'receita do caixa', ordem: 1000, valor: r2(caixaReceita), fonte, atualizado_em: agora });
  out.push({ chave: M.mes + '|controle · produção paga', mes: M.mes, grupo: 'controle', linha: 'produção paga', ordem: 1001, valor: r2(prodPago), fonte, atualizado_em: agora });
  out.push({ chave: M.mes + '|controle · atendido no mês', mes: M.mes, grupo: 'controle', linha: 'atendido no mês', ordem: 1003, valor: r2(prodAtendida), fonte, atualizado_em: agora });
  out.push({ chave: M.mes + '|controle · lançamentos', mes: M.mes, grupo: 'controle', linha: 'lançamentos lidos', ordem: 1004, valor: (caixa[i]?.data?.Lancamento || []).length, fonte, atualizado_em: agora });
});
return out.map((json) => ({ json }));
