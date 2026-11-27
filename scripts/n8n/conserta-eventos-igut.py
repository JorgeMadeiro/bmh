"""Conserto do "BMH · Conversões · eventos do iGut" (ANTADSXOLtNNdIwR), 27/11/2026. A gravação de 26/11 15:16Z (commit 52c5c7e, telemedicina
contada como avaliação) pôs o comentário no meio da linha do "evento", apagando o ": (antes.has(pid) ? '' : 'iniciou')"; o nó "Monta os
eventos" ficou com erro de sintaxe ("Unexpected token 'if'") e a rodada de 27/11 (eventos de 26/11) não enviou nada à Meta nem ao Google.
O arquivo-fonte (integracoes/conversoes/eventos-igut.js) já foi corrigido; este script troca só essa linha na produção, confere a sintaxe
com o node antes de gravar e, com "refaz", roda o dia 26/11 pelo "Rodar agora" (?dia=2026-11-26).
Uso, na pasta da BMH (N8N_URL e N8N_API_KEY do .env):
  python3 scripts/n8n/conserta-eventos-igut.py          confere (acha a linha quebrada; não grava)
  python3 scripts/n8n/conserta-eventos-igut.py grava    grava se a produção ainda for a de 26/11 15:16:26Z (cópia de antes em dados/n8n-copias/)
  python3 scripts/n8n/conserta-eventos-igut.py refaz    depois do grava: refaz os eventos de 26/11 e mostra a resposta"""
import json, os, subprocess, sys, tempfile, urllib.request

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
ENV = dict(l.strip().split('=', 1) for l in open(os.path.join(RAIZ, '.env'), encoding='utf8') if '=' in l and not l.startswith('#'))
U, K = ENV['N8N_URL'].rstrip('/'), ENV['N8N_API_KEY']
ID, NO, BASE = 'ANTADSXOLtNNdIwR', 'Monta os eventos', '2026-11-26T15:16:26.227Z'
QUEBRADA = "? 'avaliou' : '')   // telemedicina é avaliação (Jorge, 26/11/2026) : (antes.has(pid) ? '' : 'iniciou');"
CERTA = "? 'avaliou' : '') : (antes.has(pid) ? '' : 'iniciou');   // telemedicina é avaliação (Jorge, 26/11/2026)"
MODO = sys.argv[1] if len(sys.argv) > 1 else 'confere'
H = {'X-N8N-API-KEY': K, 'Content-Type': 'application/json'}
le = lambda: json.load(urllib.request.urlopen(urllib.request.Request(f'{U}/api/v1/workflows/{ID}', headers=H), timeout=60))


def sintaxe_ok(js):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t: t.write('(async function(){\n' + js + '\n})\n')
    r = subprocess.run(['node', '--check', t.name], capture_output=True, text=True); os.unlink(t.name)
    return r.returncode == 0, (r.stderr or '').strip().splitlines()[:3]


if MODO == 'refaz':
    r = urllib.request.urlopen(f'{U}/webhook/bmh-conversoes-398bf7688687?dia=2026-11-26', timeout=600)
    print('refeito 26/11: HTTP', r.status, '|', r.read()[:400].decode('utf8', 'replace'))
    sys.exit(0)
P = le(); n = next(x for x in P['nodes'] if x['name'] == NO); js = n['parameters']['jsCode']
print(f'{P["name"]} | produção {P["updatedAt"]} | linha quebrada presente: {QUEBRADA in js} | sintaxe hoje: {sintaxe_ok(js)}')
if QUEBRADA not in js: sys.exit('não achei a linha quebrada: o fluxo já mudou; conferir antes')
novo = js.replace(QUEBRADA, CERTA); ok, err = sintaxe_ok(novo)
print('sintaxe depois do conserto:', ok, err)
if not ok: sys.exit('o conserto não fechou a sintaxe: nada gravado')
if MODO != 'grava': sys.exit('conferido. Para gravar: python3 scripts/n8n/conserta-eventos-igut.py grava')
if P['updatedAt'] != BASE: sys.exit(f'a produção mudou ({P["updatedAt"]}, esperado {BASE}): conferir antes')
os.makedirs(os.path.join(RAIZ, 'dados', 'n8n-copias'), exist_ok=True)
json.dump(P, open(os.path.join(RAIZ, 'dados', 'n8n-copias', f'{ID}-antes-sintaxe.json'), 'w', encoding='utf8'), ensure_ascii=False)
n['parameters']['jsCode'] = novo
OK = ('executionOrder', 'saveDataErrorExecution', 'saveDataSuccessExecution', 'saveManualExecutions', 'saveExecutionProgress', 'executionTimeout', 'errorWorkflow', 'timezone', 'callerPolicy')
corpo = {'name': P['name'], 'nodes': P['nodes'], 'connections': P['connections'], 'settings': {k: v for k, v in P['settings'].items() if k in OK}}
urllib.request.urlopen(urllib.request.Request(f'{U}/api/v1/workflows/{ID}', data=json.dumps(corpo).encode(), method='PUT', headers=H), timeout=60)
L = le(); js2 = next(x for x in L['nodes'] if x['name'] == NO)['parameters']['jsCode']
print('gravado', L['updatedAt'], '| ativo', L['active'], '| linha certa no ar:', CERTA in js2, '| sintaxe:', sintaxe_ok(js2)[0])
print('Agora: python3 scripts/n8n/conserta-eventos-igut.py refaz   (eventos de 26/11)')
