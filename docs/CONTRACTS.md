# Contratti del knowledge graph IdS — round 2

Il piano vincolante è [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md). La **fonte unica di verità per la web app è `graph/graph.json`**, generato da `graph/meta.json`, `graph/parts/area-*.json` e `graph/lezioni/<id>.json` con `python scripts/kg.py build`. Gli archi non sono memorizzati separatamente: ogni `prerequisito.id → nodo` è un arco, sia hard sia soft.

## graph.json (radice)

```json
{
  "versione": 3,
  "corso": {"nome": "…", "docente": "…", "fonte_programma": "…", "nota": "…"},
  "aree": [{"id": 1, "titolo": "…"}],
  "testi": {"TSUI": "…"},
  "nota_esame": "…",
  "trappole": [],
  "programma": {"fonte": "[S1]", "fonte_frequenze": "…", "frequenze": {}, "voci": []},
  "nodi": []
}
```

Il campo `corso.docente` resta una **stringa**, per compatibilità con la web app, e distingue titolare e docente della scheda 2026/27 [S1]. `corso.fonte_programma` identifica [S1]; la pagina docente [S2] è una seconda fonte nella nota. `programma` è opzionale per la web app e non cambia lo schema dei nodi.

## Mappatura `programma` e NODES

In `graph/meta.json`, `programma.voci` è un array di voci: ciascuna ha `voce`, `area`, `cfu` e `nodi`. Ogni elemento di `nodi` è `{id, parti_esame, frequenze}`:

- `id` deve esistere nel grafo ed essere mappato a una sola voce, coerente con l'area del nodo.
- `parti_esame` è un array di valori fra `Design`, `Testing`, `Teoria`, `Tesina`; l'array vuoto rende `—` (**non trovato**, non previsione di una domanda). Le parti sono ambiti di preparazione, non una promessa che il singolo nodo compaia nella prova.
- `frequenze` è un array di chiavi della tabella `programma.frequenze`. Ogni definizione registra `tema` e, per i conteggi del piano §1.3, `prove` e `totale`; le osservazioni qualitative del §1.2 usano invece `qualitativa`. Tutte provengono dalla **sintesi dell'utente** [D1], come esplicitato in `fonte_frequenze`, non da statistiche ufficiali. Un conteggio di un tema generale non prova la frequenza di ogni suo sotto-argomento. Il registro conserva anche temi senza un nodo dedicato nella base, disponibili per la successiva integrazione senza riferimenti a ID inesistenti.
- Le voci e i CFU provengono dalla scheda 2026/27 [S1]: requisiti 2,5; progettazione 3,5; implementazione e testing 1,5; distribuzione e manutenzione 0,5; AI-native 1,0. La pagina docente [S2] elenca solo i quattro blocchi tradizionali; la quinta area è **ufficiale nel catalogo 2026/27** [S1], senza frequenza storica attribuita.
- `scripts/gen_docs.py` produce `docs/NODES.md` con id, titolo, area, voce, parte, frequenza e priorità; include anche i nodi non mappati. X1 mappa soltanto gli ID dei part senza suffisso presenti sulla base. La mappatura dei nuovi ID è compito dell'integrazione dopo X2 e X3: fino ad allora i nuovi nodi restano visibili come **non mappati**. I test richiedono la copertura dei part di base, non impediscono l'arrivo di part suffissati ancora da integrare.

Le fonti [S1], [S2], [S6] e [D1], i limiti e la distinzione dei formati sono in [SYLLABUS.md](SYLLABUS.md) e [EXAM_FORMAT.md](EXAM_FORMAT.md).

## Nodo — `schema/node.schema.json`

JSON Schema 2020-12, `additionalProperties: false`; questo round modifica solo eventuali **descrizioni**, non la struttura dello schema.

