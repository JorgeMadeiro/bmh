#!/usr/bin/env node
/**
 * Acesso às APIs do Google com a conta de serviço da BMH (bmh-site@bmh-integracoes.iam.gserviceaccount.com).
 * A chave fica FORA do projeto, em ~/.config/bmh/bmh-site.json; o .env só guarda o caminho (GOOGLE_SA_JSON).
 * Nunca imprime a chave nem o token.
 *
 * Uso:
 *   node --env-file=.env scripts/google-api.js conferir        testa Tag Manager, Analytics e Search Console (só leitura)
 *   require('./google-api').chamar(url, { escopos, metodo, corpo })   dentro de outros scripts
 */
const fs = require('fs');
const crypto = require('crypto');

const ESCOPOS = {
  gtmLer: 'https://www.googleapis.com/auth/tagmanager.readonly',
  gtmEditar: 'https://www.googleapis.com/auth/tagmanager.edit.containers',
  gtmVersoes: 'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
  gtmPublicar: 'https://www.googleapis.com/auth/tagmanager.publish',
  gaLer: 'https://www.googleapis.com/auth/analytics.readonly',
  gaEditar: 'https://www.googleapis.com/auth/analytics.edit',
  gsc: 'https://www.googleapis.com/auth/webmasters.readonly',
};

const cache = {};
async function token(escopos) {
  const chave = escopos.slice().sort().join(' ');
  if (cache[chave] && cache[chave].expira > Date.now() + 60000) return cache[chave].valor;
  const caminho = process.env.GOOGLE_SA_JSON;
  if (!caminho || !fs.existsSync(caminho)) throw new Error('GOOGLE_SA_JSON não aponta para a chave da conta de serviço.');
  const sa = JSON.parse(fs.readFileSync(caminho, 'utf8'));
  const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
  const agora = Math.floor(Date.now() / 1000);
  const corpo = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: sa.client_email, scope: chave, aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600 });
  const assinatura = crypto.createSign('RSA-SHA256').update(corpo).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: corpo + '.' + assinatura }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('token recusado: ' + (j.error_description || j.error));
  cache[chave] = { valor: j.access_token, expira: Date.now() + j.expires_in * 1000 };
  return j.access_token;
}

async function chamar(url, { escopos = [ESCOPOS.gtmLer], metodo = 'GET', corpo } = {}) {
  const t = await token(escopos);
  const r = await fetch(url, { method: metodo, headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: corpo ? JSON.stringify(corpo) : undefined });
  const texto = await r.text();
  let j; try { j = JSON.parse(texto); } catch { j = { texto }; }
  if (!r.ok) { const e = new Error(`${r.status} ${(j.error && j.error.message) || texto.slice(0, 200)}`); e.status = r.status; throw e; }
  return j;
}

module.exports = { chamar, token, ESCOPOS };

if (require.main === module && process.argv[2] === 'conferir') {
  (async () => {
    const linha = (rot, f) => f().then((v) => console.log('OK  ', rot, v)).catch((e) => console.log('FALHA', rot, e.message));
    await linha('Tag Manager · contas', async () => {
      const j = await chamar('https://tagmanager.googleapis.com/tagmanager/v2/accounts', { escopos: [ESCOPOS.gtmLer] });
      return (j.account || []).map((a) => `${a.name} "${a.accountId ? a.name : ''}"`.replace(/ ""$/, '')).join(' | ') || 'nenhuma';
    });
    await linha('Tag Manager · contêineres da conta 6207699487', async () => {
      const j = await chamar('https://tagmanager.googleapis.com/tagmanager/v2/accounts/6207699487/containers', { escopos: [ESCOPOS.gtmLer] });
      return (j.container || []).map((c) => `${c.publicId} (${c.containerId}) ${c.name}`).join(' | ');
    });
    await linha('Analytics · contas e propriedades', async () => {
      const j = await chamar('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', { escopos: [ESCOPOS.gaLer] });
      return (j.accountSummaries || []).map((a) => `${a.displayName} [${a.account}] → ` + (a.propertySummaries || []).map((p) => `${p.displayName} [${p.property}]`).join(', ')).join(' | ') || 'nenhuma';
    });
    await linha('Search Console · sites', async () => {
      const j = await chamar('https://www.googleapis.com/webmasters/v3/sites', { escopos: [ESCOPOS.gsc] });
      return (j.siteEntry || []).map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(' | ') || 'nenhum';
    });
  })();
}
