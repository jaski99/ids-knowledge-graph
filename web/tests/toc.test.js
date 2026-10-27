import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickActive, sectionMeter, sectionLabel } from '../js/ui/toc.js';

const sections = [{ id: 'sec-intuizione', top: 0 }, { id: 'sec-spiegazione', top: 500 }, { id: 'sec-riepilogo', top: 1200 }];

test('pickActive segue la sezione già raggiunta', () => {
  assert.equal(pickActive(sections, 0, 80), 'sec-intuizione');
  assert.equal(pickActive(sections, 430, 80), 'sec-spiegazione');
  assert.equal(pickActive(sections, 2000, 80), 'sec-riepilogo');
  assert.equal(pickActive([], 0, 80), null);
});

test('sectionMeter normalizza indice e rapporto', () => {
  const mid = sectionMeter(sections.map((s) => s.id), 'sec-spiegazione');
  assert.equal(mid.index, 1);
  assert.equal(mid.total, 3);
  assert.equal(mid.ratio, 0.5);
  assert.equal(sectionMeter(['solo'], 'solo').ratio, 1);
  assert.equal(sectionMeter(['a', 'b'], 'assente').index, 0);
});

test('etichette italiane delle sezioni', () => {
  assert.equal(sectionLabel('sec-errori'), 'Errori comuni');
  assert.equal(sectionLabel('sec-perche'), 'Perché ti serve');
  assert.equal(sectionLabel('sconosciuta'), 'sconosciuta');
});
