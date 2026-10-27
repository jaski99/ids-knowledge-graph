# ids-kg — Knowledge graph per l'esame di Ingegneria del Software (UNIMORE)
Fonte unica: `graph/graph.json`, generato dai dati in `graph/`. Fonti e versioni: [programma](docs/SYLLABUS.md), [registro degli esami](docs/EXAM_FORMAT.md), [mappa dei nodi](docs/NODES.md). Contratti e stato: [CONTRACTS](docs/CONTRACTS.md), [STATUS](docs/STATUS.md). Il piano vincolante del round 2 è [IMPROVEMENT_PLAN.md](docs/IMPROVEMENT_PLAN.md), con scope X1–X6 e ordine di integrazione.

Le frequenze delle prove sono attribuite alla **sintesi dell'utente**, non a statistiche ufficiali. La scheda 2026/27 include una tesina e riporta pesi incoerenti: non usare le modalità storiche come se fossero quelle correnti.

## Web app (`web/`)
App statica in italiano, vanilla JS a moduli ES, nessuna build obbligatoria (Cytoscape.js + dagre da CDN).
- Avvio locale: `sh web/build.sh && cd web && python3 -m http.server 8000` → <http://localhost:8000>. Senza build carica `../graph/graph.json` se servi dalla root del repo (`python3 -m http.server` e apri `/web/`). Override: `?graph=URL`.
- Viste: grafo interattivo (colore = area, forma = tipo, archi hard pieni / soft tratteggiati), dettagli al clic, percorso in ordine topologico con spunte (localStorage), progresso per area con tempo residuo, filtri (area, tipo, priorità, testo, solo non completati), checklist di ripasso.
- Moduli: `js/core/` logica pura (topo, validate, filters, progress, store, state); `js/data.js` caricamento; `js/ui/` una vista per file; `js/main.js` composition root.
- Test: `cd web && node --test tests/*.test.js` (logica pura) e `pytest -q` (include `web/tests/test_webapp.py`: riferimenti, build, http.server, unit JS).
- Deploy: `.github/workflows/pages.yml` (su push a `main`: check + test, copia `graph.json`, pubblica `web/` su GitHub Pages; in Settings → Pages scegliere "GitHub Actions").
