"""Paginação do Kommo da BMH à prova da página vazia (19/11/2026). "BMH · Kommo · passagem para a unidade" (YSJaUQMQffVcfmra) falhou às
01:03Z de 19/11 em "Leads no Kommo" com 'The "data" argument must be of type string ... Received undefined': quando o total cai num
múltiplo exato de 250, ou a lista vem vazia, a página seguinte volta 204 sem corpo e o n8n quebra ao ler como JSON, antes de parar
no 204. Mesmo defeito e mesmo conserto da Nexo (pedidos 152 e 153, Nexo_Claude_VSL/scripts/n8n/monta-paginacao-kommo.py):
a chamada vira "Leads no Kommo (páginas)", pede as páginas como arquivo e para no 204; um nó de código com o nome de antes lê as
páginas e devolve uma por item, no mesmo formato (quem lia o nó, "Contatos a buscar" e "Decide a passagem", lê igual: os dois usam
corpo(p.json), que aceita _embedded). Lista incompleta (página que não é JSON, ou o teto de 40 páginas) faz o nó falhar, como antes.
O fluxo é do Mac (montado em 17/11, modo real em 18/11) e move leads de verdade: NÃO se roda cópia dele.
Uso:
  python3 scripts/n8n/monta-paginacao-kommo-bmh.py         lê a produção (cofre na VPS; no Mac, N8N_URL e N8N_API_KEY do .env) e grava
                                                         scripts/n8n/bmh-kommo-passagem-paginacao.json, com a versão de que partiu
  python3 scripts/n8n/monta-paginacao-kommo-bmh.py grava   só no Mac, com o toque do Jorge: grava se a produção ainda for a versão
                                                         de que partiu, lê de volta (cópia de antes em dados/n8n-copias/)"""
import copy, json, os, sys, urllib.request, uuid

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
ID, NOME_FLUXO, NO = 'YSJaUQMQffVcfmra', 'BMH · Kommo · passagem para a unidade', 'Leads no Kommo'
ARQ = os.path.join(AQUI, 'bmh-kommo-passagem-paginacao.json')
ENV = dict(l.strip().split('=', 1) for l in open(os.path.join(RAIZ, '.env'), encoding='utf8') if '=' in l and not l.startswith('#')) if os.path.exists(os.path.join(RAIZ, '.env')) else {}
N8N, CHAVE = (ENV.get('N8N_URL') or os.environ.get('N8N_URL', '')).rstrip('/'), ENV.get('N8N_API_KEY') or os.environ.get('N8N_API_KEY')


def le(i):
    if CHAVE: return json.load(urllib.request.urlopen(urllib.request.Request(f'{N8N}/api/v1/workflows/{i}', headers={'X-N8N-API-KEY': CHAVE}), timeout=60))
    return json.load(urllib.request.urlopen(f'http://cofre:8080/n8n-leitura/api/v1/workflows/{i}', timeout=60))


def le_js(teto):   # o mesmo código do conserto da Nexo (07/11/2026)
    return (r"""// 19/11/2026 (igual ao conserto da Nexo, nº 152): as páginas do Kommo chegam como arquivo, e a página vazia do fim da lista (204) não
// quebra mais o fluxo. Este nó tem o nome que os outros nós leem e devolve uma página por item, no mesmo formato de antes.
const it = $input.all(); const out = []; let fimVazio = false;
for (let k = 0; k < it.length; k++) {
  const b = it[k].binary && it[k].binary.data;
  if (!b) { if (it[k].json && it[k].json._embedded) out.push({ json: it[k].json, pairedItem: k }); continue; }
  const t = (await this.helpers.getBinaryDataBuffer(k, 'data')).toString('utf8').trim();
  if (!t) { if (k === it.length - 1) fimVazio = true; continue; }   // a página depois da última (204, sem corpo)
  let j; try { j = JSON.parse(t); } catch (e) { throw new Error('Kommo devolveu uma página que não é JSON (página ' + (k + 1) + '): ' + t.slice(0, 120)); }
  out.push({ json: j, pairedItem: k });
}
if (it.length >= """ + str(teto) + r""" && !fimVazio) throw new Error('Kommo: chegou ao teto de """ + str(teto) + r""" páginas; aumentar o teto antes de seguir.');
return out.length ? out : [{ json: {}, pairedItem: 0 }];""")


