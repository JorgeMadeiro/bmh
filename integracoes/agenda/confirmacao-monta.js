// Confirmação da véspera (22/10/2026, pedido do Jorge: pronta no dia da virada para o Kommo). Lê a agenda de amanhã no
// iGut e monta UMA confirmação por paciente por dia (o primeiro horário dele), das sessões de câmara e das avaliações.
// Fica de fora: falta já marcada (faltou, desmarcado, desistiu), horário bloqueado, agenda sem paciente e celular inválido.
// Modo (chave `confirmacao_modo` em BMH_config): "ensaio" (padrão) só grava a lista; "real" também manda a mensagem pela
// API oficial do WhatsApp da recepção (modelo confirmacao_sessao_v1, aprovado pela Meta; 22/10/2026: a conta oficial já
// existe em coexistência, então não depende do Kommo). Nome e celular só saem no modo real, para o envio; na tabela fica o
// código do paciente, a unidade, o horário, os agendamentos do dia (para confirmar no iGut) e o telefone em código (para
// ligar a resposta "Confirmo" ou "Preciso remarcar" à mensagem).
/*__SHA256__*/
const AGENDAS = { 111: { u: 'Asa Sul', t: 'sessao' }, 112: { u: 'Asa Sul', t: 'sessao' }, 113: { u: 'Asa Sul', t: 'consulta' }, 120: { u: 'Taguatinga', t: 'consulta' }, 121: { u: 'Taguatinga', t: 'sessao' } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = cfg.confirmacao_modo === 'real' ? 'real' : 'ensaio';
const dia = $('Amanhã').first().json.dia, agora = $now.toISO();
const lista = $('Agenda de amanhã').first().json.data;
if (!Array.isArray(lista)) throw new Error('o iGut não devolveu a agenda de ' + dia);   // vira alerta de falha: a confirmação não pode sumir calada
// celular brasileiro em E.164 sem "+": 55 + DDD + número (com o 9 do celular)
const celular = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length === 10 && /[6-9]/.test(d[2])) d = d.slice(0, 2) + '9' + d.slice(2); return d.length === 11 ? '55' + d : ''; };
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const porPaciente = {}; const fora = { falta: 0, bloqueado: 0, sem_paciente: 0, sem_celular: 0, outra_agenda: 0, consulta_sem_avaliacao: 0 };
for (const x of lista) {
  const ag = AGENDAS[Number(x.Profissional?.id)]; if (!ag) { fora.outra_agenda++; continue; }
  if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
  if (String(x.Agendamento?.bloqueado || '') === '1' || x.Agendamento?.bloqueado === true) { fora.bloqueado++; continue; }
  if (NAO_VEIO.includes(norm(x.Agendamento?.confirmado))) { fora.falta++; continue; }
  if (ag.t === 'consulta' && !norm(x.Agendamento?.tipodeatendimento).includes('avaliac')) { fora.consulta_sem_avaliacao++; continue; }
  const pid = x.Paciente?.id; if (!pid) { fora.sem_paciente++; continue; }
  const hora = String(x.Agendamento?.horario || '').slice(0, 5), fone = celular(x.Paciente?.celular);
  if (!fone) { fora.sem_celular++; continue; }
  const atual = porPaciente[pid];
  const agId = String(x.Agendamento?.id || ''), lista_ = (porPaciente[pid]?.agendamentos || []).concat(agId ? [agId] : []);
  if (!atual || hora < atual.hora) porPaciente[pid] = { pid: String(pid), hora, unidade: ag.u, tipo: ag.t === 'sessao' ? 'sessão' : 'avaliação', fone, nome: String(x.Paciente?.nome || '').trim().split(/\s+/)[0] || '', agendamentos: lista_ };
  else atual.agendamentos = lista_;
}
const [a, m, d] = dia.split('-'), diaTexto = Number(d) + ' de ' + MES[Number(m) - 1];
const nomeProprio = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
return Object.values(porPaciente).sort((p, q) => p.hora.localeCompare(q.hora)).map((p) => ({ json: {
  chave: dia + '|' + p.pid, dia, paciente_id: p.pid, unidade: p.unidade, hora: p.hora, tipo: p.tipo, agendamentos: [...new Set(p.agendamentos)].join(','), telefone_hash: sha256(p.fone), wamid: '', resposta: '', respondido_em: '', modo, status: modo === 'real' ? 'a enviar' : 'ensaio', criado_em: agora,
  fora_hoje: JSON.stringify(fora),
  // só para o envio (modo real); não vai para a tabela
  ...(modo === 'real' ? { envio: { telefone: p.fone, nome: nomeProprio(p.nome), unidade: p.unidade, dia: diaTexto, hora: p.hora.replace(':', 'h') } } : {}),
} }));
