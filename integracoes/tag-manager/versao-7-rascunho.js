// Monta na área de trabalho do Tag Manager da BMH (GTM-PQZ32BC5) a versão 7, SEM publicar.
// Só pausa a tag 13 "Clarity" (projeto m9kxjnnvgm, da agência). Fica a tag 28 com o projeto da BMH (yv1gceupsa).
// Uso: node --env-file=.env integracoes/tag-manager/versao-7-rascunho.js
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');
const W = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers/172366934/workspaces/7';
(async () => {
  const tag = await chamar(W + '/tags/13', { escopos: [ESCOPOS.gtmLer] });
  if (!/m9kxjnnvgm/.test(JSON.stringify(tag.parameter))) throw new Error('a tag 13 não é mais o Clarity da agência; parei');
  tag.paused = true;
  const r = await chamar(W + '/tags/13', { escopos: [ESCOPOS.gtmEditar], metodo: 'PUT', corpo: tag });
  console.log('tag 13 pausada:', r.paused === true);
  const v = await chamar(W + ':create_version', { escopos: [ESCOPOS.gtmVersoes], metodo: 'POST', corpo: {
    name: 'Clarity: pausa o projeto antigo da agência, fica o da BMH (09/10/2026)',
    notes: 'Tag 13 (m9kxjnnvgm) pausada. Tag 28 (yv1gceupsa) segue. Voltar atrás: publicar a versão 6.',
  } });
  const cv = v.containerVersion || {};
  console.log('versão criada (não publicada):', cv.containerVersionId, cv.name, v.compilerError ? 'ERRO DE COMPILAÇÃO' : '');
})().catch((e) => console.log('FALHA', e.message));
