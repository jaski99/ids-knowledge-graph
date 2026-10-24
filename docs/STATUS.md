# STATUS — 24/10/2026 (Fase 1)

## Fatto
- Reverse engineering di os-taxonomy → `docs/TAXONOMY_NOTES.md`.
- Contratti e schema: `docs/CONTRACTS.md`, `schema/node.schema.json`.
- Programma ufficiale (sito docente) → `docs/SYLLABUS.md`; testi di riferimento mappati sulle aree.
- Schema v2: prerequisiti `{id, forza, motivo}`, esercizi svolti `{tipo_esame, testo, soluzione}`, `checklist_ripasso` opzionale.
- Pipeline: `graph/meta.json` + `graph/parts/area-N.json` → `python scripts/kg.py build` → `graph/graph.json`. 5 nodi seed (aree 1-3) nei part, risorse verificate (HTTP 200).
- `scripts/kg.py` (libreria), `scripts/topo.py`, `scripts/check_urls.py`; 18 test pytest verdi.

## Mancante / aperto
- Formato d'esame sconosciuto (non trovato; l'utente non lo conosce ancora): priorità motivate da programma + testi. Da aggiornare appena noto.
- Aree 4 e 5 senza nodi.

## Rami proposti (indipendenti, ognuno tocca solo i propri nodi)
| ramo | contenuto | note |
|---|---|---|
| `feat/contenuti-a` | aree 1-2: requisiti, casi d'uso, SRS, architettura e stili, decomposizione funzionale, ORM/JPA/Hibernate, qualità e metriche, coesione/accoppiamento, UML (classi, sequenza, attività, stati), design pattern GoF principali | scrive solo `graph/parts/area-1.json`, `area-2.json`; riusa seed `requisiti-obiettivi`, `uml-casi-uso`, `coesione-accoppiamento`, `design-pattern-introduzione` |
| `feat/contenuti-b` | aree 3-5: best practice, refactoring, testing/ispezione, path analysis, BVA, JUnit, programmazione difensiva, Maven, Git, configuration management, post-produzione, licenze, IdS AI-native | scrive solo `graph/parts/area-3..5.json`; può dipendere da id di area 1-2 già su main |
| `feat/webapp` | sito statico in italiano che legge `graph/graph.json` (grafo, filtro per area/tipo/priorità, ordine topologico, spunta esercizi in localStorage) | solo `web/`; legge `graph/graph.json`, non lo modifica |

Ordine di merge suggerito: contenuti-a → contenuti-b → webapp (la webapp può partire subito sui seed).

## Comandi
```
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/kg.py build
.venv/bin/pytest -q
cd scripts && ../.venv/bin/python topo.py && ../.venv/bin/python check_urls.py
```

## Fase 3 — 24/10/2026
- Prerequisiti cross-area aggiunti (testing/refactoring → progettazione, debugging → testing, area 4-5 → testing/refactoring/requisiti), nessun ciclo.
- Motivazioni di priorità riscritte sulle prove reali (2016/17, 9/6/2022, 27/1/2023, 5/11/2025); `nota_esame` e `trappole` in `meta.json`.
- Chiave testo `MARTIN` (Clean Architecture, extra, non del prof) usata in `clean-architecture-coesione-componenti`.
- Ordine topologico: a parità di vincoli priorità alta prima (Python e web app identici, testato).
- `scripts/gen_docs.py` → `docs/PIANO_STUDIO.md`, `docs/CHECKLIST_RIPASSO.md` (test di aggiornamento).
- UX da test Playwright 390x844 e 1280x800: pannelli compatti su mobile, layout grafo orientato al contenitore, nota esame richiudibile, trappole nella vista Ripasso.

## Fase 4 — 24/10/2026: lezioni complete (schema v3)
- Obiettivo: imparare tutto dal grafo senza aprire i libri. Ogni nodo riceve una `lezione` (vedi CONTRACTS.md).
- Lezioni in `graph/lezioni/<id>.json` (un file per nodo → nessun conflitto tra rami); `kg.py build` le fonde nei nodi.
- Pilota (modello di qualità): `esercizio-black-box-scaglioni`, `design-pattern-observer`.
- Web app: vista **Lezione** a pagina intera (`#/lezione/<id>`): markdown (marked + DOMPurify), mermaid, codice evidenziato (highlight.js), passi degli esempi svelati uno alla volta, autoverifica con risposte nascoste, Precedente/Successivo secondo il percorso. Test node + e2e Playwright (390x844, 1280x800) in `web/tests/test_e2e_lesson.py` (saltato se Playwright manca).
- `tests/test_lezioni.py::test_lezioni_complete` **fallisce finché ci sono nodi senza lezione** (73): usare `KG_ALLOW_TODO=1 pytest -q` durante la stesura.

