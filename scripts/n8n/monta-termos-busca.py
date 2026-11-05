"""Monta scripts/n8n/bmh-google-termos.json ("BMH · Google Ads · termos de busca (homologação)", 01/11/2026). Decisão 114 do Jorge
(01/11): ler os termos de busca dos 3 grupos caros de outubro (TESTE DE PALAVRAS, Asa Sul, Institucional + Concorrentes: R$ 1.459,52
para 20 contatos) e preparar negativas e ajustes; aplicar é outro ok, com a lista na mão. Só leitura, pelo Manual, que responde:
os termos com gasto, cliques e contatos; as palavras-chave do grupo; e as negativas que já existem. A renovação do acesso e a
chamada à API são as do guardião do Google.
  /webhook/<caminho>?desde=AAAA-MM-DD&ate=AAAA-MM-DD&grupos=Taguatinga,Asa Sul   (padrão: outubro e os 3 grupos caros)
No n8n: 68fEUzJEX6ibQpXh (criado pela Central em 01/11/2026).

  python3 scripts/n8n/monta-termos-busca.py"""
import json, os, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
WEBHOOK = 'bmh-google-termos-7f30c4'
GRUPOS = ['TESTE DE PALAVRAS', 'Asa Sul', 'Institucional + Concorrentes']
CRED_GOOGLE = {'httpCustomAuth': {'id': 'Qewvtjz9JokCUvNy', 'name': 'BMH · Google Ads (renovação do acesso)'}}
uid = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-google-termos/' + n))
nos = []
def no(nome, tipo, versao, parametros, pos, **extra):
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': pos, 'parameters': parametros, **extra})
no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'responseMode': 'lastNode', 'options': {}}, [0, 0], webhookId=uid('webhook'))
no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, {'method': 'POST', 'url': 'https://oauth2.googleapis.com/token', 'authentication': 'genericCredentialType',
   'genericAuthType': 'httpCustomAuth', 'sendBody': True, 'contentType': 'json', 'specifyBody': 'json', 'jsonBody': '{}', 'options': {}}, [240, 0],
   credentials=CRED_GOOGLE, retryOnFail=True, maxTries=3, waitBetweenTries=5000)
