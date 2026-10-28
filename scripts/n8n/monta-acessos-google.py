"""Monta scripts/n8n/bmh-google-acessos.json ("BMH · Google Ads · acessos da conta (homologação)", 28/10/2026): todo dia às
7h45 lê vínculos de gerente, usuários e convites pendentes da conta 5066798424, compara com a lista da véspera
(BMH_config google_acessos_vistos) e avisa no robô BMH alertas só o que entrou. Regra em bmh-google-acessos.js. A renovação do
acesso e a chamada à API são as mesmas do "BMH · Anúncios · guardião diário" (J8a8SbtlLzud62fl).

  python3 scripts/n8n/monta-acessos-google.py"""
import json, os, sys, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _vigia_bmh import nos_vigia, liga_vigia

WEBHOOK = 'bmh-google-acessos-8d2a61f0b3'
CRED_GOOGLE = {'httpCustomAuth': {'id': 'Qewvtjz9JokCUvNy', 'name': 'BMH · Google Ads (renovação do acesso)'}}
CRED_TELEGRAM = {'telegramApi': {'id': 'SgQHWuJOuMWeVbPi', 'name': 'BMH · Telegram (robô BMH alertas)'}}
CONFIG = {'__rl': True, 'value': 'V4NRHS9mc1kvigix', 'mode': 'id', 'cachedResultName': 'BMH_config'}
REGRA = open(os.path.join(AQUI, 'bmh-google-acessos.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
uid = lambda nome: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-google-acessos/' + nome))

nos, x = [], 0
def no(nome, tipo, versao, parametros, y=0, **extra):
    global x
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, y], 'parameters': parametros, **extra}); x += 240
    return nome
seq = [no('Todo dia às 7h45', 'n8n-nodes-base.scheduleTrigger', 1.2, {'rule': {'interval': [{'field': 'cronExpression', 'expression': '45 7 * * *'}]}})]
x -= 240
manual = no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'options': {}}, y=200, webhookId=uid('webhook'))
seq.append(no('Quando', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Manual com ?teste=1: lê e manda a mensagem marcada 🧪 (mesmo sem novidade), sem gravar a lista.\n"
    "let q = {}; try { if ($('Manual').isExecuted) q = $('Manual').first().json.query || {}; } catch (e) {}\n"
    "return [{ json: { teste: !!q.teste } }];\n")}))
seq.append(no('Config', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': CONFIG, 'returnAll': True}, alwaysOutputData=True, executeOnce=True))
seq.append(no('Google · renova o acesso', 'n8n-nodes-base.httpRequest', 4.2, {'method': 'POST', 'url': 'https://oauth2.googleapis.com/token',
    'authentication': 'genericCredentialType', 'genericAuthType': 'httpCustomAuth', 'sendBody': True, 'contentType': 'json', 'specifyBody': 'json',
    'jsonBody': '{}', 'options': {}}, credentials=CRED_GOOGLE, executeOnce=True, retryOnFail=True, maxTries=3, waitBetweenTries=5000))
decide = no('Decide', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Regra copiada de scripts/n8n/bmh-google-acessos.js (BMH_Claude_VSL) pelo monta-acessos-google.py: editar lá.\n' + REGRA +
    "\nconst Q = $('Quando').first().json;\n"
    "const cfg = Object.fromEntries($('Config').all().map(i => i.json).filter(r => r && r.chave).map(r => [r.chave, r.valor]));\n"
    "const CONTA = '5066798424';\n"
    "const token = $('Google · renova o acesso').first().json.access_token;\n"
    "if (!token) throw new Error('sem acesso (token) do Google Ads');\n"
    "// a mesma chamada do guardião do Google; erro aqui faz o fluxo parar em erro (alerta de falha) e a lista não é regravada\n"
    "const busca = async q => { let out = [], pt; do { const r = await this.helpers.httpRequest({ method: 'POST', url: `https://googleads.googleapis.com/v25/customers/${CONTA}/googleAds:search`, headers: { Authorization: 'Bearer ' + token }, body: { query: q, ...(pt ? { pageToken: pt } : {}) }, json: true, timeout: 60000 }); out = out.concat(r.results || []); pt = r.nextPageToken; } while (pt); return out; };\n"
    "const atuais = listaAcessos(await busca(GAQL_ACESSOS.gerentes), await busca(GAQL_ACESSOS.usuarios), await busca(GAQL_ACESSOS.convites));\n"
    "const r = comparaAcessos(atuais, cfg.google_acessos_vistos);\n"
    "return [{ json: { texto: mensagemAcessos(r, atuais, Q.teste), guardar: r.guardar, novos: r.novos.length, teste: Q.teste } }];\n")})
