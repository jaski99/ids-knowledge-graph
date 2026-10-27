import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { ankiTsv, creaBackup, importaBackup, validaBackup } from '../js/core/backup.js';
import { createBackupView } from '../js/ui/backup-view.js';
import { memoryStorage } from '../js/core/store.js';

const doneKey = 'ids-kg:completati:v1';

test('backup versione 1 preserva solo chiavi IdS, validazione prima della scrittura', () => {
  const storage = memoryStorage();
  storage.setItem(doneKey, '["a"]'); storage.setItem('altro-servizio', 'privato');
  const b = creaBackup(storage, new Date('2026-10-27T10:00:00Z'));
  assert.deepEqual(Object.keys(b.dati), [doneKey]);
  const target = memoryStorage(); target.setItem('altro-servizio', 'intatto');
  assert.equal(importaBackup(target, JSON.stringify(b)), 1);
  assert.equal(target.getItem(doneKey), '["a"]');
  assert.equal(target.getItem('altro-servizio'), 'intatto');
  assert.throws(() => importaBackup(target, '{rotto'), /JSON/);
  assert.throws(() => validaBackup({ ...b, dati: { [doneKey]: 'no' } }), /non valido/);
  assert.throws(() => validaBackup({ ...b, dati: { 'altro-servizio': 'x' } }), /non valido/);
  assert.equal(target.getItem(doneKey), '["a"]');
});

test('errore di storage durante import annulla le scritture già eseguite', () => {
  const base = memoryStorage(); base.setItem(doneKey, '["vecchio"]');
  const storage = { ...base, setItem(k, v) { if (k === 'ids-kg:tema:v1') throw Error('quota'); base.setItem(k, v); } };
  const b = { formato: 'ids-kg-backup', versione: 1, dati: { [doneKey]: '["nuovo"]', 'ids-kg:tema:v1': 'dark' } };
  assert.throws(() => importaBackup(storage, JSON.stringify(b)), /non ha salvato/);
  assert.equal(base.getItem(doneKey), '["vecchio"]');
});

test('Anki TSV a due colonne include domande ed esercizi, rimuove tab e a-capo', () => {
  const nodes = [{ id: 'x', title: 'X', area: 1, sapere: 'Sapere', priorita: { livello: 'alta' },
    checklist_ripasso: [], lezione: { domande_autoverifica: [{ domanda: 'Domanda?\nCome?', risposta: 'Risposta\tqui' }] },
    esercizi: [{ tipo_esame: 'parte 2', testo: '=testo', soluzione: 'risultato' }] }];
  const rows = ankiTsv(nodes).trim().split('\n');
  assert.deepEqual(rows.map((r) => r.split('\t').length), [2, 2]);
  assert.equal(rows[0], 'Domanda? Come?\tRisposta qui');
  assert.equal(rows[1], "'=testo\trisultato");
});

test('vista backup invia contenuti al download iniettato', () => {
  const { document } = parseHTML('<html><body><div id="root"></div></body></html>');
  globalThis.document = document;
  const downloads = [];
  createBackupView(document.getElementById('root'), { nodi: [] }, {
    storage: memoryStorage(), confirm: () => true, reload: () => {},
    download: (_doc, name, type, content) => downloads.push({ name, type, content }),
  });
  document.querySelector('#backup-export').click();
  document.querySelector('#anki-export').click();
  assert.deepEqual(downloads.map((d) => d.name), ['ids-knowledge-graph-backup.json', 'ids-knowledge-graph-anki.tsv']);
  assert.equal(JSON.parse(downloads[0].content).versione, 1);
});
