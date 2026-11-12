"""Grupo "Asa Norte" na campanha [LEADS][PESQUISA] - BMH (decisão do Jorge de 12/11/2026, livro da Central). "hiperbárica asa norte" caía
no grupo Asa Sul (nota 3). O grupo novo tem anúncio honesto: a BMH não tem unidade na Asa Norte; a mais perto é a Asa Sul, na L2 Sul
(SGAS 613), e o anúncio leva à página da Asa Sul (o mesmo endereço final do anúncio do grupo Asa Sul). Convênios aparecem
("50 convênios atendidos", da página da unidade). Sem preço, sem promessa, indicação só da lista.
Ordem, para não haver hora sem anúncio: 1) cria o grupo, as 4 palavras e o anúncio; 2) só então pausa "hiperbárica asa norte" no grupo
Asa Sul e põe "asa norte" (frase) como negativa nele. O grupo novo copia as negativas do Asa Sul (preço e convênio seguem para o
grupo "Valor e convênio"). Orçamento: o da campanha, sem mudança.

Uso, na pasta da BMH (GOOGLE_ADS_* do .env):
  python3 scripts/google-asa-norte.py         confere: a campanha, o grupo Asa Sul (palavras com "asa norte", endereço do anúncio) e o que será criado
  python3 scripts/google-asa-norte.py grava   cópia de antes em dados/google-ads-copias/, cria, pausa, lê de volta
Voltar atrás: pausar o grupo Asa Norte, religar a palavra no Asa Sul e tirar a negativa (os ids saem na tela e na cópia)."""
import datetime, json, os, sys
import requests

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
os.chdir(RAIZ)
ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#'))
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
CID = ENV.get('GOOGLE_ADS_CUSTOMER_ID', '').replace('-', '')
if CID != '5066798424': sys.exit(f'GOOGLE_ADS_CUSTOMER_ID do .env não é a conta da BMH ({CID!r})')
CAMPANHA, GRUPO_ASA_SUL, NOVO = '[LEADS][PESQUISA] - BMH', 'Asa Sul', 'Asa Norte'
PALAVRAS = [('hiperbárica asa norte', 'PHRASE'), ('hiperbárica asa norte', 'EXACT'), ('câmara hiperbárica asa norte', 'PHRASE'), ('câmara hiperbárica asa norte', 'EXACT')]
FIXO_1 = ['Hiperbárica Perto da Asa Norte', 'Oxigenoterapia na L2 Sul']
FIXO_2 = ['Atendemos 50 Convênios']
TITULOS = FIXO_1 + FIXO_2 + ['Unidade Asa Sul, na L2 Sul', 'SGAS 613, L2 Sul', 'Médico Presente em Cada Sessão', 'Consulte Seu Convênio',
    'Todos os Dias, das 7h às 19h', 'Câmaras Monoplace e Multiplace', 'Agende Sua Avaliação Médica', 'Desde 2004 em Brasília',
    'Fale Conosco pelo WhatsApp', 'Feridas que Não Cicatrizam', 'Retalhos e Enxertos', 'Lesões por Radioterapia']
DESCRICOES = ['Unidade Asa Sul da BMH, na L2 Sul (SGAS 613), perto da Asa Norte. Médico em cada sessão.',
              'Atendemos 50 convênios e a recepção confere o seu plano. Agende pelo WhatsApp.',
              'Câmaras monoplace e multiplace, todos os dias das 7h às 19h. Indicação após avaliação.']
assert len(TITULOS) == 15 == len(set(TITULOS)) and all(len(t) <= 30 for t in TITULOS) and all(len(d) <= 90 for d in DESCRICOES)

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


def muda(servico, ops):
    r = requests.post(f'{URL}/{servico}:mutate', headers=G, data=json.dumps({'operations': ops}), timeout=60)
    if not r.ok: sys.exit(f'PAROU em {servico}: {r.status_code} {r.text[:400]}')
    return [x['resourceName'] for x in r.json().get('results', [])]


camp = gaql(f"SELECT campaign.id, campaign.resource_name FROM campaign WHERE campaign.name = '{CAMPANHA}' AND campaign.status = 'ENABLED'")
if len(camp) != 1: sys.exit(f'achei {len(camp)} campanhas ligadas com o nome {CAMPANHA!r}')
camp_rn = camp[0]['campaign']['resourceName']
grupos = {x['adGroup']['name']: x['adGroup'] for x in gaql(f"SELECT ad_group.name, ad_group.resource_name, ad_group.status FROM ad_group "
          f"WHERE campaign.resource_name = '{camp_rn}' AND ad_group.status != 'REMOVED'")}
if NOVO in grupos: sys.exit(f'o grupo "{NOVO}" já existe ({grupos[NOVO]["resourceName"]}, {grupos[NOVO]["status"]}): conferir antes de criar outro')
if GRUPO_ASA_SUL not in grupos: sys.exit(f'não achei o grupo "{GRUPO_ASA_SUL}"')
asa_rn = grupos[GRUPO_ASA_SUL]['resourceName']
kws = gaql(f"SELECT ad_group_criterion.resource_name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, "
           f"ad_group_criterion.negative FROM ad_group_criterion WHERE ad_group.resource_name = '{asa_rn}' AND ad_group_criterion.type = 'KEYWORD' "
           "AND ad_group_criterion.status != 'REMOVED'")
alvo = [k['adGroupCriterion'] for k in kws if not k['adGroupCriterion'].get('negative') and 'asa norte' in k['adGroupCriterion']['keyword']['text'].lower()
        and k['adGroupCriterion']['status'] == 'ENABLED']
