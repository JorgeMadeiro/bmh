"""Monta scripts/n8n/bmh-meta-guardiao.json ("BMH · Meta · guardião diário (homologação)") a partir de
bmh-meta-guardiao-decide.js (as regras, testadas com testa-guardiao-meta.js) e bmh-meta-guardiao-leituras.json.
Rodar de novo depois de qualquer mudança nas regras ou nas leituras:  python3 scripts/n8n/monta-guardiao-meta.py
O caminho do webhook manual fica fixo (não muda a cada montagem)."""
import json, os, re, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
WEBHOOK = 'bmh-meta-guardiao-3e8d1c5a07'
CRED_META = {'httpQueryAuth': {'id': 'HXdesRATFOJkYxhK', 'name': 'BMH · Meta Instagram (token)'}}
CRED_TELEGRAM = {'telegramApi': {'id': 'SgQHWuJOuMWeVbPi', 'name': 'BMH · Telegram (robô BMH alertas)'}}
CONFIG = {'__rl': True, 'value': 'V4NRHS9mc1kvigix', 'mode': 'id', 'cachedResultName': 'BMH_config'}
REGISTRO = {'__rl': True, 'value': 'E1ewiB9pcohZpSfw', 'mode': 'id', 'cachedResultName': 'BMH_guardiao_registro'}

regras = open(os.path.join(AQUI, 'bmh-meta-guardiao-decide.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
L = json.load(open(os.path.join(AQUI, 'bmh-meta-guardiao-leituras.json'), encoding='utf8'))
expr = lambda s: '={{ `' + re.sub(r'\{(\w+)\}', lambda m: "${$('Quando').first().json." + m.group(1) + '}', s) + '` }}' if re.search(r'\{\w+\}', s) else s
uid = lambda nome: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-meta-guardiao/' + nome))   # ids estáveis entre montagens

nos, x = [], 0
def no(nome, tipo, versao, parametros, **extra):
    global x
    n = {'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, 0], 'parameters': parametros, **extra}
    nos.append(n); x += 240
    return nome

seq = []
seq.append(no('Todo dia às 7h35', 'n8n-nodes-base.scheduleTrigger', 1.2, {'rule': {'interval': [{'field': 'cronExpression', 'expression': '35 7 * * *'}]}}))
x -= 240
manual = no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'options': {}}, webhookId=uid('webhook'))
nos[-1]['position'] = [0, 200]
seq.append(no('Quando', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Datas do dia (Brasília). Chamada manual com ?teste=1: decide e manda a mensagem marcada como teste, sem gravar.\n"
    "const hoje = $now.setZone('America/Sao_Paulo').startOf('day');\n"
    "let teste = false; try { teste = $('Manual').isExecuted && !!($('Manual').first().json.query || {}).teste; } catch (e) {}\n"
    "return [{ json: { hoje: hoje.toISODate(), ontem: hoje.minus({ days: 1 }).toISODate(), dia: hoje.day, dias_mes: hoje.daysInMonth,\n"
    "  restantes: hoje.daysInMonth - hoje.day + 1, mes_desde: hoje.day > 1 ? hoje.startOf('month').toISODate() : hoje.minus({ days: 1 }).toISODate(),\n"
    f"  teste, conta: '{L['conta']}' }} }}];\n")}))
seq.append(no('Config', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': CONFIG, 'returnAll': True}, alwaysOutputData=True))
nomes = {}
for l in L['leituras']:
    nomes[l['chave']] = l['no']
    seq.append(no(l['no'], 'n8n-nodes-base.httpRequest', 4.2, {
        'url': expr(f"https://graph.facebook.com/{L['versao']}/{l['caminho']}"),
        'authentication': 'genericCredentialType', 'genericAuthType': 'httpQueryAuth',
        'sendQuery': True, 'queryParameters': {'parameters': [{'name': k, 'value': expr(v)} for k, v in l['consulta'].items()]},
        'options': {'timeout': 60000}},
        credentials=CRED_META, executeOnce=True, alwaysOutputData=True, retryOnFail=True, maxTries=3, waitBetweenTries=5000,
        onError='continueRegularOutput'))
seq.append(no('Registro (tabela)', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'get', 'dataTableId': REGISTRO, 'returnAll': True},
              executeOnce=True, alwaysOutputData=True))
seq.append(no('Decide', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Regras copiadas de scripts/n8n/bmh-meta-guardiao-decide.js (BMH_Claude_VSL) pelo monta-guardiao-meta.py: não editar aqui,\n'
    '// editar lá, testar com testa-guardiao-meta.js e montar de novo.\n' + regras +
    "\nconst Q = $('Quando').first().json;\n"
    "const cfg = Object.fromEntries($('Config').all().map(i => i.json).filter(r => r && r.chave).map(r => [r.chave, r.valor]));\n"
    f"const NOS = {json.dumps(nomes, ensure_ascii=False)};\n"
    "const lidas = {};\n"
    "for (const [k, n] of Object.entries(NOS)) { try { lidas[k] = $(n).first().json; } catch (e) { lidas[k] = { error: { message: String(e.message || e) } }; } }\n"
    "const registro = $('Registro (tabela)').all().map(i => i.json).filter(r => r && r.chave);\n"
    "return decideMeta(montaEntrada(Q, cfg, lidas, registro, NOS)).map(json => ({ json }));\n")}))
