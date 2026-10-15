// Lê as avaliações dos dois perfis da BMH e devolve as que ainda não têm resposta (14/10/2026, modelo do fluxo da Nexo).
// Só os perfis da BMH: a autorização do Jorge também enxerga Nexo e Cannlink, que nunca se mexem daqui.
// Teste com ?modo=teste&simular=1: pega as 2 avaliações mais recentes (mesmo respondidas) só para ver a sugestão.
const CONTA = 'accounts/117754317451946679663';
const PERFIS = { 'Asa Sul': '15026912528968655315', Taguatinga: '6381458115148112648' };
const token = $('Google · renova o acesso').first().json.access_token;
if (!token) throw new Error('sem acesso ao Perfil do Google (a renovação falhou)');
let q = {}; try { q = $('Rodar agora').first().json.query || {}; } catch (e) {}
const NOTA = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const todas = [];
for (const [unidade, id] of Object.entries(PERFIS)) {
  let pagina = '';
  for (let i = 0; i < 30; i++) {
    const r = await this.helpers.httpRequest({ url: `https://mybusiness.googleapis.com/v4/${CONTA}/locations/${id}/reviews?pageSize=50` + (pagina ? '&pageToken=' + pagina : ''),
      headers: { Authorization: 'Bearer ' + token }, json: true, timeout: 60000 });
    for (const x of r.reviews || []) todas.push({ ...x, unidade });
    pagina = r.nextPageToken; if (!pagina) break;
  }
}
const limpa = (s) => String(s || '').replace(/\(Translated by Google\)[\s\S]*$/i, '').replace(/\(Original\)\s*/i, '').trim();
const simular = q.modo === 'teste' && q.simular;
const base = simular ? [...todas].sort((a, b) => String(b.createTime).localeCompare(String(a.createTime))).slice(0, 2) : todas.filter((r) => !r.reviewReply);
const sem = base.map((r) => ({ review_id: r.reviewId, review_name: r.name, unidade: r.unidade, nota: NOTA[r.starRating] || 0, comentario: limpa(r.comment),
  nome: String(r.reviewer?.displayName || '').trim(), avaliada_em: r.createTime }));
// últimas respostas publicadas, sem o nome de quem avaliou (para a IA não repetir abertura nem frase)
const recentes = todas.filter((r) => r.reviewReply).sort((a, b) => String(b.reviewReply.updateTime).localeCompare(String(a.reviewReply.updateTime)))
  .slice(0, 15).map((r) => String(r.reviewReply.comment || '').replace(String(r.reviewer?.displayName || '').split(' ')[0] || '§§', '[nome]'));
return [{ json: { total: todas.length, sem_resposta: sem, recentes, teste: q.modo === 'teste' } }];
