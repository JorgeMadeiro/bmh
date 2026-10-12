#!/usr/bin/env python3
"""
Monta a página do painel da BMH a partir da página do painel da Nexo (a que está no ar no n8n, salva em
integracoes/painel/nexo-pagina-referencia.html). Troca nome e cores e faz a página não falar de Kommo, Tintim, guardião
e agendamento que a BMH ainda não mede. Toda troca depende de d.bmh / E.dados.bmh / mede_agendamento, então a página
continua igual para a Nexo.

Uso:  python3 -I integracoes/painel/adaptar-pagina-nexo.py
Cada troca tem que achar o trecho exato; se a Nexo mudou o código, o script lista as que falharam e não grava.
Atualizar a referência: baixar o nó "Entrega a página" do fluxo bKst8atLrI4rB2DM (tirar o "=" do começo e trocar a
linha do DADOS pelo marcador /*__DADOS__*/null).
"""
import os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(AQUI, 'nexo-pagina-referencia.html'), encoding='utf8').read()
falhas = []

def troca(a, b, n=1):
    global t
    c = t.count(a)
    if c != n:
        falhas.append(f'{c}x (esperado {n}): {a[:100]!r}')
        return
    t = t.replace(a, b)

def troca_trecho(ini, fim, novo_de):
    """Troca o trecho entre ini (incluso) e fim (excluso) por novo_de(trecho)."""
    global t
    s = t.find(ini)
    e = t.find(fim, s) if s >= 0 else -1
    if s < 0 or e < 0:
        falhas.append(f'trecho não achado: {ini[:80]!r}')
        return
    t = t[:s] + novo_de(t[s:e]) + t[e:]

MED = 'E.dados.mede_agendamento'

# 1. nome e cores
troca('<title>Anúncios · NEXO</title>', '<title>Painel · BMH</title>')
troca('<h1>Anúncios da Nexo</h1>', '<h1>Painel da BMH</h1>')
troca('--bg:#F3F6F4;--card:#FFFFFF;--ink:#3B3F3D;--strong:#1F2422;--muted:#68706C;--line:#DFE6E2;--soft:#EDF2EF;\n  --verde:#008B47;--verde-2:#2EA55C;--verde-soft:#E1F3E8;--lima:#8DBF44;\n  --google:#2C5F8A;--google-soft:#E4EEF6;--meta:#008B47;--organico:#6B4FA3;--organico-soft:#EEE8F7;',
      '--bg:#F3F6FA;--card:#FFFFFF;--ink:#2B3850;--strong:#142033;--muted:#5B6678;--line:#DCE5EE;--soft:#EDF2F7;\n  --verde:#002375;--verde-2:#1A6E93;--verde-soft:#E6EDF8;--lima:#34A9CF;\n  --google:#2C5F8A;--google-soft:#E4EEF6;--meta:#7B61C9;--organico:#1A8F8A;--organico-soft:#E0F2F1;')
troca('--verde:#3DB86C;--verde-2:#46B872;--verde-soft:#193325;--lima:#A3CF5E;\n  --google:#7FB0DD;--google-soft:#1C2A36;--meta:#3DB86C;--organico:#B7A2E0;--organico-soft:#28213A;',
      '--verde:#7FA8F0;--verde-2:#5BC3E3;--verde-soft:#1A2440;--lima:#5BC3E3;\n  --google:#7FB0DD;--google-soft:#1C2A36;--meta:#A898E6;--organico:#5CC8C2;--organico-soft:#173331;', 2)
