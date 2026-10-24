import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createViewRegistry, getAll, register } from '../modules/registry.js';
import { idDaHash, vociNavigazione } from '../modules/avvia.js';

const view = (id, titolo = id, render = () => {}) => ({ id, titolo, render });

test('registry isolato registra viste e restituisce copie, con accesso per id', () => {
  const registry = createViewRegistry();
  const item = registry.register(view('simulatore', 'Simulatore'));
  assert.equal(item.titolo, 'Simulatore');
  assert.equal(registry.get('simulatore'), item);
  assert.equal(registry.get('assente'), null);
  const list = registry.getAll();
  list.push(view('intruso'));
  assert.deepEqual(registry.getAll().map((v) => v.id), ['simulatore']);
});

test('registry isolato ripulisce titolo, rifiuta duplicati e input non validi', () => {
  const registry = createViewRegistry();
  assert.equal(registry.register(view('quiz', '  Quiz  ')).titolo, 'Quiz');
  assert.throws(() => registry.register(view('quiz')), /già registrata/);
  for (const invalid of [null, {}, { id: 'Spazi', titolo: 'X', render() {} },
    { id: 'x', titolo: ' ', render() {} }, { id: 'ok', titolo: 'Ok' }]) {
    assert.throws(() => registry.register(invalid), TypeError);
  }
});

test('subscribe riceve viste preesistenti e successive, e può disiscriversi', () => {
  const registry = createViewRegistry();
  registry.register(view('prima'));
  const seen = [];
  const off = registry.subscribe((entry) => seen.push(entry.id));
  registry.register(view('dopo'));
  off();
  registry.register(view('mai'));
  assert.deepEqual(seen, ['prima', 'dopo']);
});

test('registry applicativo permette registrazioni idempotenti per moduli e non espone array interno', () => {
  const render = () => {};
  register({ id: 'registry-spec', titolo: 'Spec', render });
  register({ id: 'registry-spec', titolo: 'Spec aggiornata', render });
  const found = getAll().filter((entry) => entry.id === 'registry-spec');
  assert.equal(found.length, 1);
  assert.equal(found[0].titolo, 'Spec aggiornata');
  const copy = getAll();
  copy.pop();
  assert.ok(getAll().some((entry) => entry.id === 'registry-spec'));
});

test('la navigazione crea link visibili per tutte le viste registrate', () => {
  assert.deepEqual(vociNavigazione([
    { id: 'simulatore', titolo: 'Simulatore' },
    { id: 'ripasso', titolo: 'Ripasso' },
  ]), [
    { id: 'simulatore', titolo: 'Simulatore', href: '#/simulatore' },
    { id: 'ripasso', titolo: 'Ripasso', href: '#/ripasso' },
  ]);
});

test('idDaHash accetta route vista ma non route lezione', () => {
  assert.equal(idDaHash('#/simulatore'), 'simulatore');
  assert.equal(idDaHash('#/ripasso'), 'ripasso');
  assert.equal(idDaHash('#/lezione/uml-casi-uso'), null);
  assert.equal(idDaHash('#/percorso'), 'percorso');
  assert.equal(idDaHash(''), null);
  assert.equal(idDaHash('#/'), null);
});
