# ids-kg — Knowledge graph per l'esame di Ingegneria del Software (UNIMORE)
Fonte unica: `graph/graph.json`. Vedi `docs/CONTRACTS.md`, `docs/SYLLABUS.md`, `docs/STATUS.md`.

## Web app (`web/`)
App statica in italiano, vanilla JS a moduli ES, nessuna build obbligatoria (Cytoscape.js + dagre da CDN).
- Avvio locale: `sh web/build.sh && cd web && python3 -m http.server 8000` → <http://localhost:8000>. Senza build carica `../graph/graph.json` se servi dalla root del repo (`python3 -m http.server` e apri `/web/`). Override: `?graph=URL`.
- Viste: grafo interattivo (colore = area, forma = tipo, archi hard pieni / soft tratteggiati), dettagli al clic, percorso in ordine topologico con spunte (localStorage), progresso per area con tempo residuo, filtri (area, tipo, priorità, testo, solo non completati), checklist di ripasso.
- Moduli: `js/core/` logica pura (topo, validate, filters, progress, store, state); `js/data.js` caricamento; `js/ui/` una vista per file; `js/main.js` composition root.
- Test: `cd web && node --test tests/*.test.js` (logica pura) e `pytest -q` (include `web/tests/test_webapp.py`: riferimenti, build, http.server, unit JS).
- Deploy: `.github/workflows/pages.yml` (su push a `main`: check + test, copia `graph.json`, pubblica `web/` su GitHub Pages; in Settings → Pages scegliere "GitHub Actions").
