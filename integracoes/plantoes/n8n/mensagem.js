// Relatório de divergências no Telegram (robô BMH alertas), com o botão "Pronto, gerar os e-mails".
// Não inventa plantão: só aponta. O Jorge completa na planilha e toca no botão.
const D = $('Monta o mês').first().json, M = D.M, d = M.divergencias;
const brl = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const h = (x) => Number(x).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bloco = (titulo, l, max = 15) => (l.length ? [`\n${titulo.toUpperCase()} (${l.length})`, ...l.slice(0, max).map((x) => '• ' + x), ...(l.length > max ? [`… e mais ${l.length - max}`] : [])] : []);
const t = [`🩺 Plantões de ${D.rotuloMes}: aba "${D.aba}" criada na planilha (lacunas em vermelho no fim da aba).`,
  `${M.linhas.length} turnos · ${h(M.total.horas)} h · ${brl(M.total.valor)} (antes das lacunas que você completar)`,
  ...bloco('Lacunas (dia/unidade sem manhã ou tarde)', d.lacunas, 31),
  ...bloco('Turno com dois médicos', d.doisMedicos), ...bloco('Médico nas duas unidades no mesmo dia', d.duasUnidades),
  ...bloco('Duplicados com horários diferentes', d.duplicados), ...bloco('Sem horário no formulário', d.semHorario),
  ...bloco('Tardes que terminaram antes do horário da unidade', d.tardesCurtas, 10), ...bloco('Correções de nome e CRM', d.correcoes),
  '', 'Preencha Nome e CRM nas linhas vermelhas da aba e toque em Pronto para eu montar os rascunhos dos e-mails.',
  'Planilha: https://docs.google.com/spreadsheets/d/1E2DJykq0SAARKh9ci5MEtuCfDsXOzbPAlazjOFO5XKM'];
let texto = t.join('\n'); if (texto.length > 4000) texto = texto.slice(0, 3990) + '\n…';
texto = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');   // vai em HTML no Telegram
return [{ json: { texto, botao: 'pl:' + D.mes + ':ok' } }];
