// (o montar.js põe aqui em cima o código de integracoes/plantoes/emails.js)
// Monta os dois e-mails do mês depois que o Jorge tocou em "Pronto": honorários (aba do mês já completa + aba Pagamento)
// e produção (sessões finalizadas por unidade, da tabela BMH_operacao_dia, a mesma do painel e do relatório mensal).
const Q = $('Qual mês').first().json;
const [aba, pag] = ($('Lê a planilha').first().json.valueRanges || []).map((v) => v.values || []);
if (!aba || aba.length < 2) throw new Error('aba ' + Q.aba + ' vazia ou inexistente');
const H = emailHonorarios(aba, pag, Q.rotuloMes);
const ses = { 'Asa Sul': 0, Taguatinga: 0 };
for (const i of $('Operação (tabela)').all()) { const r = i.json; if (r && String(r.dia || '').startsWith(Q.mes) && ses[r.unidade] != null) ses[r.unidade] += Number(r.atendidas) || 0; }
const P = emailProducao(ses, Q.rotuloMes);
// mensagem RFC 822 em UTF-8, em base64url, como o Gmail pede para criar rascunho
const rascunho = (para, assunto, texto) => {
  const enc = (s) => '=?UTF-8?B?' + Buffer.from(s, 'utf8').toString('base64') + '?=';
  // nome com acento no destinatário vai codificado ("Brasília Medicina Hiperbárica <...>")
  const paraCod = String(para || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => { const m = x.match(/^(.*?)\s*<(.+)>$/); return m && /[^\x20-\x7e]/.test(m[1]) ? enc(m[1].replace(/"/g, '')) + ' <' + m[2] + '>' : x; }).join(', ');
  const raw = [paraCod ? 'To: ' + paraCod : null, 'Subject: ' + enc(assunto), 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', Buffer.from(texto, 'utf8').toString('base64')].filter((x) => x !== null).join('\r\n');
  return { message: { raw: Buffer.from(raw, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') } };
};
const cfg = {}; try { for (const i of $('Config').all()) if (i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
return [{ json: { Q, honorarios: H, producao: P, sessoes: ses,
  rascunhos: [rascunho(cfg.email_honorarios_para || '', H.assunto, H.texto), rascunho(cfg.email_producao_para || '', P.assunto, P.texto)] } }];
