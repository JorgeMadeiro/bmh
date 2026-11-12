"""Títulos novos nos anúncios de pesquisa da BMH (Jorge, 12/11/2026, livro da Central: "pode ajustar", e a correção do mesmo dia).
As duas palavras-chave que mais gastam ("hiperbárica" e "câmara hiperbárica") têm nota 5 com CTR esperado abaixo da média; o anúncio do
grupo "Câmara hiperbárica · Brasília" está com força "média" e o do "Concorrentes" com força "fraca". Troca só os TÍTULOS dos anúncios
responsivos ligados de 3 grupos (as descrições ficam): Câmara hiperbárica · Brasília, Concorrentes e Asa Sul. 15 títulos cada.
- 1ª posição fixa: a palavra buscada ("hiperbárica"; no Asa Sul, a unidade). Sem grupo novo para a Asa Norte: no Asa Sul entra, solto,
  "Hiperbárica Perto da Asa Norte" (honesto: a unidade é a da L2 Sul, perto).
- 2ª posição fixa: CONVÊNIOS ("Atendemos 50 Convênios", "Consulte Seu Convênio"; a página da unidade diz "50 convênios atendidos").
- Ângulo: o paciente chega querendo MELHORAR e ACELERAR A CICATRIZAÇÃO (pós-operatório de plástica, capilar e parecidos).
  Duas versões, para o Jorge escolher (CFM é aviso: "acelerar" pode soar como promessa):
    sem: "Oxigênio para a Cicatrização" e "Apoio à Cicatrização"
    com: "Acelere a Cicatrização" e "Cicatrização Mais Rápida"
  Aviso também de indicação: pós-operatório em geral não está na lista UHMS e CFM (retalho e enxerto comprometidos estão); o Jorge decide.
Sem preço e sem marca de concorrente (o Google restringe marca de terceiro no texto).

Uso, na pasta da BMH (lê as GOOGLE_ADS_* do .env):
  python3 scripts/google-titulos.py               confere: nota das palavras, anúncios atuais (títulos, força) e os novos, nas duas versões
  python3 scripts/google-titulos.py grava sem     (ou "grava com") guarda a cópia de antes em dados/google-ads-copias/, troca os títulos e lê de volta
Voltar atrás: regravar os títulos da cópia de antes (mesmo comando de mutate, com os textos antigos)."""
import datetime, json, os, sys
import requests

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
os.chdir(RAIZ)
ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#'))
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
VERSAO = sys.argv[2] if len(sys.argv) > 2 else ''
if MODO == 'grava' and VERSAO not in ('com', 'sem', 'ambos'): sys.exit('diga a versão que o Jorge aprovou: grava sem, grava com ou grava ambos')
# ambos (o Jorge, 12/11: "pode" testar as duas): o anúncio atual fica com a versão sem "acelerar" e nasce um 2º anúncio no grupo com a versão com
CID = ENV.get('GOOGLE_ADS_CUSTOMER_ID', '').replace('-', '')
if CID != '5066798424': sys.exit(f'GOOGLE_ADS_CUSTOMER_ID do .env não é a conta da BMH ({CID!r})')

CONV = ['Atendemos 50 Convênios', 'Consulte Seu Convênio']                       # 2ª posição
CICATRIZ = ['Cicatrização no Pós-Operatório', 'Pós-Operatório de Plástica', 'Pós-Cirúrgico e Capilar']
VERSOES = {'sem': ['Oxigênio para a Cicatrização', 'Apoio à Cicatrização'], 'com': ['Acelere a Cicatrização', 'Cicatrização Mais Rápida']}
FIXO_1 = {'Câmara hiperbárica · Brasília': ['Câmara Hiperbárica em Brasília', 'Hiperbárica em Brasília', 'Medicina Hiperbárica Brasília'],
          'Concorrentes': ['Câmara Hiperbárica em Brasília', 'Medicina Hiperbárica Brasília', 'Oxigenoterapia Hiperbárica DF'],
          'Asa Sul': ['Hiperbárica na Asa Sul', 'Câmara Hiperbárica Asa Sul', 'Unidade Asa Sul, na L2 Sul']}
SOLTOS = {'Câmara hiperbárica · Brasília': ['Médico Presente em Cada Sessão', 'Unidades Asa Sul e Taguatinga', 'Feridas que Não Cicatrizam',
                                            'Agende Sua Avaliação Médica', 'Mais de 20 Anos em Brasília'],
          'Concorrentes': ['Médico Presente em Cada Sessão', 'Mais de 20 Anos em Brasília', 'Unidades Asa Sul e Taguatinga', 'Normas do CFM e da SBMH',
                           'Agende Sua Avaliação Médica'],
          'Asa Sul': ['Hiperbárica Perto da Asa Norte', 'SGAS 613, L2 Sul', 'Médico Presente em Cada Sessão', 'Todos os Dias, das 7h às 19h',
                      'Agende Sua Avaliação Médica']}