troca('.tag.meta{background:var(--verde-soft);color:var(--verde)}', '.tag.meta{background:#EEEAF9;color:var(--meta)}')
troca('Buscando os dados do Google, do Meta, do Kommo e do iGut…', 'Buscando os dados…')
troca('<span class="sub fino">@nexocentromedico</span>', '<span class="sub fino">@hiperbaricabrasilia${d.bmh ? \' · entra quando o token da Meta sair\' : \'\'}</span>')
troca('API do Perfil da Empresa · chega com uns 3 dias de atraso', "${d.bmh ? 'entra quando o Google aprovar o acesso (caso 0-3334000041584)' : 'API do Perfil da Empresa · chega com uns 3 dias de atraso'}")
troca('<li>Conversas: quem chegou pelo site sem anúncio, pelo link da bio do Instagram ou pelo perfil do Google, ligado à conversa no Kommo. Agendaram segue a mesma regra dos anúncios (até 60 dias depois).</li>',
      "<li>${d.bmh ? 'Cliques no WhatsApp: visitas ao site que não vieram de anúncio (Analytics), por canal. Agendaram por canal entra quando a conversa passar por um sistema.' : 'Conversas: quem chegou pelo site sem anúncio, pelo link da bio do Instagram ou pelo perfil do Google, ligado à conversa no Kommo. Agendaram segue a mesma regra dos anúncios (até 60 dias depois).'}</li>")

# 2. destaque: sem atendimento medido, custo por contato
troca("  let destaque;\n  if (M.ag) destaque", """  let destaque;
  const platsContato = () => [['google', 'Google Ads', contatos, div(gasto, contatos) ? brl(div(gasto, contatos)) + ' por contato' : '—'], ['organico', 'Orgânico', orgConv.length, 'sem custo'], ['meta', 'Meta', null, 'quando o token sair']]
    .filter(([p]) => naPlat(p)).map(([p, n, cn, c]) => `<div class="plat"><em style="color:var(--${p})">${n}</em><span>${cn == null ? '—' : int(cn) + (p === 'google' ? ' contatos' : ' cliques no WhatsApp')}</span><b>${c}</b></div>`).join('');
  if (d.bmh && !d.mede_atendimento) destaque = `<div class="rot">Custo por contato</div><div class="val">${brl0(div(gasto, contatos))}</div>
      <p>Cada contato que veio do anúncio (clique no WhatsApp do site ou ligação) custou, em média, <b>${brl(div(gasto, contatos))}</b>. Foram <b>${int(contatos)}</b> contatos para <b>${brl0(gasto)}</b> investidos.</p>
      <p>A recepção atende no WhatsApp do celular: o custo por paciente atendido aparece quando a conversa passar por um sistema. Os atendimentos do período entram pelo iGut.</p>`;
  else if (M.ag) destaque""")
def plats(trecho):
    ini = '<div class="plats">'
    inner = trecho[len(ini):]
    return ini + '${d.bmh && !d.mede_atendimento ? platsContato() : ' + inner[2:-1] + '}'
troca_trecho('<div class="plats">${porPlat.map(', "</div>\n    </section>", plats)

# 3. resumo e leitura sem agendamento
troca("${pagos.length ? `Das <b>", "${pagos.length && (!d.bmh || d.mede_agendamento) ? `Das <b>")
troca("${orgConv.length ? `Sem anúncio, o orgânico trouxe mais",
      "${orgConv.length && d.bmh && !d.mede_agendamento ? `Sem anúncio, o site recebeu mais <b>${int(orgConv.length)}</b> cliques no WhatsApp (busca orgânica, acesso direto, redes e assistentes de IA).` : ''}${orgConv.length && !(d.bmh && !d.mede_agendamento) ? `Sem anúncio, o orgânico trouxe mais")
troca("  { const NOMEC = { google: 'Google', meta: 'Meta' }, outros", "  if (!d.bmh || d.mede_agendamento) { const NOMEC = { google: 'Google', meta: 'Meta' }, outros")
troca("  const resumo = conv.length ? `Em ${dias} dia${dias > 1 ? 's' : ''}, o orgânico trouxe",
      "  const resumo = conv.length && d.bmh && !d.mede_agendamento ? `Em ${dias} dia${dias > 1 ? 's' : ''}, o site recebeu <b>${int(conv.length)} cliques no WhatsApp</b> de visitas sem anúncio (${Object.entries(porCanal).sort((a, b) => b[1] - a[1]).map(([c, n]) => esc(c.toLowerCase()) + ' ' + n).join(', ')}).`\n    : conv.length ? `Em ${dias} dia${dias > 1 ? 's' : ''}, o orgânico trouxe")

