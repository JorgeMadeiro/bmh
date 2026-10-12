// Detalhe do financeiro por lote (painel da diretoria, 09/10/2026: "ao clicar no a receber, a faturar, glosado...
// destrinchar os dados"). Só convênio e só desde nov/2024 (antes o iGut não registrava lote e pagamento). Uma linha por
// mês × unidade × convênio × situação × lote, com quantas sessões, valor, glosa e os dias das sessões. Sem nome de
// paciente (a senha do painel circula no grupo): o lote e os dias bastam para achar no iGut.
// Situação de cada sessão: pago → recebido (valor menos glosa); em lote e não pago → a_receber (menos glosa); sem lote →
// a_faturar; glosa > 0 → também uma linha "glosado" com o valor da glosa.
// Linha que existia e não aparece mais (lote que foi pago, por exemplo) volta zerada: o painel ignora valor zero.
const n = (v) => Number(v) || 0, CONTROLE = '2024-11';
const UNI = (s) => (/taguatinga/i.test(s || '') ? 'Taguatinga' : /l2 sul|asa sul/i.test(s || '') ? 'Asa Sul' : null);
const meses = $('Meses').all().map((i) => i.json.mes), resp = $('BI do mês').all(), agora = $now.toISO();
const nomeConv = {}; try { const j = $('Convênios').first().json; const l = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.Convenio) ? j.data.Convenio : Array.isArray(j) ? j : [];
  for (const c of l) { const o = c.Convenio || c; if (o && o.id != null && (o.nome || o.descricao)) nomeConv[String(o.id)] = String(o.nome || o.descricao).trim(); } } catch (e) {}
const out = {}, refeitos = new Set();
meses.forEach((mes, k) => {
  if (mes < CONTROLE) return;
  const lista = resp[k]?.json?.data?.Produzido; if (!Array.isArray(lista)) return;   // mês sem resposta: fica como estava
  refeitos.add(mes);
  for (const x of lista) {
    if (x.e_fatura_sessao) continue;
    const u = UNI(x.nome); if (!u) continue;
    const conv = String(x.convenio || nomeConv[String(x.convenio_id)] || '').trim() || 'Sem convênio no iGut';
    if (/particular/i.test(conv)) continue;
    const v = n(x.totalproduzido), g = n(x.total_glosa), lote = x.lote ? String(x.lote).trim() : '';
    const sit = x.pago === 'S' ? 'recebido' : lote ? 'a_receber' : 'a_faturar';
    const dia = String(x.data || '').slice(8, 10).replace(/^0/, '');
    const soma = (situacao, valor, glosa) => {
      const chave = [mes, u, conv, situacao, lote || '-'].join('|');
      const r = (out[chave] ||= { chave, mes, unidade: u, convenio: conv, situacao, lote: lote || '-', sessoes: 0, valor: 0, glosa: 0, dias: new Set(), atualizado_em: agora });
      r.sessoes++; r.valor += valor; r.glosa += glosa; if (dia) r.dias.add(Number(dia));
    };
    soma(sit, sit === 'a_faturar' ? v : v - g, sit === 'a_faturar' ? 0 : g);
    if (g > 0 && sit !== 'a_faturar') soma('glosado', g, g);
  }
});
const novos = Object.values(out).map((r) => ({ ...r, valor: Math.round(r.valor * 100) / 100, glosa: Math.round(r.glosa * 100) / 100, dias: [...r.dias].sort((a, b) => a - b).join(',') }));
const chaves = new Set(novos.map((r) => r.chave));
let zerados = []; try {
  zerados = $('Detalhes (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && refeitos.has(r.mes) && !chaves.has(r.chave) && (n(r.valor) || n(r.sessoes)))
    .map((r) => ({ chave: r.chave, mes: r.mes, unidade: r.unidade, convenio: r.convenio, situacao: r.situacao, lote: r.lote, sessoes: 0, valor: 0, glosa: 0, dias: '', atualizado_em: agora }));
} catch (e) {}
return [...novos, ...zerados].map((json) => ({ json }));
