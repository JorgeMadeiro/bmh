// Resposta do paciente ao botão da confirmação (22/10/2026), vinda pelo recebedor oficial da Meta. Liga a resposta à
// confirmação pelo id da mensagem citada (wamid) ou, sem ele, pelo telefone em código (confirmação de hoje ou amanhã).
//   "Confirmo"          → marca confirmado no iGut (statusatendimento 1) em todos os agendamentos do dia, no modo real
//   "Preciso remarcar"  → fica registrado; a recepção vê a resposta no WhatsApp e remarca
// Modo: o mesmo da confirmação (`confirmacao_modo`); em ensaio só registra o que faria.
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const cfg = {}; try { for (const i of $('Config da resposta').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = cfg.confirmacao_modo === 'real' ? 'real' : 'ensaio';
const hoje = $now.setZone('America/Sao_Paulo').toISODate(), amanha = $now.setZone('America/Sao_Paulo').plus({ days: 1 }).toISODate();
const conf = $('Confirmações (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
const out = [];
for (const i of $('Monta a linha').all()) {
  const m = i.json; if (m.direcao !== 'paciente') continue;
  const t = norm(m.texto), resp = t === 'confirmo' ? 'confirmou' : t === 'preciso remarcar' ? 'pediu para remarcar' : '';
  if (!resp) continue;
  const c = conf.find((r) => m.respondendo && r.wamid === m.respondendo) || conf.filter((r) => r.telefone_hash === m.telefone_hash && (r.dia === hoje || r.dia === amanha)).sort((a, b) => a.dia.localeCompare(b.dia))[0];
  if (!c) continue;   // resposta sem confirmação conhecida: a recepção vê no WhatsApp
  out.push({ json: { ...c, resposta: resp, respondido_em: m.momento, status: resp === 'confirmou' ? (modo === 'real' ? 'confirmando no iGut' : 'ensaio: confirmaria no iGut') : 'pediu para remarcar', confirmar_igut: modo === 'real' && resp === 'confirmou', agendamento_lista: String(c.agendamentos || '').split(',').filter(Boolean) } });
}
return out;
