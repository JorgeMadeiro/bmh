#!/usr/bin/env node
/**
 * Roda a seção da BMH na revisão semanal com os dados de verdade (tabelas de números e registro dos guardiões, pela rota
 * n8n-tabelas-numeros do cofre, só leitura), sem n8n, sem gravar e sem mandar: mostra o texto do Telegram e as linhas da
 * BMH_anuncios_revisao.
 *
 *   node scripts/n8n/testa-revisao-semana.js [--segunda AAAA-MM-DD] [--cfg chave=valor ...]
 * Sem --segunda, usa a segunda desta semana (a revisão de hoje, se hoje é segunda).
 */
const { revisaoSemana, montaRevisao } = require('./bmh-revisao-semana.js');
const TAB = { google: '1TSLyd68TBzYajYq', meta: 'JMvvyiF8uT6iqgQL', registro: 'E1ewiB9pcohZpSfw' };
const args = process.argv.slice(2), arg = n => { const i = args.indexOf('--' + n); return i > -1 ? args[i + 1] : null; };
const cfg = {}; for (let i = 0; i < args.length; i++) if (args[i] === '--cfg') { const [k, ...v] = args[++i].split('='); cfg[k] = v.join('='); }
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

function datas(segunda) {
  const d = new Date(segunda + 'T12:00:00Z'), m = n => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const fim = m(-1);
  return { segunda, semana_ini: m(-7), semana_fim: fim, ant_ini: m(-14), ant_fim: m(-8), mes_ini: fim.slice(0, 8) + '01', d30: m(-30) };
}
async function tabela(id) {
  let out = [], cursor = null;
  do { const q = new URLSearchParams({ limit: '250', ...(cursor ? { cursor } : {}) });
    const r = await fetch(`http://cofre:8080/n8n-tabelas-numeros/api/v1/data-tables/${id}/rows?${q}`); const j = await r.json();
    if (!r.ok) throw new Error(`tabela ${id}: ${r.status}`); out = out.concat(j.data || []); cursor = j.nextCursor; } while (cursor);
  return out;
}
(async () => {
  let segunda = arg('segunda');
  if (!segunda) { const d = new Date(hoje + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); segunda = d.toISOString().slice(0, 10); }
  const D = datas(segunda);
  const T = {}; for (const [k, id] of Object.entries(TAB)) T[k] = await tabela(id);
  const R = revisaoSemana(D, T, cfg);
  const { texto, linhas } = montaRevisao(D, R, new Date().toISOString(), true);
  console.log(JSON.stringify(D), '| cfg', JSON.stringify(cfg), '\n');
  console.log(texto);
  console.log(`\n${linhas.length} linhas para a BMH_anuncios_revisao: ${linhas.filter(l => l.tipo === 'bloco' && l.titulo).length} blocos, ${linhas.filter(l => l.tipo === 'proposta' && l.acao).length} propostas (o resto, vagas vazias)`);
})().catch(e => { console.error('Erro: ' + e.message); process.exit(1); });
