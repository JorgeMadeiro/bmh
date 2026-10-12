// Só contagens
const n = k => { try { return $(k).all().length; } catch (e) { return 0; } };
return [{ json: { ok: true, ...$('Quais dias').first().json, anuncios: n('Google Ads · anúncios'), parcela: n('Google Ads · parcela'), site: n('Monta site'), organico: n('Monta orgânico'), horas: n('Monta horas') } }];
