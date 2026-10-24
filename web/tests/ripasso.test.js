import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addDaysIso, diffDaysIso, formatGiornoIt, isIsoDay, toIsoDay } from '../modules/ripasso/giorni.js';
import {
  applicaVoto, formatIntervallo, intervalloPrevisto, isScaduta, normalizzaStato, nuovoStato, EF_MIN, QUALITA,
} from '../modules/ripasso/sm2.js';
import { costruisciMazzo, codaStudio, filtraCarte, prossimaScadenza } from '../modules/ripasso/mazzo.js';
import { padronanzaPerArea, riepilogoCarte, serieDiStudio, statoCarta } from '../modules/ripasso/statistiche.js';
import { cancellaStato, conRevisione, leggiStato, salvaStato, statoVuoto, CHIAVE_STORAGE } from '../modules/ripasso/store.js';

const graph = JSON.parse(readFileSync(new URL('../../graph/graph.json', import.meta.url), 'utf8'));
const OGGI = '2026-01-10';

const memoryStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    keys: () => [...m.keys()],
  };
};

const carta = (id, area = 1, priorita = 'media') => ({
  id, nodoId: id.split('#')[0], nodoTitolo: id, area, priorita, tipo: 'domanda', indice: 0, domanda: 'D?', risposta: 'R.',
});
const stato = (extra = {}) => ({ ...nuovoStato(), revisioni: 1, scadenza: OGGI, ...extra });

// ---------- giorni ----------

test('giorni: somme e differenze oltre mese, anno bisestile e validazione', () => {
  assert.equal(addDaysIso('2026-01-31', 1), '2026-02-01');
  assert.equal(addDaysIso('2024-02-28', 1), '2024-02-29');
  assert.equal(addDaysIso('2026-03-01', -1), '2026-02-28');
  assert.equal(diffDaysIso('2024-02-28', '2024-03-01'), 2);
  assert.equal(diffDaysIso('2026-01-10', '2026-01-01'), -9);
  assert.equal(isIsoDay('2026-02-29'), false);
  assert.equal(isIsoDay('2024-02-29'), true);
  assert.equal(isIsoDay('10/01/2026'), false);
  assert.throws(() => addDaysIso('2026-02-30', 1), TypeError);
  assert.throws(() => addDaysIso(OGGI, 1.5), TypeError);
  assert.equal(toIsoDay(new Date(2026, 9, 5)), '2026-10-05');
  assert.equal(formatGiornoIt('2026-01-05'), '05/01/2026');
});

// ---------- SM-2 ----------

test('sm2: le quattro etichette corrispondono alla scala di qualità SM-2', () => {
  assert.deepEqual({ ...QUALITA }, { ancora: 1, difficile: 3, bene: 4, facile: 5 });
});

test('sm2: progressione Bene 1 giorno, 6 giorni, poi intervallo per EF', () => {
  let s = applicaVoto(null, 'bene', OGGI);
  assert.deepEqual([s.ef, s.ripetizioni, s.intervallo, s.scadenza, s.revisioni], [2.5, 1, 1, '2026-01-11', 1]);
  s = applicaVoto(s, 'bene', '2026-01-11');
  assert.deepEqual([s.ripetizioni, s.intervallo, s.scadenza], [2, 6, '2026-01-17']);
  s = applicaVoto(s, 'bene', '2026-01-17');
  assert.equal(s.intervallo, 15); // round(6 * 2.5)
  assert.equal(s.scadenza, '2026-02-01');
});

test('sm2: Difficile abbassa EF, Facile lo rialza senza superare 2.5', () => {
  let s = applicaVoto(null, 'difficile', OGGI);
  assert.equal(s.ef, 2.36);
  s = applicaVoto(s, 'facile', OGGI);
  assert.equal(s.ef, 2.46);
  s = applicaVoto(s, 'facile', OGGI);
  assert.equal(s.ef, 2.5);
  assert.equal(s.intervallo, 15); // round(6 * 2.5) alla terza ripetizione
});

test('sm2: Ancora azzera le ripetizioni, scade oggi e conta l\'errore; EF non scende sotto 1.3', () => {
  let s = applicaVoto(applicaVoto(null, 'bene', OGGI), 'ancora', OGGI);
  assert.deepEqual([s.ripetizioni, s.intervallo, s.scadenza, s.errori, s.ultimoVoto], [0, 0, OGGI, 1, 'ancora']);
  for (let i = 0; i < 6; i += 1) s = applicaVoto(s, 'ancora', OGGI);
  assert.equal(s.ef, EF_MIN);
  assert.equal(s.errori, 7);
});

