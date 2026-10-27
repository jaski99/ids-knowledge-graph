import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttemptStore, exerciseId, leggiTentativi, ultimoTentativo, ATTEMPTS_KEY } from '../js/core/attempts.js';
import { memoryStorage } from '../js/core/store.js';
import { parseHTML } from 'linkedom';
import { createExercise } from '../js/ui/exercise.js';

const clock = () => new Date('2026-10-27T10:00:00Z');

test('i tentativi richiedono risposta, persistono e l’autovalutazione è esplicita', () => {
  const storage = memoryStorage();
  const store = createAttemptStore(storage, clock);
  assert.equal(store.record('n', 0, '  '), false);
  assert.equal(store.record('n', 0, 'il mio tentativo'), true);
  assert.equal(exerciseId('n', 0), 'n#esercizio-0');
  assert.equal(store.latest('n', 0).valutazione, null);
  assert.equal(store.assess('n', 0, 'da-rivedere'), true);
  assert.equal(ultimoTentativo(store.read(), 'n', 0).valutazione, 'da-rivedere');
  assert.equal(store.assess('n', 2, 'corretto'), false);
  storage.setItem(ATTEMPTS_KEY, '{corrotto');
  assert.deepEqual(leggiTentativi(storage), []);
});

test('soluzione non nel DOM finché non si scrive e invia un tentativo', () => {
  const { document } = parseHTML('<html><body></body></html>');
  globalThis.document = document;
  globalThis.window = document.defaultView;
  const storage = memoryStorage();
  const store = createAttemptStore(storage, clock);
  const el = createExercise({ id: 'banca' }, { tipo_esame: 'Parte 3 Teoria', testo: 'Domanda?', soluzione: 'RISPOSTA SEGRETA' }, 0, store);
  document.body.append(el);
  const button = el.querySelector('button');
  assert.equal(button.disabled, true);
  assert.equal(el.textContent.includes('RISPOSTA SEGRETA'), false);
  const input = el.querySelector('textarea');
  input.value = 'Provo una risposta';
  input.dispatchEvent(new document.defaultView.Event('input'));
  button.click();
  assert.equal(el.textContent.includes('RISPOSTA SEGRETA'), true);
  assert.equal(store.latest('banca', 0).risposta, 'Provo una risposta');
  el.querySelector('[data-assessment="da-rivedere"]').click();
  assert.equal(store.latest('banca', 0).valutazione, 'da-rivedere');
});
