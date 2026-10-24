import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { graphMobileEntries } from '../js/ui/graph-mobile-list.js';

test('la lista touch rispetta filtri e stato completato', () => {
  const nodes = [
    { id: 'use-case', title: 'Casi d’uso', area: 1 },
    { id: 'testing', title: 'Testing', area: 3 },
  ];
  assert.deepEqual(graphMobileEntries(nodes, new Set(['use-case']), new Set(['use-case'])), [
    { id: 'use-case', title: 'Casi d’uso', area: 1, done: true },
  ]);
});

test('gli elementi della lista mobile hanno target touch almeno 44px', async () => {
  const css = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.graph-mobile-item\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css, /\.graph-mobile-item\s*\{[^}]*min-height:\s*48px/s);
});
