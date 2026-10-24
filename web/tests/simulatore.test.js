import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  catalogoEsercizi, copertura, generaProva, messaggioSlotVuoto, strutturaPunteggi, PUNTI_TOTALI, SOGLIA_SUFFICIENZA,
} from '../modules/simulatore/genera.js';
import { calcolaPunteggio, leggiPunti, nodiDaRipassare, testoEsito } from '../modules/simulatore/punteggio.js';
import { formatTempo, leggiTimer, timerInCorso, timerInPausa, timerNuovo } from '../modules/simulatore/timer.js';
import {
  chiudiPerTempo, consegna, creaSessione, leggiRisposta, leggiSessione, salvaSessione, sessioneInCorsoValida, scriviGiudizio, scriviRisposta,
} from '../modules/simulatore/sessione.js';

const graph = JSON.parse(readFileSync(new URL('../../graph/graph.json', import.meta.url), 'utf8'));

const memoryStorage = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};

test('la struttura ufficiale somma a 30 punti', () => {
  const parti = strutturaPunteggi();
  assert.deepEqual(parti.map((p) => p.punti), [16, 3, 11]);
  const slot = parti.flatMap((p) => p.slot.map((s) => s.punti));
  assert.equal(slot.reduce((a, b) => a + b, 0), PUNTI_TOTALI);
  assert.equal(SOGLIA_SUFFICIENZA, 17);
});

test('sul grafo reale ogni voce ha almeno un esercizio e la prova vale 30', () => {
  const buchi = copertura(graph.nodi).filter((r) => r.quanti === 0);
  assert.deepEqual(buchi, []);
  assert.equal(copertura(graph.nodi).find((r) => r.slotId === 'bva').quanti, 3);
  const viste = new Set();
  for (let seed = 1; seed <= 12; seed += 1) {
    const prova = generaProva(graph.nodi, { seed, now: 1000 });
    assert.equal(prova.coperta, true);
    assert.equal(prova.durataMs, 2 * 60 * 60 * 1000);
    let punti = 0;
    for (const parte of prova.parti) {
      assert.equal(parte.mancanti.length, 0);
      for (const q of parte.quesiti) {
        assert.equal(typeof q.puntiMax, 'number');
        assert.ok(q.consegne.length >= 1);
        for (const c of q.consegne) {
          assert.ok(c.testo.trim());
          assert.ok(c.soluzione.trim());
          const nodo = graph.nodi.find((n) => n.id === c.nodoId);
          assert.equal(c.testo, nodo.esercizi[c.indice].testo);
          assert.equal(c.soluzione, nodo.esercizi[c.indice].soluzione);
        }
        punti += q.puntiMax;
      }
    }
    assert.equal(punti, 30);
    const black = prova.parti.find((p) => p.id === 'blackbox').quesiti[0].consegne[0];
    assert.equal(black.nodoId, 'esercizio-black-box-scaglioni');
    viste.add(prova.parti[0].quesiti.find((q) => q.slotId === 'pattern').consegne[0].nodoId);
  }
  assert.ok(viste.size >= 2, 'seed diversi devono poter estrarre pattern diversi');
  const prima = generaProva(graph.nodi, { seed: 4, now: 1 });
  const seconda = generaProva(graph.nodi, { seed: 4, now: 1 });
  assert.deepEqual(prima, seconda);
});

test('la voce classi usa l\'esercizio da 5 punti quando c\'è', () => {
  const prova = generaProva(graph.nodi, { seed: 3 });
  const q = prova.parti[0].quesiti.find((x) => x.slotId === 'classi');
  assert.equal(q.consegne[0].nodoId, 'esercizio-class-diagram-da-testo');
  assert.match(q.consegne[0].tipoEsame, /5\s*pt/);
});

