// Tentativi degli esercizi: solo risposte scritte e autovalutazioni esplicite.
export const ATTEMPTS_KEY = 'ids-kg:tentativi:v1';
const MAX_TENTATIVI = 500;
const MAX_TESTO = 10000;
export const exerciseId = (nodoId, indice) => `${nodoId}#esercizio-${indice}`;

function valido(t) {
  return t && typeof t.nodo_id === 'string' && t.nodo_id && Number.isInteger(t.indice) && t.indice >= 0
    && typeof t.risposta === 'string' && t.risposta.trim() && t.risposta.length <= MAX_TESTO
    && typeof t.ts === 'string' && Number.isFinite(Date.parse(t.ts))
    && (t.valutazione === null || t.valutazione === 'corretto' || t.valutazione === 'da-rivedere');
}

export function leggiTentativi(storage) {
  try {
    const dati = JSON.parse(storage.getItem(ATTEMPTS_KEY) || '[]');
    return Array.isArray(dati) ? dati.filter(valido).slice(-MAX_TENTATIVI) : [];
  } catch { return []; }
}

export function ultimoTentativo(tentativi, nodoId, indice) {
  return [...(tentativi || [])].reverse().find((t) => t.nodo_id === nodoId && t.indice === indice) || null;
}

export function createAttemptStore(storage, now = () => new Date()) {
  const salva = (tentativi) => {
    try { storage.setItem(ATTEMPTS_KEY, JSON.stringify(tentativi.slice(-MAX_TENTATIVI))); return true; }
    catch { return false; }
  };
  return {
    read: () => leggiTentativi(storage),
    latest: (id, i) => ultimoTentativo(leggiTentativi(storage), id, i),
    record(nodoId, indice, risposta) {
      const t = { nodo_id: nodoId, indice, risposta: String(risposta || '').trim(), valutazione: null, ts: now().toISOString() };
      if (!valido(t)) return false;
      return salva([...leggiTentativi(storage), t]);
    },
    assess(nodoId, indice, valutazione) {
      if (!['corretto', 'da-rivedere'].includes(valutazione)) return false;
      const all = leggiTentativi(storage);
      for (let i = all.length - 1; i >= 0; i -= 1) {
        if (all[i].nodo_id === nodoId && all[i].indice === indice) {
          all[i] = { ...all[i], valutazione };
          return salva(all);
        }
      }
      return false;
    },
  };
}
