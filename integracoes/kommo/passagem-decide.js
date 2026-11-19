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
    // contato com nome completo, código do iGut e e-mail (só se vazio), como na Nexo; nunca em contato de OUTRO paciente
    const c = contatos[tri.contato] || {}, cod = String((c.custom_fields_values || []).find((f) => f.field_id === 662778)?.values?.[0]?.value || '');
    if (cod && cod !== a.pid) r.detalhe = [r.detalhe, 'contato com outro código do iGut: nome não trocado'].filter(Boolean).join(' · ');
    else if (a.nome) { const temEmail = (c.custom_fields_values || []).some((f) => f.field_code === 'EMAIL');
      r.contato_patch = { id: tri.contato, name: a.nome, custom_fields_values: [{ field_id: 662778, values: [{ value: a.pid }] }, ...(a.email && !temEmail ? [{ field_id: 624502, values: [{ value: a.email, enum_code: 'WORK' }] }] : [])] }; }
    r.novo = { name: a.nome || tri.l.name || 'Avaliação ' + a.unidade, pipeline_id: FUNIL[a.unidade], status_id: ETAPA[a.unidade], custom_fields_values: campos,
      _embedded: { contacts: [{ id: tri.contato }], tags: [...(tri.l._embedded?.tags || []).map((t) => ({ id: t.id })), ...novas] } };
    r.ganha = { id: tri.l.id, pipeline_id: FUNIL.triagem, status_id: 142, custom_fields_values: doIgut };
  }
  if (acao !== 'passar') r.detalhe = [pagamento(a.convenio) || 'sem pagamento na agenda', jaFez.has(a.pid) ? 'retorno' : '', r.detalhe].filter(Boolean).join(' · ');
  out.push({ json: r });
}
return out;
