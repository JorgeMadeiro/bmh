// Envio das conversões da BMH à Meta e ao Google (22/10/2026, "pode" do Jorge: "já pode criar inclusive o envio à Meta e ao
// Google"). Lê BMH_conversoes (avaliou e iniciou, do fluxo dos eventos do iGut; agendou, da passagem do Kommo, desde 17/11/2026) e monta:
//   - Meta: API de Conversões no pixel 1526867428059043, evento presencial (action_source physical_store, até 62 dias):
//     "Avaliou" e "IniciouTratamento", com o telefone (com e sem o 9) e o e-mail em código; event_id = chave (não duplica);
//   - Google: Data Manager API, um lote por conversão secundária (Avaliou 7864686655, Iniciou tratamento 7864686658),
//     telefone com "+" e e-mail em código, transactionId = chave (não duplica), até 55 dias.
// Modo (?modo= no "Rodar agora" ou a chave conversoes_envio_modo): "simular" (padrão: monta e não manda), "teste" (o
// Google só confere, validateOnly; a Meta só com a chave meta_test_event_code) e "real". Nunca vai nome, tratamento nem
// valor. Só se marca "enviado" no modo real e com a resposta certa.
let q = {}; try { q = $('Rodar agora').first().json.query || {}; } catch (e) {}
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const MODOS = ['simular', 'teste', 'real'], modo = MODOS.includes(q.modo) ? q.modo : MODOS.includes(cfg.conversoes_envio_modo) ? cfg.conversoes_envio_modo : 'simular';
// agendou (17/11/2026, ok do Jorge): conversão secundária "BMH · Agendou avaliação (iGut)" 7907222094 e o evento padrão
// Schedule na Meta. As 31 da primeira rodada (gravadas às 19h13 de 17/11, marcadas em dias anteriores) ficam de fora;
// só o modo teste com ?antigos=1 as inclui, para o Google conferir (validateOnly) sem gravar nada.
const ACOES = { avaliou: '7864686655', iniciou: '7864686658', agendou: '7907222094' }, META = { avaliou: 'Avaliou', iniciou: 'IniciouTratamento', agendou: 'Schedule' };
const AGENDOU_DESDE = Date.parse('2026-11-17T19:15:00-03:00');
const hoje = $now.setZone('America/Sao_Paulo').toISODate(), idade = (d) => (Date.parse(hoje) - Date.parse(d)) / 864e5;
const ts = (d) => Math.floor(Date.parse(d + 'T15:00:00Z') / 1000);   // meio-dia em Brasília
const linhas = $('Conversões (tabela)').all().map((i) => i.json).filter((r) => r && r.chave && ACOES[r.evento] && (r.evento !== 'agendou' || Date.parse(r.criado_em) > AGENDOU_DESDE || (modo === 'teste' && q.antigos === '1')));
const paraMeta = linhas.filter((r) => !r.enviado_meta && idade(r.dia) <= 60 && (r.telefone_hash || r.email_hash)).slice(0, 500);
const meta = paraMeta.map((r) => ({ event_name: META[r.evento], event_time: ts(r.dia), action_source: 'physical_store', event_id: r.chave,
  user_data: { ...(r.telefone_hash ? { ph: [r.telefone_hash, r.telefone_hash_sem9].filter(Boolean) } : {}), ...(r.email_hash ? { em: [r.email_hash] } : {}) } }));
const google = Object.entries(ACOES).map(([ev, id]) => {
  const rs = linhas.filter((r) => r.evento === ev && !r.enviado_google && idade(r.dia) <= 55 && (r.telefone_hash_google || r.email_hash)).slice(0, 2000);
  return { evento: ev, destino: id, chaves: rs.map((r) => r.chave), corpo: {
    destinations: [{ operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '5066798424' }, productDestinationId: id }],
    encoding: 'HEX', validateOnly: modo !== 'real',
    events: rs.map((r) => ({ transactionId: r.chave, eventTimestamp: new Date(ts(r.dia) * 1000).toISOString(), eventSource: 'OTHER',
      userData: { userIdentifiers: [...(r.email_hash ? [{ emailAddress: r.email_hash }] : []), ...(r.telefone_hash_google ? [{ phoneNumber: r.telefone_hash_google }] : [])] } })) } };
}).filter((g) => g.chaves.length);
const codigoTeste = cfg.meta_test_event_code || '';
return [{ json: { modo, manda_meta: meta.length > 0 && (modo === 'real' || (modo === 'teste' && !!codigoTeste)), meta_corpo: { data: meta, ...(modo === 'teste' && codigoTeste ? { test_event_code: codigoTeste } : {}) },
  chaves_meta: paraMeta.map((r) => r.chave), google, manda_google: modo !== 'simular' && google.length > 0 } }];
