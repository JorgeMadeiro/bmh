#!/usr/bin/env node
/**
 * Conecta no WordPress da BMH (hiperbaricabrasilia.com.br) pela API REST nativa.
 * Versão enxuta do script da Nexo (06/10/2026), com uma trava a mais: o site da BMH é
 * feito no Elementor, e página do Elementor NÃO se reescreve pela API (o conteúdo dela mora
 * num campo próprio do plugin; mandar `content` por cima quebra ou é ignorado).
 *
 * Uso:
 *   node --env-file=.env scripts/wp.js paginas                         páginas, com quem as montou (Elementor ou nativo)
 *   node --env-file=.env scripts/wp.js listar                          posts com status
 *   node --env-file=.env scripts/wp.js rascunho <arquivo.md>           cria POST como rascunho
 *   node --env-file=.env scripts/wp.js pagina <arquivo.md> [--slug x]  cria/atualiza PÁGINA NATIVA como rascunho
 *   node --env-file=.env scripts/wp.js previa <arquivo.md> [saida.html]
 *   node --env-file=.env scripts/wp.js imagem <arquivo.jpg> [...]
 *   node --env-file=.env scripts/wp.js publicar <slug> [...]           publica páginas em rascunho já revisadas
 *
 * TRAVAS:
 *  - nunca mexe em página feita no Elementor (só lista);
 *  - nunca altera página ou post publicado sem --publicada escrito na mão;
 *  - `publicar` só roda quando o Jorge mandou publicar.
 *
 * Precisa no .env:
 *   WP_URL=https://hiperbaricabrasilia.com.br
 *   WP_USUARIO=<usuário do WordPress>
 *   WP_SENHA_APP=<senha de aplicativo, com os espaços>
 */

const fs = require('fs');
const path = require('path');

const { WP_URL, WP_USUARIO, WP_SENHA_APP } = process.env;
const comando = process.argv[2];
const arquivo = process.argv[3];
const flag = (nome) => { const i = process.argv.indexOf('--' + nome); return i === -1 ? null : process.argv[i + 1]; };

if (!WP_URL || !WP_USUARIO || !WP_SENHA_APP) {
  console.error('Falta WP_URL, WP_USUARIO ou WP_SENHA_APP no .env.');
  console.error('Gerar a senha de aplicativo: painel do WordPress > Usuários > Perfil > Senhas de aplicativo.');
  process.exit(1);
}

const site = WP_URL.replace(/\/$/, '');
const base = site + '/wp-json/wp/v2';
const auth = 'Basic ' + Buffer.from(`${WP_USUARIO}:${WP_SENHA_APP}`).toString('base64');

const chamar = async (caminho, opcoes = {}) => {
  const r = await fetch(base + caminho, {
    ...opcoes,
    headers: { 'Authorization': auth, 'Content-Type': 'application/json', ...(opcoes.headers || {}) },
  });
  const corpo = await r.json();
  if (!r.ok) {
    const msg = corpo?.message || JSON.stringify(corpo).slice(0, 200);
    throw new Error(`${r.status}: ${msg}`);
  }
  return corpo;
};

// Página do Elementor: template do Elementor ou marca do Elementor no conteúdo.
const ehElementor = (p) => /^elementor_/.test(p.template || '')
  || /data-elementor-type|class="elementor elementor-\d+/.test(p.content?.rendered || p.content?.raw || '');

const data = (s) => new Date(s).toLocaleDateString('pt-BR');

const listar = async (tipo) => {
  const itens = await chamar(`/${tipo}?per_page=50&status=any&context=edit&_fields=id,title,status,date,modified,link,template,content`);
  if (!itens.length) { console.log(`Nenhum item em ${tipo}.`); return; }
  console.log(`${itens.length} ${tipo}:\n`);
  for (const i of itens) {
    const titulo = (i.title?.raw || i.title?.rendered || '(sem título)').slice(0, 60);
    const quem = ehElementor(i) ? 'ELEMENTOR (só no painel)' : 'nativo';
    console.log(`  [${String(i.status).padEnd(8)}] ${titulo}  · ${quem}`);
    console.log(`             id ${i.id} · modificada ${data(i.modified)} · ${i.link}`);
  }
};

