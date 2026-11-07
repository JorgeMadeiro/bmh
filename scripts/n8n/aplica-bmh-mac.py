"""Pedidos da BMH aprovados pelo Jorge no porteiro, para o Mac aplicar de uma vez (montado pelo Gerente BMH em 07/11/2026). A VPS não
grava nesses fluxos nem na BMH_config, e não tem a chave do Google Ads.
  117  agenda diária sem falha calada: "Produção Diaria e Mensal BMH" (EkmBucG5LoEutBUa), 45 para 54 nós
  138  números do Meta com vigia e batimento (0FskpyELgh7nBqF0) e a cópia do resumo das 8h atualizada (UUYRg6GlEOlupbnW); junto,
       a correção da verba do Meta de 05/11 (o "não cobrado" não se tira do saldo) no 0Fsk e no guardião Meta (K4UckCbHkrqr8sc6)
  136  relatório mensal da diretoria (fvEYln7d2wWi4N2S): envio pelo servidor de afiliados e a linha do ano anterior. Depois de
       gravar, manda a PRÉVIA de outubro só ao Telegram do Jorge. O reenvio ao grupo da diretoria é outro comando: "reenvia"
  116  chaves da BMH_config: meta_teto_mes_2026-11 = 60 e meta_teto_mes = 0
  132  seis negativas de frase na campanha [LEADS][PESQUISA] - BMH, inclusive "fibromialgia" (129, 130 e 131 estão em
       "revisar": não entram)
Cada fluxo só é gravado se ainda estiver na versão de que o arquivo partiu (updatedAt abaixo). Se mudou, aquele item fica de fora
e os outros seguem. Antes de gravar, cópia em dados/n8n-copias/ (fora do git); depois, leitura de volta.

Uso, na pasta da BMH (lê N8N_URL, N8N_API_KEY e as GOOGLE_ADS_* do .env):
  python3 scripts/n8n/aplica-bmh-mac.py            só confere, não grava nada
  python3 scripts/n8n/aplica-bmh-mac.py grava      grava o que estiver em ordem e manda a prévia do mensal ao Telegram do Jorge
  python3 scripts/n8n/aplica-bmh-mac.py reenvia    só depois de o Jorge conferir a prévia: manda o relatório de outubro ao grupo
                                                   da diretoria"""
import datetime, json, os, subprocess, sys
import requests

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
os.chdir(RAIZ)
ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#'))
U, H = ENV['N8N_URL'].rstrip('/'), {'X-N8N-API-KEY': ENV['N8N_API_KEY'], 'Content-Type': 'application/json'}
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
if MODO not in ('confere', 'grava', 'reenvia'): sys.exit('uso: aplica-bmh-mac.py [grava|reenvia]')
HOJE = datetime.date.today().isoformat()
COPIAS = os.path.join('dados', 'n8n-copias'); os.makedirs(COPIAS, exist_ok=True)
OK = ('executionOrder', 'saveDataErrorExecution', 'saveDataSuccessExecution', 'saveManualExecutions', 'saveExecutionProgress',
      'executionTimeout', 'errorWorkflow', 'timezone', 'callerPolicy')
MENSAL, MENSAL_UP = 'fvEYln7d2wWi4N2S', '2026-10-15T20:52:00.519Z'
MENSAL_ARQ = os.path.join(COPIAS, f'{MENSAL}-conserto-136-e-ano-anterior.json')
FLUXOS = [  # (pedido, id, updatedAt de que o arquivo partiu, arquivo)
    ('117', 'EkmBucG5LoEutBUa', '2026-10-09T15:51:32.683Z', 'scripts/n8n/bmh-producao-diaria-conserto.json'),
    ('138', '0FskpyELgh7nBqF0', '2026-10-21T09:25:02.939Z', 'scripts/n8n/bmh-meta-numeros-dia.json'),
    ('138', 'UUYRg6GlEOlupbnW', '2026-10-21T00:59:35.660Z', 'scripts/n8n/bmh-resumo-manha-homologacao.json'),
    ('138', 'K4UckCbHkrqr8sc6', '2026-11-01T17:20:06.074Z', 'scripts/n8n/bmh-meta-guardiao.json'),
]
RESUMO_PROD, RESUMO_PROD_UP = 'QGDceUjADbnNINb3', '2026-11-04T00:03:29.352Z'   # a cópia do 138 foi montada desta versão
CONFIG = 'V4NRHS9mc1kvigix'
CHAVES = {'meta_teto_mes_2026-11': '60', 'meta_teto_mes': '0'}
NEGATIVAS = ['estetica', 'estética', 'antes e depois', 'ozônio', 'caneta', 'fibromialgia']
CAMPANHA = '[LEADS][PESQUISA] - BMH'

