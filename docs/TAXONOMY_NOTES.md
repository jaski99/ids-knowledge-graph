# Note di reverse engineering: withmarbleapp/os-taxonomy

Fonte: https://github.com/withmarbleapp/os-taxonomy (commit `3637235924f85df829bb9512a8180b0aa0f2d5cf`, clonato il 24/10/2026).
Licenze: dati ODbL, contenuti CC BY-SA 4.0. **Non copiamo dati**, solo idee di struttura.

## Struttura
- `data/topics.json` → `{version, topicCount, topics:[...]}`: i **nodi** (1.842 "micro-topic").
- `data/dependencies.json` → **archi** separati dai nodi: `{topicId, prerequisiteId, strength: hard|soft, reason}` (3.919 archi, DAG).
- `data/curriculum-standards.json`, `clusters.json`, `teaching-research.json`: allineamento a standard, sintesi per dominio, ricerca didattica (copertura parziale dichiarata).
- `schema/*.schema.json`: JSON Schema per ogni file; `manifest.json` con conteggi e checksum SHA-256.

## Nodo (micro-topic)
Campi: `id` opaco (`mt_...`), `type` (CONCEPTUAL / PROCEDURAL / REPRESENTATIONAL / LANGUAGE / META), `subject`, `domain`, `name`,
`description` (tipicamente 10-30 parole), `ageRangeStart/End`, `centrality`, `evidence` (≈3 criteri osservabili di padronanza), `assessmentPrompt`, `standards` (link a fonti).

## Osservazioni utili
- **Granularità**: un nodo = una singola idea insegnabile e verificabile con ~3 evidenze; ≈2,1 prerequisiti medi per nodo (max 9).
- **Conoscenze vs abilità**: separate tramite `type` (CONCEPTUAL = sapere, PROCEDURAL = saper fare) e rese operative da `evidence` (verbi osservabili: "write", "predict", "explain").
- **Prerequisiti**: arco con `strength` (hard 59% / soft 41%) e `reason` di una riga; grafo garantito aciclico.
- **Tracciabilità**: ogni nodo collegato agli standard da cui è derivato; i report dichiarano esplicitamente cosa NON è coperto.
- **Riuso**: "riusa un topic se valuta lo stesso concetto"; niente duplicati per contesto diverso.

## Cosa adottiamo (vedi CONTRACTS.md)
| os-taxonomy | ids-kg |
|---|---|
| `type` CONCEPTUAL/PROCEDURAL | `tipo` concetto / abilita (+ `tipo_esercizio`) |
| `description` | `sapere` |
| `evidence` | `saper_fare` (criteri osservabili) |
| `dependencies.json` | `prerequisiti` inline; archi derivati |
| `standards` | `risorse` (URL verificati) + `riferimenti_testo` |
| `domain` | `area` 1..5 del programma |
| DAG + JSON Schema + validazione | test pytest (schema, id, prerequisiti, aciclicità, topo) |

Differenze volute: prerequisiti inline (un solo file sorgente, più facile da editare a rami); niente `strength`/`reason` per ora (possibile estensione v2); id leggibili kebab-case invece che opachi.

## Ricerca didattica (`data/teaching-research.json`, ri-studiato in Fase 4)
Record per topic (copertura parziale, ~1.049/1.842): `pedagogy{summary` (markdown ~2.000 car., la "lezione" vera e propria), `bestPractices[5]`, `keyRepresentations[4]`, `commonMisconceptions[5]}`, `learn`/`assess` (risorse), `sources`, `confidence`, `provenance`. Separa il "cosa" (topic + evidence) dal "come si insegna".

Adottiamo l'idea, non i dati, nell'oggetto `lezione` (v3): summary → `spiegazione` + `intuizione`; keyRepresentations → diagrammi mermaid e codice; commonMisconceptions → `errori_comuni`; assess → `domande_autoverifica`; in più `analogia`, `collegamenti_prior` ed `esempi_svolti` passo-passo. Differenza voluta: la lezione deve bastare da sola (niente rimando alle fonti per capire).
