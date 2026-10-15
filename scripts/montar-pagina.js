#!/usr/bin/env node
/**
 * Monta uma página interna do site da BMH juntando o molde comum (site/paginas/_molde/) ao conteúdo dela
 * (site/paginas/fontes/<nome>.html). O resultado vai para site/paginas/<nome>.html, pronto para
 * scripts/wp-pagina-html.js (que resolve {{img:}}, {{wa:}} e {{svg:}}).
 *
 * Marcas do molde no arquivo-fonte:  {{molde:estilo}}  {{molde:cabecalho}}  {{molde:fim}}
 * O molde saiu da home versão 2 (08/10/2026): mudar o rodapé ou o menu ali vale para todas as páginas internas.
 *
 * Uso:  node scripts/montar-pagina.js <nome> [<nome> ...]
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const parte = (n) => fs.readFileSync(path.join(RAIZ, 'site/paginas/_molde', n + '.html'), 'utf8');

for (const nome of process.argv.slice(2)) {
  const fonte = fs.readFileSync(path.join(RAIZ, 'site/paginas/fontes', nome + '.html'), 'utf8');
  let html = fonte;
  for (const n of ['estilo', 'cabecalho', 'fim']) {
    if (!html.includes(`{{molde:${n}}}`)) throw new Error(`${nome}: falta {{molde:${n}}}`);
    html = html.replace(`{{molde:${n}}}`, () => parte(n));
  }
  // 15/10/2026: o WhatsApp da chamada final e da barra fixa usa a mensagem do assunto da página (o Tag Manager classifica
  // o caso pelo texto da mensagem); a fonte declara <!-- wa-da-pagina: chave -->, senão fica "geral"
  const chave = (fonte.match(/<!--\s*wa-da-pagina:\s*([a-z]+)\s*-->/) || [])[1] || 'geral';
  html = html.split('{{wa:pagina}}').join('{{wa:' + chave + '}}');
  const saida = path.join(RAIZ, 'site/paginas', nome + '.html');
  fs.writeFileSync(saida, html);
  console.log('montada:', path.relative(RAIZ, saida));
}
