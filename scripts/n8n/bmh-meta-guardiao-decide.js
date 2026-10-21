// Guardião do Meta Ads da BMH (20/10/2026): as regras. Pelo método da Nexo (Central_Claude/frentes/metodo-meta-ads.md, seção 4)
// mais a regra do Jorge de 20/10: a conta não para antes de `meta_no_ar_ate` e nenhuma proposta deixa a conta sem anúncio
// rodando antes dessa data. Este arquivo é a fonte: o montador (monta-guardiao-meta.py) embute o mesmo texto no nó "Decide" do
// fluxo e o testa-guardiao-meta.js roda com os dados de verdade pelo cofre. Mudou aqui, monta o fluxo de novo.
//
// Só decide: devolve uma linha por aviso ou proposta. Não aplica nada (nesta versão o guardião é só simulação; pausar ou mudar
// verba sozinho é outra versão, com o "pode" do Jorge e depois de rodadas conferidas).
//
// Entrada E: hoje, ontem, dia, dias_mes, restantes (dias que faltam no mês, com hoje), teste, cfg (chave → valor da BMH_config),
// conta, campanhas, conjuntos, anuncios (listas da Graph), ontemConj, tresConj, seteConj (insights por conjunto), dias7
// (gasto da conta por dia, 7 dias), mes (gasto do mês até ontem), alteracoes (activities de ontem), registro (linhas da
// BMH_guardiao_registro) e erros (nome do nó → mensagem).
function decideMeta(E) {
  const cfg = E.cfg || {};
  const CONV = 'onsite_conversion.messaging_conversation_started_7d';
  // padrão seguro: sem a chave na BMH_config, vale a data da regra do Jorge (20/10/2026); a chave só serve para mudar a data
  const NO_AR_ATE = cfg.meta_no_ar_ate || '2026-10-31';
  const DIAS_AVISO = Number(cfg.meta_dias_aviso || 5);          // 3 dias de folga (regra do Jorge) + 2 para o Pix cair
  const FREQ_MAX = Number(cfg.meta_freq_max || 4);
  const LIM_SEM_CONVERSA = Number(cfg.meta_limite_sem_conversa || 40);
  const PISO = 6;                                               // menor orçamento diário que o guardião propõe
  const TETO = Number(cfg['meta_teto_mes_' + E.hoje.slice(0, 7)] || cfg.meta_teto_mes || 0);
  const DA_CASA = new Set(['Meta', ...String(cfg.meta_alteracoes_da_casa || 'Claude BMH').split(',').map(s => s.trim()).filter(Boolean)]);
  const REPETE_EM_7 = new Set(['meta_frequencia', 'meta_anuncio_problema']);   // o resto aparece todo dia enquanto durar

  const num = v => Number(v) || 0;
  const brl = v => 'R$ ' + num(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const maisDias = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const lista = r => (r && Array.isArray(r.data)) ? r.data : [];
  const acoesDe = a => Object.fromEntries((a || []).map(x => [x.action_type, num(x.value)]));
  // valor em texto da Meta ("R$211.10" ou "R$ 1.211,10"): o último separador é o decimal
  const valor = s => { const m = String(s || '').match(/R\$\s?([\d.,]+)/); if (!m) return null; const t = m[1]; const i = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','));
    return i > -1 && t.length - i - 1 === 2 ? Number(t.slice(0, i).replace(/[.,]/g, '') + '.' + t.slice(i + 1)) : Number(t.replace(/[.,]/g, '')); };

  const out = [];
  const add = a => out.push({ hoje: E.hoje, teste: !!E.teste, plataforma: 'meta', tipo: '', alvo_id: '', alvo: '', valor_antes: '', valor_novo: '',
    detalhe: '', modo: 'simulacao', resultado: 'simulado', ...a });

  // erro de qualquer leitura: avisa e não decide em cima de dado faltando
  const erros = Object.entries(E.erros || {});
  for (const [no, msg] of erros) add({ regra: 'meta_erro_api', acao: 'avisar', alvo: no,
    detalhe: `não consegui ler "${no}" na Meta: ${String(msg).replace(/(access_token|token)=[^&\s"']+/gi, '$1=[removido]').slice(0, 200)}` });
  if (erros.length) return out;

  const conta = E.conta || {};
  const campanhas = lista(E.campanhas), conjuntos = lista(E.conjuntos), anuncios = lista(E.anuncios);
  const campAtiva = new Set(campanhas.filter(c => c.effective_status === 'ACTIVE').map(c => c.id));
  const ativos = conjuntos.filter(c => c.effective_status === 'ACTIVE');

  // (1) conta fora do ar
  if (num(conta.account_status) !== 1)
    add({ regra: 'meta_conta_fora', acao: 'avisar', alvo: 'conta', detalhe: `a conta de anúncios não está ativa (status ${conta.account_status}${conta.disable_reason ? ', motivo ' + conta.disable_reason : ''}). Nada roda até resolver.` });

  // orçamentos diários ligados (campanha com orçamento próprio ou conjunto)
  const orc = [];
  for (const c of campanhas) if (c.effective_status === 'ACTIVE' && num(c.daily_budget)) orc.push({ tipo: 'campanha', id: c.id, nome: c.name, valor: num(c.daily_budget) / 100 });
  for (const c of ativos) if (campAtiva.has(c.campaign_id) && num(c.daily_budget)) orc.push({ tipo: 'conjunto', id: c.id, nome: c.name, valor: num(c.daily_budget) / 100 });
  const B = orc.reduce((s, o) => s + o.valor, 0);

  // (2) verba da conta e continuidade: o que sobra = menor entre o restante do limite de gastos e o saldo livre (pré-paga).
  // Ritmo = soma dos orçamentos ligados (reage na hora a uma pausa ou corte; a média de 7 dias levaria uma semana e daria
  // alarme falso); sem orçamento diário (verba total), usa a média de 7 dias.
  const ritmo = B > 0 ? B : lista(E.dias7).reduce((s, d) => s + num(d.spend), 0) / 7;
  const limite = conta.spend_cap && num(conta.spend_cap) > 0 ? (num(conta.spend_cap) - num(conta.amount_spent)) / 100 : null;
  const saldoBruto = conta.is_prepay_account ? valor((conta.funding_source_details || {}).display_string) : null;
  const saldo = saldoBruto === null ? null : saldoBruto - num(conta.balance) / 100;
  const candidatos = [limite, saldo].filter(v => v !== null && !Number.isNaN(v));
  if (candidatos.length && ritmo > 0) {
    const verba = Math.min(...candidatos);
    const quem = verba === limite ? 'limite de gastos da conta' : 'saldo pré-pago';
    const dias = verba / ritmo;
    const acaba = maisDias(E.hoje, Math.floor(dias));
    const antesDoPrazo = NO_AR_ATE && acaba < NO_AR_ATE;
    if (dias < DIAS_AVISO || antesDoPrazo) {
      let txt = `a verba da conta (${quem}) tem ${brl(verba)}: com ${brl(ritmo)}/dia ${B > 0 ? 'de orçamento ligado' : '(média de 7 dias)'} dura ${dias.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias e acaba por volta de ${dm(acaba)}.`;
      if (antesDoPrazo) {
        const falta = Math.ceil(((Math.round((new Date(NO_AR_ATE) - new Date(E.hoje)) / 864e5) + 1) * ritmo - verba) / 10) * 10;
        const pede = verba === limite ? `subir o limite em pelo menos ${brl(falta)} (e ter saldo para isso)` : `pôr Pix de pelo menos ${brl(falta)} além do imposto`;
        txt += ` A conta precisa ficar no ar até ${dm(NO_AR_ATE)}: ${pede}, ou baixar o gasto diário. Só o Jorge sobe o limite e põe Pix.`;
      } else txt += ` Só o Jorge ${verba === limite ? 'sobe o limite' : 'põe Pix (o Pix inclui imposto)'}.`;
      add({ regra: 'meta_verba_conta', acao: 'avisar', alvo: 'conta', valor_antes: verba.toFixed(2), detalhe: txt });
    }
  }

  // (3) gasto zero: conjunto ligado, de campanha ligada, criado antes de ontem, sem nenhuma exibição ontem
  const impOntem = Object.fromEntries(lista(E.ontemConj).map(x => [x.adset_id, num(x.impressions)]));
  for (const c of ativos) if (campAtiva.has(c.campaign_id) && String(c.created_time).slice(0, 10) < E.ontem && !impOntem[c.id])
    add({ regra: 'meta_gasto_zero', tipo: 'conjunto', alvo_id: c.id, alvo: c.name, acao: 'avisar', detalhe: `o conjunto "${c.name}" está ligado e não teve nenhuma exibição ontem (saldo, limite, reprovação ou público).` });

  // (4) frequência alta em 7 dias, só de conjunto que continua ligado (o pausado não pede criativo novo)
  const ligados = new Set(ativos.filter(c => campAtiva.has(c.campaign_id)).map(c => c.id));
  for (const x of lista(E.seteConj)) if (ligados.has(x.adset_id) && num(x.frequency) > FREQ_MAX)
    add({ regra: 'meta_frequencia', tipo: 'conjunto', alvo_id: x.adset_id, alvo: x.adset_name, acao: 'avisar', valor_antes: num(x.frequency).toFixed(1),
      detalhe: `"${x.adset_name}" mostrou o anúncio ${num(x.frequency).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vezes para cada pessoa em 7 dias (${brl(x.spend)}): pede criativo novo ou pausa.` });

  // (5) anúncio reprovado ou com problema, em conjunto ligado
  const conjAtivo = new Set(ativos.map(c => c.id));
  for (const a of anuncios) if (['DISAPPROVED', 'WITH_ISSUES'].includes(a.effective_status) && conjAtivo.has(a.adset_id))
    add({ regra: 'meta_anuncio_problema', tipo: 'anuncio', alvo_id: a.id, alvo: a.name, acao: 'avisar',
      detalhe: `o anúncio "${a.name}" está ${a.effective_status === 'DISAPPROVED' ? 'reprovado' : 'com problema'} na Meta e não roda.` });

  // (6) alteração feita por quem não é da casa, ontem (cobrança e evento da própria Meta ficam de fora)
  const porPessoa = {};
  for (const h of lista(E.alteracoes)) if (!DA_CASA.has(h.actor_name)) (porPessoa[h.actor_name || '?'] ||= []).push(h.translated_event_type || h.event_type);
  for (const [p, ev] of Object.entries(porPessoa))
    add({ regra: 'meta_alteracao_terceiros', alvo: p, acao: 'avisar', detalhe: `${p} mexeu na conta ontem (${ev.length}): ${[...new Set(ev)].slice(0, 5).join(', ')}.` });

  // (7) conjunto de mensagem com R$ 40 em 3 dias sem nenhuma conversa: proposta de pausa
  const tres = Object.fromEntries(lista(E.tresConj).map(x => [x.adset_id, { gasto: num(x.spend), conv: acoesDe(x.actions)[CONV] || 0 }]));
  const ehMensagem = c => c.optimization_goal === 'CONVERSATIONS' || /WHATSAPP|MESSENGER|MESSAGING|INSTAGRAM_DIRECT/.test(String(c.destination_type || ''));
  for (const c of ativos) { const t = tres[c.id]; if (ehMensagem(c) && t && t.gasto >= LIM_SEM_CONVERSA && t.conv === 0)
    add({ regra: 'meta_sem_conversa_3_dias', tipo: 'conjunto', alvo_id: c.id, alvo: c.name, acao: 'pausar', valor_antes: t.gasto.toFixed(2),
      detalhe: `${brl(t.gasto)} em 3 dias sem nenhuma conversa iniciada.` }); }

  // (8) teto do mês: gasto até ontem + orçamentos ligados × dias que faltam (com hoje)
  if (TETO) {
    const G = E.dia > 1 ? num(E.mes) : 0, proj = G + B * E.restantes;
    if (G >= TETO) for (const o of orc)
      add({ regra: 'meta_teto', tipo: o.tipo, alvo_id: o.id, alvo: o.nome, acao: 'pausar', valor_antes: G.toFixed(2), detalhe: `o mês já gastou ${brl(G)} no Meta; o teto é ${brl(TETO)}.` });
    else if (B > 0 && proj > TETO * 1.02) {
      const alvoTotal = Math.max(PISO * orc.length, (TETO - G) / E.restantes);
      for (const o of orc) { const novo = Math.max(PISO, Math.floor(o.valor * alvoTotal / B * 100) / 100); if (novo >= o.valor) continue;
        add({ regra: 'meta_teto', tipo: 'orcamento_' + o.tipo, alvo_id: o.id, alvo: o.nome, acao: 'orcamento', valor_antes: o.valor.toFixed(2), valor_novo: novo.toFixed(2),
          detalhe: `com ${brl(B)}/dia o mês fecharia em ${brl(proj)}, acima do teto de ${brl(TETO)}: de ${brl(o.valor)} para ${brl(novo)}/dia.` }); }
    }
  }

  // Trava de continuidade (Jorge, 20/10/2026): antes de `meta_no_ar_ate`, nenhuma proposta deixa a conta sem anúncio rodando.
  // Se as pausas propostas desligariam o último conjunto ligado, viram aviso.
  if (NO_AR_ATE && E.hoje <= NO_AR_ATE) {
    const pausas = out.filter(a => a.acao === 'pausar');
    const desliga = new Set();
    for (const a of pausas) {
      if (a.tipo === 'conjunto') desliga.add(a.alvo_id);
      if (a.tipo === 'campanha') ativos.filter(c => c.campaign_id === a.alvo_id).forEach(c => desliga.add(c.id));
    }
    const sobram = ativos.filter(c => campAtiva.has(c.campaign_id) && !desliga.has(c.id)).length;
    if (pausas.length && sobram === 0) for (const a of pausas) {
      a.acao = 'avisar'; a.resultado = 'nao_proposto';
      a.detalhe += ` Não proponho pausar: deixaria a conta sem anúncio antes de ${dm(NO_AR_ATE)} (regra do Jorge).`;
    }
  }

  // Mesmo aviso sobre o mesmo alvo só volta depois de 7 dias (só para frequência e anúncio com problema)
  const desde = maisDias(E.hoje, -7);
  const visto = new Set((E.registro || []).filter(r => r.plataforma === 'meta' && r.data >= desde && r.data < E.hoje).map(r => r.regra + '|' + r.alvo_id));
  return out.filter(a => !(REPETE_EM_7.has(a.regra) && visto.has(a.regra + '|' + a.alvo_id)));
}
// Monta a entrada E a partir das respostas cruas das leituras (bmh-meta-guardiao-leituras.json), igual no n8n e no teste.
// lidas: chave da leitura → resposta da Graph (ou { error } quando o nó falhou).
function montaEntrada(Q, cfg, lidas, registro, nomes) {
  const erros = {};
  for (const [k, r] of Object.entries(lidas)) if (!r || r.error) erros[(nomes && nomes[k]) || k] = r && r.error ? (r.error.message || JSON.stringify(r.error)) : 'sem resposta';
  const mes = lidas.mes && Array.isArray(lidas.mes.data) && lidas.mes.data[0] ? lidas.mes.data[0].spend : 0;
  return { ...Q, cfg, ...lidas, mes, registro: registro || [], erros };
}
// Uma mensagem só no Telegram (robô BMH alertas), sem botões: nesta versão nada se aplica, nem pelo toque.
function montaMensagem(Q, acoes) {
  if (!acoes.length) return [];
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const avisos = acoes.filter(a => a.acao === 'avisar'), propostas = acoes.filter(a => a.acao !== 'avisar');
  let t = (Q.teste ? '🧪 TESTE: nada foi gravado\n' : '') + '🛡️ Guardião Meta BMH · ' + dm(Q.hoje) + ' (homologação, simulação)\n';
  if (avisos.length) t += '\n' + avisos.map(a => '• ' + a.detalhe).join('\n') + '\n';
  if (propostas.length) t += '\nO que eu proporia (nada foi mudado):\n' + propostas.map(a => '• ' + (a.acao === 'pausar' ? `pausar "${a.alvo}": ` : `orçamento de "${a.alvo}": `) + a.detalhe).join('\n') + '\n';
  // Limpeza antes do Telegram (21/10/2026, depois da 1ª execução recusada): tira caractere de controle e emoji partido,
  // esconde token que venha num erro da Meta, nunca manda vazio e corta em linha inteira antes de 3.500 caracteres.
  t = t.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .replace(/(access_token|token)=[^&\s"']+/gi, '$1=[removido]').trim();
  if (t.length > 3500) t = t.slice(0, t.lastIndexOf('\n', 3500) > 0 ? t.lastIndexOf('\n', 3500) : 3500) + '\n(...)';
  return [{ texto: t || 'Guardião Meta BMH: mensagem vazia (ver a execução no n8n).' }];
}
// FIM-DA-FUNCAO (o montador corta daqui para baixo ao embutir no n8n)
if (typeof module !== 'undefined') module.exports = { decideMeta, montaEntrada, montaMensagem };
