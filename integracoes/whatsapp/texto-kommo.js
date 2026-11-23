// Texto do que saiu pelo Kommo (22/11/2026, pedido do Jorge: "pode buscar o texto das mensagens do Kommo"). O recebedor oficial
// da Meta não recebe o que sai pelo Kommo (salesbot e recepção): conferido em 22/11/2026, 162 mensagens do Kommo em 24 h e
// nenhuma linha delas em BMH_whatsapp_meta (as linhas "sem texto" eram do robô do n8n). Aqui: eventos outgoing_chat_message do
// Kommo → mensagem da conversa (texto) → telefone do contato em código → linha nova em BMH_whatsapp_meta (chave "kommo:<id>"),
// direção equipe, aparelho kommo, texto mascarado como no recebedor. Se já existir linha sem texto do mesmo telefone até 3 min
// de diferença, preenche essa em vez de criar outra.
/*__SHA256__*/
const corpo = (j) => { const t = j && typeof j.data === 'string' ? j.data : j; if (!t) return {}; if (typeof t === 'object') return t; try { return JSON.parse(t); } catch (e) { return {}; } };
const mascara = (s) => String(s || '')
  .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]')
  .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[e-mail]')
  .replace(/(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, '[telefone]');
const { de, ate } = $('Janela').first().json;
// ids das mensagens que o Kommo mandou na janela, por conversa
const quer = new Set(); for (const p of $('Eventos (Kommo)').all()) for (const e of (corpo(p.json)._embedded?.events || []))
  for (const v of e.value_after || []) if (v.message?.id) quer.add(v.message.id);
// conversa → contato
const conversas = $('Conversas a ler').all().map((i) => i.json), contatoDa = {};
$('Conversa (Kommo)').all().forEach((p, k) => { const t = corpo(p.json); if (t.contact_id) contatoDa[conversas[k]?.talk_id] = t.contact_id; });
// contato → telefones em código (com e sem o 9, porque o número que a Meta usa às vezes vem sem o 9)
const hashes = {};
for (const p of $('Contatos (Kommo)').all()) for (const c of (corpo(p.json)._embedded?.contacts || [])) {
  const hs = new Set();
  for (const f of (c.custom_fields_values || []).filter((f) => f.field_code === 'PHONE')) for (const v of f.values || []) {
    let d = String(v.value || '').replace(/\D/g, ''); if (!d) continue; if (!d.startsWith('55') || d.length < 12) d = '55' + d;
    const n = d.slice(2); if (n.length === 11) { hs.add(sha256('55' + n)); hs.add(sha256('55' + n.slice(0, 2) + n.slice(3))); }
    else if (n.length === 10) { hs.add(sha256('55' + n)); hs.add(sha256('55' + n.slice(0, 2) + '9' + n.slice(2))); } }
  hashes[c.id] = hs; }
// mensagens do Kommo com texto
const enviadas = [];
$('Mensagens da conversa').all().forEach((p, k) => { const talk = conversas[k]?.talk_id, hs = hashes[contatoDa[talk]];
  if (!hs || !hs.size) return;
  for (const m of (corpo(p.json)._embedded?.messages || [])) if (m.type === 'outgoing' && quer.has(m.id))
    enviadas.push({ id: m.id, hs, hs_lista: [...hs], quando: Number(m.created_at) * 1000, texto: mascara(m.text) || '[' + (m.message_type || 'mensagem') + ']', autor: m.author?.type || '' }); });
// linhas já gravadas do mesmo telefone (para não repetir e para preencher a que estiver sem texto)
const linhas = $('Mensagens (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
const chaves = new Set(linhas.map((r) => r.chave)), conhecidos = new Set(linhas.map((r) => r.telefone_hash));
const dataSP = (ms) => new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const usadas = new Set(), out = [];
for (const m of enviadas.sort((a, b) => a.quando - b.quando)) {
  if (chaves.has('kommo:' + m.id)) continue;   // já gravada numa rodada anterior
  const perto = linhas.filter((r) => r.aparelho === 'kommo' && m.hs.has(r.telefone_hash) && Math.abs(Date.parse(r.momento) - m.quando) <= 180000);
  if (perto.some((r) => String(r.texto || '').startsWith('[Kommo'))) continue;   // preenchida numa rodada anterior
  const texto = (m.autor === 'bot' ? '[Kommo · robô] ' : '[Kommo] ') + m.texto;
  const vazia = perto.filter((r) => !r.texto && !usadas.has(r.chave)).sort((a, b) => Math.abs(Date.parse(a.momento) - m.quando) - Math.abs(Date.parse(b.momento) - m.quando))[0];
  if (vazia) { usadas.add(vazia.chave); const { id, createdAt, updatedAt, ...r } = vazia; out.push({ json: { ...r, tipo: 'texto', texto } }); continue; }
  const hash = m.hs_lista.find((h) => conhecidos.has(h)) || m.hs_lista[0], apagar = new Date(m.quando); apagar.setMonth(apagar.getMonth() + 1);
  out.push({ json: { chave: 'kommo:' + m.id, momento: new Date(m.quando).toISOString(), dia: dataSP(m.quando), telefone_hash: hash, direcao: 'equipe', aparelho: 'kommo',
    tipo: 'texto', texto, respondendo: '', apagar_em: apagar.toISOString().slice(0, 10), origem: '', anuncio_id: '', ctwa_clid: '', referral_tipo: '' } });
}
return out;
