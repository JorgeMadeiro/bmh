// (o montar.js põe aqui em cima o código de integracoes/plantoes/monta-mes.js)
const D = $('Monta o mês').first().json;
const ids = ($('Cria as abas').first().json.replies || []).filter((r) => r.addSheet).map((r) => r.addSheet.properties.sheetId);
const P = pedidosPlanilha(D.M, D.aba, ids[0], D.rotulo);
return [{ json: { valores: { valueInputOption: 'USER_ENTERED', data: P.valores }, formatos: { requests: P.formatos } } }];
