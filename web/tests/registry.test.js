import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createViewRegistry } from '../modules/registry.js';

const view = (id, title = id, mount = null) => ({ id, title, mount });

test('register memorizza id e titolo, list non espone l\'array interno', () => {
  const r = createViewRegistry();
  r.register(view('simulatore', 'Simulatore'));
  const list = r.list();
  list.push({ id: 'extra', title: 'Extra' });
  assert.deepEqual(r.list().map((v) => v.id), ['simulatore']);
  assert.equal(r.get('simulatore').title, 'Simulatore');
  assert.equal(r.get('assente'), null);
});

test('title viene ripulito dagli spazi', () => {
  const r = createViewRegistry();
  assert.equal(r.register(view('quiz', '  Quiz  ')).title, 'Quiz');
});

test('id duplicato o malformato rifiutati', () => {
  const r = createViewRegistry();
  r.register(view('grafo', 'Grafo'));
  assert.throws(() => r.register(view('grafo', 'Altro')), /già registrata/);
  assert.throws(() => r.register(view('Grafo', 'X')), /kebab-case/);
  assert.throws(() => r.register(view('a b', 'X')), /kebab-case/);
  assert.throws(() => r.register({ id: 'ok' }), /title/);
  assert.throws(() => r.register({ id: 'ok', title: 'Ok', mount: 'no' }), /mount/);
});

test('subscribe riceve le viste già registrate e quelle successive, e si disiscrive', () => {
  const r = createViewRegistry();
  r.register(view('prima', 'Prima'));
  const seen = [];
  const off = r.subscribe((v) => seen.push(v.id));
  r.register(view('dopo', 'Dopo'));
  off();
  r.register(view('mai', 'Mai'));
  assert.deepEqual(seen, ['prima', 'dopo']);
});
