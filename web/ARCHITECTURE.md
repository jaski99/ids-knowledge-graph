# Architettura della web app

App statica, senza bundler. `index.html` carica `js/main.js` come modulo ES. I testi visibili sono in italiano. I contenuti non stanno qui: arrivano da `graph.json` (copia di `graph/graph.json` prodotta da `build.sh`).

## Strati

| cartella | ruolo |
|---|---|
| `js/core/` | funzioni pure: ordine topologico, filtri, ricerca, percorso dei prerequisiti, progresso, tema, stato, storage |
| `js/ui/` | viste. Ricevono il contenitore, il grafo e le callback. Non leggono `localStorage` e non si chiamano tra loro |
| `js/data.js` | fetch e validazione leggera |
| `js/main.js` | composition root: unico posto che collega dati, stato e viste |
| `modules/registry.js` | viste di navigazione aggiunte da altri moduli |

Non ci sono variabili globali di applicazione. `navigation` è l'istanza del registro esportata dal modulo, così un altro file può registrarsi senza ricevere l'oggetto da `main`. Lo stato di studio e il tema passano da storage iniettato (`localStorage` in produzione, un doppio in memoria nei test).

## Flusso

1. `loadGraph` prova gli URL del meta `kg-graph-url` (o `?graph=`).
2. `createState` tiene filtri, nodi completati e nodo selezionato. Le viste si aggiornano in `subscribe`.
3. L'hash `#/lezione/<id>` apre il lettore a tutta pagina. `#/percorso` torna al percorso sulla lezione corrente. Esc chiude la lezione o il pannello dettagli.

## Registro delle viste

Gli id `grafo`, `percorso` e `ripasso` sono già nel markup: registrarli di nuovo non crea una seconda scheda. Un id nuovo diventa una scheda in più, anche se la registrazione arriva dopo l'avvio.

```js
import { navigation } from '../modules/registry.js';

navigation.register({
  id: 'simulatore',          // kebab-case, univoco
  title: 'Simulatore',       // etichetta visibile
  mount(panel, ctx) {
    // ctx.graph, ctx.getState(), ctx.subscribe(fn), ctx.openLesson(id),
    // ctx.select(id), ctx.toggleDone(id, on), ctx.h, ctx.clear
    return {
      update(vm) {}, // vm.visible (Set), vm.done (Set), vm.selected (id | null)
      resize() {},
    };
  },
});
```

Perché il modulo venga eseguito va importato da `js/main.js` (basta l'import, la registrazione è un effetto del modulo). `simulatore*` e `ripasso*` non stanno in questo ramo: li aggiunge un altro intervento, usando questo registro.

## Lettore

`lesson-view.js` compone la pagina. Il markdown passa da `markdown.js` (marked + DOMPurify + highlight.js). I blocchi di codice ricevono lingua e copia da `code-block.js`. I diagrammi mermaid stanno in una cornice (`diagram.js`) con zoom interno; al cambio tema il sorgente, tenuto in `data-src`, viene ridisegnato. L'indice (`toc.js`) non usa l'hash: un `#sezione` chiuderebbe la lezione, perché l'hash è il router.

## Grafo

Cytoscape resta dietro `graph-view.js`. Colore = area, dimensione = priorità, clic = chiusura dei prerequisiti (`prereq-path.js`). La minimappa (`minimap.js`) riceve l'istanza Cytoscape dal composition root: non la cerca sul `window`.

## Tema

`data-theme` su `<html>`. Uno script in testa legge `ids-kg:tema:v1` prima del CSS, la stessa chiave di `THEME_STORAGE_KEY`. Senza scelta salvata si segue `prefers-color-scheme`. I token in `css/style.css` sono controllati da `tests/theme.test.js` (contrasto AA).

## Test

```bash
cd web && node --test tests/
pytest -q
# e2e, se Playwright è installato (serve rete per i CDN):
python -m pytest web/tests/test_e2e_lesson.py web/tests/test_e2e_screens.py -q
```

Gli screenshot in `docs/screens/` sono prodotti da `test_e2e_screens.py` (390×844 e 1440×900: home, grafo, lezione, percorso).
