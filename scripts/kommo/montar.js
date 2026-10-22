#!/usr/bin/env node
/**
 * Monta o Kommo da BMH pela API (22/10/2026, "o motor antes da assinatura"): funil "Atendimento BMH", etapas, campos do
 * lead, etiquetas e motivos de perda, como aprovado no documento "BMH no Kommo: plano para aprovação". Pode rodar de novo:
 * o que já existe (mesmo nome) é reaproveitado, nunca duplicado. Grava os ids em integracoes/kommo/ids.json (não são
 * segredo) e, no modo real, na chave `kommo_campos` de BMH_config, que o fluxo de origem lê.
 *
 * Uso:
 *   node --env-file=.env scripts/kommo/montar.js            ensaio: mostra o que faria (sem chave, nem lê o Kommo)
 *   node --env-file=.env scripts/kommo/montar.js --real     cria no Kommo (no primeiro dia do teste grátis)
 * .env: KOMMO_BMH_DOMINIO (ex.: hiperbaricabrasilia.kommo.com) e KOMMO_BMH_TOKEN (token de longa duração da integração
 * privada; gravar com scripts/guardar-chave.sh, nunca no chat).
 *
 * Lições da Nexo (integracoes/kommo/api-anotacoes.md da Nexo): no máximo 5 chamadas por segundo (estourar bloqueou a API
 * por mais de 30 min); as etapas de sistema (entrada, ganho 142 e perdido 143) não mudam pela API: "Concluiu" é o ganho e
 * o nome se ajusta na tela; páginas de 250; resposta application/hal+json; página vazia = 204 sem corpo.
 */
const fs = require('fs'), path = require('path');
const REAL = process.argv.includes('--real');
const RAIZ = path.join(__dirname, '..', '..');
const ARQ_IDS = path.join(RAIZ, 'integracoes', 'kommo', 'ids.json');
const FRASES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'integracoes', 'origem', 'frases.json'), 'utf8')).frases;

// ---------- o desenho aprovado ----------
const FUNIL = { nome: 'Atendimento BMH', etapas: ['Novo contato', 'Em conversa', 'Aguardando convênio', 'Avaliação agendada', 'Em tratamento'] };
const ORIGENS = [...new Set(FRASES.map((f) => f.origem)), 'anúncio Meta', 'outro'];
const CAMPOS = [
  { chave: 'origem', nome: 'Origem', tipo: 'select', opcoes: ORIGENS },
  { chave: 'utm_source', nome: 'utm_source', tipo: 'text' }, { chave: 'utm_medium', nome: 'utm_medium', tipo: 'text' },
  { chave: 'utm_campaign', nome: 'utm_campaign', tipo: 'text' }, { chave: 'utm_content', nome: 'utm_content', tipo: 'text' },
  { chave: 'utm_term', nome: 'utm_term', tipo: 'text' },
  { chave: 'gclid', nome: 'gclid', tipo: 'text' }, { chave: 'fbclid', nome: 'fbclid', tipo: 'text' },
  { chave: 'ctwa_clid', nome: 'ctwa_clid', tipo: 'text' }, { chave: 'id_anuncio', nome: 'id do anúncio', tipo: 'text' },
  { chave: 'cirurgiao_indicou', nome: 'Cirurgião que indicou', tipo: 'text' },
  { chave: 'unidade', nome: 'Unidade', tipo: 'select', opcoes: ['Asa Sul', 'Taguatinga'] },
  { chave: 'pagamento', nome: 'Particular ou convênio', tipo: 'select', opcoes: ['Particular', 'Convênio'] },
  { chave: 'convenio', nome: 'Convênio', tipo: 'text' },   // texto: a lista de 50 muda; a recepção digita como no iGut
  { chave: 'tipo_caso', nome: 'Tipo de caso', tipo: 'select', opcoes: ['Pós-operatório', 'Ferida', 'Mergulho', 'Outro'] },
  { chave: 'id_igut', nome: 'Código do iGut', tipo: 'text' },
];
const ETIQUETAS = ['anúncio meta', 'google', 'site', 'cirurgião', 'instagram dr jorge', 'instagram bmh', 'fora do horário', 'não é oportunidade', 'confirmado'];
const MOTIVOS = ['Convênio não cobre', 'Preço', 'Sem indicação médica', 'Sumiu', 'Só dúvida / agora não', 'Escolheu outro lugar', 'Fora do perfil'];

// ---------- API ----------
const { KOMMO_BMH_DOMINIO: DOM, KOMMO_BMH_TOKEN: TOKEN } = process.env;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ultima = 0;
async function api(rota, metodo = 'GET', corpo) {
  const falta = 220 - (Date.now() - ultima); if (falta > 0) await espera(falta); ultima = Date.now();   // até 5 por segundo
  const r = await fetch(`https://${DOM}/api/v4/${rota}`, { method: metodo, headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: corpo ? JSON.stringify(corpo) : undefined });
  if (r.status === 204) return {};
  const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch (e) {}
  if (!r.ok) throw new Error(`${metodo} ${rota}: ${r.status} ${t.slice(0, 300)}`);
  return j;
}
const todos = async (rota, chave) => { const out = []; for (let p = 1; p < 50; p++) { const j = await api(`${rota}${rota.includes('?') ? '&' : '?'}limit=250&page=${p}`); const l = j?._embedded?.[chave] || []; out.push(...l); if (l.length < 250) break; } return out; };

