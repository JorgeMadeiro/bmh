// Origem do contato pela primeira mensagem que chega ao Kommo da BMH (22/10/2026, motor pronto antes da assinatura).
// Entrada: o webhook de conta do Kommo de mensagem recebida (message[add][0][...]). Saída: um item por mensagem com a
// origem (pela frase pronta da lista única integracoes/origem/frases.json, injetada aqui pelo montar.js) e o PATCH dos
// campos do lead. Lições da Nexo embutidas:
//   - só lead: mensagem presa ao CONTATO trazia o id do contato como se fosse lead e gravava origem no lead errado;
//   - o Instagram codifica o link duas vezes: decodifica até 2 vezes antes de comparar;
//   - frases que começam igual ("Vim pelo site da BMH" e "...e tenho uma dúvida"): vence a mais longa;
//   - mensagem sem frase (cerca de 20% apagam o texto pronto): sai sem origem, para a origem "provável pelo tempo" e o
//     "como conheceu?" da equipe.
// Modo (chave `origem_modo` em BMH_config): "ensaio" (padrão) só calcula; "real" também grava no lead. Ids dos campos do
// lead: chave `kommo_campos` (JSON, gravada pelo scripts/kommo/montar.js no primeiro dia do teste grátis).
const FRASES = __FRASES__;
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = cfg.origem_modo === 'real' ? 'real' : 'ensaio';
let campos = {}; try { campos = JSON.parse(cfg.kommo_campos || '{}'); } catch (e) {}
const sem = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const decodifica = (s) => { let t = String(s || ''); for (let i = 0; i < 2 && /%[0-9a-f]{2}/i.test(t); i++) { try { t = decodeURIComponent(t.replace(/\+/g, ' ')); } catch (e) { break; } } return t; };
const identifica = (texto) => {
  const t = sem(decodifica(texto)); let melhor = null;
  for (const f of FRASES) { const i = sem(f.inicio); if (i && t.startsWith(i) && (!melhor || i.length > sem(melhor.inicio).length)) melhor = f; }
  if (!melhor) return null;
  let cirurgiao = '';
  if (melhor.captura) { const m = new RegExp(melhor.captura, 'i').exec(decodifica(texto)); if (m) cirurgiao = m[1].replace(/\s+/g, ' ').trim().slice(0, 80); }
  return { ...melhor, cirurgiao };
};
// o webhook do Kommo chega como formulário: aceita o corpo já aninhado ou com as chaves planas "message[add][0][text]"
const corpo = $('Recebe do Kommo').first().json.body || {};
const msgs = Array.isArray(corpo?.message?.add) ? corpo.message.add : (() => { const o = {}; for (const [k, v] of Object.entries(corpo)) { const m = /^message\[add\]\[(\d+)\]\[([^\]]+)\]$/.exec(k); if (m) (o[m[1]] ||= {})[m[2]] = v; } return Object.values(o); })();
const out = [];
for (const m of msgs) {
  if (String(m.type || 'incoming') !== 'incoming') continue;
  const ehLead = String(m.entity_type || '') === 'lead', lead = ehLead ? Number(m.entity_id) || null : null;
  const achou = identifica(m.text);
  const valores = achou ? { origem: achou.origem, utm_source: achou.utm_source, utm_medium: achou.utm_medium, utm_campaign: achou.utm_campaign || '', utm_content: achou.utm_content, cirurgiao_indicou: achou.cirurgiao } : {};
  const custom = Object.entries(valores).filter(([k, v]) => v && campos[k]).map(([k, v]) => ({ field_id: Number(campos[k]), values: [{ value: v }] }));
  const etiqueta = achou ? { site: 'site', 'anúncio Google': 'google', 'Instagram do Dr. Jorge': 'instagram dr jorge', 'Instagram da BMH': 'instagram bmh', 'Perfil do Google': 'google', 'cirurgião': 'cirurgião' }[achou.origem] : '';
  out.push({ json: {
    modo, lead_id: lead, contato_id: Number(m.contact_id) || null, conversa_id: m.talk_id || '', recebida_em: Number(m.created_at) || null,
    frase: achou ? achou.chave : '', ...valores,
    acao: !lead ? 'ignorar: mensagem não é de lead' : !achou ? 'sem frase: origem provável pelo tempo ou "como conheceu?"' : modo === 'real' ? 'gravar no lead' : 'ensaio: não grava',
    patch: lead && achou ? [{ id: lead, custom_fields_values: custom, _embedded: { tags: etiqueta ? [{ name: etiqueta }] : [] } }] : null,
  } });
}
return out;