test('sm2: anteprima degli intervalli coerente con il voto applicato, immutabilità, input non validi', () => {
  const iniziale = Object.freeze({ ...nuovoStato(), ef: 1.3, ripetizioni: 2, intervallo: 6, revisioni: 2 });
  assert.equal(intervalloPrevisto(null, 'ancora'), 0);
  assert.equal(intervalloPrevisto(null, 'bene'), 1);
  assert.equal(intervalloPrevisto(iniziale, 'bene'), 8); // round(6 * 1.3)
  const dopo = applicaVoto(iniziale, 'bene', OGGI);
  assert.equal(dopo.intervallo, intervalloPrevisto(iniziale, 'bene'));
  assert.equal(iniziale.revisioni, 2);
  assert.throws(() => applicaVoto(null, 'cosi-cosi', OGGI), TypeError);
  assert.throws(() => applicaVoto(null, 'bene', 'oggi'), TypeError);
  assert.equal(isScaduta(null, OGGI), true);
  assert.equal(isScaduta(stato({ scadenza: '2026-01-11' }), OGGI), false);
  assert.equal(formatIntervallo(0), 'oggi');
  assert.equal(normalizzaStato({ ef: 'x' }), null);
});

// ---------- mazzo ----------

const nodo = (id, extra = {}) => ({
  id, title: `Titolo ${id}`, area: 1, sapere: `Sapere ${id}`, priorita: { livello: 'media' },
  checklist_ripasso: [], lezione: { domande_autoverifica: [] }, ...extra,
});

test('mazzo: carte da autoverifica e checklist, vuoti e nodi senza id saltati', () => {
  const mazzo = costruisciMazzo([
    nodo('a', {
      lezione: { domande_autoverifica: [
        { domanda: ' D1? ', risposta: ' R1 ' },
        { domanda: 'D2?', risposta: '  ' },
      ] },
      checklist_ripasso: ['Punto uno', ' '],
    }),
    nodo('b', { lezione: undefined, checklist_ripasso: ['Punto b'], area: 2, priorita: { livello: 'alta' } }),
    nodo('c', { sapere: '', checklist_ripasso: ['Senza riferimento'] }),
    { title: 'senza id' },
    null,
  ]);
  assert.deepEqual(mazzo.map((c) => c.id), ['a#domanda-0', 'a#checklist-0', 'b#checklist-0']);
  assert.deepEqual([mazzo[0].domanda, mazzo[0].risposta, mazzo[0].tipo], ['D1?', 'R1', 'domanda']);
  assert.equal(mazzo[1].risposta, 'Sapere a'); // la checklist mostra il `sapere`, mai testo inventato
  assert.deepEqual([mazzo[2].area, mazzo[2].priorita, mazzo[2].nodoTitolo], [2, 'alta', 'Titolo b']);
  assert.deepEqual(costruisciMazzo(undefined), []);
});

test('mazzo: filtri per area e priorità, anche combinati', () => {
  const carte = [carta('a#d', 1, 'alta'), carta('b#d', 2, 'alta'), carta('c#d', 2, 'bassa')];
  assert.equal(filtraCarte(carte).length, 3);
  assert.deepEqual(filtraCarte(carte, { area: 2 }).map((c) => c.id), ['b#d', 'c#d']);
  assert.deepEqual(filtraCarte(carte, { area: 2, priorita: 'alta' }).map((c) => c.id), ['b#d']);
  assert.equal(filtraCarte(carte, { priorita: 'media' }).length, 0);
});

test('mazzo: coda con scadute più in ritardo prima, poi nuove per priorità; prossima scadenza', () => {
  const carte = [
    carta('nuova-bassa#d', 1, 'bassa'),
    carta('scade-domani#d'),
    carta('ritardo-2#d'),
    carta('nuova-alta#d', 5, 'alta'),
    carta('ritardo-9#d'),
  ];
  const stati = {
    'ritardo-2#d': stato({ scadenza: '2026-01-08' }),
    'ritardo-9#d': stato({ scadenza: '2026-01-01' }),
    'scade-domani#d': stato({ scadenza: '2026-01-11' }),
  };
  assert.deepEqual(codaStudio(carte, stati, OGGI).map((c) => c.id),
    ['ritardo-9#d', 'ritardo-2#d', 'nuova-alta#d', 'nuova-bassa#d']);
  assert.equal(prossimaScadenza(carte, stati, OGGI), '2026-01-11');
  assert.equal(prossimaScadenza(carte, {}, OGGI), null);
});

test('mazzo: sul grafo reale ogni carta viene dai campi dichiarati e gli id sono unici', () => {
  const mazzo = costruisciMazzo(graph.nodi);
  const atteseDomande = graph.nodi.flatMap((n) => (n.lezione?.domande_autoverifica || [])
    .filter((d) => d.domanda?.trim() && d.risposta?.trim())).length;
  const atteseChecklist = graph.nodi.flatMap((n) => (n.checklist_ripasso || [])
    .filter((p) => typeof p === 'string' && p.trim() && n.sapere?.trim())).length;
  assert.equal(mazzo.length, atteseDomande + atteseChecklist);
  assert.ok(mazzo.length > 0);
  assert.equal(new Set(mazzo.map((c) => c.id)).size, mazzo.length);
  const byId = new Map(graph.nodi.map((n) => [n.id, n]));
  for (const c of mazzo) {
    const n = byId.get(c.nodoId);
    assert.ok(n && c.domanda && c.risposta && c.area === n.area && c.priorita === n.priorita.livello, c.id);
    if (c.tipo === 'domanda') assert.equal(c.risposta, n.lezione.domande_autoverifica[c.indice].risposta.trim(), c.id);
    else assert.equal(c.risposta, n.sapere.trim(), c.id);
  }
  assert.ok(codaStudio(mazzo, {}, OGGI).every((c, i, arr) => i === 0 || arr[0].priorita === 'alta'));
});

