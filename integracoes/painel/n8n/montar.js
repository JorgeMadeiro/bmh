#!/usr/bin/env node
/**
 * Cria ou atualiza no n8n os fluxos da BMH, a partir dos arquivos desta pasta:
 *   "BMH · Alerta de falha"                  (fluxo de erro de todos os outros: avisa no Telegram)
 *   "BMH · Painel · grava o dia"             (6h10: Google Ads, Analytics e Search Console → tabelas BMH_*)
 *   "BMH · Painel (página)"                  (/webhook/bmh-painel com login: lê as tabelas e entrega integracoes/painel/pagina.html)
 *   "BMH · iGut · atendimentos do dia"       (3h20: sessões e produzido por dia e unidade)
 *   "BMH · Anúncios · guardião diário"       (7h30: regras do Google Ads; propostas no Telegram com Aplicar/Ignorar)
 *   "BMH · Telegram · botões"                (recebe o Aplicar/Ignorar do robô BMH alertas)
 *   "BMH · Telegram · resumo da manhã"       (8h: ontem e o mês até ontem)
 * Ids de credenciais e tabelas em integracoes/painel/n8n-ids.json; os ids dos fluxos são gravados lá depois de criados.
 * Só mexe em fluxos com nome "BMH · ...". Uso: node --env-file=.env integracoes/painel/n8n/montar.js
 */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const AQUI = __dirname, RAIZ = path.join(AQUI, '..');
const IDS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'n8n-ids.json'), 'utf8'));
const H = { 'X-N8N-API-KEY': process.env.N8N_API_KEY, 'Content-Type': 'application/json' };
const api = async (rota, metodo, corpo) => { const r = await fetch(process.env.N8N_URL + '/api/v1/' + rota, { method: metodo, headers: H, body: corpo ? JSON.stringify(corpo) : undefined }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(rota + ' ' + r.status + ' ' + JSON.stringify(j).slice(0, 300)); return j; };
const ler = (n) => fs.readFileSync(path.join(AQUI, n), 'utf8');
const C = IDS.credenciais, T = IDS.tabelas;
const cred = (tipo, nome) => ({ [tipo]: { id: C[nome], name: nome } });
const GOOGLE = cred('googleApi', 'BMH · Google (conta de serviço) · Search Console e Analytics');
const ADS = cred('httpCustomAuth', 'BMH · Google Ads (renovação do acesso)');
const LOGIN = cred('httpBasicAuth', 'BMH · Painel (login)');
const TG = cred('telegramApi', 'BMH · Telegram (robô BMH alertas)'), CHAT = '8708228589';
const telegram = (name, texto, extra = {}) => no(name, 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: texto, additionalFields: { appendAttribution: false } }, { credentials: TG, ...extra });
const se = (name, expr) => no(name, 'n8n-nodes-base.if', 2.2, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, combinator: 'and',
  conditions: [{ id: crypto.randomUUID(), leftValue: expr, rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }] }, options: {} });
// todo fluxo da BMH avisa no Telegram quando falha (o próprio alerta não aponta para si)
const ajustes = (extra = {}) => ({ executionOrder: 'v1', timezone: 'America/Sao_Paulo', saveDataErrorExecution: 'all', executionTimeout: 3600, ...(IDS.fluxos?.alerta ? { errorWorkflow: IDS.fluxos.alerta } : {}), ...extra });
let x = 0; const pos = (col, lin) => [col * 260, lin * 180];
// rede: toda chamada HTTP com 3 tentativas a cada 5 s (12/10/2026). Quem não pode repetir (envio a grupo, inserção de
// linha, disparo de outro fluxo) passa retryOnFail: false, porque repetir depois de um tempo esgotado pode duplicar.
const REDE = { retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 };
const no = (name, type, typeVersion, parameters, extra = {}) => ({ id: crypto.randomUUID(), name, type, typeVersion, position: pos(x++, 0), parameters, ...(type === 'n8n-nodes-base.httpRequest' ? REDE : {}), ...extra });
const codigo = (name, arq, extra = {}) => no(name, 'n8n-nodes-base.code', 2, { jsCode: ler(arq) }, extra);
const tabela = (nome) => ({ __rl: true, value: T[nome], mode: 'id', cachedResultName: nome });
const COLUNAS = {
  BMH_google_anuncios_dia: { chave: 's', dia: 's', ad_id: 's', campanha: 's', grupo: 's', gasto: 'n', impressoes: 'n', cliques: 'n', contatos: 'n', ligacoes: 'n', atualizado_em: 's' },
  BMH_google_parcela_dia: { chave: 's', dia: 's', campanha: 's', impressoes: 'n', parcela: 'n', perdida_orcamento: 'n', perdida_posicao: 'n' },
  BMH_site_cliques_dia: { chave: 's', dia: 's', canal: 's', fonte: 's', meio: 's', campanha_ads: 's', pagina: 's', tipo: 's', cliques: 'n' },
  BMH_organico_diario: { chave: 's', dia: 's', fonte: 's', metrica: 's', valor: 'n' },
  BMH_horas: { chave: 's', dia: 's', dia_semana: 'n', hora: 'n', cliques: 'n' },
  BMH_igut_dia: { chave: 's', dia: 's', unidade: 's', atendimentos: 'n', pacientes: 'n', valor: 'n' },
  BMH_financeiro_mes: { chave: 's', mes: 's', unidade: 's', convenio: 's', sessoes: 'n', produzido: 'n', faturado: 'n', a_faturar: 'n', recebido: 'n', a_receber: 'n', glosado: 'n', atualizado_em: 's' },
  BMH_financeiro_detalhe: { chave: 's', mes: 's', unidade: 's', convenio: 's', situacao: 's', lote: 's', sessoes: 'n', valor: 'n', glosa: 'n', dias: 's', atualizado_em: 's' },
  BMH_financeiro_paciente: { chave: 's', mes: 's', unidade: 's', convenio: 's', situacao: 's', lote: 's', paciente_id: 's', paciente: 's', sessoes: 'n', valor: 'n', dias: 's', medicos: 's', atualizado_em: 's' },
  BMH_diretoria_pedido: { chave: 's', pedido: 's' },   // hora (ms) do último toque em "Atualizar agora" (trava para todos, 20/10/2026)
  BMH_prazo_recebimento: { chave: 's', mes: 's', unidade: 's', convenio: 's', valor_pago: 'n', dias_x_valor: 'n', sessoes_pagas: 'n', atualizado_em: 's' },
  BMH_operacao_camara: { chave: 's', dia: 's', unidade: 's', camara: 's', agendadas: 'n', atendidas: 'n', faltas: 'n', cobradas: 'n', lugares: 'n', atualizado_em: 's' },   // 22/10/2026: mono × multi na Operação
  BMH_operacao_conv: { chave: 's', dia: 's', unidade: 's', convenio: 's', agendadas: 'n', atendidas: 'n', faltas: 'n', cobradas: 'n', avaliacoes_agendadas: 'n', avaliacoes_feitas: 'n', atualizado_em: 's' },   // 20/10/2026: filtro de convênio na Operação
  BMH_operacao_dia: { chave: 's', dia: 's', unidade: 's', agendadas: 'n', atendidas: 'n', faltas: 'n', cobradas: 'n', lugares: 'n', avaliacoes_agendadas: 'n', avaliacoes_feitas: 'n', atualizado_em: 's' },
  BMH_radar_paginas: { chave: 's', nome: 's', hash: 's', texto: 's', visto_em: 's' },
  BMH_radar_itens: { chave: 's', fonte: 's', titulo: 's', visto_em: 's' },
  BMH_vigia: { chave: 's', nome: 's', ultima_vez: 's', max_horas: 'n', avisado_em: 's' },
  BMH_avaliacoes_google: { chave: 's', codigo: 's', review_name: 's', unidade: 's', estrelas: 'n', avaliada_em: 's', sugestao: 's', status: 's', message_id: 's', decidido_por: 's', publicada: 's', atualizado_em: 's' },
  BMH_guardiao_registro: Object.fromEntries(['chave', 'data', 'regra', 'plataforma', 'tipo', 'alvo_id', 'alvo', 'acao', 'valor_antes', 'valor_novo', 'modo', 'resultado', 'detalhe'].map((k) => [k, 's'])),
};
const grava = (name, nome) => no(name, 'n8n-nodes-base.dataTable', 1.1, {
  operation: 'upsert', dataTableId: tabela(nome), filters: { conditions: [{ keyName: 'chave', keyValue: '={{ $json.chave }}' }] },
  columns: { mappingMode: 'defineBelow', value: Object.fromEntries(Object.keys(COLUNAS[nome]).map((k) => [k, `={{ $json.${k} }}`])), matchingColumns: [],
    schema: Object.entries(COLUNAS[nome]).map(([k, t]) => ({ id: k, displayName: k, required: false, defaultMatch: false, display: true, type: t === 'n' ? 'number' : 'string', readOnly: false, removed: false })) },
  options: {} });
