import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  catalogoEsercizi, copertura, generaProva, messaggioSlotVuoto, strutturaPunteggi, PUNTI_TOTALI, SOGLIA_SUFFICIENZA,
} from '../modules/simulatore/genera.js';
import { calcolaPunteggio, leggiPunti, nodiDaRipassare, testoEsito } from '../modules/simulatore/punteggio.js';
import { formatTempo, leggiTimer, timerInCorso, timerInPausa, timerNuovo } from '../modules/simulatore/timer.js';
import {
  chiudiPerTempo, consegna, creaSessione, leggiRisposta, leggiSessione, salvaSessione, sessioneInCorsoValida, sessioneValida, scriviGiudizio, scriviRisposta,
} from '../modules/simulatore/sessione.js';
import { DURATE_CONSENTITE_MINUTI, PROFILI, durataMsPerProfilo, getProfilo } from '../modules/simulatore/profili.js';
import { corrisponde, riconosciBanca } from '../modules/simulatore/slot.js';
import { CHIAVE_ESITI, leggiEsiti, registraEsito } from '../modules/simulatore/esiti.js';
import { generaReport, vociRubrica } from '../modules/simulatore/report.js';

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
    const black = prova.parti.find((p) => p.id === 'testing').quesiti[0].consegne[0];
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
  const bb = prova.parti.find((p) => p.id === 'testing');
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

test('i cinque profili hanno solo punti e durate documentati (§1.2)', () => {
  assert.deepEqual(PROFILI.map((p) => p.id), [
    'prova-2025-11-05', 'fac-simile-2016-17', 'prova-2017-01-13', 'sintesi-utente-2017-2025', 'scheda-2026-27',
  ]);
  assert.deepEqual(DURATE_CONSENTITE_MINUTI, [75, 80, 120, 135]);
  const p2025 = getProfilo('prova-2025-11-05');
  assert.deepEqual(p2025.parti.map((p) => p.punti), [16, 3, 11]);
  assert.deepEqual(p2025.parti[0].slot.map((s) => s.punti), [5, 5, 2, 4]);
  assert.deepEqual(p2025.parti[2].slot.map((s) => s.punti), [3, 2, 2, 4]);
  assert.equal(p2025.sogliaSufficienza, 17);
  assert.equal(p2025.calcolaVoto, true);
  const fac = getProfilo('fac-simile-2016-17');
  assert.deepEqual(fac.parti.map((p) => p.punti), [13, 7, 10]);
  assert.equal(fac.parti[2].slot[0].punti, null);
  assert.equal(fac.calcolaVoto, false);
  const p2017 = getProfilo('prova-2017-01-13');
  assert.deepEqual(p2017.parti.map((p) => p.punti), [14, 6, 10]);
  assert.deepEqual(p2017.parti.map((p) => p.minuti), [70, 20, 30]);
  assert.equal(p2017.durataPredefinitaMinuti, 135);
  for (const parte of p2017.parti) for (const slot of parte.slot) assert.equal(slot.punti, null);
  const sintesi = getProfilo('sintesi-utente-2017-2025');
  assert.deepEqual(sintesi.parti.map((p) => p.puntiIntervallo), [[14, 16], [3, 5], [10, 11]]);
  assert.equal(sintesi.puntiTotali, null);
  assert.match(sintesi.fonte, /sintesi dell\u2019utente/);
  const scheda = getProfilo('scheda-2026-27');
  assert.equal(scheda.puntiTotali, null);
  assert.equal(scheda.calcolaVoto, false);
  assert.match(scheda.motivoVotoAssente, /140%/);
  assert.throws(() => getProfilo('inesistente'), RangeError);
  assert.equal(durataMsPerProfilo(p2025, 75), 75 * 60000);
  assert.throws(() => durataMsPerProfilo(p2025, 90), RangeError);
});

