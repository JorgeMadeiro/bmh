#!/usr/bin/env node
/**
 * Monta uma página da BMH a partir de um arquivo HTML de site/paginas/ e envia ao WordPress como página NATIVA
 * (um bloco HTML só), com o SEO do SEOPress e o cabeçalho/rodapé/título do tema Astra desligados.
 *
 * Uso:
 *   node --env-file=.env scripts/wp-pagina-html.js local  site/paginas/home.html saida.html
 *        monta a página com as imagens locais (site/imagens/) para testar no navegador; não envia nada
 *   node --env-file=.env scripts/wp-pagina-html.js enviar site/paginas/home.html --slug inicio-nova \
 *        --titulo "Início" --seo-titulo "..." --seo-desc "..." [--id 123] [--publicada]
 *        envia as imagens que faltarem à biblioteca, cria (ou atualiza) a página como RASCUNHO
 *
 * Marcas que o arquivo usa:  {{img:arquivo}}  {{wa:chave}}  {{svg:wa}}  {{svg:tel}}  {{planos}}  {{schema}}
 *
 * TRAVAS:
 *  - nunca mexe em página do Elementor;
 *  - nunca altera página publicada sem --publicada escrito na mão (e nunca publica: publicar é outro passo, com o
 *    "pode" do Jorge);
 *  - antes de usar uma imagem da biblioteca, confere se o endereço responde 200 (lição 21).
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const NUMERO = '556133466005';
// mensagens prontas do WhatsApp: vêm da lista ÚNICA integracoes/origem/frases.json (22/10/2026), a mesma que o leitor de
// origem do Kommo usa; mudar uma frase só lá (lição da Nexo: duas listas viram uma esquecida)
const MENSAGENS = Object.fromEntries(require('../integracoes/origem/frases.json').frases.filter((f) => !f.mensagem.includes('{')).map((f) => [f.chave, f.mensagem]));
const SVG = {
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
};

const args = process.argv.slice(2);
const modo = args[0];
const arquivo = args[1];
const flag = (n) => { const i = args.indexOf('--' + n); return i === -1 ? null : args[i + 1]; };
const tem = (n) => args.includes('--' + n);

function monta(html, imagem) {
  const planos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'site/dados/convenios.json'), 'utf8'));
  let schema = fs.readFileSync(path.join(RAIZ, 'site/dados/schema-home.json'), 'utf8');
  schema = JSON.stringify(JSON.parse(schema));
  html = html.replace(/<!--[\s\S]*?-->\s*/, '');
  html = html.replace('{{planos}}', JSON.stringify(planos)).replace('{{schema}}', schema);
  html = html.replace(/\{\{img:([^}]+)\}\}/g, (_, n) => imagem(n));
  html = html.replace(/\{\{wa:([a-z]+)\}\}/g, (_, k) => {
    if (!MENSAGENS[k]) throw new Error('mensagem de WhatsApp sem chave: ' + k);
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAGENS[k])}`;
  });
  html = html.replace(/\{\{svg:([a-z]+)\}\}/g, (_, k) => SVG[k]);
  const sobrou = html.match(/\{\{[^}]+\}\}/);
  if (sobrou) throw new Error('marca não resolvida: ' + sobrou[0]);
  if (/&&/.test(html)) throw new Error('o arquivo tem "&&": o WordPress quebra isso em script (lição 48 da Nexo)');
  return html;
}

async function main() {
  if (!arquivo || !['local', 'enviar'].includes(modo)) {
    console.log('Uso: local <arquivo.html> <saida.html>  |  enviar <arquivo.html> --slug x --titulo "..." --seo-titulo "..." --seo-desc "..."');
    process.exit(1);
  }
  const fonte = fs.readFileSync(path.join(RAIZ, arquivo), 'utf8').replace(/^\s*<!--[\s\S]*?-->\s*/, '');

  if (modo === 'local') {
    const saida = args[2] || 'saida.html';
    const rel = path.relative(path.dirname(path.resolve(saida)), path.join(RAIZ, 'site/imagens'));
    const corpo = monta(fonte, (n) => rel + '/' + n);
    fs.writeFileSync(saida, '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>prévia local</title></head><body style="margin:0">' + corpo + '</body></html>');
    console.log('montado em', saida);
    return;
  }

  const { WP_URL, WP_USUARIO, WP_SENHA_APP } = process.env;
  if (!WP_URL || !WP_USUARIO || !WP_SENHA_APP) { console.error('Falta WP_URL, WP_USUARIO ou WP_SENHA_APP no .env.'); process.exit(1); }
  const base = WP_URL.replace(/\/$/, '');
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
  const auth = { Authorization: 'Basic ' + Buffer.from(WP_USUARIO + ':' + WP_SENHA_APP).toString('base64'), 'User-Agent': UA };
  const api = async (rota, op = {}) => {
    const r = await fetch(base + '/wp-json/wp/v2/' + rota, { ...op, headers: { ...auth, ...(op.headers || {}) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${rota}: ${r.status} ${j.code || ''} ${j.message || ''}`);
    return j;
  };

  // 1. imagens: usa a da biblioteca se já existir com o mesmo nome; senão envia
  const usadas = [...new Set([...fonte.matchAll(/\{\{img:([^}]+)\}\}/g)].map((m) => m[1]))];
  const schemaTxt = fs.readFileSync(path.join(RAIZ, 'site/dados/schema-home.json'), 'utf8');
  for (const m of schemaTxt.matchAll(/\{\{img:([^}]+)\}\}/g)) if (!usadas.includes(m[1])) usadas.push(m[1]);
  const mapa = {};
  for (const nome of usadas) {
    const semExt = nome.replace(/\.[a-z]+$/, '');
    const achadas = await api(`media?search=${encodeURIComponent(semExt)}&per_page=20&_fields=id,source_url`);
    let item = achadas.find((a) => path.basename(a.source_url) === nome);
    if (!item) {
      const bin = fs.readFileSync(path.join(RAIZ, 'site/imagens', nome));
      const tipo = nome.endsWith('.png') ? 'image/png' : nome.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      item = await api('media', { method: 'POST', headers: { 'Content-Type': tipo, 'Content-Disposition': `attachment; filename="${nome}"` }, body: bin });
      console.log('  imagem enviada:', nome, '→ id', item.id);
    }
    const h = await fetch(item.source_url, { method: 'HEAD', headers: { 'User-Agent': UA } });
    if (h.status !== 200 || !/^image\//.test(h.headers.get('content-type') || '')) throw new Error(`imagem não responde 200: ${item.source_url} (${h.status})`);
    mapa[nome] = item.source_url;
  }
  const corpo = monta(fonte, (n) => mapa[n]);
  const content = '<!-- wp:html -->\n' + corpo + '\n<!-- /wp:html -->';

  // 2. página: cria ou atualiza, sempre como rascunho
  const id = flag('id');
  if (id) {
    const atual = await api(`pages/${id}?context=edit&_fields=id,status,template,meta`);
    if ((atual.meta || {})._elementor_edit_mode === 'builder' || /elementor/.test(atual.template || '')) throw new Error('página do Elementor: recusado');
    if (atual.status === 'publish' && !tem('publicada')) throw new Error('página publicada: só com --publicada');
  }
  const meta = {
    'site-post-title': 'disabled', 'ast-main-header-display': 'disabled', 'ast-hfb-above-header-display': 'disabled',
    'ast-hfb-below-header-display': 'disabled', 'ast-hfb-mobile-header-display': 'disabled', 'footer-sml-layout': 'disabled',
    'site-sidebar-layout': 'no-sidebar', 'ast-site-content-layout': 'full-width-container', 'site-content-style': 'unboxed',
    'ast-breadcrumbs-content': 'disabled', 'ast-featured-img': 'disabled',
  };
  if (flag('seo-titulo')) meta._seopress_titles_title = flag('seo-titulo');
  if (flag('seo-desc')) meta._seopress_titles_desc = flag('seo-desc');
  // na atualização sem --titulo, o título atual fica (antes virava "Página nova", 08/10/2026)
  const corpoReq = { content, template: '', meta };
  if (flag('titulo') || !id) corpoReq.title = flag('titulo') || 'Página nova';
  if (!id) { corpoReq.status = 'draft'; corpoReq.slug = flag('slug') || undefined; }
  const pg = await api(id ? `pages/${id}` : 'pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpoReq) });

  // 3. conferência: o que foi salvo é o que foi mandado
  const salvo = await api(`pages/${pg.id}?context=edit&_fields=id,status,slug,link,content,meta`);
  const igual = salvo.content.raw.trim() === content.trim();
  console.log(`página ${pg.id} · ${salvo.status} · slug ${salvo.slug} · conteúdo salvo igual ao enviado: ${igual ? 'sim' : 'NÃO'}`);
  console.log('SEO:', salvo.meta._seopress_titles_title, '|', salvo.meta._seopress_titles_desc);
  console.log('prévia (logado no painel):', `${base}/?page_id=${pg.id}&preview=true`);
  if (!igual) process.exitCode = 2;
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
