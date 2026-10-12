// Mensagens do guardião no Telegram (robô BMH alertas, 08/10/2026). Uma mensagem com os avisos do dia; uma por proposta
// (pausar ou baixar orçamento) que não foi aplicada sozinha, com os botões Aplicar e Ignorar. O botão leva gd:<código da
// chave do registro>:a|i e é lido pelo fluxo "BMH · Telegram · botões". Na chamada de teste: mostra, sem botões.
const Q = $('Quando').first().json;
const acoes = $input.all().map(i => i.json);
const cod = s => { let x = 0x811c9dc5; for (const c of String(s)) { x ^= c.codePointAt(0); x = Math.imul(x, 0x01000193) >>> 0; } return x.toString(36); };
const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
const selo = Q.teste ? '🧪 TESTE: nada foi gravado nem aplicado\n' : '';
const out = [];
const avisos = acoes.filter(a => a.acao === 'avisar');
if (avisos.length) out.push({ texto: selo + '🛡️ Guardião BMH · ' + dm(Q.hoje) + '\n\n' + avisos.map(a => '• ' + a.detalhe).join('\n'), botoes: false, id: '' });
for (const a of acoes.filter(a => a.acao !== 'avisar')) {
  const oQue = a.acao === 'pausar' ? `Pausar ${a.tipo === 'grupo' ? 'o grupo' : 'a campanha'} "${a.alvo}"`
    : `Orçamento de "${a.alvo}": de ${brl(a.valor_antes)} para ${brl(a.valor_novo)} por dia`;
  const corpo = oQue + '\nMotivo: ' + a.detalhe;
  if (a.resultado === 'aplicado') out.push({ texto: selo + '🛡️ Guardião BMH aplicou sozinho (modo real)\n\n' + corpo, botoes: false, id: '' });
  else if (/^falhou/.test(String(a.resultado))) out.push({ texto: selo + '⚠️ Guardião BMH tentou e não conseguiu\n\n' + corpo + '\n' + a.resultado, botoes: false, id: '' });
  else out.push({ texto: selo + '🛡️ Guardião BMH · proposta de ' + dm(Q.hoje) + '\n\n' + corpo + (Q.teste ? '' : '\n\nNada mudou ainda. "Aplicar" muda no Google Ads na hora; vale até amanhã.'),
    botoes: !Q.teste, id: cod([a.hoje, a.regra, a.alvo_id || a.alvo].join('|')) });
}
return out.map(json => ({ json }));
