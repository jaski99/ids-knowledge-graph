# Architettura della web app

L'app è statica: `index.html` carica `js/main.js`, mentre i contenuti arrivano da `graph.json`, copia del grafo generato dal repository. Non assume un numero fisso di nodi o aree. I testi sulle prove storiche sono attribuiti alla **sintesi dell'utente** in `docs/DATI_PROVE_GUERRA.md`; le informazioni incerte restano da verificare.

## Build e test

```sh
python scripts/kg.py build
python scripts/gen_docs.py
npm ci --prefix web
sh web/build.sh
python scripts/kg.py check
python scripts/gen_docs.py check
npm test --prefix web
pip install -r requirements.txt
python -m playwright install --with-deps chromium
pytest -q
```

Serve Node.js 22.12 o successivo. La build copia il grafo e le versioni bloccate delle librerie da `node_modules` in `web/vendor/`, quindi genera il manifest della cache. `node_modules/`, `vendor/`, `graph.json` e il manifest generato non sono versionati. Alla prima build, se le dipendenze non ci sono, `build.sh` esegue `npm ci`; le librerie non vengono più caricate da CDN al runtime. La CI testa i rami di sessione e pubblica Pages solo da `main`.

## Strati e dipendenze

| Percorso | Ruolo |
|---|---|
| `js/core/` | logica di filtri, ricerca, padronanza, percorsi, tentativi, ripasso, backup e PWA; storage e tempo sono iniettati |
| `js/ui/` | viste e interazioni accessibili; ricevono dati, storage e callback |
| `js/data.js` | caricamento, validazione leggera e ordine topologico |
| `js/main.js` | composition root, stato, routing e aggiornamento delle viste |
| `modules/registry.js`, `modules/avvia.js` | registrazione e navigazione degli strumenti |
| `modules/ripasso/` | flashcard e scheduler SM-2 |

L'hash `#/lezione/<id>` apre una lezione; `#/percorso` ritorna al percorso. Esc chiude la lezione, lo strumento o i dettagli. Le schede si navigano con frecce, Home e Fine; `/` apre i filtri e porta alla ricerca anche su mobile. Il grafo ha zoom e pan da tastiera e un'alternativa testuale; anche la minimappa accetta le frecce.

## Apprendimento e contratti

- La spunta è una dichiarazione di studio, non una certificazione. `mastery.js` combina completati, stati SM-2 ed esiti valutati. Un richiamo corretto richiede un'autovalutazione riuscita o il massimo nel singolo esito; due ripetizioni SM-2 consecutive riuscite su una carta indicano **padronanza provvisoria**. Errori o esiti parziali prevalgono prudentemente. «Da fare ora» richiede almeno un richiamo corretto dei prerequisiti hard, non solo la spunta. La data dell'ultimo voto SM-2 non è disponibile.
- Gli esiti del simulatore entrano solo tramite `leggiEsiti(storage)` di `modules/simulatore/esiti.js`, contratto 4.2 del piano. Prima del merge di X6 non ci sono esiti da leggere; i test usano un doppio dello stesso contratto. Nessun punteggio viene dedotto da parole chiave.
- I percorsi Testing meccanico, Class Diagram, Pattern, Diagrammi dinamici e Teoria seguono l'ordine della sintesi dell'utente. Usano titoli, tipi di esercizio, priorità, ordine topologico e `programma` quando presente, senza elenchi di id; se la mappatura manca l'interfaccia lo segnala.
- Gli esercizi della banca rispettano il contratto `{tipo_esame, testo, soluzione}`. La soluzione non entra nel DOM finché non si invia un tentativo scritto. Le autovalutazioni sono esplicite; i tentativi alimentano i filtri e le carte di ripasso, senza correzione automatica.
- Il ripasso alterna nodi e aree, dando precedenza agli errori; se è impostata una data d'esame futura, anticipa le carte la cui scadenza cadrebbe dopo tale data. La data è facoltativa e non modifica gli intervalli SM-2 salvati.

## Dati e offline

I dati restano nel browser: completati, checklist, SM-2, tentativi, data d'esame, tema, ultima lezione, sessione ed esiti del simulatore. Il backup JSON versionato contiene solo le chiavi dell'app e può includere risposte personali: conservarlo privatamente. Il ripristino valida i dati prima di sovrascrivere le chiavi presenti. Il TSV Anki contiene fronte e retro delle domande, checklist ed esercizi, comprese le soluzioni.

Il service worker usa una cache versionata con impronta dei contenuti e separata per percorso di installazione. Dopo la prima visita completata, grafo, lezioni, librerie e strumenti sono disponibili offline; i collegamenti esterni non sono salvati. Gli aggiornamenti richiedono una nuova connessione. Non è prevista sincronizzazione tra dispositivi: usare il backup esplicito.

Gli screenshot in `docs/screens/` sono generati dai test Playwright; le viste X5 vengono verificate a 390×844 e 1440×900.
