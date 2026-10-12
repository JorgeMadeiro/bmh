// Teste de clique no site real da BMH: o que o Tag Manager envia ao abrir a página e a cada clique, com TODOS os
// envios bloqueados (não gera conversão nem visita). Sem argumentos, testa a versão publicada; com --rascunho, carrega
// a versão "Latest" (criada e ainda não publicada) pelo código de teste em ~/.config/bmh/gtm-latest-auth.txt.
// Precisa do playwright-core: NODE_PATH=<pasta com node_modules> node scripts/testa-tags.js [--rascunho]
const { chromium } = require('playwright-core'); const fs = require('fs'); const os = require('os');
const RASCUNHO = process.argv.includes('--rascunho');
const AUTH = RASCUNHO ? fs.readFileSync(os.homedir() + '/.config/bmh/gtm-latest-auth.txt', 'utf8').trim() : '';
const CASOS = process.env.CASOS ? JSON.parse(process.env.CASOS) : [
  ['/', 'celular', '.bmh-tri a.bmh-whatsapp', 'triagem: pós-operatório'],
  ['/', 'celular', '.bmh-fix a.bmh-whatsapp', 'barra fixa do celular'],
  ['/', 'computador', '.bmh-hero__ctas a.bmh-telefone', 'telefone no topo'],
  ['/', 'computador', '#unidades article:nth-child(2) a.bmh-rota', 'como chegar Taguatinga'],
  ['/lp/', 'celular', 'a[href*="whatsapp.com"], a[href*="wa.me"]', 'WhatsApp da /lp/ antiga'],
];
function anota(lista, req) {
  const u = req.url(); const corpo = req.postData() || '';
  if (/\/g\/collect/.test(u)) {
    const tid = (u.match(/[?&]tid=([^&]+)/) || [])[1];
    const linhas = corpo ? corpo.split('\n') : [''];
    for (const l of linhas) {
      const q = new URLSearchParams((u.split('?')[1] || '') + '&' + l);
      const extra = ['ep.caso', 'ep.local_do_botao', 'ep.unidade'].filter((k) => q.get(k)).map((k) => k.slice(3) + '=' + q.get(k)).join(' ');
      lista.push(`GA4 ${tid} ${q.get('en')}${extra ? ' (' + extra + ')' : ''}`);
    }
  } else if (/googleadservices\.com\/pagead\/conversion\/|google\.com\/pagead\/1p-conversion\//.test(u)) {
    lista.push('Google Ads conversão ' + ((u.match(/conversion\/(\d+)/) || [])[1] || '') + (u.includes('1p-') ? ' (1p)' : ''));
  } else if (/facebook\.com\/tr/.test(u)) { lista.push('Meta ' + ((u.match(/[?&]ev=([^&]+)/) || [])[1] || ''));
  } else if (/clarity\.ms\/collect/.test(u)) { lista.push('Clarity');
  } else if (/wa\.me|whatsapp\.com/.test(u)) { lista.push('abriria WhatsApp');
  } else if (/maps|waze|uber/.test(u)) { lista.push('abriria mapa'); }
}
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  for (const [pagina, aparelho, seletor, rotulo] of CASOS) {
    const cel = aparelho === 'celular';
    const ctx = await b.newContext({ viewport: cel ? { width: 390, height: 844 } : { width: 1366, height: 900 }, isMobile: cel, hasTouch: cel,
      userAgent: cel ? 'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' });
    const fase = { atual: 'carga' }; const visto = { carga: [], clique: [] };
    await ctx.route(/\/g\/collect|googleadservices\.com\/pagead|google\.com\/pagead\/1p|facebook\.com\/tr|clarity\.ms\/collect|wa\.me|whatsapp\.com|google\.com\/maps|waze\.com|uber\.com/, (r) => { anota(visto[fase.atual], r.request()); r.abort(); });
    if (AUTH) await ctx.route(/googletagmanager\.com\/gtm\.js/, (r) => r.continue({ url: r.request().url() + `&gtm_auth=${AUTH}&gtm_preview=env-2&gtm_cookies_win=x` }));
    ctx.on('page', (np) => { if (np !== ctx.pages()[0]) np.close().catch(() => {}); });
    const p = await ctx.newPage();
    let abriu = false;
    for (let tentativa = 1; tentativa <= 3 && !abriu; tentativa++) {
      try {
        await p.goto('https://hiperbaricabrasilia.com.br' + pagina + '?teste=' + Date.now(), { waitUntil: 'load', timeout: 60000 });
        await p.waitForSelector('a[href*="wa.me"], a[href*="whatsapp.com"]', { state: 'attached', timeout: 30000 }); // no celular o 1º link é o do menu de computador, escondido
        abriu = true;
      } catch (e) { visto.carga.length = 0; console.log(`  (tentativa ${tentativa} falhou: ${e.message.slice(0, 50)})`); await new Promise((r) => setTimeout(r, 5000)); }
    }
    if (!abriu) { console.log(`\n${rotulo}: a página não abriu`); await ctx.close(); continue; }
    await p.waitForTimeout(9000);
    fase.atual = 'clique';
    const alvo = p.locator(seletor).first();
    await alvo.scrollIntoViewIfNeeded().catch(() => {});
    await alvo.click({ noWaitAfter: true, timeout: 10000 }).catch((e) => visto.clique.push('FALHOU O CLIQUE: ' + e.message.slice(0, 60)));
    await p.waitForTimeout(5000);
    const conta = (l) => Object.entries(l.reduce((a, s) => (a[s] = (a[s] || 0) + 1, a), {})).map(([s, n]) => `${n}× ${s}`).join(' | ') || 'nada';
    console.log(`\n[${RASCUNHO ? 'versão 4 (rascunho)' : 'versão publicada'}] ${rotulo} · ${pagina} · ${aparelho}`);
    console.log('  ao abrir:  ' + conta(visto.carga));
    console.log('  ao clicar: ' + conta(visto.clique));
    await ctx.close();
  }
  await b.close();
})();
