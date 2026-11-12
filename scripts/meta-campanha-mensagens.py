"""Campanha de mensagem no WhatsApp da BMH no Meta (decisão do Jorge de 12/11/2026). Plano: saidas/meta-campanha-mensagens-2026-11-12.md.
A campanha nasce PAUSADA; conjunto e anúncios nascem ligados dentro dela, então nada gasta até a campanha ser ligada, e ligar é um
passo só ("ativa"), que exige o Aprovar do Jorge no porteiro.

Uso, na pasta da BMH (lê META_ADS_TOKEN do .env):
  python3 scripts/meta-campanha-mensagens.py          confere: conta, página com WhatsApp, os posts do lote (com o link), região do DF
  python3 scripts/meta-campanha-mensagens.py cria     cria a campanha PAUSADA com 1 conjunto de R$ 20 e o 1º post da lista (o resto fica de
                                                      reserva); cada passo é validado na Meta (validate_only) antes de criar; grava os ids
                                                      em dados/meta/campanha-mensagens-ids.json
  python3 scripts/meta-campanha-mensagens.py cria teste   idem, mas 1 conjunto de R$ 20 por post (teste de 3, R$ 120 em 2 dias): só com o "pode"
  python3 scripts/meta-campanha-mensagens.py ativa    só com o Aprovar do Jorge no porteiro: liga a campanha e lê de volta
Teste sem token (VPS): META_BASE=http://cofre:8080/meta-bmh/v26.0 python3 scripts/meta-campanha-mensagens.py  (só o confere)."""
import json, os, sys
import requests

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
os.chdir(RAIZ)
BASE = os.environ.get('META_BASE', 'https://graph.facebook.com/v26.0').rstrip('/')
TOKEN = None
if 'META_BASE' not in os.environ:
    ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#'))
    TOKEN = ENV['META_ADS_TOKEN']
CONTA, PAGINA, IG = 'act_327952129944258', '622093514556929', '17841408031661983'
NOME = 'BMH · Mensagens WhatsApp · nov/2026'
DIARIO_CENTAVOS = 2000                       # R$ 20 por dia
# Estoque de criativos (saidas/estoque-criativos-2026-11.md; regra do Jorge de 12/11, ajustada no mesmo dia). Padrão, sem verba a
# mais: 1 conjunto de R$ 20 com o 1º post da lista; os outros ficam de reserva e entram, quando ele cansar, como 2º anúncio no MESMO
# conjunto. "cria teste": 1 conjunto de R$ 20 por post (3 candidatos, 2 dias, R$ 120), só com o "pode" do Jorge. Troque aqui antes do
# "cria" se ele escolher outro.
POSTS = {'Presença médica': '17957942034010332',      # instagram.com/p/DRhc0iyjVk3 (26/11/25, nota 4,92)
         'Feridas e isquemia': '17901900165315111',   # instagram.com/reel/DRRr6JnikZm (20/11/25, nota 2,7; tirar as hashtags da legenda antes)
         'Pós-operatório': '18212940244325800'}       # instagram.com/reel/DXPfXQ2EQ_4 (17/04/26, nota 2,86; aviso de indicação)
# reservas, se o Jorge tirar um: 'Sair da câmara' 18110349737293529 (reel/DagxUivRtyb, 1,93); 'Avião sem piloto' 18089634056567776 (1,64)
IDS = os.path.join('dados', 'meta', 'campanha-mensagens-ids.json')
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
TESTE = len(sys.argv) > 2 and sys.argv[2] == 'teste'
if MODO not in ('confere', 'cria', 'ativa'): sys.exit('uso: meta-campanha-mensagens.py [cria [teste]|ativa]')


def chama(metodo, caminho, **dados):
    p = {k: (json.dumps(v) if isinstance(v, (dict, list)) else v) for k, v in dados.items()}
    if TOKEN: p['access_token'] = TOKEN
    r = requests.get(f'{BASE}/{caminho}', params=p, timeout=60) if metodo == 'GET' else requests.post(f'{BASE}/{caminho}', data=p, timeout=60)
    j = r.json() if r.content else {}
    if not r.ok or 'error' in j:
        e = j.get('error', j); raise RuntimeError(f'{metodo} {caminho}: {e.get("message", e)} {e.get("error_user_msg", "")}'.strip()[:400])
    return j


def valida_e_cria(caminho, **dados):
    chama('POST', caminho, execution_options=['validate_only'], **dados)
    return chama('POST', caminho, **dados)['id']


