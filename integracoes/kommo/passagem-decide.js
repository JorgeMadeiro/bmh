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
const leads = []; for (const p of $('Leads no Kommo').all()) leads.push(...(p.json?._embedded?.leads || []));
const contatos = {}; for (const p of $('Contatos no Kommo').all()) for (const c of (p.json?._embedded?.contacts || [])) contatos[c.id] = c;
const FUNIL = { triagem: 14783287, 'Asa Sul': 14783519, Taguatinga: 14783523 };
const ETAPA = { 'Asa Sul': 114237079, Taguatinga: 114237099 };
const UNIDADE = { campo: 626676, 'Asa Sul': 463116, Taguatinga: 463118 }, ID_IGUT = 626684;
const COPIAR = [626668, 624514, 624510, 624512, 624508, 624516, 624524, 624526, 626670, 626672, 626674, 626678, 626680, 626682];
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
    const campos = [...copia(tri.l).filter((f) => f.field_id !== UNIDADE.campo), { field_id: UNIDADE.campo, values: [{ enum_id: UNIDADE[a.unidade] }] }, { field_id: ID_IGUT, values: [{ value: a.pid }] }];
    r.novo = { name: tri.l.name || 'Avaliação ' + a.unidade, pipeline_id: FUNIL[a.unidade], status_id: ETAPA[a.unidade], custom_fields_values: campos,
      _embedded: { contacts: [{ id: tri.contato }], tags: (tri.l._embedded?.tags || []).map((t) => ({ id: t.id })) } };
    r.ganha = { id: tri.l.id, pipeline_id: FUNIL.triagem, status_id: 142, custom_fields_values: [{ field_id: UNIDADE.campo, values: [{ enum_id: UNIDADE[a.unidade] }] }, { field_id: ID_IGUT, values: [{ value: a.pid }] }] };
  }
  out.push({ json: r });
}
return out;
