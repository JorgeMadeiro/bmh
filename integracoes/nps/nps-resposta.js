// Resposta ao NPS da 5ª sessão (19/11/2026), vinda pelo recebedor oficial da Meta. Liga a resposta ao pedido pelo id da
// mensagem citada (wamid) ou, sem ele, pelo telefone em código (pedido enviado nos últimos 3 dias).
//   "Está ótima" ou "Está boa" → responde com o link de avaliação no Google da unidade;
//   "Podia ser melhor"        → responde pedindo detalhes; no modo real, tarefa no Kommo para a recepção. Nunca recebe o link
//                               (decisão do Jorge, 19/11/2026, sabendo que o Google proíbe pedir avaliação só a quem gostou).
// Modo: `nps_modo` (ensaio só registra; espelho responde ao número de teste, sem Kommo; real faz tudo).
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config do NPS').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = ['real', 'espelho'].includes(cfg.nps_modo) ? cfg.nps_modo : 'ensaio';
const LINK = { 'Asa Sul': 'https://search.google.com/local/writereview?placeid=ChIJJXS9NUUlWpMRlYawN2nXqeA', Taguatinga: 'https://search.google.com/local/writereview?placeid=ChIJxQ67LUozWpMRRY1izF8vR8Y' };
const tab = $('NPS (tabela da resposta)').all().map((i) => i.json).filter((r) => r && r.chave && (r.wamid || /enviada/.test(r.status || '')));
const prep = $('Prepara a mensagem').all().map((i) => i.json), out = [], limite = Date.now() - 3 * 864e5;
$('Monta a linha').all().forEach((i, k) => {
  const m = i.json; if (m.direcao !== 'paciente') return;
  const t = norm(m.texto), resp = t === 'esta otima' ? 'ótima' : t === 'esta boa' ? 'boa' : t === 'podia ser melhor' ? 'podia ser melhor' : ''; if (!resp) return;
  const r = tab.find((x) => m.respondendo && x.wamid === m.respondendo) || tab.filter((x) => x.telefone_hash === m.telefone_hash && Date.parse(x.criado_em) > limite).sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em)))[0];
  if (!r || r.resposta) return;   // resposta sem pedido conhecido, ou segunda resposta: a recepção vê na conversa
  const bom = resp !== 'podia ser melhor', texto = bom
    ? `Que bom saber! Se puder, conte como foi no Google: leva um minuto e ajuda outros pacientes a conhecerem a BMH. ${LINK[r.unidade] || LINK['Asa Sul']}`
    : 'Obrigado por nos contar. O que poderíamos fazer melhor? A equipe vai ler e te responder.';
  out.push({ json: { ...r, resposta: resp, respondido_em: m.momento, status: (modo === 'espelho' ? 'espelho: ' : modo === 'ensaio' ? 'ensaio: ' : '') + 'respondeu ' + resp,
    link_enviado_em: bom && modo !== 'ensaio' ? new Date().toISOString() : r.link_enviado_em || '',
    responder: modo !== 'ensaio' ? { telefone: String(prep[k]?.telefone || '').replace(/\D/g, ''), texto } : null,
    tarefa: modo === 'real' && !bom ? { texto: `Paciente respondeu "Podia ser melhor" no NPS da 5ª sessão (${r.unidade}). Falar com o paciente hoje e ver a conversa.` } : null } });
});
return out;
