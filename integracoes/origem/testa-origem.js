#!/usr/bin/env node
// Ensaio do leitor de origem (22/10/2026): roda origem-kommo.js, o mesmo código do nó do n8n, com webhooks simulados do
// Kommo, uma frase de cada canal. Nada vai ao n8n nem ao Kommo. Uso: node integracoes/origem/testa-origem.js
const fs = require('fs'), path = require('path');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'frases.json'), 'utf8')).frases;
const codigo = fs.readFileSync(path.join(__dirname, 'origem-kommo.js'), 'utf8').replace('__FRASES__', JSON.stringify(F));
const roda = (body, cfg = {}) => new Function('$', `return (function(){${codigo}})()`)((no) => no === 'Config'
  ? { all: () => Object.entries(cfg).map(([chave, valor]) => ({ json: { chave, valor } })) } : { first: () => ({ json: { body } }) });
const plano = (t, extra = {}) => ({ 'message[add][0][text]': t, 'message[add][0][type]': 'incoming', 'message[add][0][entity_type]': 'lead', 'message[add][0][entity_id]': '101', 'message[add][0][contact_id]': '202', 'message[add][0][talk_id]': '7', 'message[add][0][created_at]': '1792700000', ...extra });
let ok = 0, falhas = 0; const confere = (nome, cond) => { if (cond) ok++; else { falhas++; console.log('FALHOU:', nome); } };
for (const f of F) { const r = roda(plano(f.mensagem.replace('{nome}', 'Ana Souza')))[0].json; confere('frase ' + f.chave, r.frase === f.chave); }
const ind = roda(plano('Olá! Vim pela indicação do Dr(a). Ana Souza e quero agendar uma avaliação.'))[0].json;
confere('nome do cirurgião', ind.cirurgiao_indicou === 'Ana Souza');
const ind2 = roda(plano('Ola, vim pela indicacao da Dra. Carla Mendes e quero agendar'))[0].json;
confere('indicação sem acento e "Dra."', ind2.frase === 'indicacao' && ind2.cirurgiao_indicou === 'Carla Mendes');
const dupla = encodeURIComponent(encodeURIComponent('Olá! Vim pelo Instagram do Dr. Jorge e quero saber sobre a câmara hiperbárica.'));
confere('Instagram codificado duas vezes', roda(plano(dupla))[0].json.frase === 'drjorge');
confere('dúvida não vira geral', roda(plano('Olá! Vim pelo site da BMH e tenho uma dúvida.'))[0].json.frase === 'duvida');
confere('texto livre fica sem origem', roda(plano('Bom dia, quanto custa a sessão?'))[0].json.frase === '');
const contato = roda(plano('Olá! Vim pelo site da BMH e gostaria de agendar uma avaliação.', { 'message[add][0][entity_type]': 'contact' }))[0].json;
confere('mensagem de contato não grava em lead', contato.lead_id === null && contato.patch === null);
confere('mensagem enviada é ignorada', roda(plano('Olá!', { 'message[add][0][type]': 'outgoing' })).length === 0);
const ensaio = roda(plano('Olá! Vim pelo Instagram da BMH e quero saber.'))[0].json;
confere('ensaio por padrão', ensaio.modo === 'ensaio' && /ensaio/.test(ensaio.acao));
const real = roda(plano('Olá! Encontrei a BMH no Google e quero saber.'), { origem_modo: 'real', kommo_campos: JSON.stringify({ origem: 11, utm_source: 12, utm_medium: 13, utm_content: 15 }) })[0].json;
confere('real monta o PATCH com os ids', real.acao === 'gravar no lead' && real.patch[0].custom_fields_values.length === 4 && real.patch[0].custom_fields_values[0].field_id === 11 && real.patch[0]._embedded.tags[0].name === 'google');
const aninhado = roda({ message: { add: [{ text: 'Olá! Sou mergulhador e quero agendar uma avaliação.', type: 'incoming', entity_type: 'lead', entity_id: '9' }] } })[0].json;
confere('corpo já aninhado', aninhado.frase === 'mergulho' && aninhado.lead_id === 9);
console.log(`${ok} de ${ok + falhas} casos certos`); process.exit(falhas ? 1 : 0);
