// Passagem da triagem para a unidade (17/11/2026). Passo 2: casa cada avaliação com o contato do Kommo pelo celular
// (DDD + 8 últimos dígitos, para não depender do 9 a mais) e decide:
//   - "passar": tem lead aberto no funil Triagem e nenhum aberto no funil da unidade → cria o lead na unidade, etapa
//     "Avaliação agendada" (copiando origem, UTMs, cirurgião, pagamento, convênio, tipo de caso e etiquetas) e depois
//     marca o da triagem como ganho (nessa ordem: se o segundo passo falhar, o próximo giro vê o lead da unidade e não
//     repete; o contrário deixaria a triagem fechada sem lead na unidade);
//   - "já no funil da unidade", "sem lead aberto na triagem" (retorno, troca de unidade: a recepção resolve) e
//     "sem contato no Kommo" (marcou por telefone, sem conversa no WhatsApp): só registra.
// Modo na chave `passagem_modo` de BMH_config: "ensaio" (padrão) só registra o que faria; "real" também grava no Kommo.
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = cfg.passagem_modo === 'real' ? 'real' : 'ensaio', agora = $now.toISO();
const AV = $('Avaliações novas').all().map((i) => i.json);
// o Kommo responde hal+json: a leitura chega como texto em "data" (204 sem corpo = vazio)
const corpo = (j) => { if (j && j._embedded) return j; try { return j && typeof j.data === 'string' && j.data ? JSON.parse(j.data) : {}; } catch (e) { return {}; } };
const leads = []; for (const p of $('Leads no Kommo').all()) leads.push(...(corpo(p.json)._embedded?.leads || []));
const contatos = {}; for (const p of $('Contatos no Kommo').all()) for (const c of (corpo(p.json)._embedded?.contacts || [])) contatos[c.id] = c;
const FUNIL = { triagem: 14783287, 'Asa Sul': 14783519, Taguatinga: 14783523 };
const ETAPA = { 'Asa Sul': 114237079, Taguatinga: 114237099 };
const UNIDADE = { campo: 626676, 'Asa Sul': 463116, Taguatinga: 463118 }, ID_IGUT = 626684;
const COPIAR = [626668, 624514, 624510, 624512, 624508, 624516, 624524, 624526, 626670, 626672, 626674, 626678, 626680, 626682];
// particular, convênio e retorno (17/11/2026): convênio pela agenda do iGut ("PARTICULAR" = particular; cortesia e voucher
// ficam em branco); retorno = já teve sessão com valor antes deste mês (BMH_financeiro_paciente, desde nov/2024)
const PAG = { campo: 626678, Particular: 463120, 'Convênio': 463122 }, CONVENIO = 626680;
const mesAtual = $now.setZone('America/Sao_Paulo').toFormat('yyyy-MM'), jaFez = new Set();
for (const i of $('Histórico de pacientes').all()) { const r = i.json || {}; if (r.paciente_id && r.mes < mesAtual && Number(r.valor) > 0) jaFez.add(String(r.paciente_id)); }
const pagamento = (c) => { const n = String(c || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); return !n || /cortesia|voucher/.test(n) ? '' : /particular/.test(n) ? 'Particular' : 'Convênio'; };
const chaveFone = (s) => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length >= 12) d = d.slice(2); return d.length >= 10 ? d.slice(0, 2) + d.slice(-8) : ''; };
const porFone = {};
for (const c of Object.values(contatos)) for (const f of (c.custom_fields_values || []).filter((f) => f.field_code === 'PHONE'))
  for (const v of f.values || []) { const k = chaveFone(v.value); if (k) (porFone[k] ||= new Set()).add(c.id); }
const leadsDo = {}; for (const l of leads) for (const c of (l._embedded?.contacts || [])) (leadsDo[c.id] ||= []).push(l);
const aberto = (l) => l.status_id !== 142 && l.status_id !== 143;
const copia = (l) => (l.custom_fields_values || []).filter((f) => COPIAR.includes(f.field_id))
  .map((f) => ({ field_id: f.field_id, values: (f.values || []).map((v) => (v.enum_id ? { enum_id: v.enum_id } : { value: v.value })) }));
