#!/usr/bin/env node
// Ensaio da origem das conversas (22/10/2026): roda liga-conversas.js com mensagens e cliques simulados. Uso: node integracoes/origem/testa-liga-conversas.js
const fs = require('fs'), path = require('path');
const codigo = fs.readFileSync(path.join(__dirname, 'liga-conversas.js'), 'utf8');
const AGORA = Date.parse('2026-10-22T18:00:00Z'), iso = (min) => new Date(AGORA - min * 60000).toISOString();
const roda = (msgs, cliques, feitas = []) => new Function('$', '$now', 'return (function(){' + codigo + '})()')((no) => ({ all: () => ({ 'Mensagens (tabela)': msgs, 'Cliques (tabela)': cliques, 'Origem das conversas (tabela)': feitas })[no].map((json) => ({ json })) }), { toISO: () => new Date(AGORA).toISOString() }).map((i) => i.json);
const msg = (fone, min, texto, origem = '', extra = {}) => ({ telefone_hash: fone.padEnd(64, '0'), momento: iso(min), direcao: 'paciente', texto, origem, ...extra });
const cl = (chave, min, mensagem_inicio, extra = {}) => ({ chave, registrado_em: iso(min), mensagem_inicio, pagina: '/', lead_id: '', ...extra });
let ok = 0, falhas = 0; const confere = (n, c) => { if (c) ok++; else { falhas++; console.log('FALHOU:', n); } };
let r = roda([msg('a', 30, 'Olá! Vim pelo site da BMH e gostaria de agendar uma avaliação.', 'site')], [cl('c1', 32, 'Olá! Vim pelo site da BMH e gostaria de agendar uma avaliaçã', { gclid: 'G1' })]);
confere('frase + clique leva o gclid', r.find((x) => x.tipo === 'conversa').como === 'frase e clique' && r.find((x) => x.tipo === 'conversa').gclid === 'G1' && r.find((x) => x.tipo === 'clique').lead_id.startsWith('conversa:'));
r = roda([msg('a', 30, 'Olá! Vim pelo site da BMH e gostaria', 'site')], [cl('c1', 300, 'Olá! Vim pelo site da BMH e gostaria', { gclid: 'G1' })]);
confere('clique velho demais não liga', r[0].como === 'frase' && r.length === 1);
r = roda([msg('b', 20, 'boa tarde, quanto custa?')], [cl('c2', 22, 'Olá! Vim pelo site da BMH', { gclid: 'G2' })]);
confere('sem frase: provável pelo tempo', r.find((x) => x.tipo === 'conversa').como === 'provável pelo tempo' && r.find((x) => x.tipo === 'conversa').gclid === 'G2');
r = roda([msg('b', 20, 'oi'), msg('c', 19, 'olá')], [cl('c2', 22, 'Olá! Vim pelo site')]);
confere('duas conversas no mesmo clique: não adivinha', !r.find((x) => x.como === 'provável pelo tempo'));
r = roda([msg('b', 20, 'oi')], [cl('c2', 22, 'x'), cl('c3', 23, 'y')]);
confere('dois cliques juntos: não adivinha', !r.find((x) => x.como === 'provável pelo tempo'));
r = roda([msg('d', 200, 'oi')], []);
confere('sem nada depois de 3 h: sem origem', r[0].como === 'sem origem');
r = roda([msg('e', 200, 'oi', '', { ctwa_clid: 'CL' })], []);
confere('anúncio da Meta pelo código', r[0].como === 'código do anúncio' && r[0].origem === 'anúncio Meta');
r = roda([msg('f', 60 * 24 * 3, 'oi antigo'), msg('f', 30, 'Olá! Vim pelo site da BMH', 'site')], []);
confere('volta em menos de 7 dias não é conversa nova', r.length === 0);
r = roda([msg('a', 30, 'Olá! Vim pelo site da BMH', 'site')], [], [{ chave: 'a'.padEnd(32, '0') + '|' + iso(30) }]);
confere('não refaz conversa já registrada', r.length === 0);
console.log(`${ok} de ${ok + falhas} casos certos`); process.exit(falhas ? 1 : 0);
