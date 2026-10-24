# STATUS — 24/10/2026 (Fase 1)

## Fatto
- Reverse engineering di os-taxonomy → `docs/TAXONOMY_NOTES.md`.
- Contratti e schema: `docs/CONTRACTS.md`, `schema/node.schema.json`.
- Programma ufficiale (sito docente) → `docs/SYLLABUS.md`; testi di riferimento mappati sulle aree.
- `graph/graph.json` con 5 nodi seed (aree 1-3), tutti con risorse verificate (HTTP 200).
- `scripts/kg.py` (libreria), `scripts/topo.py`, `scripts/check_urls.py`; 14 test pytest verdi.

## Mancante / aperto
- Formato d'esame ufficiale non trovato (vedi SYLLABUS.md).
- Aree 4 e 5 senza nodi.

## Rami proposti (indipendenti, ognuno tocca solo i propri nodi)
| ramo | contenuto | note |
|---|---|---|
| `feat/contenuti-a` | aree 1-2: requisiti, casi d'uso, SRS, architettura e stili, decomposizione funzionale, ORM/JPA/Hibernate, qualità e metriche, coesione/accoppiamento, UML (classi, sequenza, attività, stati), design pattern GoF principali | riusa seed `requisiti-obiettivi`, `uml-casi-uso`, `coesione-accoppiamento`, `design-pattern-introduzione` |
| `feat/contenuti-b` | aree 3-5: best practice, refactoring, testing/ispezione, path analysis, BVA, JUnit, programmazione difensiva, Maven, Git, configuration management, post-produzione, licenze, IdS AI-native | può dipendere da id di area 1-2 già su main |
| `feat/webapp` | sito statico in italiano che legge `graph/graph.json` (grafo, filtro per area/tipo/priorità, ordine topologico, spunta esercizi in localStorage) | non modifica `graph.json`; solo `web/` |

Ordine di merge suggerito: contenuti-a → contenuti-b → webapp (la webapp può partire subito sui seed).

## Comandi
```
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/pytest -q
cd scripts && ../.venv/bin/python topo.py && ../.venv/bin/python check_urls.py
```
