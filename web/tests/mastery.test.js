import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcolaPadronanza, ultimiEsiti, MASTERY_LABELS } from '../js/core/mastery.js';
import { applicaVoto } from '../modules/ripasso/sm2.js';
import { caricaEsiti, ESITI_KEY } from '../js/core/outcomes.js';
import { memoryStorage } from '../js/core/store.js';

const oggi = '2026-10-27';
const nodes = [
  { id: 'base', prerequisiti: [] },
  { id: 'applicazione', prerequisiti: [{ id: 'base', forza: 'hard' }] },
  { id: 'facoltativo', prerequisiti: [{ id: 'base', forza: 'soft' }] },
];
const one = applicaVoto(null, 'bene', oggi);
const two = applicaVoto(one, 'bene', '2026-10-28');
const fail = applicaVoto(one, 'ancora', oggi);
const outcome = (nodo, punti, max, ts = '2026-10-27T10:00:00Z') => ({
  slot_id: 'slot', nodo_id: nodo, profilo: 'profilo', modalita: 'simulazione', punti, punti_max: max, ts,
});

test('padronanza distingue completamento, richiamo e due ripetizioni, con prerequisiti hard', () => {
  let m = calcolaPadronanza(nodes, new Set(), {}, [], oggi);
  assert.equal(m.get('base').livello, 'non_iniziato');
  assert.equal(m.get('base').daFareOra, true);
  assert.equal(m.get('applicazione').daFareOra, false);
  assert.equal(m.get('facoltativo').daFareOra, true);
  m = calcolaPadronanza(nodes, new Set(['base']), {}, [], oggi);
  assert.equal(m.get('base').livello, 'studiato');
  assert.equal(m.get('base').daFareOra, true);
  assert.equal(m.get('applicazione').daFareOra, false); // una spunta non sblocca il richiamo
  m = calcolaPadronanza(nodes, new Set(['base']), { 'base#domanda-0': one }, [], oggi);
  assert.equal(m.get('base').livello, 'richiamo_corretto');
  assert.equal(m.get('applicazione').daFareOra, true);
  m = calcolaPadronanza(nodes, new Set(['base']), { 'base#domanda-0': two }, [], oggi);
  assert.equal(m.get('base').livello, 'padronanza_provvisoria');
  assert.equal(MASTERY_LABELS[m.get('base').livello], 'Padronanza provvisoria');
});

test('errori, scadenze e dati corrotti: nessuna falsa padronanza', () => {
  const m = calcolaPadronanza(nodes, new Set(['base']), {
    'base#domanda-0': two, 'base#checklist-0': fail, 'applicazione#domanda-0': { ef: 'rotto' },
  }, [outcome('applicazione', 1, 2), outcome('base', null, null)], '2026-11-20');
  assert.deepEqual(m.get('base'), { livello: 'studiato', errore: true, scaduto: true, sbloccato: true, daFareOra: true });
  assert.equal(m.get('applicazione').livello, 'studiato');
  assert.equal(m.get('applicazione').errore, true);
  assert.equal(m.get('applicazione').daFareOra, false); // prima il richiamo del prerequisito
});

test('gli esiti valutati più recenti prevalgono, null e punteggi incoerenti sono ignorati', () => {
  const esiti = [outcome('base', 2, 2, '2026-01-01T00:00:00Z'), outcome('base', 0, 2),
    outcome('base', null, 2, '2026-11-01T00:00:00Z'), outcome('base', 3, 2, '2026-12-01T00:00:00Z')];
  assert.equal(ultimiEsiti(esiti).get('base').corretto, false);
  const m = calcolaPadronanza(nodes, new Set(), {}, [outcome('base', 2, 2)], oggi);
  assert.equal(m.get('base').livello, 'richiamo_corretto');
  assert.equal(m.get('base').errore, false);
});

test('adattatore X6 usa solo leggiEsiti; il doppio segue il contratto e gestisce assenza/guasti', async () => {
  const storage = memoryStorage();
  let chiamate = 0;
  const load = async () => ({ leggiEsiti: (s) => { chiamate++; return JSON.parse(s.getItem(ESITI_KEY)); } });
  assert.deepEqual(await caricaEsiti(storage, load), { esiti: [], disponibile: true });
  assert.equal(chiamate, 0);
  const esiti = [outcome('base', 1, 2)];
  storage.setItem(ESITI_KEY, JSON.stringify(esiti));
  assert.deepEqual(await caricaEsiti(storage, load), { esiti, disponibile: true });
  assert.deepEqual(await caricaEsiti(storage, async () => { throw Error('non ancora su main'); }), { esiti: [], disponibile: false });
});


test('SM-2 corrotto non crea un falso richiamo', () => {
  const m = calcolaPadronanza(nodes, new Set(), {
    'base#domanda-0': { ...one, ripetizioni: 9, revisioni: 1 },
  }, [], oggi);
  assert.equal(m.get('base').livello, 'studiato');
  assert.equal(m.get('applicazione').daFareOra, false);
});
