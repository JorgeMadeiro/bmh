// Página do painel da diretoria da BMH (09/10/2026). Lê as tabelas gravadas toda noite (BMH_financeiro_mes e
// BMH_operacao_dia) e devolve um HTML pensado para o celular (o link vai no WhatsApp). Só totais, nenhum dado de
// paciente. Cores e letra do guia da BMH (identidade/design-guide.md).
const linhas = (no) => { try { return $(no).all().map((i) => i.json).filter((r) => r && r.chave); } catch (e) { return []; } };
const fin = linhas('Financeiro (tabela)'), op = linhas('Operação (tabela)'), det = linhas('Detalhes (tabela)'), prz = linhas('Prazo (tabela)');
const hoje = $now.setZone('America/Sao_Paulo');
// financeiro compacto: [mes, unidade, convênio, sessões, produzido, faturado, a faturar, recebido, a receber, glosado]
const F = fin.map((r) => [r.mes, r.unidade, r.convenio, +r.sessoes || 0, +r.produzido || 0, +r.faturado || 0, +r.a_faturar || 0, +r.recebido || 0, +r.a_receber || 0, +r.glosado || 0]);
// operação por mês e unidade: [mes, unidade, agendadas, atendidas, faltas, cobradas, lugares, avaliações agendadas, feitas, dias]
const opM = {};
for (const r of op) {
  if (r.dia >= hoje.toISODate()) continue;   // hoje ainda não fechou
  const k = r.dia.slice(0, 7) + '|' + r.unidade;
  const a = (opM[k] ||= [r.dia.slice(0, 7), r.unidade, 0, 0, 0, 0, 0, 0, 0, new Set()]);
  a[2] += +r.agendadas || 0; a[3] += +r.atendidas || 0; a[4] += +r.faltas || 0; a[5] += +r.cobradas || 0; a[6] += +r.lugares || 0; a[7] += +r.avaliacoes_agendadas || 0; a[8] += +r.avaliacoes_feitas || 0; a[9].add(r.dia);
}
const O = Object.values(opM).map((a) => [...a.slice(0, 9), a[9].size]);
// operação por mês, unidade e convênio (20/10/2026, filtro de convênio na Operação):
// [mes, unidade, convênio, agendadas, atendidas, faltas, cobradas, avaliações agendadas, feitas]. Lugares e dias ficam no O
const opc = linhas('Operação por convênio (tabela)'), ocM = {};
for (const r of opc) {
  if (r.dia >= hoje.toISODate()) continue;
  const k = r.dia.slice(0, 7) + '|' + r.unidade + '|' + r.convenio;
  const a = (ocM[k] ||= [r.dia.slice(0, 7), r.unidade, r.convenio, 0, 0, 0, 0, 0, 0]);
  a[3] += +r.agendadas || 0; a[4] += +r.atendidas || 0; a[5] += +r.faltas || 0; a[6] += +r.cobradas || 0; a[7] += +r.avaliacoes_agendadas || 0; a[8] += +r.avaliacoes_feitas || 0;
}
const OC = Object.values(ocM).filter((a) => a[3] || a[7]);
// operação por mês e câmara (22/10/2026, multiplace × monoplace ao tocar no mês):
// [mes, unidade, câmara, agendadas, atendidas, faltas, cobradas, lugares, dias com atendimento]
const opk = linhas('Operação por câmara (tabela)'), okM = {};
for (const r of opk) {
  if (r.dia >= hoje.toISODate()) continue;
  const k = r.dia.slice(0, 7) + '|' + r.unidade + '|' + r.camara;
  const a = (okM[k] ||= [r.dia.slice(0, 7), r.unidade, r.camara, 0, 0, 0, 0, 0, 0]);
  a[3] += +r.agendadas || 0; a[4] += +r.atendidas || 0; a[5] += +r.faltas || 0; a[6] += +r.cobradas || 0; a[7] += +r.lugares || 0; if (+r.atendidas) a[8]++;
}
const OK = Object.values(okM).filter((a) => a[3]);
// e por câmara e convênio (22/10/2026, a seta também com convênio no filtro): [mes, unidade, câmara, convênio, agendadas, atendidas, faltas, cobradas]
const opkc = linhas('Operação por câmara e convênio (tabela)'), kcM = {};
for (const r of opkc) {
  if (r.dia >= hoje.toISODate()) continue;
  const k = r.dia.slice(0, 7) + '|' + r.unidade + '|' + r.camara + '|' + r.convenio;
  const a = (kcM[k] ||= [r.dia.slice(0, 7), r.unidade, r.camara, r.convenio, 0, 0, 0, 0]);
  a[4] += +r.agendadas || 0; a[5] += +r.atendidas || 0; a[6] += +r.faltas || 0; a[7] += +r.cobradas || 0;
}
const KC = Object.values(kcM).filter((a) => a[4]);
const atualizado = [...fin, ...op].map((r) => r.atualizado_em || '').sort().pop() || '';
// detalhe por lote (só valor > 0): [mes, unidade, convênio, situação, lote, sessões, valor, dias]
const X = det.filter((r) => +r.valor > 0.5).map((r) => [r.mes, r.unidade, r.convenio, r.situacao, r.lote, +r.sessoes || 0, Math.round(+r.valor), r.dias || '']);
// prazo de recebimento: [mes, unidade, convênio, valor pago, dias × valor]
const PZ = prz.filter((r) => +r.valor_pago > 0).map((r) => [r.mes, r.unidade, r.convenio, Math.round(+r.valor_pago), +r.dias_x_valor || 0]);
// atOp: a operação (ontem e hoje) é a última parte gravada na carga (o financeiro sai em ~1 min; os pacientes por lote, desde
// 20/10/2026, só gravam o que mudou): o botão Atualizar só diz "pronto" quando ela for mais nova que o pedido (medido em 20/10/2026)
// a carga grava a operação em duas tabelas (total e por convênio): "pronto" só quando as duas forem novas
const ult = (t) => t.map((r) => r.atualizado_em || '').sort().pop() || '';
const atOp = [ult(op), ult(opc), ult(opk), ult(opkc)].filter(Boolean).sort()[0] || '';   // a mais velha das três: só "pronto" com todas novas
// etapas da carga, na ordem em que gravam: financeiro (~1 min), lotes, prazos, pacientes (a parte longa) e operação (fim)
const ultima = (t) => t.map((r) => r.atualizado_em || '').sort().pop() || '';
const ET = { fin: ultima(fin), det: ultima(det), prazo: ultima(prz) };
// último pedido do botão, de qualquer pessoa (trava para todos, 20/10/2026)
const pedido = Number((linhas('Pedido (tabela)').find((r) => r.chave === 'ultimo') || {}).pedido) || 0;
// primeiro dia da operação gravada (09/09/2023): o mês dele é incompleto e não serve de base para variação (20/10/2026: set/24
// aparecia com +156% contra um setembro/23 de 21 dias)
const inicioOp = op.map((r) => r.dia).filter(Boolean).sort()[0] || '';
// e o de cada unidade e câmara (22/10/2026: Taguatinga começou em 27/01/2025 e jan/26 aparecia com +2.468%)
const inicioDe = (rows, k) => { const o = {}; for (const r of rows) if (+r.agendadas) { const c = k(r); if (!o[c] || r.dia < o[c]) o[c] = r.dia; } return o; };
const inicioU = inicioDe(op, (r) => r.unidade), inicioK = inicioDe(opk, (r) => r.unidade + '|' + r.camara);
const DADOS = { F, O, OC, OK, KC, X, PZ, inicioOp, inicioU, inicioK, hoje: hoje.toISODate(), atOp, ET, pedido, atualizado: atualizado ? DateTime.fromISO(atualizado).setZone('America/Sao_Paulo').toFormat("dd/LL 'às' HH:mm") : '—' };
const json = JSON.stringify(DADOS).replace(/</g, '\\u003c');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BMH · Diretoria</title><meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--marinho:#002375;--fundo-escuro:#00143F;--oxigenio:#34A9CF;--azul-texto:#1A6E93;--tinta:#142033;--sec:#4A5568;--fio:#DCE5EE;--nevoa:#EEF5FA;--bom:#1E7B4F;--ruim:#B4372E}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--tinta);font:15px/1.45 'Libre Franklin',system-ui,sans-serif}
header{background:var(--fundo-escuro);color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px}#atualizar{flex:none;min-height:40px;padding:0 14px;border:1px solid #C9D6E6;border-radius:999px;background:linear-gradient(to right,rgba(52,169,207,.6) var(--p,0%),transparent var(--p,0%));font-variant-numeric:tabular-nums;color:#fff;font:700 13px 'Libre Franklin',system-ui,sans-serif;cursor:pointer}#atualizar:disabled{cursor:default}header h1{margin:0;font-size:18px;font-weight:800}header p{margin:4px 0 0;color:#C9D6E6;font-size:13px}
main{max-width:980px;margin:0 auto;padding:0 16px 32px}
.filtros{border-bottom:1px solid var(--fio);padding:10px 0;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.seg{display:flex;border:1px solid var(--fio);border-radius:999px;overflow:hidden}.seg button{border:0;background:#fff;color:var(--tinta);font:600 13px 'Libre Franklin',sans-serif;padding:7px 10px;min-height:36px}
.seg button.on{background:var(--marinho);color:#fff}select{font:600 13px 'Libre Franklin',sans-serif;border:1px solid var(--fio);border-radius:999px;padding:7px 10px;min-height:36px;background:#fff;color:var(--tinta);max-width:100%}#conv{flex:1;min-width:0}
h2{font-size:16px;font-weight:800;margin:20px 0 2px}h2+p.s{margin:0 0 10px;color:var(--sec);font-size:13px}
.d{font-size:12px;font-weight:700}.d.up{color:var(--bom)}.d.down{color:var(--ruim)}
.tab{overflow-x:auto;border:1px solid var(--fio);border-radius:6px}table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--fio)}th{background:var(--nevoa);font-weight:700;font-size:12px}
th:first-child,td:first-child{text-align:left;position:sticky;left:0;background:#fff}th:first-child{background:var(--nevoa)}tr.tot td{font-weight:800;background:var(--nevoa)}td.abre{cursor:pointer;color:var(--azul-texto);font-weight:700}td.abre::before{content:'▸ ';font-size:11px}td.abre.aberto::before{content:'▾ '}tr.sub td{background:#F5F8FB;font-size:12px;color:var(--sec)}tr.sub td:first-child{padding-left:22px;background:#F5F8FB}
.periodo{display:flex;gap:4px;align-items:center;font-size:13px;color:var(--sec)}.periodo select{padding:7px 8px}
.check{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600;min-height:36px}.check input{width:18px;height:18px;accent-color:var(--marinho)}
.lista{margin:0;padding:0;list-style:none;border:1px solid var(--fio);border-radius:6px}.lista li{display:flex;justify-content:space-between;gap:12px;padding:9px 12px;border-bottom:1px solid var(--fio)}.lista li:last-child{border:0}
.lista li span:last-child{font-weight:700;white-space:nowrap}.vazio{color:var(--sec);font-size:13px;padding:10px 12px}
.cl{color:var(--azul-texto);font-weight:700;cursor:pointer}.lista li.cl{cursor:pointer}
#det{position:fixed;inset:0;background:rgba(0,20,63,.45);display:none;z-index:9}#det.on{display:block}
#det .caixa{position:absolute;inset:auto 0 0 0;max-height:88vh;overflow:auto;background:#fff;border-radius:12px 12px 0 0;padding:14px 16px 24px}@media(min-width:720px){#det .caixa{inset:6vh auto auto 50%;transform:translateX(-50%);width:600px;border-radius:8px}}
#det h3{margin:0;font-size:17px;font-weight:800;padding-right:44px}#det .sub{color:var(--sec);font-size:13px;margin:2px 0 10px}#det .fechar{position:absolute;top:8px;right:10px;border:0;background:var(--nevoa);border-radius:999px;width:36px;height:36px;font-size:20px;cursor:pointer}
#det .conv{display:flex;justify-content:space-between;font-weight:800;margin:14px 0 4px;padding-top:10px;border-top:1px solid var(--fio)}#det .lin{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:5px 0}#det .lin span:first-child{color:var(--sec)}#det .lin span:last-child{font-weight:700;white-space:nowrap}
footer{color:var(--sec);font-size:12px;margin-top:24px;border-top:1px solid var(--fio);padding-top:12px}
</style></head><body>
<header><div><h1>BMH · Diretoria</h1><p id="atu"></p></div><button id="atualizar" type="button">Atualizar agora</button></header>
<main>
<div class="filtros"><div class="seg" id="uni"><button data-u="" class="on">Todas</button><button data-u="Asa Sul">Asa Sul</button><button data-u="Taguatinga">Taguatinga</button></div><select id="conv"></select><div class="periodo">De <select id="de"></select> até <select id="ate"></select></div></div>
<h2>Financeiro da produção</h2><p class="s">R$ mil · * mês em andamento · toque num valor em azul para ver por lote</p><div class="tab"><table id="tFin"></table></div>
<h2>A receber há mais de 90 dias</h2><ul class="lista" id="l90"></ul>
<h2>A faturar atrasado</h2><ul class="lista" id="lFat"></ul>
<h2>Prazo de recebimento</h2><p class="s">Dias, em média, da sessão até o convênio pagar (no período)</p><ul class="lista" id="lPrazo"></ul>
<h2>Operação</h2><p class="s" id="sOp">* mês em andamento, até ontem · Var. ano: sessões contra o mesmo mês do ano anterior · Var. mês: contra o mês anterior · Dias: dias com atendimento</p><div class="tab"><table id="tOp"></table></div>
<div id="det"><div class="caixa"><button class="fechar" aria-label="Fechar">×</button><h3 id="dTit"></h3><p class="sub" id="dSub"></p><div id="dCorpo"></div></div></div>
<footer>Números do iGut, gravados toda noite. Produzido = faturado + a faturar; faturado = recebido + a receber + glosado; % recebido sem a glosa. Particular conta como recebido (cartão, D+1). Prazo: média ponderada pelo valor, só do que já foi pago (o que segue em aberto não entra). A receber: convênio não pagou ou falta baixa no iGut. Falta = faltou, desmarcou ou desistiu. "—": ainda não registrado no iGut (lote, pagamento e faltas desde nov/2024; avaliações desde mar/2024).</footer>
</main>
<script>
const D = ${json};
// O iGut da BMH só registra lote e pagamento de forma completa desde nov/2024 (antes, quase tudo aparece "a faturar"
// ou "a receber" sem ser verdade); faltas também desde nov/2024; avaliações desde mar/2024. Antes disso: "—".
const CONTROLE = '2024-11', AVALIACOES = '2024-03';
const MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const nomeMes = m => MES[+m.slice(5,7)-1] + '/' + m.slice(2,4), mesLongo = m => ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][+m.slice(5,7)-1] + ' de ' + m.slice(0,4);
const mil = v => { const x = v/1000; return Math.abs(x) < 0.5 ? (v ? '<1' : '—') : Math.round(x).toLocaleString('pt-BR'); };
const brl = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');   // valor exato, sem "mil" (Jorge, 20/10/2026); a tabela do financeiro segue em R$ mil
const pct = (a, b) => b ? Math.round(100*a/b) + '%' : '—';
const el = (t, txt, cls) => { const e = document.createElement(t); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; };
let U = '', C = '', DE = '', ATE = '', PEND = false;
const noPeriodo = m => (!DE || m >= DE) && (!ATE || m <= ATE);
document.getElementById('atu').textContent = 'Atualizado em ' + D.atualizado;
// botão "Atualizar agora" (Jorge, 20/10/2026): abre ?atualizar=1 no próprio painel (navegação sempre leva o login; consulta
// pela página nem sempre), o n8n pede a carga completa (13 meses + ontem e hoje, uns 2,5 min) e volta com ?pedido=<hora do
// servidor>. Enquanto a operação gravada (última parte da carga) for mais velha que o pedido, recarrega a cada 20 s;
// cada recarga já mostra o que chegou (o financeiro chega em ~1 min).
(() => {
  const b = document.getElementById('atualizar'), atu = document.getElementById('atu');
  b.onclick = () => { b.disabled = true; b.textContent = 'Pedindo…'; location.href = location.pathname + '?atualizar=1'; };
  // trava para todos: a carga pedida por qualquer pessoa há menos de 15 min, cuja última etapa ainda não gravou, aparece
  // em andamento para quem abrir o painel (e o n8n também recusa um segundo pedido nesse intervalo)
  const daUrl = +new URLSearchParams(location.search).get('pedido') || 0;
  const andando = D.pedido && !(Date.parse(D.atOp) >= D.pedido) && Date.now() - D.pedido < 15 * 60000;
  const pedido = andando ? D.pedido : daUrl; if (!pedido) return;
  if (andando && daUrl !== pedido) history.replaceState(null, '', location.pathname + '?pedido=' + pedido);   // para mostrar o "pronto" no fim
  const limpa = () => history.replaceState(null, '', location.pathname);
  if (Date.parse(D.atOp) >= pedido) { limpa(); atu.textContent = 'Atualizado em ' + D.atualizado + ' · pronto'; return; }
  if (Date.now() - pedido > 15 * 60000) { limpa(); atu.textContent = 'A atualização não terminou a tempo. Atualizado em ' + D.atualizado; return; }
  // andamento no próprio botão, travado até o fim (pedido do Jorge, 20/10/2026): o tempo passado contra os ~2,5 min medidos (20/10/2026: financeiro 55 s, lotes 2 min, prazos e o resto 2,5 min),
  // nunca abaixo da etapa que já gravou e nunca 100% antes do fim (o 100% é o "pronto")
  const feito = k => Date.parse(D.ET[k]) >= pedido, piso = feito('prazo') ? 90 : feito('det') ? 80 : feito('fin') ? 35 : 0;
  const pinta = () => { const p = Math.max(piso, Math.min(95, Math.round((Date.now() - pedido) / 1500))); b.style.setProperty('--p', p + '%'); b.textContent = 'Atualizando ' + p + '%'; };
  b.disabled = true; pinta(); setInterval(pinta, 1000);
  atu.textContent = feito('fin') ? 'Financeiro já atualizado; faltam lotes, pacientes e sessões. Pode fechar a página.' : 'Buscando no iGut (uns 2 a 3 minutos). Pode fechar a página.';
  setTimeout(() => location.reload(), 20000);
})();
const convs = [...new Set(D.F.map(r => r[2]))].sort((a, b) => a === 'PARTICULAR' ? -1 : b === 'PARTICULAR' ? 1 : a.localeCompare(b, 'pt-BR'));
const sel = document.getElementById('conv'); sel.append(new Option('Todos os convênios', '')); convs.forEach(c => sel.append(new Option(c, c)));
const mesAtual = D.hoje.slice(0,7), d0 = new Date(D.hoje + 'T12:00:00'); const anterior = m => { const [a, b] = m.split('-').map(Number); return b === 1 ? (a-1) + '-12' : a + '-' + String(b-1).padStart(2, '0'); };
const mesFechado = anterior(mesAtual);
const fin = m => { const r = { s:0,p:0,f:0,af:0,r:0,ar:0,g:0 }; for (const x of D.F) { if (x[0] !== m || (U && x[1] !== U) || (C && x[2] !== C)) continue; r.s+=x[3]; r.p+=x[4]; r.f+=x[5]; r.af+=x[6]; r.r+=x[7]; r.ar+=x[8]; r.g+=x[9]; } return r; };
const opr = m => { const r = { ag:0,at:0,fa:0,co:0,lu:0,aa:0,af:0,dias:0 }; for (const x of D.O) { if (x[0] !== m || (U && x[1] !== U)) continue; r.ag+=x[2]; r.at+=x[3]; r.fa+=x[4]; r.co+=x[5]; r.lu+=x[6]; r.aa+=x[7]; r.af+=x[8]; r.dias=Math.max(r.dias, x[9]); } return r; };
const SIT_COL = [null, null, null, 'a_faturar', 'recebido', null, 'a_receber', 'glosado'];
const SIT_LISTA = { l90: 'a_receber', lFat: 'a_faturar' };
const NOME_SIT = { a_faturar: 'A faturar', recebido: 'Recebido', a_receber: 'A receber', glosado: 'Glosado' };
let corteMesG = '';
const celula = (v, sit, meses, rot) => { const td = el('td', v); if (sit && v !== '—' && v !== '<1' || (sit && v === '<1')) { td.className = 'cl'; td.onclick = () => abre(sit, meses, '', rot); } return td; };
// dias "3,4,5,9" do mês 2025-09 → "03/09/25 a 05/09/25, 09/09/25" (data completa: pedido do Jorge, 20/10/2026)
const datas = (s, mes) => { const fim = '/' + String(mes).slice(5, 7) + '/' + String(mes).slice(2, 4), dd = n => String(n).padStart(2, '0') + fim; const d = [...new Set(String(s || '').split(',').map(Number).filter(Boolean))].sort((a, b) => a - b); const o = []; for (let i = 0; i < d.length; i++) { let j = i; while (j + 1 < d.length && d[j + 1] === d[j] + 1) j++; o.push(j > i + 1 ? dd(d[i]) + ' a ' + dd(d[j]) : j === i + 1 ? dd(d[i]) + ', ' + dd(d[j]) : dd(d[i])); i = j; } return o.join(', '); };
let ultimo = null;
function abre(sit, meses, conv, rot) {
  ultimo = [sit, meses, conv, rot];
  const ms = new Set(meses), alvoConv = conv || C;
  // o particular não tem lote: entra no "recebido" como uma linha por mês e unidade (cartão, D+1)
  const part = sit !== 'recebido' ? [] : D.F.filter(x => x[2] === 'PARTICULAR' && x[7] > 0.5 && x[0] >= CONTROLE)   // antes de nov/2024 não há lista de pacientes (nem entra no total)
    .map(x => [x[0], x[1], 'PARTICULAR (cartão)', 'recebido', '-', x[3], Math.round(x[7]), '']);
  const linhas = [...D.X, ...part].filter(x => x[3] === sit && ms.has(x[0]) && (!U || x[1] === U) && (!alvoConv || x[2] === alvoConv || (alvoConv === 'PARTICULAR' && x[2] === 'PARTICULAR (cartão)')));
  const porConv = {}; for (const x of linhas) (porConv[x[2]] ||= []).push(x);
  const total = linhas.reduce((s, x) => s + x[6], 0), sessoes = linhas.reduce((s, x) => s + x[5], 0);
  document.getElementById('dTit').textContent = NOME_SIT[sit] + ' · ' + (conv || rot);
  document.getElementById('dSub').textContent = [U || 'As duas unidades', conv || C || 'todos os convênios', brl(total) + ' em ' + sessoes.toLocaleString('pt-BR') + ' sessões'].join(' · ');
  const corpo = document.getElementById('dCorpo'); corpo.replaceChildren();
  if (!linhas.length) corpo.append(el('p', 'Nada nessa situação.', 'sub'));
  Object.entries(porConv).sort((a, b) => b[1].reduce((s, x) => s + x[6], 0) - a[1].reduce((s, x) => s + x[6], 0)).forEach(([c, xs]) => {
    const h = el('div', null, 'conv'); h.append(el('span', c), el('span', brl(xs.reduce((s, x) => s + x[6], 0)))); corpo.append(h);
    xs.sort((a, b) => a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : b[6] - a[6]).forEach(x => {
      const l = el('div', null, 'lin');
      const desc = (x[4] !== '-' ? 'Lote ' + x[4] + ' · ' : '') + nomeMes(x[0]) + ' · ' + x[1] + ' · ' + x[5] + (x[5] === 1 ? ' sessão' : ' sessões') + (x[7] ? ' · ' + datas(x[7], x[0]) : '');
      const esq = el('span', desc);
      {   // 3º nível: pacientes do lote (ou do particular do mês), na própria janela, lidos da tabela gravada
        const a = el('span', ' · pacientes ›', 'cl'); a.onclick = () => pacientes({ mes: x[0], unidade: x[1], convenio: /^PARTICULAR/.test(x[2]) ? 'PARTICULAR' : x[2], situacao: x[3], lote: x[4] }); esq.append(a);
      }
      l.append(esq, el('span', 'R$ ' + x[6].toLocaleString('pt-BR'))); corpo.append(l);
    });
  });
  document.getElementById('det').classList.add('on'); document.body.style.overflow = 'hidden';
}
// ---- 3º nível: pacientes do lote, dentro da janela. Mesmo login do painel (só a diretoria acessa); consulta na hora.
function pacientes(par) {
  const corpo = document.getElementById('dCorpo'); corpo.replaceChildren();
  const volta = el('span', '‹ voltar', 'cl'); volta.onclick = () => abre(...ultimo); corpo.append(volta);
  document.getElementById('dTit').textContent = 'Pacientes'; document.getElementById('dSub').textContent = 'Consultando o iGut agora…';
  // falha momentânea (rede, servidor ocupado): tenta de novo sozinho 2 vezes; persistindo, vai pela segunda via (22/10/2026)
  const tenta = n => fetch('bmh-diretoria?' + new URLSearchParams({ ...par, formato: 'json' }), { cache: 'no-store', credentials: 'same-origin' })   // mesmo endereço do painel: reaproveita o login
    .then(r => { if (r.status === 401) throw new Error('login'); if (!r.ok) throw new Error('erro ' + r.status); return r.json(); })
    .catch(e => { if (e.message === 'login' || n >= 2) throw e; return new Promise(ok => setTimeout(ok, 1500 * (n + 1))).then(() => tenta(n + 1)); });
  tenta(0)
    .then(d => {
      document.getElementById('dTit').textContent = d.titulo; document.getElementById('dSub').textContent = d.sub;
      if (!d.pacientes.length) { corpo.append(el('p', 'Nenhum paciente nessa situação (pode ter mudado desde a última atualização do painel).', 'sub')); return; }
      d.pacientes.forEach(p => { const l = el('div', null, 'lin'); const e = el('span'); e.append(el('b', p.nome)); e.append(document.createElement('br'), document.createTextNode(p.sessoes + (p.sessoes === 1 ? ' sessão' : ' sessões') + ' · ' + p.dias + (p.medicos ? ' · ' + p.medicos : ''))); l.append(e, el('span', 'R$ ' + p.valor.toLocaleString('pt-BR'))); corpo.append(l); });
      corpo.append(el('p', 'Dado de paciente: não encaminhar fora da equipe responsável.', 'sub'));
    })
    .catch(e => {
      // qualquer falha (login não reenviado, erro do servidor ou da rede, mesmo depois de 3 tentativas) vai pela segunda via
      // segunda via: alguns navegadores não reenviam o login numa consulta feita pela página; carregando como página
      // (dentro da janela), o navegador sempre reaproveita o login do painel
      document.getElementById('dTit').textContent = 'Pacientes';
      // sem ser o login, mostra o motivo (para achar a causa se voltar a acontecer)
      document.getElementById('dSub').textContent = e.message === 'login' ? '' : 'Aberto pela segunda via (' + e.message + ')';
      const f = el('iframe'); f.src = 'bmh-diretoria?' + new URLSearchParams({ ...par, embutido: '1' }); f.setAttribute('allow', 'clipboard-write'); f.title = 'Pacientes do lote';
      f.style.cssText = 'width:100%;height:65vh;border:0;margin-top:8px'; corpo.append(f);
    });
}
const fecha = () => { document.getElementById('det').classList.remove('on'); document.body.style.overflow = ''; };
document.querySelector('#det .fechar').onclick = fecha; document.getElementById('det').onclick = e => { if (e.target.id === 'det') fecha(); }; document.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
function desenha() {
  // os quadros do início saíram (Jorge, 20/10/2026): o resumo de cada mês fica na tabela de Operação e no Financeiro
  // tabela do financeiro
  const tf = document.getElementById('tFin'); tf.replaceChildren();
  const cab = el('tr'); ['Mês','Produzido','Faturado','A faturar','Recebido','%','A receber','Glosado'].forEach(t => cab.append(el('th', t))); tf.append(cab);
  const meses = [...new Set(D.F.map(r => r[0]))].sort().reverse(); const tot = { p:0,pOk:0,f:0,af:0,r:0,ar:0,g:0 };
  const ult12 = new Set(meses.filter(m => noPeriodo(m)));   // total = todos os meses do período escolhido, com o mês em andamento (Jorge, 20/10/2026)
  const linhasMes = [];
  for (const m of meses) { const r = fin(m); if (!r.p || !noPeriodo(m)) continue;
    const tr = el('tr');
    const ok = m >= CONTROLE; [nomeMes(m) + (m === mesAtual ? '*' : ''), mil(r.p), ok ? mil(r.f) : '—', ok ? mil(r.af) : '—', ok ? mil(r.r) : '—', ok ? pct(r.r, r.p - r.g) : '—', ok ? mil(r.ar) : '—', ok ? mil(r.g) : '—'].forEach((v, i) => tr.append(celula(v, ok ? SIT_COL[i] : null, [m], nomeMes(m)))); linhasMes.push(tr);
    // antes de nov/2024 (CONTROLE) só o produzido aparece; o resto mostra "—" e não pode entrar no total (corrigido em
    // 20/10/2026: o período set/24 a set/25 somava R$ 240 mil de "a receber" de set e out/24 que a tela não mostrava)
    if (ult12.has(m)) { tot.p+=r.p; if (ok) { tot.pOk+=r.p; tot.f+=r.f; tot.af+=r.af; tot.r+=r.r; tot.ar+=r.ar; tot.g+=r.g; } } }
  const mesesPer = [...ult12]; const tt = el('tr', null, 'tot'); ['Período', mil(tot.p), mil(tot.f), mil(tot.af), mil(tot.r), pct(tot.r, tot.pOk - tot.g), mil(tot.ar), mil(tot.g)].forEach((v, i) => tt.append(celula(v, SIT_COL[i], mesesPer, 'período'))); tf.append(tt, ...linhasMes);
  // atenção: a receber há mais de 90 dias e a faturar atrasado, por convênio
  const corte = new Date(d0); corte.setDate(corte.getDate() - 90); const corteMes = corte.toISOString().slice(0, 7); corteMesG = corteMes;
  const soma = (filtro, idx, minimo = 1) => { const m = {}; for (const x of D.F) { if ((U && x[1] !== U) || (C && x[2] !== C) || !noPeriodo(x[0]) || !filtro(x[0]) || !x[idx]) continue; m[x[2]] = (m[x[2]] || 0) + x[idx]; } return Object.entries(m).filter(([, v]) => v >= minimo).sort((a, b) => b[1] - a[1]); };
  const lista = (id, itens, vazio) => { const ul = document.getElementById(id); ul.replaceChildren(); if (!itens.length) { ul.append(el('li', vazio, 'vazio')); return; }
    itens.forEach(([c, v]) => { const li = el('li', null, 'cl'); li.append(el('span', c), el('span', brl(v))); li.onclick = () => abre(SIT_LISTA[id], [...new Set(D.F.map(r => r[0]))].filter(m => m >= CONTROLE && noPeriodo(m) && (id === 'l90' ? m < corteMesG : m < mesFechado)), c, id === 'l90' ? 'há mais de 90 dias' : 'atrasado'); ul.append(li); });
    if (itens.length > 1) { const t = itens.reduce((s, [, v]) => s + v, 0); const li = el('li'); li.append(el('span', 'Total'), el('span', brl(t))); ul.append(li); } };
  lista('l90', soma(m => m >= CONTROLE && m < corteMes, 8), 'Nada a receber há mais de 90 dias.');
  // as duas listas sem o corte de R$ 500 e com todos os convênios (Jorge, 20/10/2026): R$ 1 só para não listar centavos
  lista('lFat', soma(m => m >= CONTROLE && m < mesFechado, 6), 'Nada atrasado para faturar.');
  // prazo de recebimento por convênio (média ponderada pelo valor pago)
  const pz = {}; let tv = 0, td = 0;
  for (const x of D.PZ) { if ((U && x[1] !== U) || (C && x[2] !== C) || !noPeriodo(x[0])) continue; const a = (pz[x[2]] ||= [0, 0]); a[0] += x[3]; a[1] += x[4]; tv += x[3]; td += x[4]; }
  const ulp = document.getElementById('lPrazo'); ulp.replaceChildren();
  // todos os convênios com pagamento no período (20/10/2026: antes só os 10 primeiros, com R$ 1.000 pagos ou mais)
  const itp = Object.entries(pz).filter(([, a]) => a[0] >= 1).sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0]);
  if (!itp.length) ulp.append(el('li', 'Sem pagamento de convênio no período.', 'vazio'));
  itp.forEach(([c, a]) => { const li = el('li'); li.append(el('span', c), el('span', Math.round(a[1] / a[0]) + ' dias')); ulp.append(li); });
  if (tv) { const li = el('li'); li.append(el('span', 'Média geral'), el('span', Math.round(td / tv) + ' dias')); ulp.append(li); }
  // operação
  const to = document.getElementById('tOp'); to.replaceChildren();
  // detalhe que antes ficava nos quadros do início (20/10/2026): variação contra o ano e o mês anteriores (só mês fechado: mês
  // parcial contra mês cheio seria alarme falso), dias com atendimento, sessões por dia (essa compara o mês parcial) e faltas cobradas
  // Var. ano (pedido do Jorge, 20/10/2026): o mesmo mês do ano anterior, porque a BMH tem sazonalidade; a do mês fica ao lado
  // mês de início que não começa no dia 1 é incompleto: não compara nem serve de base (da clínica, da unidade ou da câmara)
  const incompleto = d => d && !d.endsWith('-01') ? d.slice(0, 7) : '';
  const inicio = U ? (D.inicioU[U] || '') : D.inicioOp, mesIncompleto = incompleto(inicio);
  const varia = (a, b, m, base, inc = mesIncompleto) => { if (m >= mesAtual || !b || base === inc || m === inc) return el('td', '—'); const v = Math.round(100 * (a - b) / b); return el('td', (v > 0 ? '+' : '') + v + '%', v > 0 ? 'd up' : v < 0 ? 'd down' : ''); };
  const anoAntes = m => (+m.slice(0, 4) - 1) + m.slice(4);
  // com convênio no filtro (20/10/2026): sessões, faltas, cobradas e avaliações só dele; dias e lugares são da clínica, e a
  // ocupação vira "quanto da ocupação veio desse convênio" (sessões dele ÷ lugares da clínica)
  const opx = m => { if (!C) return opr(m); const b = opr(m), r = { ag:0,at:0,fa:0,co:0,aa:0,af:0, lu: b.lu, dias: b.dias };
    for (const x of D.OC) { if (x[0] !== m || x[2] !== C || (U && x[1] !== U)) continue; r.ag+=x[3]; r.at+=x[4]; r.fa+=x[5]; r.co+=x[6]; r.aa+=x[7]; r.af+=x[8]; } return r; };
  document.getElementById('sOp').textContent = '* mês em andamento, até ontem · Var. ano: sessões contra o mesmo mês do ano anterior · Var. mês: contra o mês anterior · Dias: dias com atendimento'
    + (C ? ' · ' + C + ': sessões, faltas, cobradas e avaliações só desse convênio; Dias e Por dia contam os dias da clínica; Ocupação = parte da ocupação da clínica que veio desse convênio' : '');
  // multiplace × monoplace (22/10/2026): tocar no mês abre uma linha por câmara. Com convênio no filtro, as sessões, faltas e
  // cobradas são só dele; dias e lugares são da câmara, e a ocupação vira a parte da ocupação da câmara que veio desse convênio
  const ORDEM = ['Multiplace|Asa Sul', 'Monoplace|Asa Sul', 'Monoplace|Taguatinga'];
  // no formato de D.OK: [mes, unidade, câmara, agendadas, atendidas, faltas, cobradas, lugares, dias]
  const cams = m => (C ? D.KC.filter(x => x[0] === m && x[3] === C && (!U || x[1] === U)).map(x => { const k = D.OK.find(y => y[0] === m && y[1] === x[1] && y[2] === x[2]) || [];
      return [m, x[1], x[2], x[4], x[5], x[6], x[7], k[7] || 0, k[8] || 0]; }) : D.OK.filter(x => x[0] === m && (!U || x[1] === U)))
    .sort((a, b) => ORDEM.indexOf(a[2] + '|' + a[1]) - ORDEM.indexOf(b[2] + '|' + b[1]));
  const camDe = (m, x) => (cams(m).find(y => y[1] === x[1] && y[2] === x[2]) || [])[4] || 0;
  document.getElementById('sOp').textContent += ' · toque na seta do mês para ver multiplace e monoplace · Período: soma dos meses mostrados (Var. ano só dos meses fechados)';
  const co = el('tr'); ['Mês','Sessões','Var. ano','Var. mês','Dias','Por dia','Ocupação','Faltas','Cobradas','Avaliações'].forEach(t => co.append(el('th', t))); to.append(co);
  // linha "Período" (22/10/2026), como no financeiro: soma dos meses mostrados, com o mês em andamento. Faltas e cobradas só dos
  // meses com controle (nov/2024 em diante) e avaliações desde mar/2024, como nas linhas. Var. ano compara só os meses fechados
  // com os mesmos meses do ano anterior, e só se todos tiverem base completa; Var. mês não se aplica ao período
  const mesesOp = [...new Set(D.O.map(r => r[0]))].sort().reverse().filter(m => { const r = opx(m); return (r.ag || r.aa) && noPeriodo(m); });
  const variaPer = (atual, base, inc) => { const mf = mesesOp.filter(m => m < mesAtual); if (!mf.length || mf.some(m => m === inc || anoAntes(m) === inc || !base(anoAntes(m)))) return el('td', '—');
    const a = mf.reduce((t, m) => t + atual(m), 0), b = mf.reduce((t, m) => t + base(anoAntes(m)), 0), v = Math.round(100 * (a - b) / b); return el('td', (v > 0 ? '+' : '') + v + '%', v > 0 ? 'd up' : v < 0 ? 'd down' : ''); };
  const linhaPer = (rot, cls, l, va) => { const tr = el('tr', null, cls); const ctl = l.ctl;
    [rot, l.at.toLocaleString('pt-BR'), va, '—', String(l.dias), l.dias ? Math.round(l.at / l.dias).toLocaleString('pt-BR') : '—', pct(l.at, l.lu), ctl ? pct(l.fa, l.ag) : '—', ctl ? l.co.toLocaleString('pt-BR') : '—', l.aval ? l.af.toLocaleString('pt-BR') : '—']
      .forEach(x => tr.append(typeof x === 'string' ? el('td', x) : x)); to.append(tr); return tr; };
  if (mesesOp.length) {
    const T = { at: 0, ag: 0, fa: 0, co: 0, lu: 0, dias: 0, af: 0, ctl: false, aval: false };
    for (const m of mesesOp) { const r = opx(m); T.at += r.at; T.lu += r.lu; T.dias += r.dias; if (m >= CONTROLE) { T.ag += r.ag; T.fa += r.fa; T.co += r.co; T.ctl = true; } if (m >= AVALIACOES) { T.af += r.af; T.aval = true; } }
    const trP = linhaPer('Período', 'tot', T, variaPer(m => opx(m).at, m => opx(m).at, mesIncompleto));
    // câmaras do período: a seta abre a soma de cada câmara nos meses mostrados
    const porCam = {}; for (const m of mesesOp) for (const x of cams(m)) { const k = x[1] + '|' + x[2];
      const c = (porCam[k] ||= { x, at: 0, ag: 0, fa: 0, co: 0, lu: 0, dias: 0, ctl: false }); c.at += x[4]; c.lu += x[7]; c.dias += x[8]; if (m >= CONTROLE) { c.ag += x[3]; c.fa += x[5]; c.co += x[6]; c.ctl = true; } }
    const cps = Object.values(porCam).sort((a, b) => ORDEM.indexOf(a.x[2] + '|' + a.x[1]) - ORDEM.indexOf(b.x[2] + '|' + b.x[1]));
    if (cps.length) { const td = trP.firstChild; td.classList.add('abre'); if (abertos.has('periodo')) td.classList.add('aberto'); td.onclick = () => { abertos.has('periodo') ? abertos.delete('periodo') : abertos.add('periodo'); desenha(); };
      if (abertos.has('periodo')) for (const c of cps) { const inc = incompleto(D.inicioK[c.x[1] + '|' + c.x[2]] || '');
        linhaPer(c.x[2] + (U ? '' : ' · ' + c.x[1]), 'sub', { ...c, af: 0, aval: false }, variaPer(m => (cams(m).find(y => y[1] === c.x[1] && y[2] === c.x[2]) || [])[4] || 0, m => camDe(m, c.x), inc)); } }
  }
  for (const m of mesesOp) { const r = opx(m); const tr = el('tr');
    [nomeMes(m) + (m === mesAtual ? '*' : '') + (m === mesIncompleto ? ' (desde ' + inicio.slice(8, 10) + '/' + inicio.slice(5, 7) + ')' : ''), r.at.toLocaleString('pt-BR'), varia(r.at, opx(anoAntes(m)).at, m, anoAntes(m)), varia(r.at, opx(anterior(m)).at, m, anterior(m)), String(r.dias), r.dias ? Math.round(r.at / r.dias).toLocaleString('pt-BR') : '—', pct(r.at, r.lu), m >= CONTROLE ? pct(r.fa, r.ag) : '—', m >= CONTROLE ? r.co.toLocaleString('pt-BR') : '—', m >= AVALIACOES ? r.af.toLocaleString('pt-BR') : '—']
      .forEach(x => tr.append(typeof x === 'string' ? el('td', x) : x)); to.append(tr);
    const cs = cams(m);
    if (cs.length) { const td = tr.firstChild; td.classList.add('abre'); if (abertos.has(m)) td.classList.add('aberto'); td.onclick = () => { abertos.has(m) ? abertos.delete(m) : abertos.add(m); desenha(); }; }
    if (cs.length && abertos.has(m)) for (const x of cs) { const st = el('tr', null, 'sub'), ik = D.inicioK[x[1] + '|' + x[2]] || '', inc = incompleto(ik);
      [x[2] + (U ? '' : ' · ' + x[1]) + (m === inc ? ' (desde ' + ik.slice(8, 10) + '/' + ik.slice(5, 7) + ')' : ''), x[4].toLocaleString('pt-BR'), varia(x[4], camDe(anoAntes(m), x), m, anoAntes(m), inc), varia(x[4], camDe(anterior(m), x), m, anterior(m), inc), String(x[8]),
        x[8] ? Math.round(x[4] / x[8]).toLocaleString('pt-BR') : '—', pct(x[4], x[7]), m >= CONTROLE ? pct(x[5], x[3]) : '—', m >= CONTROLE ? x[6].toLocaleString('pt-BR') : '—', '—']
        .forEach(v => st.append(typeof v === 'string' ? el('td', v) : v)); to.append(st); } }
}
const abertos = new Set();   // meses abertos na Operação (continuam abertos ao trocar unidade ou período)
document.querySelectorAll('#uni button').forEach(b => b.onclick = () => { document.querySelectorAll('#uni button').forEach(x => x.classList.remove('on')); b.classList.add('on'); U = b.dataset.u; desenha(); });
sel.onchange = () => { C = sel.value; desenha(); };
const todosMeses = [...new Set([...D.F.map(r => r[0]), ...D.O.map(r => r[0])])].sort();
const sDe = document.getElementById('de'), sAte = document.getElementById('ate');
todosMeses.forEach(m => { sDe.append(new Option(nomeMes(m), m)); sAte.append(new Option(nomeMes(m), m)); });
// ao abrir: os 12 meses fechados mais o mês corrente
DE = todosMeses[Math.max(0, todosMeses.length - 13)] || ''; ATE = todosMeses[todosMeses.length - 1] || ''; sDe.value = DE; sAte.value = ATE;
sDe.onchange = () => { DE = sDe.value; if (ATE && DE > ATE) { ATE = DE; sAte.value = ATE; } desenha(); };
sAte.onchange = () => { ATE = sAte.value; if (DE && ATE < DE) { DE = ATE; sDe.value = DE; } desenha(); };

desenha();
</script></body></html>`;
return [{ json: { html } }];