async function main() {
  if (!REAL) {
    console.log('ENSAIO (nada é criado; use --real no primeiro dia do teste grátis)\n');
    console.log(`Funil "${FUNIL.nome}": ${FUNIL.etapas.join(' › ')} › [ganho: renomear para "Concluiu" na tela] / [perdido]`);
    console.log(`Campos do lead (${CAMPOS.length}):`); for (const c of CAMPOS) console.log(`  - ${c.nome} (${c.tipo}${c.opcoes ? ': ' + c.opcoes.join(', ') : ''})`);
    console.log(`Etiquetas (${ETIQUETAS.length}): ${ETIQUETAS.join(', ')}`);
    console.log(`Motivos de perda (${MOTIVOS.length}): ${MOTIVOS.join(' · ')}`);
    console.log('\nNa tela, depois do --real: webhook de conta (mensagem recebida) para o fluxo "BMH · Kommo · origem do lead";');
    console.log('robô "fora do horário" (7h às 19h); tarefa de 15 min sem resposta; tarefa de 3 dias úteis em "Aguardando convênio".');
    console.log(DOM && TOKEN ? '\nChave do Kommo encontrada no .env.' : '\nAinda sem KOMMO_BMH_DOMINIO e KOMMO_BMH_TOKEN no .env (normal antes do teste grátis).');
    return;
  }
  if (!DOM || !TOKEN) throw new Error('Falta KOMMO_BMH_DOMINIO ou KOMMO_BMH_TOKEN no .env.');
  if (/centromediconexo|nexo/i.test(DOM)) throw new Error('domínio parece ser o da Nexo: a chave de uma empresa não vai para a outra');
  const ids = fs.existsSync(ARQ_IDS) ? JSON.parse(fs.readFileSync(ARQ_IDS, 'utf8')) : {};

  // funil e etapas
  const funis = (await api('leads/pipelines'))?._embedded?.pipelines || [];
  let funil = funis.find((f) => f.name === FUNIL.nome);
  if (!funil) {
    const r = await api('leads/pipelines', 'POST', [{ name: FUNIL.nome, sort: 10, is_main: true, _embedded: { statuses: FUNIL.etapas.map((name, i) => ({ name, sort: (i + 1) * 10 })) } }]);
    funil = r._embedded.pipelines[0]; console.log('funil criado:', funil.id);
  } else console.log('funil já existia:', funil.id);
  const etapas = (await api(`leads/pipelines/${funil.id}/statuses`))?._embedded?.statuses || [];
  for (const [i, nome] of FUNIL.etapas.entries()) if (!etapas.find((e) => e.name === nome)) { await api(`leads/pipelines/${funil.id}/statuses`, 'POST', [{ name: nome, sort: (i + 1) * 10 }]); console.log('etapa criada:', nome); }
  const etapasAgora = (await api(`leads/pipelines/${funil.id}/statuses`))?._embedded?.statuses || [];
  ids.funil = funil.id; ids.etapas = Object.fromEntries(etapasAgora.map((e) => [e.name, e.id]));

  // campos do lead
  const campos = await todos('leads/custom_fields', 'custom_fields'); ids.campos = ids.campos || {};
  for (const c of CAMPOS) {
    let f = campos.find((x) => x.name === c.nome);
    if (!f) { const r = await api('leads/custom_fields', 'POST', [{ name: c.nome, type: c.tipo, ...(c.opcoes ? { enums: c.opcoes.map((value, i) => ({ value, sort: (i + 1) * 10 })) } : {}) }]); f = r._embedded.custom_fields[0]; console.log('campo criado:', c.nome); }
    ids.campos[c.chave] = f.id;
  }
  // etiquetas
  const tags = await todos('leads/tags', 'tags'); const novas = ETIQUETAS.filter((t) => !tags.find((x) => x.name === t));
  if (novas.length) { await api('leads/tags', 'POST', novas.map((name) => ({ name }))); console.log('etiquetas criadas:', novas.join(', ')); }
  // motivos de perda: a API pública pode não ter essa rota; sem ela, ficam para a tela
  try { const lr = await todos('leads/loss_reasons', 'loss_reasons'); const falta = MOTIVOS.filter((m) => !lr.find((x) => x.name === m));
    if (falta.length) { await api('leads/loss_reasons', 'POST', falta.map((name, i) => ({ name, sort: (i + 1) * 10 }))); console.log('motivos criados:', falta.join(' · ')); } }
  catch (e) { console.log('motivos de perda: criar na tela (Configurações › Motivos de perda):', MOTIVOS.join(' · '), `(${e.message.slice(0, 80)})`); }

  fs.writeFileSync(ARQ_IDS, JSON.stringify(ids, null, 1)); console.log('ids gravados em', path.relative(RAIZ, ARQ_IDS));
  // a chave que o fluxo de origem lê (a API do n8n insere linha, mas não altera: se já existir, avisa)
  const N = process.env.N8N_URL, K = process.env.N8N_API_KEY, IDS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'integracoes', 'painel', 'n8n-ids.json'), 'utf8'));
  const cfg = await (await fetch(`${N}/api/v1/data-tables/${IDS.tabelas.BMH_config}/rows?limit=100`, { headers: { 'X-N8N-API-KEY': K } })).json();
  if ((cfg.data || []).find((r) => r.chave === 'kommo_campos')) console.log('ATENÇÃO: kommo_campos já existe em BMH_config; conferir se os ids batem com', JSON.stringify(ids.campos));
  else { await fetch(`${N}/api/v1/data-tables/${IDS.tabelas.BMH_config}/rows`, { method: 'POST', headers: { 'X-N8N-API-KEY': K, 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [{ chave: 'kommo_campos', valor: JSON.stringify(ids.campos) }] }) }); console.log('kommo_campos gravado em BMH_config'); }
}
main().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
