// Padronanza come indicatore provvisorio, non come voto né certificazione.
// Gli esiti arrivano esclusivamente tramite leggiEsiti del simulatore (contratto 4.2).
import { normalizzaStato } from '../../modules/ripasso/sm2.js';
import { isIsoDay } from '../../modules/ripasso/giorni.js';

const SUCCESSI = new Set(['difficile', 'bene', 'facile']);

export const MASTERY_LABELS = Object.freeze({
  non_iniziato: 'Non iniziato',
  studiato: 'Studiato',
  richiamo_corretto: 'Richiamo corretto',
  padronanza_provvisoria: 'Padronanza provvisoria',
});

/** Ultimo esito valutato di ogni nodo: null o senza massimo non dimostra correttezza. */
export function ultimiEsiti(esiti) {
  const result = new Map();
  for (const e of Array.isArray(esiti) ? esiti : []) {
    if (!e || typeof e.nodo_id !== 'string' || !e.nodo_id || typeof e.ts !== 'string') continue;
    const ts = Date.parse(e.ts);
    if (!Number.isFinite(ts) || typeof e.punti !== 'number' || !Number.isFinite(e.punti)
        || typeof e.punti_max !== 'number' || !Number.isFinite(e.punti_max)
        || e.punti_max <= 0 || e.punti < 0 || e.punti > e.punti_max) continue;
    const precedente = result.get(e.nodo_id);
    if (!precedente || ts >= precedente.timestamp) result.set(e.nodo_id, { timestamp: ts, corretto: e.punti === e.punti_max });
  }
  return result;
}

/** I prerequisiti hard richiedono almeno un richiamo corretto, non la sola spunta. */
export function prerequisitiMancanti(nodo, mastery) {
  return (nodo.prerequisiti || []).filter((p) => p.forza === 'hard'
    && !['richiamo_corretto', 'padronanza_provvisoria'].includes(mastery?.get(p.id)?.livello));
}

/**
 * Il completamento è dichiarato; una risposta riuscita è un richiamo corretto;
 * due ripetizioni SM-2 consecutive riuscite indicano padronanza solo provvisoria.
 * Errori SM-2 o l'ultimo esito parziale impediscono di proclamare padronanza.
 * L'SM-2 non conserva l'istante del voto: in caso di conflitto si è prudenti.
 */
export function calcolaPadronanza(nodi, completati, statiCarte, esiti, oggi) {
  const done = completati instanceof Set ? completati : new Set();
  const byNode = new Map((nodi || []).map((n) => [n.id, []]));
  for (const [id, raw] of Object.entries(statiCarte || {})) {
    const sep = id.lastIndexOf('#');
    const nodeId = sep < 0 ? '' : id.slice(0, sep);
    const stato = normalizzaStato(raw);
    if (byNode.has(nodeId) && stato && stato.revisioni > 0) byNode.get(nodeId).push(stato);
  }
  const last = ultimiEsiti(esiti);
  const output = new Map();
  for (const n of nodi || []) {
    const stati = byNode.get(n.id);
    const esito = last.get(n.id);
    const errore = stati.some((s) => s.ultimoVoto === 'ancora') || Boolean(esito && !esito.corretto);
    const riuscito = (s) => SUCCESSI.has(s.ultimoVoto) && s.ripetizioni > 0 && s.revisioni >= s.ripetizioni;
    const corretto = stati.some(riuscito) || Boolean(esito?.corretto);
    const ripetuto = stati.some((s) => riuscito(s) && s.ripetizioni >= 2);
    let livello = done.has(n.id) || stati.length || esito ? 'studiato' : 'non_iniziato';
    if (!errore && corretto) livello = ripetuto ? 'padronanza_provvisoria' : 'richiamo_corretto';
    const scaduto = isIsoDay(oggi) && stati.some((s) => s.scadenza && s.scadenza <= oggi);
    output.set(n.id, { livello, errore, scaduto });
  }
  // Secondo passaggio: il richiamo dei prerequisiti è calcolato prima della disponibilità.
  for (const n of nodi || []) {
    const m = output.get(n.id);
    m.sbloccato = prerequisitiMancanti(n, output).length === 0;
    m.daFareOra = m.sbloccato && (m.errore || m.scaduto || ['non_iniziato', 'studiato'].includes(m.livello));
  }
  return output;
}
