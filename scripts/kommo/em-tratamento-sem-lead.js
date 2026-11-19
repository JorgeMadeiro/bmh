// Pacientes com sessão marcada no iGut que não estão em "Em tratamento" nem em "Avaliação agendada" no Kommo (Jorge, 19/11/2026:
// "pode criar, mas checar antes no Kommo se não tem mesmo"). Para cada um, procura contato no Kommo pelo código do iGut (campo
// do contato) e pelo telefone (DDD + 8 últimos dígitos, em todos os contatos). Com contato: cria um lead novo no funil da unidade,
// em "Em tratamento", ligado a ele (o lead antigo, perdido ou da triagem, fica como histórico). Sem contato: cria o contato
// (nome completo, telefone, código do iGut, CPF, nascimento e e-mail, como na Nexo) e o lead. Não imprime dado de paciente.
// Uso: node --env-file=.env scripts/kommo/em-tratamento-sem-lead.js <agenda.json do iGut> [--aplicar]
const fs = require('fs'), APLICA = process.argv.includes('--aplicar');
const B = 'https://bmh.kommo.com', H = { Authorization: 'Bearer ' + process.env.KOMMO_BMH_TOKEN, 'Content-Type': 'application/json' };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const K = async (p) => { await espera(250); const r = await fetch(B + p, { headers: H }); return r.status === 204 ? {} : r.json(); };
const IDS = JSON.parse(fs.readFileSync('integracoes/kommo/ids.json')), CC = IDS.campos_contato;
let d = JSON.parse(fs.readFileSync(process.argv[2])); d = Array.isArray(d) ? d[0] : d; const lista = d.data || [];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const S = { 111: 'Asa Sul', 112: 'Asa Sul', 121: 'Taguatinga' }, FUNIL = { 'Asa Sul': 14783519, Taguatinga: 14783523 }, EM = { 'Asa Sul': 114237091, Taguatinga: 114237111 }, AV = { 'Asa Sul': 114237079, Taguatinga: 114237099 };
const UNI = { 'Asa Sul': 463116, Taguatinga: 463118 }, PAG = { Particular: 463120, 'Convênio': 463122 };
const MIN = ['da', 'de', 'do', 'das', 'dos', 'e'], bonito = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' ').map((w, i) => (i && MIN.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
const cel = (s) => { let x = String(s || '').replace(/\D/g, ''); if (x.startsWith('55') && x.length >= 12) x = x.slice(2); if (x.length === 10 && /[6-9]/.test(x[2])) x = x.slice(0, 2) + '9' + x.slice(2); return x.length === 11 ? x : ''; };
const chave = (s) => { let x = String(s || '').replace(/\D/g, ''); if (x.startsWith('55') && x.length >= 12) x = x.slice(2); return x.length >= 10 ? x.slice(0, 2) + x.slice(-8) : ''; };
const pag = (c) => { const n = norm(c); return !n || /cortesia|voucher/.test(n) ? '' : /particular/.test(n) ? 'Particular' : 'Convênio'; };
const nasc = (s) => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim()); return m && +m[3] > 1900 ? Math.round(Date.parse(`${m[3]}-${m[2]}-${m[1]}T00:00:00-03:00`) / 1000) : null; };
const pac = {};
for (const x of lista) { const u = S[Number(x.Profissional?.id)]; if (!u || ['faltou', 'desmarcado', 'desistiu'].includes(norm(x.Agendamento?.confirmado))) continue; const p = x.Paciente || {}; if (!p.id) continue;
  const a = (pac[p.id] ||= { pid: String(p.id), un: {}, p, conv: String(x.Convenio?.nome || '').replace(/\s+/g, ' ').trim() }); a.un[u] = (a.un[u] || 0) + 1; }
