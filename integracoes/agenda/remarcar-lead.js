// "Preciso remarcar" (19/11/2026): acha o lead do paciente no Kommo pelo código do iGut (campo do lead 626684, busca exata) e
// monta a ida para a etapa "Remarcar" do funil da unidade, com a nota para a recepção. A volta é manual (decisão do Jorge,
// 19/11/2026: os pacientes fazem sessões em sequência e o remarcar muitas vezes é só pular o dia). Sem lead (paciente que não conversou
// pelo WhatsApp), não faz nada no Kommo: a resposta dele aparece na conversa do mesmo jeito.
const corpo = (j) => { if (j && j._embedded) return j; try { return j && typeof j.data === 'string' && j.data ? JSON.parse(j.data) : {}; } catch (e) { return {}; } };
const FUNIL = { 'Asa Sul': 14783519, Taguatinga: 14783523 }, REMARCAR = { 'Asa Sul': 114327279, Taguatinga: 114327283 };
const pedidos = $('Pediu para remarcar?').all().map((i) => i.json), achados = $('Procura o lead (Kommo)').all().map((i) => corpo(i.json));
const out = [];
pedidos.forEach((c, k) => {
  const leads = (achados[k]?._embedded?.leads || []).filter((l) => (l.custom_fields_values || []).some((f) => f.field_id === 626684 && String(f.values?.[0]?.value) === String(c.paciente_id)));
  const l = leads.filter((x) => x.status_id !== 142 && x.status_id !== 143).sort((a, b) => b.updated_at - a.updated_at)[0] || leads.sort((a, b) => b.updated_at - a.updated_at)[0];
  if (!l || !FUNIL[c.unidade]) return;
  const [, mm, dd] = String(c.dia).split('-');
  out.push({ json: { lead: l.id, patch: { id: l.id, pipeline_id: FUNIL[c.unidade], status_id: REMARCAR[c.unidade] },
    nota: { entity_id: l.id, note_type: 'common', params: { text: `Pediu para remarcar pela confirmação automática: ${c.tipo || 'sessão'} de ${dd}/${mm} às ${String(c.hora || '').slice(0, 5)} desmarcada no iGut. Depois de remarcar (ou se o paciente só pulou o dia), mova o lead de volta para a etapa em que estava.` } } } });
});
return out;
