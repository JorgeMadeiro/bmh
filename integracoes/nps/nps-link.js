// Link do Google para quem respondeu "Podia ser melhor" (19/11/2026): entre 18 e 23 h depois da resposta, ainda dentro da
// janela de 24 h do WhatsApp, depois que a equipe falou com o paciente. O Google não aceita pedir avaliação só a quem gostou.
// O celular sai do iGut na hora (a tabela só tem o telefone em código); no espelho vai para o telefone de teste.
const cfg = {}; try { for (const i of $('Config').all()) if (i.json && i.json.chave) cfg[i.json.chave] = i.json.valor; } catch (e) {}
const modo = ['real', 'espelho'].includes(cfg.nps_modo) ? cfg.nps_modo : 'ensaio'; if (modo === 'ensaio') return [];
const agora = Date.now();
return $('NPS (tabela)').all().map((i) => i.json).filter((r) => r && r.resposta === 'podia ser melhor' && !r.link_enviado_em && r.respondido_em)
  .filter((r) => { const h = (agora - Date.parse(r.respondido_em)) / 36e5; return h >= 18 && h <= 23; }).map((r) => ({ json: r }));
