import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepare } from '../js/data.js';
import { costruisciPercorsi, indicizzaProgramma } from '../js/core/exam-paths.js';

const nodo = (id, title, priorita = 'alta', esercizi = []) => ({ id, title, priorita: { livello: priorita }, esercizi });

test('ordine tematico richiesto; ids arbitrari, sovrapposizioni e ordine topologico conservato', () => {
  const nodes = [
    nodo('y', 'Pattern Decorator'), nodo('b', 'Boundary Value Analysis'), nodo('q', 'Diagramma delle classi'),
    nodo('z', 'Diagramma UML di attività'), nodo('x', 'Domanda teorica'),
    nodo('u', 'Esercizio trasversale', 'alta', [{ tipo_esame: 'Parte 1 Design: pattern e class diagram' }]),
  ];
  const paths = costruisciPercorsi({ nodi: nodes, order: nodes.map((n) => n.id) });
  assert.deepEqual(paths.map((p) => p.titolo), ['Testing meccanico', 'Class Diagram', 'Pattern', 'Diagrammi dinamici', 'Teoria']);
  assert.deepEqual(paths.map((p) => p.nodi.map((n) => n.id)), [['b'], ['q', 'u'], ['y', 'u'], ['z'], ['x']]);
});

test('mappatura programma opzionale associa parte e priorità senza id cablati', () => {
  const nodes = [nodo('a', 'Un argomento'), nodo('b', 'Un altro', 'media')];
  const programma = [{ titolo: 'Implementazione', parte_esame: 'Testing', nodi: ['a', 'b'] }];
  assert.match(indicizzaProgramma(programma).get('a'), /Testing/);
  assert.deepEqual(costruisciPercorsi({ nodi: nodes, programma })[0].nodi.map((n) => n.id), ['a']);
  assert.equal(costruisciPercorsi({ nodi: nodes })[0].nodi.length, 0);
});

test('grafo reale: ogni percorso ha contenuti, segue l’ordine e usa gli stessi oggetti', () => {
  const g = prepare(JSON.parse(readFileSync(new URL('../../graph/graph.json', import.meta.url))));
  for (const p of costruisciPercorsi(g)) {
    assert.ok(p.nodi.length, p.titolo);
    const posizioni = p.nodi.map((n) => g.order.indexOf(n.id));
    assert.deepEqual(posizioni, [...posizioni].sort((a, b) => a - b), p.titolo);
    assert.ok(p.nodi.some((n) => n.priorita.livello === 'alta'), p.titolo);
  }
});

test('vista dei percorsi offre collegamenti accessibili e mostra i prerequisiti mancanti', async () => {
  const { parseHTML } = await import('linkedom');
  const { createExamPathsView } = await import('../js/ui/exam-paths.js');
  const { document } = parseHTML('<html><body><div id="percorsi"></div></body></html>');
  globalThis.document = document;
  const nodes = [nodo('a', 'Testing'), { ...nodo('b', 'Boundary'), prerequisiti: [{ id: 'a', forza: 'hard' }] }];
  const graph = { nodi: nodes, byId: new Map(nodes.map((n) => [n.id, n])), order: ['a', 'b'] };
  let opened;
  const view = createExamPathsView(document.querySelector('#percorsi'), graph, { onOpenLesson: (id) => { opened = id; }, onSelect: () => {} });
  view.render({ visible: new Set(['a', 'b']), done: new Set(), mastery: new Map() });
  assert.equal(document.querySelectorAll('.exam-path').length, 5);
  assert.match(document.querySelector('#percorsi').textContent, /Prima verifica il richiamo/);
  document.querySelector('.exam-path button').click();
  assert.equal(opened, 'a');
});
