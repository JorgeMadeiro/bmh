"""Nova tentativa no envio do resumo da manhã da BMH (28/11/2026). "BMH · Telegram · resumo da manhã" (QGDceUjADbnNINb3) falhou às 11:00Z de
27/11 em "Envia no Telegram" com "connection closed unexpectedly": o resumo daquele dia não chegou (só há essa execução no dia; a vigia
avisou às 10h23). Conserto: a nova tentativa do próprio nó (3 vezes, 10 s entre elas). Risco aceito: se a conexão cair depois de o Telegram
já ter entregue, o resumo pode chegar em dobro, o que é melhor que não chegar. Nada mais muda.
Lê a produção pelo cofre (VPS) ou pela API do n8n (Mac, com N8N_URL e N8N_API_KEY) e grava scripts/n8n/bmh-resumo-tentativa.json.
  python3 scripts/n8n/monta-resumo-tentativa.py"""
import json, os, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
ID, NO = 'QGDceUjADbnNINb3', 'Envia no Telegram'
if os.environ.get('N8N_API_KEY') and os.environ.get('N8N_URL'):
    req = urllib.request.Request(os.environ['N8N_URL'].rstrip('/') + f'/api/v1/workflows/{ID}', headers={'X-N8N-API-KEY': os.environ['N8N_API_KEY']})
else:
    req = f'http://cofre:8080/n8n-leitura/api/v1/workflows/{ID}'
f = json.load(urllib.request.urlopen(req, timeout=60))
alvo = [n for n in f['nodes'] if n['name'] == NO]
if len(alvo) != 1: sys.exit(f'o fluxo mudou: não achei o nó "{NO}"')
alvo[0].update(retryOnFail=True, maxTries=3, waitBetweenTries=10000)
json.dump({k: f[k] for k in ('name', 'nodes', 'connections', 'settings')}, open(os.path.join(AQUI, 'bmh-resumo-tentativa.json'), 'w', encoding='utf8'),
          ensure_ascii=False, indent=1)
print('gravado bmh-resumo-tentativa.json | base: updatedAt', f['updatedAt'], '|', len(f['nodes']), 'nós')