decide = seq[-1]
x0 = x
prepara = no('Prepara o registro', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Grava em BMH_guardiao_registro só quando BMH_config guardiao_meta_grava = sim (em homologação não grava, para o painel e o\n"
    "// resumo das 8h não mostrarem decisão de teste) e nunca na chamada de teste.\n"
    "const cfg = Object.fromEntries($('Config').all().map(i => i.json).filter(r => r && r.chave).map(r => [r.chave, r.valor]));\n"
    "if ($('Quando').first().json.teste || cfg.guardiao_meta_grava !== 'sim') return [];\n"
    "return $input.all().map(({ json: a }) => ({ json: { chave: [a.hoje, a.regra, a.alvo_id || a.alvo].join('|'), data: a.hoje, regra: a.regra,\n"
    "  plataforma: 'meta', tipo: a.tipo || '', alvo_id: String(a.alvo_id || ''), alvo: a.alvo || '', acao: a.acao, valor_antes: String(a.valor_antes || ''),\n"
    "  valor_novo: String(a.valor_novo || ''), modo: a.modo, resultado: a.resultado, detalhe: a.detalhe || '' } }));\n")})
colunas = ['chave', 'data', 'regra', 'plataforma', 'tipo', 'alvo_id', 'alvo', 'acao', 'valor_antes', 'valor_novo', 'modo', 'resultado', 'detalhe']
registra = no('Registra', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'upsert', 'dataTableId': REGISTRO,
    'filters': {'conditions': [{'keyName': 'chave', 'keyValue': '={{ $json.chave }}'}]},
    'columns': {'mappingMode': 'defineBelow', 'value': {c: '={{ $json.' + c + ' }}' for c in colunas}, 'matchingColumns': [],
                'schema': [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True, 'type': 'string', 'readOnly': False, 'removed': False} for c in colunas]},
    'options': {}})
x = x0
monta = no('Monta a mensagem', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Copiado de scripts/n8n/bmh-meta-guardiao-decide.js pelo monta-guardiao-meta.py (só montaMensagem é usada aqui).\n' + regras +
    "\nreturn montaMensagem($('Quando').first().json, $input.all().map(i => i.json)).map(json => ({ json }));\n")})
# Envio como o do "BMH · Alerta de falha" (que funciona): HTML com &, < e > escapados e 3 tentativas. Se o Telegram recusar
# mesmo assim, a saída de erro vai ao nó seguinte, que falha com a resposta do Telegram e o tamanho do texto: o alerta de
# falha grava isso na BMH_falhas (21/10/2026: a 1ª execução, 609075, só registrou "Bad request").
telegram = no('Telegram · aviso', 'n8n-nodes-base.telegram', 1.2, {'chatId': '8708228589',
              'text': "={{ String($json.texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }}",
              'additionalFields': {'appendAttribution': False, 'parse_mode': 'HTML'}}, credentials=CRED_TELEGRAM,
              retryOnFail=True, maxTries=3, waitBetweenTries=5000, onError='continueErrorOutput')
explica = no('Explica a recusa do Telegram', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Só roda quando o Telegram recusou a mensagem. Falha de propósito com a resposta dele e o tamanho do texto, para o\n"
    "// \"BMH · Alerta de falha\" gravar o motivo na BMH_falhas (o texto em si não vai: pode ter nome de anúncio).\n"
    "const e = $input.first().json;\n"
    "const t = String($('Monta a mensagem').first().json.texto || '');\n"
    "const motivo = JSON.stringify(e.error || e).replace(/(access_token|token|bot)[0-9]*[=:][^&\\s\"']+/gi, '$1=[removido]').slice(0, 400);\n"
    "throw new Error('Telegram recusou: ' + motivo + ' | texto com ' + t.length + ' caracteres e ' + t.split('\\n').length + ' linhas');\n")})
