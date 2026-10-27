// Ripasso dai tentativi effettivi, con priorità agli errori e alternanza degli argomenti.
import { exerciseId } from './attempts.js';
import { ultimiEsiti } from './mastery.js';
import { isIsoDay } from '../../modules/ripasso/giorni.js';

export const EXAM_DATE_KEY = 'ids-kg:data-esame:v1';

export function leggiDataEsame(storage) {
  try { const v = storage.getItem(EXAM_DATE_KEY); return isIsoDay(v) ? v : null; } catch { return null; }
}
export function salvaDataEsame(storage, data) {
  if (data && !isIsoDay(data)) return false;
  try { data ? storage.setItem(EXAM_DATE_KEY, data) : storage.removeItem(EXAM_DATE_KEY); return true; } catch { return false; }
}

function ultimiTentativi(tentativi) {
  const out = new Map();
  for (const t of tentativi || []) {
    if (!t || typeof t.nodo_id !== 'string' || !Number.isInteger(t.indice) || t.indice < 0) continue;
    const id = exerciseId(t.nodo_id, t.indice);
    const precedente = out.get(id);
    if (!precedente || Date.parse(t.ts) >= Date.parse(precedente.ts)) out.set(id, t);
  }
  return out;
}

/** Nodi con almeno un esercizio autovalutato "da rivedere" nel tentativo più recente. */
export function nodiDaRivedere(tentativi) {
  return new Set([...ultimiTentativi(tentativi).values()].filter((t) => t.valutazione === 'da-rivedere').map((t) => t.nodo_id));
}

/** Aggiunge al mazzo solo esercizi realmente tentati, senza duplicare nodi o tracce. */
export function carteDaTentativi(nodi, tentativi) {
  const byId = new Map((nodi || []).map((n) => [n.id, n]));
  const carte = [];
  for (const [id, t] of ultimiTentativi(tentativi)) {
    const nodo = byId.get(t.nodo_id);
    const e = nodo?.esercizi?.[t.indice];
    if (!e || typeof e.testo !== 'string' || !e.testo.trim() || typeof e.soluzione !== 'string' || !e.soluzione.trim()) continue;
    carte.push({ id, nodoId: nodo.id, nodoTitolo: nodo.title || nodo.id, area: nodo.area ?? null,
      priorita: nodo.priorita?.livello ?? null, tipo: 'esercizio', indice: t.indice, domanda: e.testo.trim(), risposta: e.soluzione.trim() });
  }
  return carte;
}

/** Alterna area e nodo se possibile, senza perdere o duplicare carte. */
export function alternaArgomenti(carte, precedente = null) {
  const rimaste = [...carte], result = [];
  let last = precedente;
  while (rimaste.length) {
    let i = last ? rimaste.findIndex((c) => c.area !== last.area && c.nodoId !== last.nodoId) : 0;
    if (i < 0) i = rimaste.findIndex((c) => c.nodoId !== last?.nodoId);
    if (i < 0) i = 0;
    last = rimaste.splice(i, 1)[0];
    result.push(last);
  }
  return result;
}

/**
 * Errori → carte scadute → nodi tentati → nuove → ripassi previsti dopo l'esame.
 * Con data facoltativa, una carta futura che scadrebbe dopo la data è anticipata;
 * date passate o mancanti non modificano la schedulazione.
 */
export function pianificaCoda(carte, stati, oggi, { tentativi = [], esiti = [], dataEsame = null } = {}) {
  const tentati = new Set((tentativi || []).map((t) => t.nodo_id));
  const errori = nodiDaRivedere(tentativi);
  for (const [id, esito] of ultimiEsiti(esiti)) if (!esito.corretto) errori.add(id);
  const dataValida = isIsoDay(dataEsame) && dataEsame >= oggi ? dataEsame : null;
  const gruppi = [[], [], [], [], []];
  for (const carta of carte || []) {
    const s = stati?.[carta.id];
    const scaduta = s && (!s.scadenza || s.scadenza <= oggi);
    const anticipata = s && dataValida && s.scadenza && s.scadenza > dataValida;
    const daRivedere = errori.has(carta.nodoId) || s?.ultimoVoto === 'ancora';
    if (s && !scaduta && !anticipata && !daRivedere) continue;
    const gruppo = daRivedere ? 0
      : scaduta ? 1 : tentati.has(carta.nodoId) ? 2 : !s ? 3 : 4;
    gruppi[gruppo].push(carta);
  }
  const risultato = [];
  for (const gruppo of gruppi) risultato.push(...alternaArgomenti(gruppo, risultato.at(-1)));
  return risultato;
}
