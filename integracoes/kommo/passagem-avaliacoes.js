// Passagem da triagem para a unidade (17/11/2026, decisão do Jorge: "ganho na triagem + lead novo no funil da unidade").
// Passo 1: as avaliações marcadas no iGut de hoje até a janela (14 dias), uma por paciente (a primeira). Avaliação = agenda de
// consulta da unidade (113 Asa Sul, 120 Taguatinga) com tipo de atendimento "avaliação", como na confirmação da véspera.
// Fica de fora: falta já marcada, horário bloqueado, sem paciente, celular inválido e a avaliação que já virou passagem
// no modo real (status "feito" em BMH_passagens). O celular só segue no item para casar com o contato do Kommo; na tabela
// fica em código (sha256). O convênio da avaliação segue para os campos "Particular ou convênio" e "Convênio" do lead.
/*__SHA256__*/
const AGENDAS = { 113: 'Asa Sul', 120: 'Taguatinga' };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const { ini } = $('Janela').first().json;
const lista = $('Agenda').first().json.data;
if (!Array.isArray(lista)) throw new Error('o iGut não devolveu a agenda das avaliações');   // vira alerta: a passagem não pode parar calada
const feitas = new Set($('Já feitas').all().map((i) => i.json).filter((r) => r && r.status === 'feito').map((r) => r.chave));
const celular = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length === 10 && /[6-9]/.test(d[2])) d = d.slice(0, 2) + '9' + d.slice(2); return d.length === 11 ? '55' + d : ''; };
const porPaciente = {};
for (const x of lista) {
  const unidade = AGENDAS[Number(x.Profissional?.id)]; if (!unidade) continue;
  const dia = String(x.Agendamento?.data || '').slice(0, 10); if (dia < ini) continue;
  if (String(x.Agendamento?.bloqueado || '') === '1' || x.Agendamento?.bloqueado === true) continue;
  if (NAO_VEIO.includes(norm(x.Agendamento?.confirmado))) continue;
  if (!norm(x.Agendamento?.tipodeatendimento).includes('avaliac')) continue;
  const pid = x.Paciente?.id, fone = celular(x.Paciente?.celular); if (!pid || !fone) continue;
  const hora = String(x.Agendamento?.horario || '').slice(0, 5), atual = porPaciente[pid];
  if (!atual || dia + hora < atual.dia + atual.hora) porPaciente[pid] = { pid: String(pid), unidade, dia, hora, fone, agendamento: String(x.Agendamento?.id || ''), convenio: String(x.Convenio?.nome || '').replace(/\s+/g, ' ').trim() };
}
// para a conversão "agendou" (mesmo formato do eventos-igut.js): telefone com e sem o 9 (Meta), com "+" (Google), e-mail
const sem9 = (f) => f.slice(0, 4) + f.slice(5);
const emailDe = {}; for (const x of lista) { const e = String(x.Paciente?.email || '').trim().toLowerCase(); if (x.Paciente?.id && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) emailDe[x.Paciente.id] = e; }
return Object.values(porPaciente).map((p) => ({ chave: p.pid + '|' + p.dia, ...p, telefone_hash: sha256(p.fone),
  conv: { telefone_hash_sem9: sha256(sem9(p.fone)), telefone_hash_google: sha256('+' + p.fone), email_hash: emailDe[p.pid] ? sha256(emailDe[p.pid]) : '' } }))
  .filter((p) => !feitas.has(p.chave)).map((json) => ({ json }));
