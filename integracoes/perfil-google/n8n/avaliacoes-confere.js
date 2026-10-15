// Confere a sugestão (tom e sigilo da BMH), monta a linha da tabela e o texto do Telegram. Na tabela vai só o código da
// avaliação, a unidade, a nota, a data e a sugestão: sem nome nem texto de quem avaliou.
const html = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const base = $('Novas').all().map((i) => i.json);
// código curto e fixo por avaliação (o botão do Telegram aceita no máximo 64 caracteres)
const cod = (s) => { let a = 5381, b = 52711; for (const ch of String(s)) { const c = ch.charCodeAt(0); a = ((a * 33) ^ c) >>> 0; b = ((b * 31) + c) >>> 0; } return a.toString(36) + b.toString(36).slice(0, 4); };
const PROIBIDO = /fica feliz com a sua avalia|à disposi|hora marcada|tudo no mesmo lugar|estrutura|na visita|bem atendid|seu retorno|humanizad|excel[êe]ncia|experi[êe]ncia|volte sempre/i;
const SIGILO = /cirurg|cirurgi[ãa]o|lipo|pl[áa]stica|sess[ãaõo]|recupera|cicatriz|p[óo]s[- ]?operat|tratamento|diagn[óo]st|rem[ée]dio/i;
return $input.all().map((it, k) => {
  const r = base[k]; let resp = '', falsa = false, erro = '';
  try { const o = JSON.parse(it.json.choices[0].message.content); resp = String(o.resposta || '').trim(); falsa = !!o.parece_falsa; } catch (e) { erro = (it.json.error && it.json.error.message) || 'resposta da IA ilegível'; }
  if (r.pronta) { resp = r.pronta; erro = ''; }
  resp = resp.replace(/\s*—\s*/g, ', ');
  const avisos = [PROIBIDO.test(resp) ? '⚠️ A sugestão usou uma expressão que você não gosta: ajuste antes de publicar.' : '',
    SIGILO.test(resp) ? '⚠️ <b>A sugestão fala de cirurgia, sessão ou tratamento (sigilo): ajuste antes de publicar.</b>' : '',
    r.nota <= 3 ? '⚠️ <b>Nota baixa: confira antes de publicar.</b>' : '', falsa ? '⚠️ <b>Pode ser avaliação falsa: confira antes.</b>' : ''].filter(Boolean);
  const codigo = cod(r.review_id), agora = $now.toISO();
  const texto = `${A_TESTE() ? '🧪 TESTE (nada é gravado nem publicado)\n' : ''}<b>Avaliação nova no Google · ${html(r.unidade)}</b> ${'⭐'.repeat(Math.max(0, Math.min(5, r.nota)))}\n${html(r.nome || 'sem nome')} · ${String(r.avaliada_em || '').slice(0, 10).split('-').reverse().join('/')}\n<i>${html((r.comentario || '(sem texto)').slice(0, 700))}</i>${avisos.length ? '\n' + avisos.join('\n') : ''}\n\n<b>Resposta sugerida:</b>\n${html(resp || '(não saiu: ' + erro + '. Responda a esta mensagem com o texto que quer publicar.)')}\n\n<i>Publicar como está, ignorar, ou responder a esta mensagem com outro texto (ele é publicado no lugar).</i>`;
  return { json: { chave: r.review_id, codigo, review_name: r.review_name, unidade: r.unidade, estrelas: r.nota, avaliada_em: r.avaliada_em, sugestao: resp, status: 'proposta',
    message_id: '', decidido_por: '', publicada: '', atualizado_em: agora, texto } };
});
function A_TESTE() { return !!$('Avaliações do perfil').first().json.teste; }
