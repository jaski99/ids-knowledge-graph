# Simulatore d'esame — profili, slot, autovalutazione ed esiti

Il simulatore (`web/modules/simulatore/`) genera prove a struttura fissa in tre
parti — **Design / Testing / Teoria** — dai testi già presenti nel grafo
(`nodi[].esercizi`): non inventa consegne. Se uno slot non ha un esercizio
corrispondente, la prova lo dichiara vuoto («Dati insufficienti per…») e non
assegna i suoi punti. I punti li assegna sempre l'utente, con una rubrica:
**nessuna correzione automatica e nessun confronto per parole chiave**
(keyword matching) sulla risposta.

## Profili e fonti

I cinque profili sono quelli della tabella 1.2 di `docs/IMPROVEMENT_PLAN.md`,
con **solo** i punti e le durate lì documentati. Fonte visibile nell'interfaccia
per ogni profilo.

| Profilo (id) | Fonte | Durata predefinita | Design | Testing | Teoria | Voto |
|---|---|---|---|---|---|---|
| `prova-2025-11-05` | Prova del 5/11/2025 (`docs/EXAM_FORMAT.md`) | 2h | 16 pt (1.1 classi 5, 1.2 sequenza+attività+stati 5, 1.3 casi d'uso 2, 1.4 pattern 4) | 3 pt, 10 min (EC + BVA solo su `numero`) | 11 pt, 30 min (debugging 3, Simple Factory/`static` 2, white box e decision coverage 2, CFG + statement/decision coverage 4) | Sì: totale su 30, sufficienza oltre 17/30 |
| `fac-simile-2016-17` | Fac-simile 2016/17 (`docs/EXAM_FORMAT.md`) | 2h | 13 pt, ~1h (1.1 use case + classi 3, 1.2 sequenza 3, 1.3 attività 2, 1.4 pattern 5; soluzione ufficiale 1.4: Composite) | 7 pt, ~20 min | 10 pt, ~40 min; punti delle singole domande non documentati → slot senza punti | No |
| `prova-2017-01-13` | Prova 13/01/2017 [S6, Studocu, fonte terza] (`docs/research/R3-programma-unimore.md`) | 2h15 | 14 pt, 70 min | 6 pt, 20 min | 10 pt, 30 min | No: punti per singola consegna non riportati in R3, slot senza punti |
| `sintesi-utente-2017-2025` | Sintesi dell'utente 2017–2025 [D1 §1] (`docs/DATI_PROVE_GUERRA.md`), citata sempre come sintesi dell'utente | 2h (storiche: 1h15, 1h20, 2h o 2h15) | 14–16 pt (60–85 min) | 3–5 pt (10–20 min) | 10–11 pt (30 min) | No: intervalli senza totale; soglia riportata >17/30 oppure >18/20 a seconda dell'appello, nessuna soglia unica applicata |
| `scheda-2026-27` | Scheda 2026/27 [S1] (`docs/research/R3-programma-unimore.md`) | 2h | Esercizi di design con UML e pattern, senza punti documentati | Esercizi su una funzione, senza punti documentati | 3–4 domande aperte (il simulatore ne propone 3), senza punti documentati | **No**: pesi dichiarati 30%/55%/55% (somma 140%), non si calcola un voto; tesina individuale separata, non simulata qui |

Altri punti per diagramma della sintesi dell'utente [D1 §2] (Use Case sempre
1–2; Class Diagram sempre 4–6; Sequence quasi sempre 1–5; Activity quasi
sempre 2–3; State quasi sempre 1–2) restano nella fonte e non diventano punti
di slot: gli slot senza punti documentati restano senza punti.

### Durata

La durata è impostabile fra **1h15 e 2h15**, solo sui valori documentati da
D1: 75, 80, 120 o 135 minuti. Il valore scelto vale per la sessione; quello
predefinito è la durata del profilo.

## Slot ed esercizi

Gli slot si riconoscono per **id del nodo + prefisso di `tipo_esame`**
(contratto 4.1 del piano):

- `banca-esercizi-pattern-guerra` con prefisso `Parte 1 Design 1.4: <Pattern>`
  → slot pattern (Design);
- `banca-esercizi-bva-guerra` con prefisso `Parte 2 Testing: classi di
  equivalenza e boundary` → slot Testing;
- `banca-domande-teoria-guerra` con prefisso `Parte 3 Teoria: <tema>` →
  slot Teoria;