# 4. zeros que não são medidos viram "—"; a etapa "Faturamento" só aparece com o iGut
B = "!E.dados.bmh || " + MED
troca("${num('Agendaram', int(ag), 'com origem de anúncio marcada', semSeta",
      "${num('Agendaram', " + B + " ? int(ag) : '—', " + B + " ? 'com origem de anúncio marcada' : 'precisa de sistema no WhatsApp', semSeta")
troca("${num('Contato → agendou', pagos.length ? pct(txAg) : '—',", "${num('Contato → agendou', pagos.length && (" + B + ") ? pct(txAg) : '—',")
troca("    ${(() => { const tk = d.ticket_medio;", "    ${E.dados.bmh && !E.dados.mede_atendimento ? '' : (() => { const tk = d.ticket_medio;")
troca("${num('Agendaram', int(ag), conv.length ? pct(div(ag, conv.length)) + ' das conversas' : '',",
      "${num('Agendaram', " + B + " ? int(ag) : '—', " + B + " ? (conv.length ? pct(div(ag, conv.length)) + ' das conversas' : '') : 'precisa de sistema no WhatsApp',")

# 5. "Todas as origens" sem Kommo
def todas(trecho):
    nexo = trecho.replace('    <section class="grupo">', '<section class="grupo">', 1)
    bmh = '''<section class="grupo"><div class="cab"><h2>Todas as origens</h2><span class="sub fino">anúncio e orgânico juntos · não muda com os filtros</span></div><div class="nums">
      ${num('Contatos', int(soma(d.anuncios, 'contatos') + soma(d.anuncios, 'ligacoes') + (d.origens || []).filter(o => o.p === 'organico').length), 'anúncio + cliques no WhatsApp sem anúncio', delta(soma(d.anuncios, 'contatos') + soma(d.anuncios, 'ligacoes') + (d.origens || []).filter(o => o.p === 'organico').length, soma(d.anuncios_ant, 'contatos') + soma(d.anuncios_ant, 'ligacoes') + (d.origens_ant || []).filter(o => o.p === 'organico').length, false, int))}
      ${num('Visitas ao site', int(d.site.visitas), 'todas as origens (Analytics)', delta(d.site.visitas, d.site.visitas_ant, false, int))}
      ${num('Pedidos de rota', int(d.site.rotas), '"como chegar" no site', delta(d.site.rotas, d.site.rotas_ant, false, int))}
      ${num('Sessões no iGut', d.atendidos_total == null ? '—' : int(d.atendidos_total), d.atendidos_total == null ? 'entra com o iGut no n8n' : 'sessões realizadas, todas as origens' + (d.produzido_total != null ? ' · produzido ' + brl0(d.produzido_total) + (d.produzido_total_ant ? ' (' + brl0(d.produzido_total_ant) + ' antes)' : '') : ''), d.atendidos_total == null ? '' : delta(d.atendidos_total, d.atendidos_total_ant, false, int))}
    </div>'''
    return '    ${d.bmh ? `' + bmh + '` : `' + nexo + '`}\n'
troca_trecho('    <section class="grupo"><div class="cab"><h2>Todas as origens</h2>', '    ${blocoOrigens(G, GA)}</section>', todas)

# 6. dia a dia, horas, funil, guardião
troca("contatos dos anúncios (Google e Meta) e leads no Kommo de todas as origens", "${d.bmh ? 'contatos do anúncio e cliques no WhatsApp do site sem anúncio' : 'contatos dos anúncios (Google e Meta) e leads no Kommo de todas as origens'}")
troca("label: 'Leads no Kommo'", "label: E.dados.bmh ? 'Sem anúncio (WhatsApp do site)' : 'Leads no Kommo'")
troca("    { type: 'line', label: 'Agendaram no Kommo', data: dias.map(dd => kd[dd]?.agendados || 0), borderColor: cor('--alerta'), backgroundColor: cor('--alerta'), tension: .3, pointRadius: 2 },\n",
      "    ...(E.dados.bmh ? [] : [{ type: 'line', label: 'Agendaram no Kommo', data: dias.map(dd => kd[dd]?.agendados || 0), borderColor: cor('--alerta'), backgroundColor: cor('--alerta'), tension: .3, pointRadius: 2 }]),\n")
