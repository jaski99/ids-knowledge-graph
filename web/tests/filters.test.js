import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyFilters, applyFilters } from '../js/core/filters.js';
import { nodi } from './fixture.js';

const ids = (f, done = new Set()) => applyFilters(nodi(), { ...emptyFilters(), ...f }, done).map((n) => n.id).sort();

test('nessun filtro = tutti', () => assert.deepEqual(ids({}), ['a', 'b', 'c', 'd']));
test('area', () => assert.deepEqual(ids({ aree: new Set([2]) }), ['b', 'd']));
test('tipo', () => assert.deepEqual(ids({ tipi: new Set(['abilita']) }), ['b']));
test('priorità', () => assert.deepEqual(ids({ priorita: new Set(['alta']) }), ['b']));
test('solo non completati', () => assert.deepEqual(ids({ soloNonCompletati: true }, new Set(['a', 'd'])), ['b', 'c']));
test('ricerca testo, senza accenti e multi-parola', () => {
  assert.deepEqual(ids({ q: 'perche COESIONE' }), ['d']);
  assert.deepEqual(ids({ q: 'fare b' }), ['b']);
});
test('filtri combinati (AND)', () => assert.deepEqual(ids({ aree: new Set([1]), q: 'c' }), ['c']));


test('filtri rapidi combinano padronanza, tentativi e priorità effettiva', () => {
  const nodes = nodi();
  const mastery = new Map([['a', { daFareOra: true, errore: false }], ['b', { daFareOra: true, errore: true }],
    ['c', { daFareOra: false, errore: false }], ['d', { daFareOra: false, errore: false, sbloccato: true }]]);
  const apply = (stato) => applyFilters(nodes, { ...emptyFilters(), stato }, new Set(), mastery, new Set(['d'])).map((n) => n.id).sort();
  assert.deepEqual(apply('ora'), ['a', 'b', 'd']);
  assert.deepEqual(apply('sbagliati'), ['b', 'd']);
  assert.deepEqual(apply('alta'), ['b']);
});
