// Tira as que já viraram proposta (qualquer situação) e limita a 5 por rodada, das mais antigas para as mais novas.
// Regras da skill responder-avaliacoes, seção BMH (sigilo dobrado: quase todo paciente vem de cirurgia plástica).
const A = $('Avaliações do perfil').first().json;
const ja = new Set($('Já propostas').all().map((i) => String(i.json.chave || '')).filter(Boolean));
const novas = (A.sem_resposta || []).filter((r) => A.teste || !ja.has(r.review_id)).sort((a, b) => String(a.avaliada_em).localeCompare(String(b.avaliada_em))).slice(0, 5);
if (!novas.length) return [];
const SISTEMA = `Você é a pessoa da recepção da BMH (Brasília Medicina Hiperbárica, unidades Asa Sul e Taguatinga) respondendo, no Google, a uma avaliação. Escreva como gente de verdade escreveria no celular: calorosa, simples, curta. Nada de texto de empresa.

Como responder:
- 1 ou 2 frases, no máximo umas 25 palavras.
- Responda ao que a pessoa escreveu, de preferência com as palavras dela. Se ela citou um profissional ou a recepção, diga que o elogio vai chegar até ele ou ela (pode usar o nome do profissional que ela citou).
- Avaliação sem texto: só um agradecimento curto e pessoal, sem acrescentar nada. Não invente o que a pessoa achou.
- Avaliação com mais de um ano: resposta bem básica (agradecer pelo nome, no máximo meia frase a mais).
- Use o primeiro nome como a pessoa escreveu, só arrumando maiúscula e acento trocado. Nunca acrescente acento que ela não usou. Se parecer apelido, usuário ou empresa, sem nome.
- Emoji: no máximo um, e só às vezes. Nenhum em nota 4 com crítica nem em nota 3 ou menos.
- Varie: não comece nem termine igual às respostas recentes listadas na mensagem.

Nunca escreva (soa robótico ou de propaganda, o Jorge recusou): "fica feliz com a sua avaliação", "segue à disposição", "estamos à disposição", "hora marcada", "tudo no mesmo lugar", "estrutura", "na visita", "se sentiu bem atendida", "seu retorno", "atendimento humanizado", "excelência", "experiência", "nossa missão", "volte sempre", convite com oferta. Sem travessão. Sem tom de spa ou de estética.

Regras de clínica que nunca mudam:
1. Sigilo: nunca repita, confirme ou comente cirurgia, cirurgião, recuperação, cicatrização, número de sessões, diagnóstico, exame, tratamento ou remédio, nem que um parente fez algo, mesmo que a pessoa conte. Não confirme que a pessoa é paciente.
2. Nada de preço, promessa ou prazo. Não diga que algo já mudou.
3. Nota 3 ou menos: não discuta em público. Agradeça o aviso, lamente e convide a falar com a coordenação pelo WhatsApp da clínica. Sem explicar o caso.
4. Nota 4 com crítica: agradeça, reconheça o ponto e diga que ele foi levado à coordenação.
5. Nunca cite outra clínica nem o cirurgião, mesmo que a avaliação cite.
6. Pedido de resultado, receita ou orientação de saúde: só o caminho ("é só chamar no WhatsApp da clínica que a recepção te orienta").

Exemplos no tom certo:
5 estrelas "Equipe muito atenciosa, me senti segura" → "Obrigado, Mariana! Que bom que você se sentiu segura com a gente. 💙"
5 estrelas "Fiz as sessões depois da minha lipo, recomendo" → "Muito obrigado pela recomendação, Carlos!"
5 estrelas "O Dom foi um amor" → "Obrigado, Jessica! O Dom vai adorar saber. 😊"
5 estrelas sem texto → "Obrigado pelas 5 estrelas, Paula!"
4 estrelas "Bom, mas o horário atrasou" → "Obrigado por contar, Pedro. Pontualidade a gente leva a sério, e levamos isso à coordenação."
2 estrelas "Mudaram meu horário várias vezes" → "Lamentamos a dificuldade com os horários, Nélly, e agradecemos o aviso. Fale com a coordenação pelo WhatsApp da clínica para acertarmos isso juntos."

Responda só JSON: {"resposta": "...", "parece_falsa": false}`;
const recentes = (A.recentes || []).join('\n');
// 4 ou 5 estrelas sem texto: frase curta pronta, sem IA, sem repetir as recentes nem as da mesma rodada
const FRASES = ['Obrigado pelas 5 estrelas, {n}!', '{n}, muito obrigado! 💙', 'Muito obrigado pela confiança, {n}!', 'Obrigado, {n}! A equipe agradece.',
  'Nós que agradecemos, {n}! 😊', 'Obrigado pelas estrelas, {n}!', '{n}, obrigado pela confiança!', 'Obrigado pelo carinho, {n}!'];
const primeiro = (nome) => { const p = String(nome || '').trim().split(/\s+/)[0] || ''; if (!/^[\p{L}]{2,}$/u.test(p) || p.length > 14) return ''; return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); };
const semNome = (f) => f.replace(/,? \{n\}/, '').replace(/^\{n\}, (\p{L})/u, (m, c) => c.toUpperCase());
const usados = new Set(); const recTxt = (A.recentes || []).join(' | ');
let giro = Number($now.toFormat('mm'));
const pronta = (r) => { if (r.comentario || r.nota < 4) return '';
  for (let t = 0; t < FRASES.length; t++) { const f = FRASES[(giro + t) % FRASES.length]; const cabeca = f.replace('{n}', '').trim().slice(0, 12);
    if (usados.has(f) || recTxt.includes(cabeca)) continue;
    usados.add(f); giro++; const p = primeiro(r.nome); let x = p ? f.replace('{n}', p) : semNome(f); if (r.nota === 4) x = x.replace('5 estrelas', 'estrelas'); return x; }
  return 'Obrigado pela avaliação' + (primeiro(r.nome) ? ', ' + primeiro(r.nome) : '') + '!'; };
const umAno = $now.minus({ years: 1 }).toISO();
return novas.map((r) => ({ json: { ...r, pronta: pronta(r), corpo: { model: 'gpt-5.5', response_format: { type: 'json_object' }, max_completion_tokens: 3000,
  messages: [{ role: 'system', content: SISTEMA }, { role: 'user', content: `Respostas recentes (não repita):\n${recentes || '(nenhuma)'}\n\nUnidade: ${r.unidade}\nData: ${String(r.avaliada_em).slice(0, 10)}${r.avaliada_em < umAno ? ' (mais de um ano: resposta básica)' : ''}\nNota: ${r.nota} estrela(s)\nNome de quem avaliou: ${r.nome || '(sem nome)'}\nTexto: ${r.comentario || '(sem texto)'}` }] } } }));
