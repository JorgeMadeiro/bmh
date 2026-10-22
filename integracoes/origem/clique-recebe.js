// Clique no WhatsApp do site (22/10/2026, origem do Kommo; modelo da Nexo, tabela NEXO_cliques_site). A tag do Tag Manager
// manda, no clique em wa.me/api.whatsapp.com: página, botão, começo da mensagem pronta e o que guardou da chegada (gclid,
// gbraid, wbraid, fbclid, UTMs, página de entrada, site de origem). Nada pessoal. Aqui só se limpa e se limita o tamanho;
// a ligação com a conversa (o clique mais recente da mesma página, de 3 min depois a 180 min antes) é do fluxo de origem.
const b = $('Recebe o clique').first().json.body || {};
const CAMPOS = ['pagina', 'botao', 'mensagem_inicio', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'entrada', 'referencia'];
const limpo = (v) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 200);
const r = Object.fromEntries(CAMPOS.map((k) => [k, limpo(b[k])]));
if (!r.pagina.startsWith('/')) return [];   // não veio do site
const agora = $now.toISO();
return [{ json: { chave: agora + '|' + Math.random().toString(36).slice(2, 8), registrado_em: agora, ...r, lead_id: '', ligado_em: '' } }];