const out = [];
for (const a of AV) {
  const ids = [...(porFone[chaveFone(a.fone)] || [])];
  const doContato = ids.flatMap((id) => (leadsDo[id] || []).map((l) => ({ l, contato: id })));
  const naUnidade = doContato.find((x) => x.l.pipeline_id === FUNIL[a.unidade] && aberto(x.l));
  const tri = doContato.filter((x) => x.l.pipeline_id === FUNIL.triagem && aberto(x.l)).sort((p, q) => q.l.updated_at - p.l.updated_at)[0];
  const acao = !ids.length ? 'sem contato no Kommo' : naUnidade ? 'já no funil da unidade' : !tri ? 'sem lead aberto na triagem' : 'passar';
  const r = { chave: a.chave, paciente_id: a.pid, unidade: a.unidade, avaliacao_dia: a.dia, avaliacao_hora: a.hora, telefone_hash: a.telefone_hash,
    contato_id: String(tri?.contato || naUnidade?.contato || ids[0] || ''), lead_triagem: String(tri?.l.id || ''), lead_unidade: String(naUnidade?.l.id || ''),
    acao, modo, status: acao !== 'passar' ? 'nada a fazer' : modo === 'real' ? 'a fazer' : 'ensaio', detalhe: ids.length > 1 ? ids.length + ' contatos com o mesmo celular' : '', atualizado_em: agora };
  if (acao === 'passar') {
    const pg = pagamento(a.convenio), retorno = jaFez.has(a.pid);
    const doIgut = [{ field_id: UNIDADE.campo, values: [{ enum_id: UNIDADE[a.unidade] }] }, { field_id: ID_IGUT, values: [{ value: a.pid }] },
      ...(pg ? [{ field_id: PAG.campo, values: [{ enum_id: PAG[pg] }] }] : []), ...(pg === 'Convênio' ? [{ field_id: CONVENIO, values: [{ value: a.convenio }] }] : [])];
    const novas = [pg === 'Particular' ? 'particular' : pg === 'Convênio' ? 'convênio' : '', retorno ? 'retorno' : ''].filter(Boolean).map((name) => ({ name }));
    const ids_ = new Set(doIgut.map((f) => f.field_id));
    const campos = [...copia(tri.l).filter((f) => !ids_.has(f.field_id)), ...doIgut];
    r.detalhe = [pg || 'sem pagamento na agenda', retorno ? 'retorno' : '', r.detalhe].filter(Boolean).join(' · ');
    // contato com nome completo, código do iGut, e-mail, CPF e nascimento (só se vazios), como na Nexo; nunca em contato de OUTRO paciente
    const c = contatos[tri.contato] || {}, cod = String((c.custom_fields_values || []).find((f) => f.field_id === 662778)?.values?.[0]?.value || '');
    if (cod && cod !== a.pid) r.detalhe = [r.detalhe, 'contato com outro código do iGut: nome não trocado'].filter(Boolean).join(' · ');
    else if (a.nome) { const tem = (id) => (c.custom_fields_values || []).some((f) => f.field_id === id);   // e-mail 624502, CPF 663106, nascimento 663108: só se vazios
      r.contato_patch = { id: tri.contato, name: a.nome, custom_fields_values: [{ field_id: 662778, values: [{ value: a.pid }] },
        ...(a.email && !tem(624502) ? [{ field_id: 624502, values: [{ value: a.email, enum_code: 'WORK' }] }] : []),
        ...(a.cpf && !tem(663106) ? [{ field_id: 663106, values: [{ value: a.cpf }] }] : []),
        ...(a.nasc && !tem(663108) ? [{ field_id: 663108, values: [{ value: a.nasc }] }] : [])] }; }
    r.novo = { name: a.nome || tri.l.name || 'Avaliação ' + a.unidade, pipeline_id: FUNIL[a.unidade], status_id: ETAPA[a.unidade], custom_fields_values: campos,
      _embedded: { contacts: [{ id: tri.contato }], tags: [...(tri.l._embedded?.tags || []).map((t) => ({ id: t.id })), ...novas] } };
    r.ganha = { id: tri.l.id, pipeline_id: FUNIL.triagem, status_id: 142, custom_fields_values: doIgut };
  }
  if (acao !== 'passar') r.detalhe = [pagamento(a.convenio) || 'sem pagamento na agenda', jaFez.has(a.pid) ? 'retorno' : '', r.detalhe].filter(Boolean).join(' · ');
  out.push({ json: r });
}
// Avanço de etapa pelo iGut, como reserva da recepção (19/11/2026, "pode montar assim e vemos para frente"). Só para a frente,
// nunca em lead que a recepção já moveu mais adiante, em Remarcar nem em lead fechado:
//   - avaliação "Finalizado" (ontem ou hoje): Avaliação agendada → Avaliou · pedido a enviar;
//   - sessão "Finalizado" (ontem ou hoje): Avaliação agendada, Avaliou ou Aguardando convênio → Em tratamento (o particular que
//     espera o convênio volta sozinho quando a sessão do convênio acontece);
//   - Em tratamento com mais de 10 dias sem sessão e nenhuma marcada: tarefa para a recepção decidir entre Concluiu e
//     Perdido · Interrompeu o tratamento, com a pista pelo número de sessões (5, 10, 15, 20: provável pacote completo). Uma
//     tarefa por fim de sequência (chave fim|lead|última sessão). Aguardando convênio não recebe tarefa.
const ETP = { 'Asa Sul': { ag: 114237079, av: 114237083, conv: 114237087, trat: 114237091, pipe: 14783519 }, Taguatinga: { ag: 114237099, av: 114237103, conv: 114237107, trat: 114237111, pipe: 14783523 } };
const UN_DO_PIPE = { 14783519: 'Asa Sul', 14783523: 'Taguatinga' };
const sA = (x) => String(x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const hojeE = $now.setZone('America/Sao_Paulo').toISODate(), ontemE = $now.setZone('America/Sao_Paulo').minus({ days: 1 }).toISODate();
const SESS = { 111: 1, 112: 1, 121: 1 }, CONS = { 113: 1, 120: 1 };
const fezSessao = new Set(), fezAvaliacao = new Set(), marcada = new Set(), diasDe = {};
for (const x of ($('Agenda').first().json.data || [])) { const id = Number(x.Profissional?.id), pid = String(x.Paciente?.id || ''), d = String(x.Agendamento?.data || '').slice(0, 10); if (!pid) continue;
  const fim = sA(x.Agendamento?.status) === 'finalizado', faltou = ['faltou', 'desmarcado', 'desistiu'].includes(sA(x.Agendamento?.confirmado));
  if (SESS[id]) { if (fim && (d === hojeE || d === ontemE)) { fezSessao.add(pid); (diasDe[pid] ||= new Set()).add(d); } if (!faltou && !fim && d >= hojeE) marcada.add(pid); }
  if (CONS[id] && sA(x.Agendamento?.tipodeatendimento).includes('avaliac') && fim && (d === hojeE || d === ontemE)) fezAvaliacao.add(pid); }
const meses3 = new Set([0, 1, 2].map((k) => $now.setZone('America/Sao_Paulo').minus({ months: k }).toFormat('yyyy-MM')));
for (const i of $('Histórico de pacientes').all()) { const r = i.json || {}; if (!r.paciente_id || !meses3.has(r.mes) || !(Number(r.sessoes) > 0)) continue;
  for (const x of String(r.dias || '').split(',').map(Number).filter(Boolean)) (diasDe[r.paciente_id] ||= new Set()).add(r.mes + '-' + String(x).padStart(2, '0')); }
const tarefasFeitas = new Set($('Já feitas').all().map((i) => i.json || {}).filter((r) => r.chave && r.chave.startsWith('fim|') && r.status === 'tarefa criada').map((r) => r.chave));
const linhaE = (l, pid, u, extra) => ({ paciente_id: pid, unidade: u, avaliacao_dia: '', avaliacao_hora: '', contato_id: '', lead_triagem: '', lead_unidade: String(l.id), modo, atualizado_em: agora, telefone_hash: '', ...extra });
for (const l of leads) { const u = UN_DO_PIPE[l.pipeline_id]; if (!u) continue; const E = ETP[u], pid = String((l.custom_fields_values || []).find((f) => f.field_id === ID_IGUT)?.values?.[0]?.value || ''); if (!pid) continue;
  let alvo = null, porque = '';
  if (fezSessao.has(pid) && [E.ag, E.av, E.conv].includes(l.status_id)) { alvo = E.trat; porque = 'sessão finalizada no iGut'; }
  else if (fezAvaliacao.has(pid) && l.status_id === E.ag) { alvo = E.av; porque = 'avaliação finalizada no iGut'; }
  if (alvo) { out.push({ json: linhaE(l, pid, u, { chave: 'avanca|' + l.id + '|' + alvo, acao: 'avançar etapa', status: modo === 'real' ? 'a fazer' : 'ensaio', detalhe: porque, avanco: { id: l.id, pipeline_id: E.pipe, status_id: alvo } }) }); continue; }
  if (l.status_id !== E.trat || marcada.has(pid)) continue;
  const ds = [...(diasDe[pid] || [])].sort(); if (!ds.length) continue;
  const ult = ds[ds.length - 1], parado = DateTime.fromISO(hojeE).diff(DateTime.fromISO(ult), 'days').days; if (parado <= 10) continue;
  const k = 'fim|' + l.id + '|' + ult; if (tarefasFeitas.has(k)) continue;
  const seq = [ult]; for (let i = ds.length - 2; i >= 0; i--) { if (DateTime.fromISO(seq[0]).diff(DateTime.fromISO(ds[i]), 'days').days <= 10) seq.unshift(ds[i]); else break; }
  const n = seq.length, pista = n % 5 === 0 ? `fez ${n} sessões: provável tratamento concluído (pacote completo)` : `fez ${n} sessões: provável interrupção`;
  const [, mm, dd] = ult.split('-');
  out.push({ json: linhaE(l, pid, u, { chave: k, acao: 'tarefa de fim de tratamento', status: modo === 'real' ? 'tarefa criada' : 'ensaio: criaria tarefa', detalhe: pista,
    tarefa_fim: modo === 'real' ? { text: `Sem sessão desde ${dd}/${mm} e nenhuma marcada (${pista}). Mover para Concluiu ou para Perdido · Interrompeu o tratamento; se estiver esperando o convênio, mover para Aguardando convênio.`, complete_till: Math.floor(Date.now() / 1000) + 24 * 3600, entity_id: l.id, entity_type: 'leads', task_type_id: 1 } : null }) }); }
return out;
