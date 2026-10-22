// Origem de cada conversa nova no WhatsApp da recepção (22/10/2026), pelas mensagens do recebedor oficial da Meta, sem
// depender do Kommo. Roda a cada 10 min sobre as últimas 24 h. Regras da Nexo (origem e "provável pelo tempo", que lá
// acertou 38 de 38):
//   - conversa nova = primeira mensagem do paciente (telefone em código) sem outra dele nos 7 dias anteriores;
//   - com frase pronta: liga ao clique mais recente do site, ainda livre, cuja mensagem bate com o começo da conversa,
//     de 180 min antes até 3 min depois (leva o gclid e as UTMs);
//   - sem frase (cerca de 20% apagam o texto): "provável pelo tempo" quando um clique livre, de 6 min a 3 h atrás, tem
//     exatamente UMA conversa nova sem frase nos 5 min seguintes e nenhum outro clique livre a 5 min dele;
//   - o resto fica "sem origem" (a equipe pergunta "como conheceu?").
// Saída: as linhas de BMH_origem_conversas e os cliques ligados (lead_id = "conversa:<código>"). Nada sai daqui.
const sem = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const agora = Date.parse($now.toISO()), MIN = 60000;
const msgs = $('Mensagens (tabela)').all().map((i) => i.json).filter((r) => r && r.direcao === 'paciente' && r.telefone_hash);
const cliques = $('Cliques (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && r.registrado_em);
const jaFeitas = new Set($('Origem das conversas (tabela)').all().map((i) => i.json && i.json.chave).filter(Boolean));
// primeira mensagem de cada conversa nova
const porFone = {}; for (const m of msgs) (porFone[m.telefone_hash] ||= []).push(m);
const novas = [];
for (const [fone, ms] of Object.entries(porFone)) {
  ms.sort((a, b) => a.momento.localeCompare(b.momento));
  for (let k = 0; k < ms.length; k++) { const t = Date.parse(ms[k].momento), antes = k > 0 ? Date.parse(ms[k - 1].momento) : 0;
    if (agora - t > 24 * 60 * MIN) continue; if (antes && t - antes < 7 * 24 * 60 * MIN) continue;
    novas.push({ fone, t, m: ms[k], chave: fone.slice(0, 32) + '|' + ms[k].momento }); }
}
const livres = cliques.filter((c) => !c.lead_id).map((c) => ({ ...c, t: Date.parse(c.registrado_em) })).sort((a, b) => b.t - a.t);
const usados = new Set(), out = [], ligados = [];
const liga = (n, c, como) => { usados.add(c.chave); ligados.push({ ...c, t: undefined, lead_id: 'conversa:' + n.fone.slice(0, 16), ligado_em: $now.toISO() });
  return { clique_chave: c.chave, pagina: c.pagina, gclid: c.gclid || '', utm_source: c.utm_source || '', utm_medium: c.utm_medium || '', utm_campaign: c.utm_campaign || '', utm_content: c.utm_content || '', como }; };
// 1. com frase
for (const n of novas.filter((x) => x.m.origem)) {
  if (jaFeitas.has(n.chave)) continue;
  const c = livres.find((c) => !usados.has(c.chave) && c.mensagem_inicio && sem(n.m.texto).startsWith(sem(c.mensagem_inicio).slice(0, 40)) && c.t <= n.t + 3 * MIN && c.t >= n.t - 180 * MIN);
  out.push({ chave: n.chave, telefone_hash: n.fone, primeira_msg_em: n.m.momento, origem: n.m.origem, ...(c ? liga(n, c, 'frase e clique') : { clique_chave: '', pagina: '', gclid: '', utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', como: 'frase' }), ctwa_clid: n.m.ctwa_clid || '' });
}
// 2. sem frase: provável pelo tempo
const semFrase = novas.filter((x) => !x.m.origem && !jaFeitas.has(x.chave));
for (const c of livres.filter((c) => !usados.has(c.chave) && agora - c.t >= 6 * MIN && agora - c.t <= 180 * MIN)) {
  const cand = semFrase.filter((n) => n.t >= c.t && n.t <= c.t + 5 * MIN && !out.find((o) => o.chave === n.chave));
  const vizinhos = livres.filter((o) => o.chave !== c.chave && Math.abs(o.t - c.t) <= 5 * MIN);
  if (cand.length === 1 && !vizinhos.length) { const n = cand[0];
    out.push({ chave: n.chave, telefone_hash: n.fone, primeira_msg_em: n.m.momento, origem: n.m.ctwa_clid ? 'anúncio Meta' : 'site', ...liga(n, c, 'provável pelo tempo'), ctwa_clid: n.m.ctwa_clid || '' }); }
}
// 3. o resto, depois de 3 h sem clique que sirva: anúncio da Meta (código do anúncio) ou sem origem
for (const n of semFrase) { if (out.find((o) => o.chave === n.chave) || agora - n.t < 180 * MIN) continue;
  out.push({ chave: n.chave, telefone_hash: n.fone, primeira_msg_em: n.m.momento, origem: n.m.ctwa_clid ? 'anúncio Meta' : '', clique_chave: '', pagina: '', gclid: '', utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', como: n.m.ctwa_clid ? 'código do anúncio' : 'sem origem', ctwa_clid: n.m.ctwa_clid || '' }); }
return [...out.map((json) => ({ json: { ...json, tipo: 'conversa' } })), ...ligados.map((json) => ({ json: { ...json, tipo: 'clique' } }))];
