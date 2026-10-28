// Vigia dos acessos à conta do Google Ads da BMH (5066798424), 28/10/2026. Depois da saída da Triunfo (acessos removidos em
// 28/10), qualquer acesso novo é estranho. Todo dia lê os vínculos de gerente (MCC), os usuários e os convites pendentes,
// compara com a lista do dia anterior (BMH_config google_acessos_vistos) e avisa só o que entrou. Saída não avisa (só
// atualiza a lista). Na primeira rodada, sem lista anterior, só grava a base e manda uma mensagem de início, sem alarmar.
// Fonte: este arquivo; o montador (monta-acessos-google.py) embute o texto no nó do n8n.

const GAQL_ACESSOS = {
  gerentes: 'SELECT customer_manager_link.manager_customer, customer_manager_link.manager_link_id, customer_manager_link.status FROM customer_manager_link',
  usuarios: 'SELECT customer_user_access.user_id, customer_user_access.email_address, customer_user_access.access_role, customer_user_access.access_creation_date_time, customer_user_access.inviter_user_email_address FROM customer_user_access',
  convites: 'SELECT customer_user_access_invitation.email_address, customer_user_access_invitation.access_role, customer_user_access_invitation.invitation_status, customer_user_access_invitation.creation_date_time FROM customer_user_access_invitation',
};

// Respostas cruas do googleAds:search (results) → lista de acessos com chave estável e texto para o aviso.
function listaAcessos(gerentes, usuarios, convites) {
  const conta = rn => String(rn || '').replace('customers/', '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
  const PAPEL = { ADMIN: 'administrador', STANDARD: 'padrão', READ_ONLY: 'só leitura', EMAIL_ONLY: 'só e-mail' };
  const out = [];
  for (const x of gerentes || []) {
    const l = x.customerManagerLink || {};
    if (!['ACTIVE', 'PENDING'].includes(l.status)) continue;   // recusado, cancelado ou inativo não dá acesso
    out.push({ chave: `gerente|${conta(l.managerCustomer)}|${l.status}`,
      texto: `conta de administração ${conta(l.managerCustomer)} ${l.status === 'ACTIVE' ? 'ligada à conta' : 'com convite pendente'}` });
  }
  for (const x of usuarios || []) {
    const u = x.customerUserAccess || {};
    const email = String(u.emailAddress || '(sem e-mail)').toLowerCase();
    out.push({ chave: `usuario|${email}|${u.accessRole}`,
      texto: `${email} como ${PAPEL[u.accessRole] || u.accessRole}` + (u.inviterUserEmailAddress ? ` (convidado por ${u.inviterUserEmailAddress})` : '') });
  }
  for (const x of convites || []) {
    const c = x.customerUserAccessInvitation || {};
    if (c.invitationStatus !== 'PENDING') continue;
    const email = String(c.emailAddress || '').toLowerCase();
    out.push({ chave: `convite|${email}|${c.accessRole}`, texto: `convite pendente para ${email} como ${PAPEL[c.accessRole] || c.accessRole}` });
  }
  return out.sort((a, b) => (a.chave < b.chave ? -1 : 1));
}

// atuais: listaAcessos; vistosTexto: o JSON guardado na véspera (lista de chaves) ou vazio.
function comparaAcessos(atuais, vistosTexto) {
  let vistos = null;
  try { vistos = vistosTexto ? JSON.parse(vistosTexto) : null; } catch (e) { vistos = null; }
  const chaves = atuais.map(a => a.chave);
  if (!Array.isArray(vistos)) return { base: true, novos: [], saiu: [], guardar: JSON.stringify(chaves) };
  const antes = new Set(vistos), agora = new Set(chaves);
  return { base: false, novos: atuais.filter(a => !antes.has(a.chave)), saiu: vistos.filter(k => !agora.has(k)), guardar: JSON.stringify(chaves) };
}

function mensagemAcessos(r, atuais, teste) {
  const selo = teste ? '🧪 TESTE: nada foi gravado\n' : '';
  if (r.base) return selo + `🔐 Google Ads da BMH · vigia dos acessos começou. Lista de base (${atuais.length}):\n` +
    atuais.map(a => '• ' + a.texto).join('\n') + '\nDaqui em diante, aviso quando entrar alguém novo.';
  if (r.novos.length) return selo + `🔐 Google Ads da BMH · acesso NOVO desde ontem (a Triunfo saiu em 28/10, então ninguém de fora deveria entrar):\n` +
    r.novos.map(a => '• ' + a.texto).join('\n') + '\nSe não foi você, tirar em Google Ads > Administrador > Acesso e segurança.';
  return teste ? selo + `🔐 Google Ads da BMH · nenhum acesso novo (${atuais.length} na lista${r.saiu.length ? `, ${r.saiu.length} saíram` : ''}).` : '';
}
// FIM-DA-FUNCAO (o montador corta daqui para baixo ao embutir no n8n)
if (typeof module !== 'undefined') module.exports = { GAQL_ACESSOS, listaAcessos, comparaAcessos, mensagemAcessos };
