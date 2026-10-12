#!/usr/bin/env node
// Prévia local do painel: coleta os números e injeta na página. Uso: node --env-file=.env integracoes/painel/previa.js [saida.html] [--inicio .. --fim ..]
const { execFileSync } = require('child_process');
const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2); const saida = args[0] && !args[0].startsWith('--') ? args[0] : 'saidas/painel/painel-previa.html';
const dados = execFileSync(process.execPath, [path.join(__dirname, 'coleta.js'), ...args.filter((a) => a !== saida)], { env: process.env, maxBuffer: 50e6 }).toString();
const pagina = fs.readFileSync(path.join(__dirname, 'pagina.html'), 'utf8').replace('/*__DADOS__*/null', () => dados.replace(/</g, '\\u003c'));
fs.mkdirSync(path.dirname(saida), { recursive: true }); fs.writeFileSync(saida, pagina); console.log('prévia:', saida);