const le = (name, nome) => no(name, 'n8n-nodes-base.dataTable', 1.1, { operation: 'get', dataTableId: tabela(nome), returnAll: true }, { alwaysOutputData: true, executeOnce: true });
const http = (name, url, corpoExpr, extra = {}) => no(name, 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url, authentication: 'predefinedCredentialType', nodeCredentialType: 'googleApi', sendBody: true, specifyBody: 'json', jsonBody: corpoExpr, options: { timeout: 120000 } },
  { credentials: GOOGLE, executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput', ...extra });
const liga = (cx, de, para) => { (cx[de] ||= { main: [[]] }).main[0].push({ node: para, type: 'main', index: 0 }); };
const GA4 = 'https://analyticsdata.googleapis.com/v1beta/properties/418169293:runReport';
const datas = "dateRanges: [{ startDate: $('Quais dias').first().json.ini, endDate: $('Quais dias').first().json.fim }]";

// ---------------- fluxo 1: grava o dia ----------------
function fluxoGrava() {
  x = 0;
  const n = {
    agenda: no('Todo dia às 6h10', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '10 6 * * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-painel-grava', options: {} }, { webhookId: crypto.randomUUID() }),
    dias: codigo('Quais dias', 'quais-dias.js'),
    token: no('Google Ads · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    ads: codigo('Google Ads · anúncios', 'ads-anuncios.js'),
    gravaAds: grava('Grava anúncios', 'BMH_google_anuncios_dia'),
    parc: codigo('Google Ads · parcela', 'ads-parcela.js'),
    gravaParc: grava('Grava parcela', 'BMH_google_parcela_dia'),
    gaCli: http('Analytics · cliques', GA4, "={{ JSON.stringify({ " + datas + ", dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }, { name: 'sessionSource' }, { name: 'sessionMedium' }, { name: 'sessionGoogleAdsCampaignName' }, { name: 'landingPage' }, { name: 'linkDomain' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'click' } } }, limit: 100000 }) }}"),
    gaVis: http('Analytics · visitas por canal', GA4, "={{ JSON.stringify({ " + datas + ", dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 100000 }) }}"),
    gaHor: http('Analytics · horas', GA4, "={{ JSON.stringify({ " + datas + ", dimensions: [{ name: 'date' }, { name: 'dayOfWeek' }, { name: 'hour' }, { name: 'linkDomain' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'click' } } }, limit: 100000 }) }}"),
    gsc: http('Search Console · por dia', 'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fhiperbaricabrasilia.com.br%2F/searchAnalytics/query', "={{ JSON.stringify({ startDate: $('Quais dias').first().json.ini, endDate: $('Quais dias').first().json.fim, dimensions: ['date'], rowLimit: 1000 }) }}"),
    site: codigo('Monta site', 'monta-site.js'), gravaSite: grava('Grava site', 'BMH_site_cliques_dia'),
    org: codigo('Monta orgânico', 'monta-organico.js'), gravaOrg: grava('Grava orgânico', 'BMH_organico_diario'),
    hor: codigo('Monta horas', 'monta-horas.js'), gravaHor: grava('Grava horas', 'BMH_horas'),
    // Perfil da Empresa no Google (aprovado em 14/10/2026): mesma autorização do Google Ads (tem business.manage)
    perfis: no('Perfis do Google', 'n8n-nodes-base.code', 2, { jsCode: "return [{ unidade: 'Asa Sul', fonte: 'perfil_google_asa_sul', id: '15026912528968655315' }, { unidade: 'Taguatinga', fonte: 'perfil_google_taguatinga', id: '6381458115148112648' }].map((json) => ({ json }));" }),
    perfil: no('Perfil do Google · números', 'n8n-nodes-base.httpRequest', 4.2, { method: 'GET',
      url: "={{ (() => { const q = $('Quais dias').first().json, a = q.ini.split('-').map(Number), b = q.fim.split('-').map(Number); return 'https://businessprofileperformance.googleapis.com/v1/locations/' + $json.id + ':fetchMultiDailyMetricsTimeSeries?' + ['CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'WEBSITE_CLICKS', 'BUSINESS_CONVERSATIONS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS'].map((m) => 'dailyMetrics=' + m).join('&') + '&dailyRange.startDate.year=' + a[0] + '&dailyRange.startDate.month=' + a[1] + '&dailyRange.startDate.day=' + a[2] + '&dailyRange.endDate.year=' + b[0] + '&dailyRange.endDate.month=' + b[1] + '&dailyRange.endDate.day=' + b[2]; })() }}",
      sendHeaders: true, headerParameters: { parameters: [{ name: 'Authorization', value: "={{ 'Bearer ' + $('Google Ads · renova o acesso').first().json.access_token }}" }] }, options: { timeout: 60000 } }, { onError: 'continueRegularOutput', alwaysOutputData: true }),
    montaPerfil: codigo('Monta perfil do Google', 'perfil-google.js', { executeOnce: true }), gravaPerfil: grava('Grava perfil do Google', 'BMH_organico_diario'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Painel · grava o dia\n**Traz:** Google Ads, Analytics, Search Console e Perfil do Google (últimos 28 dias)\n**Envia:** tabelas BMH_* do painel de anúncios\n**Limites:** só números; regrava a janela (não duplica); nada de paciente\n\nTodo dia às 6h10 regrava os últimos 28 dias (o Google ainda ajusta conversões). Manual: /webhook/bmh-painel-grava?dias=N ou ?desde=AAAA-MM-DD&ate=AAAA-MM-DD (blocos de até 90 dias).\nTabelas BMH_*; a página (BMH · Painel) só lê. Perfil do Google (ligações, rotas, cliques no site, exibições) por unidade e somado em BMH_organico_diario, fonte perfil_google*. Código em integracoes/painel/n8n/ no workspace da BMH. Só números, sem dado de paciente.', width: 520, height: 240 }),
  };
  const cx = {};
  liga(cx, n.agenda.name, n.dias.name); liga(cx, n.manual.name, n.dias.name);
  liga(cx, n.dias.name, n.token.name); liga(cx, n.token.name, n.ads.name); liga(cx, n.ads.name, n.gravaAds.name); liga(cx, n.token.name, n.parc.name); liga(cx, n.parc.name, n.gravaParc.name);
  liga(cx, n.dias.name, n.gaCli.name); liga(cx, n.gaCli.name, n.gaVis.name); liga(cx, n.gaVis.name, n.gaHor.name); liga(cx, n.gaHor.name, n.gsc.name);
  for (const [a, b] of [[n.site, n.gravaSite], [n.org, n.gravaOrg], [n.hor, n.gravaHor]]) { liga(cx, n.gsc.name, a.name); liga(cx, a.name, b.name); }
  for (const [a, b] of [[n.token, n.perfis], [n.perfis, n.perfil], [n.perfil, n.montaPerfil], [n.montaPerfil, n.gravaPerfil]]) liga(cx, a.name, b.name);
  return { name: 'BMH · Painel · grava o dia', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- fluxo 3: iGut ----------------
function fluxoIgut() {
  x = 0;
  const IGUT = cred('httpCustomAuth', 'BMH · iGut (acesso)');
  const n = {
    agenda: no('Todo dia às 3h20', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '20 3 * * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-igut-dia', options: {} }, { webhookId: crypto.randomUUID() }),
    dias: codigo('Quais dias', 'igut-quais-dias.js'),
    igut: no('iGut · produção', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://api.igut.med.br/v2/businessintelligences/producao', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth',
      sendBody: true, specifyBody: 'json', jsonBody: "={{ JSON.stringify({ 'Agendamento.data': $('Quais dias').first().json.ini, 'Agendamento.data_fim': $('Quais dias').first().json.fim }) }}", options: { timeout: 180000 } }, { credentials: IGUT, executeOnce: true }),
    monta: codigo('Monta atendimentos', 'igut-monta.js'),
    grava: grava('Grava atendimentos', 'BMH_igut_dia'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · iGut · atendimentos do dia\n**Traz:** atendimentos do dia no iGut\n**Envia:** BMH_igut_dia\n**Limites:** só totais, sem nome de paciente\n\nTodo dia às 3h20 regrava os últimos 7 dias: sessões realizadas e pacientes distintos por dia e unidade (produção do iGut; linhas de faturamento não contam). Só contagens, sem nome nem id de paciente. Manual: /webhook/bmh-igut-dia?dias=N ou ?desde&ate. Alimenta "Atendidos no iGut" do painel.', width: 520, height: 200 }),
  };
  const cx = {};
  liga(cx, n.agenda.name, n.dias.name); liga(cx, n.manual.name, n.dias.name); liga(cx, n.dias.name, n.igut.name); liga(cx, n.igut.name, n.monta.name); liga(cx, n.monta.name, n.grava.name);
  return { name: 'BMH · iGut · atendimentos do dia', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };
}

// ---------------- fluxo 4: guardião ----------------
function fluxoGuardiao() {
  x = 0;
  const n = {
    agenda: no('Todo dia às 7h30', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '30 7 * * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-guardiao', options: {} }, { webhookId: crypto.randomUUID() }),
    quando: codigo('Quando', 'guardiao-quando.js'),
    config: le('Config', 'BMH_config'),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    decide: codigo('Decide', 'guardiao-decide.js'),
    aplica: codigo('Aplica (só no modo real)', 'guardiao-aplica.js'),
    registro: codigo('Prepara o registro', 'guardiao-registro.js'),
    grava: grava('Registra', 'BMH_guardiao_registro'),
    tg: codigo('Monta as mensagens', 'guardiao-telegram.js'),
    temBotao: se('Tem botão?', '={{ $json.botoes }}'),
    comBotao: no('Telegram · proposta', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false }, replyMarkup: 'inlineKeyboard',
      inlineKeyboard: { rows: [{ row: { buttons: [{ text: '✅ Aplicar', additionalFields: { callback_data: '=gd:{{ $json.id }}:a' } }, { text: '⏭️ Ignorar', additionalFields: { callback_data: '=gd:{{ $json.id }}:i' } }] } }] } }, { credentials: TG }),
    semBotao: telegram('Telegram · aviso', '={{ $json.texto }}'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Anúncios · guardião diário\n**Traz:** Google Ads (3 dias e o mês)\n**Envia:** propostas no Telegram com Aplicar/Ignorar; aplica só pausa ou orçamento menor\n**Limites:** nunca sobe verba; respeita o teto do mês; concorrentes fora até 05/11\n\nTodo dia às 7h30, só Google Ads (adaptado do guardião da Nexo). Regras: R$ 40 em 3 dias sem contato → pausa o grupo; orçamento que leva o mês acima do teto (BMH_config teto_mes) → corta na proporção; teto atingido → pausa; anúncio reprovado e alteração de outra pessoa → avisa. Modo por regra em BMH_config: guardiao_modo_teto e guardiao_modo_pausa (simulacao | real). Manual: /webhook/bmh-guardiao?teste=1 (não grava nem aplica). O painel mostra os 3 últimos dias. No Telegram (robô BMH alertas): avisos numa mensagem e cada proposta com Aplicar/Ignorar (fluxo BMH · Telegram · botões).', width: 560, height: 260 }),
  };
  const cx = {};
  liga(cx, n.agenda.name, n.quando.name); liga(cx, n.manual.name, n.quando.name);
  for (const [a, b] of [[n.quando, n.config], [n.config, n.token], [n.token, n.decide], [n.decide, n.aplica], [n.aplica, n.registro], [n.registro, n.grava], [n.aplica, n.tg], [n.tg, n.temBotao]]) liga(cx, a.name, b.name);
  cx[n.temBotao.name] = { main: [[{ node: n.comBotao.name, type: 'main', index: 0 }], [{ node: n.semBotao.name, type: 'main', index: 0 }]] };
  return { name: 'BMH · Anúncios · guardião diário', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- fluxo 2: página ----------------
function fluxoPagina() {
  x = 0;
  const html = fs.readFileSync(path.join(RAIZ, 'pagina.html'), 'utf8');
  if (!html.includes('/*__DADOS__*/null')) throw new Error('pagina.html sem o marcador de dados');
  if (html.includes('{' + '{')) throw new Error('pagina.html tem duas chaves seguidas: o n8n ia tratar como expressão');
  const corpo = '=' + html.replace('/*__DADOS__*/null', () => "{{ JSON.stringify($json).replace(/</g, '\\\\u003c') }}");
  const n = {
    painel: no('Painel', 'n8n-nodes-base.webhook', 2, { path: 'bmh-painel', authentication: 'basicAuth', responseMode: 'responseNode', options: {} }, { webhookId: crypto.randomUUID(), credentials: LOGIN }),
    config: le('Config', 'BMH_config' in T ? 'BMH_config' : 'BMH_config'),
    periodo: codigo('Qual período', 'qual-periodo.js'),
    ads: le('Anúncios (tabela)', 'BMH_google_anuncios_dia'), parc: le('Parcela (tabela)', 'BMH_google_parcela_dia'), site: le('Site · cliques (tabela)', 'BMH_site_cliques_dia'),
    org: le('Orgânico (tabela)', 'BMH_organico_diario'), hor: le('Horas (tabela)', 'BMH_horas'), igut: le('iGut (tabela)', 'BMH_igut_dia'), guard: le('Guardião (tabela)', 'BMH_guardiao_registro'),
    monta: codigo('Monta os dados', 'monta-os-dados.js'),
    json: no('Pede JSON?', 'n8n-nodes-base.if', 2.2, { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, combinator: 'and',
      conditions: [{ id: crypto.randomUUID(), leftValue: "={{ $('Painel').first().json.query.formato }}", rightValue: 'json', operator: { type: 'string', operation: 'equals' } }] }, options: {} }),
    entregaJson: no('Entrega os dados (JSON)', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'firstIncomingItem', options: { responseHeaders: { entries: [{ name: 'Cache-Control', value: 'no-store' }] } } }),
    entrega: no('Entrega a página', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'text', responseBody: corpo, options: { responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }] } } }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Painel (página)\n**Traz:** tabelas do painel\n**Envia:** a página do painel, com login\n**Limites:** só lê\n\nPágina do painel da BMH, igual à da Nexo (fluxo bKst8atLrI4rB2DM). Login: credencial "BMH · Painel (login)". ?formato=json devolve só os dados.\nLê as tabelas BMH_* gravadas às 6h10 (BMH · Painel · grava o dia). Página e código em integracoes/painel/ no workspace da BMH (montar.js reenvia).', width: 520, height: 200 }),
  };
  const cx = {};
  const ordem = [n.painel, n.config, n.periodo, n.ads, n.parc, n.site, n.org, n.hor, n.igut, n.guard, n.monta, n.json];
  for (let i = 0; i < ordem.length - 1; i++) liga(cx, ordem[i].name, ordem[i + 1].name);
  cx[n.json.name] = { main: [[{ node: n.entregaJson.name, type: 'main', index: 0 }], [{ node: n.entrega.name, type: 'main', index: 0 }]] };
  return { name: 'BMH · Painel (página)', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };
}

