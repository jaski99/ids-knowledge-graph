// Persistenza del ripasso. Lo storage è iniettato: niente localStorage globale.
// Un'unica chiave `ids.ripasso.v1`: stati SM-2 delle carte, giorni di studio, filtri scelti.
// Dati corrotti o di versioni diverse vengono ignorati (mai eccezioni verso la vista).
import { isIsoDay } from './giorni.js';
import { PRIORITA } from './mazzo.js';
import { normalizzaStato } from './sm2.js';

export const CHIAVE_STORAGE = 'ids.ripasso.v1';
const VERSIONE = 1;

export function statoVuoto() {
  return { versione: VERSIONE, carte: {}, giorni: [], filtri: { area: null, priorita: null } };
}

/** Qualsiasi valore -> dati del ripasso affidabili (le voci non valide vengono scartate). */
export function normalizzaDati(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v) || v.versione !== VERSIONE) return statoVuoto();
  const carte = {};
  if (v.carte && typeof v.carte === 'object' && !Array.isArray(v.carte)) {
    for (const [id, stato] of Object.entries(v.carte)) {
      const pulito = id.trim() ? normalizzaStato(stato) : null;
      if (pulito) carte[id] = pulito;
    }
  }
  const giorni = Array.isArray(v.giorni) ? [...new Set(v.giorni.filter(isIsoDay))].sort() : [];
  const filtri = {
    area: Number.isInteger(v.filtri?.area) ? v.filtri.area : null,
    priorita: PRIORITA.includes(v.filtri?.priorita) ? v.filtri.priorita : null,
  };
  return { versione: VERSIONE, carte, giorni, filtri };
}

export function leggiStato(storage, chiave = CHIAVE_STORAGE) {
  try {
    const raw = storage?.getItem(chiave);
    return raw ? normalizzaDati(JSON.parse(raw)) : statoVuoto();
  } catch {
    return statoVuoto();
  }
}

/** Ritorna false se il browser non salva (quota, privacy mode): la vista avvisa lo studente. */
export function salvaStato(storage, dati, chiave = CHIAVE_STORAGE) {
  try {
    storage.setItem(chiave, JSON.stringify(normalizzaDati(dati)));
    return true;
  } catch {
    return false;
  }
}

export function cancellaStato(storage, chiave = CHIAVE_STORAGE) {
  try {
    storage.removeItem(chiave);
    return true;
  } catch {
    return false;
  }
}

/** Nuovi dati con la revisione registrata e il giorno di studio segnato (input immutato). */
export function conRevisione(dati, cartaId, statoCarta, oggi) {
  const base = normalizzaDati(dati);
  const giorni = base.giorni.includes(oggi) ? base.giorni : [...base.giorni, oggi].sort();
  return { ...base, carte: { ...base.carte, [cartaId]: statoCarta }, giorni };
}
