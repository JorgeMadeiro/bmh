"""Monta dois fluxos de homologação do Meta da BMH (21/10/2026):
  bmh-meta-numeros-dia.json          "BMH · Meta · números do dia (homologação)": grava a BMH_meta_anuncios_dia às 6h05
  bmh-resumo-manha-homologacao.json  cópia do "BMH · Telegram · resumo da manhã" (QGDceUjADbnNINb3) com o bloco do Meta,
                                     só com o Manual (sem horário, para não mandar resumo duplicado às 8h)
As regras vêm de bmh-meta-numeros.js e de verbaDaConta (bmh-meta-guardiao-decide.js), testadas com testa-numeros-meta.js.
O resumo de produção é lido pelo cofre (n8n-leitura) na hora: cada troca no código é conferida e, se o resumo mudou, o
montador para em vez de gerar uma cópia errada.

  python3 scripts/n8n/monta-numeros-meta.py <id da tabela BMH_meta_anuncios_dia>
Sem o id, monta com CRIAR_A_TABELA no lugar (a tabela é criada no n8n pelo Mac; colunas em COLUNAS_META_DIA)."""
import json, os, re, sys, uuid, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
TABELA = sys.argv[1] if len(sys.argv) > 1 else 'CRIAR_A_TABELA'
CRED_META = {'httpQueryAuth': {'id': 'HXdesRATFOJkYxhK', 'name': 'BMH · Meta Instagram (token)'}}
WEBHOOK_NUMEROS, WEBHOOK_RESUMO = 'bmh-meta-numeros-7b2e91f4c6', 'bmh-resumo-manha-homolog-5d03a8e2b1'
TAB = lambda: {'__rl': True, 'value': TABELA, 'mode': 'id', 'cachedResultName': 'BMH_meta_anuncios_dia'}
uid = lambda nome: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-meta-numeros/' + nome))

decide = open(os.path.join(AQUI, 'bmh-meta-guardiao-decide.js'), encoding='utf8').read()
ini = decide.index('// Verba da conta:'); fim = decide.index('\n}\n', decide.index('function verbaDaConta(')) + 3
VERBA = decide[ini:fim]
NUMEROS = open(os.path.join(AQUI, 'bmh-meta-numeros.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
COLUNAS = json.loads(re.sub(r',\s*\}$', '}', re.sub(r'(\w+):', r'"\1":', re.search(r'COLUNAS_META_DIA = (\{.*?\});', NUMEROS, re.S).group(1)).replace("'", '"')))
L = json.load(open(os.path.join(AQUI, 'bmh-meta-numeros-leituras.json'), encoding='utf8'))
expr = lambda s: '={{ `' + re.sub(r'\{(\w+)\}', lambda m: "${$('Quando').first().json." + m.group(1) + '}', s) + '` }}' if re.search(r'\{\w+\}', s) else s
AVISO_FONTE = '// Copiado de scripts/n8n/bmh-meta-numeros.js e bmh-meta-guardiao-decide.js (BMH_Claude_VSL) pelo monta-numeros-meta.py: editar lá.\n'

# ---------- 1. números do dia ----------
nos, x = [], 0
def no(nome, tipo, versao, parametros, y=0, **extra):
    global x
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, y], 'parameters': parametros, **extra}); x += 240
    return nome
seq = [no('Todo dia às 6h05', 'n8n-nodes-base.scheduleTrigger', 1.2, {'rule': {'interval': [{'field': 'cronExpression', 'expression': '5 6 * * *'}]}})]
x -= 240
manual = no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK_NUMEROS, 'options': {}}, y=200, webhookId=uid('webhook'))
seq.append(no('Quando', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Período: anteontem de ontem até ontem (a Meta ajusta conversa atrasada, então regrava 3 dias). Manual: ?desde=AAAA-MM-DD\n"
    "// para carregar até 31 dias para trás; ?teste=1 monta as linhas sem gravar.\n"
    "const hoje = $now.setZone('America/Sao_Paulo').startOf('day');\n"
    "let q = {}; try { if ($('Manual').isExecuted) q = $('Manual').first().json.query || {}; } catch (e) {}\n"
    "let desde = hoje.minus({ days: 3 }).toISODate();\n"
    "if (/^\\d{4}-\\d{2}-\\d{2}$/.test(q.desde || '') && q.desde >= hoje.minus({ days: 31 }).toISODate() && q.desde < hoje.toISODate()) desde = q.desde;\n"
    f"return [{{ json: {{ hoje: hoje.toISODate(), ontem: hoje.minus({{ days: 1 }}).toISODate(), desde, agora: $now.toISO(), teste: !!q.teste, conta: '{L['conta']}' }} }}];\n")}))