x0 = x
grava_lista = no('Grava a lista?', 'n8n-nodes-base.code', 2, {'jsCode':
    "// A lista do dia vira a base de amanhã; no teste, nada é gravado.\nconst d = $input.first().json;\n"
    "if (d.teste) return [];\nreturn [{ json: { chave: 'google_acessos_vistos', valor: d.guardar } }];\n"}, y=-220)
grava = no('Grava (config)', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'upsert', 'dataTableId': CONFIG,
    'filters': {'conditions': [{'keyName': 'chave', 'keyValue': '={{ $json.chave }}'}]},
    'columns': {'mappingMode': 'defineBelow', 'value': {'chave': '={{ $json.chave }}', 'valor': '={{ $json.valor }}'}, 'matchingColumns': [],
                'schema': [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True, 'type': 'string', 'readOnly': False, 'removed': False} for c in ('chave', 'valor')]},
    'options': {}}, y=-220)
x = x0
tem = no('Tem mensagem?', 'n8n-nodes-base.code', 2, {'jsCode':
    "const t = $input.first().json.texto;\nreturn t ? [{ json: { texto: t } }] : [];\n"}, y=220)
telegram = no('Telegram · aviso', 'n8n-nodes-base.telegram', 1.2, {'chatId': '8708228589',
    'text': "={{ String($json.texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }}",
    'additionalFields': {'appendAttribution': False, 'parse_mode': 'HTML'}}, y=220, credentials=CRED_TELEGRAM, retryOnFail=True, maxTries=3, waitBetweenTries=5000)
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 1000, 'height': 340, 'content': (
    "## BMH · Google Ads · acessos da conta (homologação)\n"
    "**Traz:** da conta do Google Ads da BMH (5066798424) os vínculos de gerente (MCC), os usuários e os convites pendentes, pela mesma "
    "renovação de acesso do guardião do Google; e a lista da véspera em `BMH_config` (`google_acessos_vistos`).\n"
    "**Envia:** aviso no robô BMH alertas quando entra um acesso novo (conta de administração, usuário, papel mudado ou convite), e grava a "
    "lista do dia.\n"
    "**Limites:** só lê o Google Ads; saída de acesso não avisa; a primeira rodada só grava a base; erro de leitura para o fluxo (alerta de "
    "falha) sem regravar a lista. A Triunfo teve os acessos removidos em 28/10/2026: desde então, todo acesso novo é estranho.\n\n"
    f"Manual: `/webhook/{WEBHOOK}?teste=1` (manda marcado 🧪, sem gravar). Regra em `BMH_Claude_VSL/scripts/n8n/bmh-google-acessos.js`.")}, y=-480)
nos[-1]['position'][0] = 0
nos += nos_vigia('google_acessos', 'BMH · Google Ads · acessos da conta', (0, 440))
lig = {}
def liga(a, b): lig.setdefault(a, {'main': [[]]})['main'][0].append({'node': b, 'type': 'main', 'index': 0})
for a, b in zip(seq, seq[1:]): liga(a, b)
liga(seq[-1], decide)
liga(manual, 'Quando')
liga(decide, grava_lista); liga(grava_lista, grava)
liga(decide, tem); liga(tem, telegram)
liga_vigia(lig, 'Todo dia às 7h45')
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'all', 'saveDataErrorExecution': 'all',
        'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 300}
json.dump({'name': 'BMH · Google Ads · acessos da conta (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-google-acessos.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-google-acessos.json |', len(nos), 'nós')
