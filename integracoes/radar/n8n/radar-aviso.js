// Monta o aviso do radar (só quando há novidade que importa, bloqueio ou é teste) e o que gravar como visto.
const C = $('Compara').all().map((i) => i.json), L = $('Lê as fontes').first().json, base = C[0] || {};
const resp = base.sem_ia ? [] : $('IA · lê a novidade').all().map((i) => i.json);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const conc = [], nots = [];
C.forEach((c, k) => {
  if (c.sem_ia) return; let o = {}; try { o = JSON.parse(resp[k].choices[0].message.content); } catch (e) { o = { erro: true }; }
  if (c.tipo === 'mudanca' && (o.importa || o.erro)) conc.push(`• <b>${esc(c.ref.nome)}</b>${o.tipo ? ' (' + esc(o.tipo) + ')' : ''}: ${esc(o.resumo || 'mudou, mas a IA não conseguiu resumir; vale olhar')} <a href="${esc(c.ref.url)}">ver</a>`);
  if (c.tipo === 'noticia') nots.push(`• <b>${esc(c.ref.fonte)}</b>: <a href="${esc(c.ref.link)}">${esc(c.ref.titulo)}</a>\n${esc(o.resumo || '')}${o.vale_post && o.rascunho ? '\n<i>Rascunho de post (para aprovar):</i>\n' + esc(o.rascunho) : ''}`);
});
const partes = [];
if (conc.length) partes.push('<b>Concorrentes</b>\n' + conc.join('\n'));
if (nots.length) partes.push('<b>Notícias</b>\n' + nots.join('\n\n'));
if (base.bloqueios?.length) partes.push('⚠️ <b>Não li hoje</b>\n' + base.bloqueios.map((b) => '• ' + esc(b)).join('\n'));
if (base.sobraram) partes.push(`(mais ${base.sobraram} novidade(s) ficam para amanhã: teto de 6 leituras com IA por dia)`);
const primeira = (base.primeiras || []).length || (base.fontesNovas || []).length;
const enviar = !!(partes.length || base.teste);
const texto = `${base.teste ? '🧪 TESTE\n' : ''}🛰️ <b>BMH · Radar</b> · ${$now.setZone('America/Sao_Paulo').toFormat('dd/LL')}\n\n` + (partes.length ? partes.join('\n\n') : 'Nenhuma novidade que importe.')
  + (primeira ? `\n\nPrimeira leitura de ${(base.primeiras || []).length} página(s) e ${(base.fontesNovas || []).length} fonte(s) de notícia: só guardei, sem comparar.` : '')
  + (nots.some((n) => n.includes('Rascunho')) ? '\n\nNada é publicado: o rascunho só vira post com a sua aprovação.' : '');
const agora = $now.toISO();
return [{ json: { enviar, texto: texto.slice(0, 4000),
  paginas: L.paginas.map((p) => ({ chave: p.chave, nome: p.nome, hash: p.hash, texto: p.texto, visto_em: agora })),
  itens: L.itens.map((i) => ({ chave: i.link, fonte: i.fonte, titulo: i.titulo, visto_em: agora })) } }];