nomes = {}
for l in L['leituras']:
    nomes[l['chave']] = l['no']
    seq.append(no(l['no'], 'n8n-nodes-base.httpRequest', 4.2, {
        'url': expr(f"https://graph.facebook.com/{L['versao']}/{l['caminho']}"), 'authentication': 'genericCredentialType', 'genericAuthType': 'httpQueryAuth',
        'sendQuery': True, 'queryParameters': {'parameters': [{'name': k, 'value': expr(v)} for k, v in l['consulta'].items()]}, 'options': {'timeout': 60000}},
        credentials=CRED_META, executeOnce=True, retryOnFail=True, maxTries=3, waitBetweenTries=5000))
seq.append(no('Monta as linhas', 'n8n-nodes-base.code', 2, {'jsCode': AVISO_FONTE + VERBA + NUMEROS +
    "\nconst Q = $('Quando').first().json;\n"
    f"const NOS = {json.dumps(nomes, ensure_ascii=False)};\n"
    "const lidas = Object.fromEntries(Object.entries(NOS).map(([k, n]) => [k, $(n).first().json]));\n"
    "return linhasDoDia(Q, lidas).map(json => ({ json }));\n"}))
seq.append(no('Só fora do teste', 'n8n-nodes-base.code', 2, {'jsCode':
    "// ?teste=1: as linhas ficam na execução para conferir, e nada é gravado.\nif ($('Quando').first().json.teste) return [];\nreturn $input.all();\n"}))
seq.append(no('Grava', 'n8n-nodes-base.dataTable', 1.1, {'operation': 'upsert', 'dataTableId': TAB(),
    'filters': {'conditions': [{'keyName': 'chave', 'keyValue': '={{ $json.chave }}'}]},
    'columns': {'mappingMode': 'defineBelow', 'value': {c: '={{ $json.' + c + ' }}' for c in COLUNAS}, 'matchingColumns': [],
                'schema': [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True, 'type': t, 'readOnly': False, 'removed': False} for c, t in COLUNAS.items()]},
    'options': {}}))
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 1000, 'height': 330, 'content': (
    "## BMH · Meta · números do dia (homologação)\n"
    "**Traz:** da conta do Meta da BMH (`act_327952129944258`, credencial `BMH · Meta Instagram (token)`, só leitura) o gasto, exibições, alcance, "
    "cliques no link e conversas por anúncio e por dia, e a verba da conta (limite, saldo pré-pago e orçamentos ligados).\n"
    "**Envia:** linhas na `BMH_meta_anuncios_dia`: uma por anúncio por dia (`tipo = anuncio`) e uma foto da conta por dia (`tipo = conta`), "
    "lidas pelo resumo das 8h.\n"
    "**Limites:** só lê a Meta; regrava os 3 últimos dias às 6h05; leitura com erro para o fluxo (alerta de falha) e nada é gravado pela metade.\n\n"
    f"Manual: `/webhook/{WEBHOOK_NUMEROS}?teste=1` (não grava) ou `?desde=AAAA-MM-DD` (carrega até 31 dias). Regras em "
    "`BMH_Claude_VSL/scripts/n8n/bmh-meta-numeros.js`, testadas com `testa-numeros-meta.js`.")}, y=-420)
nos[-1]['position'][0] = 0
lig = {}
def liga(a, b): lig.setdefault(a, {'main': [[]]})['main'][0].append({'node': b, 'type': 'main', 'index': 0})
for a, b in zip(seq, seq[1:]): liga(a, b)
liga(manual, 'Quando')
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'all', 'saveDataErrorExecution': 'all',
        'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 900}
