// Seção da BMH na revisão semanal de tráfego (segunda 8h30), 28/10/2026. Pelo método da Nexo (Central_Claude/frentes/
// metodo-meta-ads.md, seção 6), adaptado ao que a BMH mede hoje (sem CRM: contato = conversão do Google, WhatsApp e ligação, e
// conversa iniciada do Meta). Lê as tabelas de números (BMH_google_anuncios_dia, BMH_meta_anuncios_dia) e o registro dos
// guardiões; devolve os blocos de texto e até 6 propostas. Fonte: este arquivo; o montador embute o texto no nó do n8n e o
// testa-revisao-semana.js roda com os dados de verdade pelo cofre.
//
// Nesta fase (homologação, simulação): proposta é só texto, sem botão, e não vai para o registro dos guardiões. A tabela do
// Google não tem o id do grupo, então aplicar por botão pede, na produção, a leitura do id pela API.
//
// D: segunda (AAAA-MM-DD), semana_ini e semana_fim (segunda a domingo da semana passada), ant_ini e ant_fim (a anterior),
// mes_ini (1º dia do mês de semana_fim), d30 (30 dias antes da segunda). T: google, meta, registro (linhas das tabelas).
function revisaoSemana(D, T, cfg) {
  const num = v => Number(v) || 0;
  const brl = v => 'R$ ' + Math.round(num(v)).toLocaleString('pt-BR');
  const int = v => Math.round(num(v)).toLocaleString('pt-BR');
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const entre = (d, a, b) => d >= a && d <= b;
  const pct = (a, b) => b ? ` (${a >= b ? '+' : ''}${Math.round((a / b - 1) * 100)}%)` : '';
  const cada = (g, c) => c >= 0.5 ? `, ${brl(g / c)} cada` : '';
  const soma = (rs, f) => rs.reduce((s, r) => s + num(r[f]), 0);
  const contatosG = r => num(r.contatos) + num(r.ligacoes);
  const google = (T.google || []).filter(r => r && r.dia), meta = (T.meta || []).filter(r => r && r.dia && r.tipo === 'anuncio');
  const contaMeta = (T.meta || []).filter(r => r && r.tipo === 'conta').sort((a, b) => (a.dia < b.dia ? -1 : 1)).pop();
  const PAUSA_MIN = Number(cfg.revisao_pausa_min || 60), ALERTA_30 = Number(cfg.revisao_alerta_30d || 50);
  // campanha em teste com régua própria fica fora da revisão até a data (a mesma exceção do guardião do Google)
  const EM_TESTE = [[/teste 4 semanas/i, '2026-11-05']];
  const emTeste = nome => EM_TESTE.some(([re, ate]) => re.test(nome) && D.segunda <= ate);
  const blocos = [], propostas = [], alertas = [];

  // ---------- Google ----------
  const gS = google.filter(r => entre(r.dia, D.semana_ini, D.semana_fim)), gA = google.filter(r => entre(r.dia, D.ant_ini, D.ant_fim));
  const gM = google.filter(r => entre(r.dia, D.mes_ini, D.semana_fim));
  const tetoG = num(cfg['teto_mes_' + D.mes_ini.slice(0, 7)] || cfg.teto_mes);
  const porGrupo = rs => { const m = {}; for (const r of rs) { const k = r.campanha + ' › ' + r.grupo; (m[k] ||= { alvo: k, campanha: r.campanha, gasto: 0, contatos: 0 }); m[k].gasto += num(r.gasto); m[k].contatos += contatosG(r); } return Object.values(m); };
  const gruposS = porGrupo(gS).sort((a, b) => b.gasto - a.gasto);
  const gGasto = soma(gS, 'gasto'), gCont = gS.reduce((s, r) => s + contatosG(r), 0), gGastoA = soma(gA, 'gasto'), gContA = gA.reduce((s, r) => s + contatosG(r), 0);
  blocos.push({ titulo: 'Google Ads', texto: [
    `Semana: ${brl(gGasto)}${pct(gGasto, gGastoA)} · ${int(gCont)} ${Math.round(gCont) === 1 ? 'contato' : 'contatos'}${cada(gGasto, gCont)} (semana anterior: ${brl(gGastoA)}, ${int(gContA)}${cada(gGastoA, gContA)})`,
    `Mês até ${dm(D.semana_fim)}: ${brl(soma(gM, 'gasto'))}${tetoG ? ' de ' + brl(tetoG) : ''} · ${int(gM.reduce((s, r) => s + contatosG(r), 0))} contatos`,
    ...gruposS.slice(0, 4).map(g => `• ${g.alvo}: ${brl(g.gasto)}, ${int(g.contatos)} ${Math.round(g.contatos) === 1 ? 'contato' : 'contatos'}${cada(g.gasto, g.contatos)}${emTeste(g.campanha) ? ' (em teste, régua própria)' : ''}`),
  ].join('\n') });
  const mediaG = gCont >= 0.5 ? gGasto / gCont : null;
  for (const g of gruposS) {
    if (emTeste(g.campanha) || g.gasto < PAUSA_MIN) continue;
    const caro = mediaG && g.contatos >= 0.5 && g.gasto / g.contatos >= 3 * mediaG;
    if (g.contatos < 0.5 || caro) propostas.push({ plataforma: 'google', regra: g.contatos < 0.5 ? 'rev_pausar_sem_contato' : 'rev_pausar_caro', alvo: g.alvo, alvo_id: '',
      acao: 'pausar', valor_antes: g.gasto.toFixed(2), valor_novo: '', gasto: g.gasto,
      motivo: g.contatos < 0.5 ? `${brl(g.gasto)} na semana sem nenhum contato` : `${brl(g.gasto / g.contatos)} por contato, 3 vezes ou mais a média da conta (${brl(mediaG)})` });
  }
  for (const g of porGrupo(google.filter(r => entre(r.dia, D.d30, D.semana_fim)))) if (!emTeste(g.campanha) && g.gasto >= ALERTA_30 && g.contatos < 0.5)
    alertas.push(`• Google ${g.alvo}: ${brl(g.gasto)} em 30 dias sem contato`);

  // ---------- Meta ----------
  const mS = meta.filter(r => entre(r.dia, D.semana_ini, D.semana_fim)), mA = meta.filter(r => entre(r.dia, D.ant_ini, D.ant_fim));
  const mM = meta.filter(r => entre(r.dia, D.mes_ini, D.semana_fim)), m30 = meta.filter(r => entre(r.dia, D.d30, D.semana_fim));
  const tetoM = num(cfg['meta_teto_mes_' + D.mes_ini.slice(0, 7)] || cfg.meta_teto_mes);
  const mGasto = soma(mS, 'gasto'), mConv = soma(mS, 'conversas'), mCliq = soma(mS, 'cliques_link'), mGastoA = soma(mA, 'gasto'), mConvA = soma(mA, 'conversas');
  const temConversa30 = soma(m30, 'conversas') >= 1;
  blocos.push({ titulo: 'Meta', texto: [
    `Semana: ${brl(mGasto)}${pct(mGasto, mGastoA)} · ${int(mConv)} ${Math.round(mConv) === 1 ? 'conversa' : 'conversas'}${cada(mGasto, mConv)} · ${int(mCliq)} cliques no link (semana anterior: ${brl(mGastoA)}, ${int(mConvA)} conversas)`,
    `Mês até ${dm(D.semana_fim)}: ${brl(soma(mM, 'gasto'))}${tetoM ? ' de ' + brl(tetoM) : ''}`,
    contaMeta && num(contaMeta.verba_restante) > 0 ? `Verba da conta: ${brl(contaMeta.verba_restante)}${contaMeta.acaba_em ? ', até ' + dm(contaMeta.acaba_em) : ''} (foto de ${dm(contaMeta.dia)})` : '',
    temConversa30 ? '' : 'As campanhas ligadas são de engajamento e não trazem conversa: a decisão sobre elas é a P3 da auditoria de 20/10, não da régua.',
  ].filter(Boolean).join('\n') });
  if (temConversa30) {
    const porConj = {}; for (const r of mS) { const k = r.conjunto_id; (porConj[k] ||= { alvo: r.campanha + ' › ' + r.conjunto, alvo_id: k, gasto: 0, conversas: 0 }); porConj[k].gasto += num(r.gasto); porConj[k].conversas += num(r.conversas); }
    const mediaM = mConv >= 1 ? mGasto / mConv : null;
    for (const c of Object.values(porConj)) {
      if (c.gasto < PAUSA_MIN) continue;
      const caro = mediaM && c.conversas >= 1 && c.gasto / c.conversas >= 3 * mediaM;
      if (c.conversas < 1 || caro) propostas.push({ plataforma: 'meta', regra: c.conversas < 1 ? 'rev_pausar_sem_contato' : 'rev_pausar_caro', alvo: c.alvo, alvo_id: c.alvo_id,
        acao: 'pausar', valor_antes: c.gasto.toFixed(2), valor_novo: '', gasto: c.gasto,
        motivo: c.conversas < 1 ? `${brl(c.gasto)} na semana sem nenhuma conversa` : `${brl(c.gasto / c.conversas)} por conversa, 3 vezes ou mais a média (${brl(mediaM)})` });
    }
  }

  // ---------- Guardiões na semana ----------
  const reg = (T.registro || []).filter(r => r && r.data && entre(r.data, D.semana_ini, D.semana_fim));
  const resumoReg = plat => { const rs = reg.filter(r => r.plataforma === plat); if (!rs.length) return '';
    const c = {}; for (const r of rs) { const k = r.acao === 'avisar' ? 'avisos' : r.resultado === 'aplicado' ? 'aplicados' : /^ignorado/.test(r.resultado) ? 'ignorados' : r.resultado === 'simulado' ? 'propostas sem decisão' : r.resultado; c[k] = (c[k] || 0) + 1; }
    return `${plat === 'google' ? 'Google' : 'Meta'}: ` + Object.entries(c).map(([k, n]) => `${n} ${k}`).join(', '); };
  blocos.push({ titulo: 'Guardiões na semana', texto: [resumoReg('google'), resumoReg('meta')].filter(Boolean).join('\n') || 'Nenhum aviso nem proposta na semana.' });
  if (alertas.length) blocos.push({ titulo: 'Sem contato em 30 dias (só leitura)', texto: alertas.join('\n') });
  blocos.push({ titulo: 'Medição', texto: 'Sem CRM ainda: contato é a conversão do Google (WhatsApp e ligação) e a conversa iniciada do Meta. Agendamento e paciente novo entram com o Kommo.' });

  // nunca propor pausar tudo de um canal: se as pausas cobrem todos os grupos ou conjuntos com gasto na semana, ficam só como leitura
  for (const plat of ['google', 'meta']) {
    const comGasto = plat === 'google' ? gruposS.filter(g => g.gasto > 0).length : new Set(mS.filter(r => num(r.gasto) > 0).map(r => r.conjunto_id)).size;
    const ps = propostas.filter(p => p.plataforma === plat);
    if (ps.length && ps.length >= comGasto) for (const p of ps) { p.acao = 'avisar'; p.motivo += '. Não proponho pausar: deixaria o canal sem anúncio.'; }
  }
  propostas.sort((a, b) => b.gasto - a.gasto);
  return { blocos, propostas: propostas.slice(0, 6) };
}

