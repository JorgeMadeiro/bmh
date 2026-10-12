// Reorganização do Google Ads da BMH (08/10/2026), no modelo da Nexo (30/09): tudo de uma vez, grupos antigos pausados
// como plano B. Grupos pelo que as pessoas buscam de fato (termos de busca de 10/07 a 07/10/2026). Textos só com fatos
// já publicados nas páginas aprovadas pelo Jorge. Aplicar com aplicar.js (--validar não cria nada).
const SITE = 'https://hiperbaricabrasilia.com.br';
const P = (...t) => t.map((x) => [x, 'PHRASE']), E = (...t) => t.map((x) => [x, 'EXACT']);

// bloqueios para cada busca cair no grupo certo (negativa não pega variação de acento: vão as duas grafias)
const N = {
  unidades: ['taguatinga', 'águas claras', 'aguas claras', 'ceilândia', 'ceilandia', 'samambaia', 'asa sul', 'asa norte', 'l2 sul', 'plano piloto'],
  valor: ['valor', 'valores', 'preço', 'preco', 'quanto custa', 'custo', 'convênio', 'convenio', 'plano de saúde', 'plano de saude', 'sus'],
  posop: ['pós operatório', 'pos operatorio', 'pós cirurgia', 'pos cirurgia', 'pós cirúrgico', 'pos cirurgico', 'cirurgia plástica', 'cirurgia plastica', 'abdominoplastia', 'lipoaspiração', 'lipoaspiracao', 'mamoplastia', 'necrose', 'cicatrização', 'cicatrizacao'],
  feridas: ['ferida', 'feridas', 'pé diabético', 'pe diabetico', 'pé diabetico', 'pe diabético', 'úlcera', 'ulcera'],
};

// títulos e descrições comuns (todos os fatos estão nas páginas publicadas)
const FATOS = ['Médico em Todas as Sessões', 'Desde 2004 em Brasília', 'Asa Sul e Taguatinga', 'Todos os Dias, das 7h às 19h', 'Atendemos 50 Convênios', 'Agende pelo WhatsApp'];
const D_MEDICO = 'Oxigenoterapia hiperbárica com médico presente em todas as sessões. Desde 2004.';
const D_UNIDADES = 'Asa Sul e Taguatinga, todos os dias, das 7h às 19h. Fale com a recepção pelo WhatsApp.';
const D_CONVENIO = 'Atendemos 50 convênios. A recepção confere a cobertura do seu plano pelo WhatsApp.';
const D_AVALIACAO = 'O tratamento começa com uma avaliação médica, que define as sessões do seu caso.';

