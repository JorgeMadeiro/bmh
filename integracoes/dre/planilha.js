// Uma linha por linha da DRE, com os totais, no formato de planilha (uma coluna por mês), para o "Baixar em Excel".
const d = $json; const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const r2 = (n) => Math.round((n || 0) * 100) / 100; const out = [];
const linha = (grupo, nome, fn) => { const o = { Grupo: grupo, Linha: nome }; d.MESES.forEach((m, i) => { o[MES[i]] = r2(fn(m)); }); o['Total ' + d.ANO] = r2(d.comDado.reduce((s, m) => s + fn(m), 0)); out.push(o); };
const grupo = (g, rot) => { const ls = Object.entries(d.linhas[g] || {}).sort((a, b) => a[1].ordem - b[1].ordem); linha(rot, '(total)', (m) => ls.reduce((s, [, l]) => s + (l.m[m] || 0), 0)); for (const [n, l] of ls) linha(rot, n, (m) => l.m[m] || 0); };
const T = d.tot;
grupo('receita', 'Receita bruta'); grupo('impostos', 'Impostos e glosas'); linha('Receita líquida', '(=)', (m) => T[m].li);
grupo('variavel', 'Custos variáveis'); linha('Margem de contribuição', '(=)', (m) => T[m].mc); grupo('fixo', 'Custo fixo'); linha('Lucro ou EBITDA', '(=)', (m) => T[m].eb);
grupo('nao_op_desp', 'Despesas não operacionais'); grupo('investimento', 'Investimentos'); grupo('nao_op_rec', 'Receitas não operacionais'); if (Object.keys(d.linhas.a_classificar || {}).length) grupo('a_classificar', 'A classificar');
linha('Resultado do exercício', '(=)', (m) => T[m].res);
return out.map((json) => ({ json }));
