// O que o robô do n8n manda direto pela API (22/11/2026) chega ao recebedor só como status "enviada", sem o texto (linha
// "sem texto", aparelho kommo). Aqui ganha uma descrição sem dado de paciente:
//   - confirmação da véspera: pelo id da mensagem guardado em BMH_confirmacoes;
//   - recado depois do "Confirmo": o paciente tocou "Confirmo" até 5 min antes, do mesmo telefone em código;
//   - NPS: o paciente tocou "Está ótima" ou "Está boa" (link do Google) ou "Podia ser melhor" até 5 min antes.
const conf = $('Confirmações (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
const porWamid = {}; for (const r of conf) if (r.wamid) porWamid[r.wamid] = r;
const linhas = $('Mensagens (tabela)').all().map((i) => i.json).filter((r) => r && r.chave);
const doPaciente = {}; for (const r of linhas) if (r.direcao === 'paciente' && r.tipo === 'botão') (doPaciente[r.telefone_hash] ||= []).push(r);
const { de } = $('Janela').first().json, desde = (de - 3 * 86400) * 1000;   // olha 3 dias para trás
const tipoDe = (h) => conf.filter((r) => r.telefone_hash === h && r.resposta === 'confirmou').sort((a, b) => String(b.dia).localeCompare(String(a.dia)))[0]?.tipo;
const out = [];
for (const r of linhas) {
  if (r.aparelho !== 'kommo' || r.texto || Date.parse(r.momento) < desde) continue;
  const c = porWamid[r.chave], [, m, d] = String(c?.dia || '').split('-');
  let texto = c ? `[robô] confirmação da véspera: ${c.tipo || 'sessão'} de ${d}/${m} às ${c.hora}, BMH ${c.unidade}` : '';
  if (!texto) {
    const t = Date.parse(r.momento), b = (doPaciente[r.telefone_hash] || []).filter((x) => t - Date.parse(x.momento) >= 0 && t - Date.parse(x.momento) <= 300000).sort((a, b2) => Date.parse(b2.momento) - Date.parse(a.momento))[0];
    const bt = String(b?.texto || '').trim().toLowerCase();
    if (bt === 'confirmo') texto = tipoDe(r.telefone_hash) === 'avaliação' ? '[robô] recado da confirmação: mapa da unidade' : '[robô] recado da confirmação: chegar 20 a 30 min antes e mapa da unidade';
    else if (bt === 'está ótima' || bt === 'está boa') texto = '[robô] NPS: agradecimento com o link de avaliação do Google';
    else if (bt === 'podia ser melhor') texto = '[robô] NPS: resposta à nota baixa';
  }
  if (!texto) continue;
  const { id, createdAt, updatedAt, ...linha } = r;
  out.push({ json: { ...linha, tipo: 'texto', texto } });
}
return out;
