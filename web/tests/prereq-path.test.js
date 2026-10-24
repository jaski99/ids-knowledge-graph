import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prerequisitePath } from '../js/core/prereq-path.js';
import { nodi } from './fixture.js';

const ids = (set) => [...set].sort();

test('il percorso di d include gli antenati hard e soft, non i successori', () => {
  const path = prerequisitePath(nodi(), 'd');
  assert.deepEqual(ids(path.nodeIds), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids(path.edgeIds), ['a->c', 'b->d', 'c->d']);
});

test('un nodo senza prerequisiti evidenzia solo se stesso', () => {
  const path = prerequisitePath(nodi(), 'b');
  assert.deepEqual(ids(path.nodeIds), ['b']);
  assert.equal(path.edgeIds.size, 0);
});

test('id sconosciuto: insiemi vuoti', () => {
  const path = prerequisitePath(nodi(), 'manca');
  assert.equal(path.nodeIds.size, 0);
  assert.equal(path.edgeIds.size, 0);
  assert.equal(prerequisitePath(null, 'a').nodeIds.size, 0);
});
