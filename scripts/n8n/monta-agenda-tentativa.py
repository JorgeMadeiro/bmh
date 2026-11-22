"""Nova tentativa na leitura da agenda das 17h da BMH (22/11/2026). "Produção Diaria e Mensal BMH" (EkmBucG5LoEutBUa) falhou às 20:00Z de
21/11 em "Buscar Agendamentos BMH" com "Gateway timed out" do iGut (BMH_falhas, linha 27): a agenda dos grupos daquela tarde não saiu.
O nó irmão "Buscar Agendamentos BMH1" já tenta de novo; este não. O nó só lê a agenda, então repetir é seguro: liga a nova tentativa
do próprio nó (3 vezes, 10 s entre elas). Nada mais muda.
Lê a produção pelo cofre (VPS) ou pela API do n8n (Mac, com N8N_URL e N8N_API_KEY) e grava scripts/n8n/bmh-agenda-tentativa.json.
  python3 scripts/n8n/monta-agenda-tentativa.py"""
import json, os, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
ID, NO = 'EkmBucG5LoEutBUa', 'Buscar Agendamentos BMH'
if os.environ.get('N8N_API_KEY') and os.environ.get('N8N_URL'):
    req = urllib.request.Request(os.environ['N8N_URL'].rstrip('/') + f'/api/v1/workflows/{ID}', headers={'X-N8N-API-KEY': os.environ['N8N_API_KEY']})
else:
    req = f'http://cofre:8080/n8n-leitura/api/v1/workflows/{ID}'
f = json.load(urllib.request.urlopen(req, timeout=60))
alvo = [n for n in f['nodes'] if n['name'] == NO]
if len(alvo) != 1: sys.exit(f'o fluxo mudou: não achei o nó "{NO}"')
alvo[0].update(retryOnFail=True, maxTries=3, waitBetweenTries=10000)
json.dump({k: f[k] for k in ('name', 'nodes', 'connections', 'settings')}, open(os.path.join(AQUI, 'bmh-agenda-tentativa.json'), 'w', encoding='utf8'),
          ensure_ascii=False, indent=1)
print('gravado bmh-agenda-tentativa.json | base: updatedAt', f['updatedAt'], '|', len(f['nodes']), 'nós')