test('senza esercizi la parte resta vuota e non inventa testo', () => {
  const nodi = [{
    id: 'solo-uc', title: 'Casi d\'uso', area: 1, tipo: 'tipo_esercizio',
    esercizi: [{ tipo_esame: 'scritto: use case (2 pt)', testo: 'Disegna il diagramma.', soluzione: 'Un ovale Cliente.' }],
  }, {
    id: 'seq', title: 'Sequenza', area: 2, tipo: 'abilita',
    esercizi: [{ tipo_esame: 'scritto: sequence (prova 2025)', testo: 'Solo la sequenza.', soluzione: 'Lifeline.' }],
  }, {
    id: 'vuoto', title: 'Vuoto', area: 2, tipo: 'abilita',
    esercizi: [{ tipo_esame: 'scritto: class diagram (5 pt)', testo: '   ', soluzione: 'niente' }],
  }];
  const prova = generaProva(nodi, { seed: 1 });
  const design = prova.parti.find((p) => p.id === 'design');
  const uc = design.quesiti.find((q) => q.slotId === 'usecase');
  assert.equal(uc.puntiMax, 2);
  assert.equal(uc.consegne[0].testo, 'Disegna il diagramma.');
  const comp = design.quesiti.find((q) => q.slotId === 'comportamento');
  assert.equal(comp.puntiMax, null);
  assert.equal(comp.consegne.length, 1);
  assert.match(comp.motivo, /Dati insufficienti/);
  assert.match(comp.motivo, /attività/);
  assert.ok(design.mancanti.some((m) => m.id === 'classi' && m.messaggio === messaggioSlotVuoto(m.titolo)));
  const bb = prova.parti.find((p) => p.id === 'blackbox');
  assert.equal(bb.quesiti.length, 0);
  assert.match(bb.mancanti[0].messaggio, /Non è stato inventato un testo/);
  assert.equal(prova.coperta, false);
  assert.equal(catalogoEsercizi(nodi).some((e) => e.nodoId === 'vuoto'), false);
});

test('i punti accettano solo interi dentro la scala', () => {
  assert.deepEqual(leggiPunti('', 5), { ok: false, motivo: 'vuoto' });
  assert.deepEqual(leggiPunti('2', 5), { ok: true, punti: 2 });
  assert.deepEqual(leggiPunti('2,0', 5), { ok: true, punti: 2 });
  assert.equal(leggiPunti('2,5', 5).motivo, 'non intero');
  assert.equal(leggiPunti(2.5, 5).motivo, 'non intero');
  assert.equal(leggiPunti(6, 5).motivo, 'fuori scala');
  assert.equal(leggiPunti(-1, 5).motivo, 'fuori scala');
  assert.equal(leggiPunti('x', 5).motivo, 'non numerico');
});

test('il punteggio di parte e il totale escludono le voci scoperte', () => {
  const prova = {
    coperta: false,
    puntiTotali: 30,
    sogliaSufficienza: 17,
    parti: [
      { id: 'design', titolo: 'Parte 1 — Design', punti: 16, quesiti: [
        { id: 'design:classi', puntiMax: 5, consegne: [{ nodoId: 'a', nodoTitolo: 'Classi', etichetta: 'Classi' }] },
        { id: 'design:pattern', puntiMax: 4, consegne: [{ nodoId: 'b', nodoTitolo: 'Observer', etichetta: 'Pattern' }] },
      ], mancanti: [{ id: 'usecase', titolo: "1.3 Casi d'uso" }] },
      { id: 'blackbox', titolo: 'Parte 2 — Testing black box', punti: 3, quesiti: [], mancanti: [{ id: 'bva', titolo: 'BVA' }] },
    ],
  };
  const parziale = calcolaPunteggio(prova, { 'design:classi': 5 });
  assert.equal(parziale.parti[0].ottenuti, 5);
  assert.equal(parziale.parti[0].maxValutabile, 9);
  assert.equal(parziale.parti[0].senzaGiudizio, 1);
  assert.equal(parziale.parti[1].maxValutabile, 0);
  assert.equal(parziale.totale.ottenuti, 5);
  assert.equal(parziale.totale.maxValutabile, 9);
  assert.match(testoEsito(parziale, prova).join(' '), /non è su 30/);
  const pieno = calcolaPunteggio(prova, { 'design:classi': 5, 'design:pattern': 2 });
  assert.deepEqual(nodiDaRipassare(pieno).map((n) => n.nodoId), ['b']);
  assert.equal(nodiDaRipassare(calcolaPunteggio(prova, { 'design:classi': 5, 'design:pattern': 4 })).length, 0);
  const chiusa = { ...prova, coperta: true, sogliaSufficienza: 17 };
  const sopra = calcolaPunteggio(chiusa, { 'design:classi': 5, 'design:pattern': 4 });
  sopra.totale.senzaGiudizio = 0;
  assert.match(testoEsito({ ...sopra, totale: { ...sopra.totale, ottenuti: 18, maxValutabile: 30, senzaGiudizio: 0 } }, { ...chiusa, coperta: true }).join(' '), /Sopra la soglia/);
  assert.match(testoEsito({ ...sopra, totale: { ottenuti: 17, maxValutabile: 30, senzaGiudizio: 0, puntiUfficiali: 30 } }, chiusa).join(' '), /Sotto la soglia/);
});

