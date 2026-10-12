#!/usr/bin/env node
/**
 * Observação das conversas do WhatsApp da BMH (61 3346-6005) por 1 mês, para desenhar o SDR (Jorge, 09/10/2026).
 * Cria ou atualiza, sem mostrar segredo nenhum:
 *   - tabela BMH_whatsapp_mensagens (as conversas, com o telefone: decisão do Jorge, 09/10/2026, "só a gente tem acesso")
 *   - credenciais "BMH · Evolution · instância BMH Recepção" (só apiwp.cannlink.com.br) e
 *     "BMH · OpenAI · transcrição de áudio" (só api.openai.com)
 *   - fluxo "BMH · WhatsApp · observa conversas" (recebe, transcreve áudio, grava; não guarda execução)
 *   - na Evolution: ajustes da instância (não marca como lida, não fica online, ignora grupos, traz histórico) e o webhook
 * A instância NUNCA envia mensagem. Uso: node --env-file=.env integracoes/whatsapp/montar.js [so-evolution]
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ARQ_IDS = path.join(__dirname, '..', 'painel', 'n8n-ids.json');
const IDS = JSON.parse(fs.readFileSync(ARQ_IDS, 'utf8'));
const salva = () => fs.writeFileSync(ARQ_IDS, JSON.stringify(IDS, null, 1));
const H = { 'X-N8N-API-KEY': process.env.N8N_API_KEY, 'Content-Type': 'application/json' };
const api = async (rota, metodo, corpo) => { const r = await fetch(process.env.N8N_URL + '/api/v1/' + rota, { method: metodo, headers: H, body: corpo ? JSON.stringify(corpo) : undefined }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(rota + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 300)); return j; };
const EVO = (process.env.EVOLUTION_URL || '').trim().replace(/\/$/, ''), TOKEN = (process.env.EVOLUTION_BMH_TOKEN || '').trim();
const INSTANCIA = 'BMH Recepção', INST = encodeURIComponent(INSTANCIA);
const evo = async (rota, corpo) => { const r = await fetch(`${EVO}/${rota}/${INST}`, { method: 'POST', headers: { apikey: TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(rota + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 300)); return j; };
const ler = (n) => fs.readFileSync(path.join(__dirname, n), 'utf8');

const COLUNAS = { chave: 's', momento: 's', dia: 's', telefone: 's', numero_oculto: 's', direcao: 's', aparelho: 's', tipo: 's', texto: 's', transcrito: 's', respondendo: 's', apagar_em: 's' };

async function tabelas() {
  IDS.tabelas = IDS.tabelas || {};
  const existentes = (await api('data-tables?limit=250', 'GET')).data || [];
  const garante = async (nome, colunas) => {
    const achou = existentes.find((t) => t.name === nome);
    if (achou) { IDS.tabelas[nome] = achou.id; return achou.id; }
    const r = await api('data-tables', 'POST', { name: nome, columns: colunas.map((name) => ({ name, type: 'string' })) });
    IDS.tabelas[nome] = r.id; console.log('tabela criada:', nome); return r.id;
  };
  await garante('BMH_whatsapp_mensagens', Object.keys(COLUNAS));
  salva();
}

async function credenciais() {
  IDS.credenciais = IDS.credenciais || {};
  const garante = async (nome, data) => {
    if (IDS.credenciais[nome]) return;
    const r = await api('credentials', 'POST', { name: nome, type: 'httpHeaderAuth', data });
    IDS.credenciais[nome] = r.id; salva(); console.log('credencial criada:', nome);
  };
  if (!TOKEN || !/^https:\/\/apiwp\.cannlink\.com\.br$/.test(EVO)) throw new Error('EVOLUTION_URL/EVOLUTION_BMH_TOKEN ausentes ou fora do servidor da clínica');
  await garante('BMH · Evolution · instância BMH Recepção', { name: 'apikey', value: TOKEN, allowedHttpRequestDomains: 'domains', allowedDomains: 'apiwp.cannlink.com.br' });
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY ausente');
  await garante('BMH · OpenAI · transcrição de áudio', { name: 'Authorization', value: 'Bearer ' + process.env.OPENAI_API_KEY, allowedHttpRequestDomains: 'domains', allowedDomains: 'api.openai.com' });
}

function fluxo() {
  let x = 0;
  const C = IDS.credenciais, T = IDS.tabelas;
  const cred = (nome) => ({ httpHeaderAuth: { id: C[nome], name: nome } });
  const no = (name, type, typeVersion, parameters, extra = {}) => ({ id: crypto.randomUUID(), name, type, typeVersion, position: [x++ * 260, extra._lin ? extra._lin * 200 : 0], parameters,
    ...(type === 'n8n-nodes-base.httpRequest' ? { retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 } : {}),   // rede: 3 tentativas, 5 s (12/10/2026)
    ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== '_lin')) });
  const tabela = (nome) => ({ __rl: true, value: T[nome], mode: 'id', cachedResultName: nome });
  IDS.whatsapp = IDS.whatsapp || {};
  IDS.whatsapp.caminho = IDS.whatsapp.caminho || 'bmh-whatsapp-' + crypto.randomBytes(12).toString('hex');   // endereço que ninguém adivinha
  const n = {
    recebe: no('Recebe da Evolution', 'n8n-nodes-base.webhook', 2, { httpMethod: 'POST', path: IDS.whatsapp.caminho, responseMode: 'onReceived', options: {} }, { webhookId: IDS.whatsapp.caminho }),
    prepara: no('Prepara a mensagem', 'n8n-nodes-base.code', 2, { jsCode: ler('prepara-mensagem.js') }),
    eAudio: no('É áudio?', 'n8n-nodes-base.if', 2.2, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, combinator: 'and',
      conditions: [{ id: crypto.randomUUID(), leftValue: '={{ $json.transcrever }}', rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }] }, options: {} }),
    midia: no('Evolution · baixa o áudio', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: `${EVO}/chat/getBase64FromMediaMessage/${INST}`, authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify({ message: { key: { id: $json.msg_id } }, convertToMp4: false }) }}', options: { timeout: 60000 } },
      { credentials: cred('BMH · Evolution · instância BMH Recepção'), onError: 'continueRegularOutput', _lin: 1 }),
    arquivo: no('Vira arquivo', 'n8n-nodes-base.convertToFile', 1.1, { operation: 'toBinary', sourceProperty: 'base64', binaryPropertyName: 'data', options: { fileName: 'audio.ogg', mimeType: 'audio/ogg' } }, { onError: 'continueRegularOutput', _lin: 1 }),
    transcreve: no('OpenAI · transcreve', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://api.openai.com/v1/audio/transcriptions', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, contentType: 'multipart-form-data', bodyParameters: { parameters: [
        { parameterType: 'formBinaryData', name: 'file', inputDataFieldName: 'data' }, { name: 'model', value: 'gpt-4o-transcribe' }, { name: 'language', value: 'pt' }] }, options: { timeout: 120000 } },
      { credentials: cred('BMH · OpenAI · transcrição de áudio'), onError: 'continueRegularOutput', _lin: 1 }),
    monta: no('Monta a linha', 'n8n-nodes-base.code', 2, { mode: 'runOnceForEachItem', jsCode: ler('monta-linha.js') }),
    grava: no('Grava a mensagem', 'n8n-nodes-base.dataTable', 1.1, {
      operation: 'upsert', dataTableId: tabela('BMH_whatsapp_mensagens'), filters: { conditions: [{ keyName: 'chave', keyValue: '={{ $json.chave }}' }] },
      columns: { mappingMode: 'defineBelow', value: Object.fromEntries(Object.keys(COLUNAS).map((k) => [k, `={{ $json.${k} }}`])), matchingColumns: [],
        schema: Object.keys(COLUNAS).map((k) => ({ id: k, displayName: k, required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false })) }, options: {} }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · WhatsApp · observa conversas\nInstância "BMH Recepção" (61 3346-6005) na Evolution da clínica, só leitura: nunca envia. Grava em BMH_whatsapp_mensagens a mensagem do paciente e a resposta da equipe, com o telefone (para cruzar com o iGut), sem grupos, com CPF apagado do texto. Áudio é transcrito (OpenAI). Apagar após apagar_em (6 meses). Decisão do Jorge em 09/10/2026. Não guarda execução (tem conversa de paciente).', width: 620, height: 220 }, { _lin: 2 }),
  };
  const cx = {};
  const liga = (de, para, saida = 0) => { cx[de.name] = cx[de.name] || { main: [] }; while (cx[de.name].main.length <= saida) cx[de.name].main.push([]); cx[de.name].main[saida].push({ node: para.name, type: 'main', index: 0 }); };
  liga(n.recebe, n.prepara); liga(n.prepara, n.eAudio);
  liga(n.eAudio, n.midia, 0); liga(n.eAudio, n.monta, 1);
  liga(n.midia, n.arquivo); liga(n.arquivo, n.transcreve); liga(n.transcreve, n.monta); liga(n.monta, n.grava);
  return { name: 'BMH · WhatsApp · observa conversas', nodes: Object.values(n), connections: cx,
    settings: { executionOrder: 'v1', timezone: 'America/Sao_Paulo', saveDataSuccessExecution: 'none', saveDataErrorExecution: 'none', ...(IDS.fluxos?.alerta ? { errorWorkflow: IDS.fluxos.alerta } : {}) } };
}

async function publicaFluxo() {
  const f = fluxo();
  if (!/^BMH · /.test(f.name)) throw new Error('nome sem BMH');
  IDS.fluxos = IDS.fluxos || {};
  let id = IDS.fluxos.whatsapp;
  if (id) { await api('workflows/' + id, 'PUT', f); console.log('fluxo atualizado:', f.name); }
  else { const r = await api('workflows', 'POST', f); id = IDS.fluxos.whatsapp = r.id; console.log('fluxo criado:', f.name, id); }
  salva();
  const tags = (await api('tags?limit=100', 'GET')).data || []; const tagBMH = tags.find((t) => t.name === 'BMH');
  if (tagBMH) await api(`workflows/${id}/tags`, 'PUT', [{ id: tagBMH.id }]);
  const atual = await api('workflows/' + id, 'GET');
  if (!atual.active) { await api(`workflows/${id}/activate`, 'POST'); console.log('  ligado'); }
}

async function configuraEvolution() {
  // ajustes antes de o celular conectar: nada de "lida", nada de "online" (o celular para de notificar), sem grupos, com histórico
  await evo('settings/set', { rejectCall: false, msgCall: '', groupsIgnore: true, alwaysOnline: false, readMessages: false, readStatus: false, syncFullHistory: true });
  console.log('instância ajustada: não marca lida, não fica online, ignora grupos, traz histórico');
  const url = process.env.N8N_URL.replace(/\/$/, '') + '/webhook/' + IDS.whatsapp.caminho;
  await evo('webhook/set', { webhook: { enabled: true, url, webhookByEvents: false, webhookBase64: false, events: ['MESSAGES_UPSERT'] } });
  console.log('webhook da instância apontado para o fluxo (só MESSAGES_UPSERT)');
}

(async () => {
  if (!process.argv.includes('so-evolution')) { await tabelas(); await credenciais(); await publicaFluxo(); }
  await configuraEvolution();
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
