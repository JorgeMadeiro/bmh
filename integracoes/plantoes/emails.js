// Textos dos e-mails mensais da BMH (09/10/2026), no formato que o Jorge já mandava:
//  - honorários dos médicos: por unidade (CNPJ e endereço), cada médico com horas, valor, dados para pagamento e NF;
//  - produção das unidades: sessões finalizadas por unidade (mesma regra do relatório mensal e do painel).
// Lê a aba do mês DEPOIS que o Jorge completou as lacunas (linhas com CRM; subtotais e total ficam fora) e a aba
// "Pagamento". Os valores vêm da própria planilha (coluna K), então o que o Jorge corrigir lá entra no e-mail.
const UNIDADES = {
  'Asa Sul': { titulo: 'ASA SUL', cnpj: '07.091.027/0001-86', endereco: 'Setor SGA/SUL Quadra 613 Bloco A Conjunto E, 1 Subsolo Asa Sul. CEP 70200-730 - Brasília/DF' },
  'Taguatinga': { titulo: 'TAGUATINGA', cnpj: '07.091.027/0002-67', endereco: 'Brasilia Medicina Hiperbarica LTDA Area Especial Setor C Norte S/N Torre D, Lote 1 A 12, Loja 2 3 e 4 Taguatinga Norte (Taguatinga) Brasília DF 72115-700' },
};
const brl = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const horas = (h) => Number(h).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const normNome = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

// aba: valores UNFORMATTED da aba do mês (A:K, com cabeçalho); pagamento: valores da aba "Pagamento" (com cabeçalho)
function emailHonorarios(aba, pagamento, rotuloMes) {
  const pag = {}; const pagNome = {};
  for (const [crm, nomeForm, nomeEmail, dados, nf] of (pagamento || []).slice(1)) {
    const reg = { nomeEmail: String(nomeEmail || '').trim(), dados: String(dados || '').trim(), nf: String(nf || '').trim() };
    if (crm) pag[String(crm).replace(/\D/g, '')] = reg; if (nomeForm) pagNome[normNome(nomeForm)] = reg;
  }
  const soma = {}; const faltando = new Set();
  for (const l of (aba || []).slice(1)) {
    const crm = String(l[3] ?? '').replace(/\D/g, ''), u = String(l[6] || '').trim();
    if (!crm || !UNIDADES[u]) continue;   // subtotal e total não têm CRM
    const h = (Number(l[8]) - Number(l[7])) * 24;
    // valor: número (abas novas, com fórmula) ou texto "R$ 1.234,56" (abas antigas feitas à mão); sem valor, horas × 75
    let v = typeof l[10] === 'number' ? l[10] : Number(String(l[10] ?? '').replace(/[^\d,-]/g, '').replace(',', '.'));
    if (!isFinite(v) || (!v && isFinite(h))) v = Math.round(h * 75 * 100) / 100;
    const k = crm + '|' + u; const r = (soma[k] ||= { crm, nome: String(l[2] || '').trim(), unidade: u, horas: 0, valor: 0 });
    r.horas += isFinite(h) ? h : 0; r.valor += v;
  }
  const blocos = []; let geral = 0; const porUnidade = {};
  for (const u of ['Asa Sul', 'Taguatinga']) {
    const meds = Object.values(soma).filter((r) => r.unidade === u && r.valor > 0).sort((a, b) => b.valor - a.valor);
    if (!meds.length) continue;
    const U = UNIDADES[u]; const L = [U.titulo, 'BRASILIA MEDICINA HIPERBARICA LTDA', 'CNPJ: ' + U.cnpj, 'Endereço: ' + U.endereco, ''];
    let tot = 0;
    for (const m of meds) {
      const p = pag[m.crm] || pagNome[normNome(m.nome)];
      if (!p || !p.dados || /^pix\s*:?\s*$/i.test(p.dados)) faltando.add(m.nome);   // "Pix:" em branco também falta
      L.push(p?.nomeEmail || m.nome, 'Horas prestadas: ' + horas(m.horas) + ' hrs', 'Valor do serviço: ' + brl(m.valor), 'Dados para pgto:', p?.dados || '(PREENCHER na aba Pagamento da planilha)', p?.nf || 'Aguardar NF', '');
      tot += m.valor;
    }
    L.push('TOTAL ' + U.titulo + ': ' + brl(tot)); blocos.push(L.join('\n')); geral += tot; porUnidade[u] = Math.round(tot * 100) / 100;
  }
  // abertura e assunto como o Jorge manda (ex.: "Honorários Médicos Junho/2026")
  const nomeMes = String(rotuloMes).split('/')[0];
  const texto = `Bom dia, espero que estejam bem.\n\nSegue honorários médicos de ${nomeMes}, aos cuidados de Ieda:\n\n` + blocos.join('\n\n') + '\n\nTOTAL HONORÁRIOS: ' + brl(geral);
  return { assunto: 'Honorários Médicos ' + rotuloMes, texto, total: geral, porUnidade, medicos: Object.keys(soma).length, faltando: [...faltando] };
}

