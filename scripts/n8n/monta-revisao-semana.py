"""Monta scripts/n8n/bmh-revisao-semana.json ("BMH · Anúncios · revisão da semana (homologação)", 28/10/2026): toda segunda às
8h30 monta a seção da BMH na revisão semanal única de tráfego (combinada com o Gerente Nexo), grava na BMH_anuncios_revisao e
manda no robô BMH alertas. Regra em bmh-revisao-semana.js, testada com testa-revisao-semana.js. Nesta fase é simulação:
proposta só em texto, sem botão, e nada no registro dos guardiões.

No n8n: uutsRepW7w9yt1l7 (criado desligado pela Central em 28/10/2026, idêntico a este JSON).

  python3 scripts/n8n/monta-revisao-semana.py"""
import json, os, sys, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _vigia_bmh import nos_vigia, liga_vigia

WEBHOOK = 'bmh-revisao-semana-1f6c93ad27'
CRED_TELEGRAM = {'telegramApi': {'id': 'SgQHWuJOuMWeVbPi', 'name': 'BMH · Telegram (robô BMH alertas)'}}
TAB = lambda id_, nome: {'__rl': True, 'value': id_, 'mode': 'id', 'cachedResultName': nome}
LEITURAS = [('Config', 'V4NRHS9mc1kvigix', 'BMH_config'), ('Google (tabela)', '1TSLyd68TBzYajYq', 'BMH_google_anuncios_dia'),
            ('Meta (tabela)', 'JMvvyiF8uT6iqgQL', 'BMH_meta_anuncios_dia'), ('Registro (tabela)', 'E1ewiB9pcohZpSfw', 'BMH_guardiao_registro')]
REVISAO = TAB('5CHmKzr2hdHlSiv6', 'BMH_anuncios_revisao')
COLUNAS = {'chave': 'string', 'semana': 'string', 'tipo': 'string', 'ordem': 'number', 'titulo': 'string', 'texto': 'string', 'plataforma': 'string',
           'regra': 'string', 'alvo_id': 'string', 'alvo': 'string', 'acao': 'string', 'valor_antes': 'string', 'valor_novo': 'string',
           'registro_chave': 'string', 'resultado': 'string', 'atualizado_em': 'string'}
REGRA = open(os.path.join(AQUI, 'bmh-revisao-semana.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
uid = lambda nome: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-revisao-semana/' + nome))

nos, x = [], 0
def no(nome, tipo, versao, parametros, y=0, **extra):
    global x
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, y], 'parameters': parametros, **extra}); x += 240
    return nome
seq = [no('Toda segunda às 8h30', 'n8n-nodes-base.scheduleTrigger', 1.2, {'rule': {'interval': [{'field': 'cronExpression', 'expression': '30 8 * * 1'}]}})]
x -= 240
manual = no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'options': {}}, y=200, webhookId=uid('webhook'))
seq.append(no('Quando', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// A semana da revisão: segunda a domingo da semana passada. Manual: ?teste=1 (manda marcado 🧪, não grava) e\n"
    "// ?segunda=AAAA-MM-DD para refazer a revisão de outra segunda.\n"
    "let q = {}; try { if ($('Manual').isExecuted) q = $('Manual').first().json.query || {}; } catch (e) {}\n"
    "const hoje = $now.setZone('America/Sao_Paulo').startOf('day');\n"
    "let seg = hoje.startOf('week');\n"
    "if (/^\\d{4}-\\d{2}-\\d{2}$/.test(q.segunda || '')) { const s = DateTime.fromISO(q.segunda, { zone: 'America/Sao_Paulo' }); if (s.isValid && s.weekday === 1) seg = s; }\n"
    "const fim = seg.minus({ days: 1 });\n"
    "return [{ json: { segunda: seg.toISODate(), semana_ini: seg.minus({ days: 7 }).toISODate(), semana_fim: fim.toISODate(), ant_ini: seg.minus({ days: 14 }).toISODate(),\n"
    "  ant_fim: seg.minus({ days: 8 }).toISODate(), mes_ini: fim.startOf('month').toISODate(), d30: seg.minus({ days: 30 }).toISODate(), agora: $now.toISO(), teste: !!q.teste } }];\n")}))
