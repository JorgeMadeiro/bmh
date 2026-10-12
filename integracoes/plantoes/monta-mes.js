// Fechamento mensal dos plantões médicos da BMH (09/10/2026), a partir da aba "Respostas" do formulário (planilha
// "Planilha Prestação Serviço Médico"). Mesmas regras do prompt que o Jorge usava, mais as regras de turno da BMH:
//   Asa Sul: manhã 8:00–14:00, tarde 15:00–20:30 · Taguatinga: manhã 8:00–14:00, tarde 15:00–19:00 · R$ 75/hora.
// Entrada: RESP (valores da aba Respostas, com data/hora em número de série) e MES ("AAAA-MM").
// Saída: linhas da aba do mês (com subtotais e total), cobertura por dia e a lista de divergências. Não inventa plantão.
// Usado no n8n (nó "Monta o mês") e no teste local (integracoes/plantoes/testa.js).
function montarMes(RESP, MES, VALOR_HORA = 75) {
  const FIM_TARDE = { 'Asa Sul': 20.5, 'Taguatinga': 19 };
  const [cab, ...L] = RESP;
  const col = (re) => cab.findIndex((c) => re.test(String(c)));
  const C = { carimbo: 0, email: 1, nome: 2, crm: 3, data: 4, turno: 5, unidade: 6, ini: col(/in[ií]cio/i), fim: col(/t[eé]rmino/i) };
  const serialData = (s) => { const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(s) * 864e5); return d.toISOString().slice(0, 10); };
  const hora = (v) => (typeof v === 'number' ? Math.round((v % 1) * 1440) / 60 : null);   // fração do dia → horas (19.5 = 19:30)
  const hhmm = (h) => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0');
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  const PEQ = ['de', 'da', 'do', 'das', 'dos', 'e'];
  const titulo = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase().split(' ').map((p, i) => (i && PEQ.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))).join(' ');
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const div = { lacunas: [], doisMedicos: [], duasUnidades: [], duplicados: [], tardesCurtas: [], correcoes: [], semHorario: [] };
  // 1. só plantões do mês (pela data do plantão, não pelo carimbo)
  const brutos = L.filter((l) => typeof l[C.data] === 'number' && serialData(l[C.data]).startsWith(MES) && l[C.nome]);
  // 2. médico = e-mail (ou CRM): nome mais longo e CRM mais frequente do grupo
  const grupo = {};
  for (const l of brutos) { const k = norm(l[C.email]) || String(l[C.crm]).replace(/\D/g, ''); (grupo[k] ||= []).push(l); }
  const medico = {};
  for (const [k, ls] of Object.entries(grupo)) {
    const nomes = ls.map((l) => titulo(l[C.nome])), nome = nomes.sort((a, b) => b.length - a.length)[0];
    const freq = {}; ls.forEach((l) => { const c = String(l[C.crm]).replace(/\D/g, ''); if (c) freq[c] = (freq[c] || 0) + 1; });
    const crm = Object.entries(freq).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0] || '';
    medico[k] = { nome, crm: Number(crm) || '' };
    const crmsErrados = [...new Set(ls.map((l) => String(l[C.crm]).trim()))].filter((c) => c.replace(/\D/g, '') !== crm);
    if (crmsErrados.length) div.correcoes.push(`${nome}: CRM ${crmsErrados.join(', ')} → ${crm}`);
    const outros = [...new Set(ls.map((l) => String(l[C.nome]).replace(/\s+/g, ' ').trim()))].filter((n) => n !== nome);
    if (outros.length && !div.correcoes.some((c) => c.startsWith(nome + ': nome'))) div.correcoes.push(`${nome}: nome padronizado (era ${outros.map((n) => '"' + n + '"').join(', ')})`);
  }
  // 3. linhas de turno (Específico vira manhã + tarde)
  let linhas = [];
  for (const l of brutos) {
    const k = norm(l[C.email]) || String(l[C.crm]).replace(/\D/g, ''), m = medico[k], u = String(l[C.unidade]).trim(), dia = serialData(l[C.data]);
    const t = norm(l[C.turno]), ini = hora(l[C.ini]), fim = hora(l[C.fim]);
    const base = { k: String(m.crm || m.nome), nome: m.nome, crm: m.crm, email: l[C.email], carimbo: l[C.carimbo], dataSerial: Math.floor(l[C.data]), dia, unidade: u };
    if (t.startsWith('manha')) linhas.push({ ...base, turno: 'Manhã', ini: 8, fim: 14 });
    else if (t.startsWith('tarde')) {
      if (fim == null) div.semHorario.push(`${m.nome} · ${u} · ${dia.slice(8)}/${dia.slice(5, 7)}: tarde sem horário de término (usei ${hhmm(FIM_TARDE[u] || 19)})`);
      linhas.push({ ...base, turno: 'Tarde', ini: 15, fim: fim ?? (FIM_TARDE[u] || 19) });
    } else {   // Específico: manhã até 14:00 e tarde a partir das 15:00 (1h de pausa não paga)
      const i = ini ?? 8, f = fim ?? 14;
      if (i < 14) linhas.push({ ...base, turno: 'Manhã', ini: i, fim: Math.min(f, 14) });
      if (f > 15) linhas.push({ ...base, turno: 'Tarde', ini: Math.max(i, 15), fim: f });
      if (ini == null || fim == null) div.semHorario.push(`${m.nome} · ${u} · ${dia.slice(8)}/${dia.slice(5, 7)}: "Específico" sem início ou término`);
    }
  }
  // 4. duplicados: mesmo médico + data + unidade + turno → fica o envio mais recente
  const porChave = {};
  for (const r of linhas) { const c = [r.k, r.dia, r.unidade, r.turno].join('|'); (porChave[c] ||= []).push(r); }
  linhas = Object.values(porChave).map((rs) => {
    rs.sort((a, b) => b.carimbo - a.carimbo);
    if (rs.length > 1 && new Set(rs.map((r) => r.ini + '-' + r.fim)).size > 1)
      div.duplicados.push(`${rs[0].nome} · ${rs[0].unidade} · ${rs[0].dia.slice(8)}/${rs[0].dia.slice(5, 7)} · ${rs[0].turno}: ${rs.map((r) => hhmm(r.ini) + '–' + hhmm(r.fim)).join(' e ')} → mantido ${hhmm(rs[0].ini)}–${hhmm(rs[0].fim)} (envio mais recente)`);
    return rs[0];
  });
  // 5. ordem: médico → unidade (Asa Sul antes) → data → manhã antes da tarde
  const ordU = (u) => (u === 'Asa Sul' ? 0 : 1);
  linhas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') || ordU(a.unidade) - ordU(b.unidade) || a.dia.localeCompare(b.dia) || (a.turno === 'Manhã' ? 0 : 1) - (b.turno === 'Manhã' ? 0 : 1));
  // 6. divergências de cobertura
  const ano = Number(MES.slice(0, 4)), mm = Number(MES.slice(5, 7)), nDias = new Date(Date.UTC(ano, mm, 0)).getUTCDate();
  const cobertura = [], lacunas = [];
  for (let d = 1; d <= nDias; d++) {
    const dia = `${MES}-${String(d).padStart(2, '0')}`, sem = DIAS[new Date(dia + 'T12:00:00Z').getUTCDay()], linha = { dia, sem };
    for (const u of ['Asa Sul', 'Taguatinga']) {
      const rs = linhas.filter((r) => r.dia === dia && r.unidade === u); linha[u] = rs.length;
      const temM = rs.some((r) => r.turno === 'Manhã'), temT = rs.some((r) => r.turno === 'Tarde');
      for (const t of [['Manhã', temM], ['Tarde', temT]]) if (!t[1]) lacunas.push({ dia, dataSerial: Math.floor(Date.UTC(Number(dia.slice(0, 4)), Number(dia.slice(5, 7)) - 1, d) / 864e5 + 25569), unidade: u, turno: t[0], ini: t[0] === 'Manhã' ? 8 : 15, fim: t[0] === 'Manhã' ? 14 : (FIM_TARDE[u] || 19) });
      if (!temM || !temT) div.lacunas.push(`${String(d).padStart(2, '0')}/${MES.slice(5)} (${sem}) · ${u}: ${!temM && !temT ? 'nenhum registro' : 'falta a ' + (temM ? 'tarde' : 'manhã')}`);
      for (const t of ['Manhã', 'Tarde']) { const ms = rs.filter((r) => r.turno === t); if (ms.length > 1) div.doisMedicos.push(`${String(d).padStart(2, '0')}/${MES.slice(5)} · ${u} · ${t}: ${ms.map((r) => r.nome + ' (' + hhmm(r.ini) + '–' + hhmm(r.fim) + ')').join(' e ')}`); }
      for (const r of rs) if (r.turno === 'Tarde' && r.fim < (FIM_TARDE[u] || 19) - 0.01) div.tardesCurtas.push(`${String(d).padStart(2, '0')}/${MES.slice(5)} (${sem}${['sábado', 'domingo'].includes(sem) ? '' : ', dia útil'}) · ${u} · ${r.nome}: terminou ${hhmm(r.fim)} (horário da unidade: ${hhmm(FIM_TARDE[u] || 19)})`);
    }
    const porMed = {}; linhas.filter((r) => r.dia === dia).forEach((r) => (porMed[r.nome] ||= new Set()).add(r.unidade));
    for (const [n, us] of Object.entries(porMed)) if (us.size > 1) div.duasUnidades.push(`${String(d).padStart(2, '0')}/${MES.slice(5)}: ${n} nas duas unidades`);
    cobertura.push(linha);
  }
  // 7. subtotais por médico + unidade e total
  const subtotais = []; const tot = { horas: 0, valor: 0 };
  for (const r of linhas) {
    r.horas = r.fim - r.ini; r.valor = Math.round(r.horas * VALOR_HORA * 100) / 100;
    let s = subtotais.find((x) => x.nome === r.nome && x.unidade === r.unidade); if (!s) subtotais.push((s = { nome: r.nome, crm: r.crm, unidade: r.unidade, horas: 0, valor: 0, plantoes: 0 }));
    s.horas += r.horas; s.valor += r.valor; s.plantoes++; tot.horas += r.horas; tot.valor += r.valor;
  }
  return { mes: MES, linhas, subtotais, total: tot, cobertura, lacunas, divergencias: div, hhmm };
}
// Monta os pedidos à API do Google Sheets (fórmulas com ';', a planilha é pt-BR). Uma aba só (pedido do Jorge, 09/10/2026:
// "deixar a cobertura junto, mesmo com nada escrito mas marcado em vermelho"): plantões por médico com subtotais e, no
// fim, uma linha por turno sem formulário (data, turno e unidade preenchidos; nome e CRM em branco), em vermelho até o
// nome ser preenchido. O TOTAL soma toda linha com CRM, então a lacuna completada já entra no total e no e-mail.
function pedidosPlanilha(M, aba, idAba, rotuloMes) {
  const V = [['Carimbo de data/hora', 'Endereço de e-mail', 'Nome Completo', 'CRM', 'Data', 'Turno', 'Unidade', 'Horário de Inicio', 'Horário de Termino', 'Horas Trabalhadas', 'Valor', '', 'Valor/hora (R$)', 75]];
  const destaque = [];
  let ini = 2;
  const flush = (g) => { const fim = V.length; V.push(['', '', g.nome, '', '', '', g.unidade, '', '', `=SUM(J${ini}:J${fim})`, `=SUM(K${ini}:K${fim})`]); destaque.push(V.length - 1); ini = V.length + 1; };
  const linha = (n, r) => [r.carimbo ?? '-', r.email || '-', r.nome || '', r.crm || '', r.dataSerial, r.turno === 'Manhã' ? 'Manha (8:00 as 14:00)' : 'Tarde/Noite', r.unidade, r.ini / 24, r.fim / 24, `=I${n}-H${n}`, `=ROUND((I${n}-H${n})*24*$N$1;2)`];
  let g = null;
  for (const r of M.linhas) { if (g && (g.nome !== r.nome || g.unidade !== r.unidade)) flush(g); g = r; V.push(linha(V.length + 1, r)); }
  if (g) flush(g);
  let titLac = null;
  if (M.lacunas.length) {
    V.push(['', '', 'LACUNAS: turnos sem formulário. Preencha Nome e CRM (Carimbo e E-mail ficam "-"); o vermelho some e o turno entra no total.']); titLac = V.length - 1;
    for (const l of M.lacunas) V.push(linha(V.length + 1, { ...l, carimbo: '-', email: '-' }));
  }
  const n = V.length;
  V.push(['', '', 'TOTAL ' + rotuloMes.toUpperCase(), '', '', '', '', '', '', `=SUMIF(D2:D${n};">0";J2:J${n})`, `=SUMIF(D2:D${n};">0";K2:K${n})`]);
  const totLinha = V.length - 1;
  const cor = (r, g, b) => ({ red: r, green: g, blue: b });
  const fmt = (r0, r1, c0, c1, f, campos) => ({ repeatCell: { range: { sheetId: idAba, startRowIndex: r0, endRowIndex: r1, startColumnIndex: c0, endColumnIndex: c1 }, cell: { userEnteredFormat: f }, fields: 'userEnteredFormat(' + campos + ')' } });
  const N = V.length;
  const req = [
    fmt(0, N, 0, 14, { textFormat: { fontFamily: 'Arial', fontSize: 10 } }, 'textFormat'),
    fmt(0, 1, 0, 11, { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: cor(1, 1, 1) }, backgroundColor: cor(0, 0.137, 0.459) }, 'textFormat,backgroundColor'),
    fmt(1, N, 0, 1, { numberFormat: { type: 'DATE_TIME', pattern: 'dd/mm/yyyy hh:mm:ss' } }, 'numberFormat'),
    fmt(1, N, 4, 5, { numberFormat: { type: 'DATE', pattern: 'dd/mm/yy' } }, 'numberFormat'),
    fmt(1, N, 7, 9, { numberFormat: { type: 'TIME', pattern: 'hh:mm' } }, 'numberFormat'),
    fmt(1, N, 9, 10, { numberFormat: { type: 'TIME', pattern: '[h]:mm' } }, 'numberFormat'),
    fmt(1, N, 10, 11, { numberFormat: { type: 'CURRENCY', pattern: '"R$" #,##0.00' } }, 'numberFormat'),
    fmt(0, 1, 12, 13, { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true } }, 'textFormat'),
    fmt(0, 1, 13, 14, { textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: cor(0, 0, 1) }, backgroundColor: cor(1, 1, 0.6), numberFormat: { type: 'CURRENCY', pattern: '"R$" #,##0.00' } }, 'textFormat,backgroundColor,numberFormat'),
    ...destaque.map((r) => fmt(r, r + 1, 0, 11, { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true }, backgroundColor: cor(0.87, 0.92, 0.97) }, 'textFormat,backgroundColor')),
    ...(titLac != null ? [fmt(titLac, titLac + 1, 0, 11, { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: cor(0.6, 0, 0) } }, 'textFormat')] : []),
    fmt(totLinha, totLinha + 1, 0, 11, { textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: cor(1, 1, 1) }, backgroundColor: cor(0, 0.078, 0.247) }, 'textFormat,backgroundColor'),
    // vermelho em todo turno com data e sem nome (lacuna ainda não preenchida)
    { addConditionalFormatRule: { index: 0, rule: { ranges: [{ sheetId: idAba, startRowIndex: 1, endRowIndex: totLinha, startColumnIndex: 0, endColumnIndex: 11 }], booleanRule: { condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: '=AND($E2<>"";$C2="")' }] }, format: { backgroundColor: cor(0.98, 0.8, 0.8) } } } } },
    { updateSheetProperties: { properties: { sheetId: idAba, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
    { autoResizeDimensions: { dimensions: { sheetId: idAba, dimension: 'COLUMNS', startIndex: 0, endIndex: 14 } } },
  ];
  return { valores: [{ range: "'" + aba.replace(/'/g, "''") + "'!A1", values: V }], formatos: req, linhasAba: N };
}
if (typeof module !== 'undefined') module.exports = { montarMes, pedidosPlanilha };