// Markdown simples para HTML (títulos, negrito, itálico, listas, parágrafos). HTML puro passa direto.
const paraHtml = (linhas) => linhas.join('\n').trim()
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  .split(/\n{2,}/)
  .map((bloco) => {
    const t = bloco.trim();
    if (!t) return '';
    if (t.startsWith('<')) return t;
    if (/^[-*] /m.test(t)) {
      const itens = t.split('\n').filter((l) => /^[-*] /.test(l)).map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`);
      return `<ul>\n${itens.join('\n')}\n</ul>`;
    }
    return `<p>${t.replace(/\n/g, ' ')}</p>`;
  })
  .filter(Boolean).join('\n\n');

const lerMd = (caminho) => {
  if (!caminho || !fs.existsSync(caminho)) { console.error('Arquivo não encontrado: ' + caminho); process.exit(1); }
  const linhas = fs.readFileSync(caminho, 'utf8').split('\n');
  const titulo = (linhas[0] || '').replace(/^#\s*/, '').trim();
  if (!titulo) { console.error('A primeira linha do arquivo precisa ser o título.'); process.exit(1); }
  const corpo = linhas.slice(1).join('\n').trim();
  return { titulo, conteudo: corpo.startsWith('<') ? corpo : paraHtml(linhas.slice(1)) };
};

const previa = (caminhoMd, saida) => {
  const { titulo, conteudo } = lerMd(caminhoMd);
  const destino = saida || path.join('/tmp', path.basename(caminhoMd).replace(/\.[^.]+$/, '') + '.html');
  fs.writeFileSync(destino, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head><body>\n${conteudo}\n</body></html>`);
  console.log('Prévia local: ' + destino);
};

// Post do blog, sempre como rascunho.
const rascunho = async (caminhoMd) => {
  const { titulo, conteudo } = lerMd(caminhoMd);
  const post = await chamar('/posts', { method: 'POST', body: JSON.stringify({ title: titulo, content: conteudo, status: 'draft', comment_status: 'closed' }) });
  console.log('Rascunho de post criado (NÃO publicado): ' + titulo);
  console.log('  Editar: ' + site + `/wp-admin/post.php?post=${post.id}&action=edit`);
};

// Página NATIVA (bloco do WordPress). Recusa página do Elementor.
const pagina = async (caminhoMd) => {
  const { titulo, conteudo } = lerMd(caminhoMd);
  const slug = flag('slug') || path.basename(caminhoMd).replace(/\.[^.]+$/, '');
  const achadas = await chamar(`/pages?slug=${encodeURIComponent(slug)}&status=any&context=edit&_fields=id,status,template,content`);
  const ja = achadas[0];
  if (ja && ehElementor(ja)) {
    console.error(`A página /${slug} (id ${ja.id}) é do Elementor: não se reescreve pela API.`);
    console.error('Mudar pelo painel, no Elementor, ou criar uma página nativa nova com outro slug e trocar quando o Jorge aprovar.');
    process.exit(1);
  }
  const permitirPublicada = process.argv.includes('--publicada');
  if (ja && ja.status === 'publish' && !permitirPublicada) {
    console.error(`A página /${slug} já está PUBLICADA (id ${ja.id}). Para atualizar assim mesmo, repita com --publicada.`);
    process.exit(1);
  }
  const status = ja && ja.status === 'publish' && permitirPublicada ? 'publish' : 'draft';
  const corpo = { title: titulo, content: conteudo, status, slug };
  const res = ja ? await chamar(`/pages/${ja.id}`, { method: 'POST', body: JSON.stringify(corpo) })
                 : await chamar('/pages', { method: 'POST', body: JSON.stringify(corpo) });
  console.log((status === 'publish' ? 'Página PUBLICADA atualizada: ' : (ja ? 'Rascunho ATUALIZADO: ' : 'Rascunho CRIADO: ')) + titulo);
  console.log('  Editar: ' + site + `/wp-admin/post.php?post=${res.id}&action=edit`);
  console.log('  Prévia: ' + (res.link || ''));
};

const publicar = async (slugs) => {
  if (!slugs.length) { console.error('Passe os slugs das páginas.'); process.exit(1); }
  for (const slug of slugs) {
    const achadas = await chamar(`/pages?slug=${encodeURIComponent(slug)}&status=any&context=edit&_fields=id,status`);
    const pag = achadas[0];
    if (!pag) { console.log(`  ${slug}: não encontrada`); continue; }
    if (pag.status === 'publish') { console.log(`  ${slug}: já estava publicada`); continue; }
    const res = await chamar(`/pages/${pag.id}`, { method: 'POST', body: JSON.stringify({ status: 'publish' }) });
    console.log(`  ${slug}: PUBLICADA -> ${res.link}`);
  }
};

const enviarImagem = async (caminho) => {
  if (!caminho || !fs.existsSync(caminho)) { console.error('Arquivo não encontrado: ' + caminho); process.exit(1); }
  const nome = path.basename(caminho);
  const tipos = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  const tipo = tipos[path.extname(nome).toLowerCase()];
  if (!tipo) { console.error('Use jpg, png ou webp.'); process.exit(1); }
  const r = await fetch(base + '/media', {
    method: 'POST',
    headers: { 'Authorization': auth, 'Content-Type': tipo, 'Content-Disposition': `attachment; filename="${nome}"` },
    body: fs.readFileSync(caminho),
  });
  const j = await r.json();
  if (!r.ok) { console.error('Erro ao enviar: ' + (j?.message || r.status)); process.exit(1); }
  console.log(`${nome} -> ${j.source_url} (id ${j.id})`);
};

(async () => {
  try {
    if (comando === 'paginas') await listar('pages');
    else if (comando === 'listar') await listar('posts');
    else if (comando === 'rascunho') await rascunho(arquivo);
    else if (comando === 'pagina') await pagina(arquivo);
    else if (comando === 'previa') previa(arquivo, process.argv[4]);
    else if (comando === 'publicar') await publicar(process.argv.slice(3));
    else if (comando === 'imagem') { for (const f of process.argv.slice(3)) await enviarImagem(f); }
    else console.log('Comandos: paginas | listar | rascunho <arquivo.md> | pagina <arquivo.md> [--slug x] | previa <arquivo.md> | imagem <arquivos> | publicar <slugs>');
  } catch (e) {
    console.error('Erro: ' + e.message);
    if (String(e.message).startsWith('401')) console.error('401 é usuário ou senha de aplicativo errados. Confira o .env.');
    process.exit(1);
  }
})();
