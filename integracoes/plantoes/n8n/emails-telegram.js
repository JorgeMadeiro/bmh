// Avisa o Jorge no Telegram: rascunhos criados no Gmail (ou, sem Gmail autorizado ainda, manda os textos aqui).
const E = $('Monta os e-mails').first().json; let gmail = null; try { gmail = $('Cria os rascunhos').all().map((i) => i.json); } catch (e) {}
const ok = gmail && gmail.length === 2 && gmail.every((g) => g && g.id);
const brl = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cab = [`📧 E-mails de ${E.Q.rotuloMes}`, `Honorários: ${E.honorarios.medicos} médico(s) × unidade, total ${brl(E.honorarios.total)}`, `Produção: Asa Sul ${E.sessoes['Asa Sul']} · Taguatinga ${E.sessoes.Taguatinga}`,
  ...(E.honorarios.faltando.length ? ['⚠️ Sem dados de pagamento na aba Pagamento: ' + E.honorarios.faltando.join(', ')] : []),
  ...(() => { try { if ($('Linha da Geral').first().json.pular) return []; const g = $('Grava a Geral').first().json; return [g && g.totalUpdatedRows ? `📊 Aba Geral: linha de ${E.Q.rotuloMes} atualizada (honorários puxados da aba ${E.Q.aba}, sessões do iGut).` : '⚠️ Não consegui atualizar a aba Geral.']; } catch (e) { return ['⚠️ Não consegui atualizar a aba Geral.']; } })(),
  ok ? '✅ Os dois rascunhos estão no seu Gmail (Rascunhos). Revise, ajuste se precisar e envie.' : '⚠️ O Gmail ainda não está autorizado: seguem os textos aqui.'];
const msgs = [cab.join('\n')];
if (!ok) { msgs.push(E.honorarios.assunto + '\n\n' + E.honorarios.texto); msgs.push(E.producao.assunto + '\n\n' + E.producao.texto); }
// texto vai em HTML no Telegram: escapa < > & (um "_" num PIX quebrava o modo Markdown padrão)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
return msgs.map((t) => ({ json: { texto: esc(t.length > 4000 ? t.slice(0, 3990) + '\n…' : t) } }));