| Campo | Tipo e regole |
|---|---|
| `id` | Stringa kebab-case, `^[a-z0-9]+(-[a-z0-9]+)*$`, massimo 64 caratteri, unica e mai rinominata dopo il merge. |
| `title`, `area`, `tipo` | Titolo in italiano; area 1–5; `concetto`, `abilita` oppure `tipo_esercizio`. |
| `sapere`, `saper_fare` | Conoscenza essenziale e almeno un criterio osservabile. |
| `prerequisiti` | `[{id, forza: hard\|soft, motivo}]`; id esistenti, niente self-loop né cicli considerando archi hard **e** soft. |
| `esercizi` | `[{tipo_esame, testo, soluzione}]`; almeno un esercizio svolto per `abilita` o `tipo_esercizio`. Contratto delle banche sotto. |
| `checklist_ripasso`, `tempo_studio_min` | Checklist opzionale; tempo stimato 5–600 minuti. |
| `priorita` | `{livello: alta\|media\|bassa, motivazione}`; citare fonte e distinguere il programma ufficiale dalla sintesi dell'utente. |
| `risorse` | Almeno una risorsa `{titolo, url, verificato: true}`; solo URL reali controllati con `scripts/check_urls.py`. |
| `riferimenti_testo` | `[{libro, capitolo_o_sezione?}]`; `libro` è una chiave di `testi`, capitolo solo se verificato. |
| `lezione` | Oggetto v3 in `graph/lezioni/<id>.json`, mai inline nei part; obbligatorio per completezza. |

### Lezione v3 — autosufficiente

`intuizione` (2–4 frasi, almeno 80 caratteri); `spiegazione` markdown autosufficiente (almeno 1500 caratteri, con sezioni e almeno un blocco Java o Mermaid valido); `analogia` con limite; almeno due `collegamenti_prior` con eventuali id esistenti; `esempi_svolti` con problema, almeno due passi, soluzione e motivazione (almeno due esempi per abilità/tipo_esercizio, uno per concetto); almeno due `errori_comuni`, tre `domande_autoverifica` con risposta e `riepilogo` fino a cinque righe. Le risorse sono approfondimenti facoltativi, non sostituiscono la spiegazione.

Rispettare [DIDATTICA.md](DIDATTICA.md): intuizione prima dei dettagli, esempi progressivi, Java compilabile, distinzione Mermaid/UML, richiamo attivo. Non attribuire fatti, preferenze o punteggi non documentati al docente; citare i dati delle prove come **sintesi dell'utente** e marcare «probabile»/mancante **[da verificare]**.

## Testi e provenienza

La scheda 2026/27 [S1] elenca Tsui, *Software Engineering*, 3ª ed.; *Head First Design Patterns* (2014); GoF (1994); Fowler, *UML Distilled*; e Seidl et al., *UML @ Classroom* (2015). I riferimenti storici del grafo sotto divergono su Tsui/HFDP e includono Miles: non è stato verificato se siano bibliografie di una coorte precedente. Non sostituire o rinominare le chiavi; chiedere conferma [S1].

| Chiave | Riferimento conservato nel grafo |
|---|---|
| `TSUI` | Tsui, Karam, Bernal — *Essentials of Software Engineering*, 5ª ed., Jones & Bartlett, 2022. |
| `HFDP` | Freeman, Robson, Bates, Sierra — *Head First Design Patterns*, 2ª ed., O'Reilly, 2020. |
| `GOF` | Gamma, Helm, Johnson, Vlissides — *Design Patterns*, 1994. |
| `FOWLER` | Fowler — *UML Distilled*; edizione non specificata. |
| `MILES` | Miles, Hamilton — *Learning UML 2.0*, 2006; non elencato nella scheda [S1] consultata. |
| `UMLCLASS` | Seidl, Scholz, Huemer, Kappel — *UML @ Classroom*, 2015. |
| `MARTIN` | R. C. Martin — *Clean Architecture*, 2017: riferimento **extra**, non attribuito ai testi del docente. |

| Area | Testi e sezioni TSUI verificate sull'indice usato dal grafo |
|---|---|
| 1 | TSUI, UMLCLASS, FOWLER, MILES; TSUI 1.1.2–1.1.4, cap. 6 e App. B. |
| 2 | TSUI, GOF, HFDP, FOWLER, UMLCLASS, MILES; TSUI cap. 7–8. `MARTIN` è extra per coesione dei componenti. |
| 3 | TSUI, eventualmente HFDP/GOF per pattern; TSUI 1.4.3, cap. 9–10. |
| 4 | TSUI cap. 11–12; nessuna sezione dedicata alle licenze trovata nell'indice. |
| 5 | Nessuno dei testi storici copre l'area; usare risorse verificate. |

Per HFDP, GOF, FOWLER, MILES e UMLCLASS non sono stati verificati capitoli specifici: citare solo il libro.

