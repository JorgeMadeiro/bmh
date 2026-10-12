// Atendimentos e valor produzido por dia e unidade, a partir da produção do iGut (businessintelligences/producao). Mesma
// regra do fluxo "Produção Diaria e Mensal BMH": linha com e_fatura_sessao é faturamento (fica fora: senão o valor conta
// duas vezes); linha repetida do mesmo agendamento conta uma vez; consulta não conta como sessão. Valor = "totalproduzido"
// das sessões e das consultas (decisão do Jorge, 08/10/2026: "o produzido"). Só contagens e soma: sem nome nem id de paciente.
const r = $('iGut · produção').first().json || {};
if (r.status === 'failed' && /no matching data/i.test(String(r.message || ''))) return [];   // período sem nada no iGut (antes de set/2023)
if (r.error) throw new Error('iGut: ' + JSON.stringify(r.error).slice(0, 200));
const lista = (r.data || {}).Produzido;
if (!Array.isArray(lista)) throw new Error('iGut: esperava data.Produzido como lista');
const P = $('Quais dias').first().json;
const UNIDADE = { 'unidade l2 sul': 'Asa Sul', 'unidade taguatinga': 'Taguatinga' };
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const m = {}, vistos = new Set();
for (const j of lista) {
  if (j.e_fatura_sessao) continue;
  const chaveAg = j.agendamento_id + '|' + j.codigo + '|' + j.horario; if (vistos.has(chaveAg)) continue; vistos.add(chaveAg);
  const unidade = UNIDADE[norm(j.nome)]; if (!unidade) continue;
  const dia = String(j.data || '').slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || dia < P.ini || dia > P.fim) continue;
  const k = dia + '|' + unidade; (m[k] ||= { chave: k, dia, unidade, atendimentos: 0, _pac: new Set(), valor: 0 });
  m[k].valor += Number(j.totalproduzido) || 0;
  const consulta = norm(j.profissional).includes('consulta') || (norm(j.TIPO) || norm(j.descricao)).includes('consulta');
  if (consulta) continue;
  m[k].atendimentos++; m[k]._pac.add(String(j.paciente_id));
}
return Object.values(m).map(x => ({ json: { chave: x.chave, dia: x.dia, unidade: x.unidade, atendimentos: x.atendimentos, pacientes: x._pac.size, valor: Math.round(x.valor * 100) / 100 } }));
