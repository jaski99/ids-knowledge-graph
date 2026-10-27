// Backup locale, esplicito e versionato. Non esporta dati di altre app sullo stesso dominio.
import { STORAGE_KEYS } from '../config.js';
import { THEME_STORAGE_KEY } from './theme.js';
import { ATTEMPTS_KEY } from './attempts.js';
import { EXAM_DATE_KEY } from './review-plan.js';
import { ESITI_KEY } from './outcomes.js';
import { CHIAVE_STORAGE as RIPASSO_KEY } from '../../modules/ripasso/store.js';
import { isIsoDay } from '../../modules/ripasso/giorni.js';
import { costruisciMazzo } from '../../modules/ripasso/mazzo.js';

export const BACKUP_KEYS = Object.freeze([
  STORAGE_KEYS.done, STORAGE_KEYS.review, STORAGE_KEYS.last, THEME_STORAGE_KEY,
  RIPASSO_KEY, 'ids-kg:simulatore:v1', ESITI_KEY, ATTEMPTS_KEY, EXAM_DATE_KEY,
]);
const SET_KEYS = new Set([STORAGE_KEYS.done, STORAGE_KEYS.review]);
const ARRAY_KEYS = new Set([ESITI_KEY, ATTEMPTS_KEY]);
const OBJECT_KEYS = new Set([RIPASSO_KEY, 'ids-kg:simulatore:v1']);
const MAX_FIELD = 4 * 1024 * 1024;

function valido(key, value) {
  if (typeof value !== 'string' || value.length > MAX_FIELD) return false;
  if (key === THEME_STORAGE_KEY) return value === 'light' || value === 'dark';
  if (key === EXAM_DATE_KEY) return isIsoDay(value);
  if (key === STORAGE_KEYS.last) return value.length <= 128;
  try {
    const parsed = JSON.parse(value);
    if (SET_KEYS.has(key)) return Array.isArray(parsed) && parsed.every((x) => typeof x === 'string');
    if (ARRAY_KEYS.has(key)) return Array.isArray(parsed);
    if (OBJECT_KEYS.has(key)) return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch { return false; }
  return false;
}

export function creaBackup(storage, now = new Date()) {
  const dati = {};
  for (const key of BACKUP_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) dati[key] = value;
  }
  return { formato: 'ids-kg-backup', versione: 1, creato_il: now.toISOString(), dati };
}

/** Validazione completa prima di scrivere qualsiasi chiave. L'import unisce le sole chiavi presenti. */
export function validaBackup(value) {
  if (!value || value.formato !== 'ids-kg-backup' || value.versione !== 1 || !value.dati
      || typeof value.dati !== 'object' || Array.isArray(value.dati)) throw new Error('Formato o versione del backup non riconosciuti.');
  for (const [key, raw] of Object.entries(value.dati)) {
    if (!BACKUP_KEYS.includes(key) || !valido(key, raw)) throw new Error(`Dato non valido nel backup: ${key}.`);
  }
  return value.dati;
}

export function importaBackup(storage, text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error('Il file non è un JSON valido.'); }
  const dati = validaBackup(parsed);
  const before = new Map(Object.keys(dati).map((k) => [k, storage.getItem(k)]));
  try {
    for (const [key, raw] of Object.entries(dati)) storage.setItem(key, raw);
  } catch (error) {
    // Il rollback è il miglior tentativo possibile anche in caso di quota o storage disabilitato.
    for (const [key, old] of before) { try { old === null ? storage.removeItem(key) : storage.setItem(key, old); } catch { /* segnalato sotto */ } }
    throw new Error('Il browser non ha salvato il backup; controlla lo spazio disponibile.', { cause: error });
  }
  return Object.keys(dati).length;
}

const campoTsv = (text) => {
  const s = String(text ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  // Protegge anche l'apertura accidentale in un foglio elettronico.
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

/** Due colonne fronte/retro, UTF-8, testo dalle sole domande/checklist/esercizi del grafo. */
export function ankiTsv(nodi) {
  const flashcard = costruisciMazzo(nodi).map((c) => [c.domanda, c.risposta]);
  const esercizi = (nodi || []).flatMap((n) => (n.esercizi || [])
    .filter((e) => typeof e.testo === 'string' && e.testo.trim() && typeof e.soluzione === 'string' && e.soluzione.trim())
    .map((e) => [e.testo, e.soluzione]));
  return [...flashcard, ...esercizi].map(([a, b]) => `${campoTsv(a)}\t${campoTsv(b)}`).join('\n') + (flashcard.length || esercizi.length ? '\n' : '');
}
