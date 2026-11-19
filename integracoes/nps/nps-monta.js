// NPS da 5ª sessão (19/11/2026, decisões do Jorge): o objetivo agora é conseguir avaliações no Google.
//   - quem: paciente que completou a 5ª sessão da sequência atual de uma unidade. Sequência = sessões finalizadas sem pausa
//     maior que 10 dias (os pacientes fazem 1 sessão por dia; 85% dos intervalos são de 1 dia; levantamento de 3.849
//     tratamentos de jan/2025 a out/2026). Conta o histórico (BMH_financeiro_paciente, até ontem) e as sessões finalizadas
//     de ontem e de hoje no iGut;
//   - quando: cerca de 1 h depois do fim da sessão (início + 3 h), entre 9h e 20h; a de depois das 20h vai no dia seguinte;
//   - uma vez por paciente por unidade, para sempre (chave paciente|unidade em BMH_nps).
// Modo (`nps_modo` em BMH_config): "ensaio" (padrão) só grava a lista; "espelho" manda tudo só para o telefone de teste
// (`confirmacao_telefone_teste`); "real" manda ao paciente. Modelo nps_sessoes_v1 (opção B). Nome e celular só no item de
// envio; na tabela, código do paciente, unidade e telefone em código.
/*__SHA256__*/
const AG = { 111: 'Asa Sul', 112: 'Asa Sul', 121: 'Taguatinga' }, NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = ['real', 'espelho'].includes(cfg.nps_modo) ? cfg.nps_modo : 'ensaio', TESTE = String(cfg.confirmacao_telefone_teste || '').replace(/\D/g, '');
if (modo === 'espelho' && TESTE.length < 12) throw new Error('NPS em modo espelho sem confirmacao_telefone_teste em BMH_config');
const { hoje, ontem, agora: agoraISO } = $('Agora').first().json, Z = 'America/Sao_Paulo', agora = DateTime.fromISO(agoraISO, { zone: Z });
const lista = $('Agenda de ontem e hoje').first().json.data;
if (!Array.isArray(lista)) throw new Error('o iGut não devolveu a agenda de ' + ontem + ' e ' + hoje);
const ja = {}; for (const i of $('NPS (tabela)').all()) { const r = i.json || {}; if (r.chave) ja[r.chave] = r.status || ''; }
// linha que ainda pode ser regravada: ensaio e aguardando; a do espelho continua livre para o real (o paciente não recebeu)
const livre = (s) => !s || /^ensaio|^aguardando/.test(s) || (modo === 'real' && /^espelho/.test(s));   // "espelho: fora do limite" também fica para o real
const DIAS = 10, mesDe = (d) => d.slice(0, 7), meses = new Set([0, 1, 2].map((k) => DateTime.fromISO(hoje).minus({ months: k }).toFormat('yyyy-MM')));
const dias = {};   // paciente|unidade → conjunto de dias com sessão
for (const i of $('Histórico de pacientes').all()) { const r = i.json || {}; if (!r.paciente_id || !meses.has(r.mes) || !(Number(r.sessoes) > 0) || !AG_UN(r.unidade)) continue;
  for (const x of String(r.dias || '').split(',').map(Number).filter(Boolean)) (dias[r.paciente_id + '|' + r.unidade] ||= new Set()).add(r.mes + '-' + String(x).padStart(2, '0')); }
function AG_UN(u) { return u === 'Asa Sul' || u === 'Taguatinga'; }
const celular = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length === 10 && /[6-9]/.test(d[2])) d = d.slice(0, 2) + '9' + d.slice(2); return d.length === 11 ? '55' + d : ''; };
const ultima = {};   // paciente|unidade → a última sessão finalizada de ontem ou hoje
for (const x of lista) {
  const u = AG[Number(x.Profissional?.id)], pid = String(x.Paciente?.id || ''), d = String(x.Agendamento?.data || '').slice(0, 10); if (!u || !pid || (d !== hoje && d !== ontem)) continue;
  if (norm(x.Agendamento?.status) !== 'finalizado' || NAO_VEIO.includes(norm(x.Agendamento?.confirmado))) continue;
  const k = pid + '|' + u; (dias[k] ||= new Set()).add(d);
  const h = String(x.Agendamento?.horario || '').slice(0, 5);
  if (!ultima[k] || d + h > ultima[k].d + ultima[k].h) ultima[k] = { pid, u, d, h, fone: celular(x.Paciente?.celular), nome: String(x.Paciente?.nome || '').trim().split(/\s+/)[0] || '' };
}
const nomeProprio = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
const fora = { menos_de_5: 0, ja_recebeu: 0, sem_celular: 0 }, out = [];
// espelho com limite (19/11/2026, "pode ligar o espelho com 5"): passado o limite, a linha fica "espelho: fora do limite de
// teste", que não sai de novo no espelho e continua livre para o real
const LIMITE = Number(cfg.nps_espelho_limite) || 0; let noEspelho = Object.values(ja).filter((x) => /^espelho: enviada/.test(x)).length;
for (const [k, s] of Object.entries(ultima)) {
  if (!livre(ja[k])) { fora.ja_recebeu++; continue; }
  // sequência atual: anda para trás a partir da última sessão enquanto a pausa for de até 10 dias
  const ds = [...dias[k]].sort(), seq = [ds[ds.length - 1]];
  for (let i = ds.length - 2; i >= 0; i--) { if (DateTime.fromISO(seq[0]).diff(DateTime.fromISO(ds[i]), 'days').days <= DIAS) seq.unshift(ds[i]); else break; }
  if (seq.length < 5) { fora.menos_de_5++; continue; }
  if (!s.fone) { fora.sem_celular++; continue; }
  let quando = DateTime.fromISO(s.d + 'T' + s.h, { zone: Z }).plus({ hours: 3 });
  const nove = (d) => DateTime.fromISO(d + 'T09:00', { zone: Z });
  if (quando.hour >= 20 || quando.toISODate() > s.d) quando = nove(DateTime.fromISO(s.d).plus({ days: 1 }).toISODate());   // terminou tarde: dia seguinte às 9h
  if (quando.hour < 9) quando = quando.set({ hour: 9, minute: 0 });
  const vence = agora >= quando, hh = quando.toFormat('HH:mm');
  let status = !vence ? 'aguardando ' + hh : modo === 'ensaio' ? 'ensaio: enviaria (' + seq.length + 'ª sessão)' : 'a enviar';
  if (status === 'a enviar' && modo === 'espelho' && LIMITE) { if (noEspelho >= LIMITE) status = 'espelho: fora do limite de teste'; else noEspelho++; }
  out.push({ json: { chave: k, paciente_id: s.pid, unidade: s.u, sessao: String(seq.length), dia_sessao: s.d, telefone_hash: sha256(s.fone), wamid: '', resposta: '', respondido_em: '', link_enviado_em: '',
    modo, status, criado_em: agora.toISO(), fora: JSON.stringify(fora),
    ...(status === 'a enviar' ? { envio: { telefone: modo === 'espelho' ? TESTE : s.fone, params: [nomeProprio(s.nome), s.u] } } : {}) } });
}
return out;
