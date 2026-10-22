// Marca o que foi aceito (só no modo real) e devolve um resumo. Meta: aceito quando events_received = o que foi mandado.
// Google: aceito quando a resposta traz requestId. Falha não marca nada: o envio seguinte tenta de novo (a chave não duplica).
const m = $('Monta os envios').first().json, agora = $now.toISO();
const linhas = Object.fromEntries($('Conversões (tabela)').all().map((i) => [i.json.chave, i.json]));
const out = {}; const marca = (c, campo) => { if (linhas[c]) (out[c] ||= { ...linhas[c] })[campo] = agora; };
let meta = 'não mandou'; try { const r = $('Meta · envia').first().json; const ok = Number(r.events_received) === m.chaves_meta.length;
  meta = ok ? `aceitos ${r.events_received}` : 'recusou: ' + JSON.stringify(r.error || r).slice(0, 200); if (ok && m.modo === 'real') m.chaves_meta.forEach((c) => marca(c, 'enviado_meta')); } catch (e) {}
const google = []; try { const lotes = $('Lotes do Google').all().map((i) => i.json); $('Google · envia').all().forEach((i, k) => { const l = lotes[k] || {}, ok = !!i.json.requestId && !i.json.error;
  google.push(`${l.evento}: ${ok ? (m.modo === 'real' ? 'aceito' : 'conferido') : 'recusou ' + JSON.stringify(i.json.error || i.json).slice(0, 200)} (${(l.chaves || []).length})`); if (ok && m.modo === 'real') (l.chaves || []).forEach((c) => marca(c, 'enviado_google')); }); } catch (e) {}
return [...Object.values(out).map((json) => ({ json })), { json: { resumo: true, modo: m.modo, meta, meta_eventos: m.chaves_meta.length, google: google.length ? google : ['não mandou'] } }];
