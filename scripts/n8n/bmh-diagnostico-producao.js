// Resumo do diagnóstico do envio da agenda diária (01/11/2026). Entrada: respostas cruas da Evolution (estado, instância,
// grupos) e do iGut (agenda de hoje). Saída: só o que decide o diagnóstico, sem telefone e sem nome de paciente.
function resumoDiagnostico(estado, instancia, grupos, agenda) {
  const erro = r => (r && r.error) ? String(r.error.message || r.error.description || JSON.stringify(r.error)).slice(0, 200) : '';
  const fim4 = s => String(s || '').replace(/\D/g, '').slice(-4);
  const inst = Array.isArray(instancia) ? instancia[0] : (instancia && instancia.instance) || instancia || {};
  const dono = String(inst.ownerJid || inst.owner || '').split('@')[0].split(':')[0];
  const out = {
    instancia: { estado: (estado && (estado.instance?.state || estado.state)) || '', erro: erro(estado),
      numero_final: dono ? fim4(dono) : '', status_lista: inst.connectionStatus || inst.status || '', erro_lista: erro(instancia) },
    grupos: grupos.map(g => {
      const r = g.resposta || {};
      const parts = Array.isArray(r.participants) ? r.participants : [];
      const meu = parts.find(p => dono && String(p.id || '').split('@')[0].split(':')[0] === dono);
      return { nome: g.nome, jid: g.jid, achou: !!(r.id || r.subject), assunto: r.subject || '', tamanho: r.size || parts.length || 0,
        numero_no_grupo: dono ? !!meu : null, admin: meu ? (meu.admin || 'membro') : '', so_admin_envia: r.announce === true, erro: erro(r) };
    }),
    igut: { erro: erro(agenda), total: 0, por_local: {}, por_profissional: {}, ids_que_o_fluxo_espera: { local: ['1', '2'], profissional: ['111', '112', '113', '120', '121'] } },
  };
  const lista = Array.isArray(agenda?.data) ? agenda.data : [];
  for (const d of lista) {
    out.igut.total++;
    const l = String(d.Local?.id ?? '?'), p = String(d.Profissional?.id ?? '?');
    out.igut.por_local[l] = (out.igut.por_local[l] || 0) + 1;
    out.igut.por_profissional[p] = (out.igut.por_profissional[p] || 0) + 1;
  }
  const pistas = [];
  if (out.instancia.estado && out.instancia.estado !== 'open') pistas.push(`instância Madeiro está "${out.instancia.estado}": desconectada, o envio falha e o fluxo engole o erro`);
  if (out.instancia.erro) pistas.push('não consegui ler o estado da instância: ' + out.instancia.erro);
  for (const g of out.grupos) {
    if (!g.achou) pistas.push(`grupo ${g.nome} não encontrado pela instância (${g.erro || 'sem resposta'}): id mudou ou o número saiu`);
    else if (g.numero_no_grupo === false) pistas.push(`o número da instância não está no grupo ${g.nome}`);
    else if (g.so_admin_envia && g.admin === 'membro') pistas.push(`o grupo ${g.nome} só deixa administrador mandar, e a instância é membro comum`);
  }
  const fora = Object.keys(out.igut.por_profissional).filter(p => !out.igut.ids_que_o_fluxo_espera.profissional.includes(p) && p !== '?');
  if (out.igut.total && fora.length) pistas.push(`a agenda de hoje tem profissionais que o fluxo não conhece: ${fora.join(', ')} (as mensagens só montam com 111, 112, 120 e 121)`);
  if (out.igut.total && !out.igut.por_profissional['121']) pistas.push('nenhuma sessão do profissional 121 hoje: a mensagem de Taguatinga não é montada');
  if (out.igut.erro) pistas.push('não consegui ler a agenda no iGut: ' + out.igut.erro);
  out.pistas = pistas.length ? pistas : ['nada errado à vista: instância aberta, grupos achados com o número dentro e a agenda com os ids esperados'];
  return out;
}
// FIM-DA-FUNCAO
if (typeof module !== 'undefined') module.exports = { resumoDiagnostico };
