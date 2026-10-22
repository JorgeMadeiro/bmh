// Vigia da coexistência do WhatsApp da recepção da BMH com o Kommo (22/10/2026). A Meta desliga a coexistência se o app
// WhatsApp Business do celular ficar 14 dias sem abrir. Abrir o app a Meta não avisa; o que chega é o eco de mensagem mandada
// pelo celular (recebedor oficial: direcao "equipe", aparelho "celular", na BMH_whatsapp_mensagens). Então: sem eco do celular
// há `coexistencia_dias_aviso` (10) dias, avisa todo dia, com o que fazer para zerar a contagem.
//
// Só liga depois da virada: sem `coexistencia_desde` (AAAA-MM-DD) na BMH_config, fica calado, mesmo com o fluxo ligado. Usa só
// a hora das mensagens (nunca texto nem telefone). Fonte: este arquivo; o montador embute o texto no nó do n8n.
function avisoCoexistencia(momentosEco, cfg, agoraISO) {
  const desde = /^\d{4}-\d{2}-\d{2}$/.test(String(cfg.coexistencia_desde || '')) ? cfg.coexistencia_desde : '';
  if (!desde) return null;
  const agora = new Date(agoraISO);
  const inicio = new Date(desde + 'T00:00:00-03:00');
  if (agora < inicio) return null;
  const LIMITE = Number(cfg.coexistencia_dias_aviso || 10), META = 14;
  // só eco depois da virada e nunca no futuro (relógio errado não zera a contagem)
  const ecos = momentosEco.map(m => new Date(m)).filter(d => !isNaN(d) && d >= inicio && d <= agora).sort((a, b) => b - a);
  const ref = ecos[0] || inicio;
  const dias = (agora - ref) / 864e5;
  if (dias < LIMITE) return null;
  const br = d => new Date(d.getTime() - 3 * 3600e3).toISOString();
  const dm = d => br(d).slice(8, 10) + '/' + br(d).slice(5, 7), hm = d => br(d).slice(11, 16);
  const prazo = new Date(ref.getTime() + META * 864e5);
  const quando = ecos[0] ? `a última foi em ${dm(ref)} às ${hm(ref)}` : `desde a virada, em ${dm(inicio)}`;
  const texto = `📱 BMH · WhatsApp da recepção: há ${Math.floor(dias)} dias não vejo mensagem mandada pelo celular (${quando}).\n\n` +
    (dias >= META
      ? `Passou de ${META} dias: se ninguém abriu o app WhatsApp Business no celular da recepção, a Meta pode ter desligado a ligação com o Kommo. Conferir no Kommo se as conversas continuam chegando.`
      : `A Meta desliga a ligação com o Kommo se o app WhatsApp Business do celular da recepção ficar ${META} dias sem abrir (prazo por volta de ${dm(prazo)}). Abrir o app no celular e mandar qualquer mensagem por ele zera a contagem (só abrir também vale para a Meta, mas eu não vejo, e o aviso continua).`);
  return { dias: Math.floor(dias), ultimo: ecos[0] ? ecos[0].toISOString() : '', texto };
}
// FIM-DA-FUNCAO (o montador corta daqui para baixo ao embutir no n8n)
if (typeof module !== 'undefined') module.exports = { avisoCoexistencia };