titulos = lambda g, v: FIXO_1[g] + CONV + CICATRIZ + VERSOES[v] + SOLTOS[g]
TITULOS = {g: titulos(g, 'com' if VERSAO == 'com' else 'sem') for g in FIXO_1}
for g in FIXO_1:
    for v in VERSOES:
        ts = titulos(g, v); assert len(ts) == 15 and len(set(ts)) == 15 and all(len(t) <= 30 for t in ts), (g, v)
fixo = lambda g, t: 'HEADLINE_1' if t in FIXO_1[g] else 'HEADLINE_2' if t in CONV else None

d = json.load(open(ENV['GOOGLE_ADS_OAUTH_CLIENTE'], encoding='utf8')); cli = d.get('installed') or d.get('web')
t = requests.post('https://oauth2.googleapis.com/token', data={'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
                  'refresh_token': ENV['GOOGLE_ADS_REFRESH_TOKEN'], 'grant_type': 'refresh_token'}, timeout=60).json()
if 'access_token' not in t: sys.exit('autorização do Google recusada: ' + str(t.get('error_description') or t.get('error')))
G = {'Authorization': 'Bearer ' + t['access_token'], 'Content-Type': 'application/json'}
if ENV.get('GOOGLE_ADS_DEVELOPER_TOKEN'): G['developer-token'] = ENV['GOOGLE_ADS_DEVELOPER_TOKEN']
if ENV.get('GOOGLE_ADS_LOGIN_CUSTOMER_ID'): G['login-customer-id'] = ENV['GOOGLE_ADS_LOGIN_CUSTOMER_ID'].replace('-', '')
URL = f'https://googleads.googleapis.com/v25/customers/{CID}'


def gaql(q):
    out, pt = [], None
    while True:
        r = requests.post(f'{URL}/googleAds:search', headers=G, data=json.dumps({'query': q, **({'pageToken': pt} if pt else {})}), timeout=60)
        if not r.ok: sys.exit(f'GAQL {r.status_code}: {r.text[:300]}')
        j = r.json(); out += j.get('results', []); pt = j.get('nextPageToken')
        if not pt: return out


# nota das palavras que mais gastam (30 dias), para conferir o motivo
print('== Palavras-chave com mais gasto em 30 dias ==')
for x in sorted(gaql("SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.quality_info.quality_score, "
                     "ad_group_criterion.quality_info.search_predicted_ctr, ad_group_criterion.quality_info.creative_quality_score, "
                     "ad_group_criterion.quality_info.post_click_quality_score, metrics.cost_micros FROM keyword_view WHERE segments.date DURING LAST_30_DAYS "
                     "AND ad_group_criterion.negative = FALSE AND metrics.cost_micros > 0"), key=lambda x: -int(x['metrics']['costMicros']))[:8]:
    c, q = x['adGroupCriterion'], x['adGroupCriterion'].get('qualityInfo', {})
    print(f' R$ {int(x["metrics"]["costMicros"]) / 1e6:8.2f} | {x["adGroup"]["name"]} | "{c["keyword"]["text"]}" ({c["keyword"]["matchType"]}) | nota {q.get("qualityScore", "?")}'
          f' | CTR esperado {q.get("searchPredictedCtr", "?")} | anúncio {q.get("creativeQualityScore", "?")} | página {q.get("postClickQualityScore", "?")}')

# anúncios responsivos ligados dos dois grupos
nomes = ', '.join("'" + g.replace("'", "\\'") + "'" for g in TITULOS)
ads = gaql("SELECT ad_group.name, campaign.name, ad_group_ad.ad.id, ad_group_ad.ad_strength, ad_group_ad.ad.responsive_search_ad.headlines, "
           f"ad_group_ad.ad.responsive_search_ad.descriptions, ad_group_ad.ad.responsive_search_ad.path1, ad_group_ad.ad.responsive_search_ad.path2, "
           f"ad_group_ad.ad.final_urls, ad_group.resource_name FROM ad_group_ad WHERE ad_group.name IN ({nomes}) AND ad_group_ad.status = 'ENABLED' "
           "AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD' AND campaign.status = 'ENABLED' AND ad_group.status = 'ENABLED'")
print(f'\n== {len(ads)} anúncios responsivos ligados nos grupos {list(TITULOS)} ==')
achados = {x['adGroup']['name'] for x in ads}
for g in TITULOS:
    if g not in achados: print(f' ATENÇÃO: nenhum anúncio ligado no grupo "{g}"; nada muda nele')