no('Lê os termos', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Só leitura (decisão 114 do Jorge, 01/11/2026). A mesma chamada do guardião do Google.\n"
    "const q = $('Manual').first().json.query || {};\n"
    "const data = s => /^\\d{4}-\\d{2}-\\d{2}$/.test(s || '') ? s : '';\n"
    "const desde = data(q.desde) || '2026-10-01', ate = data(q.ate) || '2026-10-31';\n"
    "// ?grupos=Nome 1,Nome 2 troca os grupos lidos (01/11/2026: conferir se os grupos de unidade têm a palavra antes da negativa B)\n"
    f"const GRUPOS = (q.grupos ? String(q.grupos).split(',').map(s => s.trim()).filter(Boolean).slice(0, 10) : {json.dumps(GRUPOS, ensure_ascii=False)});\n"
    "const CONTA = '5066798424', token = $('Google · renova o acesso').first().json.access_token;\n"
    "if (!token) throw new Error('sem acesso (token) do Google Ads');\n"
    "const busca = async q => { let out = [], pt; do { const r = await this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/googleAds:search`, headers: { Authorization: 'Bearer ' + token }, body: { query: q, ...(pt ? { pageToken: pt } : {}) }, json: true, timeout: 60000 }); out = out.concat(r.results || []); pt = r.nextPageToken; } while (pt); return out; };\n"
    "const lista = GRUPOS.map(g => `'${g.replace(/'/g, \"\\\\'\")}'`).join(', ');\n"
    "const per = `segments.date BETWEEN '${desde}' AND '${ate}'`;\n"
    "const termos = await busca(`SELECT search_term_view.search_term, search_term_view.status, ad_group.name, campaign.name, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM search_term_view WHERE ${per} AND ad_group.name IN (${lista})`);\n"
    "const palavras = await busca(`SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, metrics.cost_micros, metrics.clicks, metrics.conversions FROM keyword_view WHERE ${per} AND ad_group.name IN (${lista}) AND ad_group_criterion.negative = FALSE`);\n"
    "// (05/11/2026: sem o filtro, as negativas do grupo vinham como palavra ENABLED, com gasto zero)\n"
    "const negCamp = await busca(`SELECT campaign.name, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion WHERE campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD' AND campaign.status != 'REMOVED'`);\n"
    "const negGrupo = await busca(`SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type FROM ad_group_criterion WHERE ad_group_criterion.negative = TRUE AND ad_group_criterion.type = 'KEYWORD' AND ad_group.name IN (${lista})`);\n"
    "let listas = []; try { listas = await busca(`SELECT shared_set.name, shared_criterion.keyword.text, shared_criterion.keyword.match_type FROM shared_criterion WHERE shared_set.type = 'NEGATIVE_KEYWORDS'`); } catch (e) {}\n"
    "const r2 = v => Math.round(Number(v || 0) / 1e4) / 100;\n"
    "const grupos = {};\n"
    "for (const g of GRUPOS) grupos[g] = { gasto: 0, cliques: 0, contatos: 0, termos: [], palavras: [], negativas_do_grupo: [] };\n"
    "for (const x of termos) { const g = grupos[x.adGroup.name]; if (!g) continue; const t = { termo: x.searchTermView.searchTerm, situacao: x.searchTermView.status, gasto: r2(x.metrics.costMicros), cliques: Number(x.metrics.clicks || 0), impressoes: Number(x.metrics.impressions || 0), contatos: Math.round(Number(x.metrics.conversions || 0) * 10) / 10 };\n"
    "  g.termos.push(t); g.gasto += t.gasto; g.cliques += t.cliques; g.contatos += t.contatos; }\n"
    "for (const x of palavras) { const g = grupos[x.adGroup.name]; if (g) g.palavras.push({ palavra: x.adGroupCriterion.keyword.text, tipo: x.adGroupCriterion.keyword.matchType, situacao: x.adGroupCriterion.status, gasto: r2(x.metrics.costMicros), cliques: Number(x.metrics.clicks || 0), contatos: Math.round(Number(x.metrics.conversions || 0) * 10) / 10 }); }\n"
    "for (const x of negGrupo) { const g = grupos[x.adGroup.name]; if (g) g.negativas_do_grupo.push(x.adGroupCriterion.keyword.text + ' (' + x.adGroupCriterion.keyword.matchType + ')'); }\n"
    "for (const g of Object.values(grupos)) { g.gasto = Math.round(g.gasto * 100) / 100; g.termos.sort((a, b) => b.gasto - a.gasto); g.palavras.sort((a, b) => b.gasto - a.gasto); }\n"
    "return [{ json: { periodo: { desde, ate }, grupos, negativas_da_campanha: negCamp.map(x => ({ campanha: x.campaign.name, termo: x.campaignCriterion.keyword.text, tipo: x.campaignCriterion.keyword.matchType })),\n"
    "  listas_de_negativas: listas.map(x => ({ lista: x.sharedSet.name, termo: x.sharedCriterion.keyword.text, tipo: x.sharedCriterion.keyword.matchType })) } }];\n")}, [480, 0])
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 900, 'height': 300, 'content': (
    "## BMH · Google Ads · termos de busca (homologação)\n"
    "**Traz:** do Google Ads da BMH (5066798424), no período pedido, os termos de busca, as palavras-chave e as negativas dos grupos "
    "TESTE DE PALAVRAS, Asa Sul e Institucional + Concorrentes, e as negativas da conta (campanhas e listas).\n"
    "**Envia:** só a resposta do Manual (JSON), para o Gerente BMH preparar as negativas.\n"
    "**Limites:** só leitura; não muda nada na conta; aplicar negativa é outro ok do Jorge (decisão 114, 01/11/2026).\n\n"
    f"Manual: `/webhook/{WEBHOOK}?desde=AAAA-MM-DD&ate=AAAA-MM-DD` (padrão: outubro de 2026).")}, [0, -380])
lig = {'Manual': {'main': [[{'node': 'Google · renova o acesso', 'type': 'main', 'index': 0}]]},
       'Google · renova o acesso': {'main': [[{'node': 'Lê os termos', 'type': 'main', 'index': 0}]]}}
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'all', 'saveDataErrorExecution': 'all',
        'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 300}
json.dump({'name': 'BMH · Google Ads · termos de busca (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-google-termos.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-google-termos.json |', len(nos), 'nós')
