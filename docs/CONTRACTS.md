# Contratti del knowledge graph IdS

**Fonte unica di verità: `graph/graph.json`** (schema v2), **generato** da `graph/meta.json` + `graph/parts/area-N.json` con `python scripts/kg.py build`. Niente note Markdown. Gli archi NON sono memorizzati: si derivano da `prerequisiti` (arco `prerequisito.id → nodo`, sia hard sia soft).

## graph.json (radice)
```json
{ "versione": 2, "corso": {...}, "aree": [{"id":1,"titolo":"..."}, ... 5 aree],
  "testi": {"TSUI": "...", ...}, "nota_esame": "...",
  "nodi": [ <nodo>, ... ordinati per (area, id) ] }
```

## Nodo — `schema/node.schema.json` (JSON Schema 2020-12, `additionalProperties: false`)
| campo | tipo | regole |
|---|---|---|
| `id` | string | kebab-case `^[a-z0-9]+(-[a-z0-9]+)*$`, ≤64, unico, mai rinominato dopo il merge |
| `title` | string | italiano |
| `area` | int 1..5 | vedi aree |
| `tipo` | `concetto` \| `abilita` \| `tipo_esercizio` | concetto = sapere; abilita = procedura; tipo_esercizio = famiglia di esercizi d'esame |
| `sapere` | string | 1-4 frasi, cosa si deve conoscere |
| `saper_fare` | string[] ≥1 | criteri osservabili (verbo d'azione), ~2-4 |
| `prerequisiti` | [{id, forza: hard\|soft, motivo}] | id esistenti, niente self-loop; **nessun ciclo considerando archi hard+soft**. hard = indispensabile; soft = utile |
| `esercizi` | [{tipo_esame, testo, soluzione}] | mini-esempi **svolti**: `tipo_esame` es. "scritto: disegna use case"; `soluzione` breve, passo-passo. **minItems 1** se `tipo` è `abilita` o `tipo_esercizio` |
| `checklist_ripasso` | string[] (opzionale) | punti flash per il ripasso finale |
| `tempo_studio_min` | int 5..600 | stima |
| `priorita` | {livello: alta\|media\|bassa, motivazione} | motivazione legata a programma + testi; **formato d'esame sconosciuto** finché non confermato (vedi `nota_esame`) |
| `risorse` | [{titolo, url, verificato: true}] ≥1 | solo URL reali controllati con `scripts/check_urls.py` |
| `riferimenti_testo` | [{libro, capitolo_o_sezione?}] | `libro` = chiave in `testi`; capitolo SOLO se verificato su indice reale |

## Aree (programma ufficiale + area 5 aggiunta)
1. Specifica dei requisiti — obiettivi, input, generazione specifiche, casi d'uso UML
2. Progettazione — alto livello/dettaglio, stili architetturali, decomposizione funzionale, ORM e problematiche (JPA/Hibernate), qualità, metriche, coesione/accoppiamento, UML, design pattern
3. Implementazione e testing — best practice, refactoring, testing e ispezione, path analysis, boundary value analysis, JUnit, programmazione difensiva, Maven, Git
4. Distribuzione e manutenzione — gestione configurazioni, post-produzione, licenze
5. IdS AI-native — LLM e agenti nel ciclo di vita, opportunità/limiti/rischi del codice generato, verifica umana, assistenti AI per generazione/comprensione/modifica/refactoring/testing (*non presente nel programma ufficiale pubblicato*)

## Testi (chiavi `testi`) e mappa aree → testi
| chiave | testo |
|---|---|
| TSUI | Tsui, Karam, Bernal — Essentials of Software Engineering, 5th ed., Jones & Bartlett, 2022 |
| HFDP | Freeman, Robson, Bates, Sierra — Head First Design Patterns, 2nd ed., O'Reilly, 2020 |
| GOF | Gamma, Helm, Johnson, Vlissides — Design Patterns, Addison-Wesley, 1994 |
| FOWLER | Fowler — UML Distilled (citare solo il titolo, edizione non specificata) |
| MILES | Miles, Hamilton — Learning UML 2.0, O'Reilly, 2006 |
| UMLCLASS | Seidl, Scholz, Huemer, Kappel — UML @ Classroom, Springer, 2015 |
| MARTIN | R.C. Martin — Clean Architecture, Prentice Hall, 2017 (**riferimento extra, NON tra i testi del prof**; usato solo per REP/CCP/CRP) |

| area | testi | sezioni TSUI verificate (indice O'Reilly) |
|---|---|---|
| 1 | TSUI, UMLCLASS, FOWLER, MILES | 1.1.2-1.1.4; cap. 6 (6.3.2 use case; 6.5 specifica); App. B (SRS) |
| 2 | TSUI, GOF, HFDP, FOWLER, UMLCLASS, MILES | cap. 7 (7.2 architettura, 7.2.3 stili/pattern, 7.3.1 decomposizione funzionale, 7.3.2 DB relazionali, 7.3.4 OOD e UML); cap. 8 (8.2 metriche, 8.3.1 coesione, 8.3.2 accoppiamento, 8.4 metriche OO) |
| 3 | TSUI (+ HFDP/GOF per refactoring verso pattern) | 1.4.3 JUnit; cap. 9 (9.3.2 asserzioni e programmazione difensiva, 9.3.4 refactoring); cap. 10 (10.3.2 BVA, 10.3.3 path analysis, 10.3.5 unit test/TDD, 10.5 ispezioni) |
| 4 | TSUI | cap. 11 (configuration management, build); cap. 12 (manutenzione, change control). Licenze: nessuna sezione dedicata trovata nell'indice |
| 5 | nessuno dei testi copre l'area | usare solo risorse web verificate |

Per HFDP, GOF, FOWLER, MILES, UMLCLASS i capitoli NON sono stati verificati: citare solo il libro.

## Convenzioni
- id: `kebab-case` italiano, senza prefisso area (l'area è un campo). Pattern: `design-pattern-observer`, `uml-diagramma-classi`, `esercizio-bva-intervalli` (per `tipo_esercizio`).
- Lingua contenuti: italiano; termini tecnici inglesi ammessi.
- Prerequisiti cross-area ammessi (es. testing → requisiti) ma solo verso id esistenti su `main` o nello stesso ramo.

## Regole per i rami contenuti
- Ogni ramo contenuti scrive **SOLO** in `graph/parts/area-N.json` delle proprie aree (`feat/contenuti-a`: area-1, area-2; `feat/contenuti-b`: area-3, area-4, area-5).
- Ogni file part è un **array JSON di nodi**; ogni nodo ha `area == N` del file.
- Vietato modificare a mano `graph/graph.json`, `graph/meta.json`, `schema/` o i part di altre aree: modifiche a contratti/meta solo su `main`.
- Prima di ogni commit: `python scripts/kg.py build` (rigenera `graph.json`) e `pytest -q` (verde). `python scripts/kg.py check` fallisce se `graph.json` non è aggiornato.
- Prerequisiti verso altre aree: solo id già presenti su `main`. In caso di conflitto su `graph.json` al merge: prendere qualsiasi versione e rieseguire `kg.py build`.
- I seed esistenti stanno nei part; si possono arricchire, non rinominare.

## Regole/validazione
- `pytest` (offline): schema valido, ogni nodo conforme, 5 aree dichiarate, id unici, prerequisiti esistenti, niente self-loop, **niente cicli (hard+soft)**, ordine topologico generabile e coerente, ≥1 risorsa per nodo, `riferimenti_testo.libro` dichiarato, abilità/tipo_esercizio con ≥1 esercizio svolto, part nominati `area-N.json` con area coerente, `graph.json` uguale all'output di `kg.py build`.
- `python scripts/check_urls.py` (online, fuori dai test): HEAD→GET, exit 1 su 4xx/5xx/errori.
- `python scripts/topo.py`: ordine di studio (Kahn deterministico per area, id) con tempo totale.
