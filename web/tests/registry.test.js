import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAll, register } from '../modules/registry.js';
import { idDaHash } from '../modules/avvia.js';

test('register sostituisce lo stesso id e getAll non espone l\'array interno', () => {
  const render = () => {};
  register({ id: 'registry-spec', titolo: 'Spec', render });
  register({ id: 'registry-spec', titolo: 'Spec 2', render });
  const trovate = getAll().filter((v) => v.id === 'registry-spec');
  assert.equal(trovate.length, 1);
  assert.equal(trovate[0].titolo, 'Spec 2');
  const copia = getAll();
  copia.pop();
  assert.ok(getAll().some((v) => v.id === 'registry-spec'));
});

test('register rifiuta una vista incompleta', () => {
  assert.throws(() => register({ id: 'x', titolo: 'X' }), TypeError);
  assert.throws(() => register({ id: '', titolo: 'X', render() {} }), TypeError);
});

test('idDaHash accetta solo #/id della vista', () => {
  assert.equal(idDaHash('#/simulatore'), 'simulatore');
  assert.equal(idDaHash('#/lezione/uml-casi-uso'), null);
  assert.equal(idDaHash('#/percorso'), 'percorso');
  assert.equal(idDaHash(''), null);
  assert.equal(idDaHash('#/'), null);
});
