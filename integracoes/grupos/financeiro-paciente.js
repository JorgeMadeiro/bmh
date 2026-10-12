// Pacientes por lote (3º nível do painel da diretoria). Guardado no n8n por decisão do Jorge (09/10/2026: "pode guardar o
// nome dos pacientes no n8n"), para a lista abrir na hora e servir de cópia de segurança se o iGut cair. Mínimo
// necessário: nome, sessões, dias, médico solicitante e valor (sem CPF, telefone, endereço). Convênio e particular (o
// particular entra como "recebido", sem lote: cartão, D+1; pedido do Jorge, 09/10/2026), desde nov/2024.
// Mesma regra de situação do detalhe por lote (recebido, a_receber, a_faturar e glosado). Linha que deixa de existir no
// mês refeito volta zerada (o painel ignora valor zero).
const n = (v) => Number(v) || 0, CONTROLE = '2024-11';
const UNI = (s) => (/taguatinga/i.test(s || '') ? 'Taguatinga' : /l2 sul|asa sul/i.test(s || '') ? 'Asa Sul' : null);
const meses = $('Meses').all().map((i) => i.json.mes), resp = $('BI do mês').all(), agora = $now.toISO();
const nomeConv = {}; try { const j = $('Convênios').first().json; const l = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.Convenio) ? j.data.Convenio : Array.isArray(j) ? j : [];
  for (const c of l) { const o = c.Convenio || c; if (o && o.id != null && (o.nome || o.descricao)) nomeConv[String(o.id)] = String(o.nome || o.descricao).trim(); } } catch (e) {}
const out = {}, refeitos = new Set();
meses.forEach((mes, k) => {
  if (mes < CONTROLE) return;
  const lista = resp[k]?.json?.data?.Produzido; if (!Array.isArray(lista)) return;
  refeitos.add(mes);
  for (const x of lista) {
    if (x.e_fatura_sessao) continue;
    const u = UNI(x.nome); if (!u) continue;
    const convBruto = String(x.convenio || nomeConv[String(x.convenio_id)] || '').trim() || 'Sem convênio no iGut';
    const conv = /particular/i.test(convBruto) ? 'PARTICULAR' : convBruto;
    const particular = /particular/i.test(conv);
    const v = n(x.totalproduzido), g = particular ? 0 : n(x.total_glosa), lote = particular ? '-' : x.lote ? String(x.lote).trim() : '-';
    const sit = particular || x.pago === 'S' ? 'recebido' : lote !== '-' ? 'a_receber' : 'a_faturar';
    const pid = String(x.paciente_id || x.paciente || '?'), dia = Number(String(x.data || '').slice(8, 10));
    const soma = (situacao, valor) => {
      const chave = [mes, u, conv, situacao, lote, pid].join('|');
      const r = (out[chave] ||= { chave, mes, unidade: u, convenio: conv, situacao, lote, paciente_id: pid, paciente: String(x.paciente || '(sem nome)').trim(), sessoes: 0, valor: 0, dias: new Set(), medicos: new Set(), atualizado_em: agora });
      r.sessoes++; r.valor += valor; if (dia) r.dias.add(dia); if (x.profissional_solicitante) r.medicos.add(String(x.profissional_solicitante).trim());
    };
    soma(sit, sit === 'a_faturar' ? v : v - g);
    if (g > 0 && sit !== 'a_faturar') soma('glosado', g);
  }
});
const novos = Object.values(out).map((r) => ({ ...r, valor: Math.round(r.valor * 100) / 100, dias: [...r.dias].sort((a, b) => a - b).join(','), medicos: [...r.medicos].join(', ') }));
const chaves = new Set(novos.map((r) => r.chave));
let zerados = []; try {
  zerados = $('Pacientes (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && refeitos.has(r.mes) && !chaves.has(r.chave) && (n(r.valor) || n(r.sessoes)))
    .map((r) => ({ chave: r.chave, mes: r.mes, unidade: r.unidade, convenio: r.convenio, situacao: r.situacao, lote: r.lote, paciente_id: r.paciente_id, paciente: r.paciente, sessoes: 0, valor: 0, dias: '', medicos: '', atualizado_em: agora }));
} catch (e) {}
return [...novos, ...zerados].map((json) => ({ json }));
