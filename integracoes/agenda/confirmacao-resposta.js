// Resposta do paciente ao botão da confirmação (22/10/2026), vinda pelo recebedor oficial da Meta. Liga a resposta à
// confirmação pelo id da mensagem citada (wamid) ou, sem ele, pelo telefone em código (confirmação de hoje ou amanhã).
//   "Confirmo"          → marca confirmado no iGut (statusatendimento 1) em todos os agendamentos do dia, no modo real
//   "Preciso remarcar"  → no modo real (decisão do Jorge, 19/11/2026: "pode marcar sozinho") desmarca no iGut (status 3) os
//                          agendamentos do dia e leva o lead para a etapa "Remarcar" do funil da unidade, com nota; a
//                          volta é manual: a recepção move o lead depois de remarcar (decisão do Jorge, 19/11/2026)
// Modo: o mesmo da confirmação (`confirmacao_modo`); em ensaio só registra o que faria.
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config da resposta').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = ['real', 'espelho'].includes(cfg.confirmacao_modo) ? cfg.confirmacao_modo : 'ensaio';   // espelho: registra o que faria, sem iGut nem Kommo
const hoje = $now.setZone('America/Sao_Paulo').toISODate(), amanha = $now.setZone('America/Sao_Paulo').plus({ days: 1 }).toISODate();
const conf = $('Confirmações (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
// depois do "Confirmo", recado com o horário de chegada e o mapa da unidade (19/11/2026, Jorge: chegar com 20 a 30 min de antecedência; embarque de 5 a 10 min antes). Texto
// livre: o toque no botão abre a janela de 24 h. Vai para quem tocou (no espelho é o telefone de teste); em ensaio, não vai.
const MAPA = { 'Asa Sul': 'https://maps.google.com/maps?cid=16188707182465812117', Taguatinga: 'https://maps.google.com/maps?cid=14287440431353597253' };
const prep = $('Prepara a mensagem').all().map((i) => i.json);
const out = [];
for (const [k, i] of $('Monta a linha').all().entries()) {
  const m = i.json; if (m.direcao !== 'paciente') continue;
  const t = norm(m.texto), resp = t === 'confirmo' ? 'confirmou' : t === 'preciso remarcar' ? 'pediu para remarcar' : '';
  if (!resp) continue;
  const c = conf.find((r) => m.respondendo && r.wamid === m.respondendo) || conf.filter((r) => r.telefone_hash === m.telefone_hash && (r.dia === hoje || r.dia === amanha)).sort((a, b) => a.dia.localeCompare(b.dia))[0];
  if (!c) continue;   // resposta sem confirmação conhecida: a recepção vê no WhatsApp
  const fone = String(prep[k]?.telefone || '').replace(/\D/g, '');
  const responder = modo !== 'ensaio' && resp === 'confirmou' && c.resposta !== 'confirmou' && fone   // um recado só, mesmo se tocar duas vezes
    ? { telefone: fone, texto: c.tipo === 'avaliação'   // avaliação não tem câmara: só o mapa, até o Jorge definir o horário de chegada
      ? `Confirmado, obrigado! Como chegar à BMH ${c.unidade}: ${MAPA[c.unidade] || MAPA['Asa Sul']}`
      : `Confirmado, obrigado! Chegue com 20 a 30 minutos de antecedência: o embarque na câmara é de 5 a 10 minutos antes do horário marcado. Como chegar à BMH ${c.unidade}: ${MAPA[c.unidade] || MAPA['Asa Sul']}` } : null;
  out.push({ json: { ...c, responder, resposta: resp, respondido_em: m.momento, status: (modo === 'espelho' ? 'espelho: ' : '') + (resp === 'confirmou' ? (modo === 'real' ? 'confirmando no iGut' : 'confirmaria no iGut') : (modo === 'real' ? 'pediu para remarcar: desmarcada no iGut' : 'desmarcaria e levaria para Remarcar')), confirmar_igut: modo === 'real' && resp === 'confirmou', desmarcar_igut: modo === 'real' && resp === 'pediu para remarcar', agendamento_lista: String(c.agendamentos || '').split(',').filter(Boolean) } });
}
return out;
