// Junta o texto (ou a transcrição do áudio), apaga CPF escrito na mensagem e monta a linha da tabela.
const base = $('Prepara a mensagem').item.json;
const transcricao = base.transcrever ? String($json.text || '').trim() : '';
const texto = String(base.texto || transcricao).replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]');
// Guarda: 6 meses na observação pela Evolution (09/10/2026); 1 mês no recebedor oficial da Meta (22/10/2026)
const apagar = new Date(base.momento); apagar.setMonth(apagar.getMonth() + (base.guardar_meses || 6));
// Origem pelo começo da mensagem pronta (15/10/2026). Só a primeira frase do paciente; o fluxo grava à parte em BMH_whatsapp_origens.
// Mudar uma mensagem pronta (site, anúncio, link da bio) pede ajustar aqui também.
const ORIGENS = [
  [/^ol[áa]!?\s*vim pelo instagram do dr\.? jorge/i, 'instagram_dr_jorge'],
  [/^ol[áa]!?\s*vim pelo an[úu]ncio/i, 'anuncio_google'],
  [/^ol[áa]!?\s*(vim pelo site da bmh|estou no p[óo]s-operat[óo]rio de cirurgia pl[áa]stica e quero saber|tenho uma ferida que n[ãa]o cicatriza e quero agendar|tenho um pedido m[ée]dico de oxigenoterapia|sou mergulhador e quero agendar|sou m[ée]dico\(a\) e quero encaminhar|quero agendar na unidade|quero saber se a bmh atende o meu conv[êe]nio)/i, 'site'],
];
const achou = base.direcao === 'paciente' && base.texto ? ORIGENS.find(([re]) => re.test(String(base.texto).trim())) : null;
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
  origem: achou ? achou[1] : '',
} };
