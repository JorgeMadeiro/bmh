// Conversões da BMH pelo iGut (22/10/2026, motor do Kommo; modelo da Nexo em Nexo_Claude_VSL/integracoes/conversoes).
// Lê a agenda de ONTEM e marca, uma vez por paciente por dia:
//   - avaliou: avaliação (agenda de consultas, tipo "avaliação") finalizada sem falta;
//   - iniciou: sessão de câmara finalizada sem falta de quem não teve sessão antes (pela tabela de pacientes por lote,
//     desde nov/2024): é o "paciente novo" do custo por paciente (meta de R$ 200).
// O "agendou" vem do Kommo (etapa "Avaliação agendada"), como na Nexo. Telefone e e-mail só em código (SHA-256): telefone
// com DDI sem "+" para a Meta (com e sem o 9, porque cadastros antigos vêm sem ele) e com "+" para o Google; e-mail em
// minúsculas. Nada é enviado daqui: o
// envio à Meta e ao Google lê BMH_conversoes depois, em ensaio até o parágrafo de medição entrar na política de privacidade.
/*__SHA256__*/
const AGENDAS = { 111: 'sessao', 112: 'sessao', 121: 'sessao', 113: 'consulta', 120: 'consulta' }, UNI = { 111: 'Asa Sul', 112: 'Asa Sul', 113: 'Asa Sul', 120: 'Taguatinga', 121: 'Taguatinga' };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const dia = $('Ontem').first().json.dia, mes = dia.slice(0, 7), dd = Number(dia.slice(8)), agora = $now.toISO();
const lista = $('Agenda de ontem').first().json.data;
if (!Array.isArray(lista)) throw new Error('o iGut não devolveu a agenda de ' + dia);
// quem já tinha sessão antes de ontem (meses anteriores, ou dias anteriores no mesmo mês)
const antes = new Set(); try { for (const i of $('Pacientes (tabela)').all()) { const r = i.json || {}; if (!r.paciente_id || !(Number(r.sessoes) > 0)) continue;
  if (r.mes < mes || (r.mes === mes && String(r.dias || '').split(',').map(Number).some((d) => d && d < dd))) antes.add(String(r.paciente_id)); } } catch (e) {}
const tel = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length < 10 || d.length > 11) return []; const com9 = d.length === 10 ? d.slice(0, 2) + '9' + d.slice(2) : d, sem9 = com9.slice(0, 2) + com9.slice(3); return ['55' + com9, '55' + sem9]; };
const out = {};
for (const x of lista) {
  const id = Number(x.Profissional?.id), tipo = AGENDAS[id]; if (!tipo) continue;
  if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
  if (norm(x.Agendamento?.status) !== 'finalizado' || NAO_VEIO.includes(norm(x.Agendamento?.confirmado))) continue;
  const pid = String(x.Paciente?.id || ''); if (!pid) continue;
  const evento = tipo === 'consulta' ? (norm(x.Agendamento?.tipodeatendimento).includes('avaliac') ? 'avaliou' : '') : (antes.has(pid) ? '' : 'iniciou');
  if (!evento) continue;
  const chave = evento + '|' + pid + '|' + dia; if (out[chave]) continue;
  const [t1, t2] = tel(x.Paciente?.celular), email = String(x.Paciente?.email || '').trim().toLowerCase();
  out[chave] = { chave, evento, dia, paciente_id: pid, unidade: UNI[id], telefone_hash: t1 ? sha256(t1) : '', telefone_hash_sem9: t2 ? sha256(t2) : '', telefone_hash_google: t1 ? sha256('+' + t1) : '', email_hash: /@/.test(email) ? sha256(email) : '', enviado_meta: '', enviado_google: '', modo: 'ensaio', criado_em: agora };
}
return Object.values(out).map((json) => ({ json }));
