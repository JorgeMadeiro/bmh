"""Conserto do silêncio do "Produção Diaria e Mensal BMH" (EkmBucG5LoEutBUa), 01/11/2026. A agenda dos grupos BMH ADM parou
de chegar em 29/10 sem nenhum erro: os 5 envios pelo WhatsApp têm "continuar com saída de erro" e essa saída não leva a nada.
Lê o fluxo de produção pelo cofre (n8n-leitura) e gera:

  bmh-producao-diaria-conserto.json      o fluxo de produção com o conserto, para regravar com o pode (mesmo nome e ids):
    - a saída de erro de cada envio vai a um aviso no robô BMH alertas com o grupo e o motivo. Não termina em erro de
      propósito: o n8n roda um ramo por vez, e parar no primeiro envio que falha cancelaria os grupos que ainda não saíram;
    - o par Vigia no "Todo dia às 17h" (chave producao_diaria, 26 h): mostra todo dia se o gatilho disparou.
  bmh-producao-diaria-teste.json         cópia "(homologação)" para testar o aviso sem mandar nada aos grupos: os envios
    apontam para uma instância que não existe (o envio falha de certeza), sem horário e sem vigia, com um Manual que pula a
    espera do fim das sessões. Só monta mensagem em dia com agenda no iGut.

No n8n: o teste é vRz3ZLhBjasmqXqc (criado desligado pela Central em 01/11/2026); o conserto vai por PUT no EkmBucG5LoEutBUa, com o pode.

  python3 scripts/n8n/monta-producao-conserto.py"""
import json, os, sys, uuid, copy, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _vigia_bmh import nos_vigia, liga_vigia

CRED_TELEGRAM = {'telegramApi': {'id': 'SgQHWuJOuMWeVbPi', 'name': 'BMH · Telegram (robô BMH alertas)'}}
ENVIOS = {  # nó de envio → nome do grupo no aviso
    'Enviar mensagem Grupo Asa Sul': 'BMH ADM Asa Sul (agenda de hoje)',
    'Enviar mensagem Grupo Taguatinga': 'BMH ADM Taguatinga (agenda de hoje)',
    'Enviar mensagem Grupo Asa Sul1': 'BMH ADM Asa Sul (agenda de amanhã)',
    'Enviar mensagem Grupo Taguatinga1': 'BMH ADM Taguatinga (agenda de amanhã)',
    'Enviar mensagem Grupo Diretoria': 'Diretoria (relatório do dia)',
}
uid = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-producao-conserto/' + n))

with urllib.request.urlopen('http://cofre:8080/n8n-leitura/api/v1/workflows/EkmBucG5LoEutBUa', timeout=60) as r:
    prod = json.load(r)
nomes = {n['name'] for n in prod['nodes']}
faltam = [n for n in list(ENVIOS) + ['Todo dia às 17h', 'Buscar Agendamentos BMH'] if n not in nomes]
if faltam: sys.exit(f'o fluxo de produção mudou: não achei {faltam}; conferir antes de montar')
for n in prod['nodes']:
    if n['name'] in ENVIOS and n.get('onError') != 'continueErrorOutput':
        sys.exit(f'o envio "{n["name"]}" não está mais com saída de erro; conferir antes de montar')
if any(n['name'].startswith('Avisa envio que falhou') for n in prod['nodes']): sys.exit('o conserto já está no fluxo de produção')


