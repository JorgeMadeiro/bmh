// Prazo de recebimento por convênio (painel da diretoria, 09/10/2026: "tempo médio do produzido até o recebido por
// convênio"). Para cada linha de FATURA de convênio paga (é nela que o iGut grava a data do pagamento; a linha da sessão
// quase sempre vem sem), dias entre a sessão (data) e o pagamento (data_pagamento), pesados pelo valor pago.
// Grava por mês × unidade × convênio a soma de (dias × valor) e o valor pago: o painel tira a média ponderada pelo valor
// no período escolhido. Só desde nov/2024 (antes o iGut não registrava pagamento). Só totais, sem paciente.
const n = (v) => Number(v) || 0, CONTROLE = '2024-11';
const UNI = (s) => (/taguatinga/i.test(s || '') ? 'Taguatinga' : /l2 sul|asa sul/i.test(s || '') ? 'Asa Sul' : null);
const meses = $('Meses').all().map((i) => i.json.mes), resp = $('BI do mês').all(), agora = $now.toISO();
const nomeConv = {}; try { const j = $('Convênios').first().json; const l = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.Convenio) ? j.data.Convenio : Array.isArray(j) ? j : [];
  for (const c of l) { const o = c.Convenio || c; if (o && o.id != null && (o.nome || o.descricao)) nomeConv[String(o.id)] = String(o.nome || o.descricao).trim(); } } catch (e) {}
const out = {};
meses.forEach((mes, k) => {
  if (mes < CONTROLE) return;
  const lista = resp[k]?.json?.data?.Produzido; if (!Array.isArray(lista)) return;
  for (const x of lista) {
    if (!x.e_fatura_sessao || !x.data_pagamento) continue;   // só a linha de fatura com data de pagamento
    const u = UNI(x.nome); if (!u) continue;
    const conv = String(x.convenio || nomeConv[String(x.convenio_id)] || '').trim() || 'Sem convênio no iGut';
    if (/particular/i.test(conv)) continue;
    const ini = DateTime.fromISO(String(x.data || '').slice(0, 10)), fim = DateTime.fromISO(String(x.data_pagamento || '').slice(0, 10));
    if (!ini.isValid || !fim.isValid) continue;
    const dias = Math.round(fim.diff(ini, 'days').days); if (dias < 0 || dias > 730) continue;   // data de pagamento inválida fica fora
    const v = n(x.totalpago) || (x.pago === 'S' ? n(x.totalproduzido) - n(x.total_glosa) : 0); if (v <= 0) continue;
    const chave = [mes, u, conv].join('|');
    const r = (out[chave] ||= { chave, mes, unidade: u, convenio: conv, valor_pago: 0, dias_x_valor: 0, sessoes_pagas: 0, atualizado_em: agora });
    r.valor_pago += v; r.dias_x_valor += dias * v; r.sessoes_pagas++;
  }
});
const novos = Object.values(out).map((r) => ({ ...r, valor_pago: Math.round(r.valor_pago * 100) / 100, dias_x_valor: Math.round(r.dias_x_valor) }));
// linha que existia no mês refeito e não aparece mais volta zerada (o painel ignora valor zero)
const refeitos = new Set(meses.filter((m, k) => m >= CONTROLE && Array.isArray(resp[k]?.json?.data?.Produzido))), chaves = new Set(novos.map((r) => r.chave));
let zerados = []; try { zerados = $('Prazo (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && refeitos.has(r.mes) && !chaves.has(r.chave) && n(r.valor_pago))
  .map((r) => ({ chave: r.chave, mes: r.mes, unidade: r.unidade, convenio: r.convenio, valor_pago: 0, dias_x_valor: 0, sessoes_pagas: 0, atualizado_em: agora })); } catch (e) {}
return [...novos, ...zerados].map((json) => ({ json }));