// ---------------- fluxo 5: alerta de falha ----------------
// Precisa estar ATIVO (esteve desligado de 08 a 12/10/2026 e nenhum alerta saiu). Grava em BMH_falhas (só fluxo, etapa e
// mensagem mascarada) e avisa no Telegram em HTML. Não guarda execução com sucesso: ela traria o erro cru, sem máscara.
function fluxoAlerta() {
  x = 0;
  const COL = ['quando', 'fluxo', 'fluxo_id', 'etapa', 'erro', 'execucao'];
  const n = {
    gatilho: no('Quando um fluxo da BMH falhar', 'n8n-nodes-base.errorTrigger', 1, {}),
    monta: codigo('Monta o alerta', 'alerta-falha.js'),
    registra: no('Registra a falha', 'n8n-nodes-base.dataTable', 1.1, { operation: 'insert', dataTableId: tabela('BMH_falhas'),
      columns: { mappingMode: 'defineBelow', value: Object.fromEntries(COL.map((k) => [k, `={{ $json.${k} }}`])), matchingColumns: [],
        schema: COL.map((k) => ({ id: k, displayName: k, required: false, defaultMatch: false, display: true, type: 'string', readOnly: false, removed: false })) }, options: {} },
      { alwaysOutputData: true, onError: 'continueRegularOutput' }),
    envia: no('Avisa no Telegram', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: "={{ $('Monta o alerta').first().json.texto }}", additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, { credentials: TG, ...REDE }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Alerta de falha\n**Traz:** a falha de qualquer fluxo BMH\n**Envia:** aviso no Telegram e linha em BMH_falhas\n**Limites:** mascara telefone, CPF e e-mail; não refaz nada\n\nÉ o fluxo de erro (Configurações → Error workflow) de todos os fluxos da BMH. Quando um falha: grava em **BMH_falhas** (fluxo, etapa, mensagem do erro, número da execução) e avisa no Telegram (robô BMH alertas, chat privado do Jorge).\n\n**Sem dado de paciente:** e-mail, CPF, telefone e números longos viram marcadores e a mensagem é cortada em 300 caracteres. É o registro de erro dos fluxos que não guardam execução (WhatsApp, painel da diretoria).\n\nTelegram em HTML escapado, com nova tentativa (3x, 5 s). Testado em 12/10/2026 com um fluxo temporário que falhava de propósito. **Precisa estar ATIVO** (esteve desligado de 08 a 12/10/2026 e nenhum alerta saiu). Não guarda execução com sucesso: a execução traria o erro cru, sem máscara; o registro é a tabela BMH_falhas.', width: 720, height: 256 }),
  };
  n.nota.position = [0, -272];
  const cx = {}; liga(cx, n.gatilho.name, n.monta.name); liga(cx, n.monta.name, n.registra.name); liga(cx, n.registra.name, n.envia.name);
  return { name: 'BMH · Alerta de falha', nodes: Object.values(n), connections: cx, settings: { executionOrder: 'v1', timezone: 'America/Sao_Paulo', saveDataSuccessExecution: 'none', saveDataErrorExecution: 'all' } };
}

// ---------------- fluxo 6: botões do Telegram ----------------
function fluxoBotoes() {
  x = 0;
  const D = "$('Decide e aplica').first().json";
  const n = {
    gatilho: no('Botão no Telegram', 'n8n-nodes-base.telegramTrigger', 1.1, { updates: ['callback_query', 'message'], additionalFields: {} }, { webhookId: crypto.randomUUID(), credentials: TG }),
    le: codigo('Lê o botão', 'botao-le.js'),
    registro: le('Registro', 'BMH_guardiao_registro'),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    decide: codigo('Decide e aplica', 'botao-decide.js'),
    responde: no('Responde o botão', 'n8n-nodes-base.telegram', 1.2, { resource: 'callback', operation: 'answerQuery', queryId: '={{ ' + D + '.query_id }}', additionalFields: { text: '={{ ' + D + '.resposta }}', show_alert: '={{ ' + D + '.alerta }}' } }, { credentials: TG, onError: 'continueRegularOutput' }),
    editar: se('Edita a mensagem?', '={{ ' + D + '.editar }}'),
    edita: no('Edita a mensagem', 'n8n-nodes-base.telegram', 1.2, { resource: 'message', operation: 'editMessageText', messageType: 'message', chatId: '={{ ' + D + '.chat_id }}', messageId: '={{ ' + D + '.message_id }}', text: '={{ ' + D + '.texto_final }}', replyMarkup: 'none', additionalFields: {} }, { credentials: TG, onError: 'continueRegularOutput' }),
    gravar: se('Grava a decisão?', '={{ $json.gravar }}'),
    grava: grava('Atualiza o registro', 'BMH_guardiao_registro'),
    // plantões: botão "Pronto, gerar os e-mails" (pl:AAAA-MM:ok) → chama o fluxo "BMH · Plantões · e-mails do mês"
    lePl: codigo('Lê o botão de plantões', '../../plantoes/n8n/botao-plantoes.js'),
    respPl: no('Responde · gerando', 'n8n-nodes-base.telegram', 1.2, { resource: 'callback', operation: 'answerQuery', queryId: '={{ $json.query_id }}', additionalFields: { text: 'Gerando os rascunhos…' } }, { credentials: TG, onError: 'continueRegularOutput' }),
    editaPl: no('Edita · gerando', 'n8n-nodes-base.telegram', 1.2, { resource: 'message', operation: 'editMessageText', messageType: 'message', chatId: "={{ $('Lê o botão de plantões').first().json.chat_id }}", messageId: "={{ $('Lê o botão de plantões').first().json.message_id }}", text: "={{ $('Lê o botão de plantões').first().json.texto }}", replyMarkup: 'none', additionalFields: {} }, { credentials: TG, onError: 'continueRegularOutput' }),
    chamaPl: no('Chama os e-mails do mês', 'n8n-nodes-base.httpRequest', 4.2, { method: 'GET', url: "={{ '" + process.env.N8N_URL + "/webhook/bmh-plantoes-emails?mes=' + $('Lê o botão de plantões').first().json.mes + '&chave=" + process.env.PLANTOES_CHAVE + "' }}", options: { timeout: 30000 } }, { onError: 'continueRegularOutput', retryOnFail: false }),   // sem repetir: o tempo esgotado pode ter disparado os e-mails
    // avaliações do Google: av:<código>:p|i, ou resposta escrita à mensagem da sugestão (publica o texto respondido)
    leAv: codigo('Lê o botão de avaliação', '../../perfil-google/n8n/botao-avaliacao.js'),
    tabAv: le('Avaliações (tabela)', 'BMH_avaliacoes_google'),
    decAv: codigo('Decide a avaliação', '../../perfil-google/n8n/avaliacao-decide.js'),
    seAv: se('Publica no Google?', '={{ $json.publicar }}'),
    tokAv: no('Google · acesso (avaliação)', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    pubAv: no('Publica a resposta', 'n8n-nodes-base.httpRequest', 4.2, { method: 'PUT', url: "={{ 'https://mybusiness.googleapis.com/v4/' + $('Decide a avaliação').first().json.review_name + '/reply' }}", sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Authorization', value: "={{ 'Bearer ' + $('Google · acesso (avaliação)').first().json.access_token }}" }] }, sendBody: true, specifyBody: 'json', jsonBody: "={{ JSON.stringify({ comment: $('Decide a avaliação').first().json.comment }) }}",
      options: { timeout: 60000, response: { response: { neverError: true, responseFormat: 'json' } } } }, { onError: 'continueRegularOutput', alwaysOutputData: true }),
    resAv: codigo('Resultado da avaliação', '../../perfil-google/n8n/avaliacao-resultado.js'),
    respAv: no('Responde · avaliação', 'n8n-nodes-base.telegram', 1.2, { resource: 'callback', operation: 'answerQuery', queryId: "={{ $('Lê o botão de avaliação').first().json.query_id }}", additionalFields: { text: "={{ $('Resultado da avaliação').first().json.resposta }}", show_alert: "={{ $('Resultado da avaliação').first().json.alerta }}" } }, { credentials: TG, onError: 'continueRegularOutput' }),
    seEdAv: se('Edita a mensagem da avaliação?', "={{ !!$('Resultado da avaliação').first().json.texto_final }}"),
    edAv: no('Edita · avaliação', 'n8n-nodes-base.telegram', 1.2, { resource: 'message', operation: 'editMessageText', messageType: 'message', chatId: "={{ $('Lê o botão de avaliação').first().json.chat_id }}", messageId: "={{ $('Lê o botão de avaliação').first().json.message_id }}", text: "={{ $('Resultado da avaliação').first().json.texto_final }}", replyMarkup: 'none', additionalFields: {} }, { credentials: TG, onError: 'continueRegularOutput' }),
    seGrAv: se('Grava a avaliação?', '={{ $json.gravar }}'),
    grAv: grava('Atualiza a avaliação', 'BMH_avaliacoes_google'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Telegram · botões\n**Traz:** toques e respostas do Jorge no Telegram\n**Envia:** mudança no Google Ads (guardião), e-mails de plantões, resposta de avaliação no Google\n**Limites:** só o chat do Jorge; só proposta ainda aberta; só os perfis da BMH\n\nRecebe o toque em Aplicar/Ignorar das propostas do guardião (gd:<código>:a|i), só do chat do Jorge. Aplicar muda no Google Ads na hora, com travas: só a conta da BMH, só pausar ou baixar orçamento, só proposta de hoje ou ontem ainda não decidida, e orçamento só se ainda estiver no valor da proposta. Grava a decisão em BMH_guardiao_registro e edita a mensagem. Também: plantões (pl:AAAA-MM:ok) e avaliações do Google (av:<código>:p|i, ou resposta escrita à mensagem da sugestão, que é publicada no lugar; só os dois perfis da BMH, só proposta aberta).', width: 560, height: 260 }),
  };
  const cx = {};
  for (const [a, b] of [[n.gatilho, n.lePl], [n.lePl, n.respPl], [n.respPl, n.editaPl], [n.editaPl, n.chamaPl], [n.gatilho, n.le], [n.le, n.registro], [n.registro, n.token], [n.token, n.decide], [n.decide, n.gravar], [n.decide, n.responde], [n.responde, n.editar]]) liga(cx, a.name, b.name);
  for (const [a, b] of [[n.gatilho, n.leAv], [n.leAv, n.tabAv], [n.tabAv, n.decAv], [n.decAv, n.seAv], [n.tokAv, n.pubAv], [n.pubAv, n.resAv], [n.resAv, n.respAv], [n.respAv, n.seEdAv], [n.resAv, n.seGrAv]]) liga(cx, a.name, b.name);
  cx[n.seAv.name] = { main: [[{ node: n.tokAv.name, type: 'main', index: 0 }], [{ node: n.resAv.name, type: 'main', index: 0 }]] };
  cx[n.seEdAv.name] = { main: [[{ node: n.edAv.name, type: 'main', index: 0 }], []] };
  cx[n.seGrAv.name] = { main: [[{ node: n.grAv.name, type: 'main', index: 0 }], []] };
  cx[n.gravar.name] = { main: [[{ node: n.grava.name, type: 'main', index: 0 }], []] };
  cx[n.editar.name] = { main: [[{ node: n.edita.name, type: 'main', index: 0 }], []] };
  return { name: 'BMH · Telegram · botões', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- fluxo 7: resumo da manhã ----------------
function fluxoResumo() {
  x = 0;
  const codigoResumo = no('Monta o resumo', 'n8n-nodes-base.code', 2, { jsCode: ler('resumo-manha.js').replace('__PAINEL__', process.env.N8N_URL + '/webhook/bmh-painel') });
  const n = {
    agenda: no('Todo dia às 8h', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '0 8 * * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-resumo-manha', options: {} }, { webhookId: crypto.randomUUID() }),
    config: le('Config', 'BMH_config'), ads: le('Anúncios (tabela)', 'BMH_google_anuncios_dia'), site: le('Site · cliques (tabela)', 'BMH_site_cliques_dia'),
    igut: le('iGut (tabela)', 'BMH_igut_dia'), guard: le('Guardião (tabela)', 'BMH_guardiao_registro'),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true, onError: 'continueRegularOutput', alwaysOutputData: true }),
    monta: codigoResumo,
    envia: telegram('Envia no Telegram', '={{ $json.texto }}'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Telegram · resumo da manhã\n**Traz:** tabelas do painel e do iGut\n**Envia:** resumo das 8h no Telegram\n**Limites:** uma mensagem por dia; só números\n\nTodo dia às 8h, no robô BMH alertas: Google Ads, WhatsApp pelo site e iGut de ontem; o mês até ontem contra o teto e contra o mesmo período do mês anterior; propostas do guardião esperando decisão. Lê as mesmas tabelas do painel. Manual: /webhook/bmh-resumo-manha.', width: 560, height: 200 }),
  };
  const cx = {}; liga(cx, n.manual.name, n.config.name);
  const ordem = [n.agenda, n.config, n.ads, n.site, n.igut, n.guard, n.token, n.monta, n.envia];
  for (let i = 0; i < ordem.length - 1; i++) liga(cx, ordem[i].name, ordem[i + 1].name);
  return { name: 'BMH · Telegram · resumo da manhã', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- fluxo 8: medição da reorganização do Google Ads ----------------
function fluxoMedicao() {
  x = 0;
  const n = {
    agenda: no('Toda quinta às 8h20', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '20 8 * * 4' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-medicao-ads', options: {} }, { webhookId: crypto.randomUUID() }),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    // orgânico (pedido do Jorge, 08/10/2026): 14 dias até 3 dias atrás (o Search Console atrasa), por data
    gscQ: http('Search Console · buscas', 'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fhiperbaricabrasilia.com.br%2F/searchAnalytics/query',
      "={{ JSON.stringify({ startDate: $now.setZone('America/Sao_Paulo').minus({ days: 16 }).toISODate(), endDate: $now.setZone('America/Sao_Paulo').minus({ days: 3 }).toISODate(), dimensions: ['date', 'query'], dimensionFilterGroups: [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression: '^(c[aâ]mara )?hiperb[aá]rica$' }] }], rowLimit: 1000 }) }}"),
    gscP: http('Search Console · páginas', 'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fhiperbaricabrasilia.com.br%2F/searchAnalytics/query',
      "={{ JSON.stringify({ startDate: $now.setZone('America/Sao_Paulo').minus({ days: 16 }).toISODate(), endDate: $now.setZone('America/Sao_Paulo').minus({ days: 3 }).toISODate(), dimensions: ['date', 'page'], rowLimit: 5000 }) }}"),
    mede: codigo('Mede', 'medicao-reorganizacao.js'),
    envia: telegram('Envia no Telegram', '={{ $json.texto }}'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Anúncios · medição da reorganização\n**Traz:** Google Ads e Search Console\n**Envia:** mensagem no Telegram toda quinta, até 05/11\n**Limites:** só recomenda; alarma só queda confirmada\n\nToda quinta às 8h20 (dia do Jorge na BMH), de 15/10 a 05/11/2026: depois (09/10 até ontem) × mesmo número de dias antes, direto do Google Ads. 15/10: régua da 1ª semana (R$ 50 por contato e pior que antes). 05/11: metas das 4 semanas, concorrentes e grupo de preço (R$ 60). Só recomenda; mudar a conta é com o pode do Jorge. Fora das datas não manda nada (pode desligar depois de 05/11). Manual: /webhook/bmh-medicao-ads?teste=1.', width: 560, height: 220 }),
  };
  const cx = {}; liga(cx, n.agenda.name, n.token.name); liga(cx, n.manual.name, n.token.name); liga(cx, n.token.name, n.gscQ.name); liga(cx, n.gscQ.name, n.gscP.name); liga(cx, n.gscP.name, n.mede.name); liga(cx, n.mede.name, n.envia.name);
  return { name: 'BMH · Anúncios · medição da reorganização', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- fluxo 9: produção do mês para a diretoria ----------------
function fluxoMensal() {
  x = 0;
  const IGUT = cred('httpCustomAuth', 'BMH · iGut (acesso)');
  const igut = (name, url, body, extra = {}) => no(name, 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url, authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth',
    sendBody: true, specifyBody: 'json', jsonBody: body, options: { timeout: 180000 } }, { credentials: IGUT, alwaysOutputData: true, onError: 'continueRegularOutput', ...extra });
  const BI = 'https://api.igut.med.br/v2/businessintelligences/producao';
  const corpo = (ini, fim) => `={{ JSON.stringify({ 'Agendamento.data': $('Qual mês').first().json.${ini}, 'Agendamento.data_fim': $('Qual mês').first().json.${fim} }) }}`;
  const n = {
    agenda_: no('Dia 1 às 8h', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '0 8 1 * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-producao-mes', responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),   // a chamada manual devolve o que foi enviado
    mes: codigo('Qual mês', '../../grupos/qual-mes.js'),
    dia: igut('Agenda do dia', 'https://api.igut.med.br/v2/consultas/buscar', "={{ JSON.stringify({ 'Agendamento.data': $json.dia, 'Agendamento.data_fim': $json.dia }) }}"),
    p0: igut('Produção do mês', BI, corpo('ini', 'fim'), { executeOnce: true }),
    // recebido da produção dos 6 meses anteriores (um pedido por mês)
    meses: no('Meses anteriores', 'n8n-nodes-base.code', 2, { jsCode: "return $('Qual mês').first().json.anteriores.map(m => ({ json: m }));" }, { executeOnce: true }),
    pAnt: igut('Produção dos meses anteriores', BI, "={{ JSON.stringify({ 'Agendamento.data': $json.ini, 'Agendamento.data_fim': $json.fim }) }}"),
    tab: le('iGut (tabela)', 'BMH_igut_dia'),
    monta: no('Monta', 'n8n-nodes-base.code', 2, { jsCode: ler('../../grupos/diretoria-mensal.js').replace('__PAINEL_URL__', process.env.N8N_URL + '/webhook/bmh-diretoria')
      .replace('__PAINEL_USUARIO__', process.env.PAINEL_DIRETORIA_USUARIO || '?').replace('__PAINEL_SENHA__', process.env.PAINEL_DIRETORIA_SENHA || '?') }, { executeOnce: true }),   // login vai na mensagem (pedido do Jorge)
    // até o Jorge aprovar o formato, tudo vai só para o Telegram dele; depois, o ramo "grupo" passa a ser o WhatsApp da diretoria
    ehPrevia: se('É prévia?', '={{ $json.previa }}'),
    envia: telegram('Telegram (prévia)', "={{ '🧪 PRÉVIA (chamada manual; não foi ao grupo)' + '\\n\\n' + $json.mensagem }}"),
    // grupo da diretoria pelo WhatsApp (mesmo envio do fluxo antigo); liberado pelo Jorge em 09/10/2026
    grupo: no('WhatsApp · grupo da diretoria', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://apiwp.cannlink.com.br/message/sendText/Madeiro', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, bodyParameters: { parameters: [{ name: 'number', value: '120363205793119192@g.us' }, { name: 'text', value: '={{ $json.mensagem }}' }] }, options: {} }, { credentials: cred('httpHeaderAuth', 'BMH · WhatsApp Evolution (envio aos grupos)'), retryOnFail: false }),   // mensagem no grupo: sem repetir
    // aba Geral da planilha de plantões: mono e multi da Asa Sul (pedido do Jorge, 09/10/2026)
    soGeral: se('Só a Geral?', "={{ $('Qual mês').first().json.so === 'geral' }}"),
    geralLe: planilha('Geral · lê', 'GET', PLANILHA + '/values/Geral!A1:G300?valueRenderOption=FORMULA'),
    geralMonta: codigo('Geral · mono e multi', '../../grupos/geral-camaras.js'),
    geralOk: se('Geral · dá para gravar?', '={{ !$json.falhou }}'),
    geralGrava: planilha('Geral · grava', 'POST', PLANILHA + ':batchUpdate', "={{ JSON.stringify($('Geral · mono e multi').first().json.corpo) }}", { retryOnFail: false }),   // pode inserir linha: sem repetir
    geralAviso: telegram('Telegram · Geral não atualizada', "={{ '⚠️ Aba Geral (mono e multi da Asa Sul) de ' + $json.mes + ' não foi atualizada: ' + $json.falhou }}"),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Diretoria · produção do mês\n**Traz:** agenda e BI do iGut do mês\n**Envia:** mensagem no grupo da diretoria (WhatsApp) no dia 1 e mono/multi na aba Geral\n**Limites:** uma por mês; a manual vai só ao Telegram; execução não guardada\n\nDia 1 às 8h, sobre o mês anterior, no formato do e-mail mensal do Jorge: sessões por unidade (agenda finalizada, lida dia a dia), faltas (cobradas), avaliações, produzido / convênio faturado / a faturar / particular / recebido da produção (BI do iGut, lógica de DRE) e comparação. Manual: /webhook/bmh-producao-mes?mes=AAAA-MM (prévia no Telegram); &grupo=1 manda ao grupo da diretoria. Código em integracoes/grupos/ no workspace da BMH. Também preenche mono e multi da Asa Sul na aba Geral da planilha de plantões; &so=geral faz só isso, sem mensagem.', width: 560, height: 240 }),
  };
  n.dia.parameters.options.batching = { batch: { batchSize: 3, batchInterval: 500 } };
  Object.assign(n.dia, { retryOnFail: true, maxTries: 3, waitBetweenTries: 3000 });   // um dia que falha some da conta
  n.pAnt.parameters.options.batching = { batch: { batchSize: 1, batchInterval: 500 } };
  const cx = {}; liga(cx, n.agenda_.name, n.mes.name); liga(cx, n.manual.name, n.mes.name);
  const ordem = [n.mes, n.dia, n.soGeral, n.p0, n.meses, n.pAnt, n.tab, n.monta, n.ehPrevia];
  for (let i = 0; i < ordem.length - 1; i++) if (ordem[i] !== n.soGeral) liga(cx, ordem[i].name, ordem[i + 1].name);
  cx[n.soGeral.name] = { main: [[{ node: n.geralLe.name, type: 'main', index: 0 }], [{ node: n.p0.name, type: 'main', index: 0 }]] };
  liga(cx, n.monta.name, n.geralLe.name);   // depois da mensagem montada, a Geral (ramo próprio)
  for (const [a, b] of [[n.geralLe, n.geralMonta], [n.geralMonta, n.geralOk]]) liga(cx, a.name, b.name);
  cx[n.geralOk.name] = { main: [[{ node: n.geralGrava.name, type: 'main', index: 0 }], [{ node: n.geralAviso.name, type: 'main', index: 0 }]] };
  cx[n.ehPrevia.name] = { main: [[{ node: n.envia.name, type: 'main', index: 0 }], [{ node: n.grupo.name, type: 'main', index: 0 }]] };
  return { name: 'BMH · Diretoria · produção do mês', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };   // a resposta do iGut tem dado de paciente: não guardar execução com sucesso
}

// ---------------- fluxo 10: números da diretoria (grava toda noite) ----------------
function fluxoNumeros() {
  x = 0;
  const IGUT = cred('httpCustomAuth', 'BMH · iGut (acesso)');
  const igut = (name, url, body, lote) => no(name, 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url, authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth',
    sendBody: true, specifyBody: 'json', jsonBody: body, options: { timeout: 180000, batching: { batch: { batchSize: lote, batchInterval: 500 } } } }, { credentials: IGUT, alwaysOutputData: true, onError: 'continueRegularOutput' });
  const consulta = "let q = {}; try { q = $('Manual').first().json.query || {}; } catch (e) {}\n";
  const n = {
    agenda_: no('Toda noite às 23h40', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '40 23 * * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-diretoria-grava', responseMode: 'lastNode', responseData: 'noData', options: {} }, { webhookId: crypto.randomUUID() }),   // responde quando termina (carga em pedaços)
    // botão "Atualizar agora" do painel (20/10/2026): o painel (com login) chama este endereço; responde na hora e roda a carga
    // completa da noite (sem parâmetro: 13 meses + ontem e hoje, uns 6 min). Endereço sorteado: não aparece na página
    botao: no('Botão do painel', 'n8n-nodes-base.webhook', 2, { path: botaoDiretoria(), responseMode: 'onReceived', options: {} }, { webhookId: crypto.randomUUID() }),
    meses: no('Meses', 'n8n-nodes-base.code', 2, { jsCode: consulta + "// financeiro: o mês corrente, os 12 anteriores e os mais antigos com pendência, refeitos toda noite (o recebido continua mudando)\n// manual: ?so=operacao pula esta parte; ?mes=AAAA-MM refaz só esse mês (histórico em pedaços: tudo de uma vez estoura a memória do n8n)\nif (q.so === 'operacao') return [];\nif (/^\\d{4}-\\d{2}$/.test(q.mes || '')) { const d = DateTime.fromISO(q.mes + '-01'); return [{ json: { mes: q.mes, ini: d.toISODate(), fim: d.endOf('month').toISODate() } }]; }\nconst N = Math.min(48, Math.max(1, Number(q.meses) || 13)), z = $now.setZone('America/Sao_Paulo').startOf('month');\nconst base = Array.from({ length: N }, (_, i) => { const d = z.minus({ months: i }); return { json: { mes: d.toFormat('yyyy-MM'), ini: d.toISODate(), fim: d.endOf('month').toISODate() } }; });\n// meses mais antigos (desde nov/2024) que ainda têm a receber ou a faturar também são refeitos (auditoria de 20/10/2026:\n// R$ 58 mil a receber de 2025 ficavam sem reconferência e o pagamento deles não apareceria no painel)\nconst ja = new Set(base.map((i) => i.json.mes)), pend = new Set();\ntry { for (const i of $('Pendentes antigos (tabela)').all()) { const r = i.json || {}; if (r.mes >= '2024-11' && !ja.has(r.mes) && ((Number(r.a_receber) || 0) > 0.5 || (Number(r.a_faturar) || 0) > 0.5)) pend.add(r.mes); } } catch (e) {}\nreturn [...base, ...[...pend].sort().reverse().map((m) => { const d = DateTime.fromISO(m + '-01'); return { json: { mes: m, ini: d.toISODate(), fim: d.endOf('month').toISODate() } }; })];" }),
    pend: le('Pendentes antigos (tabela)', 'BMH_financeiro_mes'),   // lido antes dos meses: quais meses antigos ainda têm pendência
    bi: igut('BI do mês', 'https://api.igut.med.br/v2/businessintelligences/producao', "={{ JSON.stringify({ 'Agendamento.data': $json.ini, 'Agendamento.data_fim': $json.fim }) }}", 1),
    conv: no('Convênios', 'n8n-nodes-base.httpRequest', 4.2, { method: 'GET', url: 'https://api.igut.med.br/v2/convenios/listar', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', options: { timeout: 60000 } },
      { credentials: IGUT, executeOnce: true, alwaysOutputData: true, onError: 'continueRegularOutput' }),   // nome do convênio quando o BI vem sem
    leFin: le('Financeiro (tabela)', 'BMH_financeiro_mes'), leDet: le('Detalhes (tabela)', 'BMH_financeiro_detalhe'),
    mFin: codigo('Monta financeiro', '../../grupos/financeiro-monta.js', { executeOnce: true }),
    gFin: grava('Grava financeiro', 'BMH_financeiro_mes'),
    mDet: codigo('Monta detalhes por lote', '../../grupos/financeiro-detalhe.js', { executeOnce: true }),
    gDet: grava('Grava detalhes', 'BMH_financeiro_detalhe'),
    lePrazo: le('Prazo (tabela)', 'BMH_prazo_recebimento'),
    lePac: le('Pacientes (tabela)', 'BMH_financeiro_paciente'),
    mPac: codigo('Monta pacientes por lote', '../../grupos/financeiro-paciente.js', { executeOnce: true }),
    gPac: grava('Grava pacientes', 'BMH_financeiro_paciente'),
    mPrazo: codigo('Monta prazo de recebimento', '../../grupos/prazo-monta.js', { executeOnce: true }),
    gPrazo: grava('Grava prazo', 'BMH_prazo_recebimento'),
    dias: no('Dias', 'n8n-nodes-base.code', 2, { jsCode: consulta + "// operação: ontem e hoje (manual: ?desde=AAAA-MM-DD&ate=AAAA-MM-DD, até 40 dias por vez; ?so=financeiro pula esta parte)\nif (q.so === 'financeiro') return [];\nconst z = $now.setZone('America/Sao_Paulo').startOf('day'), ok = (s) => /^\\d{4}-\\d{2}-\\d{2}$/.test(s || '');\nconst fim = ok(q.ate) ? DateTime.fromISO(q.ate) : z, ini = ok(q.desde) ? DateTime.fromISO(q.desde) : z.minus({ days: 1 });\nconst out = []; for (let d = ini; d <= fim && out.length < 40; d = d.plus({ days: 1 })) out.push({ json: { dia: d.toISODate() } });\nreturn out;" }),
    ag: igut('Agenda do dia', 'https://api.igut.med.br/v2/consultas/buscar', "={{ JSON.stringify({ 'Agendamento.data': $json.dia, 'Agendamento.data_fim': $json.dia }) }}", 3),
    mOp: codigo('Monta operação', '../../grupos/operacao-monta.js', { executeOnce: true }),
    gOp: grava('Grava operação', 'BMH_operacao_dia'),
    // operação por convênio (20/10/2026): lê só os dias que estão sendo refeitos (para zerar o que sumiu) e grava por dia|unidade|convênio
    leOpC: no('Operação por convênio (dias refeitos)', 'n8n-nodes-base.dataTable', 1.1, { operation: 'get', dataTableId: tabela('BMH_operacao_conv'), returnAll: true, matchType: 'allConditions',
      filters: { conditions: [{ keyName: 'dia', condition: 'gte', keyValue: "={{ $('Dias').all().map((i) => i.json.dia).sort()[0] || '9999' }}" }] } }, { alwaysOutputData: true, executeOnce: true }),
    mOpC: codigo('Monta operação por convênio', '../../grupos/operacao-conv-monta.js', { executeOnce: true }),
    gOpC: grava('Grava operação por convênio', 'BMH_operacao_conv'),
    mOpK: codigo('Monta operação por câmara', '../../grupos/operacao-camara-monta.js', { executeOnce: true }),
    gOpK: grava('Grava operação por câmara', 'BMH_operacao_camara'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Diretoria · grava os números\n**Traz:** iGut (financeiro, lotes, prazos, pacientes, agenda)\n**Envia:** tabelas BMH_financeiro_* e BMH_operacao_dia\n**Limites:** nome de paciente só em BMH_financeiro_paciente; execução não guardada\n\nToda noite às 23h40: financeiro da produção (13 meses, BI do iGut) → BMH_financeiro_mes; operação de ontem e hoje (agenda do iGut, dia a dia) → BMH_operacao_dia. Só totais. Manual: /webhook/bmh-diretoria-grava?desde=AAAA-MM-DD&ate=AAAA-MM-DD. Lido pela página BMH · Diretoria (painel). Código em integracoes/grupos/.', width: 560, height: 200 }),
  };
  const cx = {};
  for (const t of [n.agenda_, n.manual, n.botao]) cx[t.name] = { main: [[{ node: n.pend.name, type: 'main', index: 0 }, { node: n.dias.name, type: 'main', index: 0 }]] };
  liga(cx, n.pend.name, n.meses.name);
  for (const [a, b] of [[n.meses, n.bi], [n.bi, n.conv], [n.conv, n.leFin], [n.leFin, n.leDet], [n.leDet, n.mFin], [n.mFin, n.gFin], [n.leDet, n.mDet], [n.mDet, n.gDet], [n.leDet, n.lePrazo], [n.lePrazo, n.mPrazo], [n.mPrazo, n.gPrazo], [n.leDet, n.lePac], [n.lePac, n.mPac], [n.mPac, n.gPac], [n.dias, n.ag], [n.ag, n.leOpC], [n.leOpC, n.mOpC], [n.mOpC, n.gOpC], [n.ag, n.mOpK], [n.mOpK, n.gOpK], [n.ag, n.mOp], [n.mOp, n.gOp]]) liga(cx, a.name, b.name);
  return { name: 'BMH · Diretoria · grava os números', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };   // resposta do iGut tem dado de paciente
}

// ---------------- fluxo 11: painel da diretoria (página + pacientes do lote, tudo num endereço só) ----------------
// Um painel só (Jorge, 09/10/2026): a mesma URL entrega a página e, quando o painel pede (?formato=json&situacao=...),
// a lista de pacientes de um lote, consultada na hora no iGut. Mesmo endereço = o navegador reaproveita o login.
function botaoDiretoria() { IDS.diretoria ||= {}; return IDS.diretoria.atualiza ||= 'bmh-diretoria-atualiza-' + crypto.randomBytes(8).toString('hex'); }
function fluxoPainelDiretoria() {
  x = 0;
  const n = {
    pag: no('Painel da diretoria', 'n8n-nodes-base.webhook', 2, { path: 'bmh-diretoria', authentication: 'basicAuth', responseMode: 'responseNode', options: {} }, { webhookId: crypto.randomUUID(), credentials: cred('httpBasicAuth', 'BMH · Painel da diretoria (login)') }),
    ehAtualiza: se('É o botão Atualizar?', "={{ !!($json.query || {}).atualizar }}"),   // ?atualizar=1: pede a carga completa (20/10/2026)
    // trava para todos (20/10/2026): com uma carga pedida há menos de 15 min e ainda sem a última etapa gravada, não pede outra
    ultPed: le('Último pedido', 'BMH_diretoria_pedido'), opPed: le('Operação (pedido)', 'BMH_operacao_dia'),
    decide: no('Decide o pedido', 'n8n-nodes-base.code', 2, { jsCode: [
      "const agora = $now.toMillis();",
      "let ult = 0; try { ult = Number(($('Último pedido').all().map((i) => i.json).find((r) => r && r.chave === 'ultimo') || {}).pedido) || 0; } catch (e) {}",
      "let atOp = 0; try { for (const i of $('Operação (pedido)').all()) atOp = Math.max(atOp, Date.parse((i.json || {}).atualizado_em || '') || 0); } catch (e) {}",
      "const andando = ult > 0 && agora - ult < 15 * 60000 && atOp < ult;",
      "return [{ json: { chave: 'ultimo', pedido: String(andando ? ult : agora), disparar: !andando } }];"].join('\n') }, { executeOnce: true }),
    dispara: se('Dispara?', '={{ $json.disparar }}'),
    gravaPed: grava('Grava o pedido', 'BMH_diretoria_pedido'),
    pede: no('Pede a atualização', 'n8n-nodes-base.httpRequest', 4.2, { method: 'GET', url: process.env.N8N_URL.replace(/\/$/, '') + '/webhook/' + botaoDiretoria(), options: { timeout: 30000 } }, { retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 }),
    // volta para o painel com a hora do pedido (do servidor): a página se recarrega até o financeiro gravado ser mais novo
    respondePedido: no('Volta para o painel', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'text', responseBody: "={{ '<!doctype html><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex\"><script>location.replace(\"bmh-diretoria?pedido=' + $('Decide o pedido').first().json.pedido + '\")</script>' }}",
      options: { responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }] } } }),
    ehLista: se('É lista de pacientes?', "={{ !!($json.query || {}).situacao }}"),   // JSON (?formato=json) ou página dentro da janela (?embutido=1)
    // página
    fin: le('Financeiro (tabela)', 'BMH_financeiro_mes'), op: le('Operação (tabela)', 'BMH_operacao_dia'), det: le('Detalhes (tabela)', 'BMH_financeiro_detalhe'), prazo: le('Prazo (tabela)', 'BMH_prazo_recebimento'),
    pedTab: le('Pedido (tabela)', 'BMH_diretoria_pedido'), opcTab: le('Operação por convênio (tabela)', 'BMH_operacao_conv'), opkTab: le('Operação por câmara (tabela)', 'BMH_operacao_camara'),
    monta: codigo('Monta a página', '../../grupos/painel-diretoria.js', { executeOnce: true }),
    entrega: no('Entrega a página', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'text', responseBody: '={{ $json.html }}', options: { responseHeaders: { entries: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }, { name: 'X-Robots-Tag', value: 'noindex' }] } } }),
    // pacientes do lote (3º nível): lê a tabela gravada às 23h40 (abre na hora; funciona com o iGut fora do ar)
    pacTab: le('Pacientes do lote (tabela)', 'BMH_financeiro_paciente'), fimLista: le('Fim da última atualização', 'BMH_operacao_dia'),
    lista: codigo('Lista os pacientes', '../../grupos/lote-pacientes.js'),
    entregaLista: no('Entrega a lista', 'n8n-nodes-base.respondToWebhook', 1.1, { respondWith: 'text', responseBody: '={{ $json.corpo }}', options: { responseHeaders: { entries: [{ name: 'Content-Type', value: '={{ $json.tipo }}' }, { name: 'Cache-Control', value: 'no-store' }, { name: 'X-Robots-Tag', value: 'noindex' }] } } }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Diretoria (painel)\n**Traz:** tabelas da diretoria\n**Envia:** o painel da diretoria, com login\n**Limites:** só lê; execução não guardada\n\nUm painel só, login da diretoria (credencial \"BMH · Painel da diretoria (login)\"; cópia no .env em PAINEL_DIRETORIA_*). Página: lê BMH_financeiro_mes, BMH_operacao_dia e BMH_financeiro_detalhe (gravadas às 23h40). ?formato=json&situacao=...: pacientes de um lote, lidos de BMH_financeiro_paciente (gravada às 23h40; nomes guardados por decisão do Jorge); o n8n não guarda a execução.', width: 560, height: 200 }),
  };
  const cx = {}; liga(cx, n.pag.name, n.ehAtualiza.name);
  cx[n.ehAtualiza.name] = { main: [[{ node: n.ultPed.name, type: 'main', index: 0 }], [{ node: n.ehLista.name, type: 'main', index: 0 }]] };
  liga(cx, n.ultPed.name, n.opPed.name); liga(cx, n.opPed.name, n.decide.name); liga(cx, n.decide.name, n.dispara.name);
  cx[n.dispara.name] = { main: [[{ node: n.gravaPed.name, type: 'main', index: 0 }], [{ node: n.respondePedido.name, type: 'main', index: 0 }]] };
  liga(cx, n.gravaPed.name, n.pede.name); liga(cx, n.pede.name, n.respondePedido.name);
  cx[n.ehLista.name] = { main: [[{ node: n.pacTab.name, type: 'main', index: 0 }], [{ node: n.fin.name, type: 'main', index: 0 }]] };
  for (const [a, b] of [[n.fin, n.op], [n.op, n.det], [n.det, n.prazo], [n.prazo, n.pedTab], [n.pedTab, n.opcTab], [n.opcTab, n.opkTab], [n.opkTab, n.monta], [n.monta, n.entrega], [n.pacTab, n.fimLista], [n.fimLista, n.lista], [n.lista, n.entregaLista]]) liga(cx, a.name, b.name);
  return { name: 'BMH · Diretoria (painel)', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none', saveDataErrorExecution: 'none' }) };   // tem nome de paciente: não guarda execução
}

// ---------------- fluxo 13: plantões médicos · fechamento do mês ----------------
const PLANILHA = 'https://sheets.googleapis.com/v4/spreadsheets/1E2DJykq0SAARKh9ci5MEtuCfDsXOzbPAlazjOFO5XKM';
const SHEETS = () => cred('googleApi', 'BMH · Google (conta de serviço) · Planilha de plantões');
const planilha = (name, metodo, url, corpo, extra = {}) => no(name, 'n8n-nodes-base.httpRequest', 4.2, { method: metodo, url, authentication: 'predefinedCredentialType', nodeCredentialType: 'googleApi',
  ...(corpo ? { sendBody: true, specifyBody: 'json', jsonBody: corpo } : {}), options: { timeout: 120000 } }, { credentials: SHEETS(), executeOnce: true, ...extra });
const comMonta = (arq) => ler('../../plantoes/monta-mes.js') + '\n' + ler(arq);
function fluxoPlantoes() {
  x = 0;
  const n = {
    agenda_: no('Dia 1 às 8h', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '0 8 1 * *' }] } }),
    manual: no('Manual', 'n8n-nodes-base.webhook', 2, { path: 'bmh-plantoes-mes', options: {} }, { webhookId: crypto.randomUUID() }),
    mes: codigo('Qual mês', '../../plantoes/n8n/qual-mes.js'),
    resp: planilha('Respostas', 'GET', PLANILHA + '/values/Respostas!A1:O2000?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER'),
    abas: planilha('Abas da planilha', 'GET', PLANILHA + '?fields=sheets.properties(title,sheetId)'),
    monta: no('Monta o mês', 'n8n-nodes-base.code', 2, { jsCode: comMonta('../../plantoes/n8n/monta.js') }),
    existe: se('A aba já existe?', '={{ $json.existe }}'),
    avisoExiste: codigo('Avisa que já existe', '../../plantoes/n8n/aba-existe.js'),
    tgExiste: telegram('Telegram · já existe', '={{ $json.texto }}'),
    cria: planilha('Cria as abas', 'POST', PLANILHA + ':batchUpdate', '={{ JSON.stringify($json.corpoAbas) }}'),
    pedidos: no('Pedidos à planilha', 'n8n-nodes-base.code', 2, { jsCode: comMonta('../../plantoes/n8n/pedidos.js') }),
    valores: planilha('Grava os valores', 'POST', PLANILHA + '/values:batchUpdate', '={{ JSON.stringify($json.valores) }}'),
    formata: planilha('Formata', 'POST', PLANILHA + ':batchUpdate', "={{ JSON.stringify($('Pedidos à planilha').first().json.formatos) }}"),
    msg: codigo('Mensagem de divergências', '../../plantoes/n8n/mensagem.js'),
    tg: no('Telegram · divergências', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' }, replyMarkup: 'inlineKeyboard',
      inlineKeyboard: { rows: [{ row: { buttons: [{ text: '✅ Pronto, gerar os e-mails', additionalFields: { callback_data: '={{ $json.botao }}' } }] } }] } }, { credentials: TG }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Plantões · fechamento do mês\n**Traz:** respostas do formulário dos médicos\n**Envia:** aba do mês na planilha e divergências no Telegram\n**Limites:** não recria aba que existe; não inventa plantão\n\nDia 1 às 8h: lê a aba Respostas do formulário dos médicos (Planilha Prestação Serviço Médico), aplica as regras do fechamento (mês do plantão, turnos da BMH, Específico vira manhã + tarde, duplicados, nome e CRM) e cria a aba "MM/AA" com fórmulas; os turnos sem formulário entram no fim da aba, em vermelho, até o Jorge preencher nome e CRM. Manda as divergências no Telegram com o botão "Pronto". Não inventa plantão. Manual: /webhook/bmh-plantoes-mes?mes=AAAA-MM (&refazer=1 recria; &prefixo=teste para testar). Código em integracoes/plantoes/.', width: 600, height: 240 }),
  };
  const cx = {}; liga(cx, n.agenda_.name, n.mes.name); liga(cx, n.manual.name, n.mes.name);
  for (const [a, b] of [[n.mes, n.resp], [n.resp, n.abas], [n.abas, n.monta], [n.monta, n.existe], [n.avisoExiste, n.tgExiste], [n.cria, n.pedidos], [n.pedidos, n.valores], [n.valores, n.formata], [n.formata, n.msg], [n.msg, n.tg]]) liga(cx, a.name, b.name);
  cx[n.existe.name] = { main: [[{ node: n.avisoExiste.name, type: 'main', index: 0 }], [{ node: n.cria.name, type: 'main', index: 0 }]] };
  return { name: 'BMH · Plantões · fechamento do mês', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };
}

// ---------------- fluxo 14: plantões médicos · e-mails do mês (rascunhos no Gmail) ----------------
function fluxoPlantoesEmails() {
  x = 0;
  const GMAIL = C['BMH · Gmail (renovação do acesso)'] ? cred('httpCustomAuth', 'BMH · Gmail (renovação do acesso)') : null;
  const n = {
    gatilho: no('Gerar e-mails', 'n8n-nodes-base.webhook', 2, { path: 'bmh-plantoes-emails', options: {} }, { webhookId: crypto.randomUUID() }),
    mes: no('Qual mês', 'n8n-nodes-base.code', 2, { jsCode: ler('../../plantoes/n8n/emails-qual-mes.js').replace('__CHAVE__', process.env.PLANTOES_CHAVE) }),
    le: planilha('Lê a planilha', 'GET', "={{ '" + PLANILHA + "/values:batchGet?ranges=' + encodeURIComponent(\"'\" + $json.aba + \"'!A1:K2000\") + '&ranges=' + encodeURIComponent('Pagamento!A1:F200') + '&ranges=' + encodeURIComponent('Geral!A1:B200') + '&valueRenderOption=UNFORMATTED_VALUE' }}"),
    op: le('Operação (tabela)', 'BMH_operacao_dia'), cfg: le('Config', 'BMH_config'),
    monta: no('Monta os e-mails', 'n8n-nodes-base.code', 2, { jsCode: ler('../../plantoes/emails.js') + '\n' + ler('../../plantoes/n8n/emails.js') }),
    geral: no('Linha da Geral', 'n8n-nodes-base.code', 2, { jsCode: ler('../../plantoes/emails.js') + '\n' + ler('../../plantoes/n8n/geral.js') }),
    geralSe: se('Atualiza a Geral?', '={{ !$json.pular }}'),
    geralAbre: planilha('Abre a linha na Geral', 'POST', PLANILHA + ':batchUpdate', "={{ JSON.stringify($('Linha da Geral').first().json.abre) }}", { retryOnFail: false }),   // insere linha: sem repetir
    geralGrava: planilha('Grava a Geral', 'POST', PLANILHA + '/values:batchUpdate', "={{ JSON.stringify($('Linha da Geral').first().json.grava) }}", { onError: 'continueRegularOutput' }),
    ...(GMAIL ? {
      token: no('Gmail · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: GMAIL, executeOnce: true }),
      separa: no('Um por rascunho', 'n8n-nodes-base.code', 2, { jsCode: "return $('Monta os e-mails').first().json.rascunhos.map((r) => ({ json: r }));" }),
      cria: no('Cria os rascunhos', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://gmail.googleapis.com/gmail/v1/users/me/drafts', sendHeaders: true, headerParameters: { parameters: [{ name: 'Authorization', value: "={{ 'Bearer ' + $('Gmail · renova o acesso').first().json.access_token }}" }] }, sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json) }}', options: { timeout: 60000 } }, { onError: 'continueRegularOutput', retryOnFail: false }),   // rascunho repetido: sem repetir
    } : {}),
    aviso: codigo('Mensagem para o Jorge', '../../plantoes/n8n/emails-telegram.js'),
    tg: no('Telegram · e-mails', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, { credentials: TG }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Plantões · e-mails do mês\n**Traz:** aba do mês, aba Pagamento e sessões do mês\n**Envia:** rascunhos no Gmail (ou textos no Telegram) e a linha do mês na aba Geral\n**Limites:** só rascunho, nunca envia; só com a chave do botão\n\nChamado pelo botão "Pronto" do Telegram (fluxo de botões), com chave. Lê a aba do mês já completa e a aba Pagamento, soma as sessões do mês (BMH_operacao_dia) e cria no Gmail do Jorge os rascunhos de honorários e de produção (só rascunho: o Jorge revisa e envia). Sem Gmail autorizado, manda os textos no Telegram. Destinatários: BMH_config email_honorarios_para / email_producao_para. Também preenche a linha do mês na aba Geral (honorário por unidade puxado da aba do mês, sessões do iGut); com &prefixo=teste não mexe na Geral.', width: 600, height: 240 }),
  };
  const cx = {};
  const ordem = GMAIL ? [n.gatilho, n.mes, n.le, n.op, n.cfg, n.monta, n.geral, n.geralSe] : [n.gatilho, n.mes, n.le, n.op, n.cfg, n.monta, n.geral, n.geralSe];
  for (let i = 0; i < ordem.length - 1; i++) liga(cx, ordem[i].name, ordem[i + 1].name);
  // Geral: teste pula; abre a linha se faltar e copia o formato, grava; depois segue para os e-mails
  const depois = GMAIL ? [n.token, n.separa, n.cria, n.aviso, n.tg] : [n.aviso, n.tg];
  const ir = (no_) => [{ node: no_.name, type: 'main', index: 0 }];
  cx[n.geralSe.name] = { main: [ir(n.geralAbre), ir(depois[0])] };
  liga(cx, n.geralAbre.name, n.geralGrava.name); liga(cx, n.geralGrava.name, depois[0].name);
  for (let i = 0; i < depois.length - 1; i++) liga(cx, depois[i].name, depois[i + 1].name);
  n.aviso.executeOnce = true;
  return { name: 'BMH · Plantões · e-mails do mês', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };   // tem dado de pagamento dos médicos
}

// ---------------- Google orgânico da semana (15/10/2026) ----------------
function fluxoSearchConsole() {
  x = 0;
  const GSC = 'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fhiperbaricabrasilia.com.br%2F/searchAnalytics/query';
  const q = (ini, fim, extra) => "={{ JSON.stringify({ startDate: $('Datas').first().json." + ini + ", endDate: $('Datas').first().json." + fim + ", " + extra + " }) }}";
  const n = {
    agenda: no('Segunda às 7h07', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '7 7 * * 1' }] } }),
    manual: no('Rodar agora', 'n8n-nodes-base.webhook', 2, { path: 'bmh-google-organico-semana', responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),
    datas: no('Datas', 'n8n-nodes-base.code', 2, { jsCode: "let teste = false; try { teste = !!($('Rodar agora').first().json.query || {}).teste; } catch (e) {}\nconst fim = $now.setZone('America/Sao_Paulo').startOf('day').minus({ days: 3 }), ini = fim.minus({ days: 6 }), ini0 = ini.minus({ days: 7 }), fim0 = ini.minus({ days: 1 });\nreturn [{ json: { teste, ini: ini.toISODate(), fim: fim.toISODate(), ini0: ini0.toISODate(), fim0: fim0.toISODate(), iniBr: ini.toFormat('dd/LL'), fimBr: fim.toFormat('dd/LL') } }];" }),
    dia: http('Por dia', GSC, q('ini0', 'fim', "dimensions: ['date'], rowLimit: 100")),
    qa: http('Buscas · semana', GSC, q('ini', 'fim', "dimensions: ['query'], rowLimit: 500")),
    qb: http('Buscas · semana antes', GSC, q('ini0', 'fim0', "dimensions: ['query'], rowLimit: 500")),
    pg: http('Páginas · semana', GSC, q('ini', 'fim', "dimensions: ['page'], rowLimit: 200")),
    monta: codigo('Monta o relatório', 'search-console-semana.js'),
    tg: no('Telegram · Google orgânico', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, { credentials: TG }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Google orgânico · semana\n**Traz:** Search Console (7 dias que terminam 3 dias antes, contra os 7 anteriores)\n**Envia:** uma mensagem no Telegram toda segunda às 7h07\n**Limites:** menos de 200 palavras; uma ação de 10 minutos; sem alarme (queda só com confirmação). Manual: /webhook/bmh-google-organico-semana?teste=1. Código: integracoes/painel/n8n/search-console-semana.js.', width: 520, height: 220 }),
  };
  const cx = {}; liga(cx, n.agenda.name, n.datas.name); liga(cx, n.manual.name, n.datas.name);
  for (const [a, b] of [[n.datas, n.dia], [n.dia, n.qa], [n.qa, n.qb], [n.qb, n.pg], [n.pg, n.monta], [n.monta, n.tg]]) liga(cx, a.name, b.name);
  return { name: 'BMH · Google orgânico · semana', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- radar de concorrentes e notícias (15/10/2026) ----------------
function fluxoRadar() {
  x = 0;
  const OPENAI = cred('httpHeaderAuth', 'BMH · OpenAI · transcrição de áudio');
  const R = '../../radar/n8n/';
  const n = {
    agenda: no('Todo dia às 6h41', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '41 6 * * *' }] } }),
    manual: no('Rodar agora', 'n8n-nodes-base.webhook', 2, { path: 'bmh-radar', responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),
    le: codigo('Lê as fontes', R + 'radar-le.js', { executeOnce: true }),
    pag: le('Páginas vistas', 'BMH_radar_paginas'), it: le('Notícias vistas', 'BMH_radar_itens'),
    comp: codigo('Compara', R + 'radar-compara.js', { executeOnce: true }),
    temIa: se('Tem leitura com IA?', '={{ !$json.sem_ia }}'),
    ia: no('IA · lê a novidade', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://api.openai.com/v1/chat/completions', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.corpo) }}', options: { timeout: 120000, batching: { batch: { batchSize: 1, batchInterval: 1000 } }, response: { response: { neverError: true, responseFormat: 'json' } } } }, { credentials: OPENAI }),
    aviso: codigo('Monta o aviso', R + 'radar-aviso.js', { executeOnce: true }),
    envia: se('Tem o que avisar?', '={{ $json.enviar }}'),
    tg: no('Telegram · radar', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML', disable_web_page_preview: true } }, { credentials: TG }),
    pgs: no('Páginas a gravar', 'n8n-nodes-base.code', 2, { jsCode: "return $('Monta o aviso').first().json.paginas.map((json) => ({ json }));" }),
    grPg: { ...grava('Grava páginas vistas', 'BMH_radar_paginas'), executeOnce: false },
    its: no('Notícias a gravar', 'n8n-nodes-base.code', 2, { jsCode: "return $('Monta o aviso').first().json.itens.map((json) => ({ json }));" }),
    grIt: grava('Grava notícias vistas', 'BMH_radar_itens'),
    volta: no('Aviso montado', 'n8n-nodes-base.code', 2, { jsCode: "return [{ json: $('Monta o aviso').first().json }];" }, { executeOnce: true }),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Radar · concorrentes e notícias\n**Traz:** páginas públicas de 7 concorrentes (Oxi, Infinita, CHB, HiperCure, Rinnovare, Daher) e notícias do CFM, SBMH (feeds), ANVISA e UHMS\n**Envia:** aviso no Telegram só quando há novidade que importa (mudança de preço, convênio, unidade, serviço) ou notícia do tema, com rascunho de post para aprovar; avisa também site que bloqueou\n**Limites:** regra única de leitura (robots.txt, MadeiroLeitor, 3 s entre pedidos, para no bloqueio, sem disfarce); texto limpo e tratado como dado antes da IA; no máximo 6 leituras com IA por dia; nada publicado; primeira leitura só guarda. Manual: /webhook/bmh-radar?teste=1. Código: integracoes/radar/n8n/.', width: 600, height: 280 }),
  };
  const cx = {}; liga(cx, n.agenda.name, n.le.name); liga(cx, n.manual.name, n.le.name);
  // grava o que foi visto antes de avisar: nada é avisado sem estar gravado (e o aviso é o último passo do "Rodar agora")
  for (const [a, b] of [[n.le, n.pag], [n.pag, n.it], [n.it, n.comp], [n.comp, n.temIa], [n.ia, n.aviso], [n.aviso, n.pgs], [n.pgs, n.grPg], [n.grPg, n.its], [n.its, n.grIt], [n.grIt, n.volta], [n.volta, n.envia]]) liga(cx, a.name, b.name);
  cx[n.temIa.name] = { main: [[{ node: n.ia.name, type: 'main', index: 0 }], [{ node: n.aviso.name, type: 'main', index: 0 }]] };
  cx[n.envia.name] = { main: [[{ node: n.tg.name, type: 'main', index: 0 }], []] };
  return { name: 'BMH · Radar · concorrentes e notícias', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };
}

// ---------------- vigia de fluxos parados (15/10/2026) ----------------
// cada fluxo agendado anota em BMH_vigia quando começou; prazo máximo em horas, com folga (nunca alarme falso)
const VIGIA = { radar: 26, organico: 170, grava: 26, igut: 26, guardiao: 26, resumo: 26, numeros: 26, medicao: 170, mensal: 745, plantoes: 745, avaliacoes: 11 };
function comVigia(chave, f) {
  if (!VIGIA[chave]) return f;
  const gatilhos = f.nodes.filter((n) => n.type === 'n8n-nodes-base.scheduleTrigger'); if (!gatilhos.length) return f;
  const marca = no('Vigia · marca que rodou', 'n8n-nodes-base.code', 2, { jsCode: `return [{ json: { chave: '${chave}', nome: ${JSON.stringify(f.name)}, ultima_vez: $now.toISO(), max_horas: ${VIGIA[chave]}, avisado_em: '' } }];` });
  const gr = { ...grava('Vigia · grava', 'BMH_vigia'), onError: 'continueRegularOutput' };
  marca.position = [gatilhos[0].position[0] + 260, gatilhos[0].position[1] + 420]; gr.position = [marca.position[0] + 260, marca.position[1]];
  f.nodes.push(marca, gr);
  for (const g of gatilhos) liga(f.connections, g.name, marca.name);
  liga(f.connections, marca.name, gr.name);
  return f;
}
function fluxoVigia() {
  x = 0;
  const n = {
    agenda: no('De hora em hora (7h–22h)', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '23 7-22 * * *' }] } }),
    manual: no('Rodar agora', 'n8n-nodes-base.webhook', 2, { path: 'bmh-vigia', responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),
    tab: le('Vigia (tabela)', 'BMH_vigia'),
    atr: codigo('Atrasados', 'vigia-atrasados.js'),
    tg: no('Telegram · fluxo parado', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, { credentials: TG }),
    marca: no('Marca o aviso', 'n8n-nodes-base.code', 2, { jsCode: "return $('Atrasados').first().json.avisar.map((json) => ({ json }));" }),
    gr: grava('Grava o aviso', 'BMH_vigia'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Vigia · fluxos parados\n**Traz:** BMH_vigia (cada fluxo agendado anota quando começou)\n**Envia:** aviso no Telegram quando um fluxo passou do prazo normal sem rodar\n**Limites:** um aviso por problema; só das 7h às 22h; prazo com folga (diário 26 h, avaliações 11 h, semanal 170 h, mensal 745 h). Erro de execução fica com o Alerta de falha; execução travada estoura o limite de 1 h e vira erro. Manual: /webhook/bmh-vigia. Código: integracoes/painel/n8n/vigia-atrasados.js.', width: 560, height: 240 }),
  };
  const cx = {}; liga(cx, n.agenda.name, n.tab.name); liga(cx, n.manual.name, n.tab.name);
  for (const [a, b] of [[n.tab, n.atr], [n.atr, n.tg], [n.tg, n.marca], [n.marca, n.gr]]) liga(cx, a.name, b.name);
  return { name: 'BMH · Vigia · fluxos parados', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'all' }) };
}