test('timer: pausa, ripresa e scadenza', () => {
  let timer = timerNuovo(0, 10_000);
  assert.equal(formatTempo(leggiTimer(timer, 0).rimanenti), '00:00:10');
  assert.equal(formatTempo(2 * 60 * 60 * 1000), '02:00:00');
  assert.equal(formatTempo(0), '00:00:00');
  timer = timerInPausa(timer, 1500);
  assert.equal(leggiTimer(timer, 50_000).trascorsoMs, 1500);
  assert.equal(leggiTimer(timer, 50_000).running, false);
  timer = timerInCorso(timer, 50_000);
  assert.equal(leggiTimer(timer, 51_000).trascorsoMs, 2500);
  const scaduto = leggiTimer(timerNuovo(0, 1000), 1000);
  assert.equal(scaduto.scaduto, true);
  assert.equal(scaduto.running, false);
  assert.equal(formatTempo(1), '00:00:01');
});

test('solo una prova valida non terminata è riprendibile', () => {
  const prova = generaProva(graph.nodi, { seed: 12, now: 10_000 });
  const attiva = creaSessione(prova, 10_000);
  assert.equal(sessioneInCorsoValida(attiva, 10_001), true);
  assert.equal(sessioneInCorsoValida({ ...attiva, fase: 'correzione' }, 10_001), false);
  assert.equal(sessioneInCorsoValida(attiva, 10_000 + prova.durataMs), false);
  assert.equal(sessioneInCorsoValida({ ...attiva, prova: { ...prova, parti: [] } }, 10_001), false);
  assert.equal(sessioneInCorsoValida({ ...attiva, timer: { ...attiva.timer, startedAt: 20_000 } }, 10_001), false);
  const finita = { ...attiva, timer: { ...attiva.timer, running: false, startedAt: null, elapsedMs: prova.durataMs } };
  assert.equal(sessioneInCorsoValida(finita, 10_001), false);
});

test('la sessione sopravvive a un roundtrip e scarta il JSON sporco', () => {
  const prova = generaProva(graph.nodi, { seed: 2, now: 5 });
  let s = creaSessione(prova, 5);
  s = scriviRisposta(s, 'design:classi', 0, 'il mio diagramma', 1);
  s = scriviRisposta(s, 'design:comportamento', 1, 'activity', 3);
  s = scriviGiudizio(s, 'design:classi', 3);
  const storage = memoryStorage();
  assert.equal(salvaSessione(storage, s), true);
  const letto = leggiSessione(storage);
  assert.equal(leggiRisposta(letto, 'design:classi'), 'il mio diagramma');
  assert.equal(leggiRisposta(letto, 'design:comportamento', 1), 'activity');
  assert.equal(letto.giudizi['design:classi'], 3);
  assert.equal(consegna(letto, 8_000).fase, 'correzione');
  assert.equal(chiudiPerTempo(letto).timer.elapsedMs, letto.timer.durataMs);
  storage.setItem('ids-kg:simulatore:v1', '{');
  assert.equal(leggiSessione(storage), null);
  storage.setItem('ids-kg:simulatore:v1', '{"versione":1}');
  assert.equal(leggiSessione(storage), null);
});