for nome, id_, tab in LEITURAS:
    seq.append(no(nome, 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': TAB(id_, tab), 'returnAll': True}, alwaysOutputData=True, executeOnce=True))
decide = no('Decide', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Regra copiada de scripts/n8n/bmh-revisao-semana.js (BMH_Claude_VSL) pelo monta-revisao-semana.py: editar lá.\n' + REGRA +
    "\nconst D = $('Quando').first().json;\n"
    "const linhas = n => $(n).all().map(i => i.json).filter(r => r && (r.chave || r.dia));\n"
    "const cfg = Object.fromEntries(linhas('Config').map(r => [r.chave, r.valor]));\n"
    "const T = { google: linhas('Google (tabela)'), meta: linhas('Meta (tabela)'), registro: linhas('Registro (tabela)') };\n"
    "const { texto, linhas: paraGravar } = montaRevisao(D, revisaoSemana(D, T, cfg), D.agora, D.teste);\n"
    "return [{ json: { texto, linhas: paraGravar, teste: D.teste } }];\n")})
x0 = x
grava_l = no('Linhas para gravar', 'n8n-nodes-base.code', 2, {'jsCode':
    "// No teste, nada é gravado.\nconst d = $input.first().json;\nif (d.teste) return [];\nreturn d.linhas.map(json => ({ json }));\n"}, y=-220)
grava = no('Grava (revisão)', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'upsert', 'dataTableId': REVISAO,
    'filters': {'conditions': [{'keyName': 'chave', 'keyValue': '={{ $json.chave }}'}]},
    'columns': {'mappingMode': 'defineBelow', 'value': {c: '={{ $json.' + c + ' }}' for c in COLUNAS}, 'matchingColumns': [],
                'schema': [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True, 'type': t, 'readOnly': False, 'removed': False} for c, t in COLUNAS.items()]},
    'options': {}}, y=-220)
x = x0
telegram = no('Telegram · revisão', 'n8n-nodes-base.telegram', 1.2, {'chatId': '8708228589',
    'text': "={{ String($json.texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }}",
    'additionalFields': {'appendAttribution': False, 'parse_mode': 'HTML'}}, y=220, credentials=CRED_TELEGRAM, retryOnFail=True, maxTries=3, waitBetweenTries=5000)
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 1000, 'height': 380, 'content': (
    "## BMH · Anúncios · revisão da semana (homologação)\n"
    "**Traz:** as tabelas de números (`BMH_google_anuncios_dia`, `BMH_meta_anuncios_dia`), o registro dos guardiões e a `BMH_config` (tetos).\n"
    "**Envia:** a seção da BMH na revisão semanal única de tráfego (segunda 8h30, combinada com o Gerente Nexo) no robô BMH alertas, e as linhas "
    "na `BMH_anuncios_revisao` (blocos nas vagas 1 a 6, propostas nas vagas 101 a 106), que o Gerente Nexo lê para citar a BMH.\n"
    "**Limites:** simulação: proposta só em texto, sem botão e sem registro; régua do método da Nexo (pausar com R$ 60 na semana sem contato ou "
    "custo 3 vezes a média; leitura de R$ 50 em 30 dias sem contato); nunca propõe pausar o canal inteiro; no Meta, só vale com conversa nos "
    "últimos 30 dias; campanha em teste fica fora até a data dela. Sem CRM: contato é conversão do Google e conversa do Meta.\n\n"
    f"Manual: `/webhook/{WEBHOOK}?teste=1` (não grava) e `&segunda=AAAA-MM-DD`. Regra em `BMH_Claude_VSL/scripts/n8n/bmh-revisao-semana.js`.")}, y=-500)
nos[-1]['position'][0] = 0
nos += nos_vigia('revisao_semana', 'BMH · Anúncios · revisão da semana', (0, 440), max_horas=170)
lig = {}
def liga(a, b): lig.setdefault(a, {'main': [[]]})['main'][0].append({'node': b, 'type': 'main', 'index': 0})
for a, b in zip(seq, seq[1:]): liga(a, b)
liga(seq[-1], decide)
liga(manual, 'Quando')
liga(decide, grava_l); liga(grava_l, grava)
liga(decide, telegram)
liga_vigia(lig, 'Toda segunda às 8h30')
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'all', 'saveDataErrorExecution': 'all',
        'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 300}
json.dump({'name': 'BMH · Anúncios · revisão da semana (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-revisao-semana.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-revisao-semana.json |', len(nos), 'nós')
