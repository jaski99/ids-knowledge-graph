// Persistenza della prova. Lo storage è iniettato: niente localStorage globale.
import { leggiTimer, timerNuovo, timerInPausa } from './timer.js';

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
  const puntiOk = (Number.isFinite(p?.puntiTotali) && p.puntiTotali > 0)
    || (p?.puntiTotali === null && p?.calcolaVoto === false);
  if (!p || !Array.isArray(p.parti) || p.parti.length === 0 || !Number.isFinite(p.durataMs) || p.durataMs <= 0
    || !puntiOk || typeof p.coperta !== 'boolean') return false;
  if (p.modalita !== undefined && p.modalita !== 'allenamento' && p.modalita !== 'simulazione') return false;
  if (!p.parti.every((parte) => parte && typeof parte.id === 'string' && typeof parte.titolo === 'string'
    && Array.isArray(parte.quesiti) && Array.isArray(parte.mancanti)
    && parte.quesiti.every((q) => typeof q?.id === 'string' && Array.isArray(q.consegne) && q.consegne.length > 0
      && q.consegne.every((c) => typeof c?.nodoId === 'string' && typeof c.testo === 'string' && typeof c.soluzione === 'string')))
    || !p.parti.some((parte) => parte.quesiti.length > 0)) return false;
  const timer = data.timer;
  if (!timer || typeof timer.running !== 'boolean' || !Number.isFinite(timer.elapsedMs)
    || !Number.isFinite(timer.durataMs) || timer.durataMs !== p.durataMs) return false;
  if (timer.elapsedMs < 0 || timer.elapsedMs > timer.durataMs) return false;
  if (timer.running ? !Number.isFinite(timer.startedAt) : timer.startedAt !== null) return false;
  if (!data.risposte || typeof data.risposte !== 'object' || Array.isArray(data.risposte)) return false;
  if (!data.giudizi || typeof data.giudizi !== 'object' || Array.isArray(data.giudizi)) return false;
  return true;
}

export function sessioneInCorsoValida(data, now) {
  if (!sessioneValida(data) || data.fase !== 'svolgimento' || !Number.isFinite(now)) return false;
  if (data.timer.running && data.timer.startedAt > now) return false;
  return !leggiTimer(data.timer, now).scaduto;
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
