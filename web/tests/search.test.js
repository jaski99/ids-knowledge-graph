import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonPlainText, eventShouldFocusSearch } from '../js/core/search.js';
import { emptyFilters, applyFilters } from '../js/core/filters.js';
import { nodi } from './fixture.js';

test('lessonPlainText raccoglie i campi annidati e ignora i nodi senza lezione', () => {
  assert.equal(lessonPlainText({}), '');
  assert.equal(lessonPlainText(null), '');
  const text = lessonPlainText({
    lezione: {
      intuizione: 'idea',
      esempi_svolti: [{ titolo: 'caso', passi: ['uno', 'due'] }],
      domande_autoverifica: [{ domanda: 'che cosa', risposta: 'questo' }],
    },
  });
  for (const word of ['idea', 'caso', 'uno', 'che cosa', 'questo']) assert.ok(text.includes(word), word);
});

test('la ricerca trova parole solo nella lezione, nel titolo o nel sapere', () => {
  const nodes = nodi();
  nodes[0].lezione = { spiegazione: 'La parola xylophone compare solo qui. Perché il contesto conta.' };
  const ids = (q) => applyFilters(nodes, { ...emptyFilters(), q }, new Set()).map((n) => n.id);
  assert.deepEqual(ids('xylophone'), ['c']);
  assert.deepEqual(ids('perche contesto'), ['c']);
  assert.deepEqual(ids('fare b'), ['b']);
});

test('stato di studio: aperti, fatti, tutti', () => {
  const nodes = nodi();
  const done = new Set(['a', 'd']);
  const ids = (stato) => applyFilters(nodes, { ...emptyFilters(), stato }, done).map((n) => n.id).sort();
  assert.deepEqual(ids('tutti'), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids('aperti'), ['b', 'c']);
  assert.deepEqual(ids('fatti'), ['a', 'd']);
});

test('scorciatoia / : non ruba il tasto mentre si scrive, accetta il maiusc', () => {
  const ev = (over) => ({ key: '/', target: { tagName: 'BODY' }, ...over });
  assert.equal(eventShouldFocusSearch(ev({})), true);
  assert.equal(eventShouldFocusSearch(ev({ shiftKey: true })), true);
  assert.equal(eventShouldFocusSearch(ev({ target: { tagName: 'INPUT' } })), false);
  assert.equal(eventShouldFocusSearch(ev({ target: { tagName: 'TEXTAREA' } })), false);
  assert.equal(eventShouldFocusSearch(ev({ target: { tagName: 'DIV', isContentEditable: true } })), false);
  assert.equal(eventShouldFocusSearch(ev({ ctrlKey: true })), false);
  assert.equal(eventShouldFocusSearch(ev({ key: 'k' })), false);
  assert.equal(eventShouldFocusSearch(null), false);
});
