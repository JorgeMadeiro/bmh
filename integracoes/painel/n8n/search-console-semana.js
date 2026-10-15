// Relatório semanal do Google orgânico (S3, aprovado pelo Jorge em 15/10/2026): segunda às 7h, menos de 200 palavras e
// UMA ação de 10 minutos. O Search Console atrasa ~3 dias: a semana termina 3 dias antes de hoje e é comparada com os 7
// dias anteriores. Sem alarme: só números e uma sugestão; queda só aparece se for nas duas semanas (regra da casa).
const D = $('Datas').first().json;
const rows = (n) => ($(n).first().json || {}).rows || [];
const soma = (rs) => rs.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions, p: a.p + r.position * r.impressions }), { c: 0, i: 0, p: 0 });
const dias = rows('Por dia'), A = soma(dias.filter((r) => r.keys[0] >= D.ini)), B = soma(dias.filter((r) => r.keys[0] < D.ini));
const pos = (s) => (s.i ? (s.p / s.i).toFixed(1).replace('.', ',') : '—'), n = (v) => Math.round(v).toLocaleString('pt-BR');
const delta = (a, b) => (b ? ` (${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)}%)` : '');
const qA = rows('Buscas · semana'), qB = Object.fromEntries(rows('Buscas · semana antes').map((r) => [r.keys[0], r]));
const top = [...qA].sort((a, b) => b.clicks - a.clicks).filter((r) => r.clicks > 0).slice(0, 3);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// mudança de posição entre buscas com volume (≥ 30 exibições nas duas semanas); menor posição é melhor
const mud = qA.filter((r) => r.impressions >= 30 && qB[r.keys[0]] && qB[r.keys[0]].impressions >= 30).map((r) => ({ q: r.keys[0], de: qB[r.keys[0]].position, para: r.position }))
  .filter((m) => Math.abs(m.para - m.de) >= 2).sort((a, b) => Math.abs(b.para - b.de) - Math.abs(a.para - a.de)).slice(0, 2);
// a ação de 10 minutos: 1) página nova sem nenhuma exibição; 2) busca que já aparece bem, mas com pouco clique; 3) nada urgente
const pg = Object.fromEntries(rows('Páginas · semana').map((r) => [r.keys[0].replace('https://hiperbaricabrasilia.com.br', ''), r]));
// página nova (com a data em que foi ao ar) só conta se já estava publicada na semana inteira; indexação já pedida em 15/10
const NOVAS = { '/feridas-que-nao-cicatrizam/': ['Feridas', '2026-10-15'], '/equipe-medica/': ['Equipe médica', '2026-10-15'], '/convenios/': ['Convênios', '2026-10-15'] };
const semExib = Object.keys(NOVAS).filter((u) => NOVAS[u][1] < D.ini && (!pg[u] || !pg[u].impressions));
// só busca de quem está perto (Brasília, DF, unidades, cidades vizinhas) ou com o nome da BMH: as genéricas vêm do Brasil
// inteiro e não trazem paciente (auditoria de 15/10, achado A10)
const LOCAL = /bras[ií]lia|\bdf\b|distrito federal|taguatinga|asa sul|asa norte|l2 sul|plano piloto|[aá]guas claras|ceil[aâ]ndia|samambaia|guar[aá]|bmh|medicina hiperb[aá]rica bras/i;
const pouco = qA.filter((r) => LOCAL.test(r.keys[0]) && r.impressions >= 30 && r.position >= 3 && r.position <= 15 && r.ctr < 0.05).sort((a, b) => b.impressions - a.impressions)[0];
let acao;
if (semExib.length) acao = `No Search Console, peça indexação de ${semExib.map((u) => NOVAS[u][0] + ' (' + u + ')').join(', ')}: na semana não teve nenhuma exibição.`;
else if (pouco) acao = `"${esc(pouco.keys[0])}" aparece ${n(pouco.impressions)} vezes na posição ${pouco.position.toFixed(1).replace('.', ',')}, mas só ${(pouco.ctr * 100).toFixed(1).replace('.', ',')}% clicam: peça ao Claude para melhorar o título e a descrição da página que aparece nessa busca.`;
else acao = 'Nada urgente no Google orgânico. Se sobrar tempo: uma postagem nova numa das fichas do Google.';
const t = [`${D.teste ? '🧪 TESTE\n' : ''}🔎 <b>BMH · Google orgânico</b> · ${D.iniBr} a ${D.fimBr}`,
  `Cliques: <b>${n(A.c)}</b>${delta(A.c, B.c)} · exibições ${n(A.i)}${delta(A.i, B.i)} · posição média ${pos(A)} (antes ${pos(B)})`,
  top.length ? 'Mais clicadas: ' + top.map((r) => `"${esc(r.keys[0])}" (${r.clicks})`).join(', ') : 'Nenhuma busca com clique na semana.',
  ...(mud.length ? ['Mudou de posição: ' + mud.map((m) => `"${esc(m.q)}" ${m.de.toFixed(1).replace('.', ',')} → ${m.para.toFixed(1).replace('.', ',')}`).join('; ') + ' (menor é melhor)'] : []),
  '', `✅ <b>Ação de 10 minutos:</b> ${acao}`];
return [{ json: { texto: t.join('\n') } }];
