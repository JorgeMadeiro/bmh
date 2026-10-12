// Junta o texto (ou a transcrição do áudio), apaga CPF escrito na mensagem e monta a linha da tabela.
const base = $('Prepara a mensagem').item.json;
const transcricao = base.transcrever ? String($json.text || '').trim() : '';
const texto = String(base.texto || transcricao).replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]');
const apagar = new Date(base.momento); apagar.setMonth(apagar.getMonth() + 6);
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
} };
