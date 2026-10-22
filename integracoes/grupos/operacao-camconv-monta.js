// Operação por dia, câmara e convênio (pedido do Jorge, 22/10/2026: com convênio no filtro, a seta do mês também abre
// multiplace e monoplace daquele convênio). Mesmas regras de operacao-camara-monta.js e o nome do convênio igual ao do
// financeiro (operacao-conv-monta.js). Os lugares não se dividem por convênio: ficam em BMH_operacao_camara. Só contagens.
const CAMARAS = { 111: { u: 'Asa Sul', nome: 'Monoplace' }, 112: { u: 'Asa Sul', nome: 'Multiplace' }, 121: { u: 'Taguatinga', nome: 'Monoplace' } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const nomeConv = (s) => { const c = String(s || '').trim() || 'Sem convênio no iGut'; return /particular/i.test(c) ? 'PARTICULAR' : c; };
const dias = $('Dias').all().map((i) => i.json.dia), resp = $('Agenda do dia').all(), agora = $now.toISO();
const out = [];
dias.forEach((dia, k) => {
  const lista = resp[k]?.json?.data; if (!Array.isArray(lista)) return;   // dia sem resposta: fica como estava
  const d = {}, vistos = new Set();
  for (const x of lista) {
    const c = CAMARAS[String(x.Profissional?.id)]; if (!c) continue;
    if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
    const ag = x.Agendamento?.id; if (ag) { if (vistos.has(ag)) continue; vistos.add(ag); }
    const conv = nomeConv(x.Convenio?.nome), chave = dia + '|' + c.u + '|' + c.nome + '|' + conv;
    const r = (d[chave] ||= { chave, dia, unidade: c.u, camara: c.nome, convenio: conv, agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, atualizado_em: agora });
    const falta = NAO_VEIO.includes(norm(x.Agendamento?.confirmado)), fin = norm(x.Agendamento?.status) === 'finalizado';
    r.agendadas++; if (falta) { r.faltas++; if (fin) r.cobradas++; } else if (fin) r.atendidas++;
  }
  for (const r of Object.values(d)) out.push({ json: r });
});
// linha gravada antes, de um dia refeito agora, que não apareceu de novo: volta zerada
const refeitos = new Set(dias.filter((dia, k) => Array.isArray(resp[k]?.json?.data))), chaves = new Set(out.map((i) => i.json.chave));
try { for (const i of $('Operação por câmara e convênio (dias refeitos)').all()) { const r = i.json || {};
  if (r.chave && refeitos.has(r.dia) && !chaves.has(r.chave) && Number(r.agendadas))
    out.push({ json: { chave: r.chave, dia: r.dia, unidade: r.unidade, camara: r.camara, convenio: r.convenio, agendadas: 0, atendidas: 0, faltas: 0, cobradas: 0, atualizado_em: agora } }); } } catch (e) {}
return out;
