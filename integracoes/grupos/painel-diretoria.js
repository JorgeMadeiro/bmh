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
const atualizado = [...fin, ...op].map((r) => r.atualizado_em || '').sort().pop() || '';
// detalhe por lote (só valor > 0): [mes, unidade, convênio, situação, lote, sessões, valor, dias]
const X = det.filter((r) => +r.valor > 0.5).map((r) => [r.mes, r.unidade, r.convenio, r.situacao, r.lote, +r.sessoes || 0, Math.round(+r.valor), r.dias || '']);
// prazo de recebimento: [mes, unidade, convênio, valor pago, dias × valor]
const PZ = prz.filter((r) => +r.valor_pago > 0).map((r) => [r.mes, r.unidade, r.convenio, Math.round(+r.valor_pago), +r.dias_x_valor || 0]);
const DADOS = { F, O, X, PZ, hoje: hoje.toISODate(), atualizado: atualizado ? DateTime.fromISO(atualizado).setZone('America/Sao_Paulo').toFormat("dd/LL 'às' HH:mm") : '—' };
const json = JSON.stringify(DADOS).replace(/</g, '\\u003c');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BMH · Diretoria</title><meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--marinho:#002375;--fundo-escuro:#00143F;--oxigenio:#34A9CF;--azul-texto:#1A6E93;--tinta:#142033;--sec:#4A5568;--fio:#DCE5EE;--nevoa:#EEF5FA;--bom:#1E7B4F;--ruim:#B4372E}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--tinta);font:15px/1.45 'Libre Franklin',system-ui,sans-serif}
header{background:var(--fundo-escuro);color:#fff;padding:12px 16px}header h1{margin:0;font-size:18px;font-weight:800}header p{margin:4px 0 0;color:#C9D6E6;font-size:13px}
main{max-width:980px;margin:0 auto;padding:0 16px 32px}
.filtros{border-bottom:1px solid var(--fio);padding:10px 0;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.seg{display:flex;border:1px solid var(--fio);border-radius:999px;overflow:hidden}.seg button{border:0;background:#fff;color:var(--tinta);font:600 13px 'Libre Franklin',sans-serif;padding:7px 10px;min-height:36px}
.seg button.on{background:var(--marinho);color:#fff}select{font:600 13px 'Libre Franklin',sans-serif;border:1px solid var(--fio);border-radius:999px;padding:7px 10px;min-height:36px;background:#fff;color:var(--tinta);max-width:100%}#conv{flex:1;min-width:0}
h2{font-size:16px;font-weight:800;margin:20px 0 2px}h2+p.s{margin:0 0 10px;color:var(--sec);font-size:13px}
.d{font-size:12px;font-weight:700}.d.up{color:var(--bom)}.d.down{color:var(--ruim)}
.tab{overflow-x:auto;border:1px solid var(--fio);border-radius:6px}table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--fio)}th{background:var(--nevoa);font-weight:700;font-size:12px}
th:first-child,td:first-child{text-align:left;position:sticky;left:0;background:#fff}th:first-child{background:var(--nevoa)}tr.tot td{font-weight:800;background:var(--nevoa)}
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
<header><h1>BMH · Diretoria</h1><p id="atu"></p></header>
<main>
<div class="filtros"><div class="seg" id="uni"><button data-u="" class="on">Todas</button><button data-u="Asa Sul">Asa Sul</button><button data-u="Taguatinga">Taguatinga</button></div><select id="conv"></select><div class="periodo">De <select id="de"></select> até <select id="ate"></select></div></div>
<h2>Financeiro da produção</h2><p class="s">R$ mil · * mês em andamento · toque num valor em azul para ver por lote</p><div class="tab"><table id="tFin"></table></div>
<h2>Para cobrar</h2><p class="s">A receber há mais de 90 dias</p><ul class="lista" id="l90"></ul>
<p class="s" style="margin-top:12px">A faturar atrasado</p><ul class="lista" id="lFat"></ul>
<h2>Prazo de recebimento</h2><p class="s">Dias, em média, da sessão até o convênio pagar (no período)</p><ul class="lista" id="lPrazo"></ul>
<h2>Operação</h2><p class="s">* mês em andamento, até ontem · Var.: sessões contra o mês anterior · Dias: dias com atendimento</p><div class="tab"><table id="tOp"></table></div>
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
const brl = v => 'R$ ' + (v >= 1e6 ? (v/1e6).toFixed(2).replace('.', ',') + ' mi' : v >= 1000 ? Math.round(v/1000).toLocaleString('pt-BR') + ' mil' : Math.round(v).toLocaleString('pt-BR'));
const pct = (a, b) => b ? Math.round(100*a/b) + '%' : '—';
const el = (t, txt, cls) => { const e = document.createElement(t); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; };
let U = '', C = '', DE = '', ATE = '', PEND = false;
const noPeriodo = m => (!DE || m >= DE) && (!ATE || m <= ATE);
document.getElementById('atu').textContent = 'Atualizado em ' + D.atualizado;
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
  const part = sit !== 'recebido' ? [] : D.F.filter(x => x[2] === 'PARTICULAR' && x[7] > 0.5).map(x => [x[0], x[1], 'PARTICULAR (cartão)', 'recebido', '-', x[3], Math.round(x[7]), '']);
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
  fetch('bmh-diretoria?' + new URLSearchParams({ ...par, formato: 'json' }), { cache: 'no-store', credentials: 'same-origin' })   // mesmo endereço do painel: reaproveita o login
    .then(r => { if (r.status === 401) throw new Error('login'); if (!r.ok) throw new Error('falha'); return r.json(); })
    .then(d => {
      document.getElementById('dTit').textContent = d.titulo; document.getElementById('dSub').textContent = d.sub;
      if (!d.pacientes.length) { corpo.append(el('p', 'Nenhum paciente nessa situação (pode ter mudado desde a última atualização do painel).', 'sub')); return; }
      d.pacientes.forEach(p => { const l = el('div', null, 'lin'); const e = el('span'); e.append(el('b', p.nome)); e.append(document.createElement('br'), document.createTextNode(p.sessoes + (p.sessoes === 1 ? ' sessão' : ' sessões') + ' · ' + p.dias + (p.medicos ? ' · ' + p.medicos : ''))); l.append(e, el('span', 'R$ ' + p.valor.toLocaleString('pt-BR'))); corpo.append(l); });
      corpo.append(el('p', 'Dado de paciente: não encaminhar fora da equipe responsável.', 'sub'));
    })
    .catch(e => {
      if (e.message !== 'login') { document.getElementById('dSub').textContent = 'O iGut não respondeu. Tente de novo em instantes.'; return; }
      // segunda via: alguns navegadores não reenviam o login numa consulta feita pela página; carregando como página
      // (dentro da janela), o navegador sempre reaproveita o login do painel
      document.getElementById('dTit').textContent = 'Pacientes'; document.getElementById('dSub').textContent = '';
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
  const meses = [...new Set(D.F.map(r => r[0]))].sort().reverse(); const tot = { p:0,f:0,af:0,r:0,ar:0,g:0 };
  const ult12 = new Set(meses.filter(m => m < mesAtual && noPeriodo(m)));   // total = meses fechados do período escolhido
  const linhasMes = [];
  for (const m of meses) { const r = fin(m); if (!r.p || !noPeriodo(m)) continue;
    const tr = el('tr');
    const ok = m >= CONTROLE; [nomeMes(m) + (m === mesAtual ? '*' : ''), mil(r.p), ok ? mil(r.f) : '—', ok ? mil(r.af) : '—', ok ? mil(r.r) : '—', ok ? pct(r.r, r.p - r.g) : '—', ok ? mil(r.ar) : '—', ok ? mil(r.g) : '—'].forEach((v, i) => tr.append(celula(v, ok ? SIT_COL[i] : null, [m], nomeMes(m)))); linhasMes.push(tr);
    if (ult12.has(m)) { tot.p+=r.p; tot.f+=r.f; tot.af+=r.af; tot.r+=r.r; tot.ar+=r.ar; tot.g+=r.g; } }
  const mesesPer = [...ult12]; const tt = el('tr', null, 'tot'); ['Período', mil(tot.p), mil(tot.f), mil(tot.af), mil(tot.r), pct(tot.r, tot.p - tot.g), mil(tot.ar), mil(tot.g)].forEach((v, i) => tt.append(celula(v, SIT_COL[i], mesesPer, 'período'))); tf.append(tt, ...linhasMes);
  // atenção: a receber há mais de 90 dias e a faturar atrasado, por convênio
  const corte = new Date(d0); corte.setDate(corte.getDate() - 90); const corteMes = corte.toISOString().slice(0, 7); corteMesG = corteMes;
  const soma = (filtro, idx) => { const m = {}; for (const x of D.F) { if ((U && x[1] !== U) || (C && x[2] !== C) || !noPeriodo(x[0]) || !filtro(x[0]) || !x[idx]) continue; m[x[2]] = (m[x[2]] || 0) + x[idx]; } return Object.entries(m).filter(([, v]) => v >= 500).sort((a, b) => b[1] - a[1]); };
  const lista = (id, itens, vazio) => { const ul = document.getElementById(id); ul.replaceChildren(); if (!itens.length) { ul.append(el('li', vazio, 'vazio')); return; }
    itens.slice(0, 8).forEach(([c, v]) => { const li = el('li', null, 'cl'); li.append(el('span', c), el('span', brl(v))); li.onclick = () => abre(SIT_LISTA[id], [...new Set(D.F.map(r => r[0]))].filter(m => m >= CONTROLE && noPeriodo(m) && (id === 'l90' ? m < corteMesG : m < mesFechado)), c, id === 'l90' ? 'há mais de 90 dias' : 'atrasado'); ul.append(li); });
    if (itens.length > 1) { const t = itens.reduce((s, [, v]) => s + v, 0); const li = el('li'); li.append(el('span', 'Total'), el('span', brl(t))); ul.append(li); } };
  lista('l90', soma(m => m >= CONTROLE && m < corteMes, 8), 'Nada a receber há mais de 90 dias.');
  lista('lFat', soma(m => m >= CONTROLE && m < mesFechado, 6), 'Nada atrasado para faturar.');
  // prazo de recebimento por convênio (média ponderada pelo valor pago)
  const pz = {}; let tv = 0, td = 0;
  for (const x of D.PZ) { if ((U && x[1] !== U) || (C && x[2] !== C) || !noPeriodo(x[0])) continue; const a = (pz[x[2]] ||= [0, 0]); a[0] += x[3]; a[1] += x[4]; tv += x[3]; td += x[4]; }
  const ulp = document.getElementById('lPrazo'); ulp.replaceChildren();
  const itp = Object.entries(pz).filter(([, a]) => a[0] >= 1000).sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0]);
  if (!itp.length) ulp.append(el('li', 'Sem pagamento de convênio no período.', 'vazio'));
  itp.slice(0, 10).forEach(([c, a]) => { const li = el('li'); li.append(el('span', c), el('span', Math.round(a[1] / a[0]) + ' dias')); ulp.append(li); });
  if (tv) { const li = el('li'); li.append(el('span', 'Média geral'), el('span', Math.round(td / tv) + ' dias')); ulp.append(li); }
  // operação
  const to = document.getElementById('tOp'); to.replaceChildren();
  // detalhe que antes ficava nos quadros do início (20/10/2026): variação contra o mês anterior (só mês fechado: mês parcial
  // contra mês cheio seria alarme falso), dias com atendimento, sessões por dia (essa compara o mês parcial) e faltas cobradas
  const co = el('tr'); ['Mês','Sessões','Var.','Dias','Por dia','Ocupação','Faltas','Cobradas','Avaliações'].forEach(t => co.append(el('th', t))); to.append(co);
  for (const m of [...new Set(D.O.map(r => r[0]))].sort().reverse()) { const r = opr(m); if (!r.ag || !noPeriodo(m)) continue; const tr = el('tr');
    const ant = opr(anterior(m)), v = m < mesAtual && ant.at ? Math.round(100 * (r.at - ant.at) / ant.at) : null;
    [nomeMes(m) + (m === mesAtual ? '*' : ''), r.at.toLocaleString('pt-BR'), null, String(r.dias), r.dias ? Math.round(r.at / r.dias).toLocaleString('pt-BR') : '—', pct(r.at, r.lu), m >= CONTROLE ? pct(r.fa, r.ag) : '—', m >= CONTROLE ? r.co.toLocaleString('pt-BR') : '—', m >= AVALIACOES ? r.af.toLocaleString('pt-BR') : '—']
      .forEach((x, i) => tr.append(i === 2 ? el('td', v === null ? '—' : (v > 0 ? '+' : '') + v + '%', v > 0 ? 'd up' : v < 0 ? 'd down' : '') : el('td', x))); to.append(tr); }
}
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
