# Piano di lavoro Arena (divide et impera)

Repo: https://github.com/jaski99/ids-knowledge-graph  (main = codice integrato, Pages da main)
Regola: i worker NON modificano graph/, scripts/, schema/ (contenuti e dati sono congelati). Solo web/ e test.

## Contratti condivisi
- Dati: `web/` legge `graph/graph.json` (schema in schema/node.schema.json, docs/CONTRACTS.md). Nessun cambio di formato.
- Punto di aggancio viste: `web/modules/registry.js` con `register({id, titolo, render(container, ctx)})` e `getAll()`. Lo crea il worker A al primo commit; il worker B lo usa (se non c'e' ancora, lo crea identico e minimo).
- Stato utente: solo localStorage, chiavi con prefisso `ids.` (`ids.progress`, `ids.ripasso`, `ids.simulatore`).
- Test: `pytest` (root), `node --test web/tests`, Playwright e2e se presenti. Tutti verdi prima del push.

## Worker
| id | ramo | scope (solo questi file) |
|---|---|---|
| A | feat/ux-lettore | web/ tranne web/modules/simulatore*, web/modules/ripasso*: lettore lezioni, grafo, ricerca, filtri, tema, accessibilita', mobile, web/ARCHITECTURE.md |
| B | feat/simulatore-ripasso | web/modules/simulatore/**, web/modules/ripasso/**, relativi test; aggancio solo via registry.js |
| Main | main | integra i rami, lancia tutti i test, deploy Pages, report |

## Qualita' richiesta
SOLID, moduli piccoli e coesi, basso accoppiamento (dipendenze iniettate, niente globali), aperto/chiuso, test per ogni modulo, nomi coerenti, niente codice morto. Testi visibili in italiano. Mai inventare contenuti o URL.

## Consegna di ogni worker
Codice + test + screenshot mobile 390x844 e desktop 1440x900 in docs/screens/, push sul proprio ramo, riepilogo breve (cosa fatto, come testare, limiti).
