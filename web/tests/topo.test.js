import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topoOrder, edges, successors } from '../js/core/topo.js';
import { nodi } from './fixture.js';

test('ordine deterministico (priorità alta, area, id) e prerequisiti prima', () => {
  assert.deepEqual(topoOrder(nodi()), ['b', 'a', 'c', 'd']);
});
test('archi hard e soft derivati dai prerequisiti', () => {
  assert.deepEqual(edges(nodi()).map((e) => `${e.source}>${e.target}:${e.forza}`), ['a>c:hard', 'b>d:hard', 'c>d:soft']);
});
test('ciclo rilevato', () => {
  const ns = nodi(); ns.find((x) => x.id === 'a').prerequisiti = [{ id: 'd', forza: 'soft' }];
  assert.throws(() => topoOrder(ns), /ciclo/);
});
test('prerequisito inesistente', () => {
  const ns = nodi(); ns[0].prerequisiti.push({ id: 'zz', forza: 'hard' });
  assert.throws(() => topoOrder(ns), /inesistente/);
});
test('successori', () => assert.deepEqual(successors(nodi(), 'c'), ['d']));
