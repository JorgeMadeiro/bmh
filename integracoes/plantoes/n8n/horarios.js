// Primeira e última sessão feita por dia e unidade, da agenda do iGut (câmaras 111 e 112 na Asa Sul, 121 em Taguatinga;
// feita = finalizada sem falta, como no painel). "Found no matching data" é dia sem sessão (n = 0); resposta que falhou
// fica de fora, e o fechamento usa o horário padrão naquele dia. Só horários, nada de paciente.
const MAPA = { 111: 'Asa Sul', 112: 'Asa Sul', 121: 'Taguatinga' };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const hora = (s) => { const [h, m] = String(s || '').split(':').map(Number); return Number.isFinite(h) ? h + (m || 0) / 60 : null; };
const dias = $('Dias do mês').all().map((i) => i.json.dia), resp = $('Agenda do dia').all();
const horarios = {};
dias.forEach((dia, k) => {
  const j = resp[k]?.json || {}, vazio = j.status === 'failed' && /no matching data/i.test(j.message || '');
  if (!Array.isArray(j.data) && !vazio) return;
  const u = { 'Asa Sul': [], Taguatinga: [] }, vistos = new Set();
  for (const x of j.data || []) {
    const un = MAPA[Number(x.Profissional?.id)], a = x.Agendamento || {}; if (!un || String(a.data || '').slice(0, 10) !== dia) continue;
    if (a.id) { if (vistos.has(a.id)) continue; vistos.add(a.id); }
    const h = hora(a.horario); if (h != null && norm(a.status) === 'finalizado' && !NAO_VEIO.includes(norm(a.confirmado))) u[un].push(h);
  }
  for (const [n, hs] of Object.entries(u)) { hs.sort((a, b) => a - b); horarios[dia + '|' + n] = { n: hs.length, primeira: hs[0] ?? null, ultima: hs.at(-1) ?? null }; }
});
return [{ json: { horarios } }];