// Texto do Telegram (robô BMH alertas) e linhas da BMH_anuncios_revisao: blocos nas vagas 1 a 6 e propostas nas vagas 101 a
// 106, sempre todas, as sem conteúdo vazias, para uma rodada nova não deixar bloco ou proposta velha na tabela.
function montaRevisao(D, R, agoraISO, teste) {
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const t = [(teste ? '🧪 TESTE: nada foi gravado\n' : '') + `📊 BMH · revisão de tráfego da semana ${dm(D.semana_ini)} a ${dm(D.semana_fim)} (homologação, simulação)`];
  for (const b of R.blocos) t.push('', `<${b.titulo}>`, b.texto);
  t.push('', R.propostas.length ? 'Ajustes que eu proporia (nada muda; sem botão nesta fase):' : 'Nenhum ajuste proposto pela régua.');
  R.propostas.forEach((p, i) => t.push(`${i + 1}. ${p.acao === 'pausar' ? 'Pausar' : 'Olhar'} ${p.plataforma === 'google' ? 'o grupo' : 'o conjunto'} "${p.alvo}": ${p.motivo}`));
  let texto = t.join('\n').replace(/^<(.*)>$/gm, '▸ $1');
  if (texto.length > 3800) texto = texto.slice(0, texto.lastIndexOf('\n', 3800)) + '\n(...)';
  const base = { semana: D.segunda, plataforma: '', regra: '', alvo_id: '', alvo: '', acao: '', valor_antes: '', valor_novo: '', registro_chave: '', resultado: '', atualizado_em: agoraISO };
  const linhas = [];
  for (let i = 0; i < 6; i++) { const b = R.blocos[i];
    linhas.push({ ...base, chave: `${D.segunda}|bloco|${i + 1}`, tipo: 'bloco', ordem: i + 1, titulo: b ? b.titulo : '', texto: b ? b.texto : '' }); }
  for (let i = 0; i < 6; i++) { const p = R.propostas[i];
    linhas.push({ ...base, chave: `${D.segunda}|proposta|${101 + i}`, tipo: 'proposta', ordem: 101 + i, titulo: p ? `${p.acao === 'pausar' ? 'Pausar' : 'Olhar'} ${p.alvo}` : '', texto: p ? p.motivo : '',
      ...(p ? { plataforma: p.plataforma, regra: p.regra, alvo_id: p.alvo_id, alvo: p.alvo, acao: p.acao, valor_antes: p.valor_antes, valor_novo: p.valor_novo, resultado: 'simulado' } : {}) }); }
  return { texto, linhas };
}
// FIM-DA-FUNCAO (o montador corta daqui para baixo ao embutir no n8n)
if (typeof module !== 'undefined') module.exports = { revisaoSemana, montaRevisao };