x -= 240
nos[-1]['position'] = [x, 440]
x += 240
para = no('Leitura falhou? Para em erro', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Depois de avisar no Telegram: com metade ou mais das leituras com erro, o fluxo termina em ERRO (alerta de falha e\n'
    '// BMH_falhas). Regra em falhaDeLeitura, copiada de scripts/n8n/bmh-meta-guardiao-decide.js pelo montador.\n' + regras +
    f"\nconst motivo = falhaDeLeitura($('Decide').all().map(i => i.json), {len(L['leituras'])});\n"
    "if (motivo) throw new Error(motivo);\n"
    "return [{ json: { leituras: 'ok' } }];\n")})
for n in nos:
    if n['name'] in (prepara, registra): n['position'][1] = -220
    if n['name'] in (monta, telegram, para): n['position'][1] = 220
nota = no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 1100, 'height': 420, 'content': (
    "## BMH · Meta · guardião diário (homologação)\n"
    "**Traz:** a conta de anúncios do Meta da BMH (`act_327952129944258`): limite de gastos, saldo pré-pago, campanhas, conjuntos, anúncios, "
    "números de ontem, 3 e 7 dias, gasto do mês e alterações de ontem (credencial `BMH · Meta Instagram (token)`, só leitura).\n"
    "**Envia:** uma mensagem no robô BMH alertas com avisos e o que proporia; grava em `BMH_guardiao_registro` (plataforma meta) só com "
    "`guardiao_meta_grava = sim` na `BMH_config`.\n"
    "**Limites:** só simulação, não aplica nada e não tem botão; nenhuma pausa proposta deixa a conta sem anúncio antes de "
    "`meta_no_ar_ate` (regra do Jorge, 20/10/2026: a conta não para até 31/10); nunca sobe verba.\n\n"
    "Regras: verba da conta (o menor entre limite e saldo livre, pela média de 7 dias) com menos de `meta_dias_aviso` (5) dias ou acabando "
    "antes de `meta_no_ar_ate`; conta fora do ar; conjunto ligado sem exibição ontem; frequência acima de `meta_freq_max` (4) em 7 dias; "
    "anúncio reprovado ou com problema; alteração de quem não está em `meta_alteracoes_da_casa`; conjunto de mensagem com "
    "`meta_limite_sem_conversa` (R$ 40) em 3 dias sem conversa; teto `meta_teto_mes` (ou `meta_teto_mes_AAAA-MM`). Frequência e anúncio "
    "com problema só voltam depois de 7 dias.\n\n"
    "As regras moram em `BMH_Claude_VSL/scripts/n8n/bmh-meta-guardiao-decide.js` e se testam com `testa-guardiao-meta.js` (dados de "
    f"hoje, pelo cofre). Manual: `/webhook/{WEBHOOK}?teste=1`. Método: `Central_Claude/frentes/metodo-meta-ads.md`.")})
nos[-1]['position'] = [0, -520]

ligacoes = {}
def liga(a, b, saida=0):
    m = ligacoes.setdefault(a, {'main': []})['main']
    while len(m) <= saida: m.append([])
    m[saida].append({'node': b, 'type': 'main', 'index': 0})
for a, b in zip(seq, seq[1:]): liga(a, b)
liga(manual, 'Quando')
liga(decide, prepara); liga(decide, monta)
liga(prepara, registra); liga(monta, telegram)
liga(telegram, para, saida=0)      # mandou: confere se a leitura falhou e, se sim, para em erro
liga(telegram, explica, saida=1)   # saída 1 = erro (onError continueErrorOutput)
# Vigia (22/10/2026): o horário anota em BMH_vigia; o "BMH · Vigia · fluxos parados" avisa se passar de 26 h sem rodar
import sys; sys.path.insert(0, AQUI)
from _vigia_bmh import nos_vigia, liga_vigia
nos += nos_vigia('meta_guardiao', 'BMH · Meta · guardião diário', (0, 420))
liga_vigia(ligacoes, 'Todo dia às 7h35')

fluxo = {'name': 'BMH · Meta · guardião diário (homologação)', 'nodes': nos, 'connections': ligacoes,
         'settings': {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'all',
                      'saveDataErrorExecution': 'all', 'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 900}}
saida = os.path.join(AQUI, 'bmh-meta-guardiao.json')
json.dump(fluxo, open(saida, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado', saida, '|', len(nos), 'nós')