e `tipo_esame` deve terminare con ` (<fonte>)`. Devono coincidere entrambi
(id e prefisso): uno solo non basta. Finché le banche di X3 non sono su
`main`, i test usano una fixture con lo stesso formato
(`web/tests/simulatore.test.js`). Accanto alle banche, gli slot pescano dagli
esercizi esistenti dei nodi (classi, sequenza, attività, stati, casi d'uso,
pattern, debugging, Simple Factory, white box, CFG). Lo slot «Diagramma dei
package» del profilo scheda 2026/27 resta vuoto finché il nodo
`uml-diagramma-package` (worker X2) non è su `main`: è un buco dichiarato,
non un testo inventato. La 1.4 del fac-simile pesca preferibilmente
l'esercizio Composite, soluzione ufficiale di quel fac-simile.

## Modalità

- **Allenamento**: per ogni consegna la soluzione del grafo si può vedere
  solo dopo aver scritto un tentativo in quella risposta; il tempo è un
  riferimento e non chiude la prova.
- **Simulazione**: nessun materiale, timer attivo (si può mettere in pausa),
  soluzioni solo alla consegna, salva/riprendi automatico: le risposte sono
  salvate nel browser a ogni modifica e dopo un reload la prova si ritrova
  in pausa, nella pagina in cui era (svolgimento o correzione).

## Autovalutazione e report

Alla consegna ogni quesito mostra: la tua risposta, la soluzione del grafo,
una rubrica (checklist di criteri osservabili per parte: coerenza tra
diagrammi e molteplicità/direzione per il Design; classi valide/non valide e
valori limite sul parametro richiesto per il Testing; definizione, punti
chiave, esempio o limite per la Teoria) e — solo dove la fonte documenta i
punti dello slot — il campo punti (interi, 0–massimo). Il report per parte
mostra punti autovalutati/massimo valutabile, slot vuoti dichiarati e
«Riapri questi nodi»: i nodi delle voci sotto il massimo, con link alla
lezione. Per i profili senza voto il report lo dice e non produce totali su
30 né soglie applicate a numeri non documentati.

## Esiti (contratto 4.2)

`web/modules/simulatore/esiti.js` esporta `registraEsito(storage, esito)` e
`leggiEsiti(storage)` (X5 importa solo `leggiEsiti`). Chiave:
`ids-kg:esiti-simulatore:v1`; valore: array JSON di
`{slot_id, nodo_id, profilo, modalita, punti, punti_max, ts}` (ISO-8601),
al massimo 500 voci, le più vecchie scartate. Il pulsante «Salva gli esiti»
nella correzione registra una voce per consegna delle voci già autovalutate
con punti documentati. Le altre chiavi esistenti
(`ids-kg:completati:v1`, `ids-kg:ripasso:v1`, `ids-kg:simulatore:v1`,
`ids-kg:tema:v1`, `ids-kg:ultima-lezione:v1`) non sono rinominate.

## Moduli

| File | Ruolo |
|---|---|
| `profili.js` | Dati puri dei 5 profili (punti, durate, fonti, voto sì/no) |
| `slot.js` | Matcher degli slot: banche (id + prefisso) ed esercizi esistenti |
| `genera.js` | Generatore deterministico per seed, esteso a profili/durate/modalità |
| `esiti.js` | `registraEsito` / `leggiEsiti` (contratto 4.2) |
| `report.js` | Report per parte e voci di rubrica (niente keyword matching) |
| `punteggio.js`, `timer.js`, `sessione.js` | Autovalutazione, timer, persistenza (`ids-kg:simulatore:v1`) |
| `view.js`, `style.css` | Vista: selettori, timer, salva/riprendi, correzione |

## Limiti e dati mancanti

- Le banche di X3 non sono ancora su `main` in questo ramo: gli slot banca
  sono coperti da fixture nei test e si attivano da soli quando i nodi
  `banca-*` arrivano nel grafo. [da verificare] dopo il merge di X3.
- Il nodo `uml-diagramma-package` non è su `main`: slot package dichiarato
  vuoto nel profilo scheda 2026/27. non trovato nel grafo attuale.
- Le formule che la sintesi dell'utente marca «probabile» restano
  [da verificare] nella fonte D1 e non sono usate per calcolare punti.
- L'autovalutazione è una stima dell'utente con rubrica, non una correzione:
  il simulatore non promette un voto d'esame.

Verifica: `npm test --prefix web` e
`python -m pytest web/tests/test_e2e_simulatore.py -q` (Playwright).