le = lambda i: requests.get(f'{U}/api/v1/workflows/{i}', headers=H, timeout=60).json()
params = lambda nos: {x['name']: json.dumps(x['parameters'], sort_keys=True) for x in nos}
problemas = []


def grava_fluxo(ped, i, atual, f):
    json.dump(atual, open(os.path.join(COPIAS, f'{i}-{HOJE}-antes-{ped}.json'), 'w', encoding='utf8'), ensure_ascii=False)
    corpo = {'name': atual['name'], 'nodes': f['nodes'], 'connections': f['connections'],
             'settings': {k: v for k, v in (f.get('settings') or {}).items() if k in OK}}
    corpo['settings']['errorWorkflow'] = (atual.get('settings') or {}).get('errorWorkflow') or corpo['settings'].get('errorWorkflow')
    r = requests.put(f'{U}/api/v1/workflows/{i}', headers=H, data=json.dumps(corpo), timeout=60)
    if not r.ok: problemas.append(f'{ped} {i}: PUT recusado ({r.status_code}) {r.text[:200]}'); return
    lido = le(i)
    igual = params(lido['nodes']) == params(f['nodes']) and lido['connections'] == f['connections']
    print(f'   gravado {ped} {i} {lido["updatedAt"]} | {len(lido["nodes"])} nós | lido de volta igual: {igual} | ativo: {lido.get("active")}'
          f' (antes: {atual.get("active")}) | errorWorkflow: {lido["settings"].get("errorWorkflow")}')
    if not igual: problemas.append(f'{ped} {i}: o lido de volta não bate com o arquivo; conferir')


# ---------- reenvio do mensal ao grupo da diretoria (só com "reenvia") ----------
if MODO == 'reenvia':
    f = le(MENSAL); w = next(n for n in f['nodes'] if n['name'] == 'WhatsApp · grupo da diretoria')
    if 'apiwp-afiliados' not in w['parameters'].get('url', ''): sys.exit('o 136 ainda não foi gravado (o envio aponta para o servidor antigo): rodar "grava" antes')
    r = requests.get(f'{U}/webhook/bmh-producao-mes', params={'mes': '2026-10', 'grupo': '1'}, timeout=300)
    print('reenvio de outubro ao grupo da diretoria: HTTP', r.status_code, '(conferir na BMH_falhas que não entrou linha nova)')
    sys.exit(0)

# ---------- 117 e 138: fluxos montados pelo Gerente BMH ----------
print('== Fluxos (117, 138) ==')
rp = le(RESUMO_PROD)
if rp['updatedAt'] != RESUMO_PROD_UP:
    problemas.append(f'138: o resumo de produção ({RESUMO_PROD}) mudou ({rp["updatedAt"]}); a cópia UUYR fica de fora. Pedir ao Gerente BMH para remontar')
for ped, i, up, arq in FLUXOS:
    atual = le(i); f = json.load(open(arq, encoding='utf8'))
    em_ordem = atual['updatedAt'] == up and not (i == 'UUYRg6GlEOlupbnW' and rp['updatedAt'] != RESUMO_PROD_UP)
    print(f' {ped} {atual["name"]} | produção {atual["updatedAt"]} | {len(atual["nodes"])} para {len(f["nodes"])} nós |',
          'ok' if em_ordem else f'MUDOU (esperado {up}): fica de fora')
    if not em_ordem:
        if atual['updatedAt'] != up: problemas.append(f'{ped} {i}: mudou desde a montagem; nada gravado. Pedir ao Gerente BMH para remontar')
        continue
    if i == 'EkmBucG5LoEutBUa':
        esperando = requests.get(f'{U}/api/v1/executions', headers=H, params={'workflowId': i, 'status': 'waiting', 'limit': 5}, timeout=60).json().get('data', [])
        if esperando:
            print('   há execução em espera (a agenda das 17h está rodando): não gravo agora; rodar de novo depois do fim das sessões')
            problemas.append('117: execução em espera; rodar de novo mais tarde'); continue
    if MODO == 'grava': grava_fluxo(ped, i, atual, f)

