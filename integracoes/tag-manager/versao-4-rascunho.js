// Monta na área de trabalho do Tag Manager da BMH (GTM-PQZ32BC5) a versão 4, SEM publicar.
// Só acrescenta: variáveis, 3 acionadores de clique e 3 eventos do GA4 para a propriedade da BMH (G-10HHN3PQP0).
// Não altera nem remove nenhuma tag existente. Uso: node --env-file=.env integracoes/tag-manager/versao-4-rascunho.js
const { chamar, ESCOPOS } = require('../../scripts/google-api.js');
const W = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers/172366934/workspaces/4';
const E = [ESCOPOS.gtmEditar];
const post = (rota, corpo) => chamar(W + rota, { escopos: E, metodo: 'POST', corpo });
const tpl = (key, value) => ({ type: 'template', key, value });
const GA4 = 'G-10HHN3PQP0';

const VAR_CASO = `function () {
  var u = {{Click URL}} || '';
  var t = '';
  try { t = decodeURIComponent((u.split('text=')[1] || '').replace(/\\+/g, ' ')).toLowerCase(); } catch (e) { t = ''; }
  if (!t) { return 'sem mensagem'; }
  if (t.indexOf('pós-operatório') > -1) { return 'pos-operatorio'; }
  if (t.indexOf('ferida') > -1) { return 'ferida'; }
  if (t.indexOf('pedido médico') > -1) { return 'pedido-medico'; }
  if (t.indexOf('mergulhador') > -1) { return 'mergulho'; }
  if (t.indexOf('encaminhar um paciente') > -1) { return 'cirurgiao'; }
  if (t.indexOf('unidade asa sul') > -1) { return 'unidade-asa-sul'; }
  if (t.indexOf('unidade taguatinga') > -1) { return 'unidade-taguatinga'; }
  if (t.indexOf('convênio') > -1) { return 'convenio'; }
  if (t.indexOf('dúvida') > -1) { return 'duvida'; }
  return 'geral';
}`;
const VAR_LOCAL = `function () {
  var e = {{Click Element}};
  if (!e || !e.closest) { return 'outro'; }
  if (e.closest('.bmh-fix')) { return 'barra-celular'; }
  if (e.closest('.bmh-tri')) { return 'triagem'; }
  if (e.closest('.bmh-head')) { return 'cabecalho'; }
  if (e.closest('.bmh-hero')) { return 'topo'; }
  if (e.closest('.bmh-foot')) { return 'rodape'; }
  if (e.closest('.bmh-final')) { return 'chamada-final'; }
  var s = e.closest('section[id]');
  if (s) { return s.id; }
  if (e.closest('.bmh')) { return 'secao'; }
  return 'pagina-antiga';
}`;
const VAR_UNIDADE = `function () {
  var u = ({{Click URL}} || '').toLowerCase();
  if (u.indexOf('taguatinga') > -1 || u.indexOf('-48.06') > -1) { return 'taguatinga'; }
  if (u.indexOf('sgas') > -1 || u.indexOf('asa') > -1 || u.indexOf('-47.9') > -1) { return 'asa-sul'; }
  return 'indefinida';
}`;

const filtro = (tipo, valor) => [{ type: tipo, parameter: [tpl('arg0', '{{Click URL}}'), tpl('arg1', valor)] }];
const acionador = (name, tipo, valor) => ({ name, type: 'linkClick', filter: filtro(tipo, valor),
  waitForTags: { type: 'boolean', value: 'false' }, checkValidation: { type: 'boolean', value: 'false' } });
const evento = (name, nomeEvento, params, triggerId) => ({ name, type: 'gaawe', firingTriggerId: [triggerId], parameter: [
  tpl('eventName', nomeEvento), tpl('measurementIdOverride', GA4), { type: 'boolean', key: 'sendEcommerceData', value: 'false' },
  { type: 'list', key: 'eventSettingsTable', list: params.map(([k, v]) => ({ type: 'map', map: [tpl('parameter', k), tpl('parameterValue', v)] })) },
] });

(async () => {
  for (const tipo of ['clickElement', 'clickClasses', 'clickText', 'pagePath']) {
    await chamar(W + '/built_in_variables?type=' + tipo, { escopos: E, metodo: 'POST' }).then(() => console.log('variável pronta ligada:', tipo)).catch((e) => console.log('variável pronta', tipo, e.message.slice(0, 80)));
  }
  for (const [nome, codigo] of [['BMH · Caso do botão (WhatsApp)', VAR_CASO], ['BMH · Local do botão', VAR_LOCAL], ['BMH · Unidade (como chegar)', VAR_UNIDADE]]) {
    const v = await post('/variables', { name: nome, type: 'jsm', parameter: [tpl('javascript', codigo)] });
    console.log('variável criada:', v.variableId, nome);
  }
  const tWa = await post('/triggers', acionador('BMH · Clique no WhatsApp', 'matchRegex', 'wa\\.me/|api\\.whatsapp\\.com'));
  const tTel = await post('/triggers', acionador('BMH · Clique no telefone', 'startsWith', 'tel:'));
  const tRota = await post('/triggers', acionador('BMH · Clique em como chegar', 'matchRegex', 'google\\.com/maps|maps\\.app\\.goo\\.gl|goo\\.gl/maps|waze\\.com|m\\.uber\\.com'));
  console.log('acionadores criados:', tWa.triggerId, tTel.triggerId, tRota.triggerId);
  const g1 = await post('/tags', evento('BMH · GA4 · clique_whatsapp', 'clique_whatsapp', [['caso', '{{BMH · Caso do botão (WhatsApp)}}'], ['local_do_botao', '{{BMH · Local do botão}}']], tWa.triggerId));
  const g2 = await post('/tags', evento('BMH · GA4 · clique_telefone', 'clique_telefone', [['local_do_botao', '{{BMH · Local do botão}}']], tTel.triggerId));
  const g3 = await post('/tags', evento('BMH · GA4 · clique_como_chegar', 'clique_como_chegar', [['unidade', '{{BMH · Unidade (como chegar)}}'], ['local_do_botao', '{{BMH · Local do botão}}']], tRota.triggerId));
  console.log('tags criadas:', g1.tagId, g2.tagId, g3.tagId);
  const st = await chamar(W + '/status', { escopos: E });
  console.log('mudanças na área de trabalho:', (st.workspaceChange || []).length, '· conflitos:', (st.mergeConflict || []).length);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
