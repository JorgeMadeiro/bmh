// Move para o funil da unidade, etapa "Em tratamento", os leads importados (Triagem › Em qualificação) de quem tem sessão
// marcada no iGut (Jorge, 18/11/2026; rodado com 19 a 25/11). Uso: node --env-file=.env scripts/kommo/mover-tratamento.js <agenda.json do iGut> [--aplicar]
// (a agenda sai de /v2/consultas/buscar pelo executor temporário do iGut e se apaga depois: tem dado de paciente). Não imprime dado de paciente.
const fs = require('fs'), APLICA = process.argv.includes('--aplicar');
const B = 'https://bmh.kommo.com', H = { Authorization: 'Bearer ' + process.env.KOMMO_BMH_TOKEN, 'Content-Type': 'application/json' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const K = async (p) => { await espera(250); const r = await fetch(B + p, { headers: H }); return r.status === 204 ? {} : r.json(); };
let d = JSON.parse(fs.readFileSync(process.argv[2])); d = Array.isArray(d) ? d[0] : d; const lista = d.data || d.json?.data;
const SESS = { 111: 'Asa Sul', 112: 'Asa Sul', 121: 'Taguatinga' }, NAO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const chave = (s) => { let x = String(s || '').replace(/\D/g, ''); if (x.startsWith('55') && x.length >= 12) x = x.slice(2); return x.length >= 10 ? x.slice(0, 2) + x.slice(-8) : ''; };
const pac = {};   // chave do celular → { pid, unidades: {u: n}, convenio }
for (const x of lista) { const u = SESS[Number(x.Profissional?.id)]; if (!u) continue; if (String(x.Agendamento?.bloqueado || '') === '1' || NAO.includes(norm(x.Agendamento?.confirmado))) continue;
  const k = chave(x.Paciente?.celular); if (!k || !x.Paciente?.id) continue; const p = (pac[k] ||= { pid: String(x.Paciente.id), un: {}, convenio: String(x.Convenio?.nome || '').replace(/\s+/g, ' ').trim() }); p.un[u] = (p.un[u] || 0) + 1; }
const FUNIL = { 'Asa Sul': 14783519, Taguatinga: 14783523 }, ETAPA = { 'Asa Sul': 114237091, Taguatinga: 114237111 };
const UNI = { 'Asa Sul': 463116, Taguatinga: 463118 }, PAG = { Particular: 463120, 'Convênio': 463122 };
const pagamento = (c) => { const n = norm(c); return !n || /cortesia|voucher/.test(n) ? '' : /particular/.test(n) ? 'Particular' : 'Convênio'; };
(async () => {
  const leads = []; for (let p = 1; p < 60; p++) { const j = await K('/api/v4/leads?with=contacts&limit=250&page=' + p + '&filter[pipeline_id][0]=14783287'); const L = j._embedded?.leads || []; leads.push(...L); if (L.length < 250) break; }
  const abertos = leads.filter((l) => l.status_id === 114235347);
  const ids = [...new Set(abertos.flatMap((l) => (l._embedded?.contacts || []).map((c) => c.id)))], tel = {};
  for (let i = 0; i < ids.length; i += 200) { const j = await K('/api/v4/contacts?limit=250&' + ids.slice(i, i + 200).map((x) => 'filter[id][]=' + x).join('&'));
    for (const c of j._embedded?.contacts || []) tel[c.id] = (c.custom_fields_values || []).filter((f) => f.field_code === 'PHONE').flatMap((f) => (f.values || []).map((v) => chave(v.value))).filter(Boolean); }
  const mover = [], visto = new Set();
  for (const l of abertos) { const cs = (l._embedded?.contacts || []).map((c) => c.id); const p = cs.flatMap((c) => tel[c] || []).map((k) => pac[k]).find(Boolean); if (!p) continue;
    const u = Object.entries(p.un).sort((a, b) => b[1] - a[1])[0][0], pg = pagamento(p.convenio);
    mover.push({ id: l.id, pipeline_id: FUNIL[u], status_id: ETAPA[u], custom_fields_values: [{ field_id: 626676, values: [{ enum_id: UNI[u] }] }, { field_id: 626684, values: [{ value: p.pid }] },
      ...(pg ? [{ field_id: 626678, values: [{ enum_id: PAG[pg] }] }] : []), ...(pg === 'Convênio' ? [{ field_id: 626680, values: [{ value: p.convenio }] }] : [])],
      _embedded: { tags: [{ name: pg === 'Particular' ? 'particular' : pg === 'Convênio' ? 'convênio' : 'importado' }, { name: 'importado' }] }, _u: u, _pid: p.pid }); visto.add(p.pid); }
  const porU = {}; for (const m of mover) porU[m._u] = (porU[m._u] || 0) + 1;
  const dup = mover.length - visto.size;
  console.log('pacientes com sessão de 19 a 25/11:', Object.keys(pac).length, '| leads em Em qualificação:', abertos.length, '| a mover:', mover.length, porU, '| pacientes com mais de um lead:', dup);
  if (!APLICA) return;
  let ok = 0; for (let i = 0; i < mover.length; i += 50) { const lote = mover.slice(i, i + 50).map(({ _u, _pid, ...r }) => r); await espera(400);
    const r = await fetch(B + '/api/v4/leads', { method: 'PATCH', headers: H, body: JSON.stringify(lote) }); const j = await r.json().catch(() => ({})); if (r.ok) ok += (j._embedded?.leads || []).length; else console.log('ERRO', r.status, JSON.stringify(j).slice(0, 300)); }
  console.log('movidos:', ok);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
