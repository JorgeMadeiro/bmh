"""Par de nós "Vigia" da BMH (22/10/2026), igual ao dos fluxos já vigiados (ex.: guardião do Google): no disparo pelo horário,
anota em BMH_vigia a hora em que o fluxo começou; o "BMH · Vigia · fluxos parados" (6wNDORbM8I1jGEyU) avisa se passar de
max_horas sem anotar. Só o horário marca (o Manual não), como nos outros. Usado pelos montadores desta pasta."""
import uuid

VIGIA = {'__rl': True, 'value': '0kBTGpt8EjCjmR9t', 'mode': 'id', 'cachedResultName': 'BMH_vigia'}
COLS = {'chave': 'string', 'nome': 'string', 'ultima_vez': 'string', 'max_horas': 'number', 'avisado_em': 'string'}


def nos_vigia(chave, nome, posicao, max_horas=26, prefixo='bmh-vigia'):
    uid = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, f'{prefixo}/{chave}/{n}'))
    x, y = posicao
    marca = {'id': uid('marca'), 'name': 'Vigia · marca que rodou', 'type': 'n8n-nodes-base.code', 'typeVersion': 2, 'position': [x, y],
             'parameters': {'jsCode': f"return [{{ json: {{ chave: '{chave}', nome: \"{nome}\", ultima_vez: $now.toISO(), max_horas: {max_horas}, avisado_em: '' }} }}];"}}
    grava = {'id': uid('grava'), 'name': 'Vigia · grava', 'type': 'n8n-nodes-base.dataTable', 'typeVersion': 1.1, 'position': [x + 240, y],
             'parameters': {'operation': 'upsert', 'dataTableId': VIGIA, 'filters': {'conditions': [{'keyName': 'chave', 'keyValue': '={{ $json.chave }}'}]},
                            'columns': {'mappingMode': 'defineBelow', 'value': {c: '={{ $json.' + c + ' }}' for c in COLS}, 'matchingColumns': [],
                                        'schema': [{'id': c, 'displayName': c, 'required': False, 'defaultMatch': False, 'display': True, 'type': t,
                                                    'readOnly': False, 'removed': False} for c, t in COLS.items()]},
                            'options': {}}}
    return [marca, grava]


def liga_vigia(ligacoes, gatilho):
    """Liga o horário ao par Vigia (além do que ele já liga) e a marca à gravação."""
    ligacoes.setdefault(gatilho, {'main': [[]]})['main'][0].append({'node': 'Vigia · marca que rodou', 'type': 'main', 'index': 0})
    ligacoes['Vigia · marca que rodou'] = {'main': [[{'node': 'Vigia · grava', 'type': 'main', 'index': 0}]]}
