// Só totais, para a chamada manual conferir (nenhum dado de paciente).
const r = $('Monta a DRE').all().map((i) => i.json); const por = {};
for (const x of r) { if (x.grupo === 'controle') continue; const k = x.mes + ' · ' + x.grupo; por[k] = Math.round(((por[k] || 0) + x.valor) * 100) / 100; }
return [{ json: { linhas_gravadas: r.length, meses: [...new Set(r.map((x) => x.mes))], totais: por, controle: r.filter((x) => (x.grupo === 'controle' && !/^conferir · |^$/.test(x.linha)) || x.grupo === 'a_classificar').map((x) => x.mes + ' · ' + x.linha + ' = ' + x.valor), avisos: r.filter((x) => /^conferir · /.test(x.linha)).length } }];
