"""Monta scripts/n8n/bmh-whatsapp-coexistencia.json ("BMH · WhatsApp · coexistência com o Kommo (homologação)", 22/10/2026):
todo dia às 9h17 lê a hora das mensagens mandadas pelo celular da recepção (BMH_whatsapp_mensagens, direcao equipe e aparelho
celular, gravadas pelo recebedor oficial da Meta) e avisa no robô BMH alertas com 10 dias sem nenhuma (a Meta desliga a
coexistência com 14 dias sem abrir o app). Regra em bmh-coexistencia.js. Só fala depois da virada (coexistencia_desde na
BMH_config). A tabela tem texto e telefone de paciente: o fluxo só usa a hora e não guarda execução (nem de sucesso nem de erro).

  python3 scripts/n8n/monta-coexistencia.py"""
import json, os, sys, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _vigia_bmh import nos_vigia, liga_vigia

WEBHOOK = 'bmh-coexistencia-4c19e7a2d8'
CRED_TELEGRAM = {'telegramApi': {'id': 'SgQHWuJOuMWeVbPi', 'name': 'BMH · Telegram (robô BMH alertas)'}}
CONFIG = {'__rl': True, 'value': 'V4NRHS9mc1kvigix', 'mode': 'id', 'cachedResultName': 'BMH_config'}
MENSAGENS = {'__rl': True, 'value': 'll7XMHZ9sWkenCgb', 'mode': 'id', 'cachedResultName': 'BMH_whatsapp_mensagens'}
REGRA = open(os.path.join(AQUI, 'bmh-coexistencia.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
uid = lambda nome: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-coexistencia/' + nome))

nos, x = [], 0
def no(nome, tipo, versao, parametros, y=0, **extra):
    global x
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, y], 'parameters': parametros, **extra}); x += 240
    return nome
seq = [no('Todo dia às 9h17', 'n8n-nodes-base.scheduleTrigger', 1.2, {'rule': {'interval': [{'field': 'cronExpression', 'expression': '17 9 * * *'}]}})]
x -= 240
manual = no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'options': {}}, y=200, webhookId=uid('webhook'))
seq.append(no('Quando', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Manual com ?teste=1: manda sempre uma mensagem marcada 🧪 (mesmo calado), e ?desde=AAAA-MM-DD simula a data da virada.\n"
    "let q = {}; try { if ($('Manual').isExecuted) q = $('Manual').first().json.query || {}; } catch (e) {}\n"
    "return [{ json: { agora: $now.toISO(), teste: !!q.teste, desde_teste: /^\\d{4}-\\d{2}-\\d{2}$/.test(q.desde || '') ? q.desde : '' } }];\n")}))
seq.append(no('Config', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': CONFIG, 'returnAll': True},
              alwaysOutputData=True, executeOnce=True))
seq.append(no('Ecos do celular (tabela)', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': MENSAGENS, 'matchType': 'allConditions',
    'filters': {'conditions': [{'keyName': 'direcao', 'keyValue': 'equipe'}, {'keyName': 'aparelho', 'keyValue': 'celular'}]}, 'returnAll': True},
    alwaysOutputData=True, executeOnce=True))
seq.append(no('Decide', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Regra copiada de scripts/n8n/bmh-coexistencia.js (BMH_Claude_VSL) pelo monta-coexistencia.py: editar lá.\n' + REGRA +
    "\nconst Q = $('Quando').first().json;\n"
    "const cfg = Object.fromEntries($('Config').all().map(i => i.json).filter(r => r && r.chave).map(r => [r.chave, r.valor]));\n"
    "if (Q.desde_teste) cfg.coexistencia_desde = Q.desde_teste;\n"
    "// só a hora: texto e telefone das mensagens não saem deste nó\n"
    "const momentos = $('Ecos do celular (tabela)').all().map(i => i.json && i.json.momento).filter(Boolean);\n"
    "const r = avisoCoexistencia(momentos, cfg, Q.agora);\n"
    "if (!Q.teste) return r ? [{ json: { texto: r.texto } }] : [];\n"
    "return [{ json: { texto: '🧪 TESTE da vigia da coexistência\\n' + (r ? r.texto : `calado: ${momentos.length} mensagens do celular lidas; virada ${cfg.coexistencia_desde || 'ainda não marcada'}`) } }];\n")}))
seq.append(no('Telegram · aviso', 'n8n-nodes-base.telegram', 1.2, {'chatId': '8708228589',
    'text': "={{ String($json.texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }}",
    'additionalFields': {'appendAttribution': False, 'parse_mode': 'HTML'}}, credentials=CRED_TELEGRAM, retryOnFail=True, maxTries=3, waitBetweenTries=5000))
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 1000, 'height': 360, 'content': (
    "## BMH · WhatsApp · coexistência com o Kommo (homologação)\n"
    "**Traz:** a hora das mensagens mandadas pelo celular da recepção (`BMH_whatsapp_mensagens`, direcao `equipe`, aparelho `celular`, gravadas "
    "pelo recebedor oficial da Meta) e `coexistencia_desde` da `BMH_config`.\n"
    "**Envia:** aviso no robô BMH alertas com 10 dias (`coexistencia_dias_aviso`) sem mensagem mandada pelo celular: a Meta desliga a "
    "coexistência com o Kommo se o app ficar 14 dias sem abrir.\n"
    "**Limites:** calado antes da virada (sem `coexistencia_desde`); usa só a hora, nunca texto nem telefone; não guarda execução (a tabela tem "
    "dado de paciente); abrir o app sem mandar mensagem a Meta não avisa, então o aviso continua até alguém mandar uma pelo celular.\n\n"
    f"Manual: `/webhook/{WEBHOOK}?teste=1` (sempre responde, marcado 🧪) e `&desde=AAAA-MM-DD` para simular a virada. Regra em "
    "`BMH_Claude_VSL/scripts/n8n/bmh-coexistencia.js`.")}, y=-460)
nos[-1]['position'][0] = 0
nos += nos_vigia('coexistencia', 'BMH · WhatsApp · coexistência com o Kommo', (0, 440))
lig = {}
def liga(a, b): lig.setdefault(a, {'main': [[]]})['main'][0].append({'node': b, 'type': 'main', 'index': 0})
for a, b in zip(seq, seq[1:]): liga(a, b)
liga(manual, 'Quando')
liga_vigia(lig, 'Todo dia às 9h17')
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'none',
        'saveManualExecutions': False, 'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 300}
json.dump({'name': 'BMH · WhatsApp · coexistência com o Kommo (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-whatsapp-coexistencia.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-whatsapp-coexistencia.json |', len(nos), 'nós')