// sessoes: { 'Asa Sul': n, 'Taguatinga': n }
function emailProducao(sessoes, rotuloMes) {
  const a = sessoes['Asa Sul'] || 0, t = sessoes.Taguatinga || 0;
  return { assunto: 'Produção Asa Sul e Taguatinga ' + rotuloMes, texto: `Segue produção das unidades:\n    Asa Sul: ${a}\n    Taguatinga: ${t}\n    Total: ${a + t}\nAtt,` };
}
// Linha do mês na aba "Geral" (resumo mensal do Jorge: honorário, horas, sessões, média por dia, ocupação e valor por
// sessão, por unidade e no total). Pedido do Jorge, 09/10/2026 ("não atualizou o Geral"). Honorário por unidade é fórmula
// que soma a aba do mês (linhas com CRM, as lacunas preenchidas entram), então corrigir a aba corrige a Geral. Sessões vêm
// do iGut (as mesmas do e-mail de produção). Se o mês ainda não tem linha (a tabela do Jorge vai até dez/2026), abre uma
// logo abaixo da última. geral: valores UNFORMATTED de Geral!A1:B200; idGeral: sheetId da aba Geral. fixo: honorário por
// unidade já somado, para aba antiga feita à mão (valor em texto "R$ 450,00", que a fórmula não soma).
const GERAL_ID = 118589530;
function pedidosGeral(geral, mes, aba, ses, fixo = null, idGeral = GERAL_ID) {
  const mesDe = (v) => (typeof v === 'number' ? new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 7) : null);
  let linha = null, ultima = null;
  (geral || []).forEach((l, i) => { if (String(l[1] || '').trim() === 'Asa Sul' && mesDe(l[0])) { ultima = i + 1; if (mesDe(l[0]) === mes) linha = i + 1; } });
  if (!ultima) throw new Error('aba Geral sem a tabela por unidade');
  const inserir = !linha; if (inserir) linha = ultima + 1;
  const [a, m] = mes.split('-').map(Number), dias = new Date(Date.UTC(a, m, 0)).getUTCDate(), serial = Date.UTC(a, m - 1, 1) / 864e5 + 25569, r = linha;
  const q = "'" + aba.replace(/'/g, "''") + "'!";
  const hon = (u) => (fixo ? fixo[u] || 0 : `=SUMIFS(${q}K:K;${q}G:G;"${u}";${q}D:D;"<>")`);
  const values = [[serial, 'Asa Sul', hon('Asa Sul'), `=C${r}/75`, ses['Asa Sul'] || 0, `=E${r}/${dias}`, `=F${r}/$N$7`, `=C${r}/E${r}`, '',
    serial, 'Taguatinga', hon('Taguatinga'), `=L${r}/75`, ses.Taguatinga || 0, `=N${r}/${dias}`, `=O${r}/$O$7`, `=L${r}/N${r}`, '',
    serial, `=C${r}+L${r}`, `=T${r}/75`, `=E${r}+N${r}`, `=V${r}/${dias}`, `=W${r}/$P$7`, `=T${r}/V${r}`]];
  // abre a linha (se faltar) e copia o formato da linha de cima (moeda, %, média sem casa decimal)
  const faixa = (i) => ({ sheetId: idGeral, startRowIndex: i, endRowIndex: i + 1, startColumnIndex: 0, endColumnIndex: 25 });
  return { linha, inserir, abre: { requests: [...(inserir ? [{ insertDimension: { range: { sheetId: idGeral, dimension: 'ROWS', startIndex: linha - 1, endIndex: linha }, inheritFromBefore: true } }] : []),
    { copyPaste: { source: faixa(linha - 2), destination: faixa(linha - 1), pasteType: 'PASTE_FORMAT' } }] },
    grava: { valueInputOption: 'USER_ENTERED', data: [{ range: `Geral!A${r}:Y${r}`, values }] } };
}
if (typeof module !== 'undefined') module.exports = { emailHonorarios, emailProducao, pedidosGeral, UNIDADES };
