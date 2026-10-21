// Operação por dia, unidade e convênio (pedido do Jorge, 20/10/2026: a tabela de Operação do painel também filtra por
// convênio). Mesma leitura e mesmas regras de operacao-monta.js (falta = Faltou, Desmarcado ou Desistiu; cobrada = falta
// finalizada; atendida = sessão finalizada sem falta; avaliação = consulta com "avaliação" no tipo). Os lugares das câmaras
// não se dividem por convênio: ficam só na tabela por dia, e o painel usa os de lá. Só contagens, nada de paciente.
// Nome do convênio igual ao do financeiro: sem espaço nas pontas e "PARTICULAR" para qualquer particular.
const MAPA = { 111: { u: 'Asa Sul', t: 's' }, 112: { u: 'Asa Sul', t: 's' }, 113: { u: 'Asa Sul', t: 'c' }, 120: { u: 'Taguatinga', t: 'c' }, 121: { u: 'Taguatinga', t: 's' } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const nomeConv = (s) => { const c = String(s || '').trim() || 'Sem convênio no iGut'; return /particular/i.test(c) ? 'PARTICULAR' : c; };
const dias = $('Dias').all().map((i) => i.json.dia), resp = $('Agenda do dia').all(), agora = $now.toISO();
const out = [];
dias.forEach((dia, k) => {
  const lista = resp[k]?.json?.data; if (!Array.isArray(lista)) return;   // dia sem resposta: fica como estava
  const d = {}, vistos = new Set();
  for (const x of lista) {
    const id = Number(x.Profissional?.id), c = MAPA[id]; if (!c) continue;
    if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
    const ag = x.Agendamento?.id; if (ag) { if (vistos.has(ag)) continue; vistos.add(ag); }
    const conv = nomeConv(x.Convenio?.nome), chave = dia + '|' + c.u + '|' + conv;
    const r = (d[chave] ||= { chave, dia, unidade: c.u, convenio: conv, agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, avaliacoes_agendadas: 0, avaliacoes_feitas: 0, atualizado_em: agora });
    const falta = NAO_VEIO.includes(norm(x.Agendamento?.confirmado)), fin = norm(x.Agendamento?.status) === 'finalizado';
    if (c.t === 's') { r.agendadas++; if (falta) { r.faltas++; if (fin) r.cobradas++; } else if (fin) r.atendidas++; }
    else if (norm(x.Agendamento?.tipodeatendimento).includes('avaliac')) { r.avaliacoes_agendadas++; if (!falta && fin) r.avaliacoes_feitas++; }
  }
  for (const r of Object.values(d)) if (r.agendadas || r.avaliacoes_agendadas) out.push({ json: r });
});
// linha gravada antes, de um dia refeito agora, que não apareceu de novo (a sessão mudou de convênio ou saiu da agenda): volta zerada
const refeitos = new Set(dias.filter((dia, k) => Array.isArray(resp[k]?.json?.data))), chaves = new Set(out.map((i) => i.json.chave));
try { for (const i of $('Operação por convênio (dias refeitos)').all()) { const r = i.json || {};
  if (r.chave && refeitos.has(r.dia) && !chaves.has(r.chave) && (Number(r.agendadas) || Number(r.avaliacoes_agendadas)))
    out.push({ json: { chave: r.chave, dia: r.dia, unidade: r.unidade, convenio: r.convenio, agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, avaliacoes_agendadas: 0, avaliacoes_feitas: 0, atualizado_em: agora } }); } } catch (e) {}
return out;
