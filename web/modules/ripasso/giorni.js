// Date a granularità "giorno" in formato ISO (YYYY-MM-DD). Modulo puro:
// nessuna lettura dell'orologio globale, i chiamanti passano le date.
const RE_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_GIORNO = 24 * 60 * 60 * 1000;

function parseIso(iso) {
  if (typeof iso !== 'string') return null;
  const m = RE_ISO.exec(iso);
  if (!m) return null;
  const [anno, mese, giorno] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  // Rifiuta date inesistenti (es. 2026-02-30) che Date.UTC normalizzerebbe.
  if (d.getUTCFullYear() !== anno || d.getUTCMonth() !== mese - 1 || d.getUTCDate() !== giorno) return null;
  return d;
}

const pad = (n) => String(n).padStart(2, '0');

export function isIsoDay(iso) {
  return parseIso(iso) !== null;
}

/** Giorno locale di un Date come YYYY-MM-DD (la serie di studio segue il fuso dello studente). */
export function toIsoDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError('toIsoDay richiede un Date valido');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDaysIso(iso, giorni) {
  const d = parseIso(iso);
  if (!d) throw new TypeError(`Data ISO non valida: ${iso}`);
  if (!Number.isInteger(giorni)) throw new TypeError('I giorni devono essere un intero');
  const r = new Date(d.getTime() + giorni * MS_GIORNO);
  return `${r.getUTCFullYear()}-${pad(r.getUTCMonth() + 1)}-${pad(r.getUTCDate())}`;
}

/** Giorni da `daIso` a `aIso` (negativo se `aIso` è prima). */
export function diffDaysIso(daIso, aIso) {
  const da = parseIso(daIso);
  const a = parseIso(aIso);
  if (!da || !a) throw new TypeError('diffDaysIso richiede date ISO valide');
  return Math.round((a.getTime() - da.getTime()) / MS_GIORNO);
}

/** YYYY-MM-DD -> GG/MM/AAAA per la UI; l'input non valido resta invariato. */
export function formatGiornoIt(iso) {
  const m = typeof iso === 'string' && RE_ISO.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? '');
}
