// Mês do fechamento: o anterior (dia 1 às 8h) ou ?mes=AAAA-MM na chamada manual. Abas no formato que o Jorge já usa
// ("09/26" e "Cobertura 09/26"). ?refazer=1 apaga e recria as abas do mês (só na chamada manual).
let q = {}; try { q = $('Manual').first().json.query || {}; } catch (e) {}
const ref = /^\d{4}-\d{2}$/.test(q.mes || '') ? DateTime.fromISO(q.mes + '-01') : $now.setZone('America/Sao_Paulo').startOf('month').minus({ months: 1 });
const nome = ref.setLocale('pt-BR').toFormat('LLLL');
const aba = (q.prefixo ? q.prefixo + ' ' : '') + ref.toFormat('LL/yy');
return [{ json: { mes: ref.toFormat('yyyy-MM'), aba, abaCob: (q.prefixo ? q.prefixo + ' ' : '') + 'Cobertura ' + ref.toFormat('LL/yy'), rotulo: nome, rotuloMes: nome.charAt(0).toUpperCase() + nome.slice(1) + '/' + ref.year, refazer: !!q.refazer } }];
