# STATUS — round 2

Il piano vincolante è [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md); il suo §3 definisce lo scope esclusivo dei worker e il §6 l'ordine di merge. Il presente stato descrive il lavoro X1 e le attività ancora da integrare, non certifica lo stato degli altri rami.

## Base e lavoro X1

- Il grafo di partenza contiene i nodi esistenti nelle cinque aree, con lezioni v3 e archi derivati dai prerequisiti. I nodi nuovi di X2 e X3 **non** sono creati da X1.
- [SYLLABUS.md](SYLLABUS.md) separa la scheda ufficiale 2026/27 [S1], la pagina docente [S2], la trascrizione di terzi del 13/01/2017 [S6] e la sintesi dell'utente [D1]. La scheda riporta l'area AI-native come ufficiale, la tesina e pesi incoerenti; la discrepanza bibliografica resta annotata, senza cambiare le chiavi `testi`.
- [EXAM_FORMAT.md](EXAM_FORMAT.md) registra separatamente le versioni. Le priorità e la mappatura programma → nodi sono nei dati sorgente; `scripts/gen_docs.py` genera anche [NODES.md](NODES.md), compresa la sezione dei nodi non mappati.
- [CONTRACTS.md](CONTRACTS.md) documenta part con suffisso, campi della mappatura, banche ed esiti condivisi tra worker. Le frequenze sono attribuite alla sintesi dell'utente, non sono statistiche ufficiali.

## Da fare da parte degli altri worker

- **X4:** correzioni didattiche delle lezioni esistenti.
- **X2:** sei nodi di programma mancanti; **X3:** tre banche di esercizi/teoria. Nessun nuovo ID deve essere duplicato.
- **X6:** profili e persistenza del simulatore; **X5:** app, accessibilità e CI con Node e Playwright. I formati delle prove rimangono separati.
- **Integrazione:** archi fra i nuovi nodi o verso quelli esistenti, mappatura dei nove nuovi ID in `programma`, rigenerazione dei file condivisi e controlli finali. Ordine: **X1 → X4 → X2 → X3 → X6 → X5 → integrazione**.

## Controlli e limiti noti

Prima del push il piano richiede build del grafo, documenti e web, poi check, test Node e `pytest -q` con Playwright: **0 falliti e 0 saltati**, senza filtri né deroghe. I risultati effettivi e le eventuali richieste fuori scope vanno indicati nel report del worker.

Il piano §7 documenta cinque e2e già falliti sulla base precedente: tre relativi a schermate/grafo, assegnati a **X5**, e due al ripristino del simulatore, assegnati a **X6**. Anche la suite X1 con Playwright ha riportato **220 passati, 5 falliti, 0 saltati**: i medesimi cinque test. In questa esecuzione due controlli di schermata si sono fermati sul canvas e quello desktop sulla visibilità dell'indice della lezione; entrambi i test del simulatore attendono l'input dopo il reload. Node: **81 passati, 0 falliti, 0 saltati**. Il vincolo di zero fallimenti blocca il push finché i responsabili non correggono i problemi fuori scope.

La CI Pages esistente si attiva sui push a `main` e non esegue ancora la suite completa Node/Playwright; la sua correzione è di X5, quindi non si può dichiarare verde una CI di questo ramo. `scripts/check_urls.py` e i controlli diretti sulle fonti hanno incontrato le restrizioni di rete del sandbox: questo non dimostra che gli URL non esistano. Per gli e2e sono stati usati Playwright 1.63, Chromium 153 dal registro npm e un mirror locale delle versioni CDN, senza cambiare test o app; la suite è stata eseguita su una replica dei file per non scrivere screenshot fuori scope. L'installazione standard `playwright install --with-deps chromium` è stata bloccata dalle restrizioni di rete.

## Comandi

```sh
python scripts/kg.py build && python scripts/gen_docs.py && sh web/build.sh
python scripts/kg.py check && python scripts/gen_docs.py check
npm test --prefix web
pytest -q
python scripts/check_urls.py  # online, fuori dai test offline
```

I file generati `graph/graph.json`, `docs/NODES.md`, `docs/PIANO_STUDIO.md` e `docs/CHECKLIST_RIPASSO.md` sono condivisi: si rigenerano dagli script; il coordinatore risolve eventuali conflitti rigenerandoli, mai a mano.
