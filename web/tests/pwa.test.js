import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registraPwa } from '../js/core/pwa.js';

test('registrazione PWA sicura, relativa, e non bloccante senza supporto', async () => {
  let got;
  const nav = { serviceWorker: { register: async (...args) => { got = args; } } };
  assert.equal(await registraPwa(nav, { protocol: 'https:', hostname: 'example.test' }), true);
  assert.deepEqual(got, ['./sw.js', { scope: './', updateViaCache: 'none' }]);
  assert.equal(await registraPwa(nav, { protocol: 'http:', hostname: 'non-locale' }), false);
  assert.equal(await registraPwa({}, { protocol: 'https:' }), false);
  assert.equal(await registraPwa({ serviceWorker: { register: async () => { throw Error(); } } }, { protocol: 'http:', hostname: 'localhost' }), false);
});

test('manifest installabile, icone reali e service worker confinato allo scope', () => {
  const manifest = JSON.parse(readFileSync(new URL('../manifest.webmanifest', import.meta.url)));
  assert.equal(manifest.start_url, './'); assert.equal(manifest.scope, './');
  assert.deepEqual(manifest.icons.map((i) => i.sizes), ['192x192', '512x512']);
  for (const icon of manifest.icons) assert.ok(readFileSync(new URL(`../${icon.src}`, import.meta.url)).length > 100);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /PRECACHE_VERSION/); assert.match(sw, /scope\.pathname/);
  assert.match(sw, /request\.method !== 'GET'/);
});

test('service worker installa risorse, pulisce solo le proprie cache e limita il fetch', async () => {
  const vm = await import('node:vm');
  const callbacks = {};
  const opened = [];
  const removed = [];
  const cache = { addAll: async (urls) => { opened.push(...urls); }, match: async () => 'in-cache' };
  const self = {
    registration: { scope: 'https://esempio.test/progetto/' },
    clients: { claim: async () => {} }, skipWaiting: async () => {},
    addEventListener: (type, fn) => { callbacks[type] = fn; },
  };
  const caches = {
    open: async () => cache, keys: async () => ['ids-kg-pwa-%2Fprogetto%2F-vecchia', 'ids-kg-pwa-%2Faltro%2F-versione', 'altra-app'],
    delete: async (key) => { removed.push(key); },
  };
  const context = { self, caches, URL, fetch: async () => 'rete', importScripts: () => { self.PRECACHE_VERSION = 'abc'; self.PRECACHE_URLS = ['./', './index.html']; } };
  vm.runInNewContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), context);
  let promise;
  callbacks.install({ waitUntil: (p) => { promise = p; } }); await promise;
  assert.deepEqual(opened, ['./', './index.html']);
  callbacks.activate({ waitUntil: (p) => { promise = p; } }); await promise;
  assert.deepEqual(removed, ['ids-kg-pwa-%2Fprogetto%2F-vecchia']);
  let response;
  callbacks.fetch({ request: { method: 'GET', url: 'https://esempio.test/progetto/js/main.js', mode: 'cors' }, respondWith: (p) => { response = p; } });
  assert.equal(await response, 'in-cache');
  response = undefined;
  callbacks.fetch({ request: { method: 'GET', url: 'https://esterno.test/js.js', mode: 'cors' }, respondWith: (p) => { response = p; } });
  assert.equal(response, undefined);
});