# ---------- confere ----------
c = chama('GET', CONTA, fields='account_status,currency,spend_cap,amount_spent,funding_source_details')
limite = (int(c['spend_cap']) - int(c['amount_spent'])) / 100 if c.get('spend_cap') else None
print(f'conta: situação {c["account_status"]} ({"ativa" if c["account_status"] == 1 else "NÃO ATIVA"}) | {c.get("currency")} | limite restante R$ {limite}'
      f' | {(c.get("funding_source_details") or {}).get("display_string", "")}')
pg = chama('GET', PAGINA, fields='name,whatsapp_number')
zap = pg.get('whatsapp_number')
print(f'página: {pg.get("name")} | WhatsApp ligado: {"sim" if zap else "NÃO APARECE (ligar no Business Suite: Configurações, Contas vinculadas, WhatsApp)"}')
for nome, mid in POSTS.items():
    m = chama('GET', mid, fields='id,media_type,media_product_type,permalink,timestamp')
    print(f'post "{nome}": {m.get("media_product_type")} {m.get("media_type")} de {str(m.get("timestamp"))[:10]} | ver o vídeo (paciente na câmara só com autorização): {m.get("permalink")}')
try:
    geo = chama('GET', 'search', type='adgeolocation', location_types=['region'], q='Distrito Federal', country_code='BR').get('data', [])
    df = next((g for g in geo if g.get('name') == 'Distrito Federal' and g.get('country_code') == 'BR'), None)
except RuntimeError as e:
    df = None; print('região: busca recusada', str(e)[:120])
print('região:', f'Distrito Federal, chave {df["key"]}' if df else 'NÃO ACHEI a chave do Distrito Federal')
if MODO == 'confere':
    sys.exit('\nconferido. Criar pausada: python3 scripts/meta-campanha-mensagens.py cria')

# ---------- ativa (só com o Aprovar do Jorge) ----------
if MODO == 'ativa':
    ids = json.load(open(IDS, encoding='utf8'))
    antes = chama('GET', ids['campanha'], fields='name,status,effective_status')
    print('antes:', antes['name'], antes['status'], antes['effective_status'])
    chama('POST', ids['campanha'], status='ACTIVE')
    d = chama('GET', ids['campanha'], fields='name,status,effective_status')
    print('depois:', d['name'], d['status'], d['effective_status'], '| para pausar: no Gerenciador, ou POST status=PAUSED na mesma campanha')
    sys.exit(0)

# ---------- cria (pausada) ----------
if os.path.exists(IDS): sys.exit(f'já existe {IDS}: a campanha já foi criada; conferir no Gerenciador antes de criar outra')
if not df: sys.exit('sem a chave do Distrito Federal: nada criado')
if not zap: print('ATENÇÃO: a página não mostra o WhatsApp; a validação da Meta vai dizer se dá para criar')
ids = {}
try:
    ids['campanha'] = valida_e_cria(f'{CONTA}/campaigns', name=NOME, objective='OUTCOME_ENGAGEMENT', status='PAUSED',
                                    special_ad_categories=[], is_adset_budget_sharing_enabled=False)
    print('campanha criada PAUSADA:', ids['campanha'])
    ids['testes'] = {}
    for nome, mid in (POSTS.items() if TESTE else list(POSTS.items())[:1]):   # padrão: só o 1º; "teste": 1 conjunto por post
        cj = valida_e_cria(f'{CONTA}/adsets', name=f'{NOME} · {"teste · " if TESTE else ""}{nome}', campaign_id=ids['campanha'], status='ACTIVE',
            daily_budget=DIARIO_CENTAVOS, billing_event='IMPRESSIONS', optimization_goal='CONVERSATIONS', destination_type='WHATSAPP',
            bid_strategy='LOWEST_COST_WITHOUT_CAP', promoted_object={'page_id': PAGINA},
            targeting={'geo_locations': {'regions': [{'key': df['key']}]}, 'age_min': 25, 'age_max': 65,
                       'targeting_automation': {'advantage_audience': 1}})
        cr = valida_e_cria(f'{CONTA}/adcreatives', name=f'{NOME} · {nome}', object_id=PAGINA, instagram_user_id=IG,
                           source_instagram_media_id=mid, call_to_action={'type': 'WHATSAPP_MESSAGE', 'value': {'app_destination': 'WHATSAPP'}})
        ad = valida_e_cria(f'{CONTA}/ads', name=f'{NOME} · {nome}', adset_id=cj, creative={'creative_id': cr}, status='ACTIVE')
        ids['testes'][nome] = {'post': mid, 'conjunto': cj, 'criativo': cr, 'anuncio': ad}
        print(f'teste "{nome}": conjunto {cj} (ligado dentro da campanha pausada), anúncio {ad}')
