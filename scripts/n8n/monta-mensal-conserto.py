"""Conserto do "BMH · Diretoria · produção do mês" (fvEYln7d2wWi4N2S), 04/11/2026. Lê o fluxo de produção e gera a versão para
regravar pelo Mac, com o toque do Jorge:
  1. pedido 136: o envio ao grupo da diretoria passa para o servidor de afiliados, onde a instância Madeiro existe
     (apiwp-afiliados.cannlink.com.br), com a credencial da agenda diária. Grupo e texto iguais;
  2. pedido do Jorge de 04/11 ("faltou comparar com o ano anterior"): a mensagem ganha a linha "vs <mês>/<ano passado>: sessões
     · produzido", com o número que o nó "Monta" já calculava (TA, da BMH_igut_dia, a mesma regra do mês anterior) e não mostrava.

O nó "Monta" tem a senha do painel escrita (decisão do Jorge de 12/10: ela vai na mensagem do grupo), então a SAÍDA NÃO VAI PARA
O GIT: grava em dados/n8n-copias/. Só este montador fica no repositório.
  python3 scripts/n8n/monta-mensal-conserto.py
Lê pelo cofre (VPS) ou, se houver N8N_URL e N8N_API_KEY no ambiente (Mac), direto pela API do n8n."""
import json, os, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, '..', '..', 'dados', 'n8n-copias')
ID = 'fvEYln7d2wWi4N2S'
CRED_MADEIRO = {'httpHeaderAuth': {'id': 'FaVy4E4519vzp2EO', 'name': 'Evolution afiliados · instância Madeiro (Dr Jorge)'}}

if os.environ.get('N8N_API_KEY') and os.environ.get('N8N_URL'):
    req = urllib.request.Request(os.environ['N8N_URL'].rstrip('/') + f'/api/v1/workflows/{ID}', headers={'X-N8N-API-KEY': os.environ['N8N_API_KEY']})
else:
    req = f'http://cofre:8080/n8n-leitura/api/v1/workflows/{ID}'
f = json.load(urllib.request.urlopen(req, timeout=60))
por = {n['name']: n for n in f['nodes']}
for nome in ('WhatsApp · grupo da diretoria', 'Monta'):
    if nome not in por: sys.exit(f'o fluxo mudou: não achei o nó "{nome}"; conferir antes de montar')

# 1. servidor e credencial do envio
w = por['WhatsApp · grupo da diretoria']
ANTES = 'https://apiwp.cannlink.com.br/message/sendText/Madeiro'
if w['parameters'].get('url') == ANTES:
    w['parameters']['url'] = 'https://apiwp-afiliados.cannlink.com.br/message/sendText/Madeiro'
    w['credentials'] = CRED_MADEIRO
elif 'apiwp-afiliados' not in w['parameters'].get('url', ''):
    sys.exit('o endereço do envio não é o esperado; conferir antes de montar')

# 2. linha do ano anterior
js = por['Monta']['parameters']['jsCode']
ALVO = "if (T0.s && T1.s) L.push(`vs ${soMes(Q.mes1)}: sessões ${var_(T0.s, T1.s)} · produzido ${var_(T0.v, T1.v)}`);"
NOVA = ALVO + ("\n// ano anterior (Jorge, 04/11/2026: \"faltou comparar com o ano anterior\"): o mesmo mês do ano passado, pela mesma tabela e regra\n"
               "if (T0.s && TA.s) L.push(`vs ${nomeMes(Q.mesAnoPassado).toLowerCase()}: sessões ${var_(T0.s, TA.s)} · produzido ${var_(T0.v, TA.v)}`);")
if 'TA.s) L.push' in js: print('a linha do ano anterior já está no fluxo')
elif js.count(ALVO) != 1: sys.exit('não achei (uma vez só) a linha da comparação com o mês anterior no "Monta"; conferir antes de montar')
else: por['Monta']['parameters']['jsCode'] = js.replace(ALVO, NOVA)

os.makedirs(SAIDA, exist_ok=True)
arq = os.path.join(SAIDA, f'{ID}-conserto-136-e-ano-anterior.json')
json.dump({k: f[k] for k in ('name', 'nodes', 'connections', 'settings')}, open(arq, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado', os.path.relpath(arq), '(fora do git) | base: updatedAt', f['updatedAt'], '| nós', len(f['nodes']))