## Part e worker

- Ogni part è un array JSON di nodi con `area == N`. Nomi ammessi: `area-N.json` e `area-N-<suffisso>.json`, con `N` fra 1 e 5 e suffisso alfanumerico minuscolo, per esempio `area-2-r2.json` o `area-3-banche.json`.
- Le lezioni stanno in `graph/lezioni/<id>.json`. I prerequisiti di un nuovo nodo puntano a ID già sulla base o dello stesso worker, mai a un futuro nodo di un altro worker; niente duplicati. Gli archi trasversali ai nuovi nodi e la loro mappatura sono aggiunti dall'integrazione.
- Scope esclusivi: **X1** programma, priorità e NODES; **X2** nuovi nodi di programma; **X3** banche; **X4** lezioni esistenti; **X5** web app e CI; **X6** simulatore. File e vincoli esatti sono nel [piano §3](IMPROVEMENT_PLAN.md).
- Ordine di merge del coordinatore: **X1 → X4 → X2 → X3 → X6 → X5 → integrazione**. I worker usano solo il proprio ramo di sessione e non aprono né fondono PR.
- `graph/graph.json`, `docs/NODES.md`, `docs/PIANO_STUDIO.md` e `docs/CHECKLIST_RIPASSO.md` sono file generati condivisi: si rigenerano con gli script, mai a mano. `web/graph.json` è una copia non versionata.

## 4.1 Contratto delle banche — X3 → X6/X5

Il formato degli esercizi resta `{tipo_esame, testo, soluzione}`. `tipo_esame` inizia **esattamente** con uno dei seguenti prefissi:

- `Parte 1 Design 1.4: <Pattern>`
- `Parte 2 Testing: classi di equivalenza e boundary`
- `Parte 3 Teoria: <tema>`

Termina con ` (<fonte>)`, ad esempio ` (prova 2025-11, sintesi dell'utente)`. I dati incerti contengono **`[da verificare]` nel `testo`**. X6 riconosce gli slot tramite **id del nodo + prefisso**; prima dell'integrazione di X3 usa nei test una fixture dello stesso formato. Punti e durate sono solo quelli documentati nel piano §1.2, senza interpolazioni.

## 4.2 Contratto degli esiti — X6 → X5

Chiave `localStorage`: **`ids-kg:esiti-simulatore:v1`**. Valore: array JSON di massimo 500 voci, scartando le più vecchie:

```json
{"slot_id":"…", "nodo_id":"…", "profilo":"…", "modalita":"allenamento", "punti":null, "punti_max":null, "ts":"2026-10-27T12:00:00Z"}
```

`modalita` è `allenamento` o `simulazione`; `punti` e `punti_max` sono numeri o `null`; `ts` è ISO-8601. X6 esporta `registraEsito(storage, esito)` e `leggiEsiti(storage)` da `web/modules/simulatore/esiti.js`; X5 importa **solo** `leggiEsiti` e usa un doppio conforme nei propri test.

Non rinominare le chiavi preesistenti: il piano nomina `ids-kg:completati:v1`, `ids-kg:ripasso:v1`, `ids-kg:simulatore:v1`, `ids-kg:tema:v1` e `ids-kg:ultima-lezione:v1`; lo store flashcard attuale usa inoltre **`ids.ripasso.v1`**. Non fonderle o migrare dati implicitamente; eventuali differenze sono da verificare nell'integrazione.

## Validazione

I test verificano schema, risorse, ID, prerequisiti, DAG, lezioni, nomi/aree dei part, riferimenti ai testi, mappatura e aggiornamento dei generati. Prima del push eseguire:

```sh
python scripts/kg.py build && python scripts/gen_docs.py && sh web/build.sh
python scripts/kg.py check && python scripts/gen_docs.py check
npm test --prefix web
pytest -q
python scripts/check_urls.py  # online: HEAD, fallback GET; controlla le risorse dei nodi
```

Playwright e Chromium devono essere installati; la suite completa richiede **0 falliti e 0 saltati**, senza filtri, skip/xfail aggiunti o deroghe. Gli URL non raggiungibili per restrizioni di rete non diventano automaticamente invalidi né verificati. La CI di ramo e i limiti effettivi vanno riportati; correzioni fuori scope spettano al worker competente.
