// Acha a proposta (pelo código do botão ou pela mensagem respondida) e decide. Trava: só proposta ainda aberta e só os
// dois perfis da BMH.
const B = $('Lê o botão de avaliação').first().json;
const linhas = $('Avaliações (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
const r = B.codigo ? linhas.find((x) => x.codigo === B.codigo) : linhas.find((x) => String(x.message_id) === String(B.message_id));
const PERFIL = /^accounts\/117754317451946679663\/locations\/(15026912528968655315|6381458115148112648)\/reviews\//;
const fim = (resposta, alerta = false) => [{ json: { publicar: false, gravar: false, resposta, alerta, texto_final: '' } }];
if (!r) return B.codigo ? fim('Não achei essa avaliação na tabela.', true) : [];   // resposta a outra mensagem qualquer: ignora
if (r.status !== 'proposta') return fim('Essa avaliação já foi decidida (' + r.status + ').', true);
if (!PERFIL.test(String(r.review_name || ''))) return fim('Avaliação fora dos perfis da BMH: não publico.', true);
if (B.decisao === 'ignorar') return [{ json: { publicar: false, gravar: true, linha: { ...r, status: 'ignorada', decidido_por: B.quem, atualizado_em: $now.toISO() },
  resposta: 'Ignorada.', alerta: false, texto_final: B.texto_msg + '\n\n⏭️ Ignorada por ' + B.quem + '.' } }];
const comment = B.texto_novo || r.sugestao;
if (!comment) return fim('Não há texto para publicar: responda à mensagem com o texto.', true);
return [{ json: { publicar: true, gravar: true, review_name: r.review_name, comment, linha: { ...r, status: 'publicada', publicada: comment, decidido_por: B.quem, atualizado_em: $now.toISO() },
  resposta: 'Publicando…', alerta: false, texto_final: B.texto_msg + '\n\n✅ Publicada por ' + B.quem + (B.texto_novo ? ' (com o seu texto):\n' + comment : '.') } }];
