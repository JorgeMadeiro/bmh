#!/usr/bin/env node
/**
 * Roda os "números do dia" do Meta da BMH com os dados de hoje pelo cofre (rota meta-bmh, só leitura), sem n8n e sem gravar:
 * mostra as linhas que iriam para a BMH_meta_anuncios_dia e o bloco do Meta que sairia no resumo das 8h.
 *
 *   node scripts/n8n/testa-numeros-meta.js [--desde AAAA-MM-DD] [--cfg chave=valor ...]
 */
global.verbaDaConta = require('./bmh-meta-guardiao-decide.js').verbaDaConta;   // no n8n, o texto das duas fica no mesmo nó
const { linhasDoDia, blocoMeta } = require('./bmh-meta-numeros.js');
const L = require('./bmh-meta-numeros-leituras.json');
const COFRE = (process.env.COFRE_URL || 'http://cofre:8080').replace(/\/+$/, '') + '/meta-bmh/';

const args = process.argv.slice(2), arg = n => { const i = args.indexOf('--' + n); return i > -1 ? args[i + 1] : null; };
const cfg = {}; for (let i = 0; i < args.length; i++) if (args[i] === '--cfg') { const [k, ...v] = args[++i].split('='); cfg[k] = v.join('='); }
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const d = new Date(hoje + 'T12:00:00Z'), menos = n => { const x = new Date(d); x.setUTCDate(x.getUTCDate() - n); return x.toISOString().slice(0, 10); };
const Q = { hoje, ontem: menos(1), desde: arg('desde') || menos(3), agora: new Date().toISOString(), conta: L.conta };
const troca = s => s.replace(/\{(\w+)\}/g, (_, k) => Q[k]);

(async () => {
  const lidas = {};
  for (const l of L.leituras) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(l.consulta).map(([k, v]) => [k, troca(v)])));
    const r = await fetch(`${COFRE}${L.versao}/${troca(l.caminho)}?${q}`); const j = await r.json().catch(() => ({}));
    lidas[l.chave] = r.ok ? j : { error: { message: r.status + ' ' + JSON.stringify(j).slice(0, 200) } };
  }
  const linhas = linhasDoDia(Q, lidas);
  const dias = [...new Set(linhas.filter(r => r.tipo === 'anuncio').map(r => r.dia))].sort();
  console.log(`período ${Q.desde} a ${Q.ontem}: ${linhas.length - 1} linhas de anúncio em ${dias.length} dias + 1 foto da conta`);
  for (const dia of dias) { const ds = linhas.filter(r => r.dia === dia && r.tipo === 'anuncio');
    console.log(`  ${dia}  ${ds.length} anúncios  gasto R$ ${ds.reduce((s, r) => s + r.gasto, 0).toFixed(2)}  conversas ${ds.reduce((s, r) => s + r.conversas, 0)}  cliques ${ds.reduce((s, r) => s + r.cliques_link, 0)}`); }
  console.log('  conta:', JSON.stringify(linhas[linhas.length - 1]));
  // resumo de amanhã às 8h: "ontem" do resumo é o hoje desta gravação
  const amanha = new Date(d); amanha.setUTCDate(amanha.getUTCDate() + 1);
  const A = amanha.toISOString().slice(0, 10), O = hoje;
  const B = blocoMeta(linhas.map(r => (r.tipo === 'conta' ? { ...r, dia: A } : r)), cfg,
    { O: Q.ontem, M0: Q.ontem.slice(0, 8) + '01', hoje: A, diaOntem: Number(Q.ontem.slice(8)), diasMes: new Date(Date.UTC(+Q.ontem.slice(0, 4), +Q.ontem.slice(5, 7), 0)).getUTCDate() });
  console.log('\n--- bloco do Meta no resumo (com a foto da conta de hoje e "ontem" = ' + Q.ontem + ') ---');
  console.log([...B.ontem, '', ...B.mes, ...(B.atraso.length ? ['', ...B.atraso] : [])].join('\n'));
})().catch(e => { console.error('Erro: ' + e.message); process.exit(1); });