def com_aviso(base, teste=False):
    f = copy.deepcopy(base)
    nos, lig = f['nodes'], f['connections']
    pos = {n['name']: n['position'] for n in nos}
    for envio, grupo in ENVIOS.items():
        nome = f'Avisa envio que falhou · {grupo}'
        x, y = pos[envio]
        nos.append({'id': uid(nome + ('t' if teste else '')), 'name': nome, 'type': 'n8n-nodes-base.code', 'typeVersion': 2, 'position': [x + 240, y + 180],
                    'parameters': {'jsCode': (
                        f"// Saída de erro do nó \"{envio}\" (01/11/2026): antes ela não levava a nada e a falha sumia.\n"
                        "// Falha da instância (fechada, sem autorização, inexistente): todos os envios vão falhar, então o aviso diz\n"
                        "// \"instância fora do ar\" e o nó depois do Telegram faz o fluxo terminar em erro (alerta de falha e BMH_falhas).\n"
                        "// Falha só deste grupo: avisa e os outros grupos seguem (parar cancelaria os que ainda não saíram).\n"
                        "const e = $input.first().json.error || $input.first().json;\n"
                        "const motivo = String(e.message || e.description || JSON.stringify(e)).replace(/apikey[^,}\\s]*/gi, 'apikey=[removido]').slice(0, 300);\n"
                        "const instancia = /connection closed|not connected|\\bclose\\b|instance.*(not|does not) exist|não existe|unauthori[sz]ed|\\b401\\b|forbidden/i.test(motivo);\n"
                        f"const t = '{'🧪 TESTE: ' if teste else ''}⚠️ BMH: ';\n"
                        f"return [{{ json: {{ texto: instancia ? t + 'a instância Madeiro do WhatsApp está fora do ar, e a mensagem não foi para {grupo} nem vai para os outros grupos. Reconectar pelo QR no celular. (' + motivo + ')' : t + 'a mensagem não foi para o grupo {grupo}: ' + motivo + '. Os outros grupos seguem.' }} }}];\n")}})
        m = lig.setdefault(envio, {'main': [[]]})['main']
        while len(m) < 2: m.append([])
        m[1] = [{'node': nome, 'type': 'main', 'index': 0}]
        lig[nome] = {'main': [[{'node': 'Telegram · envio que falhou', 'type': 'main', 'index': 0}]]}
    tx, ty = max(p[0] for p in pos.values()) + 480, min(p[1] for p in pos.values())
    nos.append({'id': uid('telegram' + ('t' if teste else '')), 'name': 'Telegram · envio que falhou', 'type': 'n8n-nodes-base.telegram', 'typeVersion': 1.2,
                'position': [tx, ty], 'parameters': {'chatId': '8708228589',
                'text': "={{ String($json.texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }}",
                'additionalFields': {'appendAttribution': False, 'parse_mode': 'HTML'}},
                'credentials': CRED_TELEGRAM, 'retryOnFail': True, 'maxTries': 3, 'waitBetweenTries': 5000})
    nos.append({'id': uid('para' + ('t' if teste else '')), 'name': 'Instância fora do ar? Para em erro', 'type': 'n8n-nodes-base.code', 'typeVersion': 2,
                'position': [tx + 240, ty], 'parameters': {'jsCode': (
                    "// Depois do aviso: se a falha foi da instância, termina em erro (passa pelo alerta de falha e fica na BMH_falhas).\n"
                    "// Se foi só de um grupo, segue sem erro para os outros grupos ainda saírem.\n"
                    "const t = String($input.first().json?.result?.text || '');\n"
                    f"if (t.includes('instância Madeiro do WhatsApp está fora do ar')) throw new Error('{'TESTE: ' if teste else ''}instância Madeiro fora do ar: a agenda e o relatório não saíram. ' + t.slice(t.lastIndexOf('(')).slice(0, 250));\n"
                    "return [];\n")}})
    lig['Telegram · envio que falhou'] = {'main': [[{'node': 'Instância fora do ar? Para em erro', 'type': 'main', 'index': 0}]]}
    return f


# 1) produção: aviso + vigia, mesmo nome e mesmos ids dos nós antigos
p = com_aviso(prod)
x0, y0 = p['nodes'][0]['position']
p['nodes'] += nos_vigia('producao_diaria', 'Produção Diaria e Mensal BMH (agenda dos grupos)', (min(n['position'][0] for n in p['nodes']), max(n['position'][1] for n in p['nodes']) + 300))
liga_vigia(p['connections'], 'Todo dia às 17h')
saida = {k: p[k] for k in ('name', 'nodes', 'connections', 'settings')}
json.dump(saida, open(os.path.join(AQUI, 'bmh-producao-diaria-conserto.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-producao-diaria-conserto.json |', len(saida['nodes']), 'nós (eram', len(prod['nodes']), ')')

# 2) teste: envios para instância que não existe, sem horário, sem vigia, Manual que pula a espera
t = com_aviso(prod, teste=True)
t['name'] = 'BMH · Produção diária · teste do aviso de envio (homologação)'
for n in t['nodes']:
    if n['name'] in ENVIOS:
        n['parameters']['url'] = n['parameters']['url'].replace('/sendText/Madeiro', '/sendText/Madeiro-teste-sem-envio')
t['nodes'] = [n for n in t['nodes'] if n['type'] != 'n8n-nodes-base.scheduleTrigger']
for gat in ('Todo dia às 17h', '1x mês final do mês'): t['connections'].pop(gat, None)
t['nodes'].append({'id': uid('manual-teste'), 'name': 'Manual', 'type': 'n8n-nodes-base.webhook', 'typeVersion': 2, 'position': [x0, y0 - 300],
                   'parameters': {'path': 'bmh-producao-teste-aviso-3c8e17', 'options': {}}, 'webhookId': uid('webhook-teste')})
t['connections']['Manual'] = {'main': [[{'node': 'Buscar Agendamentos BMH', 'type': 'main', 'index': 0}]]}
t['settings'] = {**t['settings'], 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'none', 'saveManualExecutions': False}
saida = {k: t[k] for k in ('name', 'nodes', 'connections', 'settings')}
json.dump(saida, open(os.path.join(AQUI, 'bmh-producao-diaria-teste.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-producao-diaria-teste.json |', len(saida['nodes']), 'nós')