ja_neg = any(k['adGroupCriterion'].get('negative') and k['adGroupCriterion']['keyword']['text'].lower() == 'asa norte' for k in kws)
ad = gaql(f"SELECT ad_group_ad.ad.final_urls, ad_group_ad.ad.final_url_suffix, ad_group_ad.ad.responsive_search_ad.path1, "
          f"ad_group_ad.ad.responsive_search_ad.path2 FROM ad_group_ad WHERE ad_group.resource_name = '{asa_rn}' AND ad_group_ad.status = 'ENABLED' "
          "AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'")
if not ad: sys.exit('o grupo Asa Sul não tem anúncio responsivo ligado para copiar o endereço')
a0 = ad[0]['adGroupAd']['ad']; urls = a0.get('finalUrls', [])
if not urls or 'asa-sul' not in urls[0]: sys.exit(f'o endereço do anúncio da Asa Sul não é a página da Asa Sul ({urls}); conferir')
print(f'campanha {CAMPANHA} | grupo {GRUPO_ASA_SUL}: {len(kws)} palavras; com "asa norte" ligadas: {[(k["keyword"]["text"], k["keyword"]["matchType"]) for k in alvo]}'
      f' | negativa "asa norte" já existe: {ja_neg}')
print(f'anúncio novo leva a: {urls[0]} | sufixo: {a0.get("finalUrlSuffix", "(nenhum)")} | caminho: {a0["responsiveSearchAd"].get("path1", "")}/{a0["responsiveSearchAd"].get("path2", "")}')
print('palavras do grupo novo:', PALAVRAS)
print('negativas que o grupo novo copia do Asa Sul:', [k['adGroupCriterion']['keyword']['text'] for k in kws if k['adGroupCriterion'].get('negative') and k['adGroupCriterion']['keyword']['text'].lower() != 'asa norte'])
print('títulos:', ' · '.join(t + (' [1º]' if t in FIXO_1 else ' [2º]' if t in FIXO_2 else '') for t in TITULOS))
print('descrições:', *DESCRICOES, sep='\n  ')
if MODO != 'grava': sys.exit('\nconferido. Para criar: python3 scripts/google-asa-norte.py grava')

os.makedirs(os.path.join('dados', 'google-ads-copias'), exist_ok=True)
copia = os.path.join('dados', 'google-ads-copias', f'{datetime.date.today().isoformat()}-asa-norte-antes.json')
json.dump({'palavras_asa_sul': kws, 'anuncio_asa_sul': ad}, open(copia, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('\ncópia de antes em', copia)
g_rn = muda('adGroups', [{'create': {'name': NOVO, 'campaign': camp_rn, 'status': 'ENABLED', 'type': 'SEARCH_STANDARD'}}])[0]
print('grupo criado:', g_rn)
print('palavras:', muda('adGroupCriteria', [{'create': {'adGroup': g_rn, 'status': 'ENABLED', 'keyword': {'text': t, 'matchType': m}}} for t, m in PALAVRAS]))
# as mesmas negativas do grupo Asa Sul (preço e convênio vão para o grupo "Valor e convênio"), menos a "asa norte"
negs = [k['adGroupCriterion']['keyword'] for k in kws if k['adGroupCriterion'].get('negative') and k['adGroupCriterion']['keyword']['text'].lower() != 'asa norte']
if negs: print(f'negativas copiadas do Asa Sul ({len(negs)}):', len(muda('adGroupCriteria', [{'create': {'adGroup': g_rn, 'negative': True,
             'keyword': {'text': k['text'], 'matchType': k['matchType']}}} for k in negs])))
rsa = {'headlines': [{'text': t, **({'pinnedField': 'HEADLINE_1'} if t in FIXO_1 else {'pinnedField': 'HEADLINE_2'} if t in FIXO_2 else {})} for t in TITULOS],
       'descriptions': [{'text': x} for x in DESCRICOES], 'path1': a0['responsiveSearchAd'].get('path1', ''), 'path2': a0['responsiveSearchAd'].get('path2', '')}
anuncio = {'finalUrls': urls, 'responsiveSearchAd': {k: v for k, v in rsa.items() if v}, **({'finalUrlSuffix': a0['finalUrlSuffix']} if a0.get('finalUrlSuffix') else {})}
print('anúncio:', muda('adGroupAds', [{'create': {'adGroup': g_rn, 'status': 'ENABLED', 'ad': anuncio}}]))
if alvo: print('pausadas no Asa Sul:', muda('adGroupCriteria', [{'update': {'resourceName': k['resourceName'], 'status': 'PAUSED'}, 'updateMask': 'status'} for k in alvo]))
if not ja_neg: print('negativa no Asa Sul:', muda('adGroupCriteria', [{'create': {'adGroup': asa_rn, 'negative': True, 'keyword': {'text': 'asa norte', 'matchType': 'PHRASE'}}}]))
novo = gaql(f"SELECT ad_group.status, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status FROM ad_group_criterion "
            f"WHERE ad_group.resource_name = '{g_rn}' AND ad_group_criterion.type = 'KEYWORD'")
an = gaql(f"SELECT ad_group_ad.status, ad_group_ad.ad_strength, ad_group_ad.policy_summary.approval_status FROM ad_group_ad WHERE ad_group.resource_name = '{g_rn}'")
print(f'\nlido de volta: grupo {NOVO} com {len(novo)} palavras | anúncio {[(x["adGroupAd"]["status"], x["adGroupAd"].get("adStrength"), x["adGroupAd"].get("policySummary", {}).get("approvalStatus")) for x in an]}')
print('Uma semana depois: comparar a busca "asa norte" (custo por contato) no grupo novo com o que ela fazia no Asa Sul (Gerente BMH).')
