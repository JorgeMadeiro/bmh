// Quando um fluxo da BMH falha, avisa no Telegram (robô BMH alertas): fluxo, etapa e erro. Sem dado de paciente
// (números longos, como telefone ou id, viram #).
const e = $json, wf = e.workflow || {}, ex = e.execution || {}, erro = ex.error || e.trigger?.error || {};
const texto = '⚠️ Falhou um fluxo da BMH\n\n' +
  'Fluxo: ' + String(wf.name || '?') + '\n' +
  'Etapa: ' + String(ex.lastNodeExecuted || erro.node?.name || '?') + '\n' +
  'Erro: ' + String(erro.message || 'erro sem mensagem').replace(/\d{8,}/g, '#').slice(0, 300) + '\n' +
  'Quando: ' + $now.setZone('America/Sao_Paulo').toFormat('dd/LL HH:mm') +
  (ex.url ? '\n' + ex.url : '');
return [{ json: { texto } }];
