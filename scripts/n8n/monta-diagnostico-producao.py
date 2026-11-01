"""Monta scripts/n8n/bmh-diagnostico-producao.json ("BMH · Produção diária · diagnóstico do envio (homologação)", 01/11/2026).
Pedido da Central: a agenda diária dos grupos BMH ADM parou de chegar, sem erro. Só leitura, chamado pelo Manual, que
responde um resumo:
  - estado da instância "Madeiro" na Evolution (a mesma credencial do "Produção Diaria e Mensal BMH", EkmBucG5LoEutBUa);
  - os 3 grupos do fluxo: se existem, o nome, o tamanho e se o número da instância está neles (sem telefone de ninguém);
  - a agenda de hoje no iGut contada por local e por profissional (os ids que o fluxo usa: local 1 e 2; 111, 112, 113, 120,
    121), sem nome de paciente.
Não manda mensagem a ninguém. Não guarda execução (as respostas da Evolution e do iGut trazem dado pessoal).

No n8n: 2JxD4fxK0shWILP5 (criado desligado pela Central em 01/11/2026, idêntico a este JSON).

  python3 scripts/n8n/monta-diagnostico-producao.py"""
import json, os, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
WEBHOOK = 'bmh-diagnostico-producao-5b7e2c91'
EVO = 'https://apiwp-afiliados.cannlink.com.br'
CRED_EVO = {'httpHeaderAuth': {'id': 'FaVy4E4519vzp2EO', 'name': 'Evolution afiliados · instância Madeiro (Dr Jorge)'}}
CRED_IGUT = {'httpCustomAuth': {'id': 'ZezjclTyK2soW4a8', 'name': 'BMH · iGut (acesso)'}}
GRUPOS = [('BMH ADM Asa Sul', '556191523103-1530882330@g.us'), ('BMH ADM Taguatinga', '120363393827994218@g.us'), ('Diretoria', '120363205793119192@g.us')]
uid = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-diagnostico-producao/' + n))
LEITURA = dict(retryOnFail=True, maxTries=2, waitBetweenTries=3000, onError='continueRegularOutput', alwaysOutputData=True)

nos, x = [], 0
def no(nome, tipo, versao, parametros, **extra):
    global x
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': [x, 0], 'parameters': parametros, **extra}); x += 240
    return nome
seq = [no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'responseMode': 'lastNode', 'options': {}}, webhookId=uid('webhook'))]
http = lambda url, **p: {'url': url, 'authentication': 'genericCredentialType', 'genericAuthType': 'httpHeaderAuth', 'options': {'timeout': 30000}, **p}
seq.append(no('Evolution · estado', 'n8n-nodes-base.httpRequest', 4.2, http(f'{EVO}/instance/connectionState/Madeiro'), credentials=CRED_EVO, executeOnce=True, **LEITURA))
seq.append(no('Evolution · instância', 'n8n-nodes-base.httpRequest', 4.2, http(f'{EVO}/instance/fetchInstances',
    sendQuery=True, queryParameters={'parameters': [{'name': 'instanceName', 'value': 'Madeiro'}]}), credentials=CRED_EVO, executeOnce=True, **LEITURA))
seq.append(no('Grupos', 'n8n-nodes-base.code', 2, {'jsCode': 'return ' + json.dumps([{'json': {'nome': n, 'jid': j}} for n, j in GRUPOS], ensure_ascii=False) + ';\n'}))
seq.append(no('Evolution · grupo', 'n8n-nodes-base.httpRequest', 4.2, http(f'{EVO}/group/findGroupInfos/Madeiro',
    sendQuery=True, queryParameters={'parameters': [{'name': 'groupJid', 'value': '={{ $json.jid }}'}]}), credentials=CRED_EVO, **LEITURA))
seq.append(no('iGut · agenda de hoje', 'n8n-nodes-base.httpRequest', 4.4, {'method': 'POST', 'url': 'https://api.igut.med.br/v2/consultas/buscar',
    'sendHeaders': True, 'headerParameters': {'parameters': [{'name': 'Content-Type', 'value': 'application/json'}]}, 'sendBody': True, 'specifyBody': 'json',
    'jsonBody': "={\n  \"Agendamento.data\": \"{{ $now.toFormat('yyyy-MM-dd') }}\",\n  \"Agendamento.data_fim\": \"{{ $now.toFormat('yyyy-MM-dd') }}\"\n}",
    'options': {'response': {'response': {'responseFormat': 'json'}}}, 'authentication': 'genericCredentialType', 'genericAuthType': 'httpCustomAuth'},
    credentials=CRED_IGUT, executeOnce=True, **LEITURA))
RESUMO = open(os.path.join(AQUI, 'bmh-diagnostico-producao.js'), encoding='utf8').read().split('// FIM-DA-FUNCAO')[0].rstrip() + '\n'
seq.append(no('Resumo', 'n8n-nodes-base.code', 2, {'jsCode': (
    '// Regra em scripts/n8n/bmh-diagnostico-producao.js (BMH_Claude_VSL), copiada pelo montador.\n' + RESUMO +
    "\nconst um = n => { try { return $(n).first().json; } catch (e) { return { error: { message: String(e.message || e) } }; } };\n"
    "const grupos = $('Grupos').all().map((g, i) => ({ nome: g.json.nome, jid: g.json.jid, resposta: ($('Evolution · grupo').all()[i] || {}).json }));\n"
    "return [{ json: resumoDiagnostico(um('Evolution · estado'), um('Evolution · instância'), grupos, um('iGut · agenda de hoje')) }];\n")}))
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 900, 'height': 300, 'content': (
    "## BMH · Produção diária · diagnóstico do envio (homologação)\n"
    "**Traz:** o estado da instância Madeiro na Evolution, os 3 grupos do \"Produção Diaria e Mensal BMH\" (EkmBucG5LoEutBUa) e a agenda de "
    "hoje no iGut, com as mesmas credenciais do fluxo.\n**Envia:** só a resposta do Manual: um resumo sem telefone e sem nome de paciente.\n"
    "**Limites:** só leitura; não manda mensagem a ninguém; não guarda execução.\n\n"
    f"Manual: `/webhook/{WEBHOOK}`. Pedido da Central em 01/11/2026 (a agenda dos grupos BMH ADM parou de chegar sem erro).")})
nos[-1]['position'] = [0, -360]
lig = {}
for a, b in zip(seq, seq[1:]): lig[a] = {'main': [[{'node': b, 'type': 'main', 'index': 0}]]}
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'none',
        'saveManualExecutions': False, 'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 120}
json.dump({'name': 'BMH · Produção diária · diagnóstico do envio (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-diagnostico-producao.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-diagnostico-producao.json |', len(nos), 'nós')
