// Regras da DRE da BMH (12/11/2026, no molde da DRE da Nexo). Este arquivo entra no começo dos dois fluxos ("atualiza do
// iGut" e "página") pelo montar.js: mudar a regra aqui e reenviar os dois. Decisões do Jorge em 12/11/2026: equipamentos
// (parcelas das câmaras) abaixo do EBITDA, como investimento; CEMEP = despesa não operacional; plantão médico = custo
// variável; "Cartão de crédito" = fatura do cartão da empresa; "Receita com serviços › Particular" lançada como despesa fica
// em "A classificar", com cada lançamento no "Para conferir", até o Jorge decidir.
// No iGut da BMH o tipo do lançamento é só RECEITA ou DESPESA: a linha sai da categoria e da subcategoria.
const L = {
  conv: 'Sessões · convênios', part: 'Sessões · particular', outros_rec: 'Consultas e outros atendimentos',
  glosa: 'Glosas de convênio', iss: 'ISS', cofins: 'Cofins', pis: 'PIS', csll: 'CSLL', irpj: 'IRPJ', irrf: 'IRRF', imp_gerais: 'Impostos gerais e taxas',
  oxigenio: 'Oxigênio', plantao: 'Plantões médicos (honorários)', insumos: 'Insumos de enfermagem e EPIs', lavanderia: 'Lavanderia',
  salarios: 'Salários, férias e rescisões', encargos: 'Encargos (FGTS)', beneficios: 'Benefícios (vale-transporte, alimentação, multibenefícios, faculdade)',
  estagio: 'Estagiários', conselhos: 'RT do Coren e conselhos', aluguel: 'Aluguel, condomínio e IPTU', luz: 'Luz e água', telefonia: 'Telefonia',
  software: 'Software', honor: 'Contador e jurídico', manut: 'Manutenção', mkt: 'Marketing', limpeza: 'Material de limpeza', papelaria: 'Papelaria',
  copa: 'Copa (comida e bebida)', brindes: 'Brindes', servicos: 'Serviços (descarte, gráfica, motoboy, seguro)', banco: 'Tarifa bancária',
  cartao_emp: 'Cartão de crédito da empresa', outras: 'Outras despesas',
  cemep: 'CEMEP', emprest: 'Parcela de empréstimo', retirada: 'Retirada dos sócios',
  equip: 'Equipamentos (compra e financiamento)', reformas: 'Reformas',
  r_emprest: 'Empréstimos recebidos', r_outras: 'Outras receitas',
};
const ORDEM = [['receita', ['conv', 'part', 'outros_rec']], ['impostos', ['glosa', 'iss', 'cofins', 'pis', 'csll', 'irpj', 'irrf', 'imp_gerais']],
  ['variavel', ['oxigenio', 'plantao', 'insumos', 'lavanderia']],
  ['fixo', ['salarios', 'encargos', 'beneficios', 'estagio', 'conselhos', 'aluguel', 'luz', 'telefonia', 'software', 'honor', 'manut', 'mkt', 'limpeza', 'papelaria', 'copa', 'brindes', 'servicos', 'banco', 'cartao_emp', 'outras']],
  ['nao_op_desp', ['cemep', 'emprest', 'retirada']], ['investimento', ['equip', 'reformas']], ['nao_op_rec', ['r_emprest', 'r_outras']]];
const CANON = []; ORDEM.forEach(([grupo, ks]) => ks.forEach((k) => CANON.push({ grupo, linha: L[k], ordem: CANON.length })));
const GRUPO = Object.fromEntries(CANON.map((c) => [c.linha, c.grupo]));
const num = (v) => Number(String(v ?? 0).replace(',', '.')) || 0;
const r2 = (n) => Math.round(n * 100) / 100;
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
// sessão = oxigenoterapia ou item de agenda de câmara (mesma regra do financeiro da diretoria, 10/11/2026)
const ehSessao = (x) => /oxigenoterapia/i.test(String(x.TIPO || '') + ' ' + String(x.descricao || '')) || /multiplace|monoplace/i.test(String(x.profissional || ''));
const CORTESIA = (c) => /voucher|cortesia/i.test(c || '');
// receita por competência: linha da produção do iGut (sem a linha de fatura, que repete a sessão)
const receitaDe = (x) => { if (CORTESIA(x.convenio)) return null; if (!ehSessao(x)) return L.outros_rec; return /particular/i.test(x.convenio || '') ? L.part : L.conv; };
// lançamento sem categoria mas com subcategoria (poucos casos de 2025 e 2026): a categoria sai da subcategoria
const porSub = (sub) => /estagi/.test(sub) ? 'colaboradores estagiarios' : /tarifa/.test(sub) ? 'despesas bancarias' : /telefon|internet/.test(sub) ? 'operacionais'
  : /taxa fiscaliz|\biss\b|cofins|csll|irrf/.test(sub) ? 'impostos' : /enferm|oxigen|limpeza|papelaria/.test(sub) ? 'insumos' : /salario|ferias|vale/.test(sub) ? 'colaboradores pf' : '';
