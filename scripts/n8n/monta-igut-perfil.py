"""Monta scripts/n8n/bmh-igut-perfil.json ("BMH · iGut · perfil dos pacientes novos (homologação)", 12/11/2026). Pedido do Jorge
(12/11, pela Central): ver no iGut a faixa de idade e o gênero dos pacientes novos dos últimos 12 meses, e a origem se der, para afinar
o público da campanha de mensagem do Meta. SÓ NÚMEROS AGREGADOS: o fluxo lê a agenda dia a dia (o mês inteiro dá 504) e devolve
contagens; nome, CPF, telefone, data de nascimento e qualquer dado de pessoa ficam dentro da execução, que NÃO é guardada
(saveDataSuccessExecution e saveDataErrorExecution = none). Lista com menos de 3 vira "outros".
Paciente novo = o primeiro agendamento de avaliação (tipodeatendimento com "avalia") de cada paciente no período.
  /webhook/<caminho>?desde=AAAA-MM-DD&ate=AAAA-MM-DD   (padrão: os 365 dias até ontem)
Desligado; a Central liga só para a chamada e desliga.

  python3 scripts/n8n/monta-igut-perfil.py"""
import json, os, uuid

AQUI = os.path.dirname(os.path.abspath(__file__))
WEBHOOK = 'bmh-igut-perfil-4b81e7'
CRED_IGUT = {'httpCustomAuth': {'id': 'ZezjclTyK2soW4a8', 'name': 'BMH · iGut (acesso)'}}
uid = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, 'bmh-igut-perfil/' + n))
nos = []
def no(nome, tipo, versao, parametros, pos, **extra):
    nos.append({'id': uid(nome), 'name': nome, 'type': tipo, 'typeVersion': versao, 'position': pos, 'parameters': parametros, **extra})

no('Manual', 'n8n-nodes-base.webhook', 2, {'path': WEBHOOK, 'responseMode': 'lastNode', 'options': {}}, [0, 0], webhookId=uid('webhook'))
no('Dias', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Um item por dia (a agenda do iGut só responde dia a dia).\n"
    "const q = $('Manual').first().json.query || {}, ok = s => /^\\d{4}-\\d{2}-\\d{2}$/.test(s || '') ? s : '';\n"
    "const ate = ok(q.ate) || $now.minus({ days: 1 }).toISODate(), desde = ok(q.desde) || $now.minus({ days: 365 }).toISODate();\n"
    "const out = []; for (let d = DateTime.fromISO(desde); d <= DateTime.fromISO(ate) && out.length < 400; d = d.plus({ days: 1 })) out.push({ json: { dia: d.toISODate() } });\n"
    "return out;\n")}, [240, 0])
no('iGut · agenda do dia', 'n8n-nodes-base.httpRequest', 4.4, {'method': 'POST', 'url': 'https://api.igut.med.br/v2/consultas/buscar',
    'sendHeaders': True, 'headerParameters': {'parameters': [{'name': 'Content-Type', 'value': 'application/json'}]}, 'sendBody': True, 'specifyBody': 'json',
    'jsonBody': '={ "Agendamento.data": "{{ $json.dia }}", "Agendamento.data_fim": "{{ $json.dia }}" }',
    'options': {'response': {'response': {'responseFormat': 'json', 'fullResponse': False}}, 'timeout': 60000, 'batching': {'batch': {'batchSize': 3, 'batchInterval': 400}}},
    'authentication': 'genericCredentialType', 'genericAuthType': 'httpCustomAuth'}, [480, 0],
    credentials=CRED_IGUT, retryOnFail=True, maxTries=3, waitBetweenTries=3000, onError='continueRegularOutput', alwaysOutputData=True)
