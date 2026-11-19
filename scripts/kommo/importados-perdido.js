// Leads importados do histórico (criados antes da conexão do WhatsApp no Kommo, 17/11/2026 18h20) que ficaram em Triagem ›
// Em qualificação: etiqueta "importado" e Perdido com o motivo "Só dúvida / agora não" (Jorge, 19/11/2026). Se a pessoa voltar
// a escrever, o Kommo reabre a conversa. Uso: node --env-file=.env scripts/kommo/importados-perdido.js [--aplicar]
const APLICA = process.argv.includes('--aplicar'), CORTE = Date.parse('2026-11-17T18:20:00-03:00') / 1000;
const B = 'https://bmh.kommo.com', H = { Authorization: 'Bearer ' + process.env.KOMMO_BMH_TOKEN, 'Content-Type': 'application/json' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const L = []; for (let p = 1; p < 60; p++) { await espera(250); const r = await fetch(`${B}/api/v4/leads?limit=250&page=${p}&filter[statuses][0][pipeline_id]=14783287&filter[statuses][0][status_id]=114235347`, { headers: H }); if (r.status === 204) break; const j = await r.json(); const x = j._embedded?.leads || []; L.push(...x); if (x.length < 250) break; }
  const alvo = L.filter((l) => l.created_at < CORTE), novos = L.length - alvo.length;
  console.log('em Em qualificação:', L.length, '| importados (antes de 17/11 18h20):', alvo.length, '| criados depois (ficam):', novos);
  if (!APLICA) return;
  let ok = 0; for (let i = 0; i < alvo.length; i += 50) { await espera(500);
    const lote = alvo.slice(i, i + 50).map((l) => ({ id: l.id, pipeline_id: 14783287, status_id: 143, loss_reason_id: 39824539, _embedded: { tags: [...(l._embedded?.tags || []).map((t) => ({ id: t.id })), { name: 'importado' }] } }));   // tags_to_add é ignorado; a lista inteira (as que já tinha + importado) funciona (19/11/2026)
    const r = await fetch(B + '/api/v4/leads', { method: 'PATCH', headers: H, body: JSON.stringify(lote) }); const j = await r.json().catch(() => ({}));
    if (r.ok) ok += (j._embedded?.leads || []).length; else { console.log('ERRO', r.status, JSON.stringify(j).slice(0, 300)); break; } }
  console.log('movidos para Perdido:', ok);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
