// Aba "Geral" da planilha de plantões, tabela de baixo ("ASA SUL": sessões mono, média por dia, ocupação, sessões multi,
// média, ocupação). Pedido do Jorge, 09/10/2026: preencher 1x por mês, junto do relatório mensal da diretoria. Sessão =
// agenda da câmara finalizada e sem falta (mesma regra das sessões do mês): monoplace = agenda 111, multiplace = 112.
// Ocupação usa o mesmo divisor da última linha preenchida (o Jorge muda quando muda a grade). Se faltou algum dia na
// resposta do iGut, não grava (avisa no lugar). Só contagens.
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'], GERAL_ID = 118589530;
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const Q = $('Qual mês').first().json, dias = $('Qual mês').all().map((i) => i.json.dia), resp = $('Agenda do dia').all();
const n = { 111: 0, 112: 0 }; let falhou = 0; const quais = [];
dias.forEach((dia, k) => {
  const j = resp[k]?.json || {}, lista = j.data;
  // dia sem agenda (feriado) volta como mensagem, não como erro: conta zero
  if (!Array.isArray(lista)) { if (/no matching data|nenhum registro/i.test(JSON.stringify(j))) return; falhou++; quais.push(dia.slice(8) + ' (' + String(j.error?.message || j.message || JSON.stringify(j)).slice(0, 60) + ')'); return; }
  const vistos = new Set();
  for (const x of lista) {
    const id = Number(x.Profissional?.id); if (!(id in n)) continue;
    if (String(x.Agendamento?.data || '').slice(0, 10) !== dia) continue;
    const ag = x.Agendamento?.id; if (ag) { if (vistos.has(ag)) continue; vistos.add(ag); }
    if (!NAO_VEIO.includes(norm(x.Agendamento?.confirmado)) && norm(x.Agendamento?.status) === 'finalizado') n[id]++;
  }
});
const G = $('Geral · lê').first().json.values || [];
const mesDe = (v) => (typeof v === 'number' ? new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 7) : null);
const h = G.findIndex((l) => norm(l[1]) === 'sessoes mono');
if (h < 0) return [{ json: { falhou: 'aba Geral sem a tabela de mono e multi', mes: Q.mes } }];
let alvo = -1, ultima = h;
for (let i = h + 1; i < G.length && mesDe(G[i][0]); i++) { ultima = i; if (mesDe(G[i][0]) === Q.mes) alvo = i; }
const inserir = alvo < 0; if (inserir) alvo = ultima + 1;
// divisor da ocupação: o da última linha preenchida antes desta
let dMono = 16, dMulti = 48;
const div = (f) => Number((String(f || '').match(/\/\s*(\d+)\s*$/) || [])[1]);
// a própria linha, se já tem divisor; senão, a última preenchida antes dela
for (let i = inserir ? alvo - 1 : alvo; i > h; i--) if (div(G[i]?.[3]) && div(G[i]?.[6]) && (i === alvo || typeof G[i][1] === 'number')) { dMono = div(G[i][3]); dMulti = div(G[i][6]); break; }
const r = alvo + 1, nd = dias.length, serial = inserir ? Date.UTC(Number(Q.mes.slice(0, 4)), Number(Q.mes.slice(5)) - 1, 1) / 864e5 + 25569 : G[alvo][0];
const num = (v) => ({ userEnteredValue: { numberValue: v } }), f = (s) => ({ userEnteredValue: { formulaValue: s } });
const faixa = (i) => ({ sheetId: GERAL_ID, startRowIndex: i, endRowIndex: i + 1, startColumnIndex: 0, endColumnIndex: 7 });
const requests = [...(inserir ? [{ insertDimension: { range: { sheetId: GERAL_ID, dimension: 'ROWS', startIndex: alvo, endIndex: alvo + 1 }, inheritFromBefore: true } }] : []),
  { copyPaste: { source: faixa(alvo - 1), destination: faixa(alvo), pasteType: 'PASTE_FORMAT' } },
  { updateCells: { start: { sheetId: GERAL_ID, rowIndex: alvo, columnIndex: 0 }, fields: 'userEnteredValue',
    rows: [{ values: [num(serial), num(n[111]), f(`=B${r}/${nd}`), f(`=C${r}/${dMono}`), num(n[112]), f(`=E${r}/${nd}`), f(`=F${r}/${dMulti}`)] }] } }];
return [{ json: { falhou: falhou ? falhou + ' dia(s) sem resposta do iGut: ' + quais.join(', ') : '', mes: Q.mes, linha: r, mono: n[111], multi: n[112], corpo: { requests } } }];
