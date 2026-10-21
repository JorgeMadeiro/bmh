// Números do Meta Ads da BMH (21/10/2026): o que a "BMH · Meta · números do dia" grava na BMH_meta_anuncios_dia e o bloco do
// Meta no resumo das 8h, lido dessa tabela (lição da Nexo: painel, resumo e guardião leem a mesma fonte e nunca discordam).
// A verba da conta vem de verbaDaConta (bmh-meta-guardiao-decide.js), a mesma conta do guardião. Fonte: este arquivo; os
// montadores embutem o texto nos nós do n8n e o testa-numeros-meta.js roda com os dados de verdade pelo cofre.
//
// Tabela BMH_meta_anuncios_dia: uma linha por anúncio por dia (tipo "anuncio", chave dia|ad_id) e uma foto da conta por dia
// (tipo "conta", chave dia|conta). Só números e nomes de campanha e anúncio: nada de lead, conversa ou paciente.
const COLUNAS_META_DIA = {
  chave: 'string', dia: 'string', tipo: 'string', campanha_id: 'string', campanha: 'string', conjunto_id: 'string',
  conjunto: 'string', ad_id: 'string', anuncio: 'string', gasto: 'number', impressoes: 'number', alcance: 'number',
  cliques_link: 'number', conversas: 'number', verba_restante: 'number', orcamento_ligado: 'number', ritmo: 'number',
  dias_restantes: 'number', acaba_em: 'string', fonte_verba: 'string', atualizado_em: 'string',
};