const campo = (o, id) => (o.custom_fields_values || []).find((f) => f.field_id === id)?.values?.[0]?.value;
(async () => {
  // leads atuais nos funis das unidades (Em tratamento e Avaliação agendada): quem já está, sai da lista
  const nas = new Set(); for (const u of ['Asa Sul', 'Taguatinga']) for (const e of [EM[u], AV[u]]) { const j = await K(`/api/v4/leads?limit=250&filter[statuses][0][pipeline_id]=${FUNIL[u]}&filter[statuses][0][status_id]=${e}`); for (const l of j._embedded?.leads || []) nas.add(String(campo(l, IDS.campos.id_igut) || '')); }
  const faltam = Object.values(pac).filter((a) => !nas.has(a.pid));
  // todos os contatos do Kommo (para achar pelo telefone e pelo código do iGut)
  const todos = []; for (let p = 1; p < 80; p++) { const j = await K(`/api/v4/contacts?limit=250&page=${p}&with=leads`); const c = j._embedded?.contacts || []; todos.push(...c); if (c.length < 250) break; }
  const porTel = {}, porCod = {}; for (const c of todos) { const cod = String(campo(c, CC.id_igut) || ''); if (cod) (porCod[cod] ||= []).push(c);
    for (const f of (c.custom_fields_values || []).filter((f) => f.field_code === 'PHONE')) for (const v of f.values || []) { const k = chave(v.value); if (k) (porTel[k] ||= []).push(c); } }
  const plano = []; const conta = { faltam: faltam.length, contato_pelo_codigo: 0, contato_pelo_telefone: 0, telefone_de_mais_de_um_contato: 0, contato_novo: 0, sem_celular: 0 };
  for (const a of faltam) { const u = Object.entries(a.un).sort((x, y) => y[1] - x[1])[0][0], f = cel(a.p.celular), pg = pag(a.conv);
    let c = (porCod[a.pid] || [])[0]; if (c) conta.contato_pelo_codigo++;
    else { const t = [...new Set(porTel[chave(f)] || [])]; if (t.length === 1) {
        // telefone igual só vale com o nome compatível (primeiro nome igual e um sobrenome em comum, como na Nexo): mãe e filho dividem número
        const pa = norm(a.p.nome).split(/\s+/), ca = norm(t[0].name).replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
        if (!ca.length || pa[0] !== ca[0] || (ca.length > 1 && !ca.slice(1).some((w) => pa.includes(w)))) { conta.telefone_com_outro_nome = (conta.telefone_com_outro_nome || 0) + 1; continue; }
        c = t[0]; conta.contato_pelo_telefone++; } else if (t.length > 1) { conta.telefone_de_mais_de_um_contato++; continue; } }
    if (!c && !f) { conta.sem_celular++; continue; } if (!c) conta.contato_novo++;
    const campos = [{ field_id: CC.id_igut, values: [{ value: a.pid }] }, ...(a.p.cpf && String(a.p.cpf).replace(/\D/g, '').length === 11 ? [{ field_id: CC.cpf, values: [{ value: String(a.p.cpf).replace(/\D/g, '') }] }] : []),
      ...(nasc(a.p.datadenascimento) ? [{ field_id: CC.nascimento, values: [{ value: nasc(a.p.datadenascimento) }] }] : []), ...(/@/.test(a.p.email || '') ? [{ field_id: CC.email, values: [{ value: String(a.p.email).trim().toLowerCase(), enum_code: 'WORK' }] }] : [])];
    plano.push({ c, u, lead: { name: bonito(a.p.nome), pipeline_id: FUNIL[u], status_id: EM[u], custom_fields_values: [{ field_id: IDS.campos.unidade, values: [{ enum_id: UNI[u] }] }, { field_id: IDS.campos.id_igut, values: [{ value: a.pid }] },
      ...(pg ? [{ field_id: IDS.campos.pagamento, values: [{ enum_id: PAG[pg] }] }] : []), ...(pg === 'Convênio' ? [{ field_id: IDS.campos.convenio, values: [{ value: a.conv }] }] : [])], _embedded: { tags: [{ name: 'criado pelo iGut' }, ...(pg === 'Particular' ? [{ name: 'particular' }] : pg ? [{ name: 'convênio' }] : [])] } },
      contato: c ? { id: c.id, custom_fields_values: campos.filter((x) => !(c.custom_fields_values || []).some((y) => y.field_id === x.field_id)) } : { name: bonito(a.p.nome), custom_fields_values: [{ field_code: 'PHONE', values: [{ value: '+55' + f, enum_code: 'MOB' }] }, ...campos] } }); }
  const porU = {}; for (const x of plano) porU[x.u] = (porU[x.u] || 0) + 1;
  console.log(JSON.stringify(conta), '| a criar (lead em Em tratamento):', plano.length, JSON.stringify(porU), '| contatos no Kommo lidos:', todos.length);
  if (!APLICA) return;
  let ok = 0;
  for (const x of plano) { await espera(400);
    let cid = x.contato.id;
    if (cid) { if (x.contato.custom_fields_values.length) await fetch(B + '/api/v4/contacts', { method: 'PATCH', headers: H, body: JSON.stringify([x.contato]) }); }
    else { const r = await fetch(B + '/api/v4/contacts', { method: 'POST', headers: H, body: JSON.stringify([x.contato]) }); const j = await r.json(); cid = j._embedded?.contacts?.[0]?.id; if (!cid) { console.log('ERRO contato', r.status, JSON.stringify(j).slice(0, 200)); continue; } }
    await espera(300); const r = await fetch(B + '/api/v4/leads', { method: 'POST', headers: H, body: JSON.stringify([{ ...x.lead, _embedded: { ...x.lead._embedded, contacts: [{ id: cid }] } }]) }); const j = await r.json();
    if (j._embedded?.leads?.[0]?.id) ok++; else console.log('ERRO lead', r.status, JSON.stringify(j).slice(0, 200)); }
  console.log('leads criados:', ok, 'de', plano.length);
})().catch((e) => { console.error('ERRO', e.message); process.exit(1); });
