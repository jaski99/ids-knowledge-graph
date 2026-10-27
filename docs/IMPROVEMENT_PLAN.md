# Piano di miglioramento — Round 2 (sintesi R1, R2, R3)

> Scritto il 27/10/2026 dal coordinatore. Fonti: `docs/research/R1-competitor.md` (R1), `docs/research/R2-manuali-didattica.md` (R2), `docs/research/R3-programma-unimore.md` (R3, fonti S1–S6 e D1), `docs/DATI_PROVE_GUERRA.md` (D1, **sintesi dell'utente** su 13 prove 2017–2025: gli originali non sono disponibili), `docs/EXAM_FORMAT.md`, `docs/DIDATTICA.md`, `docs/CONTRACTS.md`.
>
> **Regola di base:** ciò che R3 marca **FATTO** si scrive come fatto citando la fonte (es. «[S1]»); i dati di D1 si citano sempre come «sintesi dell'utente»; le formule che D1 marca «probabile» o «mancante» restano **«da verificare»**; ciò che nessuna fonte riporta **non si inventa** (niente punteggi, durate, soglie, URL o preferenze del docente non documentati).

## 0. Cosa cambia e perché (sintesi)

1. **Provenienza e validità temporale** (R3 §2, P0): `docs/SYLLABUS.md` e `docs/CONTRACTS.md` non distinguono la scheda ufficiale 2026/27 [S1] (9 CFU, 108 h = 81 lezione + 27 laboratorio; titolare Francesco Guerra, docente Federica Rollo; scritto di 2 ore + **tesina individuale**; package diagram nominato; area AI-native da 1 CFU **ufficiale**; pesi dichiarati 30%/55%/55% che sommano 140%), la pagina del docente [S2], la prova del 13/01/2017 su Studocu [S6, fonte terza] e la sintesi dell'utente [D1]. Vanno tenuti separati, mai fusi.
2. **Lacune di programma** (R3 §3.3): manca `uml-diagramma-package`, manca un nodo sulla tesina individuale, mancano ADP/SDP/SAP come nodo (citati in D1 §4 ma solo nominati nella lezione Clean Architecture, R2), mancano Builder (D1: 2018-01-30 «Decorator/Builder»), commenti nel codice (D1: 2022-01) e analisi statica (D1: 2017-04) come nodi dedicati.
3. **Lacune d'esame** (R3 P1, R2 P0): le **13 funzioni** di D1 §3 non sono nel grafo come esercizi svolti; i pattern non hanno una banca di **scenari delle prove** in Java; le domande di teoria ricorrenti non hanno una banca con **risposta sintetica** d'esame.
4. **Correzioni didattiche** alle lezioni esistenti (R2 §3, tabella «Confronto del campione»): passo 0 delle classi di equivalenza, varianti BVA a 2/3 valori come scelta esplicita, granularità del CFG, completion problem sul metodo `a/b` della prova 2025, MC/DC con tre condizioni, Mermaid ≠ notazione UML standard, conteggio delle sottoclassi nel Decorator, avvisi «scenario ricostruito», Simple Factory con `enum`, formulazioni troppo assolute (refactoring, debugging, metriche).
5. **Simulatore** (R1 #2, R2 P2, R3 P1): oggi riproduce solo la prova del 5/11/2025; deve offrire **profili separati** con i soli punteggi documentati, durata da 1h15 a 2h15, autovalutazione con rubrica (mai correzione per parole chiave) e usare le nuove banche.
6. **Web app** (R1 #1, #3–#10): livelli di padronanza, percorsi per esame, ricerca estesa a esercizi e domande, export Anki TSV, backup JSON, PWA, accessibilità; **CI**: oggi `.github/workflows/pages.yml` esegue solo `pytest` senza Playwright, quindi gli e2e vengono saltati in CI e `node --test` non gira. Va corretto.

## 1. Priorità d'esame e mappatura programma → nodi

### 1.1 Ordine di studio richiesto dall'utente (D1 §6)

1. **Testing meccanico**: classi di equivalenza, BVA, CFG, statement/decision coverage.
2. **Class Diagram** (proprietà, operazioni, direzione, molteplicità).
3. **Pattern principali**: Decorator, Template Method, Observer, Factory (Simple Factory / metodo `static`), Strategy.
4. **Diagrammi dinamici**: sequenza, attività, stati, casi d'uso.
5. **Teoria ricorrente** con risposte sintetiche.
6. **Minori**: metriche, post-vendita, analisi statica, SOLID.

### 1.2 Pesi d'esame documentati (solo questi; nessun altro numero)

| Fonte | Durata | Design | Testing | Teoria | Note |
|---|---|---|---|---|---|
| Prova 5/11/2025 (`EXAM_FORMAT.md`) | 2 h | 16 pt, 60 min: 1.1 classi 5, 1.2 sequenza + attività + stati 5, 1.3 casi d'uso 2, 1.4 pattern (Observer) 4 | 3 pt, 10 min (EC + BVA solo su `numero`) | 11 pt, 30 min: debugging 3, Simple Factory/`static` 2, white box e decision coverage 2, CFG + statement/decision coverage 4 | sufficienza >17/30, nessun materiale |
| Fac-simile 2016/17 (`EXAM_FORMAT.md`) | 2 h | 13 pt, ~1 h: 1.1 use case + classi 3, 1.2 sequenza 3, 1.3 attività 2, 1.4 pattern 5 | 7 pt, ~20 min | 10 pt, ~40 min | soluzione ufficiale 1.4: Composite |
| Prova 13/01/2017 [S6, Studocu, fonte terza] | 2h15 | 14 pt, 70 min | 6 pt, 20 min | 10 pt, 30 min | punti per singola consegna non riportati in R3 |
| Sintesi dell'utente 2017–2025 [D1 §1] | 1h15, 1h20, 2 h o 2h15 | 14–16 pt (60–85 min) | 3–5 pt (10–20 min) | 10–11 pt (30 min) | soglia >17/30 oppure >18/20 a seconda dell'appello |
| Scheda 2026/27 [S1] | 2 h | esercizi di design con UML e pattern | esercizi su una funzione | 3–4 domande aperte | pesi 30%/55%/55% (somma 140%): **non calcolare** un voto; tesina separata |

Punti per diagramma nella sintesi dell'utente [D1 §2]: Use Case sempre 1–2; Class Diagram sempre 4–6; Sequence quasi sempre 1–5; Activity quasi sempre 2–3; State quasi sempre 1–2.

### 1.3 Frequenze nelle 13 prove (conteggi dalla tabella §5 di D1, sintesi dell'utente)

- **Testing black box a scaglioni**: 13/13. **Pattern 1.4**: Decorator 6 (2021-02, 2021-04, 2022-06, 2017-04, 2018-01-30, 2019-01), Template Method 4 (2023-01, 2017-01, 2018-01-09, 2019-02), Factory 2 (2020-11, 2022-01 «Strategy/Factory»), Observer 1 (2025), Strategy 1 (2022-01), Builder 1 (2018-01-30 «Decorator/Builder»).
- **Teoria** (prove con temi riportati): requisiti 6, white box 4 + MC/DC 1, debugging 3, Clean Architecture 3 + coesione 1, refactoring 2, Observer in Java 2, post-vendita/post-release 2; una volta: Simple Factory/`static`, ottimizzazione (Knuth), commenti, analisi statica, SOLID, metriche, ingegneria del software, implementazione, differenze black/white. Le prove 2021-02, 2021-04 e 2020-11 sono riportate «solo testing».
- In ogni testo prodotto in questo round le frequenze si scrivono come «N prove su 13 secondo la sintesi dell'utente», mai come statistica ufficiale.

### 1.4 Priorità dei nodi esistenti (applicate da X1 nei part; gli id non cambiano mai)

| Nodi | Priorità | Motivazione da scrivere |
|---|---|---|
| `classi-equivalenza`, `boundary-value-analysis`, `esercizio-black-box-scaglioni`, `grafo-flusso-controllo`, `criteri-copertura`, `esercizio-white-box-copertura`, `black-box-vs-white-box` | alta | testing 13/13 prove [D1]; BVA e path analysis nel programma [S1, S2] |
| `uml-diagramma-classi`, `uml-associazioni-molteplicita`, `esercizio-class-diagram-da-testo`, `esercizio-diagrammi-coerenti` | alta | class diagram «sempre, 4–6 pt» [D1]; 5 pt nel 5/11/2025 |
| `design-pattern-decorator`, `design-pattern-template-method`, `design-pattern-observer`, `design-pattern-simple-factory`, `design-pattern-strategy`, `riconoscere-pattern-scenario`, `esercizio-pattern-motivato-java` | alta | conteggi §1.3; Simple Factory/`static` in teoria 2025 |
| `uml-diagramma-sequenza`, `uml-diagramma-attivita`, `uml-diagramma-stati`, `uml-casi-uso`, `esercizio-use-case-da-testo` | alta | «quasi sempre» / «sempre» in D1 §2 |
| `debugging`, `requisiti-processo-specifica`, `esercizio-domanda-processo-requisiti`, `requisiti-costo-errori-boehm`, `clean-architecture-coesione-componenti`, `ottimizzazione-codice`, `refactoring`, `domanda-refactoring` | alta | teoria ricorrente §1.3 |
| `design-pattern-composite` | alta (invariata) | soluzione ufficiale del fac-simile 2016/17; compatibile con la prova 2017 [S6] |
| `design-pattern-factory-method`, `design-pattern-abstract-factory` | **media** (da alta) | nessuna prova di D1 li cita esplicitamente (R3 §3.3); restano nel programma «design pattern» |
| `metriche-software`, `metrica-complessita-ciclomatica`, `esercizio-domanda-metriche`, `principi-solid` | **media** (da alta) | D1: metriche «bassa», SOLID «media» (1 prova); restano nel programma [S1, S2] |
| area 5 (`llm-agenti-ciclo-vita`, …) | media (invariata) | **ufficiale nel catalogo 2026/27, 1 CFU [S1]**; nessuna prova storica la valuta: non attribuire frequenze |
| tutti gli altri | invariati | coerenti con programma e D1 |

### 1.5 Mappatura programma UNIMORE → nodi (dato in `graph/meta.json → programma`, proprietario X1)

Voci e CFU dalla scheda 2026/27 [S1]: Specifica dei requisiti 2,5 CFU (area 1); Progettazione 3,5 CFU (area 2); Implementazione e testing 1,5 CFU (area 3); Distribuzione e manutenzione 0,5 CFU (area 4); Ingegneria del software AI-native 1,0 CFU (area 5). Ogni voce elenca gli id dei nodi che la coprono e la parte d'esame (Design / Testing / Teoria / Tesina / —). `scripts/gen_docs.py` (esteso da X1) genera **`docs/NODES.md`**: tabella id, titolo, area, voce di programma, parte d'esame, frequenza (§1.3, se presente), priorità; più una sezione automatica «nodi non mappati». X1 mappa solo i nodi su `main`; i nodi nuovi di §2 li mappa l'integrazione (I-3).

## 2. Nuovi nodi (contratto: id, area, file part, tipo, priorità, prerequisiti). Gli id sono definitivi.

Regola anti-collisione: i nodi nuovi stanno in **file part nuovi** `graph/parts/area-N-<suffisso>.json` (ammessi da `test_parts_naming_and_area`, modificato nel commit di questo piano), i prerequisiti puntano **solo a nodi già su `main`** (o dello stesso ramo), le lezioni in `graph/lezioni/<id>.json`. Gli archi da nodi esistenti o di un altro worker verso i nodi nuovi li aggiunge l'integrazione (§6, I-2). Prima di creare un nodo il worker verifica che nessun nodo esistente copra già lo stesso argomento (niente duplicati).

| id | area | file part | tipo | priorità | prerequisiti hard | prerequisiti soft | worker |
|---|---|---|---|---|---|---|---|
| `uml-diagramma-package` | 2 | `area-2-r2.json` | abilita | media | `uml-diagramma-classi` | `decomposizione-funzionale`, `coesione-accoppiamento` | X2 |
| `esercizio-tesina-individuale` | 2 | `area-2-r2.json` | tipo_esercizio | alta | `requisiti-processo-specifica`, `esercizio-class-diagram-da-testo`, `esercizio-pattern-motivato-java` | `uml-diagramma-package`, `uml-diagramma-sequenza`, `uml-diagramma-attivita` | X2 |
| `clean-architecture-accoppiamento-componenti` | 2 | `area-2-r2.json` | concetto | media | `clean-architecture-coesione-componenti` | `coesione-accoppiamento`, `metriche-software` | X2 |
| `design-pattern-builder` | 2 | `area-2-r2.json` | abilita | bassa | `design-pattern-introduzione` | `design-pattern-simple-factory`, `design-pattern-decorator` | X2 |
| `commenti-codice` | 3 | `area-3-r2.json` | concetto | media | `buone-pratiche-programmazione` | `refactoring` | X2 |
| `analisi-statica` | 3 | `area-3-r2.json` | concetto | bassa | `ispezione-codice` | `code-smell`, `metrica-complessita-ciclomatica` | X2 |
| `banca-esercizi-bva-guerra` | 3 | `area-3-banche.json` | tipo_esercizio | alta | `classi-equivalenza`, `boundary-value-analysis` | `esercizio-black-box-scaglioni` | X3 |
| `banca-esercizi-pattern-guerra` | 2 | `area-2-banche.json` | tipo_esercizio | alta | `design-pattern-decorator`, `design-pattern-template-method`, `design-pattern-observer`, `design-pattern-simple-factory`, `design-pattern-strategy` | `riconoscere-pattern-scenario`, `esercizio-pattern-motivato-java`, `uml-diagramma-classi` | X3 |
| `banca-domande-teoria-guerra` | 3 | `area-3-banche.json` | tipo_esercizio | alta | `debugging`, `criteri-copertura`, `clean-architecture-coesione-componenti`, `requisiti-processo-specifica` | `refactoring`, `ottimizzazione-codice`, `requisiti-costo-errori-boehm`, `design-pattern-observer`, `design-pattern-simple-factory`, `principi-solid`, `metriche-software`, `black-box-vs-white-box`, `ispezione-codice`, `tipi-manutenzione` | X3 |

Ogni lezione nuova segue lo schema lezione v3 di `docs/CONTRACTS.md`, che corrisponde al modello os-taxonomy richiesto dall'utente: `intuizione` (prima l'intuizione), `spiegazione` (completa, a blocchi, ≥ 1 blocco ```java o ```mermaid), `esempi_svolti` (≥ 2 per abilita/tipo_esercizio, passi numerati, risultato verificabile), `analogia` (con il punto in cui smette di valere), `collegamenti_prior` (prerequisiti richiamati in una riga, `nodo` solo verso id esistenti), `errori_comuni`, `domande_autoverifica` (≥ 3, risposte complete), `riepilogo` (≤ 5 righe); più `checklist_ripasso` e `esercizi` nel part. Ordine e regole di `docs/DIDATTICA.md` (perché ti serve con «N prove su 13 secondo la sintesi dell'utente», scenario fil rouge dalle prove, fading esempio → completamento → esercizio autonomo).

## 3. Worker, scope esclusivo, ramo

Ogni chat Arena pusha **solo sul proprio ramo di sessione** `arena/<id>-ids-knowledge-graph` (mai su `main`, non apre né mergia PR). Il coordinatore apre la PR e fa il merge. **Nessun file compare in due scope.**

| Worker | Nome | Scope esclusivo (solo questi file) | Dipende da |
|---|---|---|---|
| **X1** | Programma, priorità, NODES | `docs/SYLLABUS.md`, `docs/EXAM_FORMAT.md`, `docs/STATUS.md`, `docs/CONTRACTS.md`, `docs/ARENA_PLAN.md`, `docs/TAXONOMY_NOTES.md`, `README.md`, `graph/meta.json`, `graph/parts/area-1.json`, `area-2.json`, `area-3.json`, `area-4.json`, `area-5.json` (solo nodi esistenti: `priorita`, `checklist_ripasso`, `riferimenti_testo`; non `prerequisiti` né id), `schema/node.schema.json` (solo descrizioni), `scripts/gen_docs.py` (generatore di `docs/NODES.md`), `scripts/check_urls.py` (solo documentazione), `tests/test_graph.py`, `tests/test_gen_docs.py`, nuovo `tests/test_programma.py` | — |
| **X2** | Nuovi nodi di programma | `graph/parts/area-2-r2.json`, `graph/parts/area-3-r2.json`, `graph/lezioni/{uml-diagramma-package,esercizio-tesina-individuale,clean-architecture-accoppiamento-componenti,design-pattern-builder,commenti-codice,analisi-statica}.json`, nuovo `tests/test_nodi_r2.py` | — |
| **X3** | Banche per le lacune d'esame | `graph/parts/area-2-banche.json`, `graph/parts/area-3-banche.json`, `graph/lezioni/banca-*.json`, nuovo `tests/test_banche.py` | contratto §4.1 |
| **X4** | Correzione lezioni esistenti | `graph/lezioni/<75 id esistenti>.json` (tutti i file presenti su `main` al 77883d9), `tests/test_lezioni.py`, nuovo `tests/test_lezioni_correzioni.py` | — |
| **X5** | Web app e CI | tutto `web/**` **tranne** `web/modules/simulatore/**`, `web/tests/simulatore.test.js`, `web/tests/test_e2e_simulatore.py`; più `docs/screens/**`, `.github/workflows/pages.yml`, `requirements.txt` | contratti §4.2, §4.3 |
| **X6** | Simulatore d'esame | `web/modules/simulatore/**`, `web/tests/simulatore.test.js`, `web/tests/test_e2e_simulatore.py`, nuovo `docs/SIMULATORE.md` | contratti §4.1, §4.2 |

**Sola lettura per tutti:** `docs/DATI_PROVE_GUERRA.md`, `docs/DIDATTICA.md`, `docs/research/**`, `docs/IMPROVEMENT_PLAN.md`, `scripts/kg.py`, `scripts/topo.py`, `tests/conftest.py`.

**File generati / condivisi** (`graph/graph.json`, `docs/NODES.md`, `docs/PIANO_STUDIO.md`, `docs/CHECKLIST_RIPASSO.md`; `web/graph.json` non è versionato): **non sono di proprietà di nessun worker**. Ogni worker li rigenera sul proprio ramo solo per avere i test verdi (`python scripts/kg.py build && python scripts/gen_docs.py && sh web/build.sh`); in integrazione il coordinatore risolve ogni conflitto su questi file **rigenerandoli dagli script** su `main` aggiornato, mai a mano.

### X1 — Programma, priorità, NODES (R3 P0, P2; R1 #10)
- `SYLLABUS.md` riscritto con quattro sezioni separate e citate: scheda 2026/27 [S1] (carico 81 + 27 h, CFU per voce §1.5, titolare/docente, scritto di 2 ore + tesina individuale, package diagram, AI-native ufficiale, pesi 30/55/55 segnalati come **incoerenti**, slide via Dolly), pagina docente [S2], prova 13/01/2017 [S6, fonte terza], sintesi dell'utente [D1]. Tabella FATTO / DATO DELL'UTENTE / NON TROVATO (R3 §3.4). Discrepanza bibliografica: la scheda 2026/27 elenca Tsui *Software Engineering* 3ª ed. e HFDP 2014, `CONTRACTS.md` Tsui 5ª ed. 2022 e HFDP 2ª ed. 2020 e Miles: annotare entrambe, **non sostituire** le chiavi `testi` (R3 §5).
- `EXAM_FORMAT.md` diventa **registro delle versioni** con la tabella §1.2 (senza fondere i formati) e il dettaglio di ogni prova già presente; `STATUS.md` aggiornato al round 2; `README.md` con link al piano; `ARENA_PLAN.md` rimanda a questo piano.
- `meta.json`: `corso.docente` secondo [S1] (titolare e docente distinti), `fonte_programma` = URL di [S1] (pagina docente [S2] come seconda fonte in `nota`), `nota_esame` riscritta con le fonti separate, `trappole` invariate nel contenuto ma con `fonte` «sintesi dell'utente» dove pertinente; nuova chiave `programma` (§1.5).
- Part area 1–5: priorità e motivazioni della tabella §1.4 (motivazione con «[D1]», «[S1]», «[S2]»).
- `scripts/gen_docs.py`: nuova funzione pura `nodes_md(g)` per `docs/NODES.md` (§1.5), stesso commento d'origine «generato da scripts/gen_docs.py»; `test_gen_docs.py` verifica che `NODES.md` sia aggiornato.
- `CONTRACTS.md`: part `area-N-<suffisso>.json`, worker X1–X6, banche §4.1, esiti §4.2, nota sui testi, area 5 «ufficiale nel catalogo 2026/27 [S1]».
- `tests/test_programma.py`: SYLLABUS contiene «INF-36», «2026/27», «tesina», «package», «140%» o «30%»/«55%» con avviso; nessuna voce `programma` punta a id inesistenti; priorità di §1.4 rispettate; ogni id di area 1–5 su `main` mappato a una voce.

### X2 — Nuovi nodi di programma (R3 P0; R2 P1 Clean Architecture; D1 §4–5)
- I 6 nodi X2 di §2 con lezione v3 completa. `uml-diagramma-package`: notazione, dipendenze, `«import»`/`«access»`, distinzione da componenti/deployment, esercizio «dipendenze tra package su un caso testuale» (Farmacia), mermaid valido.
- `esercizio-tesina-individuale`: **solo** ciò che dice [S1] (prodotto software, requisiti, diagrammi UML, revisione del progetto con pattern, criteri della scheda); niente scadenze, pagine o pesi non riportati in R3: se servono, scrivere «da verificare sulla scheda [S1]».
- `clean-architecture-accoppiamento-componenti`: ADP, SDP, SAP, instabilità I = Ce/(Ca+Ce), astrattezza, sequenza principale; Martin è riferimento **extra** (chiave `MARTIN`).
- `design-pattern-builder`, `commenti-codice` (quando commentare, classificazione), `analisi-statica` (differenza da ispezione e da testing): esempi Java originali; per Builder lo scenario studio dentistico della sintesi dell'utente, marcato «ricostruito».
- `tests/test_nodi_r2.py`: 6 nodi presenti con lezione, campi minimi, mermaid valido, nessun prerequisito verso id non su `main`, accenti, nessun punteggio non in §1.2.

### X3 — Banche per le lacune d'esame (R3 P1; R2 P0; D1 §3–§5)
- `banca-esercizi-bva-guerra`: **13 esercizi** in `esercizi` (uno per funzione di D1 §3, stesso ordine e stessa firma) e **13 esempi svolti** in `lezione.esempi_svolti` «trova classi di equivalenza e boundary», ciascuno con passi: (0) precondizioni, unità e parametro principale; (1) classi valide per fascia; (2) classi non valide (oltre il limite non gestito; valori negativi solo come «assunzione per esercitarsi»); (3) valori limite = esattamente quelli di D1 (es. 50, 51, 150, 151, 500, 501) o, dove D1 non li dà (`computeCarSharingFee`), derivati dalla regola e marcati «derivati»; (4) tabella dei test minimi con output atteso calcolato **solo** con formule certe; (5) verifica. Formule «probabile» o «mancante» (`costoPulizia` 151–500, `costoconsegna` 2001–5000) marcate «[da verificare]». Fonte di ogni esercizio: «prova AAAA-MM, sintesi dell'utente».
- `banca-esercizi-pattern-guerra`: worked example **in Java** per Decorator (piazzole con corrente, aule con microfoni, postazioni con monitor, consegne delicate), Template Method (ordini con imballaggio speciale, controllo auto, riparazione), Observer (mailing list promozioni Farmacia 2025), Factory (cioccolatini «cioba» standard/bianco/mini), Strategy (resistenza in 3 modalità): scenario come in D1 §2 marcato «scenario ricostruito dalla sintesi dell'utente», motivazione (principio SOLID soddisfatto, alternativa scartata), limiti, class diagram mermaid, classi Java minime e compilabili.
- `banca-domande-teoria-guerra`: una domanda per ogni tema di §1.3 (Knuth e ottimizzazione prematura; Boehm e costo del cambiamento/errori nei requisiti; REP/CCP/CRP; debugging e fasi; white box, statement/decision/MC/DC; Simple Factory e `static`; Observer in Java; requisiti; refactoring; commenti; post-vendita; analisi statica; SOLID; metriche; differenze black/white) con **risposta sintetica d'esame** (3–6 righe, dalle «Risposte sintetiche» di D1 §4 dove presenti) e punti solo se in §1.2.
- `tests/test_banche.py`: 13 firme di D1 presenti; boundary di D1 presenti nella soluzione; «[da verificare]» sulle formule incerte; formato `tipo_esame` di §4.1; ogni blocco ```java con graffe bilanciate e una `class`/`interface`; nessun punteggio fuori §1.2.

### X4 — Correzione lezioni esistenti (R2 §3 e §4)
- **Testing**: `classi-equivalenza` passo 0 (specificato / assunto / non decidibile); `boundary-value-analysis` schemi a 2 e 3 valori affiancati come «scelta di studio», dominio e ε dichiarati, deduplicazione tra soglie adiacenti; `grafo-flusso-controllo` granularità dichiarata (blocchi vs istruzioni) con stesso V(G); `criteri-copertura` MC/DC con tre condizioni e operatori misti, short-circuit; `esercizio-white-box-copertura`: **metodo `a/b` della prova 2025** (`if(a<0) a=b; a=a+b; while(a<0){ if(b%2==0) b=b/2; a+=3; } return a;`) con CFG, tabella da completare (input, cammino, esiti T/F di `a<0`, `a<0` nel while, `b%2==0`, output), test minimi per statement e decision coverage; ogni traccia verificata eseguendo il codice in un test.
- **UML**: `uml-diagramma-classi` e `uml-casi-uso` tabella «Mermaid semplificato → notazione a mano»; `uml-associazioni-molteplicita` due esercizi (leggi / disegna); `uml-diagramma-sequenza` consegna senza lifeline predefinite; `uml-diagramma-attivita` versione sequenziale come base, fork solo se il parallelismo è specificato; `uml-diagramma-stati` transizioni dal testo vs ipotetiche; `esercizio-diagrammi-coerenti` «criterio operativo per questa consegna»; varianti Piscina, Mercato, Rider, riparazioni, noleggio in `esercizio-class-diagram-da-testo` senza attributi inventati (R3 P2).
- **Pattern**: `design-pattern-decorator` «fino a 16 sottoclassi di combinazione»; `design-pattern-template-method` avviso «scenario ricostruito»; `design-pattern-observer` core d'esame separato da JDK (`java.util.Observable` deprecato, listener, `PropertyChangeListener`); `design-pattern-simple-factory` prima versione con `enum` ed eccezione, `null` solo da diagnosticare; `design-pattern-factory-method` ponte dal frammento `static`; `design-pattern-composite` schema minimo da esame; `riconoscere-pattern-scenario` domande «quale variabilità? chi decide? uno o molti?».
- **Teoria**: `principi-solid` tabella sintomo → principio → correzione; `clean-architecture-coesione-componenti` «qui solo REP/CCP/CRP», rimando testuale ad ADP/SDP/SAP; `debugging` prerequisiti della bisezione; `requisiti-processo-specifica` «schema didattico, non template normativo»; `metriche-software` «da ricordare» vs appendice; `refactoring` formulazione non assoluta. In ogni lezione «perché ti serve» con le frequenze di §1.3 (sintesi dell'utente).
- `tests/test_lezioni_correzioni.py`: un'asserzione per correzione (es. il metodo `a/b` eseguito dà gli output dichiarati; il Decorator non contiene più «16 classi» senza «combinazione»).

### X5 — Web app e CI (R1 #1, #3–#10)
In ordine: (1) **CI**: in `pages.yml` aggiungere `npm test --prefix web` e Playwright (`pip install playwright && python -m playwright install --with-deps chromium`) prima di `pytest -q`, così gli e2e girano in CI con 0 skipped; correggere i 3 e2e di `test_e2e_screens.py` che falliscono sul `main` attuale (canvas del grafo 0×0, §7); (2) **padronanza** `web/js/core/mastery.js` (non iniziato / studiato / richiamo corretto / padronanza provvisoria) da completati, ripasso SM-2 e `leggiEsiti` (§4.2); (3) **percorsi per esame** «Testing meccanico», «Class Diagram», «Pattern», «Diagrammi dinamici», «Teoria» nell'ordine di §1.1, derivati da priorità e mappatura (§1.5) senza id cablati; (4) esercizi dei nodi banca nella lezione con soluzione nascosta fino al tentativo; (5) ricerca estesa a esercizi, domande, errori comuni, codice; (6) grafo: legenda hard/soft, filtri «da fare ora», «sbagliati», «alta priorità»; (7) ripasso da risposte tentate, data d'esame facoltativa, interleaving; (8) backup/import JSON ed export Anki TSV; (9) PWA (manifest + service worker versionato); (10) accessibilità da tastiera. Nessuna costante 75 nodi o 5 aree. Test node per ogni modulo nuovo + e2e Playwright 390×844 e 1440×900.

### X6 — Simulatore d'esame (R1 #2; R2 P2; R3 P1)
- `profili.js`: i 5 profili di §1.2 con **solo** i punti e le durate documentati; dove i punti mancano lo slot non ha punti; il profilo D1 mostra gli intervalli e non calcola il totale; il profilo [S1] non calcola un voto e lo spiega. Durata impostabile fra 1h15 e 2h15 (valori di D1). Fonte visibile per ogni profilo.
- Struttura fissa in 3 parti Design / Testing / Teoria; slot pescati dalle banche (§4.1) e dagli esercizi esistenti; slot senza esercizio dichiarato come buco, mai inventato; modalità **allenamento** (soluzione dopo il tentativo) e **simulazione** (soluzioni solo alla consegna, timer, salva/riprendi, nessun materiale); autovalutazione con rubrica e checklist, **mai** keyword matching; report per parte con «Riapri questi nodi»; esiti salvati con §4.2.
- Correggere `test_e2e_simulatore.py` che oggi fallisce sul `main` (dopo `reload` non trova `textarea.sim-input`). `docs/SIMULATORE.md` documenta profili e fonti. Test node per ogni modulo + e2e.

## 4. Contratti tra moduli

### 4.1 Esercizi dei nodi banca (scritti da X3, letti da X6 e X5)
- Formato invariato dello schema: `{tipo_esame, testo, soluzione}`. `tipo_esame` inizia **esattamente** con `Parte 1 Design 1.4: <Pattern>`, `Parte 2 Testing: classi di equivalenza e boundary` o `Parte 3 Teoria: <tema>`, e termina con ` (<fonte>)`, es. ` (prova 2025-11, sintesi dell'utente)`. I dati incerti contengono «[da verificare]» nel `testo`.
- X6 riconosce gli slot per **id del nodo** + prefisso di `tipo_esame`; finché X3 non è su `main` usa una fixture nei test con lo stesso formato.

### 4.2 Esiti del simulatore (scritti da X6, letti da X5)
- Chiave `localStorage`: `ids-kg:esiti-simulatore:v1`. Valore: array JSON di `{ "slot_id": string, "nodo_id": string, "profilo": string, "modalita": "allenamento"|"simulazione", "punti": number|null, "punti_max": number|null, "ts": ISO-8601 }`, al massimo 500 voci (le più vecchie scartate).
- X6 esporta da `web/modules/simulatore/esiti.js` `registraEsito(storage, esito)` e `leggiEsiti(storage)`; X5 importa **solo** `leggiEsiti` (unica dipendenza X5 → X6) e nei test usa un doppio con lo stesso formato. Le chiavi esistenti (`ids-kg:completati:v1`, `ids-kg:ripasso:v1`, `ids-kg:simulatore:v1`, `ids-kg:tema:v1`, `ids-kg:ultima-lezione:v1`) non si rinominano.

### 4.3 Grafo
- `graph/graph.json` resta la fonte unica generata da `scripts/kg.py build`; schema nodo e lezione invariati in questo round (X1 aggiorna solo descrizioni). La chiave `programma` di `meta.json` è facoltativa per la web app. La web app non dipende dal numero di aree o di nodi.

## 5. Regole di qualità e di revisione (tutti)
- **SOLID**, moduli piccoli e coesi (funzioni pure in `core`, viste in `ui`, composizione in `main.js`), basso accoppiamento, dipendenze iniettate, aperto/chiuso, **test per ogni modulo**, nomi coerenti, nessun codice morto, nessun refactor fuori scope.
- **Italiano con accenti corretti** (è, perché, più, già, può, così, qualità, attività); nei JSON niente apostrofi al posto degli accenti («e'» e «perche'» sono errori).
- **Mai inventare** fatti attribuiti al docente, numeri, punteggi, durate, soglie o URL: solo §1.2 per i punteggi; ogni risorsa nuova aperta e verificata (`python scripts/check_urls.py`); niente nodi duplicati (controllare titoli e id simili prima di crearne uno).
- **Test**: prima del push `python scripts/kg.py build && python scripts/gen_docs.py && sh web/build.sh`, poi `python scripts/kg.py check`, `python scripts/gen_docs.py check`, `npm test --prefix web`, `pytest -q` con Playwright installato: **0 failed, 0 skipped**. Vietati `--ignore`, `-k 'not e2e'`, `skip`/`skipif`/`xfail` nuovi, `KG_ALLOW_TODO=1`, test indeboliti o cancellati per farli passare. Gli e2e restano nella suite e in CI.
- **CI** del ramo verde. **Report finale**: cosa è stato fatto, SHA dell'ultimo commit, URL del ramo, numero di test passati/saltati (pytest e node), limiti residui.
- **Revisione del coordinatore** (checklist per ogni PR): scope rispettato (`git diff --name-only main...` solo nei file del worker + file generati), suite completa locale 0 skipped, CI verde, accenti, nessun punteggio fuori §1.2, nessun id duplicato o rinominato, mermaid valido, fonti citate, QA visivo 390×844 e 1440×900 per X5 e X6.

## 6. Ordine di merge e integrazione (coordinatore)

Ondata 1 in parallelo: X1, X2, X3, X4, X5, X6. Merge su `main` nell'ordine:

1. **X1** (programma, priorità, NODES, contratti)
2. **X4** (lezioni esistenti corrette, coerenti con X1)
3. **X2** (nuovi nodi di programma)
4. **X3** (banche: 13 funzioni, pattern, teoria)
5. **X6** (simulatore; legge le banche di X3)
6. **X5** (web app + CI con e2e; usa `leggiEsiti` di X6)
7. **Integrazione I** (coordinatore): I-1 dopo ogni merge `python scripts/kg.py build && python scripts/gen_docs.py && sh web/build.sh`, conflitti sui file generati risolti rigenerando; I-2 archi: `esercizio-diagrammi-coerenti` soft `uml-diagramma-package`; `banca-domande-teoria-guerra` soft `commenti-codice`, `analisi-statica`, `clean-architecture-accoppiamento-componenti`; `banca-esercizi-pattern-guerra` soft `design-pattern-builder`; I-3 aggiungere i 9 nodi nuovi a `meta.json → programma` e rigenerare `docs/NODES.md`, `PIANO_STUDIO.md`, `CHECKLIST_RIPASSO.md`; I-4 suite completa (pytest + node --test + Playwright, 0 skipped), CI Pages verde, QA da utente sul sito pubblicato (telefono e desktop).

Dopo ogni merge: CI verde su `main` prima del merge successivo. Rotazione di una chat a ~10 messaggi o se ripete errori.

## 7. Modifiche abilitanti già fatte nel commit di questo piano (ondata 0, coordinatore)
- `tests/test_graph.py::test_parts_naming_and_area`: ammessi i nomi `area-N.json` e `area-N-<suffisso>.json` (servono a X2 e X3; nessun altro cambiamento).
- Stato della suite su `main` 77883d9 prima di questo piano: `npm test` 81/81; `pytest -q` senza Playwright verde (come la CI, che salta gli e2e); con Playwright installato 19 e2e passano e **5 falliscono già su `main`**: `test_e2e_screens.py::test_schermate[mobile]`, `[desktop]` e `test_niente_scroll_orizzontale_a_360` (attesa di `#cy canvas` visibile: il canvas del grafo resta 0×0) → **X5**; `test_e2e_simulatore.py::test_simulatore_svolgimento_pausa_correzione[mobile]` e `[desktop]` (dopo `reload` non compare `textarea.sim-input`) → **X6**. Vanno corretti nel codice o nel test con motivazione, mai saltati.