module.exports = {
  conta: '5066798424',
  // região (opção A do Jorge, 08/10/2026): DF inteiro + entorno, "presença ou interesse" (como a TRÁFEGO hoje). Em 12 meses
  // o entorno trouxe 58 contatos a R$ 18 e quem estava fora buscando Brasília, 53 a ~R$ 21. Hoje a LEADS usa 22 km do centro
  // + 10 km de Taguatinga, só presença, e deixava de fora Gama, Santa Maria, Recanto, Planaltina e todo o entorno.
  regioes: {
    'geoTargetConstants/20090': 'Distrito Federal', 'geoTargetConstants/9074231': 'Valparaíso de Goiás', 'geoTargetConstants/9074205': 'Novo Gama',
    'geoTargetConstants/9074282': 'Cidade Ocidental', 'geoTargetConstants/1031782': 'Luziânia', 'geoTargetConstants/1032140': 'Águas Lindas de Goiás',
    'geoTargetConstants/1032015': 'Santo Antônio do Descoberto', 'geoTargetConstants/1031632': 'Formosa', 'geoTargetConstants/9074242': 'Planaltina de Goiás',
    'geoTargetConstants/1001591': 'Unaí (MG)', 'geoTargetConstants/1031875': 'Paracatu (MG)',
  },
  alcance: 'PRESENCE_OR_INTEREST',
  pacientes: {
    campanha: 'customers/5066798424/campaigns/20776450309',          // [LEADS][PESQUISA] - BMH (nome mantido: o painel compara antes e depois)
    orcamento: { recurso: 'customers/5066798424/campaignBudgets/13140126216', antes: 86, novo: 100 },
    raiosAntes: [{ lat: -15806771, lon: -47881136, km: 22 }, { lat: -15853199, lon: -48084141, km: 10 }],   // para o plano B
    pausar: ['160844668452', '162015881253', '166549577014'],         // BMH, Institucional + Concorrentes, TESTE DE PALAVRAS
    negativas: [...P('brasília medicina hiperbárica', 'brasilia medicina hiperbarica', 'bmh', 'rinnovare', 'oxi hiperbárica', 'oxihiperbarica', 'oxihiperbárica', 'centro hiperbárico de brasília', 'centro hiperbarico de brasilia', 'infinita hiperbárica', 'infinita hiperbarica')],
    grupos: [
      { nome: 'Câmara hiperbárica · Brasília', url: SITE + '/', caminho: ['hiperbarica', 'brasilia'],
        palavras: [...P('câmara hiperbárica', 'hiperbárica', 'hiperbárica brasília', 'câmara hiperbárica brasília', 'câmara hiperbárica df', 'oxigenoterapia hiperbárica', 'oxigenoterapia', 'medicina hiperbárica', 'medicina hiperbárica brasília', 'clínica hiperbárica', 'terapia hiperbárica', 'tratamento hiperbárico',
            // grafias erradas e nomes populares que trouxeram contato nos 90 dias
            'oxigênio hiperbárico',   // 'ohb' sozinho fica de fora: 1.600 buscas/mês no DF pelo Planejador, quase todas sem relação
            'câmara de oxigênio', 'câmara bariátrica', 'câmara barica', 'hiperbariatrica', 'hiberbarica', 'hipebarica'),
          ...E('câmara hiperbárica', 'câmara hiperbárica brasília', 'hiperbárica brasília', 'câmara hiperbárica df')],
        negativas: [...N.unidades, ...N.valor, ...N.posop, ...N.feridas],
        titulos: ['Câmara Hiperbárica em Brasília', 'Hiperbárica em Brasília', 'Oxigenoterapia Hiperbárica', ...FATOS, 'Brasília Medicina Hiperbárica', 'Câmara Hiperbárica no DF', 'Pós-Operatório e Feridas', 'Avaliação Antes da 1ª Sessão', 'Clínica Hiperbárica no DF', 'Confira o Seu Convênio'],
        descricoes: [D_MEDICO, D_UNIDADES, D_CONVENIO, D_AVALIACAO] },
      { nome: 'Taguatinga', url: SITE + '/hiperbarica-taguatinga/', caminho: ['taguatinga'],
        palavras: [...P('hiperbárica taguatinga', 'câmara hiperbárica taguatinga', 'clínica hiperbárica taguatinga', 'oxigenoterapia taguatinga', 'hiperbárica águas claras', 'hiperbárica ceilândia', 'hiperbárica samambaia'), ...E('hiperbárica taguatinga', 'câmara hiperbárica taguatinga')],
        negativas: [...N.valor],
        titulos: ['Câmara Hiperbárica Taguatinga', 'Hiperbárica em Taguatinga', 'Unidade BMH Taguatinga', 'Setor C Norte, Taguatinga', 'Agende em Taguatinga', ...FATOS.filter((t) => t !== 'Asa Sul e Taguatinga'), 'Oxigenoterapia Hiperbárica', 'Indicações Aceitas pelo CFM', 'Avaliação Antes da 1ª Sessão', 'Brasília Medicina Hiperbárica', 'Pós-Operatório e Feridas'],
        descricoes: ['Unidade Taguatinga da BMH: oxigenoterapia hiperbárica com médico em todas as sessões.', 'Setor C Norte, Taguatinga. Todos os dias, das 7h às 19h. Agende pelo WhatsApp.', D_CONVENIO, D_AVALIACAO] },
      { nome: 'Asa Sul', url: SITE + '/hiperbarica-asa-sul/', caminho: ['asa-sul'],
        palavras: [...P('hiperbárica asa sul', 'câmara hiperbárica asa sul', 'hiperbárica l2 sul', 'hiperbárica asa norte', 'hiperbárica plano piloto', 'câmara hiperbárica plano piloto'), ...E('hiperbárica asa sul', 'câmara hiperbárica asa sul')],
        negativas: [...N.valor],
        titulos: ['Câmara Hiperbárica Asa Sul', 'Hiperbárica na Asa Sul', 'Hiperbárica na L2 Sul', 'Monoplace e Multiplace', 'Unidade BMH Asa Sul', ...FATOS.filter((t) => t !== 'Asa Sul e Taguatinga'), 'Oxigenoterapia Hiperbárica', 'SGAS 613, L2 Sul', 'Avaliação Antes da 1ª Sessão', 'Brasília Medicina Hiperbárica', 'Pós-Operatório e Feridas'],
        descricoes: ['Unidade Asa Sul da BMH, na L2 Sul: câmaras monoplace e multiplace, com médico.', 'Médico presente em todas as sessões. Todos os dias, das 7h às 19h. Agende pelo WhatsApp.', D_CONVENIO, D_AVALIACAO] },
      { nome: 'Valor e convênio', url: SITE + '/perguntas-frequentes/', caminho: ['convenio'],
        palavras: [...P('câmara hiperbárica valor', 'hiperbárica valor', 'câmara hiperbárica preço', 'quanto custa câmara hiperbárica', 'quanto custa sessão hiperbárica', 'quanto custa uma sessão de câmara hiperbárica', 'quanto custa uma sessão de hiperbárica', 'quanto custa uma câmara hiperbárica', 'câmara hiperbárica convênio', 'hiperbárica convênio', 'câmara hiperbárica plano de saúde', 'plano de saúde cobre hiperbárica'), ...E('câmara hiperbárica valor')],
        negativas: ['sus', 'comprar', 'compra', 'venda', 'à venda', 'portátil', 'portatil', 'para casa', 'usada', 'fabricante',
          // "valor/preço da sessão": R$ 86 por contato em 3 anos (5,1% dos cliques viram contato); "quanto custa uma sessão" fica (R$ 25)
          'valor da sessão', 'valor da sessao', 'valor sessão', 'valor sessao', 'preço da sessão', 'preco da sessao', 'preço sessão', 'preco sessao',
          'sessão hiperbárica valor', 'sessao hiperbarica valor', 'sessão de hiperbárica valor', 'sessao de hiperbarica valor'],
        titulos: ['Hiperbárica Pelo Convênio', 'Atendemos 50 Convênios', 'Confira o Seu Plano', 'Valor da Sessão no WhatsApp', 'Convênio ou Particular', 'Câmara Hiperbárica em Brasília', 'Médico em Todas as Sessões', 'Desde 2004 em Brasília', 'Asa Sul e Taguatinga', 'Todos os Dias, das 7h às 19h', 'Agende pelo WhatsApp', 'Avaliação Antes da 1ª Sessão', 'Pedido do Seu Médico', 'Oxigenoterapia Hiperbárica', 'Brasília Medicina Hiperbárica'],
        descricoes: ['O valor depende do motivo do tratamento e do convênio. A recepção explica pelo WhatsApp.', D_CONVENIO, 'Para usar o convênio, o plano pede o pedido do seu médico. Tire as dúvidas no WhatsApp.', D_MEDICO] },
      { nome: 'Pós-operatório', url: SITE + '/pos-operatorio-cirurgia-plastica/', caminho: ['pos-operatorio'],
        palavras: [...P('hiperbárica pós operatório', 'câmara hiperbárica pós operatório', 'hiperbárica pós cirurgia', 'câmara hiperbárica pós cirurgia', 'hiperbárica cirurgia plástica', 'câmara hiperbárica cirurgia plástica', 'hiperbárica abdominoplastia', 'hiperbárica lipoaspiração', 'hiperbárica mamoplastia', 'hiperbárica necrose', 'câmara hiperbárica cicatrização', 'oxigenoterapia pós operatório'), ...E('câmara hiperbárica pós operatório')],
        negativas: [...N.valor],
        titulos: ['Hiperbárica no Pós-Operatório', 'Pós-Operatório de Plástica', 'Indicação do Seu Cirurgião', 'Pode Vir com Curativo e Cinta', 'Roupa de Algodão na Clínica', 'Avaliação Antes da 1ª Sessão', 'Câmara Hiperbárica em Brasília', ...FATOS, 'Oxigenoterapia Hiperbárica', 'Tratamento com Seu Cirurgião'],
        descricoes: ['Um médico da BMH avalia você e define o tratamento junto com o seu cirurgião.', 'Pode vir com curativo, cinta e dreno. A BMH fornece a roupa de algodão para a sessão.', D_MEDICO, D_UNIDADES] },
      { nome: 'Feridas', url: SITE + '/', caminho: ['feridas'],
        palavras: [...P('câmara hiperbárica feridas', 'hiperbárica feridas', 'hiperbárica ferida', 'câmara hiperbárica para feridas', 'hiperbárica pé diabético', 'câmara hiperbárica pé diabético', 'oxigenoterapia feridas', 'hiperbárica úlcera'), ...E('câmara hiperbárica feridas')],
        negativas: [...N.valor, 'laser', 'ozônio', 'ozonio'],
        titulos: ['Hiperbárica Para Feridas', 'Ferida que Não Cicatriza?', 'Hiperbárica e Pé Diabético', 'Indicações Aceitas pelo CFM', 'Avaliação Antes da 1ª Sessão', 'Câmara Hiperbárica em Brasília', ...FATOS, 'Oxigenoterapia Hiperbárica', 'Brasília Medicina Hiperbárica', 'Lesão por Radioterapia'],
        descricoes: ['Feridas que não cicatrizam e pé diabético: hiperbárica com avaliação médica antes.', D_MEDICO, D_UNIDADES, D_CONVENIO] },
    ],
  },
  marca: {
    campanha: 'customers/5066798424/campaigns/20833761565',          // [TRAFEGO][PESQUISA] - BMH (nome mantido)
    orcamento: { recurso: 'customers/5066798424/campaignBudgets/13193047346', antes: 32, novo: 8 },
    pausar: ['155876131626'],                                         // BMH (genéricas, marca e concorrentes misturados)
    negativas: [...P('rinnovare', 'oxi hiperbárica', 'oxihiperbarica', 'oxihiperbárica', 'centro hiperbárico de brasília', 'centro hiperbarico de brasilia', 'infinita hiperbárica', 'infinita hiperbarica')],
    grupos: [
      { nome: 'Marca', url: SITE + '/', caminho: ['bmh'],
        palavras: [...P('brasília medicina hiperbárica', 'brasilia medicina hiperbarica', 'bmh', 'bmh hiperbárica', 'bmh hiperbarica', 'bmh brasília', 'bmh asa sul', 'bmh taguatinga', 'clínica bmh'), ...E('brasília medicina hiperbárica', 'brasilia medicina hiperbarica')],
        negativas: ['emprego', 'vaga', 'vagas', 'trabalhe conosco', 'curriculo', 'currículo'],
        titulos: ['Brasília Medicina Hiperbárica', 'BMH · Medicina Hiperbárica', 'Site Oficial da BMH', ...FATOS, 'Câmara Hiperbárica em Brasília', 'Unidades Asa Sul e Taguatinga', 'Oxigenoterapia Hiperbárica', 'Avaliação Antes da 1ª Sessão', 'Pós-Operatório e Feridas', 'Clínica Hiperbárica no DF'],
        descricoes: ['Brasília Medicina Hiperbárica: oxigenoterapia hiperbárica com médico em todas as sessões.', D_UNIDADES, D_CONVENIO, 'Desde 2004 em Brasília. O tratamento começa com uma avaliação médica do seu caso.'] },
    ],
  },
  concorrentes: {
    nome: '[PESQUISA] Concorrentes (teste 4 semanas)', orcamento: 10,
    copiarLocalDe: 'customers/5066798424/campaigns/20776450309',
    negativas: [...P('bmh', 'brasília medicina hiperbárica', 'brasilia medicina hiperbarica', 'emprego', 'vaga', 'vagas', 'curso')],
    grupos: [
      { nome: 'Concorrentes', url: SITE + '/', caminho: ['hiperbarica', 'brasilia'],
        palavras: [...P('rinnovare', 'oxi hiperbárica', 'oxihiperbarica', 'centro hiperbárico de brasília', 'infinita hiperbárica')],
        negativas: [],
        // regra da casa: o anúncio não cita nenhum concorrente; só os fatos da BMH
        titulos: ['Câmara Hiperbárica em Brasília', 'Brasília Medicina Hiperbárica', 'Oxigenoterapia Hiperbárica', ...FATOS, 'Avaliação Antes da 1ª Sessão', 'Pós-Operatório e Feridas', 'Câmara Hiperbárica no DF', 'Clínica Hiperbárica no DF', 'Confira o Seu Convênio', 'Hiperbárica em Brasília'],
        descricoes: [D_MEDICO, D_UNIDADES, D_CONVENIO, D_AVALIACAO] },
    ],
  },
  // todas as campanhas novas e ativas recebem as extensões novas; as antigas saem
  extensoes: {
    tirar: ['112670364903', '114991216183', '115015809936', '115016534805', '115016534808', '114984686606'],   // 3 links (WhatsApp, /tratamento/, /convenios/), "Oxigênio, Inovação, Vida!", "Líder em OHB", trecho antigo
    links: [
      { texto: 'Pós-Operatório', d1: 'Plástica: quando o cirurgião indica', d2: 'Pode vir com curativo e cinta', url: SITE + '/pos-operatorio-cirurgia-plastica/' },
      { texto: 'Unidade Asa Sul', d1: 'SGAS 613, L2 Sul', d2: 'Monoplace e multiplace', url: SITE + '/hiperbarica-asa-sul/' },
      { texto: 'Unidade Taguatinga', d1: 'Setor C Norte, Taguatinga', d2: 'Todos os dias, das 7h às 19h', url: SITE + '/hiperbarica-taguatinga/' },
      { texto: 'Perguntas Frequentes', d1: 'Convênio, sessões e preparo', d2: 'Curativo, cinta e dreno', url: SITE + '/perguntas-frequentes/' },
    ],
    frases: ['Médico em Toda Sessão', 'Desde 2004 em Brasília', 'Atendemos 50 Convênios', 'Aberto Todos os Dias', 'Asa Sul e Taguatinga', 'Avaliação Médica Antes'],
    trecho: { cabecalho: 'Serviços', valores: ['Pós-operatório', 'Feridas que Não Fecham', 'Pé Diabético', 'Lesão por Radioterapia', 'Avaliação de Mergulhador'] },
  },
  // conversões: as 6 da campanha inteligente antiga (visitas à loja, mapa, ligações da campanha inteligente) são do Google e
  // a API recusa mudar (MUTATE_NOT_ALLOWED). Não registram nada em 90 dias: o lance já segue só WhatsApp e ligação.
};