### Rami contenuti proposti (bilanciati: 24 / 24 / 25 nodi; ognuno crea solo i propri `graph/lezioni/<id>.json`)
| ramo | tema | file da creare |
|---|---|---|
| `feat/lezioni-a` | requisiti, UML, architettura, qualità (aree 1-2) | `graph/lezioni/<id>.json` per: `casi-uso-descrizione-testuale`, `esercizio-domanda-processo-requisiti`, `esercizio-use-case-da-testo`, `requisiti-costo-errori-boehm`, `requisiti-input-stakeholder`, `requisiti-obiettivi`, `requisiti-processo-specifica`, `requisiti-scrittura-verificabile`, `uml-casi-uso`, `decomposizione-funzionale`, `esercizio-class-diagram-da-testo`, `esercizio-diagrammi-coerenti`, `progettazione-obiettivi-livelli`, `stili-architetturali`, `uml-associazioni-molteplicita`, `uml-componenti-deployment`, `uml-diagramma-attivita`, `uml-diagramma-classi`, `uml-diagramma-sequenza`, `uml-diagramma-stati`, `coesione-accoppiamento`, `qualita-progettazione`, `clean-architecture-coesione-componenti`, `orm-object-relational-mapping` |
| `feat/lezioni-b` | design pattern, SOLID, metriche, code smell e refactoring (aree 2-3) | `graph/lezioni/<id>.json` per: `design-pattern-introduzione`, `design-pattern-simple-factory`, `design-pattern-factory-method`, `design-pattern-abstract-factory`, `design-pattern-singleton`, `design-pattern-adapter`, `design-pattern-composite`, `design-pattern-decorator`, `design-pattern-state`, `design-pattern-strategy`, `design-pattern-template-method`, `riconoscere-pattern-scenario`, `esercizio-pattern-motivato-java`, `esercizio-riconosci-pattern-dal-codice`, `principi-solid`, `metriche-software`, `metrica-complessita-ciclomatica`, `esercizio-domanda-metriche`, `code-smell`, `refactoring`, `domanda-refactoring`, `complessita-ciclomatica`, `buone-pratiche-programmazione`, `ottimizzazione-codice` |
| `feat/lezioni-c` | testing, strumenti, rilascio e manutenzione, IdS AI-native (aree 3-5) | `graph/lezioni/<id>.json` per: `black-box-vs-white-box`, `boundary-value-analysis`, `classi-equivalenza`, `criteri-copertura`, `debugging`, `esercizio-white-box-copertura`, `git-versionamento`, `grafo-flusso-controllo`, `ispezione-codice`, `junit-5`, `maven`, `programmazione-difensiva`, `testing-livelli-tipi`, `ci-cd`, `compatibilita-licenze`, `gestione-configurazioni`, `licenze-software`, `release-post-produzione`, `tipi-manutenzione`, `versionamento-semantico`, `assistenti-ai-sviluppo`, `domanda-ids-ai-native`, `llm-agenti-ciclo-vita`, `rischi-codice-generato`, `verifica-umana-codice-ai` |

Nessun ramo modifica `graph/parts/*.json`, `meta.json`, `schema/` o `web/`; al merge rieseguire `kg.py build` (conflitti su `graph.json` si risolvono rigenerandolo). Merge in qualsiasi ordine.

## Fase 5 — 24/10/2026: QA studente su 75 lezioni (390x844, 1280x800)
- Script Playwright su tutte le 75 lezioni × 2 viewport: console pulita, mermaid visibili, codice evidenziato, passi/soluzioni, autoverifica, Precedente/Successivo = percorso, nessun overflow, apertura ≤0,35 s.
- Fix: i diagrammi mermaid nelle soluzioni nascoste (11 lezioni) si rompevano (translate NaN) → disegnati solo quando visibili.
- Fix: blocco comandi git evidenziato (bash); scroll in cima subito al cambio lezione.
- UX: "✓ Segna come studiato e vai alla prossima" (salta le già studiate), barra "Riprendi / Prossima da studiare" in home, "← Percorso" torna al percorso sulla lezione corrente, barra superiore compatta su mobile.
