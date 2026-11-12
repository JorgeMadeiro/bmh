"""Títulos novos nos anúncios de pesquisa da BMH (pedido do Jorge de 12/11/2026, livro da Central commit daad21a: "pode ajustar").
As duas palavras-chave que mais gastam ("hiperbárica" e "câmara hiperbárica") têm nota 5 com CTR esperado abaixo da média; o anúncio do
grupo "Câmara hiperbárica · Brasília" está com força "média" e o do "Concorrentes" com força "fraca". Troca só os TÍTULOS dos anúncios
responsivos ligados desses dois grupos (as descrições ficam): 15 títulos, 3 deles fixos na 1ª posição, todos com a palavra buscada.
Regras da pasta: sem preço, sem promessa, indicação só da lista UHMS e CFM, nenhuma marca de concorrente (o Google restringe marca de
terceiro no texto), CFM como aviso ("Clínica pioneira" ficou de fora por isso).

Uso, na pasta da BMH (lê as GOOGLE_ADS_* do .env, como o aplica-bmh-mac.py):
  python3 scripts/google-titulos.py          confere: nota das palavras, anúncios atuais (títulos, força) e os títulos novos, lado a lado
  python3 scripts/google-titulos.py grava    guarda a cópia de antes em dados/google-ads-copias/ e troca os títulos; lê de volta
Voltar atrás: regravar os títulos da cópia de antes (mesmo comando de mutate, com os textos antigos)."""
import datetime, json, os, sys
import requests

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
os.chdir(RAIZ)
ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#'))
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
CID = ENV.get('GOOGLE_ADS_CUSTOMER_ID', '').replace('-', '')
if CID != '5066798424': sys.exit(f'GOOGLE_ADS_CUSTOMER_ID do .env não é a conta da BMH ({CID!r})')

FIXOS = ['Câmara Hiperbárica em Brasília', 'Hiperbárica em Brasília', 'Medicina Hiperbárica Brasília']
TITULOS = {
    'Câmara hiperbárica · Brasília': FIXOS + ['Médico Presente em Cada Sessão', 'Unidades Asa Sul e Taguatinga', 'Agende Sua Avaliação Médica',
        'Mais de 20 Anos em Brasília', 'Normas do CFM e da SBMH', 'Fale Conosco pelo WhatsApp', 'Feridas que Não Cicatrizam', 'Retalhos e Enxertos',
        'Lesões por Radioterapia', 'Pé Diabético e Osteomielite', 'Equipe Médica e Enfermagem', 'Avaliação Antes do Tratamento'],
    'Concorrentes': ['Câmara Hiperbárica em Brasília', 'Medicina Hiperbárica Brasília', 'Oxigenoterapia Hiperbárica DF', 'Médico Presente em Cada Sessão',
        'Mais de 20 Anos em Brasília', 'Unidades Asa Sul e Taguatinga', 'Normas do CFM e da SBMH', 'Equipe Médica e Enfermagem', 'Protocolos de Segurança',
        'Agende Sua Avaliação Médica', 'Fale Conosco pelo WhatsApp', 'Avaliação Antes do Tratamento', 'Feridas que Não Cicatrizam', 'Retalhos e Enxertos',
        'Lesões por Radioterapia'],
}
FIXO_1 = {'Câmara hiperbárica · Brasília': set(FIXOS), 'Concorrentes': {'Câmara Hiperbárica em Brasília', 'Medicina Hiperbárica Brasília', 'Oxigenoterapia Hiperbárica DF'}}
for g, ts in TITULOS.items():
    assert len(ts) == 15 and len(set(ts)) == 15 and all(len(t) <= 30 for t in ts), g

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
           f"ad_group_ad.ad.responsive_search_ad.descriptions FROM ad_group_ad WHERE ad_group.name IN ({nomes}) AND ad_group_ad.status = 'ENABLED' "
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
    print('   novos:', ' · '.join(t + (' [1º]' if t in FIXO_1[g] else '') for t in TITULOS[g]))
if MODO != 'grava': sys.exit('\nconferido. Para trocar: python3 scripts/google-titulos.py grava')

os.makedirs(os.path.join('dados', 'google-ads-copias'), exist_ok=True)
copia = os.path.join('dados', 'google-ads-copias', f'{datetime.date.today().isoformat()}-titulos-antes.json')
json.dump(ads, open(copia, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('\ncópia de antes em', copia)
for x in ads:
    g, a = x['adGroup']['name'], x['adGroupAd']['ad']
    novos = [{'text': t, **({'pinnedField': 'HEADLINE_1'} if t in FIXO_1[g] else {})} for t in TITULOS[g]]
    r = requests.post(f'{URL}/ads:mutate', headers=G, data=json.dumps({'operations': [{'update': {'resourceName': f'customers/{CID}/ads/{a["id"]}',
                      'responsiveSearchAd': {'headlines': novos}}, 'updateMask': 'responsive_search_ad.headlines'}]}), timeout=60)
    print(f' {g} | anúncio {a["id"]}:', 'trocado' if r.ok else f'RECUSADO {r.status_code} {r.text[:300]}')
depois = gaql(f"SELECT ad_group.name, ad_group_ad.ad.id, ad_group_ad.ad_strength, ad_group_ad.policy_summary.approval_status, "
              f"ad_group_ad.ad.responsive_search_ad.headlines FROM ad_group_ad WHERE ad_group_ad.ad.id IN ({', '.join(x['adGroupAd']['ad']['id'] for x in ads)})")
for x in depois:
    g, hs = x['adGroup']['name'], x['adGroupAd']['ad']['responsiveSearchAd']['headlines']
    ok = sorted(h['text'] for h in hs) == sorted(TITULOS[g])
    print(f' lido de volta: {g} | {len(hs)} títulos | iguais aos novos: {ok} | força {x["adGroupAd"].get("adStrength")} (pode ficar PENDING) | aprovação {x["adGroupAd"].get("policySummary", {}).get("approvalStatus")}')
print('Uma semana depois: comparar CTR e custo por contato dos dois grupos com a semana de antes (Gerente BMH).')
