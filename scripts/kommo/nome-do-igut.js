// Nome completo e código do iGut no contato do Kommo (Jorge, 18/11/2026: "igual fazemos na Nexo", fluxo "NEXO · iGut → Kommo ·
// cadastro do paciente"). Para os leads dos funis Asa Sul e Taguatinga que têm o "Código do iGut" no lead: o contato ganha o
// nome completo do iGut (iniciais maiúsculas), o código do iGut (campo do contato) e o e-mail, só se estiver vazio; o lead
// ganha o mesmo nome. Sem CPF (regra de LGPD do Kommo da BMH: o elo com o iGut é o código). Não mexe em contato que já tem
// OUTRO código do iGut nem em contato ligado a dois pacientes (telefone dividido). Não imprime dado de paciente.
// Uso: node --env-file=.env scripts/kommo/nome-do-igut.js <agenda.json do iGut> [--aplicar]
const fs = require('fs'), APLICA = process.argv.includes('--aplicar');
const B = 'https://bmh.kommo.com', H = { Authorization: 'Bearer ' + process.env.KOMMO_BMH_TOKEN, 'Content-Type': 'application/json' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const K = async (p) => { await espera(250); const r = await fetch(B + p, { headers: H }); return r.status === 204 ? {} : r.json(); };
const IDS = JSON.parse(fs.readFileSync('integracoes/kommo/ids.json')), CC = IDS.campos_contato, LEAD_IGUT = IDS.campos.id_igut;
let d = JSON.parse(fs.readFileSync(process.argv[2])); d = Array.isArray(d) ? d[0] : d; const lista = d.data || d.json?.data;
const MIN = ['da', 'de', 'do', 'das', 'dos', 'e'];
const nomeBonito = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' ').map((p, i) => (i && MIN.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))).join(' ');
const pac = {}; for (const x of lista) { const p = x.Paciente || {}; if (!p.id || !p.nome) continue; const e = String(p.email || '').trim().toLowerCase();
  pac[String(p.id)] = { nome: nomeBonito(p.nome), email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : '' }; }
const campo = (o, id) => (o.custom_fields_values || []).find((f) => f.field_id === id)?.values?.[0]?.value;
(async () => {
  const leads = []; for (const f of [14783519, 14783523]) for (let p = 1; p < 20; p++) { const j = await K(`/api/v4/leads?with=contacts&limit=250&page=${p}&filter[pipeline_id][0]=${f}`); const L = j._embedded?.leads || []; leads.push(...L); if (L.length < 250) break; }
  const alvo = leads.map((l) => ({ l, pid: String(campo(l, LEAD_IGUT) || ''), contato: (l._embedded?.contacts || []).find((c) => c.is_main)?.id || l._embedded?.contacts?.[0]?.id })).filter((x) => x.pid && x.contato);
  const pidsDoContato = {}; for (const a of alvo) (pidsDoContato[a.contato] ||= new Set()).add(a.pid);
  const contatos = {}; const ids = [...new Set(alvo.map((a) => a.contato))];
  for (let i = 0; i < ids.length; i += 200) { const j = await K('/api/v4/contacts?limit=250&' + ids.slice(i, i + 200).map((x) => 'filter[id][]=' + x).join('&')); for (const c of j._embedded?.contacts || []) contatos[c.id] = c; }
  const conta = { leads_com_codigo: alvo.length, sem_cadastro_na_agenda: 0, contato_de_outro_paciente: 0, telefone_dividido: 0, a_atualizar: 0, email_novo: 0 };
  const pc = [], pl = [];
  for (const a of alvo) { const p = pac[a.pid], c = contatos[a.contato]; if (!p || !c) { conta.sem_cadastro_na_agenda++; continue; }
    const ja = String(campo(c, CC.id_igut) || ''); if (ja && ja !== a.pid) { conta.contato_de_outro_paciente++; continue; }
    if (pidsDoContato[a.contato].size > 1) { conta.telefone_dividido++; continue; }
    const temEmail = (c.custom_fields_values || []).some((f) => f.field_id === CC.email);
    pc.push({ id: c.id, name: p.nome, custom_fields_values: [{ field_id: CC.id_igut, values: [{ value: a.pid }] }, ...(p.email && !temEmail ? [{ field_id: CC.email, values: [{ value: p.email, enum_code: 'WORK' }] }] : [])] });
    if (p.email && !temEmail) conta.email_novo++;
    pl.push({ id: a.l.id, name: p.nome }); conta.a_atualizar++; }
  console.log(JSON.stringify(conta));
  if (!APLICA) return;
  const manda = async (rota, itens) => { let ok = 0; for (let i = 0; i < itens.length; i += 50) { await espera(400); const r = await fetch(B + rota, { method: 'PATCH', headers: H, body: JSON.stringify(itens.slice(i, i + 50)) }); const j = await r.json().catch(() => ({})); if (r.ok) ok += (j._embedded?.contacts || j._embedded?.leads || []).length; else console.log('ERRO', rota, r.status, JSON.stringify(j).slice(0, 300)); } return ok; };
  const uc = [...new Map(pc.map((x) => [x.id, x])).values()];
  console.log('contatos atualizados:', await manda('/api/v4/contacts', uc), 'de', uc.length, '| leads renomeados:', await manda('/api/v4/leads', pl), 'de', pl.length);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
