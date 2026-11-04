// Monta na área de trabalho do Tag Manager da BMH (GTM-PQZ32BC5) a versão com o evento de contato do pixel da Meta, SEM
// publicar (03/11/2026, pedido do Jorge: "pode fazer o pixel já", proposta P5 de saidas/meta-ads-bmh-auditoria-2026-10-20.md).
// Só acrescenta duas tags: "Contact" no clique no WhatsApp (acionador 21, com o caso do botão) e no clique no telefone
// (acionador 22). As duas rodam depois da tag 14 (o pixel com o PageView). Nenhum dado da pessoa vai junto.
// Uso: node --env-file=.env integracoes/tag-manager/versao-10-rascunho.js
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');
const W = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers/172366934/workspaces/10';
const PIXEL = '1526867428059043';
const html = (canal, extra) => `<script>
// BMH · Meta · contato pelo ${canal} (03/11/2026): evento padrão Contact do pixel ${PIXEL}, sem dado da pessoa
if (window.fbq) fbq('trackSingle', '${PIXEL}', 'Contact', { canal: '${canal}'${extra} });
</script>`;
const TAGS = [
  { name: 'BMH · Meta · Contact no WhatsApp', gatilho: '21', codigo: html('whatsapp', ", caso: '{{BMH · Caso do botão (WhatsApp)}}'") },
  { name: 'BMH · Meta · Contact no telefone', gatilho: '22', codigo: html('telefone', '') },
];
(async () => {
  const atuais = await chamar(`${W}/tags`, { escopos: [ESCOPOS.gtmLer] });
  const pixel = (atuais.tag || []).find((t) => t.tagId === '14');
  if (!pixel || !JSON.stringify(pixel.parameter).includes(PIXEL)) throw new Error('a tag 14 não é mais o pixel da BMH; parei');
  for (const t of TAGS) {
    if ((atuais.tag || []).some((x) => x.name === t.name)) { console.log('já existe:', t.name); continue; }
    const r = await chamar(`${W}/tags`, { escopos: [ESCOPOS.gtmEditar], metodo: 'POST', corpo: {
      name: t.name, type: 'html', firingTriggerId: [t.gatilho], tagFiringOption: 'oncePerEvent',
      setupTag: [{ tagName: pixel.name }],
      parameter: [{ type: 'template', key: 'html', value: t.codigo }, { type: 'boolean', key: 'supportDocumentWrite', value: 'false' }],
    } });
    console.log('tag criada na área de trabalho:', r.tagId, r.name);
  }
  const v = await chamar(W + ':create_version', { escopos: [ESCOPOS.gtmVersoes], metodo: 'POST', corpo: {
    name: 'Meta: evento de contato no clique do WhatsApp e do telefone (03/11/2026)',
    notes: 'Duas tags novas (Contact do pixel 1526867428059043 nos acionadores 21 e 22, depois da tag 14). '
      + 'Nada mais muda. Voltar atrás: publicar a versão 9.',
  } });
  const cv = v.containerVersion || {};
  console.log('versão criada (não publicada):', cv.containerVersionId, cv.name, v.compilerError ? 'ERRO DE COMPILAÇÃO' : '');
})().catch((e) => console.log('FALHA', e.message));
