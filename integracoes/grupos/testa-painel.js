// Teste do painel da diretoria: larguras, filtros (todas as combinações), período, pendentes e totais.
const { chromium } = require('playwright-core');
const num = (t) => { t = String(t).trim(); if (t === '—' || t === '') return null; if (t === '<1') return 0.5; return Number(t.replace(/\./g, '').replace(',', '.')); };
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const falhas = []; const f = (cond, msg) => { if (!cond) falhas.push(msg); };
  for (const [w, h] of [[360, 780], [390, 844], [1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, httpCredentials: { username: process.env.PAINEL_DIRETORIA_USUARIO, password: process.env.PAINEL_DIRETORIA_SENHA } });
    const p = await ctx.newPage(); const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto(process.env.N8N_URL + '/webhook/bmh-diretoria', { waitUntil: 'networkidle', timeout: 120000 });
    f(await p.evaluate(() => document.documentElement.scrollWidth) <= w, `largura passou de ${w}px`);
    if (w !== 390) { f(!erros.length, `erro JS em ${w}px: ${erros}`); await ctx.close(); continue; }
    const convs = await p.$$eval('#conv option', (o) => o.map((x) => x.value));
    const tabela = () => p.$$eval('#tFin tr', (trs) => trs.slice(1).map((tr) => [...tr.children].map((td) => td.textContent)));
    let combos = 0;
    for (const u of ['Todas', 'Asa Sul', 'Taguatinga']) {
      await p.click(`#uni button:has-text("${u}")`);
      for (const c of convs) {
        await p.selectOption('#conv', c);
        for (const pend of [false]) {
          combos++;
          const rows = await tabela(); const tot = rows[0], meses = rows.slice(1);
          // total do período = soma das linhas fechadas exibidas (sem o mês corrente *); com "só pendentes" o total continua do período todo
          if (!pend) for (const col of [1, 2, 3, 4, 6, 7]) {
            const soma = meses.filter((r) => !r[0].endsWith('*')).reduce((s, r) => s + (num(r[col]) || 0), 0), t = num(tot[col]) || 0;
            f(Math.abs(soma - t) <= Math.max(3, meses.length * 0.6), `${u}/${c || 'todos'}: coluna ${col} total ${t} ≠ soma ${soma.toFixed(0)}`);
          }
          for (const r of meses) {
            const [, pr, fa, af, re, , ar, gl] = r.map(num);
            if (fa !== null && pr !== null) f(Math.abs(pr - fa - af) <= 2, `${u}/${c || 'todos'} ${r[0]}: produzido ≠ faturado + a faturar (${r.join(' ')})`);
            if (fa !== null && re !== null) f(Math.abs(fa - re - ar - gl) <= 3, `${u}/${c || 'todos'} ${r[0]}: faturado ≠ recebido + a receber + glosa (${r.join(' ')})`);
            if (pend && fa !== null) f((af || 0) + (ar || 0) >= Math.max(1, 0.01 * pr) - 0.6, `${u}/${c || 'todos'} ${r[0]}: "só pendentes" mostrou mês sem pendência`);
          }
        }
      }
    }
    // período: só setembro/2026
    await p.click('#uni button:has-text("Todas")'); await p.selectOption('#conv', ''); 
    await p.selectOption('#de', '2026-09'); await p.selectOption('#ate', '2026-09');
    const r1 = await tabela(); f(r1.length === 2 && r1[1][0] === 'set/26', `período set/26 mostrou ${r1.length - 1} meses`);
    f(r1[0][1] === r1[1][1], `período set/26: total ${r1[0][1]} ≠ linha ${r1[1][1]}`);
    const op = await p.$$eval('#tOp tr', (trs) => trs.slice(1).map((tr) => tr.children[0].textContent)); f(op.length === 1 && op[0] === 'set/26', `operação no período mostrou ${op}`);
    // de depois de até se ajusta sozinho
    await p.selectOption('#de', '2026-10'); f((await p.$eval('#ate', (s) => s.value)) === '2026-10', '"De" depois de "Até" não ajustou');
    // números do mês fechado
    await p.selectOption('#de', '2025-10'); await p.selectOption('#ate', '2026-10');
    // os quadros do início saíram em 20/10/2026: o resumo do mês fica na Operação (2 primeiras linhas: mês atual e o fechado)
    f(!(await p.$('#cMes')) && !(await p.$('#cAtual')), 'os quadros do início voltaram');
    const linhasOp = () => p.$$eval('#tOp tr', (trs) => trs.slice(0, 3).map((tr) => [...tr.children].map((td) => td.textContent).join(' | ')));
    console.log('operação (todas):', (await linhasOp()).join('  //  '));
    for (const u of ['Asa Sul', 'Taguatinga']) { await p.click(`#uni button:has-text("${u}")`); console.log(`operação (${u}):`, (await linhasOp()).slice(1).join('  //  ')); }
    console.log('atenção (Todas):', (await (await p.click('#uni button:has-text("Todas")'), p.locator('#l90').innerText())).replace(/\n/g, ' '));
    f(!erros.length, `erros JS: ${erros}`);
    console.log('combinações testadas:', combos, '| convênios:', convs.length - 1);
    await ctx.close();
  }
  await b.close();
  console.log(falhas.length ? `\n${falhas.length} FALHAS:\n` + [...new Set(falhas)].slice(0, 30).join('\n') : '\nTUDO OK');
})().catch((e) => console.log('ERRO', e.message));