troca('<h2>Quando os leads chegam</h2><span class="sub fino">leads novos no Kommo por dia da semana e hora · todas as origens</span>',
      '<h2>${d.bmh ? \'Quando os contatos chegam\' : \'Quando os leads chegam\'}</h2><span class="sub fino">${d.bmh ? \'cliques no WhatsApp do site por dia da semana e hora · todas as origens\' : \'leads novos no Kommo por dia da semana e hora · todas as origens\'}</span>')
troca("${int(h.total)} leads no período", "${int(h.total)} ${E.dados.bmh ? 'cliques no WhatsApp' : 'leads'} no período")
troca("'<div class=\"sub\">Nada a corrigir nesses 3 dias. Ele roda todo dia às 7h30 e conta no relatório das 8h.</div>'",
      "(E.dados.bmh ? '<div class=\"sub\">Nada a corrigir nesses 3 dias. Ele roda todo dia às 7h30 (só Google Ads, por enquanto).</div>' : '<div class=\"sub\">Nada a corrigir nesses 3 dias. Ele roda todo dia às 7h30 e conta no relatório das 8h.</div>')")
troca("'Google + Meta, teto ' + brl0(m.teto) + ' por mês'", "(E.dados.bmh ? 'Google Ads, teto ' : 'Google + Meta, teto ') + brl0(m.teto) + ' por mês'")

# 7. orgânico: textos
troca("<div class=\"sub\">Só entra quem chegou com a origem marcada: página do site, link da bio do Instagram, perfil do Google.\n      Quem já tem o número e escreve direto não aparece aqui.",
      "<div class=\"sub\">${d.bmh ? 'Conta os cliques no WhatsApp do site em visitas que não vieram de anúncio (Analytics).' : 'Só entra quem chegou com a origem marcada: página do site, link da bio do Instagram, perfil do Google. Quem já tem o número e escreve direto não aparece aqui.'}")
troca("${num('Conversas', int(conv.length), 'com origem orgânica identificada',", "${num(d.bmh ? 'Cliques no WhatsApp' : 'Conversas', int(conv.length), d.bmh ? 'de visitas sem anúncio' : 'com origem orgânica identificada',")

# 8. "Como os números são calculados"
BMH_COMO = '''
      <li>Investimento, exibições, cliques e contatos de cada anúncio vêm do Google Ads. Contatos = cliques no WhatsApp do site vindos do anúncio + ligações feitas pelo anúncio.</li>
      <li>Orgânico: cliques no WhatsApp do site em visitas que não vieram de anúncio (Analytics), por canal. Busca no Google: Search Console.</li>
      <li>As setas comparam com o período anterior: mesmo trecho do mês anterior quando o período começa no dia 1; senão, o mesmo número de dias logo antes. Verde é bom (custo caiu ou resultado subiu); diferença abaixo de 3% aparece como igual.</li>
      <li>Filtros: "Todas" inclui o orgânico como linhas nas tabelas; "Anúncios" mostra só o pago.</li>
      <li>Métricas de tráfego: CPM = investimento ÷ exibições × 1000 · CTR = cliques ÷ exibições · CPC = investimento ÷ cliques · clique → contato = contatos ÷ cliques · CPL = investimento ÷ contatos. A parcela de impressões vem do Google (busca).</li>
      <li>Agendou e atendido por canal: a recepção usa o WhatsApp no celular, então ainda não há como ligar cada conversa ao paciente. Os atendimentos do período entram pelo iGut.</li>
'''
def como(trecho):
    cab = '<details class="como"><summary>Como os números são calculados</summary><ul>'
    return cab + '${d.bmh ? `' + BMH_COMO + '` : `' + trecho[len(cab):] + '`}\n'
troca_trecho('<details class="como"><summary>Como os números são calculados</summary><ul>', "      ${(d.avisos_fontes || []).map(", como)

if falhas:
    print('NÃO GRAVEI. Trechos que mudaram na página da Nexo:')
    for f in falhas: print(' -', f)
    sys.exit(1)
open(os.path.join(AQUI, 'pagina.html'), 'w', encoding='utf8').write(t)
print('página da BMH gravada:', len(t), 'caracteres; chaves duplas:', t.count('{' + '{'))
