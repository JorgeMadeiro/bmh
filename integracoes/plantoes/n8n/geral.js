// (o montar.js põe aqui em cima o código de integracoes/plantoes/emails.js)
// Linha do mês na aba Geral. No teste (&prefixo=teste) não mexe na Geral.
const E = $('Monta os e-mails').first().json;
if (E.Q.prefixo) return [{ json: { pular: true } }];
const geral = (($('Lê a planilha').first().json.valueRanges || [])[2] || {}).values || [];
// aba feita à mão (valor em texto): grava o honorário já somado; aba do fluxo (valor em número): fórmula viva
const aba = (($('Lê a planilha').first().json.valueRanges || [])[0] || {}).values || [];
const valores = aba.slice(1).filter((l) => l[3] && /Asa Sul|Taguatinga/.test(l[6] || '')).map((l) => l[10]);
const manual = valores.filter((v) => typeof v !== 'number').length > valores.length / 2;
return [{ json: { pular: false, manual, ...pedidosGeral(geral, E.Q.mes, E.Q.aba, E.sessoes, manual ? E.honorarios.porUnidade : null) } }];
