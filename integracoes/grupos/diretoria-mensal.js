// Produção do mês para a diretoria da BMH (09/10/2026, pedido do Jorge), no formato do e-mail mensal dele, mais faltas,
// avaliações, financeiro e comparação. Regras:
// - Sessões = agenda das câmaras (111, 112, 121) com status Finalizado, sem falta (confere com o e-mail: Asa Sul set/2026 = 1.128).
//   A agenda é lida DIA A DIA: o mês inteiro de uma vez dá 504 no iGut (era o que quebrava o relatório antigo).
// - Falta = Faltou, Desmarcado ou Desistiu (regra B); cobrada = falta com o atendimento finalizado.
// - Financeiro da PRODUÇÃO do mês (lógica de DRE, não de caixa), pelo BI do iGut, linhas de sessão (sem as de fatura):
//   produzido = total; convênio faturado = sessões de convênio já em lote; a faturar = sessões de convênio feitas e ainda
//   sem lote (só o que foi usado, não a guia inteira); particular = sessões particulares; recebido = particular (cartão
//   cai em D+1, Jorge 09/10/2026) + sessões de convênio já pagas (menos glosa). Produção dos 6 meses anteriores (pedido do
//   Jorge, "estender"): % recebido e o que falta (aguardando convênio, a faturar, glosa), com o total em aberto.
// - Comparação: tabela BMH_igut_dia (mesma regra dos dois lados).
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const n = (v) => Number(v) || 0;
const Q = $('Qual mês').first().json;
const UN = { 111: 'Asa Sul', 112: 'Asa Sul', 121: 'Taguatinga', 113: 'Asa Sul', 120: 'Taguatinga' }, CAMARA = ['111', '112', '121'];
const NAO_VEIO = ['faltou', 'desmarcado', 'desistiu'];
// ---------- agenda (dia a dia) ----------
const agenda = $('Agenda do dia').all().flatMap((i) => (Array.isArray(i.json?.data) ? i.json.data : []));
const diasComErro = $('Agenda do dia').all().filter((i) => i.json?.error).length;
const s = { 'Asa Sul': 0, Taguatinga: 0 }, f = { ag: 0, faltas: 0, cobr: 0 }, av = { 'Asa Sul': 0, Taguatinga: 0 };
const vistos = new Set();
for (const x of agenda) {
  const id = String(x.Profissional?.id), u = UN[id]; if (!u) continue;
  const k = x.Agendamento?.id; if (k && vistos.has(k)) continue; if (k) vistos.add(k);
  const falta = NAO_VEIO.includes(norm(x.Agendamento?.confirmado)), fin = norm(x.Agendamento?.status) === 'finalizado';
  if (CAMARA.includes(id)) { f.ag++; if (falta) { f.faltas++; if (fin) f.cobr++; } else if (fin) s[u]++; }
  else if (norm(x.Agendamento?.tipodeatendimento).includes('avaliac') && !falta && fin) av[u]++;
}
// ---------- financeiro da produção (BI) ----------
const bi = (node) => { try { const j = $(node).first().json; return Array.isArray(j?.data?.Produzido) ? j.data.Produzido : null; } catch (e) { return null; } };
// Situação de cada sessão de convênio pela própria linha da sessão (o iGut marca pago, lote e glosa): recebido + aguardando
// convênio + a faturar + glosa = produzido (pedido do Jorge, 09/10/2026: "se mandar só a % vão perguntar o que é o resto").
const fin = (lista) => {
  const r = { prod: 0, fat: 0, afat: 0, part: 0, convPago: 0, aguardando: 0, semFatura: 0, glosa: 0 }; if (!lista) return null;
  for (const x of lista) {
    if (x.e_fatura_sessao) continue;   // linha de fatura repete a sessão: fica fora para não contar duas vezes
    const v = n(x.totalproduzido), g = n(x.total_glosa); r.prod += v;
    if (/particular/i.test(x.convenio || '')) { r.part += v; continue; }
    if (x.lote) r.fat += v; else r.afat += v;
    r.glosa += g;
    if (x.pago === 'S') r.convPago += v - g; else if (x.lote) r.aguardando += v - g; else r.semFatura += v - g;
  }
  r.pago = r.part + r.convPago;   // particular é cartão (D+1): conta como recebido
  return r;
};
const F = fin(bi('Produção do mês'));
const anteriores = $('Meses anteriores').all().map((i, k) => {
  let j = null; try { j = $('Produção dos meses anteriores').all()[k]?.json; } catch (e) {}
  return [i.json.mes, Array.isArray(j?.data?.Produzido) ? fin(j.data.Produzido) : null];
});
// ---------- comparação (tabela do iGut) ----------
const tab = $('iGut (tabela)').all().map((i) => i.json).filter((r) => r && r.dia);
const mesTab = (m) => tab.filter((r) => r.dia.startsWith(m)).reduce((a, r) => ({ s: a.s + n(r.atendimentos), v: a.v + n(r.valor) }), { s: 0, v: 0 });
const T0 = mesTab(Q.mes), T1 = mesTab(Q.mes1), TA = mesTab(Q.mesAnoPassado);
const var_ = (a, b) => (b ? (a >= b ? '+' : '') + Math.round((100 * (a - b)) / b) + '%' : '—');
// ---------- texto ----------
const brl = (v) => 'R$ ' + Math.round(n(v)).toLocaleString('pt-BR'), int = (v) => n(v).toLocaleString('pt-BR');
const nomeMes = (m) => { const t = DateTime.fromISO(m + '-01').setLocale('pt-BR').toFormat('LLLL/yyyy'); return t.charAt(0).toUpperCase() + t.slice(1); };
const soMes = (m) => DateTime.fromISO(m + '-01').setLocale('pt-BR').toFormat('LLLL');
const totS = s['Asa Sul'] + s.Taguatinga, totA = av['Asa Sul'] + av.Taguatinga;
// mensagem BEM resumida (Jorge, 09/10/2026): o detalhe fica no painel da diretoria, com o link e o login aqui.
// __PAINEL_*__ é trocado pelo montar.js na hora de publicar (a senha mora no .env e no n8n, não neste arquivo).
const mil = (v) => (v >= 1e6 ? 'R$ ' + (v / 1e6).toFixed(2).replace('.', ',') + ' mi' : 'R$ ' + Math.round(n(v) / 1000) + ' mil');
const L = [];
L.push(`*Produção — ${nomeMes(Q.mes)}*`);
L.push(`Sessões: ${int(totS)} (Asa Sul ${int(s['Asa Sul'])} · Taguatinga ${int(s.Taguatinga)})`);
L.push(`Faltas: ${f.ag ? ((100 * f.faltas) / f.ag).toFixed(1).replace('.', ',') : '—'}% · Avaliações: ${int(totA)}`);
if (F) L.push(`Produzido: ${mil(F.prod)} · Recebido: ${mil(F.pago)}`);
else L.push('Financeiro: o iGut não respondeu (ver no painel).');
if (T0.s && T1.s) L.push(`vs ${soMes(Q.mes1)}: sessões ${var_(T0.s, T1.s)} · produzido ${var_(T0.v, T1.v)}`);
if (diasComErro) L.push(`⚠️ ${diasComErro} ${diasComErro === 1 ? 'dia da agenda não respondeu' : 'dias da agenda não responderam'}`);
L.push('', '📊 Painel: __PAINEL_URL__', 'Login: __PAINEL_USUARIO__ · Senha: __PAINEL_SENHA__');
return [{ json: { mensagem: L.join('\n'), previa: Q.previa } }];