# ---------- 136: relatório mensal da diretoria ----------
print('\n== Relatório mensal (136) ==')
atual = le(MENSAL)
print(f' {atual["name"]} | produção {atual["updatedAt"]} |', 'ok' if atual['updatedAt'] == MENSAL_UP else f'MUDOU (esperado {MENSAL_UP})')
if atual['updatedAt'] != MENSAL_UP:
    problemas.append('136: o fluxo mudou desde a leitura do Gerente BMH; conferir o que mudou antes de remontar')
else:
    s = subprocess.run([sys.executable, 'scripts/n8n/monta-mensal-conserto.py'], env={**os.environ, 'N8N_URL': U, 'N8N_API_KEY': ENV['N8N_API_KEY']},
                       capture_output=True, text=True)
    print('  ', (s.stdout or s.stderr).strip()[:300])
    if s.returncode != 0: problemas.append('136: o montador parou: ' + (s.stderr or s.stdout).strip()[:200])
    elif MODO == 'grava':
        grava_fluxo('136', MENSAL, atual, json.load(open(MENSAL_ARQ, encoding='utf8')))
        r = requests.get(f'{U}/webhook/bmh-producao-mes', params={'mes': '2026-10'}, timeout=300)   # sem "grupo": só ao Telegram do Jorge
        print(f'   prévia de outubro mandada ao Telegram do Jorge: HTTP {r.status_code}. Se o texto estiver certo (com a linha "vs outubro/2025"),'
              ' o reenvio ao grupo é: python3 scripts/n8n/aplica-bmh-mac.py reenvia')
        if not r.ok: problemas.append(f'136: a prévia respondeu HTTP {r.status_code}; ver a BMH_falhas')

# ---------- 116: chaves do Meta na BMH_config (a API do n8n insere linha, mas não altera) ----------
print('\n== BMH_config (116) ==')
linhas, cursor, lida = [], None, True
while True:
    r = requests.get(f'{U}/api/v1/data-tables/{CONFIG}/rows', headers=H, params={'limit': 250, **({'cursor': cursor} if cursor else {})}, timeout=60)
    j = r.json() if r.ok else {}
    if not isinstance(j.get('data'), list): lida = False; break   # sem leitura, não grava: inserir às cegas duplicaria a chave
    linhas += j['data']; cursor = j.get('nextCursor')
    if not cursor: break
if not lida:
    print(f' não consegui ler a BMH_config (HTTP {r.status_code}): nada gravado'); problemas.append('116: BMH_config não foi lida; chaves não gravadas')
cfg = {l.get('chave'): l.get('valor') for l in linhas}
if lida: print(' teto do Google, teto_mes_2026-11:', cfg.get('teto_mes_2026-11', '(não existe)'), '| teto_mes:', cfg.get('teto_mes', '(não existe)'), '(não mexo)')
for k, v in (CHAVES.items() if lida else []):
    if k in cfg:
        print(f' {k} já existe = {cfg[k]!r}', '(ok)' if str(cfg[k]).strip() == v else f'(DIFERENTE de {v!r}: trocar na tela do n8n)')
        if str(cfg[k]).strip() != v: problemas.append(f'116: {k} já existe com {cfg[k]!r}; trocar para {v!r} na tela')
    elif MODO == 'grava':
        r = requests.post(f'{U}/api/v1/data-tables/{CONFIG}/rows', headers=H, data=json.dumps({'data': [{'chave': k, 'valor': v}]}), timeout=60)
        print(f' {k} = {v}: gravada' if r.ok else f' {k}: recusada ({r.status_code}) {r.text[:150]}')
        if not r.ok: problemas.append(f'116: {k} não gravou')
    else: print(f' {k} = {v}: falta (grava no "grava")')

