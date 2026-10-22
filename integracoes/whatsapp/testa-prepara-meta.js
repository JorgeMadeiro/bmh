#!/usr/bin/env node
/**
 * Ensaio do recebedor oficial da Meta (22/10/2026): roda prepara-meta.js e monta-linha.js, os mesmos códigos dos nós do
 * n8n, com mensagens simuladas no formato do webhook da Meta. Nada vai ao n8n nem à Meta.
 * Uso: node integracoes/whatsapp/testa-prepara-meta.js
 */
const fs = require('fs'), path = require('path');
const ler = (n) => fs.readFileSync(path.join(__dirname, n), 'utf8');
const roda = (codigo, ctx) => new Function('$', '$json', `return (function(){${codigo}})()`)(ctx.$, ctx.$json);
const prepara = (body) => roda(ler('prepara-meta.js'), { $: () => ({ first: () => ({ json: { body } }) }) });
const monta = (base, text) => roda(ler('monta-linha.js'), { $: () => ({ item: { json: base } }), $json: { text } }).json;

const ts = Date.UTC(2026, 9, 26, 12) / 1000;   // 2026-10-26 12:00 UTC
const ent = (field, value) => ({ object: 'whatsapp_business_account', entry: [{ id: 'WABA', changes: [{ field, value: { messaging_product: 'whatsapp', metadata: { phone_number_id: '1' }, ...value } }] }] });
const casos = [
  ['paciente pelo anúncio de clique para WhatsApp', ent('messages', { contacts: [{ wa_id: '5561999990000' }], messages: [{ from: '5561999990000', id: 'wamid.A', timestamp: String(ts), type: 'text',
    text: { body: 'Olá! Vim pelo anúncio e quero saber da câmara' }, referral: { source_type: 'ad', source_id: '120000000001', headline: 'Pós-operatório', ctwa_clid: 'CLID123' } }] }),
    (r) => r.length === 1 && r[0].direcao === 'paciente' && r[0].ctwa_clid === 'CLID123' && r[0].anuncio_id === '120000000001'],   // a origem pela frase saiu daqui (22/10/2026): é da monta-meta.js, testada em testa-monta-meta.js
  ['áudio do paciente pede transcrição', ent('messages', { messages: [{ from: '5561999990000', id: 'wamid.B', timestamp: String(ts), type: 'audio', audio: { id: 'MID9' } }] }),
    (r) => r[0].transcrever === true && r[0].media_id === 'MID9' && monta(r[0], 'transcrito aqui').texto === 'transcrito aqui'],
  ['equipe respondeu pelo celular, CPF some', ent('smb_message_echoes', { message_echoes: [{ from: '556133466005', to: '5561999990000', id: 'wamid.C', timestamp: String(ts + 60), type: 'text',
    text: { body: 'Pode mandar o CPF 123.456.789-09?' }, context: { id: 'wamid.A' } }] }),
    (r) => r[0].direcao === 'equipe' && r[0].aparelho === 'celular' && r[0].respondendo === 'wamid.A' && monta(r[0]).texto.includes('[cpf]') && !monta(r[0]).texto.includes('123.456')],
  ['equipe respondeu pelo Kommo: só o "sent" vira linha', ent('messages', { statuses: [{ id: 'wamid.D', status: 'sent', timestamp: String(ts + 90), recipient_id: '5561999990000' },
    { id: 'wamid.D', status: 'delivered', timestamp: String(ts + 91), recipient_id: '5561999990000' }, { id: 'wamid.D', status: 'read', timestamp: String(ts + 95), recipient_id: '5561999990000' }] }),
    (r) => r.length === 1 && r[0].aparelho === 'kommo' && r[0].direcao === 'equipe'],
  ['reação e histórico ficam de fora', { object: 'whatsapp_business_account', entry: [{ changes: [
    { field: 'messages', value: { messages: [{ from: '5561999990000', id: 'wamid.E', timestamp: String(ts), type: 'reaction', reaction: { emoji: '👍' } }] } },
    { field: 'history', value: { history: [{}] } }] }] }, (r) => r.length === 0],
  ['outro objeto é ignorado', { object: 'page', entry: [] }, (r) => r.length === 0],
  ['guarda de 1 mês', ent('messages', { messages: [{ from: '5561999990000', id: 'wamid.F', timestamp: String(ts), type: 'text', text: { body: 'oi' } }] }),
    (r) => monta(r[0]).apagar_em === '2026-11-26' && monta(r[0]).dia === '2026-10-26'],
];
let falhas = 0;
for (const [nome, body, ok] of casos) {
  let r, passou = false;
  try { r = prepara(body).map((x) => x.json); passou = ok(r); } catch (e) { r = e.message; }
  if (!passou) falhas++;
  console.log(`${passou ? 'ok   ' : 'FALHA'} ${nome}${passou ? '' : ' -> ' + JSON.stringify(r).slice(0, 300)}`);
}
// a observação antiga continua com 6 meses
const antiga = monta({ msg_id: 'x', momento: '2026-10-26T12:00:00.000Z', dia: '2026-10-26', direcao: 'paciente', texto: 'oi' });
console.log(`${antiga.apagar_em === '2027-04-26' ? 'ok   ' : 'FALHA'} observação pela Evolution segue com 6 meses`); if (antiga.apagar_em !== '2027-04-26') falhas++;
console.log(falhas ? `${falhas} falha(s)` : 'tudo certo');
process.exit(falhas ? 1 : 0);