// "Receita com serviços › Particular" lançada como despesa: sem linha até o Jorge decidir (12/11/2026)
const PENDENTE = (l) => /receita com servico/.test(norm(l.categoria_nome)) && !/^receita/.test(norm(l.lancamento_tipo));
// recebimento lançado à mão como "Receita com serviços" (jan a nov/2024): repete as baixas automáticas por sessão do mesmo dia
// (mai/2024: R$ 421 mil à mão + R$ 492 mil automáticos para R$ 454 mil de produção). Fica fora da DRE e da soma do caixa (12/11/2026)
const RECEITA_MAO = (l) => /^receita/.test(norm(l.lancamento_tipo)) && /receita com servico/.test(norm(l.categoria_nome));
const despesa = (l) => { const sub = norm(l.subcategoria_nome), cat = norm(l.categoria_nome) || porSub(sub), txt = cat + ' ' + sub;
  if (PENDENTE(l) || RECEITA_MAO(l)) return null;
  if (/^receita/.test(norm(l.lancamento_tipo)) && !cat) return null;   // receita de paciente ou convênio: vem da produção
  if (/^imposto/.test(cat)) { if (/fgts/.test(sub)) return L.encargos; if (/\biss\b/.test(sub)) return L.iss; if (/cofins/.test(sub)) return L.cofins; if (/\bpis\b/.test(sub)) return L.pis;
    if (/csll/.test(sub)) return L.csll; if (/irpj/.test(sub)) return L.irpj; if (/irrf/.test(sub)) return L.irrf; return L.imp_gerais; }
  if (/colaboradores pj/.test(cat)) { if (/honorario.*medic|plantao|medic/.test(sub)) return L.plantao; if (/contador|contab|juridic|advoc/.test(sub)) return L.honor; return L.outras; }
  if (/estagiari/.test(cat)) return L.estagio;
  if (/colaboradores/.test(cat)) { if (/\brt\b|coren/.test(sub)) return L.conselhos; if (/vale|multibenef|faculdade|alimenta|transporte/.test(sub)) return L.beneficios; return L.salarios; }
  if (/conselho|sociedade/.test(cat)) return L.conselhos;
  if (/bancari/.test(cat)) { if (/emprest|financ/.test(sub)) return L.emprest; return L.banco; }
  if (/insumo/.test(cat)) { if (/oxigen/.test(sub)) return L.oxigenio; if (/enferm|epi/.test(sub)) return L.insumos; if (/limpeza/.test(sub)) return L.limpeza; if (/papelaria/.test(sub)) return L.papelaria;
    if (/comida|bebida/.test(sub)) return L.copa; if (/brinde/.test(sub)) return L.brindes; return L.outras; }
  if (/manutencao|reforma|equpamento|equipamento/.test(cat)) { if (/equpament|equipament/.test(sub)) return L.equip; if (/reforma/.test(sub)) return L.reformas; return L.manut; }
  if (/marketing/.test(cat)) return L.mkt;
  if (/operaciona/.test(cat)) { if (/aluguel|condom|iptu|tlp/.test(sub)) return L.aluguel; if (/luz|energia|caesb|agua/.test(sub)) return L.luz; if (/telefon|internet/.test(sub)) return L.telefonia;
    if (/programa|software|sistema/.test(sub)) return L.software; return L.outras; }
  if (/servico/.test(cat)) { if (/lavanderia/.test(sub)) return L.lavanderia; return L.servicos; }
  if (/retirada/.test(cat)) return L.retirada;
  if (/cemep/.test(cat)) return L.cemep;
  if (/cartao de credito/.test(cat)) return L.cartao_emp;
  if (/educacional|curso/.test(cat)) return L.outras;
  if (/emprest/.test(txt)) return /^receita/.test(norm(l.lancamento_tipo)) ? L.r_emprest : L.emprest;
  return null; };
