// Quando um fluxo da BMH falha: monta o aviso do Telegram (robô BMH alertas) e a linha da tabela BMH_falhas.
// Só fluxo, etapa e mensagem do erro, nunca o conteúdo do paciente: e-mail, CPF, telefone e números longos (id,
// telefone colado) viram marcadores, e a mensagem é cortada em 300 caracteres. Texto em HTML escapado (um "_" sem
// par no Markdown faz o Telegram recusar o aviso). Atualizado em 12/10/2026.
const e = $json, wf = e.workflow || {}, ex = e.execution || {}, erro = ex.error || e.trigger?.error || {};
const limpa = (s) => String(s)
  .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[e-mail]')
  .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]')
  .replace(/\(?\b\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}\b/g, '[telefone]')
  .replace(/\d{8,}/g, '#')
  .slice(0, 300);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fluxo = String(wf.name || '?'), etapa = String(ex.lastNodeExecuted || erro.node?.name || '?');
const msg = limpa(erro.message || 'erro sem mensagem');
const agora = $now.setZone('America/Sao_Paulo');
const texto = '⚠️ Falhou um fluxo da BMH\n\n' +
  'Fluxo: ' + esc(fluxo) + '\n' +
  'Etapa: ' + esc(etapa) + '\n' +
  'Erro: ' + esc(msg) + '\n' +
  'Quando: ' + agora.toFormat('dd/LL HH:mm') +
  (ex.url ? '\n' + esc(ex.url) : '');
return [{ json: { texto, quando: agora.toFormat('yyyy-LL-dd HH:mm:ss'), fluxo, fluxo_id: String(wf.id || ''), etapa, erro: msg, execucao: String(ex.id || '') } }];
