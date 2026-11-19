// Confirmação da sessão de amanhã (regras do Jorge, 17/11/2026; a primeira versão, de 22/10, mandava a todos às 18h03).
// Roda a cada 15 min, das 7h às 21h, e só manda para quem a recepção ainda não confirmou no iGut ("Nao Confirmado"):
//   - sessão amanhã de quem TEVE sessão hoje (sem falta): 2 h depois do início da sessão de hoje (a recepção costuma
//     confirmar a de amanhã quando o paciente chega; se não confirmou até lá, vai a mensagem);
//   - sessão amanhã de quem NÃO teve sessão hoje (primeira sessão, faltou ou pulou o dia): 24 h antes da sessão;
//   - avaliação amanhã marcada antes de hoje: 24 h antes; marcada hoje para amanhã: não manda. O dia em que foi marcada é o
//     dia em que a passagem do Kommo a viu pela primeira vez (conversão "agendou" em BMH_conversoes; o iGut não traz a data
//     do agendamento); sem esse registro, não manda.
// Fora: falta já marcada (faltou, desmarcado, desistiu), horário bloqueado, agenda sem paciente e celular inválido. Uma
// mensagem por paciente por dia (o primeiro horário de amanhã). Horário de envio entre 7h e 21h. Não regrava a linha de
// quem já recebeu (status diferente de ensaio e aguardando): a resposta "Confirmo" ou "Preciso remarcar" depende dela.
// Modo (chave `confirmacao_modo` em BMH_config): "ensaio" (padrão) só grava a lista; "real" também manda a mensagem pela
// API oficial do WhatsApp da recepção (modelos confirmacao_sessao_v2, com a câmara, e confirmacao_avaliacao_v1). Nome e celular só saem no modo real, para o envio;
// na tabela fica o código do paciente, a unidade, o horário, os agendamentos de amanhã e o telefone em código.
/*__SHA256__*/
// câmara (19/11/2026): Asa Sul tem monoplace (111) e multiplace (112); Taguatinga só monoplace (121). Vai no modelo de sessão
const AGENDAS = { 111: { u: 'Asa Sul', t: 'sessao', c: 'monoplace' }, 112: { u: 'Asa Sul', t: 'sessao', c: 'multiplace' }, 113: { u: 'Asa Sul', t: 'consulta' }, 120: { u: 'Taguatinga', t: 'consulta' }, 121: { u: 'Taguatinga', t: 'sessao', c: 'monoplace' } };
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
// modo espelho (19/11/2026, pedido do Jorge: "ligar oculto para testar sem disparo para o paciente"): tudo igual ao real, mas a
// mensagem vai só para o telefone de teste (confirmacao_telefone_teste em BMH_config), e a resposta não mexe no iGut nem no Kommo
const modo = ['real', 'espelho'].includes(cfg.confirmacao_modo) ? cfg.confirmacao_modo : 'ensaio', TESTE = String(cfg.confirmacao_telefone_teste || '').replace(/\D/g, '');
if (modo === 'espelho' && TESTE.length < 12) throw new Error('modo espelho sem confirmacao_telefone_teste em BMH_config');
const avaliacaoLigada = cfg.confirmacao_avaliacao === 'ligada';   // só depois de a Meta aprovar confirmacao_avaliacao_v1
const { hoje, dia, agora: agoraISO } = $('Amanhã').first().json;   // dia = amanhã; agora pode vir simulado (?agora=) no teste
const Z = 'America/Sao_Paulo', agora = DateTime.fromISO(agoraISO, { zone: Z });
const lista = $('Agenda de hoje e amanhã').first().json.data;
if (!Array.isArray(lista)) throw new Error('o iGut não devolveu a agenda de ' + hoje + ' e ' + dia);   // vira alerta de falha
const ja = {}; for (const i of $('Confirmações (tabela)').all()) { const r = i.json || {}; if (r.chave) ja[r.chave] = r.status || ''; }
// linha que ainda pode ser regravada; a do espelho continua livre para o real (o paciente não recebeu)
const livre = (s) => !s || /^ensaio|^aguardando|^recep|^não envia/.test(s) || (modo === 'real' && /^espelho/.test(s));
const vistaEm = {}; for (const i of $('Conversões (tabela)').all()) { const r = i.json || {}; if (r.evento === 'agendou' && r.chave) vistaEm[r.chave] = String(r.criado_em || ''); }
const celular = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); if (d.length === 10 && /[6-9]/.test(d[2])) d = d.slice(0, 2) + '9' + d.slice(2); return d.length === 11 ? '55' + d : ''; };
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fora = { avaliacao_sem_modelo: 0, falta: 0, bloqueado: 0, sem_paciente: 0, sem_celular: 0, outra_agenda: 0, consulta_sem_avaliacao: 0, avaliacao_marcada_hoje: 0, ja_confirmado: 0, ja_enviada: 0 };
const sessaoHoje = {}, amanha = {};
for (const x of lista) {
  const ag = AGENDAS[Number(x.Profissional?.id)]; if (!ag) { fora.outra_agenda++; continue; }
  const d = String(x.Agendamento?.data || '').slice(0, 10), pid = x.Paciente?.id, hora = String(x.Agendamento?.horario || '').slice(0, 5);
  if (String(x.Agendamento?.bloqueado || '') === '1' || x.Agendamento?.bloqueado === true) { if (d === dia) fora.bloqueado++; continue; }
  if (NAO_VEIO.includes(norm(x.Agendamento?.confirmado))) { if (d === dia) fora.falta++; continue; }
  if (!pid) { if (d === dia) fora.sem_paciente++; continue; }
  if (d === hoje) { if (ag.t === 'sessao' && (!sessaoHoje[pid] || hora > sessaoHoje[pid])) sessaoHoje[pid] = hora; continue; }   // a última sessão de hoje
  if (d !== dia) continue;
  const avaliacao = ag.t === 'consulta';
  if (avaliacao && !norm(x.Agendamento?.tipodeatendimento).includes('avaliac')) { fora.consulta_sem_avaliacao++; continue; }
  const p = (amanha[pid] ||= { pid: String(pid), agendamentos: [], confirmado: true });
  p.agendamentos.push(String(x.Agendamento?.id || ''));
  if (norm(x.Agendamento?.confirmado) !== 'confirmado') p.confirmado = false;
  if (!p.hora || hora < p.hora) Object.assign(p, { hora, unidade: ag.u, camara: ag.c || '', tipo: avaliacao ? 'avaliação' : 'sessão', fone: celular(x.Paciente?.celular), nome: String(x.Paciente?.nome || '').trim().split(/\s+/)[0] || '' });
}
const [, m, dd] = dia.split('-'), diaTexto = Number(dd) + ' de ' + MES[Number(m) - 1];
const nomeProprio = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
const hh = (t) => t.toFormat('HH:mm'), limita = (t) => { const ini = t.set({ hour: 7, minute: 0 }), fim = t.set({ hour: 21, minute: 0 }); return t < ini ? ini : t > fim ? fim : t; };
const out = [];
for (const p of Object.values(amanha).sort((a, b) => a.hora.localeCompare(b.hora))) {
  const chave = dia + '|' + p.pid, antes = ja[chave];
  if (!livre(antes)) { fora.ja_enviada++; continue; }
  if (!p.fone) { fora.sem_celular++; continue; }
  let regra, quando;
  if (p.tipo === 'sessão' && sessaoHoje[p.pid]) { regra = '2 h depois da sessão de hoje (' + sessaoHoje[p.pid] + ')'; quando = DateTime.fromISO(hoje + 'T' + sessaoHoje[p.pid], { zone: Z }).plus({ hours: 2 }); }
  else if (p.tipo === 'sessão') { regra = '24 h antes (sem sessão hoje)'; quando = DateTime.fromISO(dia + 'T' + p.hora, { zone: Z }).minus({ days: 1 }); }
  else { const v = vistaEm['agendou|' + p.pid + '|' + dia];
    if (!v || DateTime.fromISO(v, { zone: Z }).toISODate() >= hoje) { fora.avaliacao_marcada_hoje++; if (antes) out.push({ chave, p, regra: 'avaliação marcada hoje', quando: limita(agora), status: 'não envia: avaliação marcada hoje' }); continue; }
    regra = '24 h antes (avaliação marcada antes de hoje)'; quando = DateTime.fromISO(dia + 'T' + p.hora, { zone: Z }).minus({ days: 1 }); }
  quando = limita(quando);
  if (p.confirmado) { fora.ja_confirmado++; if (antes) out.push({ chave, status: 'recepção confirmou', p, regra, quando }); continue; }   // só atualiza a linha que já existia
  const vence = agora >= quando;
  if (p.tipo === 'avaliação' && !avaliacaoLigada && modo !== 'ensaio') { fora.avaliacao_sem_modelo++; continue; }
  out.push({ chave, p, regra, quando, status: !vence ? 'aguardando ' + hh(quando) : modo === 'ensaio' ? 'ensaio: enviaria às ' + hh(quando) : 'a enviar' });
}
return out.map(({ chave, p, regra, quando, status }) => ({ json: {
  chave, dia, paciente_id: p.pid, unidade: p.unidade, hora: p.hora, tipo: p.tipo, agendamentos: [...new Set(p.agendamentos)].join(','), telefone_hash: sha256(p.fone), wamid: '', resposta: '', respondido_em: '', modo, status, criado_em: agora.toISO(),
  regra, envia_em: hh(quando), fora_hoje: JSON.stringify(fora),
  // só para o envio (modo real e vencido); não vai para a tabela
  // modelos aprovados pela Meta (19/11/2026): sessão v2 com a câmara e a unidade; avaliação v1 com a unidade
  ...(status === 'a enviar' ? { envio: { telefone: modo === 'espelho' ? TESTE : p.fone, modelo: p.tipo === 'avaliação' ? 'confirmacao_avaliacao_v1' : 'confirmacao_sessao_v2',
    params: p.tipo === 'avaliação' ? [nomeProprio(p.nome), p.unidade, diaTexto, p.hora.replace(':', 'h')] : [nomeProprio(p.nome), p.camara || 'hiperbárica', p.unidade, diaTexto, p.hora.replace(':', 'h')] } } : {}),
} }));