for x in ads:
    g, a = x['adGroup']['name'], x['adGroupAd']['ad']
    antes = a['responsiveSearchAd'].get('headlines', [])
    print(f'\n {x["campaign"]["name"]} › {g} | anúncio {a["id"]} | força {x["adGroupAd"].get("adStrength")}')
    print('   antes:', ' · '.join(h['text'] + (' [1º]' if h.get('pinnedField') == 'HEADLINE_1' else '') for h in antes))
    for v in VERSOES:
        print(f'   novos ({v} "acelerar"):', ' · '.join(t + {'HEADLINE_1': ' [1º]', 'HEADLINE_2': ' [2º]'}.get(fixo(g, t), '') for t in titulos(g, v)))
if MODO != 'grava': sys.exit('\nconferido. Para trocar, com a versão que o Jorge aprovar: python3 scripts/google-titulos.py grava sem  (ou grava com)')

os.makedirs(os.path.join('dados', 'google-ads-copias'), exist_ok=True)
copia = os.path.join('dados', 'google-ads-copias', f'{datetime.date.today().isoformat()}-titulos-antes.json')
print(f'versão gravada: {VERSAO} "acelerar"')
json.dump(ads, open(copia, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('\ncópia de antes em', copia)
for x in ads:
    g, a = x['adGroup']['name'], x['adGroupAd']['ad']
    novos = [{'text': t, **({'pinnedField': fixo(g, t)} if fixo(g, t) else {})} for t in TITULOS[g]]
    r = requests.post(f'{URL}/ads:mutate', headers=G, data=json.dumps({'operations': [{'update': {'resourceName': f'customers/{CID}/ads/{a["id"]}',
                      'responsiveSearchAd': {'headlines': novos}}, 'updateMask': 'responsive_search_ad.headlines'}]}), timeout=60)
    print(f' {g} | anúncio {a["id"]}:', 'trocado' if r.ok else f'RECUSADO {r.status_code} {r.text[:300]}')
depois = gaql(f"SELECT ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad_strength, ad_group_ad.policy_summary.approval_status, "
              f"ad_group_ad.ad.responsive_search_ad.headlines FROM ad_group_ad WHERE ad_group_ad.ad.id IN ({', '.join(x['adGroupAd']['ad']['id'] for x in ads)})")
for x in depois:
    g, hs = x['adGroup']['name'], x['adGroupAd']['ad']['responsiveSearchAd']['headlines']
    ok = sorted(h['text'] for h in hs) == sorted(TITULOS[g])
    print(f' lido de volta: {g} | {len(hs)} títulos | iguais aos novos: {ok} | força {x["adGroupAd"].get("adStrength")} (pode ficar PENDING) | aprovação {x["adGroupAd"].get("policySummary", {}).get("approvalStatus")}')
if VERSAO == 'ambos':
    for x in ads:
        g, a = x['adGroup']['name'], x['adGroupAd']['ad']; rsa = a['responsiveSearchAd']
        novo = {'adGroup': x['adGroup']['resourceName'], 'status': 'ENABLED', 'ad': {'finalUrls': a['finalUrls'], 'responsiveSearchAd': {
                'headlines': [{'text': t, **({'pinnedField': fixo(g, t)} if fixo(g, t) else {})} for t in titulos(g, 'com')],
                'descriptions': [{k: d[k] for k in ('text', 'pinnedField') if k in d} for d in rsa.get('descriptions', [])],
                **({'path1': rsa['path1']} if rsa.get('path1') else {}), **({'path2': rsa['path2']} if rsa.get('path2') else {})}}}
        r = requests.post(f'{URL}/adGroupAds:mutate', headers=G, data=json.dumps({'operations': [{'create': novo}]}), timeout=60)
        print(f' {g} | 2º anúncio (com "acelerar"):', r.json()['results'][0]['resourceName'] if r.ok else f'RECUSADO {r.status_code} {r.text[:400]}')
    for x in gaql(f"SELECT ad_group.name, ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status, ad_group_ad.ad.responsive_search_ad.headlines "
                  f"FROM ad_group_ad WHERE ad_group.name IN ({nomes}) AND ad_group_ad.status = 'ENABLED' AND campaign.status = 'ENABLED'"):
        hs = [h['text'] for h in x['adGroupAd']['ad']['responsiveSearchAd']['headlines']]
        print(f' lido de volta: {x["adGroup"]["name"]} | anúncio {x["adGroupAd"]["ad"]["id"]} | versão', 'com' if 'Acelere a Cicatrização' in hs else 'sem', '| aprovação', x['adGroupAd'].get('policySummary', {}).get('approvalStatus'))
print('Uma semana depois: comparar CTR e custo por contato dos dois grupos com a semana de antes (Gerente BMH).')
