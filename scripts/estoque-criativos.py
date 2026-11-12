"""Estoque de criativos da BMH, rotina do dia 25 (decisão do Jorge de 12/11/2026 para Nexo e BMH; Central, frentes/trafego.md item 4).
Passo 1 da rotina: procurar nos posts e reels JÁ PUBLICADOS do Instagram da BMH (@hiperbaricabrasilia) os que estão acima do normal
do perfil, por tema de serviço, dentro das travas da pasta. Esses entram primeiro como a publicação existente; o que faltar vira
roteiro novo (passo 2, com o Jorge).

Nota = interações do post (curtida, comentário, salvo e compartilhamento, pela Meta) ÷ mediana das interações dos posts do MESMO
formato (reel ou feed) nos últimos 12 meses. 2,0 = o dobro do normal (método da skill concorrentes-instagram). Alcance vai junto,
com a mesma conta. Só números e textos públicos da própria marca; nada de comentário de pessoa.

Travas (CLAUDE.md da pasta): sem preço, sem antes e depois, sem depoimento, sem estética, sem promessa, indicação só da lista
UHMS/CFM, sem hashtag. O script MARCA o que achar na legenda; paciente no vídeo ou na foto ele não vê: o Jorge confere pelo link.

Uso: python3 scripts/estoque-criativos.py [meses=12]   (VPS pelo cofre; no Mac, com META_ADS_TOKEN no .env)
Sai em saidas/estoque-criativos-AAAA-MM.md e dados/meta/estoque-criativos-AAAA-MM.json."""
import datetime, json, os, re, statistics, sys
import urllib.request, urllib.parse

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
os.chdir(RAIZ)
IG = '17841408031661983'
ENV = dict(l.strip().split('=', 1) for l in open('.env', encoding='utf8') if '=' in l and not l.startswith('#')) if os.path.exists('.env') else {}
TOKEN = ENV.get('META_ADS_TOKEN')
BASE = 'https://graph.facebook.com/v26.0' if TOKEN else 'http://cofre:8080/meta-bmh/v26.0'
MESES = int(sys.argv[1]) if len(sys.argv) > 1 else 12
HOJE = datetime.date.today()
DESDE = (HOJE - datetime.timedelta(days=30 * MESES)).isoformat()

# temas = os serviços que a BMH anuncia (grupos do Google e a campanha de mensagem). Ordem importa: o primeiro que casar vence.
TEMAS = [
    ('Pós-operatório', r'pós-operat|pos-operat|pós operat|pós-cirúrg|pos-cirurg|cirurgia plástica|cirurgia plastica|retalho|enxerto|fez ciru'),
    ('Feridas', r'ferida|úlcera|ulcera|ulc3r|pé diabétic|pe diabetic|isquemi|1squ3m|necros|falta oxig'),
    ('Radiação, infecção e queimadura', r'radio|radia|osteomiel|infec|1nf3c|inf3c|fournier|queimad'),
    ('Mergulho', r'mergulh|descompress'),
    ('Como funciona e segurança', r'como funciona|seguran|equipe|sess[aã]o|primeira (visita|consulta)|mitos|indica[cç][aã]o|enfermag|m[eé]dic|câmara|camara|dói|doi\?'),
]
TRAVAS = {
    'hashtag': r'#\w',
    'preço': r'R\$|preç|preco|valor(es)?\b|promo|desconto|parcel',
    'estética': r'est[eé]tic|rejuvenesc|antes e depois|detox|relax|beleza|celulite|flacidez|bem-estar|bem estar|\bspa\b|harmoniza',
    'promessa (aviso do CFM)': r'garant\w* (o |os |a |um )?(resultado|cura|sucesso)|\bcura\b|100%|elimina|milagr|resultado(s)? (incr[ií]ve|garantid|imediat)|\beficaz|\beficien',
    'depoimento': r'depoiment|relato|minha experi|“[^”]{25,}”|"[^"]{25,}"',
    'celebridade': r'virginia|influenciador|famos[oa]',
    'caso de paciente': r'casos? (que )?(realmente )?nos marca|evolu[cç][aã]o d[oa] paciente|hist[oó]ria d[oa] paciente|\bcaso cl[ií]nico',
    'evento ou data (não é criativo de serviço)': r'\bhonra\b|participar desse|congresso|evento|dia das m[aã]es|\bm[aã]e é|natal|ano novo|fim de ano|anivers',
    'pós-op genérico (indicação fora da lista?)': r'acelera\w* (a |sua )?recupera|recupera\w* mais r[aá]pid',
}
# o que só avisa (a trava do CFM é aviso, não bloqueio; hashtag sai editando a legenda; indicação duvidosa o Jorge decide)
AVISO = {'hashtag', 'promessa (aviso do CFM)', 'pós-op genérico (indicação fora da lista?)'}
bloqueia = lambda p: [t for t in p['travas'] if t not in AVISO]


def get(caminho, **q):
    if TOKEN: q['access_token'] = TOKEN
    with urllib.request.urlopen(f'{BASE}/{caminho}?' + urllib.parse.urlencode(q), timeout=60) as r: return json.load(r)


