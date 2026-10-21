#!/usr/bin/env node
/**
 * Fila do Instagram da BMH (@hiperbaricabrasilia), para rodar na VPS. Quem publica é o n8n
 * (fluxo "BMH · Instagram · fila de publicação", r6Rib8PXJ0zlSo4z, tabela BMH_fila_publicacao).
 * Adaptado de Jorge_Claude_VsCode/scripts/publicar-instagram.js em 20/10/2026.
 *
 *   previa <pasta>                                              legenda exatamente como sairia, mais as travas
 *   fila                                                        mostra a fila (a mesma tabela do n8n)
 *   agendar <pasta> --quando "2026-10-27 08:00" --publica [--teste]
 *                                                               sobe as mídias e põe na fila
 *   agendar <pasta> --quando "..." --simular                    põe na fila como simulação (status teste):
 *                                                               o n8n cria a mídia no Instagram e NÃO publica
 *   cancelar <id>                                               tira da fila (agendado vira cancelado)
 *
 * A pasta precisa ter: instagram/slide-*.png (ou uma imagem só, ou um vídeo) e legenda.md (a legenda é o bloco
 * entre o 1º e o 2º "---"; depois do 2º ficam anotações que não vão para o Instagram).
 *
 * Diferenças da Pessoal:
 *  - Sem .env: tudo passa pelo cofre (http://cofre:8080). Mídia sobe pela rota wp-bmh (até 15 MB por arquivo);
 *    a fila é lida pela n8n-tabelas; inserir linha e cancelar dependem das rotas n8n-fila-bmh e
 *    n8n-fila-bmh-status (pedidas à Central em 20/10/2026, ver saidas/fila-instagram-bmh-2026-10-20.md).
 *  - --publica é obrigatório para agendar: só se usa depois de o Jorge dizer "publica" para aquela peça.
 *  - As travas rodam antes de qualquer envio: trava dura impede agendar; trava do CFM só avisa (o Jorge decide).
 *  - Antes de subir mídia, confere se a rota de inserir existe: sem ela, nada sobe (a biblioteca do site é pública,
 *    então mídia solta ficaria acessível sem post nenhum).
 *  - Sem o comando "agora" da Pessoal: agendar para daqui a alguns minutos dá no mesmo (o fluxo roda a cada 5 min).
 *  - --teste é o reel de teste (aparece só para quem não segue), como na Pessoal. Simulação é outra coisa: --simular.
 */
const fs = require('fs');
const path = require('path');

const COFRE = (process.env.COFRE_URL || 'http://cofre:8080').replace(/\/+$/, '');
const TABELA = 'RaABWuNztVAap9AV';                       // BMH_fila_publicacao
const ROTA_INSERE = 'n8n-fila-bmh';                      // POST /api/v1/data-tables/<TABELA>/rows (pedida)
const ROTA_STATUS = 'n8n-fila-bmh-status';               // POST /webhook/<caminho do muda status> (pedida)
const CAMINHO_STATUS = 'bmh-fila-status-6f470f8c43';    // webhook de scripts/n8n/bmh-instagram-fila-muda-status.json
const MAX_MB = 15;                                       // limite de corpo da rota wp-bmh no cofre
const MAX_LEGENDA = 2200;                                // limite do Instagram