// ---------------- nota do Google para o site (14/10/2026) ----------------
function fluxoNota() {
  x = 0;
  const n = {
    pedido: no('Pedido do site', 'n8n-nodes-base.webhook', 2, { path: 'bmh-nota-google', responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    nota: no('Nota e total por unidade', 'n8n-nodes-base.code', 2, { jsCode: ler('../../perfil-google/n8n/nota-site.js').replace('__CHAVE__', process.env.NOTA_GOOGLE_CHAVE) }),
    nota_: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Perfil do Google · nota para o site\n**Traz:** nota e total de avaliações das duas fichas\n**Envia:** a resposta para o snippet do site\n**Limites:** só com a chave; só lê\n\nChamado pelo snippet "BMH · nota do Google" do WordPress (no máximo 2 vezes por dia, com chave): devolve a nota e o total de avaliações da Asa Sul e de Taguatinga, que a home mostra. Só leitura. Código em integracoes/perfil-google/n8n/nota-site.js.', width: 520, height: 200 }),
  };
  const cx = {}; liga(cx, n.pedido.name, n.token.name); liga(cx, n.token.name, n.nota.name);
  return { name: 'BMH · Perfil do Google · nota para o site', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };
}

// ---------------- avaliações do Perfil do Google (14/10/2026) ----------------
function fluxoAvaliacoes() {
  x = 0;
  IDS.avaliacoes ||= { caminho: 'bmh-perfil-avaliacoes-' + crypto.randomBytes(6).toString('hex') };
  const OPENAI = cred('httpHeaderAuth', 'BMH · OpenAI · transcrição de áudio');
  const n = {
    agenda: no('A cada 30 min (7h–21h)', 'n8n-nodes-base.scheduleTrigger', 1.2, { rule: { interval: [{ field: 'cronExpression', expression: '7,37 7-21 * * *' }] } }),
    manual: no('Rodar agora', 'n8n-nodes-base.webhook', 2, { path: IDS.avaliacoes.caminho, responseMode: 'lastNode', options: {} }, { webhookId: crypto.randomUUID() }),
    token: no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://oauth2.googleapis.com/token', authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendBody: true, contentType: 'json', specifyBody: 'json', jsonBody: '{}', options: {} }, { credentials: ADS, executeOnce: true }),
    perfil: codigo('Avaliações do perfil', '../../perfil-google/n8n/avaliacoes-le.js', { executeOnce: true }),
    ja: le('Já propostas', 'BMH_avaliacoes_google'),
    novas: codigo('Novas', '../../perfil-google/n8n/avaliacoes-novas.js', { executeOnce: true }),
    ia: no('IA · escreve a resposta', 'n8n-nodes-base.httpRequest', 4.2, { method: 'POST', url: 'https://api.openai.com/v1/chat/completions', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.corpo) }}', options: { timeout: 120000, batching: { batch: { batchSize: 1, batchInterval: 500 } }, response: { response: { neverError: true, responseFormat: 'json' } } } }, { credentials: OPENAI }),
    confere: codigo('Confere a resposta', '../../perfil-google/n8n/avaliacoes-confere.js'),
    teste: se('Só teste?', "={{ $('Avaliações do perfil').first().json.teste }}"),
    tgTeste: no('Telegram · teste', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' } }, { credentials: TG }),
    tg: no('Telegram · sugestão', 'n8n-nodes-base.telegram', 1.2, { chatId: CHAT, text: '={{ $json.texto }}', additionalFields: { appendAttribution: false, parse_mode: 'HTML' }, replyMarkup: 'inlineKeyboard',
      inlineKeyboard: { rows: [{ row: { buttons: [{ text: '✅ Publicar', additionalFields: { callback_data: '=av:{{ $json.codigo }}:p' } }, { text: '⏭️ Ignorar', additionalFields: { callback_data: '=av:{{ $json.codigo }}:i' } }] } }] } }, { credentials: TG }),
    onde: codigo('Onde ficou a mensagem', '../../perfil-google/n8n/avaliacoes-mensagem.js'),
    grava: grava('Grava a proposta', 'BMH_avaliacoes_google'),
    nota: no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, { content: '## BMH · Perfil do Google · avaliações\n**Traz:** avaliações sem resposta das duas fichas\n**Envia:** sugestão de resposta no Telegram\n**Limites:** nada é publicado sem o toque do Jorge; até 5 por rodada; não repete avaliação\n\nA cada 30 min, das 7h às 21h: avaliação sem resposta nos perfis Asa Sul e Taguatinga → sugestão (gpt-5.5, regras da skill responder-avaliacoes, seção BMH, com sigilo de cirurgia e sessão; 4 ou 5 estrelas sem texto usa frase curta pronta) → Telegram (robô BMH alertas) com Publicar / Ignorar; responder à mensagem com outro texto publica esse texto (fluxo BMH · Telegram · botões). Até 5 por rodada. Nada é publicado sem o toque do Jorge. Tabela BMH_avaliacoes_google (código, unidade, nota, data, sugestão, decisão; sem nome nem texto de quem avaliou). Teste: /webhook/' + IDS.avaliacoes.caminho + '?modo=teste&simular=1 (2 mais recentes, não grava nem publica). Código em integracoes/perfil-google/n8n/.', width: 600, height: 280 }),
  };
  const cx = {};
  liga(cx, n.agenda.name, n.token.name); liga(cx, n.manual.name, n.token.name);
  for (const [a, b] of [[n.token, n.perfil], [n.perfil, n.ja], [n.ja, n.novas], [n.novas, n.ia], [n.ia, n.confere], [n.confere, n.teste], [n.tg, n.onde], [n.onde, n.grava]]) liga(cx, a.name, b.name);
  cx[n.teste.name] = { main: [[{ node: n.tgTeste.name, type: 'main', index: 0 }], [{ node: n.tg.name, type: 'main', index: 0 }]] };
  return { name: 'BMH · Perfil do Google · avaliações', nodes: Object.values(n), connections: cx, settings: ajustes({ saveDataSuccessExecution: 'none' }) };   // texto das avaliações não fica guardado
}

(async () => {
  IDS.fluxos = IDS.fluxos || {};
  const tags = (await api('tags?limit=100', 'GET')).data || []; const tagBMH = tags.find((t) => t.name === 'BMH');
    const so = process.argv.slice(2);   // ex.: node montar.js pagina guardiao (só esses)
  // o alerta vem primeiro: os outros precisam do id dele (errorWorkflow)
  const fluxos = { alerta: fluxoAlerta, grava: fluxoGrava, pagina: fluxoPagina, igut: fluxoIgut, guardiao: fluxoGuardiao, botoes: fluxoBotoes, resumo: fluxoResumo, medicao: fluxoMedicao, mensal: fluxoMensal, numeros: fluxoNumeros, diretoria: fluxoPainelDiretoria, plantoes: fluxoPlantoes, plantoesEmails: fluxoPlantoesEmails, avaliacoes: fluxoAvaliacoes, nota: fluxoNota, vigia: fluxoVigia, organico: fluxoSearchConsole, radar: fluxoRadar };
  for (const [chave, monta] of Object.entries(fluxos).filter(([k]) => !so.length || so.includes(k))) {
    const f = comVigia(chave, monta());
    if (!/^BMH · /.test(f.name)) throw new Error('nome sem BMH');
    let id = IDS.fluxos[chave];
    if (id) { await api('workflows/' + id, 'PUT', f); console.log('atualizado:', f.name, id); }
    else { const r = await api('workflows', 'POST', f); id = IDS.fluxos[chave] = r.id; console.log('criado:', f.name, id); }
    fs.writeFileSync(path.join(RAIZ, 'n8n-ids.json'), JSON.stringify(IDS, null, 1));
    if (tagBMH) await api(`workflows/${id}/tags`, 'PUT', [{ id: tagBMH.id }]);
    const atual = await api('workflows/' + id, 'GET');
    if (!atual.active) {   // o alerta também: desligado, o n8n não chama o fluxo de erro (conferido em 12/10/2026)
      await api(`workflows/${id}/activate`, 'POST'); console.log('  ligado'); }
  }
  fs.writeFileSync(path.join(RAIZ, 'n8n-ids.json'), JSON.stringify(IDS, null, 1));
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
