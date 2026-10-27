// Esiti del simulatore. Contratto 4.2 (docs/IMPROVEMENT_PLAN.md):
// chiave localStorage «ids-kg:esiti-simulatore:v1», array JSON di
// {slot_id, nodo_id, profilo, modalita, punti, punti_max, ts} con al
// massimo 500 voci (le più vecchie scartate). X5 importa solo leggiEsiti.
// Lo storage è iniettato: niente localStorage globale.

export const CHIAVE_ESITI = 'ids-kg:esiti-simulatore:v1';
export const MAX_ESITI = 500;

const MODALITA_VALIDE = new Set(['allenamento', 'simulazione']);

function puntiValidi(punti, puntiMax) {
  const okSingolo = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0);
  if (!okSingolo(punti) || !okSingolo(puntiMax)) return false;
  if (punti !== null && puntiMax !== null && punti > puntiMax) return false;
  return true;
}

export function esitoValido(esito) {
  if (!esito || typeof esito !== 'object' || Array.isArray(esito)) return false;
  if (typeof esito.slot_id !== 'string' || !esito.slot_id.trim()) return false;
  if (typeof esito.nodo_id !== 'string' || !esito.nodo_id.trim()) return false;
  if (typeof esito.profilo !== 'string' || !esito.profilo.trim()) return false;
  if (!MODALITA_VALIDE.has(esito.modalita)) return false;
  if (!puntiValidi(esito.punti, esito.punti_max)) return false;
  if (typeof esito.ts !== 'string' || Number.isNaN(Date.parse(esito.ts))) return false;
  return true;
}

function normalizza(esito) {
  return {
    slot_id: esito.slot_id,
    nodo_id: esito.nodo_id,
    profilo: esito.profilo,
    modalita: esito.modalita,
    punti: esito.punti,
    punti_max: esito.punti_max,
    ts: esito.ts,
  };
}

export function leggiEsiti(storage, chiave = CHIAVE_ESITI) {
  try {
    const raw = storage.getItem(chiave);
    if (!raw) return [];
    const dati = JSON.parse(raw);
    if (!Array.isArray(dati)) return [];
    return dati.filter(esitoValido).map(normalizza);
  } catch {
    return [];
  }
}

export function registraEsito(storage, esito, chiave = CHIAVE_ESITI) {
  const completo = esito && typeof esito === 'object' && esito.ts == null
    ? { ...esito, ts: new Date().toISOString() }
    : esito;
  if (!esitoValido(completo)) throw new TypeError('esito non valido: servono slot_id, nodo_id, profilo, modalita (allenamento|simulazione), punti/punti_max (number|null) e ts ISO-8601');
  const esiti = leggiEsiti(storage, chiave);
  esiti.push(normalizza(completo));
  const tagliati = esiti.slice(-MAX_ESITI);
  try {
    storage.setItem(chiave, JSON.stringify(tagliati));
  } catch {
    return null;
  }
  return tagliati;
}