except RuntimeError as e:
    df = None; print('região: busca recusada', str(e)[:120])
print('região:', f'Distrito Federal, chave {df["key"]}' if df else 'NÃO ACHEI a chave do Distrito Federal')
if MODO == 'confere':
    sys.exit('\nconferido. Criar pausada: python3 scripts/meta-campanha-mensagens.py cria')

# ---------- ativa (só com o Aprovar do Jorge) ----------
if MODO == 'ativa':
    ids = json.load(open(IDS, encoding='utf8'))
    antes = chama('GET', ids['campanha'], fields='name,status,effective_status')
    print('antes:', antes['name'], antes['status'], antes['effective_status'])
    chama('POST', ids['campanha'], status='ACTIVE')
    d = chama('GET', ids['campanha'], fields='name,status,effective_status')
    print('depois:', d['name'], d['status'], d['effective_status'], '| para pausar: no Gerenciador, ou POST status=PAUSED na mesma campanha')
    sys.exit(0)

# ---------- cria (pausada) ----------
if os.path.exists(IDS): sys.exit(f'já existe {IDS}: a campanha já foi criada; conferir no Gerenciador antes de criar outra')
if not df: sys.exit('sem a chave do Distrito Federal: nada criado')
if not zap: print('ATENÇÃO: a página não mostra o WhatsApp; a validação da Meta vai dizer se dá para criar')
ids = {}
try:
    ids['campanha'] = valida_e_cria(f'{CONTA}/campaigns', name=NOME, objective='OUTCOME_ENGAGEMENT', status='PAUSED',
                                    special_ad_categories=[], is_adset_budget_sharing_enabled=False)
    print('campanha criada PAUSADA:', ids['campanha'])
    ids['conjunto'] = valida_e_cria(f'{CONTA}/adsets', name=NOME + ' · DF', campaign_id=ids['campanha'], status='ACTIVE',
        daily_budget=DIARIO_CENTAVOS, billing_event='IMPRESSIONS', optimization_goal='CONVERSATIONS', destination_type='WHATSAPP',
        bid_strategy='LOWEST_COST_WITHOUT_CAP', promoted_object={'page_id': PAGINA},
        targeting={'geo_locations': {'regions': [{'key': df['key']}]}, 'age_min': 25, 'age_max': 65,
                   'targeting_automation': {'advantage_audience': 1}})
    print('conjunto criado (ligado dentro da campanha pausada):', ids['conjunto'])
    ids['anuncios'] = {}
    for nome, mid in POSTS.items():
        cr = valida_e_cria(f'{CONTA}/adcreatives', name=f'{NOME} · {nome}', object_id=PAGINA, instagram_user_id=IG,
                           source_instagram_media_id=mid, call_to_action={'type': 'WHATSAPP_MESSAGE', 'value': {'app_destination': 'WHATSAPP'}})
        ad = valida_e_cria(f'{CONTA}/ads', name=f'{NOME} · {nome}', adset_id=ids['conjunto'], creative={'creative_id': cr}, status='ACTIVE')
        ids['anuncios'][nome] = {'criativo': cr, 'anuncio': ad}
        print(f'anúncio "{nome}" criado: {ad} (criativo {cr})')
except RuntimeError as e:
    print('PAROU:', e)
finally:
    if ids:
        os.makedirs(os.path.dirname(IDS), exist_ok=True); json.dump(ids, open(IDS, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        print('ids gravados em', IDS)
if 'campanha' in ids:
    k = chama('GET', ids['campanha'], fields='name,status,effective_status,daily_budget')
    print(f'\nlido de volta: {k["name"]} | {k["status"]} / {k["effective_status"]} (tem de ser PAUSED)')
    for nome, x in ids.get('testes', {}).items():
        s = chama('GET', x['conjunto'], fields='daily_budget,optimization_goal,destination_type,effective_status')
        a = chama('GET', x['anuncio'], fields='effective_status')
        print(f'teste "{nome}": R$ {int(s["daily_budget"]) / 100:.2f}/dia | {s["optimization_goal"]} | {s["destination_type"]} | conjunto {s["effective_status"]}'
              f' | anúncio {a["effective_status"]} (em revisão da Meta é normal)')
    print('\nNada gasta enquanto a campanha estiver pausada. Ligar só com o Aprovar do Jorge: python3 scripts/meta-campanha-mensagens.py ativa')
