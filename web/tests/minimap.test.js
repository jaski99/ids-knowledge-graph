import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minimapKeyDelta, minimapTransform, panToCenter } from '../js/ui/minimap.js';

test('gli estremi del grafo cadono dentro la tela e la mappa è invertibile', () => {
  const t = minimapTransform({ x1: -20, y1: 10, x2: 80, y2: 60 }, 200, 100, 10);
  for (const [x, y] of [[-20, 10], [80, 60], [30, 35]]) {
    const p = t.toCanvas(x, y);
    assert.ok(p.x >= 9 && p.x <= 191, `x ${p.x}`);
    assert.ok(p.y >= 9 && p.y <= 91, `y ${p.y}`);
    const back = t.toModel(p.x, p.y);
    assert.ok(Math.abs(back.x - x) < 1e-6 && Math.abs(back.y - y) < 1e-6);
  }
});

test('un bounding box degenere non produce scala infinita', () => {
  const t = minimapTransform({ x1: 5, y1: 5, x2: 5, y2: 5 }, 100, 80, 4);
  assert.ok(Number.isFinite(t.scale) && t.scale > 0);
  assert.ok(Number.isFinite(t.toCanvas(5, 5).x));
});

test('panToCenter porta il punto al centro del viewport', () => {
  assert.deepEqual(panToCenter({ x: 10, y: 4 }, 2, 200, 100), { x: 80, y: 42 });
});


test('minimappa navigabile anche con le frecce', () => {
  assert.deepEqual(minimapKeyDelta('ArrowLeft', 300, 150), [100, 0]);
  assert.deepEqual(minimapKeyDelta('ArrowDown', 300, 150), [0, -50]);
  assert.equal(minimapKeyDelta('Enter', 300, 150), null);
});
