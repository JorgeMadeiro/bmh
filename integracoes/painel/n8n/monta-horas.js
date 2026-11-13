// Cliques no WhatsApp do site por dia, dia da semana (1 = segunda) e hora: o mapa "Quando os contatos chegam"
// erro do Google em texto claro (13/11/2026): uma página HTML de erro (502, 503) virava a mensagem do alerta no Telegram.
// Sem ": " na mensagem: o nó de código do n8n corta tudo antes do último ": " (o nome da etapa sumia do alerta)
const msgErro = (n, e) => { const s = typeof e === "string" ? e : String(e?.message || JSON.stringify(e)), tudo = s + " " + String(e?.description || ""), cod = (tudo.match(/Error (\d{3})/) || [])[1] || e?.httpCode || "";
  return (n + " · " + (/<!doctype|<html|bad gateway|service unavailable|timed? ?out|ETIMEDOUT|ECONNRESET/i.test(tudo) ? "o Google não respondeu" + (cod ? " (erro " + cod + ")" : "") + ". Falha passageira do lado do Google; o fluxo de amanhã às 6h10 regrava os 28 dias" : s.replace(/\s+/g, " ").slice(0, 200))).replace(/: /g, " · "); };
const r = $('Analytics · horas').first().json || {};
if (r.error) throw new Error(msgErro('Analytics (horas)', r.error));
const m = {};
for (const x of r.rows || []) { const [d8, dw, hr, dom] = x.dimensionValues.map(v => v.value); if (!['api.whatsapp.com', 'wa.me'].includes(dom)) continue;
  const dia = d8.slice(0, 4) + '-' + d8.slice(4, 6) + '-' + d8.slice(6), ds = (Number(dw) + 6) % 7 + 1, h = Number(hr), chave = dia + '|' + ds + '|' + h;
  (m[chave] ||= { chave, dia, dia_semana: ds, hora: h, cliques: 0 }).cliques += Number(x.metricValues[0].value) || 0; }
return Object.values(m).map(json => ({ json }));
