// Particular por forma de pagamento (Jorge, 17/11/2026): a seta do mês no "Financeiro da produção" do painel da
// diretoria, com o filtro PARTICULAR. A forma vem do caixa do iGut (receitasedespesas/financeiro, campo
// lancamento_forma), o mesmo caminho da DRE da Nexo; o BI da produção não traz a forma. Cada lançamento é um pagamento
// com o valor inteiro (o crédito parcelado é um lançamento só; pagamento dividido em duas formas vira dois lançamentos).
// Recebimento de convênio não tem forma e fica fora. Só totais por mês, unidade e forma: nenhum nome sai daqui.
const meses = $('Meses').all().map((i) => i.json), caixa = $('Caixa do mês').all().map((i) => i.json), agora = $now.toISO();
// formas vistas no caixa da BMH (17/11/2026, amostra de 2024 a 2026): cartão de crédito 1x a 10x, cartão de débito, PIX,
// dinheiro, débito em conta e transferência. Forma nova vai para "Outras" (nunca some da soma). Crédito separado pelo número de
// parcelas (Jorge, 17/11/2026: a BMH parcela de 1 a 10x): "Crédito 2x" a "Crédito 10x"; acima de 10x (fora do costume) entra com o número real ("Crédito 12x"); "Crédito parcelado" só se o iGut não disser quantas
const PARC = Array.from({ length: 9 }, (_, i) => 'Crédito ' + (i + 2) + 'x');
const FORMAS = ['Crédito à vista', ...PARC, 'Crédito parcelado', 'Débito', 'Débito em conta', 'PIX', 'Transferência', 'Dinheiro', 'Outras'];
const forma = (f) => { f = String(f || '').trim(); if (!f) return null; if (/cr[eé]dito\s*1x/i.test(f)) return 'Crédito à vista'; if (/cr[eé]dito/i.test(f)) { const p = Number((f.match(/(\d+)\s*x/i) || [])[1]); return p === 1 ? 'Crédito à vista' : p > 1 ? 'Crédito ' + p + 'x' : 'Crédito parcelado'; }
  if (/em conta/i.test(f)) return 'Débito em conta'; if (/d[eé]bito/i.test(f)) return 'Débito'; if (/pix/i.test(f)) return 'PIX'; if (/transfer/i.test(f)) return 'Transferência';
  if (/dinheiro/i.test(f)) return 'Dinheiro'; return 'Outras'; };
const UNI = (s) => (/taguatinga/i.test(s || '') ? 'Taguatinga' : /l2 sul|asa sul/i.test(s || '') ? 'Asa Sul' : null);
const out = [];
meses.forEach((M, i) => {
  const L = caixa[i]?.data?.Lancamento;
  if (!Array.isArray(L)) return;   // iGut falhou neste mês: não grava (não zera o que já estava certo)
  const t = {};
  for (const u of ['Asa Sul', 'Taguatinga']) for (const f of FORMAS) t[u + '|' + f] = { valor: 0, pagamentos: 0 };   // zera as que sumiram
  for (const l of L) {
    if (!/^receita/i.test(String(l.lancamento_tipo || '')) || l.categoria_nome) continue;   // só recebimento de paciente
    const f = forma(l.lancamento_forma), u = UNI(l.unidade_nome); if (!f || !u) continue;
    const v = Number(String(l.valor ?? 0).replace(',', '.')) || 0; if (v <= 0) continue;
    const a = (t[u + '|' + f] ||= { valor: 0, pagamentos: 0 }); a.valor += v; a.pagamentos++;
  }
  for (const [k, a] of Object.entries(t)) { const [u, f] = k.split('|');
    out.push({ chave: M.mes + '|' + u + '|' + f, mes: M.mes, unidade: u, forma: f, valor: Math.round(a.valor * 100) / 100, pagamentos: a.pagamentos, atualizado_em: agora }); }
});
return out.map((json) => ({ json }));
