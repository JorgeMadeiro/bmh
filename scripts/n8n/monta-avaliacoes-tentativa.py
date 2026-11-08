"""Nova tentativa na leitura das avaliações do Perfil do Google da BMH (08/11/2026). "BMH · Perfil do Google · avaliações"
(yNozxi1jNwRbLhFR) caiu com 503 do Google no nó "Avaliações do perfil" em 30/10 e em 08/11 (BMH_falhas, linhas 6 e 9). Nas duas a
rodada seguinte, 30 min depois, leu tudo e nada se perdeu, mas cada uma virou alerta de falha no Telegram do Jorge. O nó só lê
(as avaliações sem resposta dos dois perfis), então repetir é seguro: liga a nova tentativa do próprio nó (3 vezes, 5 s entre
elas). Nada mais muda.
Lê a produção pelo cofre (VPS) ou pela API do n8n (Mac, com N8N_URL e N8N_API_KEY) e grava scripts/n8n/bmh-avaliacoes-tentativa.json.
  python3 scripts/n8n/monta-avaliacoes-tentativa.py"""
import json, os, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
ID, NO = 'yNozxi1jNwRbLhFR', 'Avaliações do perfil'
if os.environ.get('N8N_API_KEY') and os.environ.get('N8N_URL'):
    req = urllib.request.Request(os.environ['N8N_URL'].rstrip('/') + f'/api/v1/workflows/{ID}', headers={'X-N8N-API-KEY': os.environ['N8N_API_KEY']})
else:
    req = f'http://cofre:8080/n8n-leitura/api/v1/workflows/{ID}'
f = json.load(urllib.request.urlopen(req, timeout=60))
alvo = [n for n in f['nodes'] if n['name'] == NO]
if len(alvo) != 1: sys.exit(f'o fluxo mudou: não achei o nó "{NO}"')
alvo[0].update(retryOnFail=True, maxTries=3, waitBetweenTries=5000)
json.dump({k: f[k] for k in ('name', 'nodes', 'connections', 'settings')}, open(os.path.join(AQUI, 'bmh-avaliacoes-tentativa.json'), 'w', encoding='utf8'),
          ensure_ascii=False, indent=1)
print('gravado bmh-avaliacoes-tentativa.json | base: updatedAt', f['updatedAt'], '|', len(f['nodes']), 'nós')
