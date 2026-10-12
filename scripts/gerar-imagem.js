#!/usr/bin/env node
/**
 * Gera imagem via API da OpenAI (gpt-image-1) e salva em PNG.
 *
 * Uso:
 *   node --env-file=.env scripts/gerar-imagem.js "PROMPT" "caminho/saida.png" [--formato carrossel|quadrado|paisagem] [--qualidade high|medium|low]
 *
 * Formatos:
 *   carrossel (padrao) -> 1080x1350  (gera 1024x1536 e recorta)
 *   quadrado           -> 1080x1080
 *   paisagem           -> 1350x1080
 *
 * Precisa de OPENAI_API_KEY no .env da raiz do projeto.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const flag = (nome, padrao) => {
  const i = args.indexOf('--' + nome);
  return i === -1 ? padrao : args[i + 1];
};
const posicionais = args.filter((a, i) =>
  !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))
);

const prompt = posicionais[0];
const saida = posicionais[1];
const formato = flag('formato', 'carrossel');
const qualidade = flag('qualidade', 'high');

if (!prompt || !saida) {
  console.error('Uso: node --env-file=.env scripts/gerar-imagem.js "PROMPT" "saida.png" [--formato carrossel|quadrado|paisagem] [--qualidade high|medium|low]');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY. Crie o .env na raiz com: OPENAI_API_KEY=sk-...');
  process.exit(1);
}

const FORMATOS = {
  carrossel: { size: '1024x1536', largura: 1080, altura: 1350 },
  quadrado:  { size: '1024x1024', largura: 1080, altura: 1080 },
  paisagem:  { size: '1536x1024', largura: 1350, altura: 1080 },
};
const cfg = FORMATOS[formato];
if (!cfg) {
  console.error('Formato invalido: ' + formato + '. Use carrossel, quadrado ou paisagem.');
  process.exit(1);
}

(async () => {
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: cfg.size,
      quality: qualidade,
      n: 1,
    }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    console.error('Erro da API OpenAI (' + resp.status + '): ' + erro.slice(0, 800));
    process.exit(1);
  }

  const dados = await resp.json();
  const b64 = dados.data && dados.data[0] && dados.data[0].b64_json;
  if (!b64) {
    console.error('Resposta sem imagem: ' + JSON.stringify(dados).slice(0, 500));
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, Buffer.from(b64, 'base64'));

  // Ajusta pro tamanho exato de publicacao: redimensiona pela largura e recorta centralizado.
  try {
    execFileSync('sips', ['--resampleWidth', String(cfg.largura), saida], { stdio: 'ignore' });
    execFileSync('sips', ['-c', String(cfg.altura), String(cfg.largura), saida], { stdio: 'ignore' });
  } catch (e) {
    console.error('Aviso: sips nao conseguiu ajustar o tamanho. PNG salvo no tamanho original da API.');
  }

  console.log('Imagem salva em ' + saida + ' (' + cfg.largura + 'x' + cfg.altura + ', qualidade ' + qualidade + ')');
})();
