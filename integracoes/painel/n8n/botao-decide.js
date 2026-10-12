// Decide o toque em Aplicar ou Ignorar de uma proposta do guardião. Aplicar muda no Google Ads na hora, com travas:
// só a conta da BMH (5066798424), só pausar ou BAIXAR orçamento, só proposta de hoje ou de ontem ainda não decidida, e o
// orçamento só se ainda estiver no valor da proposta (se alguém mexeu depois, não aplica). Grava a decisão no registro.
const b = $('Lê o botão').first().json, CONTA = '5066798424';
const cod = s => { let x = 0x811c9dc5; for (const c of String(s)) { x ^= c.codePointAt(0); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(36); };
const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const agora = $now.setZone('America/Sao_Paulo'), ontem = agora.startOf('day').minus({ days: 1 }).toISODate();
const r = $('Registro').all().map(i => i.json).find(x => x && x.chave && cod(x.chave) === b.id && x.data >= ontem);
const fim = (selo, resposta, { gravar = '', editar = true, alerta = false } = {}) => [{ json: { ...(gravar ? { ...r, resultado: gravar } : {}), gravar: !!gravar, editar, alerta,
  chat_id: b.chat_id, message_id: b.message_id, query_id: b.query_id, texto_final: b.texto + '\n\n' + selo, resposta } }];
if (!r) return fim('⚠️ Proposta vencida ou não encontrada (vale no dia e no seguinte). Nada mudou.', 'Proposta vencida. Nada mudou.');
if (r.resultado !== 'simulado') return fim('ℹ️ Já decidida antes: ' + r.resultado, 'Já decidida antes.');
if (b.decisao === 'ignorar') return fim('⏭️ Ignorado por ' + b.quem + ' às ' + agora.toFormat('HH:mm') + '. Nada mudou.', 'Ignorado.', { gravar: 'ignorado por ' + b.quem + ' (Telegram)' });
const token = $('Google · renova o acesso').first().json.access_token;
const pede = (rota, body) => this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/${rota}`, headers: { Authorization: 'Bearer ' + token },
  body, json: true, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 60000 });
try {
  if (!token) throw new Error('sem acesso ao Google Ads');
  if (!String(r.alvo_id).startsWith(`customers/${CONTA}/`)) throw new Error('alvo fora da conta da BMH');
  let m;
  if (r.tipo === 'orcamento_google') {
    const novo = Number(r.valor_novo), antes = Number(r.valor_antes);
    if (!(novo > 0 && novo < antes)) throw new Error('o guardião só baixa orçamento');
    const q = await pede('googleAds:search', { query: `SELECT campaign_budget.amount_micros FROM campaign_budget WHERE campaign_budget.resource_name = '${r.alvo_id}'` });
    const atual = Number(q.body?.results?.[0]?.campaignBudget?.amountMicros || 0) / 1e6;
    if (Math.abs(atual - antes) > 0.01) return fim(`⚠️ Não apliquei: o orçamento mudou depois da proposta (agora ${brl(atual)}/dia).`, 'O orçamento mudou: não apliquei.', { gravar: 'não aplicado: orçamento mudou antes do toque' });
    m = await pede('campaignBudgets:mutate', { operations: [{ update: { resourceName: r.alvo_id, amountMicros: String(Math.round(novo * 100) * 10000) }, updateMask: 'amount_micros' }] });
  } else if (r.tipo === 'grupo' || r.tipo === 'campanha') {
    m = await pede(r.tipo === 'grupo' ? 'adGroups:mutate' : 'campaigns:mutate', { operations: [{ update: { resourceName: r.alvo_id, status: 'PAUSED' }, updateMask: 'status' }] });
  } else throw new Error('tipo de ação desconhecido: ' + r.tipo);
  if (m.statusCode !== 200) throw new Error('Google Ads respondeu ' + m.statusCode + ': ' + JSON.stringify(m.body).slice(0, 150));
} catch (e) {
  // falha passageira: não fecha a proposta (os botões continuam valendo) e mostra o motivo
  return fim('', ('Não apliquei: ' + String(e.message)).slice(0, 190), { editar: false, alerta: true });
}
return fim('✅ Aplicado no Google Ads por ' + b.quem + ' às ' + agora.toFormat('HH:mm') + '.', 'Aplicado no Google Ads.', { gravar: 'aplicado por ' + b.quem + ' (Telegram)' });
