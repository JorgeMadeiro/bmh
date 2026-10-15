// Radar da BMH (B2, aprovado pelo Jorge em 15/10/2026): lê as páginas públicas dos concorrentes e as notícias das
// entidades, uma vez por dia, pela regra única de leitura de site (~/.claude/skills/prospeccao/referencias/ritmo-e-robots.md):
// robots.txt antes, identificação "MadeiroLeitor", um pedido por vez, 3 s entre pedidos (ou o Crawl-delay), 429/503
// com espera dobrando (3 tentativas), 401/403/desafio de bloqueio = para o site e avisa o Jorge. Sem disfarce.
// Feed público antes da página. O texto sai limpo (sem script, estilo, menu nem HTML) antes de qualquer IA.
const UA = 'MadeiroLeitor/1.0 (+https://jorgemadeiro.com)';
const FONTES = [
  { nome: 'Oxi Hiperbárica', url: 'https://www.oxihiperbarica.com.br/', tipo: 'concorrente' },
  { nome: 'Oxi Hiperbárica · convênios', url: 'https://www.oxihiperbarica.com.br/convenios/', tipo: 'concorrente' },
  { nome: 'Infinita Hiperbárica', url: 'https://infinitahiperbarica.com.br/', tipo: 'concorrente' },
  { nome: 'Centro Hiperbárico de Brasília (CHB)', url: 'https://chbcentrohiperbarico.com.br/', tipo: 'concorrente' },
  { nome: 'HiperCure', url: 'https://hipercure.com.br/medicina-hiperbarica/', tipo: 'concorrente' },
  { nome: 'Rinnovare Brasília', url: 'https://rinnovarebrasilia.com.br/', tipo: 'concorrente' },
  { nome: 'Hospital Daher · medicina hiperbárica', url: 'https://hospitaldaher.com.br/medicina-hiperbarica/', tipo: 'concorrente' },
  { nome: 'CFM', url: 'https://portal.cfm.org.br/feed/', tipo: 'feed' },
  { nome: 'Sociedade Brasileira de Medicina Hiperbárica', url: 'https://sbmh.com.br/feed/', tipo: 'feed' },
  { nome: 'ANVISA', url: 'https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa', tipo: 'noticias' },
  { nome: 'UHMS', url: 'https://www.uhms.org/', tipo: 'noticias' },
];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// o n8n não tem a função URL: versão simples (protocolo, host, caminho, origem) e resolver link relativo
const partes = (u) => { const m = String(u).match(/^(https?:)\/\/([^\/?#]+)([^?#]*)/i) || []; return { protocol: m[1] || 'https:', host: (m[2] || '').toLowerCase(), pathname: m[3] || '/', origin: (m[1] || 'https:') + '//' + (m[2] || '').toLowerCase() }; };
const resolve = (h, base) => (/^https?:\/\//i.test(h) ? h : h.startsWith('//') ? 'https:' + h : h.startsWith('/') ? partes(base).origin + h : partes(base).origin + '/' + h.replace(/^\.\//, ''));
const pede = async (url) => {
  let ms = 5000;
  for (let k = 0; k < 3; k++) {
    try {
      const r = await this.helpers.httpRequest({ url, headers: { 'User-Agent': UA }, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 30000, encoding: 'text' });
      if (r.statusCode === 429 || r.statusCode === 503) { const ra = Number(r.headers?.['retry-after']); await espera(ra > 0 ? ra * 1000 : ms); ms *= 2; continue; }
      return { status: r.statusCode, corpo: String(r.body || '') };
    } catch (e) { if (k === 2) return { status: 0, corpo: '', erro: e.message }; await espera(ms); ms *= 2; }
  }
  return { status: 429, corpo: '' };
};
const robots = {};
const permite = async (url) => {
  const u = partes(url), host = u.host;
  if (!(host in robots)) {
    const r = await pede(`${u.protocol}//${host}/robots.txt`);
    if (r.status >= 500 || r.status === 0) robots[host] = { fora: true };
    else {
      const regras = { proibe: [], atraso: 0 }; let vale = false;
      for (const l of (r.status === 200 ? r.corpo : '').split(/\r?\n/)) {
        const [k, ...v] = l.split(':'); const chave = (k || '').trim().toLowerCase(), valor = v.join(':').trim();
        if (chave === 'user-agent') vale = valor === '*' || /madeiroleitor/i.test(valor);
        else if (vale && chave === 'disallow' && valor) regras.proibe.push(valor);
        else if (vale && chave === 'crawl-delay') regras.atraso = Math.max(regras.atraso, Number(valor) || 0);
      }
      robots[host] = regras;
    }
    await espera(3000);
  }
  const R = robots[host]; if (R.fora) return { ok: false, motivo: 'robots.txt fora do ar: não li hoje' };
  // padrão do robots.txt: "*" vale qualquer trecho e "$" marca o fim do endereço
  const casa = (p) => new RegExp('^' + p.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$')).test(u.pathname);
  if (R.proibe.some(casa)) return { ok: false, motivo: 'robots.txt não permite' };
  return { ok: true, atraso: Math.max(3000, R.atraso * 1000) };
};
const limpa = (html) => String(html).replace(/<(script|style|noscript|svg|nav|header|footer|form|iframe)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>|<\/(p|li|h[1-6]|div|section|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&rsquo;|&lsquo;/g, "'").replace(/&[a-z#0-9]+;/gi, ' ')
  .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length >= 3).join('\n').slice(0, 15000);
const hash = (s) => { let a = 5381, b = 52711; for (const ch of s) { const c = ch.charCodeAt(0); a = ((a * 33) ^ c) >>> 0; b = ((b * 31) + c) >>> 0; } return a.toString(36) + b.toString(36); };
const paginas = [], itens = [], bloqueios = [];
const bloqueado = (r) => r.status === 401 || r.status === 403 || /Checking your browser|cf-challenge|cf_chl_|Attention Required/i.test(r.corpo.slice(0, 20000));
for (const f of FONTES) {
  const p = await permite(f.url);
  if (!p.ok) { bloqueios.push(`${f.nome}: ${p.motivo}`); continue; }
  const r = await pede(f.url); await espera(p.atraso);
  if (bloqueado(r)) { bloqueios.push(`${f.nome}: o site bloqueou o robô (${r.status}); não li hoje`); continue; }
  if (r.status !== 200) { bloqueios.push(`${f.nome}: respondeu ${r.status || r.erro}`); continue; }
  if (f.tipo === 'concorrente') { const texto = limpa(r.corpo); paginas.push({ chave: f.url, nome: f.nome, hash: hash(texto), texto }); continue; }
  if (f.tipo === 'feed') {
    for (const m of r.corpo.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const t = (m[1].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '', l = (m[1].match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
      const d = limpa(((m[1].match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '')).slice(0, 1500);
      if (l) itens.push({ fonte: f.nome, titulo: limpa(t).slice(0, 300), link: l.trim(), resumo: d });
    }
    continue;
  }
  // página de notícias sem feed: os links com título razoável
  for (const m of r.corpo.matchAll(/<a[^>]+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const t = limpa(m[2]).replace(/\n/g, ' '); if (t.length < 25 || t.length > 220) continue;
    const l = resolve(m[1].replace(/&amp;/g, '&'), f.url); if (!l.toLowerCase().startsWith(partes(f.url).origin)) continue;
    itens.push({ fonte: f.nome, titulo: t, link: l, resumo: '' });
  }
}
return [{ json: { paginas, itens: [...new Map(itens.map((i) => [i.link, i])).values()], bloqueios } }];
