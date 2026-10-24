// Statistiche pure: dovute oggi, padronanza per area, serie di giorni di studio.
// Una carta è "padroneggiata" dopo 2 ripetizioni riuscite di fila (intervallo SM-2 di 6 giorni).
import { addDaysIso, isIsoDay } from './giorni.js';
import { isScaduta } from './sm2.js';

export const RIPETIZIONI_PADRONANZA = 2;

/** 'nuova' mai vista, 'apprendimento' vista ma non stabile, 'padroneggiata' con >= 2 ripetizioni. */
export function statoCarta(stato) {
  if (!stato || stato.revisioni === 0) return 'nuova';
  return stato.ripetizioni >= RIPETIZIONI_PADRONANZA ? 'padroneggiata' : 'apprendimento';
}

const percentuale = (parte, totale) => (totale ? Math.round((parte / totale) * 100) : 0);

/**
 * Riepilogo di un insieme di carte: `dovute` = già viste con scadenza arrivata,
 * `nuove` = mai viste (in coda oggi ci sono dovute + nuove).
 */
export function riepilogoCarte(carte, stati, oggi) {
  const r = { totale: 0, nuove: 0, inApprendimento: 0, padroneggiate: 0, dovute: 0 };
  for (const carta of carte || []) {
    const stato = stati?.[carta.id];
    r.totale += 1;
    const tipo = statoCarta(stato);
    if (tipo === 'nuova') r.nuove += 1;
    else if (tipo === 'padroneggiata') r.padroneggiate += 1;
    else r.inApprendimento += 1;
    if (stato && stato.revisioni > 0 && isScaduta(stato, oggi)) r.dovute += 1;
  }
  return { ...r, percentualePadronanza: percentuale(r.padroneggiate, r.totale) };
}

/**
 * Padronanza per ciascuna area di `aree` ([{id, titolo}] del grafo).
 * Se `aree` è vuota, le aree si ricavano dalle carte.
 */
export function padronanzaPerArea(carte, stati, aree) {
  const elenco = Array.isArray(aree) && aree.length
    ? aree.map((a) => ({ area: a.id, titolo: a.titolo }))
    : [...new Set((carte || []).map((c) => c.area).filter((a) => a !== null))]
      .sort((a, b) => a - b)
      .map((a) => ({ area: a, titolo: `Area ${a}` }));
  return elenco.map(({ area, titolo }) => {
    const inArea = (carte || []).filter((c) => c.area === area);
    const padroneggiate = inArea.filter((c) => statoCarta(stati?.[c.id]) === 'padroneggiata').length;
    return { area, titolo, totale: inArea.length, padroneggiate, percentuale: percentuale(padroneggiate, inArea.length) };
  });
}

/**
 * Giorni di studio consecutivi fino a oggi. Se oggi non si è ancora studiato,
 * la serie di ieri resta valida (si rompe solo saltando un giorno intero).
 */
export function serieDiStudio(giorni, oggi) {
  if (!isIsoDay(oggi)) throw new TypeError(`Data ISO non valida: ${oggi}`);
  const fatti = new Set((giorni || []).filter(isIsoDay));
  let cursor = fatti.has(oggi) ? oggi : addDaysIso(oggi, -1);
  let serie = 0;
  while (fatti.has(cursor)) {
    serie += 1;
    cursor = addDaysIso(cursor, -1);
  }
  return serie;
}
