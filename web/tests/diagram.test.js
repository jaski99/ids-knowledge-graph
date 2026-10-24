import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampZoom, stepZoom, mermaidThemeName, ZOOM_MIN, ZOOM_MAX } from '../js/ui/diagram.js';

test('lo zoom resta nel intervallo e parte da 1 se il valore non è un numero', () => {
  assert.equal(clampZoom(10), ZOOM_MAX);
  assert.equal(clampZoom(0.1), ZOOM_MIN);
  assert.equal(clampZoom('no'), 1);
  assert.equal(stepZoom(1, 'in'), 1.25);
  assert.equal(stepZoom(1, 'out'), 0.8);
  assert.equal(stepZoom(ZOOM_MAX, 'in'), ZOOM_MAX);
  assert.equal(stepZoom(undefined, 'out'), 0.8);
});

test('il tema mermaid segue il tema dell\'interfaccia', () => {
  assert.equal(mermaidThemeName('dark'), 'dark');
  assert.equal(mermaidThemeName('light'), 'default');
  assert.equal(mermaidThemeName(undefined), 'default');
});
