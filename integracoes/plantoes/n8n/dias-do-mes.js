// Um item por dia do mês do fechamento, para ler a agenda do iGut dia a dia (regra do Jorge de 03/11/2026: a lacuna
// nasce com a saída pela última sessão + 1h30, e dia sem sessão não vira lacuna).
const ref = DateTime.fromISO($('Qual mês').first().json.mes + '-01');
return Array.from({ length: ref.daysInMonth }, (_, i) => ({ json: { dia: ref.plus({ days: i }).toISODate() } }));
