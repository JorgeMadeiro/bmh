// Nota e número de avaliações de cada unidade, para o site (snippet "BMH · nota do Google" no WordPress, que chama isto
// no máximo 2 vezes por dia). Só leitura. A chave impede que alguém de fora gaste a cota da API.
const q = $('Pedido do site').first().json.query || {};
if (q.chave !== '__CHAVE__') throw new Error('chamada sem a chave certa');
const token = $('Google · renova o acesso').first().json.access_token;
if (!token) throw new Error('sem acesso ao Perfil do Google');
const CONTA = 'accounts/117754317451946679663', PERFIS = { asa_sul: '15026912528968655315', taguatinga: '6381458115148112648' };
const out = { atualizado: $now.toISO() };
for (const [k, id] of Object.entries(PERFIS)) {
  const r = await this.helpers.httpRequest({ url: `https://mybusiness.googleapis.com/v4/${CONTA}/locations/${id}/reviews?pageSize=1`, headers: { Authorization: 'Bearer ' + token }, json: true, timeout: 30000 });
  if (!r.totalReviewCount) throw new Error('Google sem total de avaliações para ' + k);
  out[k] = { nota: Math.round(Number(r.averageRating) * 10) / 10, total: Number(r.totalReviewCount) };
}
return [{ json: out }];