json.dump({'name': 'BMH · Meta · números do dia (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-meta-numeros-dia.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-meta-numeros-dia.json |', len(nos), 'nós | tabela', TABELA)

# ---------- 2. cópia do resumo das 8h com o bloco do Meta ----------
with urllib.request.urlopen('http://cofre:8080/n8n-leitura/api/v1/workflows/QGDceUjADbnNINb3', timeout=60) as r:
    prod = json.load(r)
FORA = {'Todo dia às 8h', 'Vigia · marca que rodou', 'Vigia · grava'}
rn = [json.loads(json.dumps(n)) for n in prod['nodes'] if n['name'] not in FORA]
por = {n['name']: n for n in rn}
por['Manual']['parameters']['path'] = WEBHOOK_RESUMO
por['Manual']['webhookId'] = uid('webhook-resumo')
g = por['Guardião (tabela)']
rn.append({'id': uid('Meta (tabela)'), 'name': 'Meta (tabela)', 'type': 'n8n-nodes-base.dataTable', 'typeVersion': 1.1,
           'position': [g['position'][0] + 120, g['position'][1] + 220], 'parameters': {'operation': 'get', 'dataTableId': TAB(), 'returnAll': True},
           'alwaysOutputData': True, 'executeOnce': True})
codigo = por['Monta o resumo']['parameters']['jsCode']
def troca(antes, depois):
    global codigo
    n = codigo.count(antes)
    if n != 1: sys.exit(f'o resumo de produção mudou: achei {n} vezes o trecho {antes[:70]!r}; conferir antes de montar')
    codigo = codigo.replace(antes, depois)
troca("t.push('☀️ BMH · resumo de ontem, '", "t.push('🧪 (homologação) ☀️ BMH · resumo de ontem, '")
troca("const t = [];", "// Meta (21/10/2026): bloco lido da BMH_meta_anuncios_dia\n" + AVISO_FONTE + NUMEROS +
      "const META = blocoMeta(linhas('Meta (tabela)'), cfg, { O, M0, hoje: hoje.toISODate(), diaOntem: ontem.day, diasMes: ontem.daysInMonth });\nconst t = [];")
troca("t.push('💬 WhatsApp pelo site:", "t.push(...META.ontem);\nt.push('💬 WhatsApp pelo site:")
troca("t.push('• Contatos do Google Ads: ' + int(cM) + cada(gM, cM));", "t.push('• Contatos do Google Ads: ' + int(cM) + cada(gM, cM));\nt.push(...META.mes);")
troca("if (atraso.length) {", "atraso.push(...META.atraso);\nif (atraso.length) {")
# proposta do Meta não tem botão: não conta como "esperando o seu Aplicar"
troca("gHoje.filter(r => r.acao !== 'avisar' && r.resultado === 'simulado')", "gHoje.filter(r => r.acao !== 'avisar' && r.resultado === 'simulado' && r.plataforma !== 'meta')")
por['Monta o resumo']['parameters']['jsCode'] = codigo
nota = next((n for n in rn if n['type'].endswith('stickyNote')), None)
if nota: nota['parameters']['content'] = (
    "## BMH · Telegram · resumo da manhã (homologação)\n"
    "**Traz:** as mesmas tabelas do resumo de produção (`QGDceUjADbnNINb3`) e a `BMH_meta_anuncios_dia`.\n"
    "**Envia:** o resumo no Telegram, marcado 🧪 (homologação), com o bloco do Meta: ontem (gasto, conversas, cliques), o mês com projeção "
    "e teto (`meta_teto_mes`), a verba da conta e o aviso se a gravação das 6h05 não rodou.\n"
    "**Limites:** só pelo Manual (sem horário, para não duplicar o das 8h); proposta do guardião do Meta não conta como \"esperando o seu Aplicar\" "
    "(não tem botão).\n\n"
    f"Manual: `/webhook/{WEBHOOK_RESUMO}`. Montado por `BMH_Claude_VSL/scripts/n8n/monta-numeros-meta.py` a partir do resumo de produção; "
    "quando aprovado, a mesma mudança vai para o de produção.")
rl = {}
for a, v in prod['connections'].items():
    if a in FORA: continue
    saidas = [[c for c in s if c['node'] not in FORA] for s in v['main']]
    rl[a] = {'main': saidas}
rl['Guardião (tabela)'] = {'main': [[{'node': 'Meta (tabela)', 'type': 'main', 'index': 0}]]}
rl['Meta (tabela)'] = {'main': [[{'node': 'Google · renova o acesso', 'type': 'main', 'index': 0}]]}
json.dump({'name': 'BMH · Telegram · resumo da manhã (homologação)', 'nodes': rn, 'connections': rl, 'settings': prod.get('settings', CONF)},
          open(os.path.join(AQUI, 'bmh-resumo-manha-homologacao.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-resumo-manha-homologacao.json |', len(rn), 'nós | a partir do resumo de produção atualizado em', prod.get('updatedAt'))
