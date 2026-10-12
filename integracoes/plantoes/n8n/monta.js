// (o montar.js põe aqui em cima o código de integracoes/plantoes/monta-mes.js)
const Q = $('Qual mês').first().json;
const resp = $('Respostas').first().json.values || [];
const abas = ($('Abas da planilha').first().json.sheets || []).map((s) => s.properties);
const existe = abas.filter((s) => [Q.aba, Q.abaCob].includes(s.title));
if (existe.some((s) => s.title === Q.aba) && !Q.refazer) return [{ json: { existe: true, ...Q } }];
const M = montarMes(resp, Q.mes);
// uma aba só (a cobertura vai junto, em vermelho); a aba "Cobertura" antiga, se existir, sai no refazer
const requests = [...existe.map((s) => ({ deleteSheet: { sheetId: s.sheetId } })), { addSheet: { properties: { title: Q.aba, index: 2 } } }];
return [{ json: { existe: false, ...Q, M: JSON.parse(JSON.stringify({ ...M, hhmm: undefined })), corpoAbas: { requests } } }];
