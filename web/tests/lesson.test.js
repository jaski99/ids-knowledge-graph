import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, lessonHash, lessonNav, hasLesson, createStepper, countFences, nextToStudy, whyItMatters } from '../js/core/lesson.js';

test('routing lezione: andata e ritorno, hash estranei ignorati', () => {
  assert.equal(lessonHash('design-pattern-observer'), '#/lezione/design-pattern-observer');
  assert.deepEqual(parseRoute(lessonHash('a-b')), { view: 'lezione', id: 'a-b' });
  for (const h of ['', '#/', '#/lezione/', '#grafo', null]) assert.equal(parseRoute(h), null);
});
test('navigazione precedente/successivo secondo il percorso', () => {
  const order = ['a', 'b', 'c'];
  assert.deepEqual(lessonNav(order, 'a'), { prev: null, next: 'b', pos: 1, total: 3 });
  assert.deepEqual(lessonNav(order, 'b'), { prev: 'a', next: 'c', pos: 2, total: 3 });
  assert.deepEqual(lessonNav(order, 'c'), { prev: 'b', next: null, pos: 3, total: 3 });
  assert.equal(lessonNav(order, 'zz').pos, 0);
});
test('hasLesson', () => {
  assert.equal(hasLesson({ lezione: { spiegazione: '## x' } }), true);
  assert.equal(hasLesson({}), false);
  assert.equal(hasLesson(undefined), false);
});
test('whyItMatters: testo ripulito, null se assente o vuoto', () => {
  assert.equal(whyItMatters({ lezione: { perche_ti_serve: '  Parte 2 Testing: 13 prove su 13. ' } }), 'Parte 2 Testing: 13 prove su 13.');
  for (const n of [{ lezione: { perche_ti_serve: '   ' } }, { lezione: {} }, { lezione: null }, {}, undefined, { lezione: { perche_ti_serve: 42 } }]) {
    assert.equal(whyItMatters(n), null);
  }
});
test('stepper: passi uno alla volta, poi soluzione', () => {
  const s = createStepper(2);
  assert.equal(s.label(), 'Mostra passo 1 di 2');
  s.next(); assert.equal(s.shown, 1); assert.equal(s.label(), 'Mostra passo 2 di 2');
  s.next(); assert.equal(s.label(), 'Mostra soluzione'); assert.equal(s.solutionShown, false);
  s.next(); assert.equal(s.solutionShown, true); assert.equal(s.finished, true);
  s.next(); assert.equal(s.shown, 2);
  s.reset(); assert.equal(s.shown, 0);
  assert.equal(createStepper(3).all().finished, true);
});
test('countFences', () => {
  assert.equal(countFences('a\n```mermaid\nx\n```\n```java\ny\n```\n```mermaid\nz\n```', 'mermaid'), 2);
});
test('nextToStudy: prima non completata dopo la corrente, poi dall\'inizio', () => {
  const order = ['a', 'b', 'c', 'd'];
  assert.equal(nextToStudy(order, new Set(), null), 'a');
  assert.equal(nextToStudy(order, new Set(['a', 'b']), 'a'), 'c');
  assert.equal(nextToStudy(order, new Set(['c']), 'b'), 'd');
  assert.equal(nextToStudy(order, new Set(['b', 'c', 'd']), 'd'), 'a');
  assert.equal(nextToStudy(order, new Set(order), 'b'), null);
});
