#!/usr/bin/env node
// Ensaio do recebedor oficial da Meta (22/10/2026): prepara-meta.js + monta-meta.js, os mesmos códigos dos nós, com
// webhooks simulados no formato da Meta. Nada vai ao n8n nem à Meta. Uso: node integracoes/whatsapp/testa-monta-meta.js
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ler = (n) => fs.readFileSync(path.join(__dirname, n), 'utf8');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'origem', 'frases.json'), 'utf8')).frases;
const prepara = (body) => new Function('$', 'return (function(){' + ler('prepara-meta.js') + '})()')(() => ({ first: () => ({ json: { body } }) }));
const monta = (itens) => new Function('$input', 'return (function(){' + ler('monta-meta.js').replace('/*__FRASES__*/[]', JSON.stringify(F)) + '})()')({ all: () => itens });
const ts = Date.UTC(2026, 9, 26, 12) / 1000;
const ent = (field, value) => ({ object: 'whatsapp_business_account', entry: [{ id: 'WABA', changes: [{ field, value: { messaging_product: 'whatsapp', metadata: { phone_number_id: '1' }, ...value } }] }] });
let ok = 0, falhas = 0; const confere = (n, c) => { if (c) ok++; else { falhas++; console.log('FALHOU:', n); } };
const pac = monta(prepara(ent('messages', { messages: [{ id: 'm1', from: '5561999998888', timestamp: String(ts), type: 'text', text: { body: 'Olá! Vim pelo Instagram da BMH e quero saber. Meu CPF é 123.456.789-09, fone (61) 99999-8888, ana@x.com' },
  referral: { source_type: 'ad', source_id: 'AD9', ctwa_clid: 'CLID9' } }] })))[0].json;
confere('telefone só em código', pac.telefone_hash === crypto.createHash('sha256').update('5561999998888').digest('hex') && !JSON.stringify(pac).includes('99999'));
confere('CPF, telefone e e-mail mascarados', /\[cpf\]/.test(pac.texto) && /\[telefone\]/.test(pac.texto) && /\[e-mail\]/.test(pac.texto) && !/123\.456/.test(pac.texto));
confere('origem pela lista única', pac.origem === 'Instagram da BMH');
confere('código do anúncio', pac.ctwa_clid === 'CLID9' && pac.anuncio_id === 'AD9');
confere('guarda de 1 mês', pac.apagar_em === '2026-11-26');
const eco = monta(prepara(ent('smb_message_echoes', { message_echoes: [{ id: 'e1', to: '5561999998888', timestamp: String(ts), type: 'text', text: { body: 'Olá! Vim pelo site da BMH' } }] })))[0].json;
confere('resposta da equipe não ganha origem', eco.direcao === 'equipe' && eco.origem === '' && eco.aparelho === 'celular');
const audio = monta(prepara(ent('messages', { messages: [{ id: 'a1', from: '5561999998888', timestamp: String(ts), type: 'audio', audio: { id: 'MID' } }] })))[0].json;
confere('áudio sem texto', audio.tipo === 'áudio' && audio.texto === '');
console.log(`${ok} de ${ok + falhas} casos certos`); process.exit(falhas ? 1 : 0);