async function cofre(rota, caminho, opcoes = {}) {
  const r = await fetch(`${COFRE}/${rota}${caminho}`, opcoes);
  const txt = await r.text();
  if (!r.ok) throw new Error(`cofre ${rota} respondeu ${r.status}: ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : null;
}
const rotasDoCofre = async () => (await cofre('saude', '')).rotas || [];
const lerFila = async () => ((await cofre('n8n-tabelas', `/api/v1/data-tables/${TABELA}/rows?limit=250`)).data || [])
  .sort((a, b) => a.quando_ms - b.quando_ms);
function tipoDaPeca({ imagens, videos }) { return videos.length ? 'reel' : (imagens.length > 1 ? 'carrossel' : 'imagem'); }

function lerPeca(pasta) {
  if (!pasta) throw new Error('falta a pasta da peça');
  const dirImgs = path.join(pasta, 'instagram');
  const arquivos = fs.existsSync(dirImgs) ? fs.readdirSync(dirImgs).sort() : [];
  const videos = arquivos.filter(f => /\.(mp4|mov)$/i.test(f)).map(f => path.join(dirImgs, f));
  const imagens = arquivos.filter(f => /\.(png|jpe?g)$/i.test(f)).map(f => path.join(dirImgs, f));
  if (!imagens.length && !videos.length) throw new Error('nenhuma mídia em ' + dirImgs);
  const arqLegenda = path.join(pasta, 'legenda.md');
  if (!fs.existsSync(arqLegenda)) throw new Error('falta legenda.md em ' + pasta);
  const bruto = fs.readFileSync(arqLegenda, 'utf8');
  const partes = bruto.split(/\n---\n/);
  // Só o bloco entre o 1º e o 2º separador (depois do 2º: frase citável, alt-text, que não vão para o Instagram).
  const legenda = (partes.length > 1 ? partes[1] : bruto)
    .replace(/^#.*$/gm, '').replace(/^>.*$/gm, '').replace(/\*\*/g, '').trim();
  return { imagens, videos, legenda };
}

// Travas. "duras" impedem agendar; "cfm" é aviso (regra do Jorge: marcar, entregar com e sem, ele decide).
function conferir({ imagens, videos, legenda }) {
  const duras = [], cfm = [];
  const tipo = tipoDaPeca({ imagens, videos });
  const usados = tipo === 'reel' ? videos.slice(0, 1) : imagens;
  if (videos.length && imagens.length) duras.push('a pasta tem vídeo e imagem: só o vídeo iria (deixe um tipo só)');
  if (imagens.length > 10 && !videos.length) duras.push(`${imagens.length} imagens: o carrossel aceita no máximo 10`);
  for (const a of usados) {
    const mb = fs.statSync(a).size / 1024 / 1024;
    if (mb > MAX_MB) duras.push(`${path.basename(a)} tem ${mb.toFixed(1)} MB: o cofre aceita até ${MAX_MB} MB por arquivo`);
  }
  if (!legenda) duras.push('legenda vazia');
  if (legenda.length > MAX_LEGENDA) duras.push(`legenda com ${legenda.length} caracteres: o Instagram aceita ${MAX_LEGENDA}`);
  if (/(^|\s)#[\p{L}\d_]+/u.test(legenda)) duras.push('hashtag na legenda (decisão de 11/10/2026: sem hashtag)');
  if (/\barrast(a|e)\b/i.test(legenda)) duras.push('"arraste" na legenda (decisão de 11/10/2026)');
  if (/(^|\s)\(?\d{1,2}\s*\/\s*\d{1,2}\)?\s*$/m.test(legenda)) duras.push('parece contador de página ("1/7") na legenda');
  if (/[—–]/.test(legenda)) duras.push('travessão na legenda');
  const spa = legenda.match(/\b(relax\w*|rejuvenesc\w*|detox|bem-estar|antes e depois|spa)\b/gi);
  if (spa) duras.push(`tom de spa ou estética (trava da BMH): ${[...new Set(spa.map(s => s.toLowerCase()))].join(', ')}`);
  const termosCfm = [
    [/garanti(do|da|a|mos)\b/i, 'garantia de resultado'],
    [/\b(cura|curar|cura\w*)\b/i, 'promessa de cura'],
    [/\b100\s*%/i, '"100%"'],
    [/sem (nenhum )?risco/i, '"sem risco"'],
    [/\b(o|a|os|as) melhor(es)?\b|\bmelhor (cl[ií]nica|servi[cç]o|da regi[aã]o|de bras[ií]lia)/i, 'autoelogio ("melhor")'],
    [/depoimento|paciente (disse|contou|relata)/i, 'depoimento de paciente'],
    [/[uú]ltimas vagas|s[oó] hoje|corra|n[aã]o perca/i, 'urgência'],
    [/resultado (r[aá]pido|imediato|garantido)/i, 'promessa de resultado'],
  ];
  for (const [re, qual] of termosCfm) if (re.test(legenda)) cfm.push(qual);
  if (/\bR\$\s*\d/.test(legenda)) cfm.push('preço na legenda (só se o Jorge liberar)');
  return { tipo, usados, duras, cfm };
}

function mostrarTravas({ duras, cfm }) {
  for (const d of duras) console.log('  TRAVA: ' + d);
  for (const c of cfm) console.log('  ⚠️ trava do CFM (aviso, o Jorge decide): ' + c);
  if (!duras.length && !cfm.length) console.log('  travas: nenhuma');
  console.log('  lembrete: foto com paciente só com autorização por escrito, conferida antes (o script não vê isso)');
}

// A Meta busca a mídia por URL: sobe para a biblioteca do site da BMH pelo cofre (multipart: o cofre só repassa
// content-type, não content-disposition) e usa o endereço de lá.
async function subirMidia(arquivo) {
  const ext = path.extname(arquivo).toLowerCase();
  const tipos = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.mov': 'video/quicktime' };
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(arquivo)], { type: tipos[ext] || 'application/octet-stream' }), path.basename(arquivo));
  const m = await cofre('wp-bmh', '/wp-json/wp/v2/media', { method: 'POST', body: form });
  if (!m?.source_url) throw new Error('o site não devolveu o endereço de ' + arquivo);
  return m.source_url;
}

(async () => {
  const cmd = process.argv[2];
  const flag = (n) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : null; };
  const tem = (n) => process.argv.includes('--' + n);

  if (cmd === 'previa') {
    const peca = lerPeca(process.argv[3]);
    const c = conferir(peca);
    console.log(peca.legenda);
    console.log(`\n[${c.tipo}: ${peca.imagens.length} imagens, ${peca.videos.length} vídeos, legenda com ${peca.legenda.length} caracteres]`);
    for (const a of c.usados) console.log(`  ${path.basename(a)}  ${(fs.statSync(a).size / 1024 / 1024).toFixed(2)} MB`);
    mostrarTravas(c);
    if (c.duras.length) process.exitCode = 2;
  }
  else if (cmd === 'fila') {
    const f = await lerFila();
    if (!f.length) return console.log('fila vazia');
    for (const i of f) console.log(`${String(i.id).padStart(3)}  ${i.quando}  ${String(i.status).padEnd(10)}  ${i.pasta}${i.link ? '\n       ' + i.link : ''}${i.erro ? '\n       erro: ' + i.erro : ''}`);
  }
  else if (cmd === 'agendar') {
    const pasta = process.argv[3];
    const quando = flag('quando');
    const simular = tem('simular');
    if (!pasta || !quando) { console.error('uso: agendar <pasta> --quando "AAAA-MM-DD HH:MM" --publica [--teste]  |  ... --simular'); process.exit(1); }
    if (!simular && !tem('publica')) {
      console.error('Agendar é publicar no Instagram da BMH. Só com o "publica" do Jorge para esta peça: repita com --publica.');
      console.error('Para testar o caminho sem publicar, use --simular.');
      process.exit(1);
    }
    const ms = new Date(quando.replace(' ', 'T') + '-03:00').getTime();
    if (!(ms > Date.now())) { console.error('horário inválido ou no passado: ' + quando); process.exit(1); }
    const peca = lerPeca(pasta);
    const c = conferir(peca);
    mostrarTravas(c);
    if (c.duras.length) { console.error('Não agendei: corrija as travas acima e rode a previa de novo.'); process.exit(2); }
    if (!(await rotasDoCofre()).includes(ROTA_INSERE)) {
      console.error(`Não agendei e não subi nada: o cofre ainda não tem a rota ${ROTA_INSERE} (inserir linha na fila).`);
      process.exit(3);
    }
    console.log(`  ${c.tipo}: ${c.usados.length} arquivo(s), legenda com ${peca.legenda.length} caracteres`);
    const urls = [];
    for (const a of c.usados) { const u = await subirMidia(a); urls.push(u); console.log('  subiu: ' + u.split('/').pop()); }
    const quandoTxt = new Date(ms).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
    const [linha] = await cofre(ROTA_INSERE, `/api/v1/data-tables/${TABELA}/rows`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnType: 'id', data: [{
        pasta, tipo: c.tipo, legenda: peca.legenda, midias: JSON.stringify(urls), teste: tem('teste'),
        quando: quandoTxt, quando_ms: ms, status: simular ? 'teste' : 'agendado', tentativas: 0 }] }) });
    console.log(simular
      ? `na fila como simulação (${linha.id}). Rode o "Rodar agora" com ?simular=1; o status vira simulado ou simulacao-falhou.`
      : `agendado (${linha.id}): ${pasta}\npara ${quandoTxt}. Quem publica é o n8n (se o fluxo estiver ligado); o aviso chega no Telegram.`);
  }
  else if (cmd === 'cancelar') {
    const id = Number(process.argv[3]);
    if (!id) { console.error('uso: cancelar <id>   (o id aparece no comando fila)'); process.exit(1); }
    if (!(await rotasDoCofre()).includes(ROTA_STATUS)) {
      console.error(`O cofre ainda não tem a rota ${ROTA_STATUS} (mudar o status de um item da fila).`);
      console.error('Enquanto isso: no n8n, tabela BMH_fila_publicacao, troque o status da linha para cancelado.');
      process.exit(3);
    }
    // A API pública do n8n não altera linha de tabela: o pedido vai pelo fluxo "BMH · Instagram · fila · muda status".
    await cofre(ROTA_STATUS, `/webhook/${CAMINHO_STATUS}`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelado' }) });
    await new Promise(res => setTimeout(res, 3000));
    const item = (await lerFila()).find(i => i.id === id);   // o webhook responde antes da troca: relê para conferir
    console.log(item ? `${id}: ${item.status}  ${item.pasta}` : `não achei o item ${id} na fila`);
  }
  else {
    console.log('comandos: previa <pasta> | fila | agendar <pasta> --quando "AAAA-MM-DD HH:MM" --publica [--teste] | agendar ... --simular | cancelar <id>');
  }
})().catch(e => { console.error('Erro: ' + e.message); process.exit(1); });
