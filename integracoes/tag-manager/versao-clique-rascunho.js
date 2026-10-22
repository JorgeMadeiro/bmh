// Monta na área de trabalho do Tag Manager da BMH (GTM-PQZ32BC5) a tag "BMH · origem do clique no WhatsApp" e cria uma
// versão, SEM publicar (22/10/2026, motor do Kommo). Publicar só com o "pode" do Jorge e o teste de antes e depois
// (scripts/testa-tags.js). Só acrescenta: nenhuma tag existente muda. Voltar atrás: publicar a versão anterior.
// Uso: node --env-file=.env integracoes/tag-manager/versao-clique-rascunho.js
const fs = require('fs'), path = require('path');
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');
const C = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers/172366934';
const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'painel', 'n8n-ids.json'), 'utf8'));
const NOME = 'BMH · origem do clique no WhatsApp';
(async () => {
  const html = fs.readFileSync(path.join(__dirname, 'tag-clique-whatsapp.html'), 'utf8').replace('__ENDERECO__', process.env.N8N_URL.replace(/\/$/, '') + '/webhook/' + IDS.origem.clique);
  if (html.includes('{{')) throw new Error('a tag tem "{{": o Tag Manager leria como variável');
  const ws = (await chamar(C + '/workspaces', { escopos: [ESCOPOS.gtmLer] })).workspace || [];
  const W = ws[0].path ? 'https://tagmanager.googleapis.com/tagmanager/v2/' + ws[0].path : null; if (!W) throw new Error('sem área de trabalho');
  const tags = (await chamar(W + '/tags', { escopos: [ESCOPOS.gtmLer] })).tag || [];
  let tag = tags.find((t) => t.name === NOME);
  const corpo = { name: NOME, type: 'html', parameter: [{ type: 'template', key: 'html', value: html }, { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }], firingTriggerId: ['2147479553'] };
  tag = tag ? await chamar(W + '/tags/' + tag.tagId, { escopos: [ESCOPOS.gtmEditar], metodo: 'PUT', corpo: { ...tag, ...corpo } }) : await chamar(W + '/tags', { escopos: [ESCOPOS.gtmEditar], metodo: 'POST', corpo });
  console.log('tag na área de trabalho:', tag.tagId, tag.name, '(dispara em todas as páginas)');
  const v = await chamar(W + ':create_version', { escopos: [ESCOPOS.gtmVersoes], metodo: 'POST', corpo: {
    name: 'Origem: registra o clique no WhatsApp com gclid e UTM (22/10/2026)',
    notes: 'Tag nova "' + NOME + '": guarda a chegada na sessão e manda ao n8n o clique no WhatsApp (sem dado pessoal). Nada mais muda. Voltar atrás: publicar a versão anterior.' } });
  const cv = v.containerVersion || {};
  console.log('versão criada, NÃO publicada:', cv.containerVersionId, cv.name, v.compilerError ? 'ERRO DE COMPILAÇÃO' : '');
})().catch((e) => { console.log('FALHA', e.message); process.exit(1); });
