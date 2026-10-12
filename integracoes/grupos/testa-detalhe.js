const { chromium } = require('playwright-core');
const num = (t) => { t = String(t).trim(); if (t === '<1') return 0.5; return Number(t.replace(/\./g, '').replace(',', '.')); };
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, httpCredentials: { username: process.env.PAINEL_DIRETORIA_USUARIO, password: process.env.PAINEL_DIRETORIA_SENHA } });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', (e) => erros.push(e.message));
  const t0 = Date.now(); const resp = await p.goto(process.env.N8N_URL + '/webhook/bmh-diretoria', { waitUntil: 'networkidle', timeout: 120000 });
  console.log('carregou em', ((Date.now() - t0) / 1000).toFixed(1), 's | tamanho', Math.round((await resp.body()).length / 1024), 'KB');
  const falhas = []; let testes = 0;
  const totalModal = async () => { const sub = await p.$eval('#dSub', (e) => e.textContent); const m = sub.match(/R\$ ([\d.]+)( mil| mi)?/); return m; };
  for (const u of ['Todas', 'Asa Sul', 'Taguatinga']) {
    await p.click(`#uni button:has-text("${u}")`);
    for (const c of ['', 'BRADESCO', 'GEAP', 'TJDFT']) {
      await p.selectOption('#conv', c);
      const cels = await p.$$('#tFin td.cl');
      for (const cel of cels.slice(0, 12)) {
        const v = num(await cel.textContent()); await cel.click(); testes++;
        const aberto = await p.$eval('#det', (e) => e.classList.contains('on'));
        if (!aberto) { falhas.push(`${u}/${c}: não abriu`); continue; }
        // soma das linhas da janela (R$ inteiros) contra o valor da célula (R$ mil)
        const soma = await p.$$eval('#dCorpo .lin span:last-child', (s) => s.reduce((t, x) => t + Number(x.textContent.replace(/[^\d]/g, '')), 0));
        if (Math.abs(soma / 1000 - v) > 1) falhas.push(`${u}/${c || 'todos'}: célula ${v} mil × detalhe ${Math.round(soma / 1000)} mil (${await p.$eval('#dTit', (e) => e.textContent)})`);
        await p.click('#det .fechar');
      }
    }
  }
  // atenção
  await p.click('#uni button:has-text("Todas")'); await p.selectOption('#conv', '');
  for (const id of ['l90', 'lFat']) {
    const itens = await p.$$(`#${id} li.cl`);
    for (const it of itens.slice(0, 4)) {
      const val = await it.$eval('span:last-child', (e) => e.textContent); await it.click(); testes++;
      const soma = await p.$$eval('#dCorpo .lin span:last-child', (s) => s.reduce((t, x) => t + Number(x.textContent.replace(/[^\d]/g, '')), 0));
      const alvo = Number(val.replace(/[^\d,]/g, '').replace(',', '.')) * (/mi\b/.test(val) ? 1e6 : /mil/.test(val) ? 1000 : 1);
      if (Math.abs(soma - alvo) > (/mil|mi/.test(val) ? 1000 : 2)) falhas.push(`atenção ${id} ${val}: detalhe soma ${soma}`);
      await p.click('#det .fechar');
    }
  }
  // print de exemplo: a receber de jul/26 da GEAP
  await p.selectOption('#conv', 'GEAP'); const c = await p.$$('#tFin td.cl'); if (c.length) { await c[0].click(); await p.screenshot({ path: '/Users/jorgemadeiro/Downloads/BMH_Claude_VSL/saidas/painel/diretoria-detalhe.png' }); }
  await p.keyboard.press('Escape'); await p.selectOption('#conv', '');
  await p.click('#l90 li.cl >> nth=0'); await p.screenshot({ path: '/Users/jorgemadeiro/Downloads/BMH_Claude_VSL/saidas/painel/diretoria-detalhe-atencao.png' });
  console.log('cliques testados:', testes, '| erros JS:', erros.length ? erros : 'nenhum', '| largura', await p.evaluate(() => document.documentElement.scrollWidth));
  console.log(falhas.length ? falhas.length + ' FALHAS:\n' + falhas.slice(0, 20).join('\n') : 'TUDO OK');
  await b.close();
})().catch((e) => console.log('ERRO', e.message));