posts, depois = [], None
while True:
    campo = 'id,caption,like_count,media_type,media_product_type,permalink,timestamp'
    d = get(IG, fields=f'media.limit(100){"." + "after(" + depois + ")" if depois else ""}{{{campo}}}')
    m = d.get('media', {}); lote = m.get('data', [])
    posts += [p for p in lote if p['timestamp'][:10] >= DESDE]
    depois = (m.get('paging', {}).get('cursors') or {}).get('after')
    if not lote or lote[-1]['timestamp'][:10] < DESDE or not depois or 'next' not in m.get('paging', {}): break
print(f'{len(posts)} posts desde {DESDE}')

# posts que já foram anúncio na conta (origem do criativo ou a cópia "AD"): a regra prefere os que ainda não foram
usados = set()
try:
    for a in get('act_327952129944258/ads', fields='creative{source_instagram_media_id,effective_instagram_media_id}', limit=500).get('data', []):
        c = a.get('creative') or {}; usados |= {c.get('source_instagram_media_id'), c.get('effective_instagram_media_id')}
except Exception as e: print('não li os anúncios da conta:', str(e)[:100])

for p in posts:
    met = 'reach,saved,shares,total_interactions' + (',views' if p.get('media_product_type') == 'REELS' else '')
    try: p['m'] = {x['name']: x['values'][0]['value'] for x in get(f'{p["id"]}/insights', metric=met).get('data', [])}
    except Exception as e: p['m'] = {}; p['erro'] = str(e)[:80]
    p['formato'] = 'reel' if p.get('media_product_type') == 'REELS' else 'feed'
    leg = (p.get('caption') or '').lower()
    p['tema'] = next((t for t, r in TEMAS if re.search(r, leg)), 'Outro')
    p['travas'] = [k for k, r in TRAVAS.items() if re.search(r, p.get('caption') or '', re.I)]
    p['ja_anuncio'] = p['id'] in usados

for f in ('reel', 'feed'):
    g = [p for p in posts if p['formato'] == f and p['m'].get('total_interactions') is not None]
    if not g: continue
    mi = statistics.median(p['m']['total_interactions'] for p in g) or 1
    ma = statistics.median(p['m'].get('reach', 0) for p in g) or 1
    for p in g: p['nota'] = round(p['m']['total_interactions'] / mi, 2); p['nota_alcance'] = round(p['m'].get('reach', 0) / ma, 2)
    print(f'{f}: {len(g)} posts | mediana {mi} interações, {ma} de alcance')

MES = HOJE.strftime('%Y-%m')
os.makedirs('dados/meta', exist_ok=True)
json.dump([{k: p.get(k) for k in ('id', 'timestamp', 'formato', 'tema', 'nota', 'nota_alcance', 'm', 'travas', 'ja_anuncio', 'permalink', 'like_count')} for p in posts],
          open(f'dados/meta/estoque-criativos-{MES}.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)

L = [f'# Estoque de criativos da BMH: posts já publicados ({HOJE.strftime("%d/%m/%Y")})', '',
     f'Gerado por `scripts/estoque-criativos.py` (rotina do dia 25). {len(posts)} posts do @hiperbaricabrasilia desde {DESDE[8:]}/{DESDE[5:7]}/{DESDE[:4]}.',
     'Nota = interações ÷ mediana do mesmo formato (2,0 = o dobro do normal). **Apto** = nota 1,5 ou mais e nenhuma trava que bloqueia',
     '(preço, estética, depoimento, caso de paciente, celebridade, evento). Hashtag, promessa (CFM) e pós-operatório genérico só avisam.',
     'Paciente no vídeo ou na foto o script não vê: conferir pelo link antes de usar (só com autorização por escrito).', '']
for tema, _ in TEMAS + [('Outro', '')]:
    g = sorted([p for p in posts if p['tema'] == tema and p.get('nota') is not None], key=lambda p: -p['nota'])
    aptos = [p for p in g if p['nota'] >= 1.5 and not bloqueia(p)]
    L += [f'## {tema}', '', f'{len(g)} posts; {len(aptos)} aptos.', '', '| Apto | Já foi anúncio | Nota | Alcance | Formato | Data | Travas na legenda | Começo da legenda | Link |', '|---|---|---|---|---|---|---|---|---|']
    for p in g[:6]:
        leg = re.sub(r'\s+', ' ', (next((x for x in posts if x['id'] == p['id']), p).get('caption') or ''))[:60].replace('|', '/')
        L.append(f'| {"sim" if p in aptos else "não"} | {"sim" if p.get("ja_anuncio") else "não"} | {str(p["nota"]).replace(".", ",")} | {str(p["nota_alcance"]).replace(".", ",")} | {p["formato"]} | {p["timestamp"][8:10]}/{p["timestamp"][5:7]}/{p["timestamp"][2:4]} '
                 f'| {", ".join(p["travas"]) or "nenhuma"} | {leg} | {p["permalink"]} |')
    L.append('')
open(f'saidas/estoque-criativos-{MES}.md', 'w', encoding='utf8').write('\n'.join(L) + '\n')
print(f'gravado saidas/estoque-criativos-{MES}.md')
