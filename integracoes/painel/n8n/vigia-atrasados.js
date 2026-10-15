// Vigia de fluxos parados (T6, aprovado pelo Jorge em 15/10/2026). Cada fluxo agendado anota em BMH_vigia a hora em que
// começou; aqui, de hora em hora (7h às 22h), avisa o que passou do prazo normal sem rodar. Erro de execução já é avisado
// pelo "BMH · Alerta de falha"; execução que trava estoura o limite de 1 h e vira erro. Um aviso por problema: só avisa de
// novo depois que o fluxo voltar a rodar e parar outra vez (regra "nunca alarme falso": prazo com folga).
const agora = $now.setZone('America/Sao_Paulo');
const linhas = $('Vigia (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && r.ultima_vez);
const NORMAL = { 26: 'todo dia', 11: 'a cada 30 min, das 7h às 21h', 170: 'toda semana', 745: 'todo mês' };
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const atrasados = linhas.filter((r) => {
  const u = DateTime.fromISO(r.ultima_vez); if (!u.isValid) return false;
  const horas = agora.diff(u, 'hours').hours, avisou = r.avisado_em && DateTime.fromISO(r.avisado_em) > u;
  return horas > Number(r.max_horas) && !avisou;
});
if (!atrasados.length) return [];
const texto = ['⏸️ <b>BMH · fluxo parado</b>', ...atrasados.map((r) => { const u = DateTime.fromISO(r.ultima_vez).setZone('America/Sao_Paulo');
  return `• <b>${esc(r.nome)}</b>: última vez em ${u.toFormat('dd/LL HH:mm')} (há ${Math.round(agora.diff(u, 'hours').hours)} h; o normal é rodar ${NORMAL[Number(r.max_horas)] || 'a cada ' + r.max_horas + ' h'}).`; }),
  '', 'Não deu erro: ele não rodou no horário. Vale olhar com o Claude.'].join('\n');
return [{ json: { texto, avisar: atrasados.map((r) => ({ ...r, avisado_em: agora.toISO() })) } }];