test('le prove degli altri profili non calcolano né totale né voto', () => {
  const sintesi = generaProva(graph.nodi, { seed: 2, profiloId: 'sintesi-utente-2017-2025' });
  assert.equal(sintesi.puntiTotali, null);
  assert.equal(sintesi.calcolaVoto, false);
  assert.ok(sintesi.parti.every((p) => p.quesiti.every((q) => q.puntiMax === null)));
  assert.deepEqual(sintesi.parti.map((p) => p.puntiIntervallo), [[14, 16], [3, 5], [10, 11]]);
  const scheda = generaProva(graph.nodi, { seed: 2, profiloId: 'scheda-2026-27' });
  assert.equal(scheda.puntiTotali, null);
  assert.match(scheda.motivoVotoAssente, /140%/);
  assert.ok(scheda.parti[0].mancanti.some((m) => m.id === 'package'));
  assert.equal(scheda.coperta, false);
  const p2017 = generaProva(graph.nodi, { seed: 2, profiloId: 'prova-2017-01-13', durataMinuti: 135 });
  assert.equal(p2017.durataMs, 135 * 60000);
  assert.ok(p2017.parti.every((p) => p.quesiti.every((q) => q.puntiMax === null)));
  const report = generaReport(p2017, {});
  assert.equal(report.calcolaVoto, false);
  assert.match(report.righeTesto.join(' '), /non sono riportati/);
  assert.ok(report.parti.every((p) => p.valutabile === false));
});

test('durata e modalità sono validate dal generatore', () => {
  assert.equal(generaProva(graph.nodi, { seed: 1, durataMinuti: 75 }).durataMs, 75 * 60000);
  assert.throws(() => generaProva(graph.nodi, { seed: 1, durataMinuti: 60 }), RangeError);
  assert.throws(() => generaProva(graph.nodi, { seed: 1, modalita: 'libera' }), RangeError);
  assert.equal(generaProva(graph.nodi, { seed: 1, modalita: 'allenamento' }).modalita, 'allenamento');
});

test('slot banca: servono insieme id nodo e prefisso tipo_esame (contratto 4.1, fixture X3)', () => {
  const bancaPattern = {
    nodoId: 'banca-esercizi-pattern-guerra',
    tipoEsame: 'Parte 1 Design 1.4: Decorator (prova 2022-06, sintesi dell\u2019utente)',
    testo: 'Scenario di prova.', soluzione: 'Soluzione di prova.',
  };
  const bancaTesting = {
    nodoId: 'banca-esercizi-bva-guerra',
    tipoEsame: 'Parte 2 Testing: classi di equivalenza e boundary (prova 2025-11, sintesi dell\u2019utente)',
    testo: 'Funzione di prova.', soluzione: 'Boundary di prova.',
  };
  const bancaTeoria = {
    nodoId: 'banca-domande-teoria-guerra',
    tipoEsame: 'Parte 3 Teoria: debugging (prova 2025-11, sintesi dell\u2019utente)',
    testo: 'Domanda di prova.', soluzione: 'Risposta di prova.',
  };
  assert.equal(riconosciBanca(bancaPattern), 'pattern');
  assert.equal(riconosciBanca(bancaTesting), 'testing');
  assert.equal(riconosciBanca(bancaTeoria), 'teoria');
  assert.equal(riconosciBanca({ ...bancaPattern, nodoId: 'design-pattern-decorator' }), null);
  assert.equal(riconosciBanca({ ...bancaPattern, tipoEsame: 'scritto: pattern 1.4 (prova 2022-06, sintesi dell\u2019utente)' }), null);
  assert.equal(riconosciBanca({ ...bancaTeoria, tipoEsame: 'Parte 3 Teoria: debugging' }), null);
  assert.equal(corrisponde('pattern', bancaPattern), true);
  assert.equal(corrisponde('testing', bancaTesting), true);
  assert.equal(corrisponde('teoria', bancaTeoria), true);
  const nodiBanca = [
    { id: 'banca-esercizi-pattern-guerra', title: 'Banca pattern', area: 2, tipo: 'tipo_esercizio', esercizi: [{ tipo_esame: bancaPattern.tipoEsame, testo: bancaPattern.testo, soluzione: bancaPattern.soluzione }] },
    { id: 'banca-esercizi-bva-guerra', title: 'Banca BVA', area: 3, tipo: 'tipo_esercizio', esercizi: [{ tipo_esame: bancaTesting.tipoEsame, testo: bancaTesting.testo, soluzione: bancaTesting.soluzione }] },
    { id: 'banca-domande-teoria-guerra', title: 'Banca teoria', area: 3, tipo: 'tipo_esercizio', esercizi: [{ tipo_esame: bancaTeoria.tipoEsame, testo: bancaTeoria.testo, soluzione: bancaTeoria.soluzione }] },
  ];
  const prova = generaProva(nodiBanca, { seed: 1, profiloId: 'scheda-2026-27' });
  assert.equal(prova.parti[0].quesiti.find((q) => q.slotId === 'pattern').consegne[0].nodoId, 'banca-esercizi-pattern-guerra');
  assert.equal(prova.parti[1].quesiti[0].consegne[0].nodoId, 'banca-esercizi-bva-guerra');
  assert.ok(prova.parti[2].quesiti.some((q) => q.consegne[0].nodoId === 'banca-domande-teoria-guerra'));
  assert.ok(prova.parti[0].mancanti.some((m) => m.id === 'package'));
});

