// Guardião dos anúncios da BMH (08/10/2026), adaptado do guardião da Nexo (fluxo 7Fd3ceQbmAz0Przl). Só Google Ads por
// enquanto. Lê a conta, aplica as regras e devolve uma linha por ação; quem aplica é o nó seguinte, e só no modo real
// de cada regra (BMH_config: guardiao_modo_teto, guardiao_modo_pausa; padrão "simulacao").
// Regras: (1) grupo com R$ 40 em 3 dias sem contato → pausa (menos campanha em teste até a data, EM_TESTE); (2) orçamento que leva o mês acima do teto → corta na mesma
// proporção (teto atingido → pausa as campanhas); (3) anúncio reprovado → avisa; (4) alteração feita por outra pessoa
// (a Triunfo teve os acessos removidos em 28/10/2026: toda alteração de terceiro é estranha) ontem → avisa; erro de API → avisa. Nunca sobe orçamento: só avisa quando está abaixo do teto.
const Q = $('Quando').first().json;
const cfg = Object.fromEntries($('Config').all().map(i => i.json).filter(r => r.chave).map(r => [r.chave, r.valor]));
// teto do mês: exceção por mês em BMH_config (teto_mes_AAAA-MM, ex.: outubro/2026 = 4400), senão teto_mes
const TETO = Number(cfg['teto_mes_' + Q.mes_inicio.slice(0, 7)] || cfg.teto_mes || 0), LIM_GASTO = 40, PISO = 5, CONTA = '5066798424', DONO = 'jorgemadeirotorres@gmail.com';
const MODO = { teto: cfg.guardiao_modo_teto === 'real' ? 'real' : 'simulacao', pausa: cfg.guardiao_modo_pausa === 'real' ? 'real' : 'simulacao' };
const acoes = [];
const add = a => acoes.push({ hoje: Q.hoje, teste: Q.teste, plataforma: 'google', tipo: '', alvo_id: '', alvo: '', valor_antes: '', valor_novo: '', detalhe: '', modo: 'simulacao', ...a });
const brl = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const token = $('Google · renova o acesso').first().json.access_token;
const busca = async q => { let out = [], pt; do { const r = await this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/googleAds:search`, headers: { Authorization: 'Bearer ' + token }, body: { query: q, ...(pt ? { pageToken: pt } : {}) }, json: true, timeout: 60000 }); out = out.concat(r.results || []); pt = r.nextPageToken; } while (pt); return out; };
const custo = l => l.reduce((s, x) => s + Number(x.metrics.costMicros || 0) / 1e6, 0);
try {
  if (!token) throw new Error('sem acesso (token) do Google Ads');
  // (1) grupos que gastaram R$ 40 em 3 dias sem contato. Campanha em teste com régua própria fica de fora até a data
  // (Jorge, 15/10/2026: concorrentes seguem a régua do Bruno, decidir com ~30 cliques ou em 05/11; sem aviso diário antes)
  const EM_TESTE = { '24333599216': '2026-11-05' };
  const grupos = await busca(`SELECT ad_group.resource_name, ad_group.name, campaign.id, campaign.name, metrics.cost_micros, metrics.conversions FROM ad_group WHERE segments.date BETWEEN '${Q.d3}' AND '${Q.ontem}' AND ad_group.status = 'ENABLED' AND campaign.status = 'ENABLED'`);
  const gAgg = {};
  for (const x of grupos) { if (EM_TESTE[x.campaign.id] && Q.ontem < EM_TESTE[x.campaign.id]) continue; const k = x.adGroup.resourceName; (gAgg[k] ||= { nome: x.campaign.name + ' › ' + x.adGroup.name, gasto: 0, conv: 0 }); gAgg[k].gasto += Number(x.metrics.costMicros || 0) / 1e6; gAgg[k].conv += Number(x.metrics.conversions || 0); }
  for (const [rn, g] of Object.entries(gAgg)) if (g.gasto >= LIM_GASTO && g.conv === 0)
    add({ regra: 'sem_contato_3_dias', tipo: 'grupo', alvo_id: rn, alvo: g.nome, acao: 'pausar', valor_antes: g.gasto.toFixed(2), detalhe: `${brl(g.gasto)} em 3 dias sem nenhum contato`, modo: MODO.pausa });
  // (2) teto do mês: projeção = gasto até ontem + orçamento diário × dias que faltam (com hoje)
  if (TETO) {
    const camps = await busca(`SELECT campaign.name, campaign.resource_name, campaign_budget.resource_name, campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'ENABLED' AND campaign.experiment_type = 'BASE'`);
    const orc = {}; for (const c of camps) orc[c.campaignBudget.resourceName] ||= { nome: c.campaign.name, valor: Number(c.campaignBudget.amountMicros) / 1e6 };
    const B = Object.values(orc).reduce((s, o) => s + o.valor, 0);
    const G = Q.ontem >= Q.mes_inicio ? custo(await busca(`SELECT metrics.cost_micros FROM customer WHERE segments.date BETWEEN '${Q.mes_inicio}' AND '${Q.ontem}'`)) : 0;
    const proj = G + B * Q.restantes;
    if (G >= TETO) for (const c of camps) add({ regra: 'teto', tipo: 'campanha', alvo_id: c.campaign.resourceName, alvo: c.campaign.name, acao: 'pausar', valor_antes: G.toFixed(2), detalhe: `o mês já gastou ${brl(G)}, o teto é ${brl(TETO)}`, modo: MODO.teto });
    else if (proj > TETO * 1.02 && B > 0) {
      const alvoTotal = Math.max(PISO * Object.keys(orc).length, (TETO - G) / Q.restantes);
      for (const [rn, o] of Object.entries(orc)) { const novo = Math.max(PISO, Math.floor(o.valor * alvoTotal / B * 100) / 100); if (novo >= o.valor) continue;
        add({ regra: 'teto', tipo: 'orcamento_google', alvo_id: rn, alvo: o.nome, acao: 'orcamento', valor_antes: o.valor.toFixed(2), valor_novo: novo.toFixed(2),
          detalhe: `com ${brl(B)}/dia o mês fecharia em ${brl(proj)}, acima do teto de ${brl(TETO)}: orçamento de ${brl(o.valor)} para ${brl(novo)}/dia`, modo: MODO.teto }); }
    } else if (Q.dia <= 3 && B * Q.dias_mes < TETO * 0.85)
      add({ regra: 'teto', acao: 'avisar', detalhe: `Com ${brl(B)}/dia o mês fecha perto de ${brl(G + B * Q.restantes)}, abaixo do teto de ${brl(TETO)}. Subir o orçamento é decisão do Jorge.` });
  }
  // (3) anúncios reprovados
  const reprov = await busca(`SELECT ad_group_ad.ad.id, ad_group.name, campaign.name, ad_group_ad.policy_summary.approval_status FROM ad_group_ad WHERE ad_group_ad.status = 'ENABLED' AND ad_group.status = 'ENABLED' AND campaign.status = 'ENABLED' AND ad_group_ad.policy_summary.approval_status = 'DISAPPROVED'`);
  for (const x of reprov) add({ regra: 'reprovado', tipo: 'anuncio', alvo_id: String(x.adGroupAd.ad.id), alvo: x.campaign.name + ' › ' + x.adGroup.name, acao: 'avisar', detalhe: 'anúncio reprovado pelo Google: precisa de texto novo' });
  // (4) alterações de outras pessoas ontem
  const mud = await busca(`SELECT change_event.change_date_time, change_event.user_email, change_event.change_resource_type, change_event.resource_change_operation FROM change_event WHERE change_event.change_date_time >= '${Q.ontem} 00:00:00' AND change_event.change_date_time < '${Q.hoje} 00:00:00' ORDER BY change_event.change_date_time DESC LIMIT 200`);
  const deFora = {}; for (const x of mud) { const e = x.changeEvent.userEmail || '(sem e-mail)'; if (e === DONO) continue; deFora[e] = (deFora[e] || 0) + 1; }
  for (const [e, n] of Object.entries(deFora)) add({ regra: 'alteracao_de_fora', alvo: e, acao: 'avisar', detalhe: `${e} fez ${n} ${n === 1 ? 'alteração' : 'alterações'} na conta ontem` });
} catch (e) { add({ regra: 'erro', acao: 'avisar', detalhe: 'Google Ads não respondeu: ' + String(e.message).slice(0, 200) }); }
return acoes.map(json => ({ json }));
