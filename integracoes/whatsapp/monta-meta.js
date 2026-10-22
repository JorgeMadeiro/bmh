// Monta a linha do recebedor oficial da Meta (22/10/2026). Substitui a "Monta a linha" da Evolution neste caminho:
//   - telefone só em código (SHA-256 do número com DDI, sem "+", como a Nexo faz): liga a conversa ao Kommo e ao iGut sem
//     guardar o número;
//   - texto com CPF, telefone e e-mail mascarados, guardado 1 mês (decisão do Jorge, 22/10/2026), só para a leitura do
//     atendimento; áudio fica sem texto nesta fase (sem transcrição);
//   - origem pela lista ÚNICA integracoes/origem/frases.json (injetada pelo montar.js), só na mensagem do paciente;
//   - código do anúncio de clique para WhatsApp (ctwa_clid) e id do anúncio, que o Kommo não repassa.
const FRASES = /*__FRASES__*/[];
const sha256 = (s) => { const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const b = Array.from(unescape(encodeURIComponent(s)), (c) => c.charCodeAt(0)), l = b.length * 8; b.push(0x80); while (b.length % 64 !== 56) b.push(0);
  for (let i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (l >>> (i * 8)) & 0xff);
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < b.length; o += 64) { const w = []; for (let i = 0; i < 64; i++) w[i] = i < 16 ? (b[o + 4 * i] << 24) | (b[o + 4 * i + 1] << 16) | (b[o + 4 * i + 2] << 8) | b[o + 4 * i + 3] : (((r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10)) + w[i - 7] + (r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3)) + w[i - 16]) | 0);
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) { const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0; }
    H = H.map((v, i) => (v + [a, bb, c, d, e, f, g, h][i]) | 0); }
  return H.map((v) => (v >>> 0).toString(16).padStart(8, '0')).join(''); };
const sem = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const origemDe = (texto) => { const t = sem(texto); let m = null; for (const f of FRASES) { const i = sem(f.inicio); if (i && t.startsWith(i) && (!m || i.length > sem(m.inicio).length)) m = f; } return m ? m.origem : ''; };
const mascara = (s) => String(s || '')
  .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]')
  .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[e-mail]')
  .replace(/(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g, '[telefone]');
return $input.all().map((i) => { const b = i.json; const apagar = new Date(b.momento); apagar.setMonth(apagar.getMonth() + (b.guardar_meses || 1));
  const fone = String(b.telefone || '').replace(/\D/g, '');
  return { json: { chave: b.msg_id, momento: b.momento, dia: b.dia, telefone_hash: fone ? sha256(fone) : '', direcao: b.direcao, aparelho: b.aparelho || '', tipo: b.tipo,
    texto: mascara(b.texto), respondendo: b.respondendo || '', apagar_em: apagar.toISOString().slice(0, 10),
    origem: b.direcao === 'paciente' ? origemDe(b.texto) : '', anuncio_id: b.anuncio_id || '', ctwa_clid: b.ctwa_clid || '', referral_tipo: b.referral_tipo || '' } }; });
