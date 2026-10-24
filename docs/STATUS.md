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
