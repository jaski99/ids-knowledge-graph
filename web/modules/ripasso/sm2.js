// SM-2 semplice e puro (Wozniak): nessuna dipendenza da DOM, storage o orologio.
//
// I quattro pulsanti della vista corrispondono alla qualità SM-2 (0-5):
//   Ancora = 1 (risposta sbagliata), Difficile = 3 (giusta con grande sforzo),
//   Bene = 4 (giusta con esitazione), Facile = 5 (giusta subito).
// Regole: EF iniziale 2.5; EF' = EF + (0.1 - (5-q)(0.08 + (5-q)0.02)), fermo in [1.3, 2.5].
// Se q < 3 si ricomincia: ripetizioni a 0, intervallo 0 (la carta scade oggi, stessa sessione).
// Altrimenti: 1ª ripetizione -> 1 giorno, 2ª -> 6 giorni, poi intervallo precedente * EF'.
import { addDaysIso, isIsoDay } from './giorni.js';

export const VOTI = ['ancora', 'difficile', 'bene', 'facile'];
export const QUALITA = Object.freeze({ ancora: 1, difficile: 3, bene: 4, facile: 5 });
export const EF_INIZIALE = 2.5;
export const EF_MIN = 1.3;
export const EF_MAX = 2.5;

export function nuovoStato() {
  return {
    ef: EF_INIZIALE,
    ripetizioni: 0,
    intervallo: 0,
    scadenza: null,
    revisioni: 0,
    errori: 0,
    ultimoVoto: null,
  };
}

const clampEf = (ef) => Math.round(Math.min(EF_MAX, Math.max(EF_MIN, ef)) * 100) / 100;

function aggiornaEf(ef, q) {
  return clampEf(ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
}

const interoNonNegativo = (v) => (Number.isInteger(v) && v >= 0 ? v : null);

/** Stato salvato -> stato affidabile, oppure null se i campi essenziali non tornano. */
export function normalizzaStato(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  if (typeof v.ef !== 'number' || !Number.isFinite(v.ef)) return null;
  const ripetizioni = interoNonNegativo(v.ripetizioni);
  const intervallo = interoNonNegativo(v.intervallo);
  const revisioni = interoNonNegativo(v.revisioni);
  const errori = interoNonNegativo(v.errori);
  if (ripetizioni === null || intervallo === null || revisioni === null || errori === null) return null;
  if (v.scadenza !== null && !isIsoDay(v.scadenza)) return null;
  return {
    ef: clampEf(v.ef),
    ripetizioni,
    intervallo,
    scadenza: v.scadenza,
    revisioni,
    errori,
    ultimoVoto: VOTI.includes(v.ultimoVoto) ? v.ultimoVoto : null,
  };
}

// Nucleo condiviso da applicaVoto e intervalloPrevisto: EF, ripetizioni e intervallo successivi.
function calcolaSuccessivo(stato, voto) {
  const q = QUALITA[voto];
  if (q === undefined) throw new TypeError(`Voto non valido: ${voto}`);
  const base = stato ? normalizzaStato(stato) : nuovoStato();
  if (!base) throw new TypeError('Stato della carta non valido');
  const ef = aggiornaEf(base.ef, q);
  if (q < 3) return { base, ef, ripetizioni: 0, intervallo: 0 };
  const ripetizioni = base.ripetizioni + 1;
  const intervallo = ripetizioni === 1 ? 1
    : ripetizioni === 2 ? 6
      : Math.max(1, Math.round(base.intervallo * ef));
  return { base, ef, ripetizioni, intervallo };
}

/** Intervallo (in giorni) che un voto produrrebbe, per l'etichetta sotto ogni pulsante. */
export function intervalloPrevisto(stato, voto) {
  return calcolaSuccessivo(stato, voto).intervallo;
}

/** Applica un voto e restituisce un NUOVO stato (l'input non viene mai modificato). */
export function applicaVoto(stato, voto, oggi) {
  if (!isIsoDay(oggi)) throw new TypeError(`Data ISO non valida: ${oggi}`);
  const { base, ef, ripetizioni, intervallo } = calcolaSuccessivo(stato, voto);
  return {
    ef,
    ripetizioni,
    intervallo,
    scadenza: addDaysIso(oggi, intervallo),
    revisioni: base.revisioni + 1,
    errori: base.errori + (voto === 'ancora' ? 1 : 0),
    ultimoVoto: voto,
  };
}

/** Vero se la carta non è mai stata vista o la sua scadenza è arrivata (oggi compresa). */
export function isScaduta(stato, oggi) {
  if (!stato || !stato.scadenza) return true;
  return stato.scadenza <= oggi;
}

export function formatIntervallo(giorni) {
  if (giorni === 0) return 'oggi';
  if (giorni === 1) return '1 giorno';
  return `${giorni} giorni`;
}
