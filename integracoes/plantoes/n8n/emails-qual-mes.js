// Chamado pelo botão "Pronto" do Telegram (fluxo de botões) com ?mes=AAAA-MM&chave=...; a chave impede que alguém de fora
// dispare rascunhos no Gmail do Jorge.
const q = $('Gerar e-mails').first().json.query || {};
if (q.chave !== '__CHAVE__' || !/^\d{4}-\d{2}$/.test(q.mes || '')) throw new Error('chamada inválida');
const ref = DateTime.fromISO(q.mes + '-01'), nome = ref.setLocale('pt-BR').toFormat('LLLL');
return [{ json: { mes: q.mes, aba: (q.prefixo ? q.prefixo + ' ' : '') + ref.toFormat('LL/yy'), rotuloMes: nome.charAt(0).toUpperCase() + nome.slice(1) + '/' + ref.year, prefixo: q.prefixo || '' } }];
