#!/usr/bin/env node
/**
 * Roda o guardião do Meta da BMH com os dados de hoje, pelo cofre (rota meta-bmh, só leitura), sem n8n, sem gravar e sem
 * mandar nada. Mostra o que o fluxo decidiria e o texto que iria ao Telegram. Serve para conferir as regras antes de cada
 * mudança ("nunca alarme falso": testar com os dados de hoje se o aviso dispararia à toa).
 *
 *   node scripts/n8n/testa-guardiao-meta.js [--cfg chave=valor ...] [--hoje AAAA-MM-DD]
 *   ex.: --cfg meta_no_ar_ate=2026-10-31 --cfg meta_teto_mes=700
 *
 * Sem --cfg, usa meta_no_ar_ate=2026-10-31 (regra do Jorge de 20/10/2026). O registro do guardião não é lido (a rota de
 * tabelas não alcança a BMH_guardiao_registro), então a regra de "só volta em 7 dias" não entra no teste.
 */
const path = require('path');
const { decideMeta, montaEntrada, montaMensagem } = require('./bmh-meta-guardiao-decide.js');
const L = require('./bmh-meta-guardiao-leituras.json');
const COFRE = (process.env.COFRE_URL || 'http://cofre:8080').replace(/\/+$/, '') + '/meta-bmh/';

const args = process.argv.slice(2);
const cfg = {};
for (let i = 0; i < args.length; i++) if (args[i] === '--cfg') { const [k, ...v] = args[++i].split('='); cfg[k] = v.join('='); }
if (!Object.keys(cfg).length) cfg.meta_no_ar_ate = '2026-10-31';
const iHoje = args.indexOf('--hoje');

const hoje = iHoje > -1 ? args[iHoje + 1] : new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const d = new Date(hoje + 'T12:00:00Z');
const menos = n => { const x = new Date(d); x.setUTCDate(x.getUTCDate() - n); return x.toISOString().slice(0, 10); };
const diasMes = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
const dia = d.getUTCDate();
const Q = { hoje, ontem: menos(1), dia, dias_mes: diasMes, restantes: diasMes - dia + 1, mes_desde: dia > 1 ? hoje.slice(0, 8) + '01' : menos(1), teste: true, conta: L.conta };
const troca = s => s.replace(/\{(\w+)\}/g, (_, k) => Q[k]);

(async () => {
  const lidas = {}, nomes = {};
  for (const l of L.leituras) {
    nomes[l.chave] = l.no;
    const q = new URLSearchParams(Object.fromEntries(Object.entries(l.consulta).map(([k, v]) => [k, troca(v)])));
    const r = await fetch(`${COFRE}${L.versao}/${troca(l.caminho)}?${q}`);
    const corpo = await r.json().catch(() => ({}));
    lidas[l.chave] = r.ok ? corpo : { error: { message: `${r.status} ${JSON.stringify(corpo).slice(0, 200)}` } };
  }
  const E = montaEntrada(Q, cfg, lidas, [], nomes);
  const acoes = decideMeta(E);
  console.log(`hoje ${Q.hoje} | cfg ${JSON.stringify(cfg)}\n`);
  if (!acoes.length) console.log('nenhum aviso nem proposta: o guardião ficaria calado');
  for (const a of acoes) console.log(`[${a.regra}] ${a.acao}${a.resultado === 'nao_proposto' ? ' (pausa barrada pela continuidade)' : ''} · ${a.alvo}\n   ${a.detalhe}`);
  const [m] = montaMensagem(Q, acoes);
  if (m) console.log('\n--- Telegram ---\n' + m.texto);
})().catch(e => { console.error('Erro: ' + e.message); process.exit(1); });
