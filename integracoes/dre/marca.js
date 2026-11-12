// Clique no aviso do "Para conferir": marcar grava a hora; desmarcar apaga (igual à Nexo).
const b = $input.first().json.body || {};
// chave interna que só a página com login carrega (o clique não repete o login do navegador); sem ela o fluxo para aqui
if (b.t !== '__CHAVE_CONFERIDO__') return [];
const k = String(b.k || '').slice(0, 300);
if (!k) return [];
return [{ json: { chave: k, k, marcar: b.acao === 'marcar', marcado_em: $now.setZone('America/Sao_Paulo').toISO() } }];
