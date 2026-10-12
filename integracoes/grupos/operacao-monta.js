// Operação por dia e unidade (painel da diretoria, 09/10/2026), pela agenda do iGut lida dia a dia. Mesmas regras do
// relatório diário: falta = Faltou, Desmarcado ou Desistiu; cobrada = falta finalizada; atendida = sessão finalizada sem
// falta (é a regra que bate com o e-mail mensal); lugares = horários do dia × lugares por câmara (multiplace 8, monoplace
// 2 na Asa Sul e 4 em Taguatinga, Taguatinga com grade mínima de 7 horários). Só contagens.
const MAPA = { 111: { u: 'Asa Sul', t: 's', lug: 2 }, 112: { u: 'Asa Sul', t: 's', lug: 8 }, 113: { u: 'Asa Sul', t: 'c' }, 120: { u: 'Taguatinga', t: 'c' }, 121: { u: 'Taguatinga', t: 's', lug: 4, grade: 7 } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const dias = $('Dias').all().map((i) => i.json.dia), resp = $('Agenda do dia').all(), agora = $now.toISO();
const out = [];
dias.forEach((dia, k) => {
  const lista = resp[k]?.json?.data; if (!Array.isArray(lista)) return;   // dia sem resposta: fica como estava
  const d = {}; for (const u of ['Asa Sul', 'Taguatinga']) d[u] = { agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, horarios: {}, avaliacoes_agendadas: 0, avaliacoes_feitas: 0 };
  const vistos = new Set();
  for (const x of lista) {
    const id = Number(x.Profissional?.id), c = MAPA[id]; if (!c) continue;
    if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
    const ag = x.Agendamento?.id; if (ag) { if (vistos.has(ag)) continue; vistos.add(ag); }
    const r = d[c.u], falta = NAO_VEIO.includes(norm(x.Agendamento?.confirmado)), fin = norm(x.Agendamento?.status) === 'finalizado';
    if (c.t === 's') {
      r.agendadas++; (r.horarios[id] ||= new Set()).add(String(x.Agendamento?.horario || '').slice(0, 5));
      if (falta) { r.faltas++; if (fin) r.cobradas++; } else if (fin) r.atendidas++;
    } else if (norm(x.Agendamento?.tipodeatendimento).includes('avaliac')) { r.avaliacoes_agendadas++; if (!falta && fin) r.avaliacoes_feitas++; }
  }
  for (const [u, r] of Object.entries(d)) {
    const lugares = Object.entries(r.horarios).reduce((s, [id, hs]) => s + Math.max(hs.size, MAPA[id].grade || 0) * MAPA[id].lug, 0);
    if (!r.agendadas && !r.avaliacoes_agendadas) continue;
    out.push({ json: { chave: dia + '|' + u, dia, unidade: u, agendadas: r.agendadas, atendidas: r.atendidas, faltas: r.faltas, cobradas: r.cobradas, lugares, avaliacoes_agendadas: r.avaliacoes_agendadas, avaliacoes_feitas: r.avaliacoes_feitas, atualizado_em: agora } });
  }
});
return out;