// ---------- statistiche ----------

test('statistiche: riepilogo con dovute, nuove, apprendimento, padroneggiate e percentuale', () => {
  const carte = [carta('nuova#d'), carta('app-dovuta#d'), carta('app-futura#d'), carta('pad-dovuta#d'), carta('pad-futura#d')];
  const stati = {
    'app-dovuta#d': stato({ ripetizioni: 1, scadenza: '2026-01-09' }),
    'app-futura#d': stato({ ripetizioni: 1, scadenza: '2026-02-01' }),
    'pad-dovuta#d': stato({ ripetizioni: 2, scadenza: OGGI }),
    'pad-futura#d': stato({ ripetizioni: 3, scadenza: '2026-02-01' }),
  };
  assert.deepEqual(riepilogoCarte(carte, stati, OGGI),
    { totale: 5, nuove: 1, inApprendimento: 2, padroneggiate: 2, dovute: 2, percentualePadronanza: 40 });
  assert.equal(statoCarta(null), 'nuova');
});

test('statistiche: padronanza per area, aree senza carte a 0%', () => {
  const carte = [carta('a#d', 1), carta('b#d', 1), carta('c#d', 2)];
  const stati = { 'a#d': stato({ ripetizioni: 2 }), 'c#d': stato({ ripetizioni: 1 }) };
  assert.deepEqual(padronanzaPerArea(carte, stati, graph.aree).slice(0, 3).map((r) => [r.area, r.totale, r.percentuale]),
    [[1, 2, 50], [2, 1, 0], [3, 0, 0]]);
  assert.equal(padronanzaPerArea(carte, stati, [])[0].titolo, 'Area 1');
});

test('statistiche: serie di giorni, ieri tiene viva la serie, un buco la rompe', () => {
  assert.equal(serieDiStudio([], '2026-03-10'), 0);
  assert.equal(serieDiStudio(['2026-03-08', '2026-03-09', '2026-03-10'], '2026-03-10'), 3);
  assert.equal(serieDiStudio(['2026-03-08', '2026-03-09'], '2026-03-10'), 2);
  assert.equal(serieDiStudio(['2026-03-08'], '2026-03-10'), 0);
  assert.equal(serieDiStudio(['2026-03-10', '2026-03-10', 'boh', '2026-03-09'], '2026-03-10'), 2);
  assert.equal(serieDiStudio(['2024-02-28', '2024-02-29', '2024-03-01'], '2024-03-01'), 3);
});

// ---------- store ----------

test('store: chiave con prefisso ids.ripasso, giro salva/leggi e cancellazione', () => {
  assert.ok(CHIAVE_STORAGE.startsWith('ids.ripasso'));
  const storage = memoryStorage();
  let dati = conRevisione(statoVuoto(), 'a#domanda-0', applicaVoto(null, 'bene', OGGI), OGGI);
  dati = { ...dati, filtri: { area: 2, priorita: 'alta' } };
  assert.equal(salvaStato(storage, dati), true);
  assert.deepEqual(storage.keys(), [CHIAVE_STORAGE]);
  const letti = leggiStato(storage);
  assert.equal(letti.carte['a#domanda-0'].ripetizioni, 1);
  assert.deepEqual(letti.giorni, [OGGI]);
  assert.deepEqual(letti.filtri, { area: 2, priorita: 'alta' });
  assert.equal(cancellaStato(storage), true);
  assert.deepEqual(leggiStato(storage), statoVuoto());
});

test('store: dati corrotti o di altra versione ignorati, salvataggio fallito segnalato', () => {
  const storage = memoryStorage();
  storage.setItem(CHIAVE_STORAGE, '{non json');
  assert.deepEqual(leggiStato(storage), statoVuoto());
  storage.setItem(CHIAVE_STORAGE, JSON.stringify({
    versione: 99, carte: { 'a#domanda-0': applicaVoto(null, 'bene', OGGI) },
  }));
  assert.deepEqual(leggiStato(storage), statoVuoto());
  storage.setItem(CHIAVE_STORAGE, JSON.stringify({
    versione: 1,
    carte: { buona: applicaVoto(null, 'bene', OGGI), rotta: { ef: 'x' } },
    giorni: [OGGI, OGGI, 'no'],
    filtri: { area: '2', priorita: 'altissima' },
  }));
  const letti = leggiStato(storage);
  assert.deepEqual(Object.keys(letti.carte), ['buona']);
  assert.deepEqual(letti.giorni, [OGGI]);
  assert.deepEqual(letti.filtri, { area: null, priorita: null });
  const pieno = { getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
  assert.equal(salvaStato(pieno, statoVuoto()), false);
  const prima = statoVuoto();
  conRevisione(prima, 'x#domanda-0', applicaVoto(null, 'facile', OGGI), OGGI);
  assert.deepEqual(prima, statoVuoto());
});
