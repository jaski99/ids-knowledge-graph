import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGraphView } from '../js/ui/graph-view.js';

const fakeNode = (nodeId) => {
  const classes = new Set();
  return { id: () => nodeId, classes, toggleClass(name, on) { on ? classes.add(name) : classes.delete(name); },
    nonempty: () => true, select() {} };
};

test('grafo: i filtri nascondono i nodi esclusi, ma il percorso selezionato resta visibile', () => {
  const nodes = [fakeNode('a'), fakeNode('b')];
  const edge = { id: () => 'a->b', source: () => nodes[0], target: () => nodes[1],
    classes: new Set(), toggleClass(name, on) { on ? this.classes.add(name) : this.classes.delete(name); } };
  const g = { on() {}, batch(fn) { fn(); }, nodes: () => nodes, edges: () => [edge],
    $: () => ({ unselect() {} }), getElementById: (id) => nodes.find((n) => n.id() === id), animate() {} };
  let opts;
  const old = globalThis.cytoscape;
  globalThis.cytoscape = (arg) => { if (arg === 'layout') return null; opts = arg; return g; };
  const graph = { nodi: [
    { id: 'a', title: 'A', area: 1, tipo: 'concetto', priorita: { livello: 'alta' }, prerequisiti: [] },
    { id: 'b', title: 'B', area: 1, tipo: 'concetto', priorita: { livello: 'media' }, prerequisiti: [{ id: 'a', forza: 'hard' }] },
  ] };
  try {
    const view = createGraphView({ clientWidth: 300, clientHeight: 300, addEventListener() {} }, graph, { onSelect() {} });
    assert.equal(opts.style.find((rule) => rule.selector === '.faded').style.display, 'none');
    view.update({ visible: new Set(['a']), done: new Set(), selected: null });
    assert.equal(nodes[0].classes.has('faded'), false);
    assert.equal(nodes[1].classes.has('faded'), true);
    assert.equal(edge.classes.has('faded'), true);
    view.update({ visible: new Set(['a']), done: new Set(), selected: 'b' });
    assert.equal(nodes[1].classes.has('faded'), false);
    assert.equal(edge.classes.has('on-path'), true);
  } finally { globalThis.cytoscape = old; }
});
