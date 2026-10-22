// Junta o texto (ou a transcrição do áudio), apaga CPF escrito na mensagem e monta a linha da tabela.
const base = $('Prepara a mensagem').item.json;
const transcricao = base.transcrever ? String($json.text || '').trim() : '';
const texto = String(base.texto || transcricao).replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]');
// Guarda: 6 meses na observação pela Evolution (09/10/2026); 1 mês no recebedor oficial da Meta (22/10/2026)
const apagar = new Date(base.momento); apagar.setMonth(apagar.getMonth() + (base.guardar_meses || 6));
// Origem: não é mais calculada aqui (22/10/2026). A lista ÚNICA de frases é integracoes/origem/frases.json; o recebedor
// oficial da Meta usa monta-meta.js e o Kommo usa origem-kommo.js, os dois montados a partir dela. A Evolution não entra
// no número da recepção (decisão do Jorge, 22/10/2026).
return { json: {
  chave: base.msg_id,
  momento: base.momento,
  dia: base.dia,
  telefone: base.telefone,
  numero_oculto: base.numero_oculto ? 'sim' : 'não',
  direcao: base.direcao,
  aparelho: base.aparelho,
  tipo: base.tipo,
  texto,
  transcrito: base.transcrever ? (transcricao ? 'sim' : 'falhou') : '',
  respondendo: base.respondendo,
  apagar_em: apagar.toISOString().slice(0, 10),
  origem: '',
} };
