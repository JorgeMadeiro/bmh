// Monta na área de trabalho do Tag Manager da BMH (GTM-PQZ32BC5) a versão sem a Triunfo, SEM publicar (28/10/2026).
// Apaga as tags 15 "Tag Analytics" e 16 "Tag do Google" (as duas com o Analytics da agência, G-97ZBVMVR1Y), a 17
// "Google Analytics evento do GA4" (evento quebrado para o mesmo G-97ZBVMVR1Y) e a 13 "Clarity" (projeto m9kxjnnvgm,
// da agência, pausada desde a versão 7). Ficam a 12 (GT-57SF42Z: Analytics e Google Ads da BMH), a conversão do
// WhatsApp, os cliques, o pixel, o Clarity da BMH (yv1gceupsa) e a origem do clique.
// Uso: node --env-file=.env integracoes/tag-manager/versao-9-rascunho.js
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');
const W = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers/172366934/workspaces/9';
const SAEM = { 13: /m9kxjnnvgm/, 15: /G-97ZBVMVR1Y/, 16: /G-97ZBVMVR1Y/, 17: /G-97ZBVMVR1Y/ };
(async () => {
  for (const [id, confere] of Object.entries(SAEM)) {
    const tag = await chamar(`${W}/tags/${id}`, { escopos: [ESCOPOS.gtmLer] });
    if (!confere.test(JSON.stringify(tag.parameter))) throw new Error(`a tag ${id} não é mais a da agência; parei`);
  }
  for (const id of Object.keys(SAEM)) {
    await chamar(`${W}/tags/${id}`, { escopos: [ESCOPOS.gtmEditar], metodo: 'DELETE' });
    console.log('tag', id, 'apagada da área de trabalho');
  }
  const v = await chamar(W + ':create_version', { escopos: [ESCOPOS.gtmVersoes], metodo: 'POST', corpo: {
    name: 'Triunfo fora: sai o Analytics da agência e o Clarity antigo (28/10/2026)',
    notes: 'Apagadas as tags 15 e 16 (G-97ZBVMVR1Y), 17 (evento quebrado para G-97ZBVMVR1Y) e 13 (Clarity m9kxjnnvgm, '
      + 'pausada). Fica a 12 (GT-57SF42Z). Voltar atrás: publicar a versão 8.',
  } });
  const cv = v.containerVersion || {};
  console.log('versão criada (não publicada):', cv.containerVersionId, cv.name, v.compilerError ? 'ERRO DE COMPILAÇÃO' : '');
})().catch((e) => console.log('FALHA', e.message));
