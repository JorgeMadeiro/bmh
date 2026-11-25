"""Nova tentativa na leitura da tabela de mensagens do WhatsApp (25/11/2026). "BMH · WhatsApp · texto do que saiu pelo Kommo"
(V1kmaPiSLKtZKc05, do Mac, 22/11) falhou em "Mensagens (tabela)" às 20:53Z de 24/11 e às 10:53Z de 25/11 com "synchronization error: result
count changed during pagination": lê a BMH_whatsapp_meta inteira (returnAll) enquanto o recebedor grava nela. A rodada seguinte, 30 min
depois, passa, mas a tabela só cresce e a chance aumenta. Conserto barato: a nova tentativa do próprio nó (3 vezes, 5 s entre elas); o nó
só lê. O conserto de fundo (ler só os últimos dias por filtro de data, já que o fluxo usa ~3 dias) fica com o Mac, dono do fluxo.
  python3 scripts/n8n/monta-whatsapp-texto-tentativa.py   (cofre na VPS; no Mac, N8N_URL e N8N_API_KEY) -> scripts/n8n/bmh-whatsapp-texto-tentativa.json"""
import json, os, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
ID, NO = 'V1kmaPiSLKtZKc05', 'Mensagens (tabela)'
if os.environ.get('N8N_API_KEY') and os.environ.get('N8N_URL'):
    req = urllib.request.Request(os.environ['N8N_URL'].rstrip('/') + f'/api/v1/workflows/{ID}', headers={'X-N8N-API-KEY': os.environ['N8N_API_KEY']})
else:
    req = f'http://cofre:8080/n8n-leitura/api/v1/workflows/{ID}'
f = json.load(urllib.request.urlopen(req, timeout=60))
alvo = [n for n in f['nodes'] if n['name'] == NO]
if len(alvo) != 1: sys.exit(f'o fluxo mudou: não achei o nó "{NO}"')
alvo[0].update(retryOnFail=True, maxTries=3, waitBetweenTries=5000)
json.dump({k: f[k] for k in ('name', 'nodes', 'connections', 'settings')}, open(os.path.join(AQUI, 'bmh-whatsapp-texto-tentativa.json'), 'w', encoding='utf8'),
          ensure_ascii=False, indent=1)
print('gravado bmh-whatsapp-texto-tentativa.json | base: updatedAt', f['updatedAt'], '|', len(f['nodes']), 'nós')