# ---------- 132: negativas da campanha no Google Ads ----------
print('\n== Google Ads, negativas da campanha (132) ==')
CID = ENV.get('GOOGLE_ADS_CUSTOMER_ID', '').replace('-', '')
try:
    if CID != '5066798424': raise RuntimeError(f'GOOGLE_ADS_CUSTOMER_ID do .env não é a conta da BMH ({CID!r})')
    d = json.load(open(ENV['GOOGLE_ADS_OAUTH_CLIENTE'], encoding='utf8')); cli = d.get('installed') or d.get('web')
    t = requests.post('https://oauth2.googleapis.com/token', data={'client_id': cli['client_id'], 'client_secret': cli['client_secret'],
                      'refresh_token': ENV['GOOGLE_ADS_REFRESH_TOKEN'], 'grant_type': 'refresh_token'}, timeout=60).json()
    if 'access_token' not in t: raise RuntimeError('autorização do Google recusada: ' + str(t.get('error_description') or t.get('error')))
    G = {'Authorization': 'Bearer ' + t['access_token'], 'Content-Type': 'application/json'}
    if ENV.get('GOOGLE_ADS_DEVELOPER_TOKEN'): G['developer-token'] = ENV['GOOGLE_ADS_DEVELOPER_TOKEN']
    if ENV.get('GOOGLE_ADS_LOGIN_CUSTOMER_ID'): G['login-customer-id'] = ENV['GOOGLE_ADS_LOGIN_CUSTOMER_ID'].replace('-', '')
    def gaql(q):
        out, pt = [], None
        while True:
            r = requests.post(f'https://googleads.googleapis.com/v25/customers/{CID}/googleAds:search', headers=G, data=json.dumps({'query': q, **({'pageToken': pt} if pt else {})}), timeout=60)
            if not r.ok: raise RuntimeError(f'GAQL {r.status_code}: {r.text[:300]}')
            j = r.json(); out += j.get('results', []); pt = j.get('nextPageToken')
            if not pt: return out
    camps = gaql(f"SELECT campaign.id, campaign.name FROM campaign WHERE campaign.name = '{CAMPANHA}' AND campaign.status != 'REMOVED'")
    if len(camps) != 1: raise RuntimeError(f'achei {len(camps)} campanhas com o nome {CAMPANHA!r}; esperado 1')
    camp = camps[0]['campaign']['id']
    q_neg = (f"SELECT campaign_criterion.criterion_id, campaign_criterion.keyword.text, campaign_criterion.keyword.match_type FROM campaign_criterion "
             f"WHERE campaign.id = {camp} AND campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'")
    antes = gaql(q_neg)
    tem = {(x['campaignCriterion']['keyword']['text'].lower(), x['campaignCriterion']['keyword']['matchType']) for x in antes}
    faltam = [n for n in NEGATIVAS if (n.lower(), 'PHRASE') not in tem]
    print(f' campanha {camp} | {len(antes)} negativas hoje | já existem: {[n for n in NEGATIVAS if n not in faltam]} | faltam: {faltam}')
    if faltam and MODO == 'grava':
        os.makedirs(os.path.join('dados', 'google-ads-copias'), exist_ok=True)
        json.dump(antes, open(os.path.join('dados', 'google-ads-copias', f'{HOJE}-antes-132.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        ops = [{'create': {'campaign': f'customers/{CID}/campaigns/{camp}', 'negative': True, 'keyword': {'text': n, 'matchType': 'PHRASE'}}} for n in faltam]
        r = requests.post(f'https://googleads.googleapis.com/v25/customers/{CID}/campaignCriteria:mutate', headers=G,
                          data=json.dumps({'operations': ops, 'partialFailure': True}), timeout=60)
        j = r.json() if r.content else {}
        if not r.ok: raise RuntimeError(f'mutate {r.status_code}: {json.dumps(j)[:300]}')
        if j.get('partialFailureError'): problemas.append('132: parte não entrou: ' + json.dumps(j['partialFailureError'])[:300])
        depois = gaql(q_neg)
        tem = {(x['campaignCriterion']['keyword']['text'].lower(), x['campaignCriterion']['keyword']['matchType']) for x in depois}
        criadas = [x.get('resourceName') for x in j.get('results', []) if x.get('resourceName')]
        print(f'   gravadas; lido de volta: {len(depois)} negativas | as seis presentes: {all((n.lower(), "PHRASE") in tem for n in NEGATIVAS)}'
              f' | ids criados (para voltar atrás, remove): {criadas}')
except Exception as e:
    print(' parou:', str(e)[:300]); problemas.append('132: ' + str(e)[:200])

print('\nProblemas:' if problemas else '\nProblemas: nenhum')
for p in problemas: print(' -', p)
if MODO == 'confere': print('\nSó conferido. Para gravar: python3 scripts/n8n/aplica-bmh-mac.py grava')
else: print('\nMande à Central e ao Gerente BMH os updatedAt acima e os Problemas. Teste do 117 (aviso de envio): a Central liga o vRz3ZLhBjasmqXqc.')
