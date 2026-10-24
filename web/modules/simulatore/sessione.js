// Persistenza della prova. Lo storage è iniettato: niente localStorage globale.
import { timerNuovo, timerInPausa } from './timer.js';

export const CHIAVE_STORAGE = 'ids-kg:simulatore:v1';

export function creaSessione(prova, now) {
  return {
    versione: 1,
    prova,
    fase: 'svolgimento',
    risposte: {},
    giudizi: {},
    timer: timerNuovo(now, prova.durataMs),
  };
}

export function sessioneValida(data) {
  if (!data || data.versione !== 1) return false;
  if (data.fase !== 'svolgimento' && data.fase !== 'correzione') return false;
  const p = data.prova;
  if (!p || !Array.isArray(p.parti) || typeof p.durataMs !== 'number') return false;
  if (!data.timer || typeof data.timer.elapsedMs !== 'number' || typeof data.timer.durataMs !== 'number') return false;
  if (!data.risposte || typeof data.risposte !== 'object' || Array.isArray(data.risposte)) return false;
  if (!data.giudizi || typeof data.giudizi !== 'object' || Array.isArray(data.giudizi)) return false;
  return true;
}

export function leggiSessione(storage, chiave = CHIAVE_STORAGE) {
  try {
    const raw = storage.getItem(chiave);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return sessioneValida(data) ? data : null;
  } catch {
    return null;
  }
}

export function salvaSessione(storage, sessione, chiave = CHIAVE_STORAGE) {
  try {
    storage.setItem(chiave, JSON.stringify(sessione));
    return true;
  } catch {
    return false;
  }
}

export function cancellaSessione(storage, chiave = CHIAVE_STORAGE) {
  try { storage.removeItem(chiave); } catch { /* quota o privacy mode */ }
}

export function leggiRisposta(sessione, quesitoId, indice = 0) {
  const v = sessione.risposte?.[quesitoId];
  if (Array.isArray(v)) return v[indice] || '';
  if (typeof v === 'string' && indice === 0) return v;
  return '';
}

export function scriviRisposta(sessione, quesitoId, indice, testo, quanti) {
  const prev = sessione.risposte[quesitoId];
  let arr;
  if (Array.isArray(prev)) arr = prev.slice();
  else if (typeof prev === 'string') arr = [prev];
  else arr = [];
  while (arr.length < quanti) arr.push('');
  arr[indice] = testo;
  const value = quanti <= 1 ? (arr[0] || '') : arr;
  return { ...sessione, risposte: { ...sessione.risposte, [quesitoId]: value } };
}

export function scriviGiudizio(sessione, quesitoId, punti) {
  const giudizi = { ...sessione.giudizi };
  if (punti == null) delete giudizi[quesitoId];
  else giudizi[quesitoId] = punti;
  return { ...sessione, giudizi };
}

export function chiudiPerTempo(sessione) {
  return {
    ...sessione,
    fase: 'correzione',
    timer: { ...sessione.timer, running: false, startedAt: null, elapsedMs: sessione.timer.durataMs },
  };
}

export function consegna(sessione, now) {
  return { ...sessione, fase: 'correzione', timer: timerInPausa(sessione.timer, now) };
}
