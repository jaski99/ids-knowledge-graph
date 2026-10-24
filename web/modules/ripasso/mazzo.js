// Costruzione del mazzo, filtri e coda di studio. Solo dati del grafo:
// - domande di autoverifica (lezione.domande_autoverifica): domanda -> risposta;
// - punti di checklist_ripasso: il punto è lo spunto, il campo `sapere` del nodo
//   è il riferimento mostrato come risposta (mai testo inventato).
// Le carte con domanda o risposta vuote vengono saltate.
import { diffDaysIso } from './giorni.js';
import { isScaduta } from './sm2.js';

export const PRIORITA = ['alta', 'media', 'bassa'];

const testo = (v) => (typeof v === 'string' ? v.trim() : '');
const rangoPriorita = (p) => {
  const i = PRIORITA.indexOf(p);
  return i === -1 ? PRIORITA.length : i;
};
const rangoTipo = (t) => (t === 'domanda' ? 0 : 1);

function cartaBase(nodo, id, titolo) {
  return {
    id,
    nodoId: nodo.id,
    nodoTitolo: titolo,
    area: Number.isInteger(nodo.area) ? nodo.area : null,
    priorita: PRIORITA.includes(nodo.priorita?.livello) ? nodo.priorita.livello : null,
  };
}

export function costruisciMazzo(nodi) {
  if (!Array.isArray(nodi)) return [];
  const carte = [];
  for (const nodo of nodi) {
    const id = testo(nodo?.id);
    if (!id) continue;
    const titolo = testo(nodo.title) || id;
    const domande = Array.isArray(nodo.lezione?.domande_autoverifica) ? nodo.lezione.domande_autoverifica : [];
    domande.forEach((d, i) => {
      const domanda = testo(d?.domanda);
      const risposta = testo(d?.risposta);
      if (!domanda || !risposta) return;
      carte.push({ ...cartaBase(nodo, `${id}#domanda-${i}`, titolo), tipo: 'domanda', indice: i, domanda, risposta });
    });
    const riferimento = testo(nodo.sapere);
    const checklist = Array.isArray(nodo.checklist_ripasso) ? nodo.checklist_ripasso : [];
    if (!riferimento) continue;
    checklist.forEach((punto, i) => {
      const domanda = testo(punto);
      if (!domanda) return;
      carte.push({ ...cartaBase(nodo, `${id}#checklist-${i}`, titolo), tipo: 'checklist', indice: i, domanda, risposta: riferimento });
    });
  }
  return carte;
}

/** Filtri: `area` (intero) e `priorita` ('alta'|'media'|'bassa'); null = nessun filtro. */
export function filtraCarte(carte, filtri = {}) {
  const area = filtri?.area ?? null;
  const priorita = filtri?.priorita ?? null;
  return (carte || []).filter((c) => (area === null || c.area === area) && (priorita === null || c.priorita === priorita));
}

function confrontaBase(a, b) {
  return rangoPriorita(a.priorita) - rangoPriorita(b.priorita)
    || (a.area ?? Infinity) - (b.area ?? Infinity)
    || a.nodoId.localeCompare(b.nodoId)
    || rangoTipo(a.tipo) - rangoTipo(b.tipo)
    || a.indice - b.indice;
}

/**
 * Coda deterministica di oggi: prima le carte scadute (più in ritardo prima),
 * poi le nuove (priorità alta prima, poi area e nodo). Le non scadute restano fuori.
 * `stati` è la mappa id carta -> stato SM-2 (oggetto semplice).
 */
export function codaStudio(carte, stati, oggi) {
  const scadute = [];
  const nuove = [];
  for (const carta of carte || []) {
    const stato = stati?.[carta.id];
    if (!stato) nuove.push(carta);
    else if (isScaduta(stato, oggi)) scadute.push({ carta, ritardo: stato.scadenza ? diffDaysIso(stato.scadenza, oggi) : 0 });
  }
  scadute.sort((a, b) => b.ritardo - a.ritardo || confrontaBase(a.carta, b.carta));
  nuove.sort(confrontaBase);
  return [...scadute.map((s) => s.carta), ...nuove];
}

/** Prima scadenza futura tra le carte già viste (per dire quando ci sarà altro da ripassare). */
export function prossimaScadenza(carte, stati, oggi) {
  let prossima = null;
  for (const carta of carte || []) {
    const scadenza = stati?.[carta.id]?.scadenza;
    if (scadenza && scadenza > oggi && (prossima === null || scadenza < prossima)) prossima = scadenza;
  }
  return prossima;
}
