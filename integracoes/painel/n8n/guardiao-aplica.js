// Aplica no Google Ads o que o guardião decidiu (pausar grupo ou campanha, mudar orçamento), só nas regras em modo real e
// nunca na chamada de teste. O resto vira "simulado" ou "aviso".
const CONTA = '5066798424';
const token = $('Google · renova o acesso').first().json.access_token;
const muda = async (servico, update, mask) => {
  const r = await this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/${servico}:mutate`, headers: { Authorization: 'Bearer ' + token },
    body: { operations: [{ update, updateMask: mask }] }, json: true, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 60000 });
  if (r.statusCode !== 200) throw new Error(`HTTP ${r.statusCode}: ${JSON.stringify(r.body).slice(0, 200)}`);
};
const out = [];
for (const { json: a } of $input.all()) {
  let resultado = a.acao === 'avisar' ? 'aviso' : 'simulado';
  if (a.acao !== 'avisar' && a.modo === 'real' && !a.teste) {
    try {
      if (a.tipo === 'grupo') await muda('adGroups', { resourceName: a.alvo_id, status: 'PAUSED' }, 'status');
      else if (a.tipo === 'campanha') await muda('campaigns', { resourceName: a.alvo_id, status: 'PAUSED' }, 'status');
      else if (a.tipo === 'orcamento_google') await muda('campaignBudgets', { resourceName: a.alvo_id, amountMicros: String(Math.round(Number(a.valor_novo) * 100) * 10000) }, 'amount_micros');
      resultado = 'aplicado';
    } catch (e) { resultado = 'falhou: ' + String(e.message).slice(0, 160); }
  }
  out.push({ json: { ...a, resultado } });
}
return out;