no('Agrega (só números)', 'n8n-nodes-base.code', 2, {'jsCode': (
    "// Só contagens saem daqui (pedido do Jorge de 12/11/2026). Nada de nome, CPF, telefone ou data de nascimento na resposta.\n"
    "const dias = $('Dias').all().map(i => i.json.dia);\n"
    "const lista = []; let erros = 0;\n"
    "const junta = v => { if (Array.isArray(v)) v.forEach(junta); else if (v && typeof v === 'object') { if (v.Agendamento) lista.push(v); else Object.values(v).forEach(x => (Array.isArray(x) || (x && typeof x === 'object')) && junta(x)); } };\n"
    "for (const i of $input.all()) { if (i.json && i.json.error) erros++; else junta(i.json); }\n"
    "const acha = (o, re, prof = 0) => { if (!o || typeof o !== 'object' || prof > 3) return undefined; for (const [k, v] of Object.entries(o)) { if (re.test(k) && v !== null && v !== '' && typeof v !== 'object') return v; } for (const v of Object.values(o)) { const r = acha(v, re, prof + 1); if (r !== undefined) return r; } return undefined; };\n"
    "const camposPac = new Set(); for (const a of lista.slice(0, 200)) Object.keys(a.Paciente || {}).forEach(k => camposPac.add(k));\n"
    "const nasc = s => { const t = String(s || ''); let m = t.match(/^(\\d{4})-(\\d{2})-(\\d{2})/); if (m) return new Date(+m[1], +m[2] - 1, +m[3]); m = t.match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };\n"
    "const faixa = n => n == null || n < 0 || n > 110 ? 'sem data' : n < 18 ? 'menos de 18' : n < 25 ? '18 a 24' : n < 35 ? '25 a 34' : n < 45 ? '35 a 44' : n < 55 ? '45 a 54' : n < 65 ? '55 a 64' : '65 ou mais';\n"
    "const genero = v => { const t = String(v || '').trim().toLowerCase(); return /^f|fem/.test(t) ? 'feminino' : /^m|masc/.test(t) ? 'masculino' : 'não informado'; };\n"
    "// paciente novo: o 1º agendamento de avaliação de cada paciente no período (a chave do paciente só existe em memória)\n"
    "const novos = new Map();\n"
    "for (const a of lista.sort((x, y) => String(x.Agendamento?.data).localeCompare(String(y.Agendamento?.data)))) {\n"
    "  if (!/avalia/i.test(String(a.Agendamento?.tipodeatendimento || ''))) continue;\n"
    "  const p = a.Paciente || {}, chave = p.id ?? p.codigo ?? p.cpf ?? p.nome; if (chave == null || novos.has(chave)) continue;\n"
    "  const dn = nasc(acha(p, /nasc/i)), dia = new Date(String(a.Agendamento?.data || '').slice(0, 10) + 'T12:00:00');\n"
    "  const idade = dn ? Math.floor((dia - dn) / 3.15576e10) : null;\n"
    "  novos.set(chave, { faixa: faixa(idade), idade, genero: genero(acha(p, /sexo|g[eê]nero/i)), unidade: a.Profissional?.id === 120 || a.Profissional?.id === 121 ? 'Taguatinga' : 'Asa Sul',\n"
    "    solicitante: acha(a, /solicitante/i) !== undefined, especialidade: String(acha(a, /especialidade/i) || '').trim().toLowerCase(),\n"
    "    convenio: String(acha(a, /^convenio$|convenio.*nome|^nome_?convenio/i) ?? acha(a.Convenio || {}, /nome|descri/i) ?? '').trim().toUpperCase(),\n"
    "    cidade: String(acha(p, /cidade/i) || '').trim().toUpperCase() });\n"
    "}\n"
    "const ps = [...novos.values()], conta = (f, min = 1) => { const c = {}; for (const p of ps) { const k = f(p) || '(vazio)'; c[k] = (c[k] || 0) + 1; }\n"
    "  const out = {}, outros = Object.entries(c).filter(([, n]) => n < min).reduce((s, [, n]) => s + n, 0); for (const [k, n] of Object.entries(c).sort((a, b) => b[1] - a[1])) if (n >= min) out[k] = n; if (outros) out['outros (menos de ' + min + ' cada)'] = outros; return out; };\n"
    "const idades = ps.map(p => p.idade).filter(n => n != null && n >= 0 && n <= 110).sort((a, b) => a - b);\n"
    "const med = idades.length ? idades[Math.floor(idades.length / 2)] : null;\n"
    "return [{ json: { periodo: { desde: dias[0], ate: dias[dias.length - 1], dias: dias.length, dias_com_erro: erros }, agendamentos_lidos: lista.length,\n"
    "  pacientes_novos: ps.length, idade_mediana: med, idade_media: idades.length ? Math.round(idades.reduce((s, n) => s + n, 0) / idades.length) : null,\n"
    "  faixas: conta(p => p.faixa), genero: conta(p => p.genero), faixas_por_genero: conta(p => p.genero + ' · ' + p.faixa, 3), por_unidade: conta(p => p.unidade),\n"
    "  com_medico_solicitante: ps.filter(p => p.solicitante).length, especialidade_do_solicitante: conta(p => p.especialidade, 3),\n"
    "  convenios: conta(p => p.convenio, 3), cidades: conta(p => p.cidade, 5), campos_do_paciente_no_igut: [...camposPac].sort() } }];\n")}, [720, 0])
no('Sobre este fluxo', 'n8n-nodes-base.stickyNote', 1, {'width': 900, 'height': 300, 'content': (
    "## BMH · iGut · perfil dos pacientes novos (homologação)\n"
    "**Traz:** a agenda do iGut dia a dia no período (padrão: 365 dias até ontem).\n"
    "**Envia:** só contagens na resposta do Manual: faixa de idade, gênero, unidade, médico solicitante, especialidade, convênio e cidade "
    "dos pacientes novos (1ª avaliação de cada um). Listas com menos de 3 (cidade: 5) viram \"outros\".\n"
    "**Limites:** pedido do Jorge de 12/11/2026, para o público do Meta. Nada de dado de pessoa sai; a execução não é guardada. "
    "Desligado: a Central liga só para a chamada.\n\n"
    f"Manual: `/webhook/{WEBHOOK}?desde=AAAA-MM-DD&ate=AAAA-MM-DD`.")}, [0, -380])
lig = {'Manual': {'main': [[{'node': 'Dias', 'type': 'main', 'index': 0}]]}, 'Dias': {'main': [[{'node': 'iGut · agenda do dia', 'type': 'main', 'index': 0}]]},
       'iGut · agenda do dia': {'main': [[{'node': 'Agrega (só números)', 'type': 'main', 'index': 0}]]}}
CONF = {'executionOrder': 'v1', 'timezone': 'America/Sao_Paulo', 'saveDataSuccessExecution': 'none', 'saveDataErrorExecution': 'none',
        'saveManualExecutions': False, 'saveExecutionProgress': False, 'errorWorkflow': '7u3CuyjESsHmCtMW', 'executionTimeout': 1800}
json.dump({'name': 'BMH · iGut · perfil dos pacientes novos (homologação)', 'nodes': nos, 'connections': lig, 'settings': CONF},
          open(os.path.join(AQUI, 'bmh-igut-perfil.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('gravado bmh-igut-perfil.json |', len(nos), 'nós')
