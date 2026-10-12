// Financeiro da produção por mês, unidade e convênio (painel da diretoria, 09/10/2026). Fonte: BI do iGut, uma chamada
// por mês, só as linhas de sessão (a linha de fatura repete a sessão). Regra combinada com o Jorge:
//   Produzido = Faturado + A faturar;  Faturado = Recebido + A receber + Glosado.
//   Particular: faturado e recebido no ato (cartão, D+1). Convênio: pago → recebido (menos glosa); em lote e não pago →
//   a receber (menos glosa); sem lote → a faturar. Só totais: nenhum dado de paciente sai deste nó.
const n = (v) => Number(v) || 0;
const UNI = (s) => (/taguatinga/i.test(s || '') ? 'Taguatinga' : /l2 sul|asa sul/i.test(s || '') ? 'Asa Sul' : null);
const meses = $('Meses').all().map((i) => i.json.mes), resp = $('BI do mês').all(), agora = $now.toISO();
// sessão sem nome de convênio no BI (raro: 9 em 3 anos): tenta pelo código do convênio na lista do iGut
const nomeConv = {}; try { const j = $('Convênios').first().json; const l = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.Convenio) ? j.data.Convenio : Array.isArray(j) ? j : [];
  for (const c of l) { const o = c.Convenio || c; if (o && o.id != null && (o.nome || o.descricao)) nomeConv[String(o.id)] = String(o.nome || o.descricao).trim(); } } catch (e) {}
const out = {}; const falhas = [], refeitos = new Set();
meses.forEach((mes, k) => {
  const lista = resp[k]?.json?.data?.Produzido;
  if (!Array.isArray(lista)) { falhas.push(mes); return; }
  refeitos.add(mes);
  for (const x of lista) {
    if (x.e_fatura_sessao) continue;
    const u = UNI(x.nome); if (!u) continue;
    const nomeBruto = String(x.convenio || nomeConv[String(x.convenio_id)] || '').trim();
    const particular = /particular/i.test(nomeBruto), conv = particular ? 'PARTICULAR' : nomeBruto || 'Sem convênio no iGut';
    const v = n(x.totalproduzido), g = particular ? 0 : n(x.total_glosa);
    const r = (out[mes + '|' + u + '|' + conv] ||= { chave: mes + '|' + u + '|' + conv, mes, unidade: u, convenio: conv, sessoes: 0, produzido: 0, faturado: 0, a_faturar: 0, recebido: 0, a_receber: 0, glosado: 0, atualizado_em: agora });
    r.sessoes++; r.produzido += v;
    if (particular) { r.faturado += v; r.recebido += v; }
    else if (x.pago === 'S') { r.faturado += v; r.recebido += v - g; r.glosado += g; }
    else if (x.lote) { r.faturado += v; r.a_receber += v - g; r.glosado += g; }
    else r.a_faturar += v;
  }
});
if (falhas.length === meses.length) throw new Error('iGut não respondeu nenhum mês do BI');
const arred = (v) => Math.round(v * 100) / 100;
const novos = Object.values(out).map((r) => ({ ...r, produzido: arred(r.produzido), faturado: arred(r.faturado), a_faturar: arred(r.a_faturar), recebido: arred(r.recebido), a_receber: arred(r.a_receber), glosado: arred(r.glosado) }));
// convênio que existia no mês e sumiu (atendimento trocado de convênio no iGut, por exemplo) volta zerado
const chaves = new Set(novos.map((r) => r.chave)); let zerados = [];
try { zerados = $('Financeiro (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && refeitos.has(r.mes) && !chaves.has(r.chave) && n(r.produzido))
  .map((r) => ({ chave: r.chave, mes: r.mes, unidade: r.unidade, convenio: r.convenio, sessoes: 0, produzido: 0, faturado: 0, a_faturar: 0, recebido: 0, a_receber: 0, glosado: 0, atualizado_em: agora })); } catch (e) {}
return [...novos, ...zerados].map((json) => ({ json }));