// Q: hoje, agora (ISO); lidas: chave da leitura → resposta da Graph (anuncios, conta, campanhas, conjuntos, dias7).
function linhasDoDia(Q, lidas) {
  const CONV = 'onsite_conversion.messaging_conversation_started_7d';
  const num = v => Number(v) || 0, r2 = v => Math.round(num(v) * 100) / 100;
  const lista = r => (r && Array.isArray(r.data)) ? r.data : [];
  for (const [k, r] of Object.entries(lidas)) if (!r || r.error) throw new Error(`não consegui ler "${k}" na Meta: ` +
    String(r && r.error ? (r.error.message || JSON.stringify(r.error)) : 'sem resposta').replace(/(access_token|token)=[^&\s"']+/gi, '$1=[removido]').slice(0, 250));
  // mais de uma página: não grava pela metade (o período do ?desde= ficou grande demais)
  if (lidas.anuncios.paging && lidas.anuncios.paging.next) throw new Error('a Meta devolveu mais de 500 linhas: use um ?desde= mais curto');
  const vazio = { campanha_id: '', campanha: '', conjunto_id: '', conjunto: '', ad_id: '', anuncio: '', gasto: 0, impressoes: 0, alcance: 0,
    cliques_link: 0, conversas: 0, verba_restante: 0, orcamento_ligado: 0, ritmo: 0, dias_restantes: 0, acaba_em: '', fonte_verba: '' };
  const linhas = lista(lidas.anuncios).map(x => {
    const a = Object.fromEntries((x.actions || []).map(y => [y.action_type, num(y.value)]));
    return { ...vazio, chave: x.date_start + '|' + x.ad_id, dia: x.date_start, tipo: 'anuncio', campanha_id: String(x.campaign_id || ''),
      campanha: x.campaign_name || '', conjunto_id: String(x.adset_id || ''), conjunto: x.adset_name || '', ad_id: String(x.ad_id || ''),
      anuncio: x.ad_name || '', gasto: r2(x.spend), impressoes: num(x.impressions), alcance: num(x.reach),
      cliques_link: num(x.inline_link_clicks), conversas: a[CONV] || 0, atualizado_em: Q.agora };
  });
  const V = verbaDaConta({ ...lidas, hoje: Q.hoje });
  linhas.push({ ...vazio, chave: Q.hoje + '|conta', dia: Q.hoje, tipo: 'conta', verba_restante: V.verba === null ? 0 : r2(V.verba),
    orcamento_ligado: r2(V.B), ritmo: r2(V.ritmo), dias_restantes: V.dias === null ? 0 : Math.round(V.dias * 10) / 10,
    acaba_em: V.acaba || '', fonte_verba: V.quem || '', atualizado_em: Q.agora });
  return linhas;
}

// Bloco do Meta no resumo das 8h. rows: linhas da BMH_meta_anuncios_dia; D: O (ontem), M0 (1º do mês de ontem), hoje,
// diaOntem, diasMes. Devolve as linhas de ontem, as do mês e os avisos de dado atrasado.
function blocoMeta(rows, cfg, D) {
  const num = v => Number(v) || 0;
  const brl = v => 'R$ ' + Math.round(num(v)).toLocaleString('pt-BR'), int = v => Math.round(num(v)).toLocaleString('pt-BR');
  const dm = d => d.slice(8, 10) + '/' + d.slice(5, 7);
  const soma = (rs, f) => rs.reduce((s, r) => s + num(r[f]), 0);
  const cada = (g, c) => c >= 0.5 ? ` (${brl(g / c)} cada)` : '';
  const ads = rows.filter(r => r.tipo === 'anuncio');
  const aO = ads.filter(r => r.dia === D.O), aM = ads.filter(r => r.dia >= D.M0 && r.dia <= D.O);
  const gO = soma(aO, 'gasto'), cvO = soma(aO, 'conversas'), clO = soma(aO, 'cliques_link'), gM = soma(aM, 'gasto'), cvM = soma(aM, 'conversas');
  const conta = rows.filter(r => r.tipo === 'conta').sort((a, b) => (a.dia < b.dia ? -1 : 1)).pop();
  const deHoje = conta && conta.dia === D.hoje;
  const teto = num(cfg['meta_teto_mes_' + D.M0.slice(0, 7)] || cfg.meta_teto_mes);
  const noArAte = cfg.meta_no_ar_ate || '2026-10-31';
  const restantes = D.diasMes - D.diaOntem;
  const out = { ontem: [], mes: [], atraso: [] };
  out.ontem.push('📘 Meta Ads: ' + brl(gO) + ' · ' + (cvO >= 0.5 ? int(cvO) + (Math.round(cvO) === 1 ? ' conversa' : ' conversas') + cada(gO, cvO) : 'nenhuma conversa') +
    ' · ' + int(clO) + (Math.round(clO) === 1 ? ' clique' : ' cliques') + ' no link');
  const B = deHoje ? num(conta.orcamento_ligado) : null, proj = B === null ? null : gM + B * restantes;
  out.mes.push('• Meta: ' + brl(gM) + (teto ? ' de ' + brl(teto) : '') + (proj === null ? '' : ' · com ' + brl(B) + '/dia, fecha em ' + brl(proj)) +
    (teto && proj !== null && proj > teto * 1.02 ? ' ⚠️ acima do teto' : ''));
  out.mes.push('• Conversas do Meta: ' + int(cvM) + cada(gM, cvM));
  if (deHoje && num(conta.verba_restante) > 0) out.mes.push('• Verba da conta Meta: ' + brl(conta.verba_restante) +
    (num(conta.dias_restantes) ? ', dura ~' + num(conta.dias_restantes).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' dias' + (conta.acaba_em ? ' (até ' + dm(conta.acaba_em) + ')' : '') : '') +
    (conta.acaba_em && conta.acaba_em < noArAte && D.hoje <= noArAte ? ' ⚠️ antes de ' + dm(noArAte) : ''));
  if (!deHoje) out.atraso.push('⚠️ A gravação do Meta das 6h05 não rodou hoje: os números do Meta podem estar incompletos.');
  return out;
}
// FIM-DA-FUNCAO (o montador corta daqui para baixo ao embutir no n8n)
if (typeof module !== 'undefined') module.exports = { linhasDoDia, blocoMeta, COLUNAS_META_DIA };
