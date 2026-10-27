import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { initTabs, tabTargetIndex } from '../js/ui/tabs.js';

test('tastiera delle schede: frecce circolari, Home e Fine', () => {
  assert.equal(tabTargetIndex('ArrowRight', 2, 3), 0);
  assert.equal(tabTargetIndex('ArrowLeft', 0, 3), 2);
  assert.equal(tabTargetIndex('Home', 2, 3), 0);
  assert.equal(tabTargetIndex('End', 0, 3), 2);
  assert.equal(tabTargetIndex('Escape', 0, 3), null);
  assert.equal(tabTargetIndex('Home', -1, 3), null);
});

test('selezione di una scheda mantiene aria-selected, pannello e roving tabindex', () => {
  const { document } = parseHTML(`<html><body><div role="tablist"><button role="tab" data-tab="a" aria-controls="pa">A</button><button role="tab" data-tab="b" aria-controls="pb">B</button></div><section id="pa"></section><section id="pb"></section></body></html>`);
  let shown;
  const tabs = initTabs(document, (s) => { shown = s; });
  const [a, b] = document.querySelectorAll('[role=tab]');
  tabs.show(b);
  assert.equal(shown, 'b'); assert.equal(b.getAttribute('aria-selected'), 'true');
  assert.equal(a.getAttribute('aria-selected'), 'false'); assert.equal(a.tabIndex, -1);
  assert.equal(document.getElementById('pa').hidden, true);
  assert.equal(document.getElementById('pb').hidden, false);
});
