// Recebe o webhook oficial da Meta (app da BMH assinando o WhatsApp da recepção em coexistência com o Kommo, 22/10/2026)
// e devolve uma linha por mensagem, no mesmo formato do "Prepara a mensagem" da Evolution, para o "Monta a linha" servir
// aos dois. Três entradas viram linha:
//   - messages (o paciente escreveu): direcao paciente; traz o referral do anúncio de clique para WhatsApp, se houver;
//   - smb_message_echoes (a equipe respondeu pelo app do celular): direcao equipe, aparelho "celular";
//   - statuses "sent" de mensagem que não nasceu no celular (a equipe respondeu pelo Kommo): direcao equipe, aparelho
//     "kommo", sem texto (a Meta não manda o texto a outro app). Serve para o tempo de resposta. A conferir no teste grátis.
// Ficam de fora: reação, mensagem de sistema, sem suporte, histórico (o Kommo traz), e os outros status.
const b = $('Recebe da Meta').first().json.body || {};
if (b.object !== 'whatsapp_business_account') return [];
const TIPOS = { text: 'texto', image: 'imagem', audio: 'áudio', video: 'vídeo', document: 'documento', sticker: 'figurinha',
  location: 'localização', contacts: 'contato', interactive: 'botão', button: 'botão', order: 'pedido' };
const IGNORA = /^(reaction|system|unsupported|ephemeral|request_welcome)$/;
const dia = (ts) => new Date(ts * 1000 - 3 * 3600 * 1000).toISOString().slice(0, 10);   // dia em Brasília
const textoDe = (m) => m.text?.body || m.image?.caption || m.video?.caption || m.document?.caption
  || m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || m.button?.text || '';
const out = [];
for (const e of b.entry || []) for (const c of e.changes || []) {
  const v = c.value || {};
  const linha = (m, extra) => {
    const ts = Number(m.timestamp) || Math.floor(Date.now() / 1000);
    const tipo = TIPOS[m.type] || m.type || 'outro';
    return { json: { msg_id: m.id, momento: new Date(ts * 1000).toISOString(), dia: dia(ts), numero_oculto: false, tipo,
      texto: textoDe(m), transcrever: m.type === 'audio', media_id: m.audio?.id || '', respondendo: m.context?.id || '',
      guardar_meses: 1, ...extra } };   // 1 mês de guarda no início (Jorge, 22/10/2026)
  };
  if (c.field === 'messages') {
    for (const m of v.messages || []) {
      if (!m || !m.id || IGNORA.test(m.type || '')) continue;
      const r = m.referral || {};
      out.push(linha(m, { telefone: m.from || '', direcao: 'paciente', aparelho: '',
        anuncio_id: r.source_type === 'ad' ? (r.source_id || '') : '', ctwa_clid: r.ctwa_clid || '',
        referral_tipo: r.source_type || '', referral_titulo: r.headline || '' }));
    }
    for (const s of v.statuses || []) {
      // "sent" de mensagem mandada pela API (o Kommo). O que a equipe manda pelo celular chega como eco, não como status.
      if (!s || s.status !== 'sent' || !s.id) continue;
      out.push({ json: { msg_id: s.id, momento: new Date(Number(s.timestamp) * 1000).toISOString(), dia: dia(Number(s.timestamp)),
        telefone: s.recipient_id || '', numero_oculto: false, direcao: 'equipe', aparelho: 'kommo', tipo: 'sem texto', texto: '',
        transcrever: false, media_id: '', respondendo: '', guardar_meses: 1 } });
    }
  } else if (c.field === 'smb_message_echoes') {
    for (const m of v.message_echoes || []) {
      if (!m || !m.id || IGNORA.test(m.type || '')) continue;
      out.push(linha(m, { telefone: m.to || '', direcao: 'equipe', aparelho: 'celular' }));
    }
  }
}
return out;
