// Confere se o Google aceitou a resposta e monta o que grava e o que mostra.
const D = $('Decide a avaliação').first().json;
let ok = true, erro = '';
if (D.publicar) { let p = {}; try { p = $('Publica a resposta').first().json; } catch (e) {} ok = !!p && p.comment === D.comment; erro = (p && p.error && (p.error.message || JSON.stringify(p.error))) || ''; }
if (!ok) return [{ json: { ...D, gravar: false, resposta: 'O Google não aceitou: ' + String(erro).slice(0, 150), alerta: true, texto_final: D.texto_final.replace(/\n\n✅[\s\S]*$/, '\n\n⚠️ Não publicou: ' + String(erro).slice(0, 200)) } }];
return [{ json: { ...D, ...(D.linha || {}), gravar: D.gravar } }];
