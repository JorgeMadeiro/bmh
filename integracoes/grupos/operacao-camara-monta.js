// Operação por dia e câmara (pedido do Jorge, 22/10/2026: na Operação do painel, tocar no mês abre multiplace e monoplace
// com a ocupação de cada uma). Mesma leitura e mesmas regras de operacao-monta.js: atendida = sessão finalizada sem falta;
// falta = Faltou, Desmarcado ou Desistiu; cobrada = falta finalizada; lugares = horários do dia × lugares da câmara
// (multiplace 8; monoplace 2 na Asa Sul e 4 em Taguatinga, com grade mínima de 7 horários). Sai uma linha por câmara em todo
// dia lido, mesmo zerada, para que um dia refeito nunca fique com número velho. Só contagens.
const CAMARAS = { 111: { u: 'Asa Sul', nome: 'Monoplace', lug: 2 }, 112: { u: 'Asa Sul', nome: 'Multiplace', lug: 8 }, 121: { u: 'Taguatinga', nome: 'Monoplace', lug: 4, grade: 7 } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const dias = $('Dias').all().map((i) => i.json.dia), resp = $('Agenda do dia').all(), agora = $now.toISO();
const out = [];
dias.forEach((dia, k) => {
  const lista = resp[k]?.json?.data; if (!Array.isArray(lista)) return;   // dia sem resposta: fica como estava
  const d = {}; for (const [id, c] of Object.entries(CAMARAS)) d[id] = { chave: dia + '|' + id, dia, unidade: c.u, camara: c.nome, agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, lugares: 0, horarios: new Set() };
  const vistos = new Set();
  for (const x of lista) {
    const id = String(x.Profissional?.id), r = d[id]; if (!r) continue;
    if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
    const ag = x.Agendamento?.id; if (ag) { if (vistos.has(ag)) continue; vistos.add(ag); }
    const falta = NAO_VEIO.includes(norm(x.Agendamento?.confirmado)), fin = norm(x.Agendamento?.status) === 'finalizado';
    r.agendadas++; r.horarios.add(String(x.Agendamento?.horario || '').slice(0, 5));
    if (falta) { r.faltas++; if (fin) r.cobradas++; } else if (fin) r.atendidas++;
  }
  for (const [id, r] of Object.entries(d)) {
    const c = CAMARAS[id]; r.lugares = r.horarios.size ? Math.max(r.horarios.size, c.grade || 0) * c.lug : 0;
    delete r.horarios; out.push({ json: { ...r, atualizado_em: agora } });
  }
});
return out;
