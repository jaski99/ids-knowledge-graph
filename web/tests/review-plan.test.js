import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternaArgomenti, carteDaTentativi, nodiDaRivedere, pianificaCoda, leggiDataEsame, salvaDataEsame } from '../js/core/review-plan.js';
import { memoryStorage } from '../js/core/store.js';

const oggi = '2026-10-27';
const attempt = (nodo_id, indice, valutazione, ts = '2026-10-27T00:00:00Z') => ({ nodo_id, indice, valutazione, ts, risposta: 'tentativo' });
const card = (id, nodoId, area) => ({ id, nodoId, area, priorita: 'alta' });

test('solo tentativi esistenti producono carte e si usa la traccia originale', () => {
  const nodi = [{ id: 'n', title: 'Nodo', area: 2, priorita: { livello: 'alta' }, esercizi: [{ testo: 'Traccia', soluzione: 'Soluzione' }] }];
  const tentativi = [attempt('n', 0, 'da-rivedere'), attempt('n', 0, 'corretto', '2026-10-28T00:00:00Z'), attempt('n', 4, null)];
  assert.deepEqual(carteDaTentativi(nodi, tentativi).map((c) => [c.id, c.domanda, c.risposta]), [['n#esercizio-0', 'Traccia', 'Soluzione']]);
  assert.deepEqual([...nodiDaRivedere(tentativi)], []);
  assert.deepEqual([...nodiDaRivedere([tentativi[0]])], ['n']);
});

test('alternanza deterministica senza duplicati o perdita di carte', () => {
  const input = [card('a', 'a', 1), card('b', 'b', 1), card('c', 'c', 2), card('d', 'd', 2)];
  assert.deepEqual(alternaArgomenti(input).map((c) => c.id), ['a', 'c', 'b', 'd']);
});

test('precedenza a errori e scadute; data d’esame anticipa solo ciò che scade dopo', () => {
  const cards = [card('nuova', 'n', 1), card('errore', 'e', 1), card('scaduta', 's', 2), card('futura', 'f', 2), card('prima', 'p', 1)];
  const stati = { scaduta: { scadenza: oggi }, futura: { scadenza: '2026-11-15' }, prima: { scadenza: '2026-11-01' } };
  const tentativi = [attempt('e', 0, 'da-rivedere')];
  assert.deepEqual(pianificaCoda(cards, stati, oggi, { tentativi }).map((c) => c.id), ['errore', 'scaduta', 'nuova']);
  assert.deepEqual(pianificaCoda(cards, stati, oggi, { tentativi, dataEsame: '2026-11-10' }).map((c) => c.id), ['errore', 'scaduta', 'nuova', 'futura']);
  assert.equal(pianificaCoda(cards, stati, oggi, { dataEsame: '2026-01-01' }).some((c) => c.id === 'futura'), false);
});

test('data facoltativa: validazione, salvataggio e rimozione', () => {
  const s = memoryStorage();
  assert.equal(leggiDataEsame(s), null);
  assert.equal(salvaDataEsame(s, '2026-02-30'), false);
  assert.equal(salvaDataEsame(s, '2026-11-10'), true);
  assert.equal(leggiDataEsame(s), '2026-11-10');
  assert.equal(salvaDataEsame(s, ''), true);
  assert.equal(leggiDataEsame(s), null);
});
