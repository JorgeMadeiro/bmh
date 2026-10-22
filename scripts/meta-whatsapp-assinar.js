#!/usr/bin/env node
/**
 * Assina o app da BMH ("BMH Integrações", 1104609048722893) nos webhooks da conta de WhatsApp da recepção, AO LADO do Kommo
 * (segundo assinante, como a Nexo fez em 05/10/2026), apontando para o fluxo "BMH · WhatsApp · recebedor oficial (Meta)".
 * Feito em 22/10/2026 para o dia da virada; só funciona depois da coexistência (é ela que cria a conta de WhatsApp).
 *
 *   node --env-file=.env scripts/meta-whatsapp-assinar.js conferir   só lê: contas de WhatsApp do portfólio da BMH, números,
 *                                                                    apps assinados e webhooks do app
 *   node --env-file=.env scripts/meta-whatsapp-assinar.js assinar    registra o webhook (messages e smb_message_echoes) no app
 *                                                                    e assina a conta com o endereço próprio
 *   node --env-file=.env scripts/meta-whatsapp-assinar.js desfazer   tira só a assinatura do app da BMH (o Kommo não é tocado)
 * .env: META_ADS_TOKEN (usuário do sistema "Claude BMH"), META_APP_SECRET (segredo do app: o Jorge grava com o comando que
 * pede a chave escondida), WHATSAPP_WEBHOOK_VERIFY (gerado aqui). Opcional: WHATSAPP_WABA_ID, se houver mais de uma conta.
 * Nada é impresso das chaves.
 */
const fs = require('fs'), path = require('path');
const VERSAO = 'v23.0', APP = '1104609048722893', PORTFOLIO = '3231205376979050';
const IDS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integracoes', 'painel', 'n8n-ids.json'), 'utf8'));
const URL_REC = process.env.N8N_URL.replace(/\/$/, '') + '/webhook/' + IDS.whatsapp.meta;
const { META_ADS_TOKEN: TOK, META_APP_SECRET: SEC, WHATSAPP_WEBHOOK_VERIFY: VT } = process.env;
const g = async (metodo, caminho, token, q = {}) => {
  const u = new URL(`https://graph.facebook.com/${VERSAO}/${caminho}`); const corpo = new URLSearchParams({ ...q, access_token: token });
  const r = metodo === 'GET' || metodo === 'DELETE' ? await fetch(u + '?' + corpo, { method: metodo }) : await fetch(u, { method: metodo, body: corpo });
  const t = await r.text(); try { return JSON.parse(t); } catch (e) { return { resposta: t.slice(0, 300) }; }
};
const mostra = (titulo, r) => console.log(titulo, JSON.stringify(r).replace(/"access_token":"[^"]+"/g, '"access_token":"…"').slice(0, 700));
async function waba() {
  if (process.env.WHATSAPP_WABA_ID) return process.env.WHATSAPP_WABA_ID;
  const contas = [...((await g('GET', `${PORTFOLIO}/owned_whatsapp_business_accounts`, TOK, { fields: 'id,name' })).data || []), ...((await g('GET', `${PORTFOLIO}/client_whatsapp_business_accounts`, TOK, { fields: 'id,name' })).data || [])];
  if (contas.length !== 1) throw new Error(`achei ${contas.length} conta(s) de WhatsApp no portfólio da BMH: ${contas.map((c) => c.id + ' ' + c.name).join(' | ') || 'nenhuma (a coexistência já foi ligada?)'}; ponha a certa em WHATSAPP_WABA_ID`);
  return contas[0].id;
}
(async () => {
  const acao = process.argv[2] || 'conferir';
  if (!TOK) throw new Error('falta META_ADS_TOKEN no .env');
  if (acao === 'conferir') {
    const w = await waba(); console.log('conta de WhatsApp:', w);
    mostra('números:', await g('GET', `${w}/phone_numbers`, TOK, { fields: 'display_phone_number,verified_name,platform_type,is_on_biz_app' }));
    mostra('apps assinados na conta:', await g('GET', `${w}/subscribed_apps`, TOK));
    if (SEC) mostra('webhooks registrados no app da BMH:', await g('GET', `${APP}/subscriptions`, `${APP}|${SEC}`)); else console.log('(sem META_APP_SECRET: não leio os webhooks do app)');
    console.log('endereço do recebedor:', URL_REC.replace(/[a-f0-9]{16}$/, '…'));
  } else if (acao === 'assinar') {
    const falta = [['META_APP_SECRET', SEC], ['WHATSAPP_WEBHOOK_VERIFY', VT]].filter(([, v]) => !v).map(([k]) => k); if (falta.length) throw new Error('falta no .env: ' + falta.join(', '));
    const w = await waba();
    mostra('1. webhook no app (messages, smb_message_echoes):', await g('POST', `${APP}/subscriptions`, `${APP}|${SEC}`, { object: 'whatsapp_business_account', callback_url: URL_REC, verify_token: VT, fields: 'messages,smb_message_echoes' }));
    mostra('2. assina a conta com o endereço próprio:', await g('POST', `${w}/subscribed_apps`, TOK, { override_callback_uri: URL_REC, verify_token: VT }));
    mostra('   apps assinados agora (o Kommo tem de continuar na lista):', await g('GET', `${w}/subscribed_apps`, TOK));
    console.log('\nAgora: mande uma mensagem do seu celular para a recepção. Ela tem de chegar no Kommo E ganhar uma linha em BMH_whatsapp_meta.');
    console.log('Se o Kommo parar de receber: node --env-file=.env scripts/meta-whatsapp-assinar.js desfazer');
  } else if (acao === 'desfazer') {
    const w = await waba(); mostra('tira a assinatura do app da BMH:', await g('DELETE', `${w}/subscribed_apps`, TOK)); mostra('apps assinados agora:', await g('GET', `${w}/subscribed_apps`, TOK));
  } else { console.log('uso: conferir | assinar | desfazer'); process.exit(1); }
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