def aplica(w):
    w = copy.deepcopy(w); n = {x['name']: x for x in w['nodes']}
    novo = NO + ' (páginas)'
    if novo in n: sys.exit('já aplicado: existe "' + novo + '"')
    h = n[NO]; x0, y0 = h['position']; p = h['parameters']; pg = p['options']['pagination']['pagination']
    if pg.get('paginationCompleteWhen') != 'receiveSpecificStatusCodes' or str(pg.get('statusCodesWhenComplete')) != '204':
        sys.exit(f'a paginação de "{NO}" mudou ({pg.get("paginationCompleteWhen")}, {pg.get("statusCodesWhenComplete")}): conferir antes de montar')
    teto = int(pg.get('maxRequests') or 0) if pg.get('limitPagesFetched') else 0
    if not teto: pg['limitPagesFetched'] = True; pg['maxRequests'] = teto = 40
    h['name'] = novo
    p['options']['response'] = {'response': {'responseFormat': 'file', 'outputPropertyName': 'data'}}
    cod = {'parameters': {'jsCode': le_js(teto)}, 'name': NO, 'type': 'n8n-nodes-base.code', 'typeVersion': 2,
           'position': [x0 + 120, y0 + 160], 'id': str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-kommo-paginas/' + NO)), 'alwaysOutputData': True}
    if h.get('onError'): cod['onError'] = h['onError']
    w['nodes'].append(cod)
    c = w['connections']
    for tipos in c.values():
        for outs in tipos.values():
            for o in outs:
                for d in o or []:
                    if d['node'] == NO: d['node'] = novo
    saida = c.pop(NO, None)
    c[novo] = {'main': [[{'node': NO, 'type': 'main', 'index': 0}]]}
    if saida: c[NO] = saida
    return w


P = le(ID)
if P['name'] != NOME_FLUXO: sys.exit(f'o id {ID} não é "{NOME_FLUXO}" ({P["name"]})')
if len(sys.argv) > 1 and sys.argv[1] == 'grava':
    if not CHAVE: sys.exit('gravar só no Mac (N8N_URL e N8N_API_KEY no .env)')
    m = json.load(open(ARQ, encoding='utf8'))
    if P['updatedAt'] != m['parte_de']: sys.exit(f'a produção mudou ({P["updatedAt"]}, o arquivo partiu de {m["parte_de"]}): rode sem "grava" para remontar')
    os.makedirs(os.path.join(RAIZ, 'dados', 'n8n-copias'), exist_ok=True)
    json.dump(P, open(os.path.join(RAIZ, 'dados', 'n8n-copias', f'{ID}-antes-paginacao.json'), 'w', encoding='utf8'), ensure_ascii=False)
    OK = ('executionOrder', 'saveDataErrorExecution', 'saveDataSuccessExecution', 'saveManualExecutions', 'saveExecutionProgress', 'executionTimeout', 'errorWorkflow', 'timezone', 'callerPolicy')
    corpo = {'name': P['name'], 'nodes': m['nodes'], 'connections': m['connections'], 'settings': {k: v for k, v in P['settings'].items() if k in OK}}
    r = urllib.request.urlopen(urllib.request.Request(f'{N8N}/api/v1/workflows/{ID}', data=json.dumps(corpo).encode(), method='PUT',
                               headers={'X-N8N-API-KEY': CHAVE, 'Content-Type': 'application/json'}), timeout=60)
    L = le(ID); prm = lambda ns: {x['name']: json.dumps(x['parameters'], sort_keys=True) for x in ns}
    print('gravado', L['updatedAt'], '| nós', len(L['nodes']), '| lido de volta igual:', prm(L['nodes']) == prm(m['nodes']) and L['connections'] == m['connections'],
          '| ativo:', L['active'])
    sys.exit(0)
w = aplica(P)
json.dump({'nome': P['name'], 'parte_de': P['updatedAt'], 'nodes': w['nodes'], 'connections': w['connections']},
          open(ARQ, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'{P["name"]} | produção {P["updatedAt"]} | nós {len(P["nodes"])} -> {len(w["nodes"])} | gravado {os.path.relpath(ARQ, RAIZ)}')
