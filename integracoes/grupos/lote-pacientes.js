// Pacientes de um lote (3º nível do painel da diretoria, 09/10/2026). Mesmo painel e mesmo login da diretoria. Lê a
// tabela BMH_financeiro_paciente (gravada às 23h40, decisão do Jorge de guardar os nomes no n8n): abre na hora e serve
// de cópia se o iGut cair. Antes consultava o iGut na hora: nome de paciente não fica em tabela nem no histórico do n8n (execução com sucesso não é salva).
// Parâmetros: mes=AAAA-MM, unidade, convenio, situacao (a_faturar | a_receber | recebido | glosado), lote (ou "-").
const q = $('Painel da diretoria').first().json.query || {};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (v) => Number(v) || 0;
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const nomeMes = (m) => MES[+String(m).slice(5, 7) - 1] + '/' + String(m).slice(2, 4);
const NOME_SIT = { a_faturar: 'A faturar', a_receber: 'A receber', recebido: 'Recebido', glosado: 'Glosado' };
const faixas = (d) => { d = [...new Set(d)].sort((a, b) => a - b); const o = []; for (let i = 0; i < d.length; i++) { let j = i; while (j + 1 < d.length && d[j + 1] === d[j] + 1) j++; o.push(j > i + 1 ? d[i] + '–' + d[j] : j === i + 1 ? d[i] + ', ' + d[j] : String(d[i])); i = j; } return o.join(', '); };
const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
// lê a tabela gravada às 23h40 (BMH_financeiro_paciente): abre na hora e funciona mesmo com o iGut fora do ar
const linhasTab = $('Pacientes do lote (tabela)').all().map((i) => i.json).filter((r) => r && r.mes === q.mes && r.unidade === q.unidade && r.convenio === q.convenio && r.situacao === q.situacao && String(r.lote) === String(q.lote || '-') && n(r.valor) > 0);
const pac = {};
for (const r of linhasTab) {
  const p = (pac[r.paciente_id || r.paciente] ||= { nome: r.paciente, sessoes: 0, valor: 0, dias: [], medicos: new Set() });
  p.sessoes += n(r.sessoes); p.valor += n(r.valor); p.dias.push(...String(r.dias || '').split(',').map(Number).filter(Boolean));
  String(r.medicos || '').split(', ').filter(Boolean).forEach((m) => p.medicos.add(m));
}
const atualizado = linhasTab.map((r) => r.atualizado_em || '').sort().pop();
const ps = Object.values(pac).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
const total = ps.reduce((s, p) => s + p.valor, 0), sessoes = ps.reduce((s, p) => s + p.sessoes, 0);
const titulo = `${NOME_SIT[q.situacao] || ''} · ${q.lote && q.lote !== '-' ? 'Lote ' + q.lote + ' · ' : ''}${q.convenio === 'PARTICULAR' ? 'Particular (cartão)' : q.convenio || ''}`;
const sub = `${nomeMes(q.mes)} · ${q.unidade} · ${ps.length} ${ps.length === 1 ? 'paciente' : 'pacientes'} · ${sessoes} sessões · ${brl(total)}${atualizado ? ' · dados de ' + DateTime.fromISO(atualizado).setZone('America/Sao_Paulo').toFormat('dd/LL HH:mm') : ''}`;
// texto para copiar e mandar à equipe (WhatsApp)
const texto = [`*${titulo}*`, sub, '', ...ps.map((p) => `• ${p.nome} — ${p.sessoes} ${p.sessoes === 1 ? 'sessão' : 'sessões'} (dias ${faixas(p.dias)}/${String(q.mes).slice(5, 7)}) — ${brl(p.valor)}`)].join('\n');
const linhas = ps.map((p) => `<li><div><b>${esc(p.nome)}</b><span>${p.sessoes} ${p.sessoes === 1 ? 'sessão' : 'sessões'} · dias ${esc(faixas(p.dias))}${p.medicos.size ? ' · ' + esc([...p.medicos].join(', ')) : ''}</span></div><strong>${brl(p.valor)}</strong></li>`).join('');
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BMH · Lote</title><meta name="robots" content="noindex,nofollow">
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#142033;font:15px/1.45 'Libre Franklin',system-ui,sans-serif}header{background:#00143F;color:#fff;padding:12px 16px}header h1{margin:0;font-size:18px;font-weight:800}header p{margin:4px 0 0;color:#C9D6E6;font-size:13px}
main{max-width:720px;margin:0 auto;padding:12px 16px 32px}ul{list-style:none;margin:0;padding:0;border:1px solid #DCE5EE;border-radius:6px}li{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:1px solid #DCE5EE}li:last-child{border:0}
li b{display:block;font-weight:700}li span{font-size:13px;color:#4A5568}li strong{white-space:nowrap}button{border:0;border-radius:999px;background:#002375;color:#fff;font:700 14px 'Libre Franklin',sans-serif;min-height:44px;padding:0 18px;margin:0 0 12px}
.aviso{font-size:12px;color:#4A5568;margin-top:16px}</style></head><body>
${q.embutido ? `<main style="padding-top:0"><h1 style="font-size:17px;margin:4px 0 2px">${esc(titulo)}</h1><p style="margin:0 0 10px;color:#4A5568;font-size:13px">${esc(sub)}</p>` : `<header><h1>${esc(titulo)}</h1><p>${esc(sub)}</p></header><main>`}
${ps.length ? '<ul>' + linhas + '</ul>' : '<p>Nenhum paciente nessa situação (pode ter mudado desde a última atualização do painel).</p>'}
<p class="aviso">Dado de paciente: não encaminhar fora da equipe responsável.</p></main>
</body></html>`;
// o painel pede em JSON (?formato=json) e mostra dentro da própria janela de detalhe
const dados = { titulo, sub, texto, pacientes: ps.map((p) => ({ nome: p.nome, sessoes: p.sessoes, dias: faixas(p.dias), medicos: [...p.medicos].join(', '), valor: Math.round(p.valor) })) };
return [{ json: q.formato === 'json' ? { corpo: JSON.stringify(dados), tipo: 'application/json; charset=utf-8' } : { corpo: html, tipo: 'text/html; charset=utf-8' } }];
