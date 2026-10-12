// Relatório diário da diretoria da BMH (09/10/2026, pedido do Jorge): sessões, ocupação, faltas em %, avaliações,
// comparação com o mesmo dia da semana passada e o que vem amanhã. Sai no fim estimado das sessões (fluxo "Produção
// Diaria e Mensal BMH", nó "Code in JavaScript4"). Falta = Faltou, Desmarcado ou Desistiu (regra B do Jorge); cobrada =
// falta com o atendimento finalizado. Ocupação = pacientes que vieram ÷ lugares do dia (multiplace 8 por sessão,
// monoplace 2 na Asa Sul e 4 em Taguatinga, Taguatinga com grade de 7 horários). Só números: nenhum nome de paciente.
const MAPA = {
  111: { u: 'ASA SUL', t: 'sessao', e: 'Monoplace', lugares: 2 },
  112: { u: 'ASA SUL', t: 'sessao', e: 'Multiplace', lugares: 8 },
  113: { u: 'ASA SUL', t: 'consulta' },
  120: { u: 'TAGUATINGA', t: 'consulta' },
  121: { u: 'TAGUATINGA', t: 'sessao', e: 'Monoplace', lugares: 4, grade: 7 },
};
const UN = ['ASA SUL', 'TAGUATINGA'], NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const pega = (n) => { try { return $(n).all().map((i) => i.json); } catch (e) { return []; } };
const hojeItens = pega('Hoje?').filter((d) => d && d.Agendamento);
const todos = pega('Edit Fields').filter((d) => d && d.Agendamento);
let passada = []; try { const j = $('Agenda da semana passada').first().json; passada = Array.isArray(j?.data) ? j.data : []; } catch (e) {}

function resumo(lista) {
  const d = {};
  UN.forEach((u) => (d[u] = { ag: 0, veio: 0, fin: 0, faltas: 0, cobr: 0, equip: {}, horarios: {}, aval: { ag: 0, veio: 0 }, cons: { ag: 0, veio: 0 } }));
  for (const r of lista) {
    const id = Number(r.Profissional?.id), c = MAPA[id]; if (!c) continue;
    const u = d[c.u], falta = NAO_VEIO.includes(norm(r.Agendamento?.confirmado)), fin = norm(r.Agendamento?.status) === 'finalizado';
    if (c.t === 'sessao') {
      u.ag++; (u.horarios[id] ||= new Set()).add(String(r.Agendamento?.horario || '').slice(0, 5));
      if (falta) { u.faltas++; if (fin) u.cobr++; } else { u.veio++; if (fin) u.fin++; u.equip[c.e] = (u.equip[c.e] || 0) + 1; }
    } else {
      const alvo = norm(r.Agendamento?.tipodeatendimento).includes('avaliac') ? u.aval : u.cons;
      alvo.ag++; if (!falta) alvo.veio++;
    }
  }
  for (const u of UN) d[u].lugares = Object.entries(d[u].horarios).reduce((s, [id, hs]) => s + Math.max(hs.size, MAPA[id].grade || 0) * MAPA[id].lugares, 0);
  return d;
}
const pct = (a, b) => (b ? Math.round((100 * a) / b) + '%' : '—');
const total = (d) => UN.reduce((s, u) => ({ ag: s.ag + d[u].ag, veio: s.veio + d[u].veio, faltas: s.faltas + d[u].faltas, cobr: s.cobr + d[u].cobr, lugares: s.lugares + d[u].lugares, aval: s.aval + d[u].aval.veio }), { ag: 0, veio: 0, faltas: 0, cobr: 0, lugares: 0, aval: 0 });

const H = resumo(hojeItens), T = total(H), P = total(resumo(passada));
const diaISO = String(hojeItens[0]?.Agendamento?.data || $now.setZone('America/Sao_Paulo').toISODate()).slice(0, 10);
const dia = DateTime.fromISO(diaISO).setLocale('pt-BR');
const amanhaISO = dia.plus({ days: 1 }).toISODate();
const amanha = resumo(todos.filter((r) => String(r.Agendamento?.data || '').slice(0, 10) === amanhaISO));
const A = total(amanha), avalAmanha = UN.reduce((s, u) => s + amanha[u].aval.ag, 0);

// formato curto para WhatsApp (ajuste do Jorge, 09/10/2026): sem "lugares", sem tipo de câmara em Taguatinga, total e
// comparação em poucas linhas. Os lugares são calculados sozinhos pela agenda do dia (sessão extra soma; sessão a menos tira).
const bloco = (u) => {
  const x = H[u], det = u === 'TAGUATINGA' ? '' : Object.entries(x.equip).map(([k, v]) => `${k.replace('plac', '').replace('Multie', 'Multi').replace('Monoe', 'Mono')} ${v}`).join(' | ');
  const linhas = [`Sessões: ${x.veio}/${x.ag}${det ? ` (${det})` : ''}`];
  if (x.veio > x.fin) linhas.push(`⚠️ ${x.veio - x.fin} sem finalizar no iGut`);
  linhas.push(`Ocupação: ${pct(x.veio, x.lugares)}`);
  linhas.push(`Faltas: ${x.faltas} (${pct(x.faltas, x.ag)})${x.cobr ? ` · ${x.cobr} ${x.cobr === 1 ? 'cobrada' : 'cobradas'}` : ''}`);
  linhas.push(`Avaliações: ${x.aval.veio}/${x.aval.ag}`);
  return `\n*${u}*\n` + linhas.join('\n') + '\n';
};
const curto = (d) => d.setLocale('pt-BR').toFormat('ccc').replace('.', '');
const texto = hojeItens.length
  ? `*Relatório Diário · ${dia.toFormat('dd/LL')} (${curto(dia)})*\n` + UN.map(bloco).join('') +
    `\n*TOTAL:* ${T.veio} sessões · ${pct(T.veio, T.lugares)} ocupação · ${pct(T.faltas, T.ag)} faltas` +
    (P.ag ? `\n_${curto(dia).charAt(0).toUpperCase() + curto(dia).slice(1)} passada: ${P.veio} · ${pct(P.veio, P.lugares)} · ${pct(P.faltas, P.ag)}_` : '') +
    `\n*Amanhã:* ${A.ag - A.faltas} sessões · ${avalAmanha} ${avalAmanha === 1 ? 'avaliação' : 'avaliações'}`
  : `*Relatório Diário · ${dia.toFormat('dd/LL')}*\n\nNenhum agendamento registrado.`;
return [{ json: { relatorio: texto } }];
