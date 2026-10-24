import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateGraph } from '../js/core/validate.js';
import { prepare, loadGraph } from '../js/data.js';
import { createSetStore, memoryStorage } from '../js/core/store.js';
import { createState } from '../js/core/state.js';
import { graph } from './fixture.js';
import { readFileSync } from 'node:fs';

test('fixture valida, prepare calcola ordine e indice', () => {
  assert.deepEqual(validateGraph(graph()), []);
  const g = prepare(graph());
  assert.equal(g.byId.get('d').area, 2); assert.equal(g.order[0], 'b');
});
test('errori: versione, duplicati, area, prerequisito', () => {
  const g = graph(); g.versione = 1; g.nodi.push({ ...g.nodi[0] }); g.nodi[1].area = 9; g.nodi[2].prerequisiti = [{ id: 'x', forza: 'hard' }];
  const e = validateGraph(g).join('\n');
  for (const re of [/versione/, /duplicato/, /area 9/, /inesistente x/]) assert.match(e, re);
});
test('graph.json reale del repo è valido', () => {
  const g = JSON.parse(readFileSync(new URL('../../graph/graph.json', import.meta.url)));
  assert.deepEqual(validateGraph(g), []);
});
test('loadGraph prova gli URL in ordine', async () => {
  const fake = async (u) => (u === 'ok.json' ? { ok: true, json: async () => graph() } : { ok: false, status: 404 });
  const g = await loadGraph(['no.json', 'ok.json'], fake);
  assert.equal(g.nodi.length, 4);
  await assert.rejects(loadGraph(['no.json'], fake), /404/);
});
test('store persistente su storage iniettato', () => {
  const st = memoryStorage();
  const s = createSetStore(st, 'k'); s.toggle('a'); s.toggle('b', true); s.toggle('a');
  assert.deepEqual([...createSetStore(st, 'k').values()], ['b']);
  st.setItem('k', 'rotto{'); assert.equal(createSetStore(st, 'k').values().size, 0);
});
test('state pub/sub', () => {
  const s = createState({ x: 1 }); let seen; s.subscribe((v) => (seen = v.x)); s.set({ x: 2 });
  assert.equal(seen, 2); assert.equal(s.get().x, 2);
});