test('esiti: registra e legge con chiave v1, tetto 500, JSON sporco scartato', () => {
  const storage = memoryStorage();
  assert.equal(CHIAVE_ESITI, 'ids-kg:esiti-simulatore:v1');
  assert.deepEqual(leggiEsiti(storage), []);
  const esito = {
    slot_id: 'design:classi', nodo_id: 'esercizio-class-diagram-da-testo', profilo: 'prova-2025-11-05',
    modalita: 'simulazione', punti: 4, punti_max: 5, ts: '2026-10-27T10:00:00.000Z',
  };
  assert.equal(registraEsito(storage, esito).length, 1);
  assert.deepEqual(leggiEsiti(storage), [esito]);
  assert.throws(() => registraEsito(storage, { ...esito, modalita: 'libera' }), TypeError);
  assert.throws(() => registraEsito(storage, { ...esito, punti: 9 }), TypeError);
  storage.setItem(CHIAVE_ESITI, '{');
  assert.deepEqual(leggiEsiti(storage), []);
  const pieno = memoryStorage();
  for (let i = 0; i < 505; i += 1) registraEsito(pieno, { ...esito, punti: i % 6 });
  assert.equal(leggiEsiti(pieno).length, 500);
});

test('sessione con profilo senza voto resta valida dopo salvataggio e ricarica', () => {
  const prova = generaProva(graph.nodi, { seed: 3, profiloId: 'scheda-2026-27', modalita: 'allenamento' });
  const s = creaSessione(prova, 1000);
  assert.equal(sessioneValida(s), true);
  const storage = memoryStorage();
  assert.equal(salvaSessione(storage, s), true);
  assert.equal(leggiSessione(storage).prova.profiloId, 'scheda-2026-27');
});

test('report per parte e rubrica: nessun punteggio calcolato dalla risposta', () => {
  const prova = generaProva(graph.nodi, { seed: 4 });
  const classi = prova.parti[0].quesiti.find((q) => q.slotId === 'classi');
  const reportPieno = generaReport(prova, { [classi.id]: classi.puntiMax });
  assert.equal(reportPieno.nodiDaRiaprire.some((n) => n.nodoId === classi.consegne[0].nodoId), false);
  const reportParziale = generaReport(prova, { [classi.id]: 1 });
  assert.ok(reportParziale.parti[0].nodiDaRiaprire.some((n) => n.nodoId === classi.consegne[0].nodoId));
  assert.ok(reportParziale.nodiDaRiaprire.length >= 1);
  assert.ok(vociRubrica(classi, 'design').length >= 3);
  assert.ok(vociRubrica({ slotId: 'bva' }, 'testing').some((v) => /Valori limite/.test(v)));
  assert.ok(vociRubrica({ slotId: 'teoria' }, 'teoria').some((v) => /Definizione/.test(v)));
});
