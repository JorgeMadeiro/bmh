// Recebe o messages.upsert da Evolution (instância "BMH Recepção") e devolve uma linha por mensagem de conversa.
// Descarta grupo, status, canal, reação e mensagem de sistema.
const b = $('Recebe da Evolution').first().json.body || {};
if (b.event !== 'messages.upsert' || b.instance !== 'BMH Recepção') return [];
const lista = Array.isArray(b.data) ? b.data : [b.data];
const IGNORA = /^(protocolMessage|reactionMessage|senderKeyDistributionMessage|messageContextInfo|pollUpdateMessage|editedMessage|ephemeralMessage)$/;
const TIPOS = { conversation: 'texto', extendedTextMessage: 'texto', audioMessage: 'áudio', imageMessage: 'imagem', videoMessage: 'vídeo',
  documentMessage: 'documento', documentWithCaptionMessage: 'documento', stickerMessage: 'figurinha', contactMessage: 'contato',
  locationMessage: 'localização', templateMessage: 'modelo', buttonsResponseMessage: 'botão', listResponseMessage: 'lista' };
const out = [];
for (const d of lista) {
  if (!d || !d.key || !d.key.id) continue;
  const k = d.key, jid = k.remoteJid || '';
  if (/@g\.us$|@broadcast$|@newsletter$/.test(jid)) continue;
  const m = d.message || {};
  const bruto = d.messageType || Object.keys(m)[0] || '';
  if (IGNORA.test(bruto)) continue;
  // número: o jid normal ou, quando o WhatsApp esconde o número (@lid), o campo alternativo
  let fone = '';
  for (const c of [jid, k.remoteJidAlt, k.senderPn, k.participantPn]) if (c && /@s\.whatsapp\.net$/.test(c)) { fone = c.split('@')[0]; break; }
  const tipo = TIPOS[bruto] || bruto || 'outro';
  const texto = m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption
    || m.documentWithCaptionMessage?.message?.documentMessage?.caption || m.buttonsResponseMessage?.selectedDisplayText || m.listResponseMessage?.title || '';
  const ts = Number(d.messageTimestamp?.low ?? d.messageTimestamp) || Math.floor(Date.now() / 1000);
  out.push({ json: {
    msg_id: k.id,
    momento: new Date(ts * 1000).toISOString(),
    dia: new Date(ts * 1000 - 3 * 3600 * 1000).toISOString().slice(0, 10),   // dia em Brasília
    telefone: fone || jid.split('@')[0],
    numero_oculto: !fone,
    direcao: k.fromMe ? 'equipe' : 'paciente',
    aparelho: k.fromMe ? (d.source || 'desconhecido') : '',   // de onde a equipe respondeu (android, ios, web, desktop)
    tipo,
    texto,
    transcrever: tipo === 'áudio',
    respondendo: m.extendedTextMessage?.contextInfo?.stanzaId || m.audioMessage?.contextInfo?.stanzaId || '',
  } });
}
return out;
